/* ============================================================
   专家弹窗：左侧固定管理保持旧契约，右侧按截图实现发现区
   双栏布局 / 场景卡 / 专家-专家团 / 排序 / 筛选 / 搜索 /
   固定联动持久化 / 顶部三弹窗切换 / 空态
   ============================================================ */

import { loadPage, click, input, tick, readState } from './helpers.mjs'
import { EXPERT_CATALOG, EXPERT_CATEGORIES, EXPERT_FILTERS, formatUsage } from '../src/experts-catalog.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const { doc, w, errors, storage } = await loadPage('/index.html')
check('experts page loads without errors', errors.length === 0, errors)

const openExperts = async () => {
  click(w, doc.querySelector('.more-wrap .rail-item'))
  await tick()
  click(w, doc.querySelector('[data-more="专家"]'))
  await tick()
}
await openExperts()

/* ---------- 1. 双栏骨架：左侧旧契约 + 右侧截图结构 ---------- */
check('experts modal uses extra-wide two-pane layout',
  !!doc.querySelector('.modal-box.modal-experts .experts-layout .experts-side')
  && !!doc.querySelector('.experts-main'))
check('left pane keeps 5 data-ex management buttons',
  doc.querySelectorAll('.experts-side [data-ex]').length === 5)
check('left pane keeps active agents block', doc.body.textContent.includes('已启用的智能体'))
check('right pane has 6 scenario category cards', doc.querySelectorAll('.ex-cat').length === EXPERT_CATEGORIES.length)
check('right pane has all filter chips', doc.querySelectorAll('.ex-chip').length === EXPERT_FILTERS.length)
check('expert tab lists individual experts',
  doc.querySelectorAll('.ex-card').length === EXPERT_CATALOG.filter((e) => e.kind === 'expert').length)
check('usage count formatted with w suffix',
  doc.querySelector('.ex-usage')?.textContent.trim().endsWith('w')
  && doc.querySelector('.ex-usage')?.textContent.includes(formatUsage(EXPERT_CATALOG[0].usage).replace('w', '')))

/* ---------- 2. 专家 / 专家团 切换 ---------- */
click(w, doc.querySelector('[data-kind="team"]'))
await tick()
check('team tab lists only teams',
  doc.querySelectorAll('.ex-card').length === EXPERT_CATALOG.filter((e) => e.kind === 'team').length
  && doc.querySelector('[data-kind="team"]').classList.contains('is-active'))
click(w, doc.querySelector('[data-kind="expert"]'))
await tick()
check('back to expert tab restores count',
  doc.querySelectorAll('.ex-card').length === EXPERT_CATALOG.filter((e) => e.kind === 'expert').length)

/* ---------- 3. 排序：综合 / 最热 / 最新 ---------- */
click(w, doc.querySelector('[data-sort="最热"]'))
await tick()
const hotUsages = [...doc.querySelectorAll('.ex-usage')].map((u) => parseFloat(u.textContent))
check('hottest sort is descending by usage', hotUsages.every((v, i) => i === 0 || hotUsages[i - 1] >= v))
click(w, doc.querySelector('[data-sort="最新"]'))
await tick()
const newestName = [...EXPERT_CATALOG.filter((e) => e.kind === 'expert')]
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].name
check('newest sort puts latest-created expert first',
  doc.querySelector('.ex-card .ex-card-name')?.textContent.includes(newestName))
click(w, doc.querySelector('[data-sort="综合"]'))
await tick()
check('default sort restores catalog order',
  doc.querySelector('.ex-card[data-pin]')?.dataset.pin === EXPERT_CATALOG.find((e) => e.kind === 'expert').id)

/* ---------- 4. 分类 chips 与场景卡联动 ---------- */
click(w, doc.querySelector('[data-chip="技术工程"]'))
await tick()
const techCount = EXPERT_CATALOG.filter((e) => e.kind === 'expert' && e.category === '技术工程').length
check('chip filter shows only matching category',
  doc.querySelectorAll('.ex-card').length === techCount && techCount === 6)
check('active chip highlighted', doc.querySelector('[data-chip="技术工程"]').classList.contains('is-active'))
// 场景大卡点击 = 激活对应 chip
click(w, doc.querySelector('.ex-cat[data-cat="法务安全"]'))
await tick()
check('scenario card activates its chip', doc.querySelector('.ex-chip.is-active')?.textContent === '法务安全')
check('scenario card filters grid', doc.querySelectorAll('.ex-card').length === 1
  && doc.querySelector('.ex-card-name')?.textContent.includes('董秘助手'))
click(w, doc.querySelector('[data-chip="全部"]'))
await tick()
check('all chip restores full grid', doc.querySelectorAll('.ex-card').length === 12)

/* ---------- 5. 搜索：实时过滤 + 诚实空态 ---------- */
input(w, doc.querySelector('#ex-search-input'), 'python')
await tick()
check('search filters by name/desc/tags',
  doc.querySelectorAll('.ex-card').length === 1
  && doc.querySelector('.ex-card-name')?.textContent.includes('Python'))
input(w, doc.querySelector('#ex-search-input'), 'no-such-expert-xyz')
await tick()
check('no-match shows honest empty state', !!doc.querySelector('.ex-empty') && doc.querySelectorAll('.ex-card').length === 0)
input(w, doc.querySelector('#ex-search-input'), '')
await tick()
check('clearing search restores cards', doc.querySelectorAll('.ex-card').length === 12)

/* ---------- 6. 卡片固定：真实持久化 + 左右联动 ---------- */
const pinId = 'ec-webdeploy'
const pinName = EXPERT_CATALOG.find((e) => e.id === pinId).name
click(w, doc.querySelector(`.ex-card[data-pin="${pinId}"]`))
await tick()
check('pinning catalog card persists to store',
  readState(storage).experts.find((e) => e.name === pinName)?.pinned === true)
check('pinned card shows pill and highlight',
  !!doc.querySelector(`.ex-card[data-pin="${pinId}"] .ex-pin-pill`)
  && doc.querySelector(`.ex-card[data-pin="${pinId}"]`).classList.contains('is-pinned'))
check('pinned expert appears in left management pane',
  [...doc.querySelectorAll('.experts-side .primary')].some((p) => p.textContent.includes(pinName)))
// 我的专家：只看已固定
click(w, doc.querySelector('[data-mine]'))
await tick()
check('my-experts toggle filters to pinned only',
  doc.querySelector('[data-mine]').classList.contains('is-active')
  && doc.querySelectorAll('.ex-card').length === 1
  && doc.querySelector('.ex-card-name')?.textContent.includes(pinName))
click(w, doc.querySelector('[data-mine]'))
await tick()
// 再次点击取消固定
click(w, doc.querySelector(`.ex-card[data-pin="${pinId}"]`))
await tick()
check('unpinning clears persisted flag',
  readState(storage).experts.find((e) => e.name === pinName)?.pinned === false)
check('pin pill removed after unpin', !doc.querySelector(`.ex-card[data-pin="${pinId}"] .ex-pin-pill`))

/* ---------- 7. 左侧旧固定按钮契约不变 ---------- */
const firstExBtn = doc.querySelector('.experts-side [data-ex]')
const before = readState(storage).experts.find((e) => e.id === firstExBtn.dataset.ex)?.pinned
click(w, firstExBtn)
await tick()
const after = readState(storage).experts.find((e) => e.id === firstExBtn.dataset.ex)?.pinned
check('left data-ex button still toggles persisted pin', before !== after && typeof after === 'boolean')
// 还原，避免污染后续套件
click(w, firstExBtn)
await tick()

/* ---------- 8. 顶部三弹窗切换 + 关闭 ---------- */
click(w, doc.querySelector('[data-open="skills"]'))
await tick()
check('skills top tab opens skills modal and closes experts',
  !!doc.querySelector('#skills-root') && !doc.querySelector('.modal-experts'))
click(w, doc.querySelector('.modal-close'))
await tick()
await openExperts()
click(w, doc.querySelector('[data-open="connectors"]'))
await tick()
check('connectors top tab opens connectors modal',
  doc.body.textContent.includes('Google Drive') && !doc.querySelector('.modal-experts'))
click(w, doc.querySelector('.modal-close'))
await tick()
await openExperts()
click(w, doc.querySelector('.modal-close'))
await tick()
check('modal close works', !doc.querySelector('.modal-mask'))

check('experts flow: no runtime errors', errors.length === 0, JSON.stringify(errors))

console.log(`\n${fails.length === 0 ? `ALL ${passed} EXPERTS CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
