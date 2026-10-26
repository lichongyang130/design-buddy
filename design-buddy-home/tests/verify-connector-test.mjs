/* ============================================================
   连接器页「连接测试」：点卡片 → 真跑引擎 → 耗时 / 字段 / 响应 / 错误码
   覆盖：面板开关 / 实测数据 / 输入影响结果 / 连接状态同步 / 产物下载
   ============================================================ */

import { loadPage, click, input, tick, readState } from './helpers.mjs'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const { doc, w, errors, storage } = await loadPage('/connectors.html', { freshCopy: true })
const panel = () => doc.querySelector('#cn-test')
const out = () => doc.querySelector('#cn-test-out')
const card = (name) => doc.querySelector(`[data-cn-name="${name}"]`)
const toasts = () => [...doc.querySelectorAll('.toast')].map((t) => t.textContent).join(' | ')

/* ---------- 1. 初始状态 ---------- */

check('connectors page loads without errors', errors.length === 0, errors)
check('test panel starts hidden', panel() && panel().hidden)
check('grid tip explains card vs plus',
  doc.querySelector('.cn-grid-tip')?.textContent.includes('连接测试')
  && doc.querySelector('.cn-grid-tip')?.textContent.includes('连接或断开'))
check('cards are keyboard reachable surfaces',
  card('通达信').getAttribute('role') === 'button' && card('通达信').getAttribute('tabindex') === '0')
check('plus is a real button inside the card', !!card('通达信').querySelector('button[data-cn-toggle]'))

/* ---------- 2. 点卡片打开面板（不是切状态） ---------- */

click(w, card('通达信'))
await tick()
check('clicking a card opens the test panel', !panel().hidden)
check('opening the panel does not toggle connection',
  !readState(storage).connectors.some((c) => c.name === '通达信' && c.connected))
check('panel titles the connector and its engine kind',
  panel().querySelector('.cn-test-ident h3')?.textContent.includes('通达信')
  && panel().querySelector('.cn-test-tag')?.textContent === 'quote')
check('panel pre-fills a sample input tied to this connector',
  panel().querySelector('#cn-test-input').value.includes('通达信'))
check('panel states what this connector can do',
  panel().querySelector('.cn-conn')?.textContent.includes('行情'))

/* ---------- 3. 运行连接测试 ---------- */

click(w, panel().querySelector('[data-cn-test-run]'))
await tick(360)
check('test finishes and renders a summary', !!out().querySelector('.cn-test-summary'))
const summary = out().querySelector('.cn-test-summary')
check('summary reports the real status 200', summary.querySelector('.cn-req')?.textContent === '连接正常')
check('summary reports a measured latency in ms',
  /平均耗时 [\d.]+ ms/.test(summary.textContent))
check('summary reports the returned field count',
  /返回字段 \d+/.test(summary.textContent) && Number(summary.textContent.match(/返回字段 (\d+)/)[1]) >= 6)
check('summary reports the triggered error code',
  summary.textContent.includes('错误码 400') && summary.textContent.includes('已触发并捕获'))

/* ---------- 4. 检查表 / 示例响应 / 错误码 ---------- */

const tables = [...out().querySelectorAll('.xr-table')]
check('renders a checks table with 6 rows',
  tables[0]?.querySelectorAll('tbody tr').length === 6
  && tables[0].textContent.includes('名称') && tables[0].textContent.includes('产物'))
check('every check row resolves to 通过 / 待填 / 失败',
  [...tables[0].querySelectorAll('tbody tr')].every((tr) => /通过|待填|失败/.test(tr.children[1].textContent)))
const payload = JSON.parse(out().querySelector('pre.xr-code code').textContent)
check('sample response is real json from the engine',
  payload.status === 200 && payload.connector === '通达信' && payload.kind === 'quote')
check('sample response carries computed market numbers',
  payload.data['区间涨跌'] === '+21.8%' && payload.data['最新'] === '15.1')
check('sample response lists the artifact filename',
  payload.artifacts.length === 1 && payload.artifacts[0].includes('通达信'))
check('error code table lists 6 codes and marks the triggered one',
  tables[1]?.querySelectorAll('tbody tr').length === 6
  && tables[1].textContent.includes('输入为空')
  && tables[1].textContent.includes('凭据缺失'))

/* ---------- 5. 引擎真实返回 + 产物 ---------- */

const engineBlock = out().querySelector('.cn-test-data .xr-result')
check('panel shows the engine result, not just a status',
  !!engineBlock && engineBlock.querySelectorAll('.xr-stat').length >= 4)
check('engine result includes the price chart svg', !!engineBlock.querySelector('svg'))
check('downloadable artifact button names the file',
  out().querySelector('[data-cn-download="0"]')?.textContent.includes('quote.json'))
click(w, out().querySelector('[data-cn-download="0"]'))
await tick()
check('downloading reports the file name', toasts().includes('已下载'))

/* ---------- 6. 输入真的影响结果 ---------- */

input(w, panel().querySelector('#cn-test-input'), '查询 Tushare 最近 10 个交易日')
click(w, panel().querySelector('[data-cn-test-run]'))
await tick(360)
const payload2 = JSON.parse(out().querySelector('pre.xr-code code').textContent)
check('changing the input changes the returned data',
  payload2.data['最新'] !== payload.data['最新'] && payload2.data['区间涨跌'] !== payload.data['区间涨跌'])

/* 换成表格类连接器：结果类型必须跟着连接器走 */
click(w, panel().querySelector('[data-cn-test-close]'))
await tick()
check('close hides the test panel', panel().hidden)
click(w, card('金山文档WPS云文档'))
await tick()
check('doc connector opens with its own sample and kind',
  panel().querySelector('.cn-test-tag')?.textContent === 'doc'
  && panel().querySelector('#cn-test-input').value.includes('#'))
click(w, panel().querySelector('[data-cn-test-run]'))
await tick(360)
check('doc connector returns a Word preview instead of a quote chart',
  !!out().querySelector('.xr-preview')
  && out().querySelector('.xr-result')?.dataset.resultKind === 'docx')

/* ---------- 7. 面板里也能连接 / 断开，并同步卡片 ---------- */

click(w, panel().querySelector('[data-cn-panel-toggle]'))
await tick()
check('panel connect button flips persisted state',
  readState(storage).connectors.find((c) => c.name === '金山文档WPS云文档')?.connected === true)
check('panel state pill updates immediately',
  panel().querySelector('.cn-state')?.classList.contains('is-on'))
click(w, panel().querySelector('[data-cn-panel-toggle]'))
await tick()
check('panel disconnect flips it back',
  readState(storage).connectors.find((c) => c.name === '金山文档WPS云文档')?.connected === false
  && !panel().querySelector('.cn-state').classList.contains('is-on'))

/* ---------- 8. 卡片 + 按钮仍然只做连接，不打开面板 ---------- */

click(w, panel().querySelector('[data-cn-test-close]'))
await tick()
click(w, card('Tushare').querySelector('[data-cn-toggle]'))
await tick()
// 现在会弹出连接确认弹窗，需要点击"连接"按钮
const tushareModal = doc.querySelector('.modal-mask')
if (tushareModal) {
  click(w, tushareModal.querySelector('[data-connect]'))
  await tick()
}
check('plus button toggles without opening the panel',
  panel().hidden && readState(storage).connectors.find((c) => c.name === 'Tushare')?.connected === true)
check('card plus flips to check mark',
  card('Tushare').querySelector('.cn-plus')?.textContent === '✓')

/* ---------- 9. 非行情连接器：错误码表里没有命中 400 以外的东西 ---------- */

click(w, card('北大法宝·法律智能检索'))
await tick()
click(w, panel().querySelector('[data-cn-test-run]'))
await tick(360)
const lawSummary = out().querySelector('.cn-test-summary').textContent
check('law connector returns 命中条款 rows and a real count',
  out().textContent.includes('民法典') && /返回字段 \d+/.test(lawSummary))
check('law connector warns that clauses must be re-checked',
  out().textContent.includes('本地摘录'))

/* ---------- 10. 无运行时错误 ---------- */

check('connector test flow has no runtime errors', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} CONNECTOR-TEST CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
