/* 窄栏「更多」悬浮层：五页结构 / 单张菜单卡片 / 开关 / 悬停 / 真实管理弹窗。
   每页用临时 dist 副本获得全新模块图，等价浏览器逐页加载。 */

import fs from 'node:fs'
import path from 'node:path'
import { loadPage, DIST } from './helpers.mjs'

const pages = ['/index.html', '/templates.html', '/themes.html', '/settings.html', '/media.html']
let failed = 0

// CSS 产物里必须用 fixed 单卡片布局，且不再残留旧的双卡片/任务面板样式
const cssCompact = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n')
const cssOk = cssCompact.replace(/\s+/g, '').includes('.more-pop{position:fixed')
  && !cssCompact.includes('left:calc(100% + 14px)')
  // 浮层挂到 body 后，按钮与卡片间的 14px 缝隙要有透明热区，否则悬停会掉线
  && cssCompact.replace(/\s+/g, '').includes('.more-pop:before{')
  && !cssCompact.includes('.more-panel')
  && !cssCompact.includes('.more-task')

for (const path of pages) {
  const { w, doc, errors } = await loadPage(path, { freshCopy: true })
  const click = (el) => el && el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  const wrap = doc.querySelector('.more-wrap')
  const btn = wrap?.querySelector('.rail-item')
  // 浮层运行时被挂到 body（逃逸 sticky rail 的层叠上下文），所以从 doc 上取
  const pop = doc.querySelector('.more-pop')
  const flyout = pop?.querySelector('.more-flyout')
  const items = [...doc.querySelectorAll('[data-more]')].map((b) => b.dataset.more)

  const ok = (cond, label) => {
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${path} ${label}`)
    if (!cond) failed += 1
  }
  ok(!!wrap && items.join() === '技能,专家,连接器', `flyout structure ${JSON.stringify(items)}`)
  ok(!!pop && pop.hidden === true, 'pop hidden initially')
  // 只有一层：技能/专家/连接器这一张卡片，不要再套一层「更多」任务面板
  ok(!!flyout && pop.children.length === 1 && flyout === pop.firstElementChild, 'single menu card only')
  ok(pop?.querySelectorAll('.menu-row').length === 3, 'three menu rows only')
  ok(!pop?.querySelector('[data-inspire]') && !pop?.querySelector('[data-task]'), 'no second-layer panel entries')
  // rail 是 position: sticky，必然生成层叠上下文；浮层必须挂到 body，
  // 否则 fixed+z-index 也只在 rail 上下文内生效，会被 .sidebar / .main 盖住。
  ok(pop?.parentElement === doc.body && pop.closest('.rail') === null, 'pop portaled out of sticky rail stacking context')
  ok(cssOk, 'pop escapes rail overflow via position:fixed')
  ok(errors.length === 0, `no errors ${JSON.stringify(errors)}`)

  click(btn)
  ok(pop.hidden === false && btn.getAttribute('aria-expanded') === 'true', 'click opens')
  ok(/^\d+px$/.test(pop.style.left) && /^\d+px$/.test(pop.style.top), 'pop positioned from button rect')
  ok(flyout.getBoundingClientRect().left >= 0, 'menu card rendered beside rail')

  // 专家已升级为独立页面：点击后浮层关闭并按页面跳转，不再出现弹窗
  click(doc.querySelector('[data-more="专家"]'))
  ok(pop.hidden === true && !doc.querySelector('.modal-mask'), 'expert pick closes pop and routes to page')

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

  // 浮层在 body 上：从按钮移进浮层时不能被判定为移出而关掉
  wrap.dispatchEvent(new w.MouseEvent('mouseenter', { bubbles: false }))
  wrap.dispatchEvent(new w.MouseEvent('mouseleave', { bubbles: false }))
  pop.dispatchEvent(new w.MouseEvent('mouseenter', { bubbles: false }))
  await new Promise((r) => setTimeout(r, 180))
  ok(pop.hidden === false, 'moving into portaled pop keeps it open')
  pop.dispatchEvent(new w.MouseEvent('mouseleave', { bubbles: false }))
  await new Promise((r) => setTimeout(r, 180))
  ok(pop.hidden === true, 'leaving portaled pop closes')

  // 点击菜单项后浮层关闭，且不再有第二层「更多」可点
  click(btn)
  click(doc.querySelector('[data-more="技能"]'))
  ok(pop.hidden === true && !!doc.querySelector('.modal-mask'), 'skills opens modal and closes pop')
  click(doc.querySelector('.modal-close'))
  console.log('')
}

console.log(failed ? `${failed} FLYOUT CHECK(S) FAILED` : 'ALL FLYOUT CHECKS PASSED')
process.exitCode = failed ? 1 : 0
