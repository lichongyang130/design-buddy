/**
 * MCP 客户端：实现 2026-07-28 无状态与旧版会话式 Streamable HTTP 两种协议。
 * 所有协议走同一个入口 mcpRequest()，内部按协商结果选路径。
 * 零依赖：用 Node 内置 fetch + crypto。
 */

import { lookup as dnsLookup } from 'node:dns/promises'
import { URL } from 'node:url'

export const MCP_LATEST_VERSION = '2026-07-28'
export const MCP_VERSIONS = ['2026-07-28', '2025-11-25', '2025-06-18', '2025-03-26']

/** SSRF 防护：默认拒绝回环 / 私网 / link-local / metadata，勾选后才放行 */
const PRIVATE_NETS = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
  /^::1$/, /^fe80:/i, /^169\.254\./, /^0\./, /^fc/i, /^fd/i, /^ff/i,
]

export async function assertPublicHost(url, { allowPrivate = false } = {}) {
  if (!/^https?:/i.test(url)) throw new McpError('MCP_BAD_SCHEME', `只接受 http(s)，但收到 ${url.split(':')[0]}`)
  if (/^http:/i.test(url) && !allowPrivate) throw new McpError('MCP_BAD_SCHEME', `明文 http 仅在内网信任模式下可用`)
  const host = new URL(url).hostname
  // IPv6 字面量剥方括号；普通域名交给 DNS
  const candidates = host.startsWith('[') && host.endsWith(']')
    ? [host.slice(1, -1)]
    : (() => {
        try {
          // 同步尝试：如果是 IP 地址，直接返回
          if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return [host]
          // 否则需要 DNS 解析
          return null // 标记需要异步解析
        } catch { return [] }
      })()
  
  // 如果不是 IP 地址，需要异步 DNS 解析
  if (!candidates) {
    let resolved
    try {
      resolved = await dnsLookup(host, { all: true })
    } catch (err) {
      throw new McpError('MCP_DNS', `域名解析失败：${host}`, { cause: err })
    }
    candidates = resolved.map((r) => r.address)
  }
  
  for (const ip of candidates) {
    if (allowPrivate) continue
    for (const re of PRIVATE_NETS) if (re.test(ip)) throw new McpError('MCP_PRIVATE_HOST', `域名解析到受保护地址 ${ip}：默认不允许`)
  }
}

export class McpError extends Error {
  constructor(code, message, { status, requestId, cause } = {}) {
    super(message)
    this.code = code
    this.status = status
    this.requestId = requestId
    this.cause = cause
  }
}

const uid = (prefix = 'mcp') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`

/**
 * 一次 MCP 协商 + 握手：返回 { mode, version, serverInfo, capabilities, tools, ms, requestId }
 * 协商策略：
 *   1) 发 server/discover (2026-07-28)
 *      ├─ 200 + JSON/SSE → 现代无状态
 *      ├─ 400 UnsupportedProtocolVersion → 按服务端支持的版本重试一次
 *      ├─ 401/403 → 授权失败（不降级）
 *      └─ 400/404/405 且非结构化错误 → 降级到旧版
 *   2) 发 initialize (2025-11-25)
 *      ├─ 200 + Mcp-Session-Id → 旧版会话式
 *      └─ 失败 → 抛 MCP_UNSUPPORTED
 */
export async function mcpHandshake({ url, auth, allowPrivate = false, timeoutMs = 10000, maxBytes = 8 * 1024 * 1024 } = {}) {
  const requestId = uid('req')
  const t0 = performance.now()
  await assertPublicHost(url, { allowPrivate })

  const headers = baseHeaders(auth)

  // 第一步：尝试现代协议
  const modern = await tryModern(url, headers, { requestId, timeoutMs, maxBytes })
  if (modern) {
    const tools = await listToolsModern(url, headers, { version: modern.version, requestId, timeoutMs, maxBytes })
    return {
      requestId,
      mode: 'stateless',
      version: modern.version,
      transport: 'mcp-http',
      serverInfo: modern.serverInfo,
      capabilities: modern.capabilities,
      instructions: modern.instructions,
      tools,
      toolCount: tools.length,
      ms: Math.round(performance.now() - t0),
    }
  }

  // 第二步：降级到旧版
  const legacy = await tryLegacy(url, headers, { requestId, timeoutMs, maxBytes })
  if (legacy) {
    const tools = await listToolsLegacy(url, headers, { sessionId: legacy.sessionId, version: legacy.version, requestId, timeoutMs, maxBytes })
    return {
      requestId,
      mode: 'session',
      version: legacy.version,
      transport: 'mcp-http',
      serverInfo: legacy.serverInfo,
      capabilities: legacy.capabilities,
      instructions: legacy.instructions,
      tools,
      toolCount: tools.length,
      sessionId: legacy.sessionId,
      ms: Math.round(performance.now() - t0),
    }
  }

  throw new McpError('MCP_UNSUPPORTED', '该服务既不实现 2026-07-28 也不实现旧版会话协议', { requestId })
}

/** 工具调用：根据 mode 走不同路径 */
export async function mcpCall({ url, auth, server, toolName, args, requestId = uid('call'), timeoutMs = 30000, maxBytes = 8 * 1024 * 1024 } = {}) {
  const t0 = performance.now()
  const headers = baseHeaders(auth)

  if (server.mode === 'stateless') {
    const res = await postJson(url, {
      jsonrpc: '2.0', id: requestId,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args ?? {},
        _meta: {
          'io.modelcontextprotocol/protocolVersion': server.version,
          'io.modelcontextprotocol/clientInfo': { name: 'Design Buddy', version: '1.0.0' },
          'io.modelcontextprotocol/clientCapabilities': {},
        },
      },
    }, { ...headers, 'Mcp-Method': 'tools/call', 'Mcp-Name': toolName, 'MCP-Protocol-Version': server.version }, timeoutMs, maxBytes)
    if (!res.json || res.json.error) {
      throw new McpError('MCP_CALL_FAILED', res.json?.error?.message ?? '远端返回错误', { status: res.status, requestId })
    }
    return {
      requestId,
      ms: Math.round(performance.now() - t0),
      status: res.status,
      bytes: res.bytes,
      content: res.json.result?.content ?? [],
      structuredContent: res.json.result?.structuredContent ?? null,
      isError: !!res.json.result?.isError,
    }
  }

  // 旧版会话
  const res = await postJson(url, {
    jsonrpc: '2.0', id: requestId,
    method: 'tools/call',
    params: { name: toolName, arguments: args ?? {} },
  }, { ...headers, 'Mcp-Session-Id': server.sessionId, 'MCP-Protocol-Version': server.version }, timeoutMs, maxBytes)
  if (!res.json || res.json.error) {
    throw new McpError('MCP_CALL_FAILED', res.json?.error?.message ?? '远端返回错误', { status: res.status, requestId })
  }
  return {
    requestId,
    ms: Math.round(performance.now() - t0),
    status: res.status,
    bytes: res.bytes,
    content: res.json.result?.content ?? [],
    structuredContent: res.json.result?.structuredContent ?? null,
    isError: !!res.json.result?.isError,
  }
}

/* ---------- 内部：现代协议 ---------- */

async function tryModern(url, headers, { requestId, timeoutMs, maxBytes }) {
  const res = await postJson(url, {
    jsonrpc: '2.0', id: `${requestId}-d`,
    method: 'server/discover',
    params: {
      _meta: {
        'io.modelcontextprotocol/protocolVersion': MCP_LATEST_VERSION,
        'io.modelcontextprotocol/clientInfo': { name: 'Design Buddy', version: '1.0.0' },
        'io.modelcontextprotocol/clientCapabilities': {},
      },
    },
  }, { ...headers, 'Mcp-Method': 'server/discover', 'MCP-Protocol-Version': MCP_LATEST_VERSION }, timeoutMs, maxBytes)

  if (res.status === 200 && res.json?.result) {
    const versions = res.json.result.supportedVersions ?? [MCP_LATEST_VERSION]
    const version = versions.includes(MCP_LATEST_VERSION) ? MCP_LATEST_VERSION : versions[0]
    const meta = res.json.result._meta?.['io.modelcontextprotocol/serverInfo'] ?? {}
    return {
      version,
      serverInfo: { name: meta.name ?? 'unknown', version: meta.version ?? '' },
      capabilities: res.json.result.capabilities ?? {},
      instructions: res.json.result.instructions ?? '',
    }
  }
  if (res.status === 400 && res.json?.error?.code === 'UnsupportedProtocolVersionError') {
    const versions = res.json.error?.data?.supportedVersions ?? []
    if (!versions.length) return null
    // 用服务端支持的最高版本重试一次
    const version = versions.find((v) => v !== MCP_LATEST_VERSION) ?? versions[0]
    const retry = await postJson(url, {
      jsonrpc: '2.0', id: `${requestId}-d2`,
      method: 'server/discover',
      params: { _meta: { 'io.modelcontextprotocol/protocolVersion': version, 'io.modelcontextprotocol/clientInfo': { name: 'Design Buddy', version: '1.0.0' }, 'io.modelcontextprotocol/clientCapabilities': {} } },
    }, { ...headers, 'Mcp-Method': 'server/discover', 'MCP-Protocol-Version': version }, timeoutMs, maxBytes)
    if (retry.status === 200 && retry.json?.result) {
      const meta = retry.json.result._meta?.['io.modelcontextprotocol/serverInfo'] ?? {}
      return { version, serverInfo: { name: meta.name ?? 'unknown', version: meta.version ?? '' }, capabilities: retry.json.result.capabilities ?? {}, instructions: retry.json.result.instructions ?? '' }
    }
  }
  if (res.status === 401 || res.status === 403) {
    throw new McpError('MCP_AUTH', `远端返回 ${res.status}：需要授权`, { status: res.status, requestId })
  }
  // 400/404/405 且不是结构化 JSON-RPC → 现代协议不存在，留给旧版
  return null
}

async function listToolsModern(url, headers, { version, requestId, timeoutMs, maxBytes }) {
  const res = await postJson(url, {
    jsonrpc: '2.0', id: `${requestId}-tl`,
    method: 'tools/list',
    params: { _meta: { 'io.modelcontextprotocol/protocolVersion': version, 'io.modelcontextprotocol/clientInfo': { name: 'Design Buddy', version: '1.0.0' }, 'io.modelcontextprotocol/clientCapabilities': {} } },
  }, { ...headers, 'Mcp-Method': 'tools/list', 'MCP-Protocol-Version': version }, timeoutMs, maxBytes)
  if (res.status !== 200 || !res.json?.result) {
    throw new McpError('MCP_LIST_FAILED', `tools/list 返回 ${res.status}`, { status: res.status, requestId })
  }
  return (res.json.result.tools ?? []).map(normalizeTool)
}

/* ---------- 内部：旧版协议 ---------- */

async function tryLegacy(url, headers, { requestId, timeoutMs, maxBytes }) {
  const version = '2025-03-26' // 旧版最通用起点
  const res = await postJson(url, {
    jsonrpc: '2.0', id: `${requestId}-i`,
    method: 'initialize',
    params: {
      protocolVersion: version,
      capabilities: {},
      clientInfo: { name: 'Design Buddy', version: '1.0.0' },
    },
  }, headers, timeoutMs, maxBytes)
  if (res.status !== 200 || !res.json?.result) return null
  const sessionId = res.headers?.['mcp-session-id']
  if (!sessionId) return null
  // 发 initialized 通知完成握手
  await postJson(url, {
    jsonrpc: '2.0',
    method: 'notifications/initialized',
  }, { ...headers, 'Mcp-Session-Id': sessionId, 'MCP-Protocol-Version': version }, timeoutMs, maxBytes).catch(() => {})
  const result = res.json.result
  const serverInfo = result.serverInfo ?? {}
  return {
    version: result.protocolVersion ?? version,
    sessionId,
    serverInfo: { name: serverInfo.name ?? 'unknown', version: serverInfo.version ?? '' },
    capabilities: result.capabilities ?? {},
    instructions: result.instructions ?? '',
  }
}

async function listToolsLegacy(url, headers, { sessionId, version, requestId, timeoutMs, maxBytes }) {
  const res = await postJson(url, {
    jsonrpc: '2.0', id: `${requestId}-tl`,
    method: 'tools/list',
    params: {},
  }, { ...headers, 'Mcp-Session-Id': sessionId, 'MCP-Protocol-Version': version }, timeoutMs, maxBytes)
  if (res.status !== 200 || !res.json?.result) {
    throw new McpError('MCP_LIST_FAILED', `tools/list 返回 ${res.status}`, { status: res.status, requestId })
  }
  return (res.json.result.tools ?? []).map(normalizeTool)
}

/* ---------- 传输层 ---------- */

function baseHeaders(auth) {
  const h = { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream', 'X-DB-Client': 'design-buddy' }
  if (auth?.mode === 'bearer' && auth.token) h.Authorization = `Bearer ${auth.token}`
  if (auth?.mode === 'header' && auth.headerName && auth.token) h[auth.headerName] = auth.token
  return h
}

async function postJson(url, body, headers, timeoutMs, maxBytes) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: ctl.signal,
      redirect: 'manual',
    })
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') throw new McpError('MCP_TIMEOUT', `请求超时 (${timeoutMs} ms)`)
    if (/ENOTFOUND|EAI_AGAIN/.test(err.message)) throw new McpError('MCP_DNS', `域名解析失败：${new URL(url).hostname}`)
    if (/ECONNREFUSED/.test(err.message)) throw new McpError('MCP_REFUSED', `连接被拒：${new URL(url).host}`)
    if (/CERT_/.test(err.code ?? '')) throw new McpError('MCP_TLS', `TLS 错误：${err.message}`)
    throw new McpError('MCP_NETWORK', err.message)
  }
  clearTimeout(timer)
  // 重定向一律拒绝：避免 SSRF 跳到内网
  if (res.status >= 300 && res.status < 400) {
    throw new McpError('MCP_REDIRECT', `远端返回重定向 (${res.status})，出于安全考虑不跟随`, { status: res.status })
  }
  const ct = res.headers.get('content-type') ?? ''
  let json = null
  let bytes = 0
  if (ct.includes('text/event-stream')) {
    const sse = await readSse(res, maxBytes)
    json = sse
    bytes = sse ? new TextEncoder().encode(JSON.stringify(sse)).length : 0
  } else {
    const buf = await readBounded(res, maxBytes)
    bytes = Buffer.byteLength(buf, 'utf-8')
    try { json = buf ? JSON.parse(buf) : null } catch { json = null }
  }
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), json, bytes }
}

async function readBounded(res, maxBytes) {
  const reader = res.body.getReader()
  const chunks = []
  let total = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    total += value.length
    if (total > maxBytes) { reader.cancel(); throw new McpError('MCP_TOO_LARGE', `响应超过 ${maxBytes} 字节上限`) }
    chunks.push(value)
  }
  return Buffer.concat(chunks).toString('utf-8')
}

/** 读 SSE，取最后一个完整 JSON-RPC 消息（MCP 响应通常只有一条 result） */
async function readSse(res, maxBytes) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let lastJson = null
  let total = 0
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    total += value.length
    if (total > maxBytes) { reader.cancel(); throw new McpError('MCP_TOO_LARGE', `SSE 响应超过上限`) }
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    let dataLines = []
    for (const line of lines) {
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim())
      } else if (line === '') {
        if (dataLines.length) {
          try { lastJson = JSON.parse(dataLines.join('\n')) } catch { /* skip */ }
          dataLines = []
        }
      }
    }
    if (lastJson) break
  }
  return lastJson
}

function normalizeTool(t) {
  return {
    name: t.name,
    description: t.description ?? '',
    inputSchema: t.inputSchema ?? { type: 'object', properties: {} },
    annotations: t.annotations ?? null,
  }
}
