/**
 * MCP 网关 API：同源路由 /api/mcp/*
 * 全部同源校验、token 不回显、限流、限额、审计。
 */

import { mcpHandshake, mcpCall, McpError, assertPublicHost } from './mcp-client.mjs'
import {
  addServer, removeServer, getServer, listServersPublic, updateHandshake,
  updateAuth, decryptToken, pushLog, getLogs, publicView,
} from './mcp-registry.mjs'

const MAX_SERVERS = 32
const MAX_CONCURRENT_CALLS = 8
const PER_SERVER_RPS = 2
const MAX_BODY = 256 * 1024
const MAX_RESPONSE = 8 * 1024 * 1024

let concurrentCalls = 0
const rpsBucket = new Map() // serverId -> { count, resetAt }

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function ok(res, data) { json(res, 200, { ok: true, ...data }) }
function fail(res, status, code, message, extra = {}) {
  json(res, status, { ok: false, error: { code, message, ...extra } })
}

function rateLimit(id) {
  const now = Date.now()
  const b = rpsBucket.get(id) ?? { count: 0, resetAt: now + 1000 }
  if (now > b.resetAt) { b.count = 0; b.resetAt = now + 1000 }
  b.count++
  rpsBucket.set(id, b)
  return b.count > PER_SERVER_RPS
}

async function readBody(req, maxBytes = MAX_BODY) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBytes) { reject(new Error('请求体过大')); req.destroy() }
      else chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

/** 同源校验：Origin 存在时必须同源；要求自定义头 X-DB-Client */
function sameOrigin(req) {
  const origin = req.headers.origin
  if (origin) {
    const host = req.headers.host
    if (!host) return false
    const originHost = new URL(origin).host
    if (originHost !== host) return false
  }
  if (req.headers['x-db-client'] !== 'design-buddy') return false
  return true
}

export async function handleMcpRequest(req, res) {
  // 同源校验前置
  if (!sameOrigin(req)) {
    fail(res, 403, 'FORBIDDEN', '跨源请求被拒绝')
    return
  }

  const urlPath = new URL(req.url, 'http://x').pathname
  const parts = urlPath.split('/').filter(Boolean)
  // /api/mcp/... → parts[0]='api', parts[1]='mcp', rest=route
  const route = parts.slice(2)

  try {
    // GET /api/mcp/servers
    if (req.method === 'GET' && route.length === 1 && route[0] === 'servers') {
      const list = await listServersPublic()
      return ok(res, { servers: list })
    }

    // POST /api/mcp/servers — 新增并真握手
    if (req.method === 'POST' && route.length === 1 && route[0] === 'servers') {
      const servers = await listServersPublic()
      if (servers.length >= MAX_SERVERS) return fail(res, 429, 'LIMIT', `服务数已达上限 ${MAX_SERVERS}`)
      const body = await readBody(req)
      let parsed
      try { parsed = JSON.parse(body) } catch { return fail(res, 400, 'BAD_JSON', '请求体不是合法 JSON') }
      const { label, url, auth, allowPrivate, timeoutMs } = parsed
      if (!label || typeof label !== 'string') return fail(res, 400, 'BAD_INPUT', '缺少 label')
      if (!url || typeof url !== 'string') return fail(res, 400, 'BAD_INPUT', '缺少 url')
      // SSRF 预检
      try { await assertPublicHost(url, { allowPrivate }) } catch (err) {
        return fail(res, 400, err.code, err.message)
      }
      // 真握手
      let hs
      try {
        hs = await mcpHandshake({ url, auth, allowPrivate, timeoutMs: timeoutMs ?? 10000, maxBytes: MAX_RESPONSE })
      } catch (err) {
        if (err instanceof McpError) return fail(res, err.status ?? 400, err.code, err.message, { requestId: err.requestId })
        return fail(res, 500, 'INTERNAL', err.message)
      }
      // 握手成功才落盘
      const record = await addServer({ label, url, auth, allowPrivate, timeoutMs, handshakeResult: hs })
      await pushLog(record.id, { action: 'handshake', ok: true, latency: hs.ms, requestId: hs.requestId, detail: `${hs.toolCount} 个工具` })
      return ok(res, { server: publicView(record) })
    }

    // POST /api/mcp/servers/:id/handshake — 重新握手
    const handshakeMatch = urlPath.match(/^\/api\/mcp\/servers\/([^/]+)\/handshake$/)
    if (req.method === 'POST' && handshakeMatch) {
      const id = handshakeMatch[1]
      const server = await getServer(id)
      if (!server) return fail(res, 404, 'NOT_FOUND', '服务不存在')
      if (rateLimit(id)) return fail(res, 429, 'RATE', '握手过于频繁，请稍后再试')
      const auth = server.auth?.mode === 'none' ? null : { mode: server.auth.mode, headerName: server.auth.headerName, token: await decryptToken(server) }
      let hs
      try {
        hs = await mcpHandshake({ url: server.url, auth, allowPrivate: server.allowPrivate, timeoutMs: 10000, maxBytes: MAX_RESPONSE })
      } catch (err) {
        if (err instanceof McpError) return fail(res, err.status ?? 400, err.code, err.message, { requestId: err.requestId })
        return fail(res, 500, 'INTERNAL', err.message)
      }
      await updateHandshake(id, hs)
      await pushLog(id, { action: 'handshake', ok: true, latency: hs.ms, requestId: hs.requestId, detail: `${hs.toolCount} 个工具` })
      const updated = await getServer(id)
      return ok(res, { server: publicView(updated) })
    }

    // PATCH /api/mcp/servers/:id — 换凭据
    const patchMatch = urlPath.match(/^\/api\/mcp\/servers\/([^/]+)$/)
    if (req.method === 'PATCH' && patchMatch) {
      const id = patchMatch[1]
      const server = await getServer(id)
      if (!server) return fail(res, 404, 'NOT_FOUND', '服务不存在')
      const body = await readBody(req)
      let parsed
      try { parsed = JSON.parse(body) } catch { return fail(res, 400, 'BAD_JSON', '请求体不是合法 JSON') }
      const { auth } = parsed
      if (!auth) return fail(res, 400, 'BAD_INPUT', '缺少 auth')
      await updateAuth(id, auth)
      // 换完凭据立刻重握手
      const updated = await getServer(id)
      const authForCall = auth.mode === 'none' ? null : { mode: auth.mode, headerName: auth.headerName, token: auth.token }
      let hs
      try {
        hs = await mcpHandshake({ url: updated.url, auth: authForCall, allowPrivate: updated.allowPrivate, timeoutMs: 10000, maxBytes: MAX_RESPONSE })
      } catch (err) {
        if (err instanceof McpError) return fail(res, err.status ?? 400, err.code, err.message, { requestId: err.requestId })
        return fail(res, 500, 'INTERNAL', err.message)
      }
      await updateHandshake(id, hs)
      await pushLog(id, { action: 'authorize', ok: true, detail: `凭据已更换 · 指纹 ${auth.token ? (await import('./mcp-registry.mjs')).fingerprint(auth.token) : 'none'}` })
      await pushLog(id, { action: 'handshake', ok: true, latency: hs.ms, requestId: hs.requestId, detail: `${hs.toolCount} 个工具` })
      const final = await getServer(id)
      return ok(res, { server: publicView(final) })
    }

    // DELETE /api/mcp/servers/:id
    const deleteMatch = urlPath.match(/^\/api\/mcp\/servers\/([^/]+)$/)
    if (req.method === 'DELETE' && deleteMatch) {
      const id = deleteMatch[1]
      const removed = await removeServer(id)
      if (!removed) return fail(res, 404, 'NOT_FOUND', '服务不存在')
      return ok(res, { removed: publicView(removed) })
    }

    // POST /api/mcp/servers/:id/call
    const callMatch = urlPath.match(/^\/api\/mcp\/servers\/([^/]+)\/call$/)
    if (req.method === 'POST' && callMatch) {
      const id = callMatch[1]
      if (concurrentCalls >= MAX_CONCURRENT_CALLS) return fail(res, 429, 'LIMIT', '同时在途调用过多')
      const server = await getServer(id)
      if (!server) return fail(res, 404, 'NOT_FOUND', '服务不存在')
      if (rateLimit(id)) return fail(res, 429, 'RATE', '调用过于频繁，请稍后再试')
      const body = await readBody(req)
      let parsed
      try { parsed = JSON.parse(body) } catch { return fail(res, 400, 'BAD_JSON', '请求体不是合法 JSON') }
      const { toolName, args } = parsed
      if (!toolName || typeof toolName !== 'string') return fail(res, 400, 'BAD_INPUT', '缺少 toolName')
      const auth = server.auth?.mode === 'none' ? null : { mode: server.auth.mode, headerName: server.auth.headerName, token: await decryptToken(server) }
      concurrentCalls++
      try {
        const result = await mcpCall({ url: server.url, auth, server, toolName, args, timeoutMs: 30000, maxBytes: MAX_RESPONSE })
        await pushLog(id, { action: 'call', ok: !result.isError, latency: result.ms, bytes: result.bytes, requestId: result.requestId, detail: `${toolName} · ${result.content?.length ?? 0} 段内容` })
        return ok(res, { result })
      } catch (err) {
        if (err instanceof McpError) {
          await pushLog(id, { action: 'call', ok: false, requestId: err.requestId, detail: `${toolName} · ${err.code}` })
          return fail(res, err.status ?? 400, err.code, err.message, { requestId: err.requestId })
        }
        return fail(res, 500, 'INTERNAL', err.message)
      } finally {
        concurrentCalls--
      }
    }

    // GET /api/mcp/servers/:id/logs
    const logsMatch = urlPath.match(/^\/api\/mcp\/servers\/([^/]+)\/logs$/)
    if (req.method === 'GET' && logsMatch) {
      const id = logsMatch[1]
      const server = await getServer(id)
      if (!server) return fail(res, 404, 'NOT_FOUND', '服务不存在')
      const logs = await getLogs(id)
      return ok(res, { logs })
    }

    return fail(res, 404, 'NOT_FOUND', '未知路由')
  } catch (err) {
    console.error('MCP API error:', err)
    return fail(res, 500, 'INTERNAL', err.message)
  }
}
