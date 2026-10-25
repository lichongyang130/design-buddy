/* 结构与基础交互回归（任务一~九的既有验收） */
import { loadPage, click } from './helpers.mjs'

const results = []

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
