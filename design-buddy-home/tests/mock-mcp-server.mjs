/**
 * Mock MCP 服务器：实现现代（2026-07-28）与旧版（2025-11-25）两种协议
 * 提供测试用工具：echo / add / slow / fail / big
 * 用于测试网关协议协商、错误处理、SSRF 防护。
 */

import { createServer } from 'node:http'

export function startMockServer({ port = 0, requireAuth = false, mode = 'modern' } = {}) {
  const sessions = new Map()
  const received = []

  const server = createServer(async (req, res) => {
    const body = await readBody(req)
    let json = null
    try { json = JSON.parse(body) } catch { /* not JSON */ }

    received.push({ method: req.method, headers: req.headers, body: json, url: req.url })

    // 授权检查
    if (requireAuth) {
      const auth = req.headers.authorization
      if (!auth || !auth.startsWith('Bearer sk-')) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          jsonrpc: '2.0', id: json?.id ?? null,
          error: { code: 'Unauthorized', message: '需要 Bearer token' },
        }))
        return
      }
    }

    const ct = req.headers['content-type'] ?? ''
    if (!ct.includes('application/json')) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: 'InvalidRequest', message: '需要 JSON' } }))
      return
    }

    if (mode === 'modern') {
      await handleModern(json, req, res)
    } else if (mode === 'legacy') {
      await handleLegacy(json, req, res, sessions)
    } else {
      // unknown mode: reject everything
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: 'MethodNotFound', message: '不支持任何方法' } }))
    }
  })

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address()
      resolve({
        server,
        port: addr.port,
        url: `http://127.0.0.1:${addr.port}/mcp`,
        received,
        close: () => new Promise((r) => server.close(r)),
      })
    })
  })
}

async function handleModern(json, req, res) {
  const version = req.headers['mcp-protocol-version']
  const method = json?.method

  if (method === 'server/discover') {
    // 模拟版本不匹配：如果客户端发的版本不是最新的，返回错误
    if (version !== '2026-07-28') {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        jsonrpc: '2.0', id: json.id,
        error: { code: 'UnsupportedProtocolVersionError', message: `不支持 ${version}`, data: { supportedVersions: ['2025-11-25'] } },
      }))
      return
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      jsonrpc: '2.0', id: json.id,
      result: {
        supportedVersions: ['2026-07-28'],
        capabilities: { tools: {} },
        _meta: { 'io.modelcontextprotocol/serverInfo': { name: 'MockMCP', version: '1.0.0' } },
        instructions: '这是一个测试用的 MCP 服务',
      },
    }))
    return
  }

  if (method === 'tools/list') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      jsonrpc: '2.0', id: json.id,
      result: { tools: TOOLS },
    }))
    return
  }

  if (method === 'tools/call') {
    const toolName = json.params?.name
    const args = json.params?.arguments ?? {}
    const result = await callTool(toolName, args)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      jsonrpc: '2.0', id: json.id,
      result,
    }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ jsonrpc: '2.0', id: json?.id ?? null, error: { code: 'MethodNotFound', message: `未知方法 ${method}` } }))
}

async function handleLegacy(json, req, res, sessions) {
  const method = json?.method
  const sessionId = req.headers['mcp-session-id']

  if (method === 'initialize') {
    const sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    sessions.set(sid, { createdAt: Date.now() })
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Mcp-Session-Id': sid,
    })
    res.end(JSON.stringify({
      jsonrpc: '2.0', id: json.id,
      result: {
        protocolVersion: '2025-03-26',
        capabilities: { tools: {} },
        serverInfo: { name: 'MockMCPLegacy', version: '0.9.0' },
      },
    }))
    return
  }

  if (method === 'notifications/initialized') {
    res.writeHead(202)
    res.end()
    return
  }

  // 后续请求必须带 session
  if (!sessionId || !sessions.has(sessionId)) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: 'InvalidRequest', message: '缺少会话' } }))
    return
  }

  if (method === 'tools/list') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      jsonrpc: '2.0', id: json.id,
      result: { tools: TOOLS },
    }))
    return
  }

  if (method === 'tools/call') {
    const toolName = json.params?.name
    const args = json.params?.arguments ?? {}
    const result = await callTool(toolName, args)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      jsonrpc: '2.0', id: json.id,
      result,
    }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ jsonrpc: '2.0', id: json?.id ?? null, error: { code: 'MethodNotFound', message: `未知方法 ${method}` } }))
}

const TOOLS = [
  {
    name: 'echo',
    description: '原样返回输入',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string', description: '要回显的文本' } },
      required: ['text'],
    },
  },
  {
    name: 'add',
    description: '两数相加',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b'],
    },
  },
  {
    name: 'slow',
    description: '慢操作（用于测超时）',
    inputSchema: {
      type: 'object',
      properties: { ms: { type: 'number', default: 100 } },
      required: ['ms'],
    },
  },
  {
    name: 'fail',
    description: '永远失败',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'big',
    description: '返回大响应',
    inputSchema: { type: 'object', properties: {} },
  },
]

async function callTool(name, args) {
  if (name === 'echo') {
    return { content: [{ type: 'text', text: args.text ?? '' }] }
  }
  if (name === 'add') {
    const sum = (args.a ?? 0) + (args.b ?? 0)
    return { content: [{ type: 'text', text: String(sum) }], structuredContent: { result: sum } }
  }
  if (name === 'slow') {
    await new Promise((r) => setTimeout(r, args.ms ?? 100))
    return { content: [{ type: 'text', text: 'done' }] }
  }
  if (name === 'fail') {
    return { content: [{ type: 'text', text: 'error: something went wrong' }], isError: true }
  }
  if (name === 'big') {
    const big = 'x'.repeat(100000)
    return { content: [{ type: 'text', text: big }] }
  }
  return { content: [{ type: 'text', text: 'unknown tool' }], isError: true }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
    req.on('error', reject)
  })
}

// CLI 模式：直接运行这个文件启动 mock 服务
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv.includes('--legacy') ? 'legacy' : 'modern'
  const requireAuth = process.argv.includes('--auth')
  const port = parseInt(process.argv.find((a) => a.startsWith('--port='))?.split('=')[1] ?? '9876', 10)
  startMockServer({ port, mode, requireAuth }).then(({ url }) => {
    console.log(`Mock MCP server (${mode}${requireAuth ? ', auth required' : ''}) → ${url}`)
  })
}
