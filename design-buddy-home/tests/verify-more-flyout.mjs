/* 窄栏「更多」悬浮层：五页结构 / 双卡片 / 开关 / 悬停 / 真实管理弹窗。
   每页用临时 dist 副本获得全新模块图，等价浏览器逐页加载。 */

import fs from 'node:fs'
import path from 'node:path'
import { loadPage, LS_KEY, DIST } from './helpers.mjs'

const pages = ['/index.html', '/templates.html', '/themes.html', '/settings.html', '/media.html']
let failed = 0

// CSS 产物里必须用 fixed 双卡片布局，防止退回 overflow 裁剪的旧绝对定位
const cssAll = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n')
const cssOk = cssAll.replace(/\s+/g, '').includes('.more-pop{position:fixed')
  && !cssAll.includes('left:calc(100% + 14px)')

for (const path of pages) {
  const { w, doc, errors } = await loadPage(path, { freshCopy: true })
  const click = (el) => el && el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  const wrap = doc.querySelector('.more-wrap')
  const btn = wrap?.querySelector('.rail-item')
  const pop = wrap?.querySelector('.more-pop')
  const flyout = wrap?.querySelector('.more-flyout')
  const items = [...doc.querySelectorAll('[data-more]')].map((b) => b.dataset.more)

  const ok = (cond, label) => {
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${path} ${label}`)
    if (!cond) failed += 1
  }
  ok(!!wrap && items.join() === '技能,专家,连接器', `flyout structure ${JSON.stringify(items)}`)
  ok(!!pop && pop.hidden === true, 'pop hidden initially')
  ok(!!pop?.querySelector('.more-panel') && !!flyout, 'two-card layout: task panel + menu')
  ok(!!pop?.querySelector('[data-inspire]'), 'inspiration entry rendered')
  ok(!!pop?.querySelector('.more-empty-title') && !!pop?.querySelector('.more-empty-hint'), 'honest empty task state')
  ok(cssOk, 'pop escapes rail overflow via position:fixed')
  ok(errors.length === 0, `no errors ${JSON.stringify(errors)}`)

  click(btn)
  ok(pop.hidden === false && btn.getAttribute('aria-expanded') === 'true', 'click opens')
  ok(/^\d+px$/.test(pop.style.left) && /^\d+px$/.test(pop.style.top), 'pop positioned from button rect')
  ok(flyout.getBoundingClientRect().left >= 0, 'menu card rendered beside rail')

  click(doc.querySelector('[data-more="专家"]'))
  ok(pop.hidden === true && !!doc.querySelector('.modal-mask'), 'expert pick opens modal')
  click(doc.querySelector('.modal-close'))

  click(btn)
  doc.body.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  ok(pop.hidden === true, 'outside click closes')

  click(btn)
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  ok(pop.hidden === true, 'esc closes')

  wrap.dispatchEvent(new w.MouseEvent('mouseenter', { bubbles: false }))
  ok(pop.hidden === false, 'mouseenter opens')
  wrap.dispatchEvent(new w.MouseEvent('mouseleave', { bubbles: false }))
  await new Promise((r) => setTimeout(r, 180))
  ok(pop.hidden === true, 'mouseleave closes after delay')
  console.log('')
}

/* 最近任务面板：注入一条真实 gamma，重开浮层应渲染任务行而非空态 */
{
  const seeded = await loadPage('/index.html', { freshCopy: true })
  const st = JSON.parse(seeded.storage.getItem(LS_KEY))
  const now = Date.now()
  st.gammas.unshift({
    id: 'g-flyout-test', title: '季度汇报演示文稿', prompt: '', type: '演示文稿',
    mode: '标准', imgMode: '自动', expert: null, template: null, origin: 'home',
    attachments: [], folderId: null, shared: false, deleted: false, createdAt: now, updatedAt: now,
  })
  seeded.storage.setItem(LS_KEY, JSON.stringify(st))
  const page = await loadPage('/index.html', { storage: seeded.storage, freshCopy: true })
  const click = (el) => el && el.dispatchEvent(new page.w.MouseEvent('click', { bubbles: true }))
  click(page.doc.querySelector('.more-wrap .rail-item'))
  await new Promise((r) => setTimeout(r, 40))
  const task = page.doc.querySelector('.more-task')
  const ok = !!(task && task.textContent.includes('季度汇报演示文稿') && !page.doc.querySelector('.more-empty'))
  console.log(`${ok ? 'PASS' : 'FAIL'}  /index.html recent task rendered from real gamma data`)
  if (!ok) failed += 1

  // 灵感入口在模板页仅关闭浮层（不触发跨页导航）
  click(page.doc.querySelector('[data-inspire]'))
  const ok2 = page.doc.querySelector('.more-pop').hidden === true
  console.log(`${ok2 ? 'PASS' : 'FAIL'}  /index.html inspiration click closes pop`)
  if (!ok2) failed += 1
}

console.log(failed ? `${failed} FLYOUT CHECK(S) FAILED` : 'ALL FLYOUT CHECKS PASSED')
process.exitCode = failed ? 1 : 0
