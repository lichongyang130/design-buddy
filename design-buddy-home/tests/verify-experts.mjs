/* ============================================================
   专家页（experts.html）：截图式发现区 + 首页同款左侧窄栏
   栏位 / 场景卡 / 专家-专家团 / 排序 / 筛选 / 搜索 /
   固定联动持久化 / 我的专家 / 顶部技能与连接器入口 / 空态
   ============================================================ */

import fs from 'node:fs'
import path from 'node:path'
import { loadPage, click, input, tick, readState, DIST } from './helpers.mjs'
import { EXPERT_CATALOG, EXPERT_CATEGORIES, EXPERT_FILTERS, formatUsage } from '../src/experts-catalog.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const expertsOnly = () => EXPERT_CATALOG.filter((e) => e.kind === 'expert')

/* 产物 CSS 契约：截图布局的关键数值，防止后续改动悄悄退回旧观感 */
const cssAll = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n')
const cssCompact = cssAll.replace(/\s+/g, '')
const layoutOk = cssCompact.includes('.ex-cat-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr))')
  && cssCompact.includes('.ex-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(246px,1fr))')
  && cssCompact.includes('.ex-cat-banner{position:relative;height:94px')
  && cssCompact.includes('.experts-page{flex:1;min-width:0')
  // 场景卡必须带内置插画作配图（不依赖外网素材）
  && EXPERT_CATEGORIES.every((c) => c.art?.startsWith('/art/illustration/'))

/* ---------- 1. 页面骨架：左侧窄栏 + 顶部页签 + 搜索 + 我的专家 ---------- */
{
  const { doc, w, errors, storage } = await loadPage('/experts.html', { freshCopy: true })
  check('experts page loads without errors', errors.length === 0, errors)
  check('screenshot layout contract holds in built CSS', layoutOk)
  check('keeps the homepage rail (vertical icon column)',
    [...doc.querySelectorAll('.rail .rail-item span')].map((s) => s.textContent).join() === '首页,媒体,模板,主题,设置,更多')
  check('more entry marked as current section',
    doc.querySelector('.rail .more-wrap .rail-item').classList.contains('rail-item-active'))
  check('top tabs are 专家 / 技能 / 连接器',
    [...doc.querySelectorAll('.ex-top-tab')].map((t) => t.textContent.trim()).join() === '专家,技能,连接器')
  check('experts tab is the active one',
    doc.querySelector('.ex-top-tab.is-active')?.getAttribute('href') === 'experts.html')
  check('search box present', !!doc.querySelector('#ex-search-input'))
  check('my-experts button present', !!doc.querySelector('[data-mine]'))

  /* ---------- 2. 六大场景卡 ---------- */
  check('6 scenario cards rendered', doc.querySelectorAll('.ex-cat').length === EXPERT_CATEGORIES.length)
  check('each scenario card carries its banner art',
    [...doc.querySelectorAll('.ex-cat-banner')].every((b) => (b.getAttribute('style') ?? '').includes('/art/illustration/')))
  check('scenario cards show 3 sub entries each',
    [...doc.querySelectorAll('.ex-cat')].every((c) => c.querySelectorAll('.ex-cat-sub').length === 3))
  check('scenario card titles match catalog',
    [...doc.querySelectorAll('.ex-cat-name')].map((n) => n.textContent).join() === EXPERT_CATEGORIES.map((c) => c.name).join())

  /* ---------- 3. 分类 chips / 专家·专家团 / 排序 ---------- */
  check('all filter chips rendered', doc.querySelectorAll('.ex-chip').length === EXPERT_FILTERS.length)
  check('全部 chip active by default',
    doc.querySelector('.ex-chip.is-active')?.textContent === '全部' && doc.querySelector('[data-chip="全部"]'))
  check('expert tab lists individual experts', doc.querySelectorAll('.ex-card').length === expertsOnly().length)
  check('usage count formatted with w suffix',
    doc.querySelector('.ex-usage')?.textContent.trim().endsWith('w')
    && doc.querySelector('.ex-usage')?.textContent.includes(formatUsage(EXPERT_CATALOG[0].usage).replace('w', '')))

  click(w, doc.querySelector('[data-kind="team"]'))
  await tick()
  check('team tab lists only teams',
    doc.querySelectorAll('.ex-card').length === EXPERT_CATALOG.filter((e) => e.kind === 'team').length
    && doc.querySelector('[data-kind="team"]').classList.contains('is-active'))
  click(w, doc.querySelector('[data-kind="expert"]'))
  await tick()
  check('back to expert tab restores count', doc.querySelectorAll('.ex-card').length === expertsOnly().length)

  click(w, doc.querySelector('[data-sort="最热"]'))
  await tick()
  const hotUsages = [...doc.querySelectorAll('.ex-usage')].map((u) => parseFloat(u.textContent))
  check('hottest sort is descending by usage', hotUsages.every((v, i) => i === 0 || hotUsages[i - 1] >= v))
  click(w, doc.querySelector('[data-sort="最新"]'))
  await tick()
  const newestName = [...expertsOnly()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].name
  check('newest sort puts latest-created expert first',
    doc.querySelector('.ex-card .ex-card-name')?.textContent.includes(newestName))
  click(w, doc.querySelector('[data-sort="综合"]'))
  await tick()
  check('default sort restores catalog order',
    doc.querySelector('.ex-card[data-pin]')?.dataset.pin === expertsOnly()[0].id)

  /* ---------- 4. 分类 chips 与场景卡联动 ---------- */
  click(w, doc.querySelector('[data-chip="技术工程"]'))
  await tick()
  check('chip filter shows only matching category',
    doc.querySelectorAll('.ex-card').length === expertsOnly().filter((e) => e.category === '技术工程').length)
  check('active chip highlighted', doc.querySelector('[data-chip="技术工程"]').classList.contains('is-active'))
  click(w, doc.querySelector('.ex-cat[data-cat="法务安全"]'))
  await tick()
  check('scenario card activates its chip', doc.querySelector('.ex-chip.is-active')?.textContent === '法务安全')
  check('scenario card filters grid and marks itself active',
    doc.querySelectorAll('.ex-card').length === 1
    && doc.querySelector('.ex-card-name')?.textContent.includes('董秘助手')
    && doc.querySelector('.ex-cat[data-cat="法务安全"]').classList.contains('is-active'))
  click(w, doc.querySelector('[data-chip="全部"]'))
  await tick()
  check('all chip restores full grid', doc.querySelectorAll('.ex-card').length === expertsOnly().length)

  /* ---------- 5. 搜索：实时过滤 + 诚实空态 ---------- */
  input(w, doc.querySelector('#ex-search-input'), 'python')
  await tick()
  check('search filters by name/desc/tags',
    doc.querySelectorAll('.ex-card').length === 1
    && doc.querySelector('.ex-card-name')?.textContent.includes('Python'))
  input(w, doc.querySelector('#ex-search-input'), 'no-such-expert-xyz')
  await tick()
  check('no-match shows honest empty state',
    !!doc.querySelector('.ex-empty') && doc.querySelectorAll('.ex-card').length === 0)
  input(w, doc.querySelector('#ex-search-input'), '')
  await tick()
  check('clearing search restores cards', doc.querySelectorAll('.ex-card').length === expertsOnly().length)

  /* ---------- 6. 卡片固定：真实持久化 + 我的专家 ---------- */
  const pinId = 'ec-webdeploy'
  const pinName = EXPERT_CATALOG.find((e) => e.id === pinId).name
  click(w, doc.querySelector(`.ex-card[data-pin="${pinId}"]`))
  await tick()
  check('pinning catalog card persists to store',
    readState(storage).experts.find((e) => e.name === pinName)?.pinned === true)
  check('pinned card shows pinned state',
    doc.querySelector(`.ex-card[data-pin="${pinId}"]`)?.classList.contains('is-pinned')
    && doc.querySelector(`.ex-card[data-pin="${pinId}"] .ex-pin-mark`).textContent.includes('已固定'))

  click(w, doc.querySelector('[data-mine]'))
  await tick()
  check('my-experts toggle filters to pinned only',
    doc.querySelector('[data-mine]').classList.contains('is-active')
    && doc.querySelectorAll('.ex-card').length === 1
    && doc.querySelector('.ex-card-name')?.textContent.includes(pinName))
  click(w, doc.querySelector('[data-mine]'))
  await tick()

  click(w, doc.querySelector(`.ex-card[data-pin="${pinId}"]`))
  await tick()
  check('unpinning clears persisted flag',
    readState(storage).experts.find((e) => e.name === pinName)?.pinned === false)
  check('pinned highlight removed after unpin',
    !doc.querySelector(`.ex-card[data-pin="${pinId}"]`).classList.contains('is-pinned'))

  /* ---------- 7. 顶部 技能 / 连接器：技能是页面链接，连接器仍弹窗 ---------- */
  check('skills tab links to the skills page',
    doc.querySelector('.ex-top-tab[href="skills.html"]') !== null)
  click(w, doc.querySelector('[data-open="connectors"]'))
  await tick()
  check('connectors tab opens connectors modal', doc.body.textContent.includes('Google Drive'))
  click(w, doc.querySelector('.modal-close'))
  await tick()
  check('closing modal returns to the page', !doc.querySelector('.modal-mask') && !!doc.querySelector('.ex-grid'))

  /* ---------- 8. 本页窄栏「更多」仍可用 ---------- */
  click(w, doc.querySelector('.more-wrap .rail-item'))
  await tick()
  const pop = doc.querySelector('.more-pop')
  check('rail more flyout opens on the experts page',
    pop?.hidden === false && doc.body.contains(pop) && pop.querySelectorAll('[data-more]').length === 3)
  click(w, doc.querySelector('[data-more="专家"]'))
  await tick()
  check('expert item on its own page just closes the flyout', pop.hidden === true)

  check('experts page flow: no runtime errors', errors.length === 0, JSON.stringify(errors))
}

/* ---------- 8. 入口：首页窄栏「更多 → 专家」进入页面而不是弹窗 ---------- */
{
  const { doc, w, errors } = await loadPage('/index.html', { freshCopy: true })
  click(w, doc.querySelector('.more-wrap .rail-item'))
  await tick()
  click(w, doc.querySelector('[data-more="专家"]'))
  await tick()
  check('more menu closes when leaving for the experts page', doc.querySelector('.more-pop').hidden === true)
  check('experts entry no longer opens a modal', !doc.querySelector('.modal-mask'))
  check('experts entry keeps page error-free', errors.length === 0, errors)
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} EXPERTS CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
