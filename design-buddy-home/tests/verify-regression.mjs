/* 结构与基础交互回归（任务一~九的既有验收） */
import fs from 'node:fs'
import path from 'node:path'
import { loadPage, click, DIST } from './helpers.mjs'

const results = []

// 打包 CSS 静态断言（jsdom 不计算外部样式表，直接校验产物文本）
const cssBundle = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n')
results.push(['css: expert submenu no 118px offset', !cssBundle.includes('margin-top:118px') && /\.popover-sub\{[^}]*margin-top:0/.test(cssBundle.replace(/\s+/g, ''))])
results.push(['css: ws menu card restyled', cssBundle.includes('.ws-menu') && cssBundle.includes('border-radius:22px')])

// Service Worker：必须 network-first 导航 + 版本化缓存，防止旧壳长期驻留（预览不更新的根因防护）
{
  const sw = fs.readFileSync(path.join(DIST, 'sw.js'), 'utf8')
  results.push(['sw: versioned shell cache v2', sw.includes("design-buddy-shell-v2'") && !sw.includes('shell-v1')])
  results.push(['sw: navigation requests are network-first', sw.includes("req.mode === 'navigate'")])
  results.push(['sw: stale caches purged on activate', sw.includes('caches.delete')])
  const head = await fetch('http://127.0.0.1:5174/sw.js')
  const htmlHead = await fetch('http://127.0.0.1:5174/index.html')
  results.push(['server: sw.js served no-cache', (head.headers.get('cache-control') || '').includes('no-cache')])
  results.push(['server: html served no-cache', (htmlHead.headers.get('cache-control') || '').includes('no-cache')])
}

// 首页：既有结构 + 三个弹层
{
  const { doc, w, errors } = await loadPage('/index.html')
  const q = (s) => doc.querySelector(s)
  click(w, q('#add-menu-btn'))
  const addOpen = !q('#add-popover').hidden
  click(w, doc.body)
  click(w, q('#img-menu-btn'))
  const imgOpen = !q('#img-popover').hidden
  click(w, doc.body)
  click(w, q('#mode-menu-btn'))
  const effortOpen = !q('#effort-popover').hidden
  click(w, doc.body)
  results.push(['home bundle errors', errors.length === 0, errors])
  results.push(['home nav/template counts', doc.querySelectorAll('.nav-item').length === 9 && doc.querySelectorAll('.template-card').length === 6])
  results.push(['home three popovers toggle', addOpen && imgOpen && effortOpen])
}

// 模板页
{
  const { doc, errors } = await loadPage('/templates.html')
  results.push(['templates 24 cards', doc.querySelectorAll('.tpl-card').length === 24])
  results.push(['templates no errors', errors.length === 0, errors])
}

// 主题页
{
  const { doc, errors } = await loadPage('/themes.html')
  results.push(['themes 18 cards', doc.querySelectorAll('.theme-card').length === 18])
  results.push(['themes no errors', errors.length === 0, errors])
}

// 设置页
{
  const { doc, errors } = await loadPage('/settings.html')
  results.push(['settings selects/switches', doc.querySelectorAll('[data-select]').length === 4 && doc.querySelectorAll('[data-switch]').length === 4])
  results.push(['settings no errors', errors.length === 0, errors])
}

// 媒体页
{
  const { doc, errors } = await loadPage('/media.html')
  results.push(['media 9 items', doc.querySelectorAll('.media-item').length === 9])
  results.push(['media no errors', errors.length === 0, errors])
}

let failed = 0
for (const [name, ok, extra] of results) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? '  ' + JSON.stringify(extra) : ''}`)
  if (!ok) failed += 1
}
console.log(failed ? `\n${failed} CHECK(S) FAILED` : '\nALL REGRESSION CHECKS PASSED')
process.exitCode = failed ? 1 : 0
