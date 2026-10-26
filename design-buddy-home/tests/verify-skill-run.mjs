/* ============================================================
   技能页「直接开工」：点卡片 → 填输入 → 真实运行 → 下载产物
   覆盖：面板开关 / 示例回填 / 安装按钮不误触 / 结果差异 / 已安装视图
   ============================================================ */

import { loadPage, click, input, tick, readState } from './helpers.mjs'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const { doc, w, errors, storage } = await loadPage('/skills.html', { freshCopy: true })
const panel = () => doc.querySelector('#sk-run-panel')
const out = () => doc.querySelector('#sk-run-out')
const card = (name) => doc.querySelector(`#sk-grid [data-sk-name="${name}"]`)
const toasts = () => [...doc.querySelectorAll('.toast')].map((t) => t.textContent).join(' | ')

/* ---------- 1. 面板初始隐藏 ---------- */

check('skills page loads without errors', errors.length === 0, errors)
check('run panel starts hidden', panel() && panel().hidden && panel().innerHTML.trim() === '')
check('grid tip tells users the cards are runnable',
  doc.querySelector('.sk-grid-tip')?.textContent.includes('直接运行'))

/* ---------- 2. 点卡片打开面板 ---------- */

click(w, card('SEO 关键词规划'))
await tick()
check('clicking a card opens the run panel', !panel().hidden)
check('panel titles the skill and marks the engine',
  panel().querySelector('.sk-run-ident h4')?.textContent.includes('SEO 关键词规划')
  && panel().querySelector('.sk-run-tag')?.textContent === '本地引擎')
check('panel explains what will actually run',
  panel().querySelector('.sk-run-ident p')?.textContent.includes('本地引擎真实执行'))
check('not-installed skill offers a real install button',
  !panel().querySelector('[data-sk-install-inline]')?.hidden)
check('input placeholder carries the skill sample',
  panel().querySelector('#sk-run-input')?.placeholder.includes('设计系统'))

/* ---------- 3. 示例回填 ---------- */

click(w, panel().querySelector('[data-sk-sample]'))
await tick()
check('sample button fills the textarea',
  panel().querySelector('#sk-run-input').value.includes('设计系统'))

/* ---------- 4. 运行：真实算法 ---------- */

input(w, panel().querySelector('#sk-run-input'), '咖啡豆 手冲 磨豆机 水温 萃取')
click(w, panel().querySelector('[data-sk-run]'))
await tick(320)
const first = out().querySelector('.xr-result')
check('run renders a result card', !!first && !out().hidden)
check('result kind comes from the engine', first?.dataset.resultKind === 'seo')
check('result carries computed stats from the given input',
  first?.querySelectorAll('.xr-stat').length >= 3
  && first.textContent.includes('候选词'))
check('keyword table echoes the input words',
  first.textContent.includes('咖啡豆') || first.textContent.includes('手冲'))
check('long-tail keywords are separated from main ones',
  first.querySelectorAll('.xr-table').length >= 1)
check('result exposes a downloadable artifact named after the skill',
  !!out().querySelector('[data-sk-download="0"]')
  && out().querySelector('[data-sk-download="0"]').textContent.includes('.csv'))

const firstSummary = first.querySelector('.xr-summary').textContent
input(w, panel().querySelector('#sk-run-input'), '露营 帐篷 睡袋')
click(w, panel().querySelector('[data-sk-run]'))
await tick(320)
const secondSummary = out().querySelector('.xr-result .xr-summary').textContent
check('different input produces a different result', secondSummary !== firstSummary
  && /露营|帐篷|睡袋/.test(out().textContent))

/* ---------- 5. 下载与复制 ---------- */

click(w, out().querySelector('[data-sk-download="0"]'))
await tick()
check('download button reports the artifact name', toasts().includes('已下载'))
click(w, out().querySelector('[data-sk-clear]'))
await tick()
check('collapse hides the result but keeps the panel', out().hidden && !panel().hidden)

/* ---------- 6. 安装按钮不误触面板，安装后写入 store ---------- */

click(w, panel().querySelector('[data-sk-run-close]'))
await tick()
check('close button hides the panel', panel().hidden)

const before = readState(storage).skills.length
click(w, card('SEO 关键词规划').querySelector('[data-install]'))
await tick(80)
if (doc.querySelector('[data-act="ok"]')) {
  click(w, doc.querySelector('[data-act="ok"]'))
  await tick(120)
}
check('installing from the card does not open the run panel', panel().hidden)
check('install still writes through to the store',
  readState(storage).skills.length === before + 1
  && readState(storage).skills.some((s) => s.name === 'SEO 关键词规划'))

/* ---------- 7. 已安装技能：卡片运行按钮 ---------- */

click(w, doc.querySelector('[data-installed-toggle]'))
await tick()
check('installed view offers an explicit run button', !!doc.querySelector('#sk-grid [data-sk-open]'))
const runBtn = doc.querySelector('#sk-grid [data-sk-open]')
click(w, runBtn)
await tick()
check('run button opens the panel for that skill',
  !panel().hidden && panel().textContent.includes(runBtn.dataset.skName))
check('installed skill shows installed state instead of install button',
  panel().querySelector('[data-sk-install-inline]')?.hidden === true
  && panel().textContent.includes('已安装'))

/* ---------- 8. 已安装技能跑另一种引擎：PPT 大纲 ---------- */

const pptCard = doc.querySelector('#sk-grid [data-sk-name="PPT 大纲生成"]')
click(w, pptCard)
await tick()
input(w, panel().querySelector('#sk-run-input'), '给制造业客户做数字化提案，30 分钟')
click(w, panel().querySelector('[data-sk-run]'))
await tick(320)
check('deck skill runs the outline engine', out().querySelector('.xr-result')?.dataset.resultKind === 'outline')
check('outline result is page-by-page, not prose',
  out().querySelectorAll('.xr-table tbody tr').length >= 5
  && out().textContent.includes('页'))

/* ---------- 9. 精选卡片也能开工 ---------- */

click(w, panel().querySelector('[data-sk-run-close]'))
await tick()
click(w, doc.querySelector('[data-feature-card]'))
await tick()
check('featured card opens the run panel too',
  !panel().hidden && panel().textContent.includes(doc.querySelector('[data-feature-card]').dataset.skName))

/* ---------- 10. 全程无运行时错误 ---------- */

check('skill run flow has no runtime errors', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} SKILL-RUN CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
