/* jsdom + 真实 ESM 动态导入的共享测试加载器。
   每个页面在浏览器里是独立模块图；freshCopy 用临时 dist 副本模拟逐页加载/刷新。 */

import { JSDOM } from 'jsdom'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import { _seedSessionForTests, AUTH_KEY } from '../src/auth.js'

export const base = 'http://127.0.0.1:5174'
export const DIST = path.resolve(new URL('../dist', import.meta.url).pathname)
export const LS_KEY = 'design-buddy-state-v1'

const SHIM_KEYS = [
  'window', 'document', 'localStorage', 'navigator', 'location', 'HTMLElement',
  'Node', 'Event', 'MouseEvent', 'KeyboardEvent', 'CustomEvent', 'Blob', 'File',
  'FileReader', 'URL', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle',
  'MutationObserver', 'DocumentFragment', 'Element', 'customElements',
]

export async function loadPage(file, { storage, freshCopy = false } = {}) {
  const html = await (await fetch(base + file)).text()
  const jsPath = html.match(/\/assets\/[a-z-]+-[^"]*\.js/g)
    .find((p) => !p.includes('styles-') && !p.includes('rail-flyout-'))
  const dom = new JSDOM(html, { url: base + file, runScripts: 'outside-only', pretendToBeVisual: true })
  const w = dom.window
  if (storage) {
    Object.defineProperty(w, 'localStorage', { value: storage, configurable: true })
    // 同步全局 shim，模块代码通过 globalThis.localStorage 才能真正读到传入的存储（模拟刷新）
    Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true })
  }

  const saved = {}
  const setGlobal = (key, value) => {
    saved[key] = Object.getOwnPropertyDescriptor(globalThis, key)
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
  }
  for (const key of SHIM_KEYS) if (w[key] !== undefined) setGlobal(key, w[key])
  setGlobal('window', w)
  if (!w.URL.createObjectURL) {
    w.URL.createObjectURL = () => 'blob:mock-url'
    w.URL.revokeObjectURL = () => {}
  }

  const errors = []
  w.addEventListener('error', (e) => errors.push(e.message))

  // 预置有效登录会话：页面入口的 requireAuth 守卫默认放行。
  // 需要未登录态的测试在 loadPage 后显式 storage.removeItem(AUTH_KEY)。
  if (w.localStorage.getItem(AUTH_KEY) === null) _seedSessionForTests(w.localStorage)



  let entry = path.join(DIST, jsPath)
  if (freshCopy) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'db-page-'))
    fs.cpSync(DIST, tmp, { recursive: true })
    entry = path.join(tmp, jsPath)
  }
  try {
    await import(pathToFileURL(entry).href + `?v=${Date.now()}-${Math.random()}`)
  } catch (e) {
    errors.push(e.message)
  }
  return { w, doc: w.document, errors, storage: w.localStorage }
}

export const readState = (storage) => {
  const raw = storage.getItem(LS_KEY)
  return raw ? JSON.parse(raw) : null
}
export const click = (w, el) => el && el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
export const input = (w, el, value) => {
  el.value = value
  el.dispatchEvent(new w.Event('input', { bubbles: true }))
}
export const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms))
