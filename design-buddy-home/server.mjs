/**
 * 零依赖静态文件服务器：直接服务 vite build 产出的 dist/。
 * 相比 vite dev，没有 HMR WebSocket、没有按需转译，也没有 host 校验，
 * 在沙箱预览代理下最稳定。生产构建产物才是最终交付物。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleModelRequest } from './server/api-models.mjs'
import { handleMcpRequest } from './server/api-mcp.mjs'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist')
const port = Number(process.env.PORT ?? 5174)
// Optional direct entry for standalone case previews; keep the workspace default.
const previewEntry = /^[a-zA-Z0-9_-]+\.html$/.test(process.env.PREVIEW_ENTRY || '') ? process.env.PREVIEW_ENTRY : 'index.html'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (urlPath.startsWith('/api/models/')) return await handleModelRequest(req, res)
    // MCP 网关路由前置：/api/mcp/* 走同源 API，不进 dist
    if (urlPath.startsWith('/api/mcp')) {
      return await handleMcpRequest(req, res)
    }
    // 防目录穿越：规范化后必须仍在 dist 内。
    const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
    let filePath = join(root, urlPath === '/' ? previewEntry : safePath)
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end('Forbidden')
      return
    }

    let body
    try {
      body = await readFile(filePath)
    } catch {
      // 资源不存在时回退到 SPA 入口（本项目为单页）。
      filePath = join(root, previewEntry)
      body = await readFile(filePath)
    }

    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
      // HTML 与 Service Worker 必须每次回源校验，否则新版本部署后浏览器看不到更新；
      // 其余带 hash 的静态资源可放心缓存。
      'Cache-Control': (extname(filePath) === '.html' || filePath.endsWith('sw.js'))
        ? 'no-cache'
        : 'public, max-age=3600',
    })
    res.end(body)
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Server error: ' + err.message)
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Design Buddy static server → http://0.0.0.0:${port}/ (root: ${root})`)
})
