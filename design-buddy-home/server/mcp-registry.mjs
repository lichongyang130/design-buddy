/**
 * MCP 注册表：服务配置持久化 + token 加密 + 审计日志环
 * 零外部依赖：用 Node 内置 crypto。
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'node:crypto'
import path from 'node:path'

const DATA_DIR = path.resolve(import.meta.dirname ?? '.', '..', '.data')
const SERVERS_FILE = path.join(DATA_DIR, 'mcp-servers.json')
const KEY_FILE = path.join(DATA_DIR, 'key')
const LOG_RING_SIZE = 50

let cachedKey = null

/** 密钥派生：优先环境变量 MCP_SECRET，否则从 .data/key 文件读取（单机适用） */
export async function getKey() {
  if (cachedKey) return cachedKey
  const secret = process.env.MCP_SECRET
  if (secret) {
    cachedKey = scryptSync(secret, 'design-buddy-mcp', 32)
    return cachedKey
  }
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true, mode: 0o700 })
  if (!existsSync(KEY_FILE)) {
    const k = randomBytes(32)
    await writeFile(KEY_FILE, k, { mode: 0o600 })
    cachedKey = k
    return k
  }
  const buf = await readFile(KEY_FILE)
  if (buf.length !== 32) throw new Error('密钥文件长度异常，请删除 .data/key 重试')
  cachedKey = buf
  return buf
}

export function encrypt(plaintext, key) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return { iv: iv.toString('hex'), tag: tag.toString('hex'), ct: ct.toString('hex') }
}

export function decrypt(sealed, key) {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(sealed.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(sealed.tag, 'hex'))
  const pt = Buffer.concat([decipher.update(Buffer.from(sealed.ct, 'hex')), decipher.final()])
  return pt.toString('utf-8')
}

export function fingerprint(token) {
  return createHash('sha256').update(token).digest('hex').slice(0, 12)
}

export function maskToken(token) {
  if (!token) return '—'
  if (token.length <= 6) return '•'.repeat(token.length)
  return `${token.slice(0, 4)}…${token.slice(-4)}`
}

/* ---------- 服务存储 ---------- */

let memoryCache = null

export async function loadServers() {
  if (memoryCache) return memoryCache
  try {
    await access(SERVERS_FILE)
    const raw = JSON.parse(await readFile(SERVERS_FILE, 'utf-8'))
    memoryCache = Array.isArray(raw) ? raw : []
  } catch {
    memoryCache = []
  }
  return memoryCache
}

export async function saveServers(list) {
  memoryCache = list
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true, mode: 0o700 })
  await writeFile(SERVERS_FILE, JSON.stringify(list, null, 2), { mode: 0o600 })
}

/** 添加服务：先握手、拿到工具清单再落盘。失败不落。 */
export async function addServer({ label, url, auth, allowPrivate, timeoutMs, handshakeResult }) {
  const servers = await loadServers()
  const id = `srv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const key = await getKey()
  const record = {
    id,
    label,
    url,
    allowPrivate: !!allowPrivate,
    createdAt: Date.now(),
    protocol: { mode: handshakeResult.mode, version: handshakeResult.version },
    transport: handshakeResult.transport,
    serverInfo: handshakeResult.serverInfo,
    capabilities: handshakeResult.capabilities,
    instructions: handshakeResult.instructions,
    tools: handshakeResult.tools,
    toolCount: handshakeResult.tools.length,
    lastHandshake: { at: Date.now(), ms: handshakeResult.ms, requestId: handshakeResult.requestId, ok: true },
  }
  if (auth?.mode && auth.token) {
    record.auth = {
      mode: auth.mode,
      headerName: auth.headerName ?? null,
      fingerprint: fingerprint(auth.token),
      masked: maskToken(auth.token),
      sealed: encrypt(auth.token, key),
    }
  } else {
    record.auth = { mode: 'none' }
  }
  record.logs = []
  servers.push(record)
  await saveServers(servers)
  return record
}

export async function removeServer(id) {
  const servers = await loadServers()
  const idx = servers.findIndex((s) => s.id === id)
  if (idx === -1) return null
  const [removed] = servers.splice(idx, 1)
  await saveServers(servers)
  return removed
}

export async function getServer(id) {
  const servers = await loadServers()
  return servers.find((s) => s.id === id) ?? null
}

export async function listServersPublic() {
  const servers = await loadServers()
  return servers.map(publicView)
}

/** 公开视图：永远不含 token 原文 */
export function publicView(server) {
  return {
    id: server.id,
    label: server.label,
    url: server.url,
    allowPrivate: server.allowPrivate,
    createdAt: server.createdAt,
    protocol: server.protocol,
    transport: server.transport,
    serverInfo: server.serverInfo,
    capabilities: server.capabilities,
    instructions: server.instructions,
    tools: server.tools,
    toolCount: server.toolCount,
    auth: server.auth ? { mode: server.auth.mode, headerName: server.auth.headerName, fingerprint: server.auth.fingerprint, masked: server.auth.masked } : { mode: 'none' },
    lastHandshake: server.lastHandshake,
  }
}

/** 还原明文 token（仅服务端调用路径） */
export async function decryptToken(server) {
  if (!server?.auth?.sealed) return null
  const key = await getKey()
  return decrypt(server.auth.sealed, key)
}

/** 更新握手结果 */
export async function updateHandshake(id, handshakeResult) {
  const servers = await loadServers()
  const s = servers.find((x) => x.id === id)
  if (!s) return null
  s.protocol = { mode: handshakeResult.mode, version: handshakeResult.version }
  s.serverInfo = handshakeResult.serverInfo
  s.capabilities = handshakeResult.capabilities
  s.instructions = handshakeResult.instructions
  s.tools = handshakeResult.tools
  s.toolCount = handshakeResult.tools.length
  s.lastHandshake = { at: Date.now(), ms: handshakeResult.ms, requestId: handshakeResult.requestId, ok: true }
  await saveServers(servers)
  return s
}

/** 更新凭据（换 token / 换模式） */
export async function updateAuth(id, auth) {
  const servers = await loadServers()
  const s = servers.find((x) => x.id === id)
  if (!s) return null
  const key = await getKey()
  if (auth?.mode && auth.token) {
    s.auth = {
      mode: auth.mode,
      headerName: auth.headerName ?? null,
      fingerprint: fingerprint(auth.token),
      masked: maskToken(auth.token),
      sealed: encrypt(auth.token, key),
    }
  } else {
    s.auth = { mode: 'none' }
  }
  await saveServers(servers)
  return s
}

/* ---------- 审计日志（环缓冲） ---------- */

export async function pushLog(id, entry) {
  const servers = await loadServers()
  const s = servers.find((x) => x.id === id)
  if (!s) return
  s.logs = s.logs ?? []
  s.logs.push({
    at: Date.now(),
    action: entry.action,
    ok: entry.ok,
    latency: entry.latency ?? null,
    bytes: entry.bytes ?? null,
    requestId: entry.requestId ?? null,
    detail: entry.detail ?? '',
    status: entry.status ?? null,
  })
  if (s.logs.length > LOG_RING_SIZE) s.logs = s.logs.slice(-LOG_RING_SIZE)
  await saveServers(servers)
}

export async function getLogs(id) {
  const servers = await loadServers()
  const s = servers.find((x) => x.id === id)
  return s?.logs ?? []
}
