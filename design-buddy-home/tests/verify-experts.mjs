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
  /* 专家介绍曾经是 inline + nowrap：overflow 不生效，长文案直接溢出卡片 */
  check('description is a clamped block, never inline nowrap',
    cssCompact.includes('.ex-card-desc{display:block;display:-webkit-box;-webkit-line-clamp:2')
    && cssCompact.includes('-webkit-box-orient:vertical;overflow:hidden;min-height:38px')
    && !/\.ex-card-desc\{[^}]*white-space:nowrap/.test(cssCompact))
  check('every description carries its full text as a hover title',
    [...doc.querySelectorAll('.ex-card-desc')].every((d) =>
      d.textContent.trim().length > 0 && d.getAttribute('title') === d.textContent.trim()))
  check('long expert name ellipsizes through an inner text span',
    doc.querySelector('.ex-card-name-text') !== null
    && cssCompact.includes('.ex-card-name-text{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis'))
  check('only the more entry is active in the rail',
    [...doc.querySelectorAll('.rail .rail-item-active')].length === 1)
  check('themes entry is not marked active on the experts page',
    !doc.querySelector('.rail a[href="themes.html"]').classList.contains('rail-item-active')
    && !doc.querySelector('.rail a[href="themes.html"]').hasAttribute('aria-current'))
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
    doc.querySelector('.ex-card')?.dataset.expert === expertsOnly()[0].id)

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
  click(w, doc.querySelector(`[data-pin="${pinId}"]`))
  await tick()
  check('pinning catalog card persists to store',
    readState(storage).experts.find((e) => e.name === pinName)?.pinned === true)
  check('pinned card shows pinned state',
    doc.querySelector(`.ex-card[data-expert="${pinId}"]`)?.classList.contains('is-pinned')
    && doc.querySelector(`.ex-card[data-expert="${pinId}"] [data-pin]`).textContent.includes('已固定'))

  click(w, doc.querySelector('[data-mine]'))
  await tick()
  check('my-experts toggle filters to pinned only',
    doc.querySelector('[data-mine]').classList.contains('is-active')
    && doc.querySelectorAll('.ex-card').length === 1
    && doc.querySelector('.ex-card-name')?.textContent.includes(pinName))
  click(w, doc.querySelector('[data-mine]'))
  await tick()

  click(w, doc.querySelector(`[data-pin="${pinId}"]`))
  await tick()
  check('unpinning clears persisted flag',
    readState(storage).experts.find((e) => e.name === pinName)?.pinned === false)
  check('pinned highlight removed after unpin',
    !doc.querySelector(`.ex-card[data-expert="${pinId}"]`).classList.contains('is-pinned'))

  /* ---------- 7. 专家详情抽屉：点卡片按截图展示 / 召唤 / 帮你做 / 更多 ---------- */
  const openCard = async (id) => {
    click(w, doc.querySelector(`[data-open-expert="${id}"]`))
    await tick()
  }
  const drawer = () => doc.querySelector('.ex-drawer-mask')
  const py = EXPERT_CATALOG.find((e) => e.id === 'ec-python')

  await openCard('ec-python')
  check('clicking an expert card opens the detail drawer',
    !!drawer()?.querySelector('.ex-drawer[role="dialog"]'))
  check('drawer is portalled to body, above the page', drawer()?.parentElement === doc.body)
  check('drawer header shows expert name and persona',
    drawer().querySelector('.ex-drawer-name')?.textContent === py.name
    && drawer().querySelector('.ex-drawer-persona')?.textContent === py.persona
    && drawer().querySelector('.ex-drawer-title i')?.textContent === '|')
  check('drawer offers the summon button',
    drawer().querySelector('[data-summon]')?.textContent.trim() === '召唤')
  check('drawer shows the full description',
    drawer().querySelector('.ex-drawer-desc')?.textContent === py.desc)
  check('drawer lists every ability tag',
    [...drawer().querySelectorAll('.ex-drawer-tags .ex-tag')].map((t) => t.textContent).join() === py.tags.join())
  check('drawer shows version and usage stats', (() => {
    const [ver, use] = [...drawer().querySelectorAll('.ex-stat')]
    return ver?.querySelector('strong').textContent === py.version
      && ver?.querySelector('span').textContent === '版本'
      && use?.querySelector('strong').textContent.includes(formatUsage(py.usage))
      && use?.querySelector('span').textContent === '使用量'
  })())
  check('drawer lists three curated prompts in quotes',
    drawer().querySelectorAll('.ex-prompt').length === 3
    && [...drawer().querySelectorAll('.ex-prompt-text')].every((t) => t.textContent.startsWith('「') && t.textContent.endsWith('」'))
    && [...drawer().querySelectorAll('.ex-prompt-text')].map((t) => t.textContent.slice(1, -1)).join('\u0000') === py.prompts.join('\u0000'))
  check('drawer section titles match the screenshot',
    [...drawer().querySelectorAll('.ex-drawer-sec-title')].map((t) => t.textContent.trim()).join() === '专家帮你做,更多')
  check('drawer ends with a copyable expert id',
    drawer().querySelector('[data-copy-id]')?.textContent.trim() === `ID: ${py.id}`)
  check('drawer layout follows the screenshot spec',
    cssCompact.includes('.ex-drawer{position:relative;width:min(640px,100%)')
    && cssCompact.includes('border-radius:18px0018px')
    && cssCompact.includes('.ex-drawer-mask{position:fixed;top:0;right:0;bottom:0;left:0;z-index:85')
    && cssCompact.includes('.ex-summon{margin-top:12px;height:38px'))

  click(w, doc.querySelector('[data-drawer-close]'))
  await tick()
  check('close button dismisses the drawer', !drawer())

  await openCard('ec-python')
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
  check('Escape dismisses the drawer', !drawer())

  await openCard('ec-python')
  click(w, drawer())
  await tick()
  check('clicking the scrim dismisses the drawer', !drawer())

  await openCard('ec-mentor')
  check('opening another expert swaps the drawer content',
    drawer()?.querySelector('.ex-drawer-name')?.textContent === '创业导师助手')

  click(w, doc.querySelector('[data-summon]'))
  await tick()
  const summoned = JSON.parse(storage.getItem('design-buddy-summon-v1') ?? 'null')
  check('summon closes the drawer', !drawer())
  check('summon hands the expert over to the home page',
    summoned?.name === '创业导师助手' && summoned?.prompt === '')
  storage.removeItem('design-buddy-summon-v1')

  await openCard('ec-boardsec')
  const boardPrompt = EXPERT_CATALOG.find((e) => e.id === 'ec-boardsec').prompts[0]
  click(w, doc.querySelector('.ex-prompt'))
  await tick()
  const withPrompt = JSON.parse(storage.getItem('design-buddy-summon-v1') ?? 'null')
  check('a prompt row carries its text to the home page',
    withPrompt?.name === '董秘助手' && withPrompt?.prompt === boardPrompt && !drawer())
  storage.removeItem('design-buddy-summon-v1')

  await openCard('ec-boardsec')
  click(w, doc.querySelector('[data-copy-id]'))
  await tick()
  check('copying the id surfaces feedback',
    doc.querySelector('#toast')?.textContent.includes('ID'))
  click(w, doc.querySelector('[data-drawer-close]'))
  await tick()

  click(w, doc.querySelector('[data-pin="ec-mentor"]'))
  await tick()
  check('pin button never opens the drawer',
    !drawer() && readState(storage).experts.find((e) => e.name === '创业导师助手')?.pinned === true)
  click(w, doc.querySelector('[data-pin="ec-mentor"]'))
  await tick()

  /* ---------- 8. 顶部 技能 / 连接器 都是页面链接 ---------- */
  check('skills tab links to the skills page',
    doc.querySelector('.ex-top-tab[href="skills.html"]') !== null)
  check('connectors tab links to the connectors page',
    doc.querySelector('.ex-top-tab[href="connectors.html"]') !== null)
  check('no leftover modal entry on the experts page', !doc.querySelector('[data-open]'))

  /* ---------- 9. 本页窄栏「更多」仍可用 ---------- */
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

/* ---------- 10. 入口：首页窄栏「更多 → 专家」进入页面而不是弹窗 ---------- */
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

/* ---------- 11. 首页接收召唤：选好专家并带入提示词 ---------- */
{
  const { storage } = await loadPage('/experts.html', { freshCopy: true })
  storage.setItem('design-buddy-summon-v1', JSON.stringify({ name: '董秘助手', prompt: '帮我起草一份董事会决议公告' }))
  const home = await loadPage('/index.html', { storage, freshCopy: true })
  check('home prefills the summoned prompt',
    home.doc.querySelector('#prompt-input')?.value === '帮我起草一份董事会决议公告')
  check('home announces the summoned expert',
    home.doc.querySelector('#toast')?.textContent.includes('董秘助手'))
  check('summon payload is one-shot and cleared on arrival',
    storage.getItem('design-buddy-summon-v1') === null)
  check('home handles the summon without errors', home.errors.length === 0, home.errors)
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} EXPERTS CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
