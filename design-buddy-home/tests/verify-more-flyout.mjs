/* 窄栏「更多」浮层：五页结构 / 开关 / 悬停 / 真实管理弹窗。
   每页用临时 dist 副本获得全新模块图，等价浏览器逐页加载。 */

import { loadPage } from './helpers.mjs'

const pages = ['/index.html', '/templates.html', '/themes.html', '/settings.html', '/media.html']
let failed = 0

for (const path of pages) {
  const { w, doc, errors } = await loadPage(path, { freshCopy: true })
  const click = (el) => el && el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  const wrap = doc.querySelector('.more-wrap')
  const btn = wrap?.querySelector('.rail-item')
  const flyout = wrap?.querySelector('.more-flyout')
  const items = [...doc.querySelectorAll('[data-more]')].map((b) => b.dataset.more)

  const ok = (cond, label) => {
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${path} ${label}`)
    if (!cond) failed += 1
  }
  ok(!!wrap && items.join() === '技能,专家,连接器', `flyout structure ${JSON.stringify(items)}`)
  ok(flyout?.hidden === true, 'hidden initially')
  ok(errors.length === 0, `no errors ${JSON.stringify(errors)}`)

  click(btn)
  ok(flyout.hidden === false && btn.getAttribute('aria-expanded') === 'true', 'click opens')

  click(doc.querySelector('[data-more="专家"]'))
  ok(flyout.hidden === true && !!doc.querySelector('.modal-mask'), 'expert pick opens modal')
  click(doc.querySelector('.modal-close'))

  click(btn)
  doc.body.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  ok(flyout.hidden === true, 'outside click closes')

  click(btn)
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  ok(flyout.hidden === true, 'esc closes')

  wrap.dispatchEvent(new w.MouseEvent('mouseenter', { bubbles: false }))
  ok(flyout.hidden === false, 'mouseenter opens')
  wrap.dispatchEvent(new w.MouseEvent('mouseleave', { bubbles: false }))
  await new Promise((r) => setTimeout(r, 180))
  ok(flyout.hidden === true, 'mouseleave closes after delay')
  console.log('')
}

console.log(failed ? `${failed} FLYOUT CHECK(S) FAILED` : 'ALL FLYOUT CHECKS PASSED')
process.exitCode = failed ? 1 : 0
