/* ============================================================
   专家页（experts.html）：截图式发现区 + 首页同款左侧窄栏
   栏位 / 场景卡 / 专家-专家团 / 排序 / 筛选 / 搜索 /
   固定联动持久化 / 我的专家 / 顶部技能与连接器入口 / 空态
   ============================================================ */

import fs from 'node:fs'
import path from 'node:path'
import { loadPage, click, input, tick, readState, DIST } from './helpers.mjs'
import { EXPERT_CATALOG, EXPERT_CATEGORIES, EXPERT_FILTERS, formatUsage } from '../src/experts-catalog.js'
import { EXPERT_AVATARS } from '../src/expert-avatars.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const expertsOnly = () => EXPERT_CATALOG.filter((e) => e.kind === 'expert')

/* 目录契约：只保留最有用的办公专家（Gamma 团队架构 + 网页原型） */
check('catalog stays focused (12 experts, no teams)',
  expertsOnly().length === 12 && EXPERT_CATALOG.filter((e) => e.kind === 'team').length === 0)
check('every expert maps to a product capability category',
  EXPERT_CATALOG.every((e) => EXPERT_FILTERS.includes(e.category)))
check('every expert spells out the problems it solves',
  EXPERT_CATALOG.every((e) => Array.isArray(e.solves) && e.solves.length === 3 && e.solves.every((x) => x.length >= 8)))
check('every expert ships three ready-to-run prompts',
  EXPERT_CATALOG.every((e) => Array.isArray(e.prompts) && e.prompts.length === 3))
check('every expert carries persona and version for the drawer',
  EXPERT_CATALOG.every((e) => !!e.persona && /^v\d+\.\d+\.\d+$/.test(e.version)))
check('no generic industry filler left in the catalog', !EXPERT_CATALOG.some((e) =>
  ['金融投资', '健康医疗', '游戏空间', '教育学习', '法务安全', '销售商务', '运营人力'].includes(e.category)))
check('categories and chips describe product problems',
  EXPERT_CATEGORIES.map((c) => c.name).join() === '提案与演示,品牌与视觉,文档与报告,网站与原型,导入与交付,办公与协同,研究与情报,总调度'
  && EXPERT_FILTERS.join() === '全部,提案演示,品牌视觉,文档报告,网站原型,导入与交付,办公协同,研究分析,总调度')
check('each scenario card lists real experts from its own category',
  EXPERT_CATEGORIES.every((c) => c.subs.length >= 1
    && c.subs.every((name) => EXPERT_CATALOG.some((e) => e.name === name && e.category === c.filter))))

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
    [...doc.querySelectorAll('.rail .rail-item span')].map((s) => s.textContent).join() === '首页,媒体,模板,案例,主题,设置,更多')
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
  /* 头像：西方动画电影式 3D 肖像（本地 webp），缺图的专家回退首字 */
  const cards = [...doc.querySelectorAll('.ex-card')]
  const portraits = cards.filter((c) => c.querySelector('.expert-avatar.has-photo img'))
  const initials = cards.filter((c) => !c.querySelector('.expert-avatar.has-photo img'))
  check('every expert card paints a 3D portrait avatar', portraits.length === cards.length, `${portraits.length}/${cards.length}`)
  check('portrait avatars point at local webp files',
    portraits.every((c) => /^\/avatars\/ec-[a-z-]+\.webp$/.test(c.querySelector('.expert-avatar img').getAttribute('src'))))
  check('portraits lazy-load and stay decorative',
    portraits.every((c) => c.querySelector('.expert-avatar img').getAttribute('loading') === 'lazy'
      && c.querySelector('.expert-avatar img').getAttribute('alt') === ''))
  check('cards without a portrait fall back to single-char initials',
    initials.every((c) => c.querySelector('.expert-avatar').textContent.trim().length === 1))
  check('every catalog expert has an avatar file registered',
    EXPERT_CATALOG.every((e) => /^\/avatars\/ec-[a-z-]+\.webp$/.test(EXPERT_AVATARS[e.id] ?? '')))
  check('avatar files exist on disk and are reasonable size',
    EXPERT_CATALOG.every((e) => {
      const p = path.join(DIST, EXPERT_AVATARS[e.id])
      const st = fs.statSync(p)
      return st.isFile() && st.size > 2000 && st.size < 40000
    }))
  check('avatar contract in built CSS',
    cssCompact.includes('.expert-avatar.has-photo{overflow:hidden')
    && cssCompact.includes('.expert-avatar.has-photoimg{display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit}'))
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
  check('scenario cards show their expert subs',
    [...doc.querySelectorAll('.ex-cat')].every((c) => c.querySelectorAll('.ex-cat-sub').length >= 1))
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
  click(w, doc.querySelector('[data-chip="品牌视觉"]'))
  await tick()
  check('chip filter shows only matching category',
    doc.querySelectorAll('.ex-card').length === expertsOnly().filter((e) => e.category === '品牌视觉').length
    && doc.querySelectorAll('.ex-card').length > 0)
  check('active chip highlighted', doc.querySelector('[data-chip="品牌视觉"]').classList.contains('is-active'))
  click(w, doc.querySelector('.ex-cat[data-cat="文档报告"]'))
  await tick()
  const docExperts = expertsOnly().filter((e) => e.category === '文档报告')
  check('scenario card activates its chip', doc.querySelector('.ex-chip.is-active')?.textContent === '文档报告')
  check('scenario card filters grid and marks itself active',
    doc.querySelectorAll('.ex-card').length === docExperts.length
    && docExperts.every((e) => doc.querySelector(`.ex-card[data-expert="${e.id}"]`))
    && doc.querySelector('.ex-cat[data-cat="文档报告"]').classList.contains('is-active'))
  click(w, doc.querySelector('[data-chip="全部"]'))
  await tick()
  check('all chip restores full grid', doc.querySelectorAll('.ex-card').length === expertsOnly().length)

  /* ---------- 5. 搜索：实时过滤 + 诚实空态 ---------- */
  input(w, doc.querySelector('#ex-search-input'), '审核')
  await tick()
  check('search filters by name/desc/tags',
    doc.querySelectorAll('.ex-card').length >= 1
    && [...doc.querySelectorAll('.ex-card-name')].some((n) => n.textContent.includes('质量审核专家')))
  input(w, doc.querySelector('#ex-search-input'), 'no-such-expert-xyz')
  await tick()
  check('no-match shows honest empty state',
    !!doc.querySelector('.ex-empty') && doc.querySelectorAll('.ex-card').length === 0)
  input(w, doc.querySelector('#ex-search-input'), '')
  await tick()
  check('clearing search restores cards', doc.querySelectorAll('.ex-card').length === expertsOnly().length)

  /* ---------- 6. 卡片固定：真实持久化 + 我的专家 ---------- */
  const pinId = 'ec-web-prototype'
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
  const pinnedCount = readState(storage).experts.filter((e) => e.pinned).length
  check('my-experts toggle filters to pinned only',
    doc.querySelector('[data-mine]').classList.contains('is-active')
    && doc.querySelectorAll('.ex-card').length === pinnedCount
    && doc.querySelector(`.ex-card[data-expert="${pinId}"]`) !== null)
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
  const py = EXPERT_CATALOG.find((e) => e.id === 'ec-ppt')

  await openCard('ec-ppt')
  check('clicking an expert card opens the detail drawer',
    !!drawer()?.querySelector('.ex-drawer[role="dialog"]'))
  check('drawer is portalled to body, above the page', drawer()?.parentElement === doc.body)
  check('drawer header shows expert name and persona',
    drawer().querySelector('.ex-drawer-name')?.textContent === py.name
    && drawer().querySelector('.ex-drawer-persona')?.textContent === py.persona
    && drawer().querySelector('.ex-drawer-title i')?.textContent === '|')
  check('drawer reuses the same portrait avatar',
    drawer().querySelector('.ex-drawer-head .expert-avatar img')?.getAttribute('src')
      === `/avatars/${py.id}.webp`)
  check('drawer offers the summon button',
    drawer().querySelector('[data-summon]')?.textContent.trim() === '召唤')
  check('drawer shows the full description',
    drawer().querySelector('.ex-drawer-desc')?.textContent === py.desc)
  check('drawer lists every ability tag',
    [...drawer().querySelectorAll('.ex-drawer-tags .ex-tag')].map((t) => t.textContent).join() === py.tags.join())
  check('drawer lists what this expert solves',
    [...drawer().querySelectorAll('.ex-solve')].map((l) => l.textContent.trim()).join('\u0000') === py.solves.join('\u0000'))
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
  check('drawer lists the expert skill set',
    drawer().querySelectorAll('.ex-skill-chip').length === (py.skills ?? []).length
    && [...drawer().querySelectorAll('.ex-skill-chip')].map((c) => c.textContent).join() === py.skills.join())
  check('drawer sections cover run, solves, help, skills and more', (() => {
    const heads = [...drawer().querySelectorAll('.ex-drawer-sec-title')].map((t) => t.textContent.replace(/\s+/g, ''))
    return heads.length === 5
      && heads[0].startsWith('直接开工')
      && heads[1] === '它能解决'
      && heads[2] === '专家帮你做'
      && heads[3] === '技能清单'
      && heads[4] === '更多'
  })())
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

  await openCard('ec-ppt')
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
  check('Escape dismisses the drawer', !drawer())

  await openCard('ec-ppt')
  click(w, drawer())
  await tick()
  check('clicking the scrim dismisses the drawer', !drawer())

  await openCard('ec-web-prototype')
  check('opening another expert swaps the drawer content',
    drawer()?.querySelector('.ex-drawer-name')?.textContent === '网页原型工程师')

  click(w, doc.querySelector('[data-summon]'))
  await tick()
  const summoned = JSON.parse(storage.getItem('design-buddy-summon-v1') ?? 'null')
  check('summon closes the drawer', !drawer())
  check('summon hands the expert over to the home page',
    summoned?.name === '网页原型工程师' && summoned?.prompt === '')
  /* 过场：先在原地显示「正在召唤专家」，再进首页 */
  const summonMask = doc.querySelector('.ex-summon-mask')
  check('summon shows a loading screen before leaving',
    !!summonMask && summonMask.parentElement === doc.body)
  check('loading screen says it is summoning the expert',
    summonMask?.querySelector('.ex-summon-title')?.textContent === '正在召唤专家'
    && summonMask?.querySelector('.ex-summon-name')?.textContent === '网页原型工程师 · 方野')
  check('loading screen shows the expert portrait',
    summonMask?.querySelector('.ex-summon-portrait')?.getAttribute('src') === '/avatars/ec-web-prototype.webp')
  check('loading screen stays up while it runs',
    !!doc.querySelector('.ex-summon-mask') && !doc.querySelector('.ex-drawer-mask'))
  check('loading screen contract in built CSS',
    cssCompact.includes('.ex-summon-mask{position:fixed;top:0;right:0;bottom:0;left:0;z-index:110')
    && cssCompact.includes('.ex-summon-orbit{')
    && cssCompact.includes('animation:ex-mask-in.18sease'))
  summonMask.remove()
  storage.removeItem('design-buddy-summon-v1')

  await openCard('ec-content')
  const boardPrompt = EXPERT_CATALOG.find((e) => e.id === 'ec-content').prompts[0]
  click(w, doc.querySelector('.ex-prompt'))
  await tick()
  const withPrompt = JSON.parse(storage.getItem('design-buddy-summon-v1') ?? 'null')
  check('a prompt row carries its text to the home page',
    withPrompt?.name === '内容优化专家' && withPrompt?.prompt === boardPrompt && !drawer())
  check('a prompt row also runs the summon loading screen',
    !!doc.querySelector('.ex-summon-mask'))
  doc.querySelector('.ex-summon-mask')?.remove()
  storage.removeItem('design-buddy-summon-v1')

  await openCard('ec-content')
  click(w, doc.querySelector('[data-copy-id]'))
  await tick()
  check('copying the id surfaces feedback',
    doc.querySelector('#toast')?.textContent.includes('ID'))
  click(w, doc.querySelector('[data-drawer-close]'))
  await tick()

  // 质量审核专家不在默认种子里，固定状态只能来自这次点击
  const unmutedId = 'ec-qa'
  const unmutedName = EXPERT_CATALOG.find((e) => e.id === unmutedId).name
  click(w, doc.querySelector(`[data-pin="${unmutedId}"]`))
  await tick()
  check('pin button never opens the drawer',
    !drawer() && readState(storage).experts.find((e) => e.name === unmutedName)?.pinned === true)
  click(w, doc.querySelector(`[data-pin="${unmutedId}"]`))
  await tick()
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
    pop?.hidden === false && doc.body.contains(pop) && pop.querySelectorAll('[data-more]').length === 4)
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
  storage.setItem('design-buddy-summon-v1', JSON.stringify({ name: '网页原型工程师', prompt: '做一个 B 端产品的落地页原型' }))
  const home = await loadPage('/index.html', { storage, freshCopy: true })
  check('home prefills the summoned prompt',
    home.doc.querySelector('#prompt-input')?.value === '做一个 B 端产品的落地页原型')
  /* 输入框工具栏左侧：+ / 专家胶囊（第二项，参数按钮已移除） */
  const left = home.doc.querySelector('.toolbar-left')
  const chip = home.doc.querySelector('#prompt-expert')
  check('summoned expert sits in the prompt toolbar',
    !!chip && left.children[1] === chip)
  check('the expert chip names the summoned expert',
    chip.querySelector('.prompt-expert-name')?.textContent === '网页原型工程师'
    && chip.querySelector('img.prompt-expert-avatar')?.getAttribute('src') === '/avatars/ec-web-prototype.webp')
  check('the expert chip explains itself on hover',
    chip.title.includes('网页原型工程师') && chip.getAttribute('aria-label')?.includes('网页原型工程师'))
  check('the expert chip animates in when summoned',
    chip.classList.contains('is-arriving'))
  click(home.w, chip)
  await tick()
  check('dismissing the chip clears the expert and hides it',
    !home.doc.querySelector('#prompt-expert') && readState(storage).ui?.expert === null)
  check('dismissing the chip is announced',
    home.doc.querySelector('#toast')?.textContent.includes('已取消召唤'))

  // 没有肖像的专家：第二项显示首字 + 渐变底（而不是头像图片）
  storage.setItem('design-buddy-summon-v1', JSON.stringify({ name: '特邀顾问', prompt: '' }))
  const home2 = await loadPage('/index.html', { storage, freshCopy: true })
  const chip2 = home2.doc.querySelector('#prompt-expert')
  check('experts without a portrait render initials in the toolbar chip',
    chip2?.querySelector('.prompt-expert-avatar.is-initial')?.textContent === '特'
    && !chip2.querySelector('img.prompt-expert-avatar')
    && chip2.querySelector('.prompt-expert-name')?.textContent === '特邀顾问'
    && home2.doc.querySelector('.toolbar-left').children[1] === chip2)
  check('toolbar chip contract in built CSS',
    cssCompact.includes('.prompt-expert{display:inline-flex;align-items:center;gap:7px;height:36px')
    && cssCompact.includes('.prompt-expert-avatar{width:26px;height:26px')
    && cssCompact.includes('animation:prompt-expert-arrive1.4sease'))
  check('home announces the summoned expert',
    home.doc.querySelector('#toast')?.textContent.includes('网页原型工程师'))
  check('summon payload is one-shot and cleared on arrival',
    storage.getItem('design-buddy-summon-v1') === null)
  check('home handles the summon without errors', home.errors.length === 0, home.errors)

  // 「+」菜单的专家子列表用同一套肖像，名字对不上目录的旧数据保持首字
  click(home.w, home.doc.querySelector('#add-menu-btn'))
  await tick()
  const homeExperts = [...home.doc.querySelectorAll('.expert-item')]
  check('home expert menu reuses the portrait avatars',
    homeExperts.filter((i) => i.querySelector('.expert-avatar img')).length >= 1
    && homeExperts.filter((i) => i.querySelector('.expert-avatar img'))
      .every((i) => /^\/avatars\/ec-[a-z-]+\.webp$/.test(i.querySelector('img').getAttribute('src'))))
  check('home expert menu keeps initials for unmatched names',
    homeExperts.filter((i) => !i.querySelector('.expert-avatar img'))
      .every((i) => i.querySelector('.expert-avatar').textContent.trim().length === 1))
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} EXPERTS CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
