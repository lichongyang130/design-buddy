/**
 * 零依赖静态文件服务器：直接服务 vite build 产出的 dist/。
 * 相比 vite dev，没有 HMR WebSocket、没有按需转译，也没有 host 校验，
 * 在沙箱预览代理下最稳定。生产构建产物才是最终交付物。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), 'dist')
const port = Number(process.env.PORT ?? 5174)

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
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    // 防目录穿越：规范化后必须仍在 dist 内。
    const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
    let filePath = join(root, safePath)
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end('Forbidden')
      return
    }

    let body
    try {
      body = await readFile(filePath)
    } catch {
      // 资源不存在时回退到 SPA 入口（本项目为单页）。
      filePath = join(root, 'index.html')
      body = await readFile(filePath)
    }

    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream',
      // 代理缓存按 URL 区分即可；不加 no-cache，让静态 hash 资源可缓存。
      'Cache-Control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600',
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
