/* ============================================================
   技能页（skills.html）：截图式发现区 + 首页同款左侧窄栏
   栏目 / 顶栏操作 / 精选换一批 / 来源 tab / 筛选 / 搜索 /
   悬浮信息卡 / 精选安装（信任门控）/ 已安装视图（启停·版本·更新）
   注册表安装与自动更新的深度契约在 verify-settings-real 中覆盖
   ============================================================ */

import fs from 'node:fs'
import path from 'node:path'
import { loadPage, click, input, tick, readState, DIST } from './helpers.mjs'
import { SKILL_REGISTRY, hasUpdate, registryEntry, SEED_SKILL_VERSION } from '../src/skill-registry.js'
import { PAGE_SKILLS, FEATURED_SKILLS, FEATURED_SIZE, SKILL_FILTERS } from '../src/skills-catalog.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

/* 产物 CSS 契约：截图布局的关键数值，防止后续改动悄悄退回旧观感 */
const cssCompact = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n')
  .replace(/\s+/g, '')
const layoutOk = cssCompact.includes('.skills-page{flex:1;min-width:0')
  && cssCompact.includes('.skills-page.sk-feature-track{display:grid;grid-template-columns:repeat(5,minmax(0,1fr))')
  && cssCompact.includes('.skills-page.sk-grid{grid-template-columns:repeat(5,minmax(0,1fr))')

const { doc, w, errors, storage } = await loadPage('/skills.html', { freshCopy: true })
const modal = () => doc.querySelector('.modal-box')
const grid = () => doc.querySelectorAll('#sk-grid .sk-card')
const confirmBox = () => [...doc.querySelectorAll('.modal-box')].find((m) => m.textContent.includes('手动安装') || m.textContent.includes('高风险'))

/* ---------- 1. 页面骨架：左侧窄栏 + 顶部页签 + 操作区 ---------- */
check('skills page loads without errors', errors.length === 0, errors)
check('screenshot layout contract holds in built CSS', layoutOk)
check('keeps the homepage rail (vertical icon column)',
  [...doc.querySelectorAll('.rail .rail-item span')].map((s) => s.textContent).join() === '首页,媒体,模板,案例,主题,设置,更多')
check('only the more entry is active in the rail',
  [...doc.querySelectorAll('.rail .rail-item-active')].length === 1
  && doc.querySelector('.rail .more-wrap .rail-item').classList.contains('rail-item-active'))
check('themes entry is not marked active on the skills page',
  !doc.querySelector('.rail a[href="themes.html"]').classList.contains('rail-item-active')
  && !doc.querySelector('.rail a[href="themes.html"]').hasAttribute('aria-current'))
check('top tabs are 专家 / 技能 / 连接器',
  [...doc.querySelectorAll('.ex-top-tab')].map((t) => t.textContent.trim()).join() === '专家,技能,连接器')
check('skills tab is the active page link',
  doc.querySelector('.ex-top-tab.is-active')?.getAttribute('href') === 'skills.html')
check('experts tab links to the experts page',
  doc.querySelector('.ex-top-tab').getAttribute('href') === 'experts.html')
check('search box present', !!doc.querySelector('#sk-search-input'))
check('installed count button present',
  doc.querySelector('[data-installed-toggle]')?.textContent.includes(`已安装(${readState(storage).skills.length})`))
check('add-skill button present', !!doc.querySelector('[data-add-skill]'))

/* ---------- 2. 精选技能 5 张 + 换一批 ---------- */
check('section head shows 精选技能 and 换一批',
  doc.querySelector('#sk-section-head')?.textContent.includes('精选技能')
  && !!doc.querySelector('#sk-section-head [data-shuffle]'))
check('featured row shows fixed-size slice', doc.querySelectorAll('.sk-feature-card').length === FEATURED_SIZE)
const featuredBefore = [...doc.querySelectorAll('.sk-feature-card')].map((c) => c.dataset.featureCard)
click(w, doc.querySelector('[data-shuffle]'))
await tick()
const featuredAfter = [...doc.querySelectorAll('.sk-feature-card')].map((c) => c.dataset.featureCard)
check('shuffle rotates featured set', JSON.stringify(featuredBefore) !== JSON.stringify(featuredAfter))
check('shuffle stays inside featured pool',
  featuredAfter.length === FEATURED_SIZE && featuredAfter.every((id) => FEATURED_SKILLS.some((f) => f.id === id)))

/* ---------- 3. 网格：注册表在前 + 补充目录 ---------- */
check('recommend tab lists registry + catalog skills', grid().length === PAGE_SKILLS.length)
check('builtin skill cards show their expert',
  doc.querySelectorAll('#sk-grid .sk-expert').length === PAGE_SKILLS.filter((s) => s.expertName).length
  && [...doc.querySelectorAll('#sk-grid .sk-expert')].every((e) => e.textContent.includes('所属专家：')))
const installedCount = readState(storage).skills.length
check('data-install buttons equal uninstalled catalog count',
  doc.querySelectorAll('#sk-grid [data-install]').length === PAGE_SKILLS.length - installedCount)
check('review-risk cards carry high-risk badge',
  doc.querySelectorAll('#sk-grid .ex-badge').length === PAGE_SKILLS.filter((s) => s.risk === 'review').length)
check('all filter chips rendered', doc.querySelectorAll('[data-sk-chip]').length === SKILL_FILTERS.length)
check('hover popover shows device / space / update time',
  (() => {
    const pop = doc.querySelector('.sk-pop')
    return pop?.querySelectorAll('.sk-pop-row').length === 3
      && pop.textContent.includes('本地电脑')
      && pop.textContent.includes('所属空间')
      && pop.textContent.includes('更新于')
  })())

/* ---------- 4. 来源 tab / 分类 chip / 搜索 ---------- */
click(w, doc.querySelector('[data-source="skillhub"]'))
await tick()
check('skillhub tab filters by source',
  grid().length === PAGE_SKILLS.filter((s) => s.source === 'skillhub').length)
click(w, doc.querySelector('[data-source="suite"]'))
await tick()
check('suite tab filters by source',
  grid().length === PAGE_SKILLS.filter((s) => s.source === 'suite').length)
click(w, doc.querySelector('[data-source="recommend"]'))
await tick()
click(w, doc.querySelector('[data-sk-chip="提案演示"]'))
await tick()
const deckCount = PAGE_SKILLS.filter((s) => s.category === '提案演示').length
check('category chip filters grid', grid().length === deckCount && deckCount > 0)
click(w, doc.querySelector('[data-sk-chip="网站原型"]'))
await tick()
check('category chip narrows to the category subset',
  grid().length === PAGE_SKILLS.filter((s) => s.category === '网站原型').length
  && grid().length < PAGE_SKILLS.length)
click(w, doc.querySelector('[data-sk-chip="全部"]'))
await tick()
input(w, doc.querySelector('#sk-search-input'), '邮件撰写')
await tick()
check('search filters by name',
  grid().length === 1 && doc.querySelector('#sk-grid .sk-card-title')?.textContent.includes('邮件撰写助手'))
input(w, doc.querySelector('#sk-search-input'), 'no-such-skill-zzz')
await tick()
check('search empty state', !!doc.querySelector('.ex-empty'))
input(w, doc.querySelector('#sk-search-input'), '')
await tick()

/* ---------- 5. 精选技能安装：未信任 → 手动确认 → 真实持久化 ---------- */
const featuredBtn = doc.querySelector('[data-featured-install]')
const featuredName = FEATURED_SKILLS.find((f) => f.id === featuredBtn.dataset.featuredInstall).name
click(w, featuredBtn)
await tick()
check('featured install requires confirmation when untrusted', !!confirmBox())
click(w, confirmBox().querySelector('[data-act="ok"]'))
await tick()
check('featured skill persisted to store',
  readState(storage).skills.some((s) => s.name === featuredName))
check('featured plus flips to installed check',
  !!doc.querySelector(`[data-feature-card="${featuredBtn.dataset.featuredInstall}"] .sk-plus.is-installed`))
check('installed count button increments',
  doc.querySelector('[data-installed-toggle]')?.textContent.includes(`已安装(${installedCount + 1})`))

/* ---------- 6. 已安装视图：启停 / 版本 / 检查更新 ---------- */
click(w, doc.querySelector('[data-installed-toggle]'))
await tick()
const installedNow = readState(storage).skills.length
check('installed-only view lists installed skills',
  grid().length === installedNow && doc.querySelectorAll('#sk-grid .sk-plus.is-installed').length === installedNow)
check('installed view exposes enable switches',
  doc.querySelectorAll('#sk-grid [data-sk]').length === installedNow)
check('installed view exposes check-update button', !!doc.querySelector('[data-check-update]'))

const firstSwitch = doc.querySelector('#sk-grid [data-sk]')
const beforeEnabled = readState(storage).skills.find((s) => s.id === firstSwitch.dataset.sk)?.enabled
click(w, firstSwitch)
await tick()
const afterEnabled = readState(storage).skills.find((s) => s.id === firstSwitch.dataset.sk)?.enabled
check('untrusted switch blocked and hinted', beforeEnabled === afterEnabled
  && [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('信任技能')))

click(w, doc.querySelector('[data-check-update]'))
await tick()
check('check update reports up-to-date',
  [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('最新版本')))

click(w, doc.querySelector('[data-installed-toggle]'))
await tick()
check('installed-only toggle restores discovery grid', grid().length === PAGE_SKILLS.length)

/* ---------- 7. 自定义技能：prompt + 确认后真实入库 ---------- */
globalThis.prompt = () => '我的自定义技能'
click(w, doc.querySelector('[data-add-skill]'))
await tick()
check('custom skill prompts then asks install confirmation', !!confirmBox())
click(w, confirmBox().querySelector('[data-act="ok"]'))
await tick()
check('custom skill persisted',
  readState(storage).skills.some((s) => s.name === '我的自定义技能'))
click(w, doc.querySelector('[data-installed-toggle]'))
await tick()
check('custom skill appears in installed view',
  [...doc.querySelectorAll('#sk-grid .sk-card-title')].some((p) => p.textContent.includes('我的自定义技能')))
click(w, doc.querySelector('[data-installed-toggle]'))
await tick()
delete globalThis.prompt

/* ---------- 8. 连接器页签是页面链接 ---------- */
check('connectors tab links to the connectors page',
  doc.querySelector('.ex-top-tab[href="connectors.html"]') !== null)
check('no leftover modal entry on the skills page', !doc.querySelector('[data-open]'))

check('skills page flow: no runtime errors', errors.length === 0, JSON.stringify(errors))

/* ---------- 9. 入口：窄栏「更多 → 技能」离开弹窗形态 ---------- */
{
  const home = await loadPage('/index.html', { freshCopy: true })
  click(home.w, home.doc.querySelector('.more-wrap .rail-item'))
  await tick()
  click(home.w, home.doc.querySelector('[data-more="技能"]'))
  await tick()
  check('skills entry closes flyout and opens no modal',
    home.doc.querySelector('.more-pop').hidden === true && !home.doc.querySelector('.modal-mask'))
  check('skills entry keeps home error-free', home.errors.length === 0, home.errors)
}

/* ---------- 10. 信任开启后：开关真实生效 + 手动更新路径 ---------- */
{
  const seed = await loadPage('/skills.html')
  const st = readState(seed.storage)
  st.settings.trustedSkills = true
  st.settings.skillAutoUpdate = false
  // 制造一个「可更新」的技能：把第一条压回 1.0.0
  const reg = registryEntry(st.skills[0].name)
  st.skills[0].version = '1.0.0'
  seed.storage.setItem('design-buddy-state-v1', JSON.stringify(st))

  const page = await loadPage('/skills.html', { storage: seed.storage, freshCopy: true })
  check('paused auto-update keeps page error-free', page.errors.length === 0, page.errors)
  click(page.w, page.doc.querySelector('[data-installed-toggle]'))
  await tick()
  const v0 = readState(page.storage).skills[0].version
  check('outdated skill still at old version before manual update',
    reg ? v0 === '1.0.0' : v0 === '1.0.0')
  check('update pill visible when outdated', !!page.doc.querySelector('.update-pill'))
  check('manual update button available', !!page.doc.querySelector('[data-update-sk]'))

  const sw = page.doc.querySelector('#sk-grid [data-sk]')
  const beforeOn = readState(page.storage).skills.find((s) => s.id === sw.dataset.sk)?.enabled
  click(page.w, sw)
  await tick()
  check('trusted switch toggles persisted state',
    readState(page.storage).skills.find((s) => s.id === sw.dataset.sk)?.enabled === !beforeOn)

  click(page.w, page.doc.querySelector('[data-update-sk]'))
  await tick()
  check('manual update bumps version', readState(page.storage).skills[0].version !== '1.0.0')
  check('update applies registry version',
    registryEntry(readState(page.storage).skills[0].name)?.version === readState(page.storage).skills[0].version)
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} SKILLS CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
