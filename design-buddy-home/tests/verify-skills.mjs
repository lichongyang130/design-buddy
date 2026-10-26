/* ============================================================
   技能弹窗：左侧已安装管理（信任门控/更新契约）+ 右侧截图式发现区
   双栏布局 / 精选换一批 / 来源 tab / 筛选 / 搜索 / 悬浮信息卡 /
   精选安装 / 已安装视图 / 自定义技能 / 三弹窗切换
   注册表安装与自动更新的深度契约在 verify-settings-real 中覆盖
   ============================================================ */

import { loadPage, click, input, tick, readState } from './helpers.mjs'
import { SKILL_REGISTRY } from '../src/skill-registry.js'
import { DISCOVERY_SKILLS, FEATURED_SKILLS, FEATURED_SIZE, SKILL_FILTERS } from '../src/skills-catalog.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const { doc, w, errors, storage } = await loadPage('/index.html')
check('skills page loads without errors', errors.length === 0, errors)

const openSkills = async () => {
  click(w, doc.querySelector('.more-wrap .rail-item'))
  await tick()
  click(w, doc.querySelector('[data-more="技能"]'))
  await tick()
}
await openSkills()
const modal = () => doc.querySelector('.modal-box.modal-skills')

/* ---------- 1. 双栏骨架与左侧管理契约 ---------- */
check('skills modal uses extra-wide two-pane layout',
  !!modal() && !!modal().querySelector('#skills-root') && !!modal().querySelector('.experts-main'))
check('left pane lists 4 installed skill switches',
  modal().querySelectorAll('#skills-root [data-sk]').length === 4)
check('left pane has manual check-update button', !!modal().querySelector('[data-check-update]'))
check('right top shows installed count button',
  modal().querySelector('[data-installed-toggle]')?.textContent.includes('已安装(4)'))
check('right keeps installable section wording', modal().textContent.includes('可安装'))

/* ---------- 2. 精选技能 + 换一批 ---------- */
check('featured row shows fixed-size slice',
  modal().querySelectorAll('.sk-feature-card').length === FEATURED_SIZE)
const featuredBefore = [...modal().querySelectorAll('.sk-feature-card')].map((c) => c.dataset.featureCard)
click(w, modal().querySelector('[data-shuffle]'))
await tick()
const featuredAfter = [...modal().querySelectorAll('.sk-feature-card')].map((c) => c.dataset.featureCard)
check('shuffle rotates featured set', JSON.stringify(featuredBefore) !== JSON.stringify(featuredAfter))
check('shuffle stays inside featured pool', featuredAfter.every((id) => FEATURED_SKILLS.some((f) => f.id === id)))

/* ---------- 3. 网格：注册表事实源 + data-install 契约 ---------- */
check('recommend tab lists all registry entries',
  modal().querySelectorAll('#sk-grid .sk-card').length === DISCOVERY_SKILLS.length)
const uninstalled = SKILL_REGISTRY.length - 4
check('data-install buttons equal uninstalled registry count',
  modal().querySelectorAll('[data-install]').length === uninstalled)
check('review-risk cards carry high-risk badge',
  modal().querySelectorAll('#sk-grid .ex-badge').length === SKILL_REGISTRY.filter((r) => r.risk === 'review').length)
check('all filter chips rendered', modal().querySelectorAll('[data-sk-chip]').length === SKILL_FILTERS.length)
check('hover popover shows space and update time',
  modal().querySelector('.sk-pop')?.textContent.includes('所属空间')
  && modal().querySelector('.sk-pop')?.textContent.includes('更新于'))

/* ---------- 4. 来源 tab / 分类 chip / 搜索 ---------- */
click(w, modal().querySelector('[data-source="skillhub"]'))
await tick()
const skillhubCount = DISCOVERY_SKILLS.filter((s) => s.source === 'skillhub').length
check('skillhub tab filters by source', modal().querySelectorAll('#sk-grid .sk-card').length === skillhubCount)
click(w, modal().querySelector('[data-source="suite"]'))
await tick()
const suiteCount = DISCOVERY_SKILLS.filter((s) => s.source === 'suite').length
check('suite tab filters by source', modal().querySelectorAll('#sk-grid .sk-card').length === suiteCount)
click(w, modal().querySelector('[data-source="recommend"]'))
await tick()
click(w, modal().querySelector('[data-sk-chip="内容创作"]'))
await tick()
const catCount = DISCOVERY_SKILLS.filter((s) => s.category === '内容创作').length
check('category chip filters grid', modal().querySelectorAll('#sk-grid .sk-card').length === catCount && catCount === 2)
click(w, modal().querySelector('[data-sk-chip="健康医疗"]'))
await tick()
check('no-match category shows honest empty state',
  !!modal().querySelector('.ex-empty') && modal().querySelectorAll('#sk-grid .sk-card').length === 0)
click(w, modal().querySelector('[data-sk-chip="全部"]'))
await tick()
input(w, modal().querySelector('#sk-search-input'), '邮件')
await tick()
check('search filters by name',
  modal().querySelectorAll('#sk-grid .sk-card').length === 1
  && modal().querySelector('#sk-grid .sk-card-title')?.textContent.includes('邮件撰写助手'))
input(w, modal().querySelector('#sk-search-input'), 'no-such-skill-zzz')
await tick()
check('search empty state', !!modal().querySelector('.ex-empty'))
input(w, modal().querySelector('#sk-search-input'), '')
await tick()

/* ---------- 5. 精选技能安装（未信任 → 手动确认 → 真实持久化） ---------- */
const featuredBtn = modal().querySelector('[data-featured-install]')
const featuredName = FEATURED_SKILLS.find((f) => f.id === featuredBtn.dataset.featuredInstall).name
click(w, featuredBtn)
await tick()
let confirmBox = [...doc.querySelectorAll('.modal-box')].find((m) => m.textContent.includes('手动安装'))
check('featured install requires confirmation when untrusted', !!confirmBox)
click(w, confirmBox.querySelector('[data-act="ok"]'))
await tick()
check('featured skill persisted to store',
  readState(storage).skills.some((s) => s.name === featuredName))
check('featured plus flips to installed check',
  !!modal().querySelector(`[data-feature-card="${featuredBtn.dataset.featuredInstall}"] .sk-plus.is-installed`))
check('installed count button increments',
  modal().querySelector('[data-installed-toggle]')?.textContent.includes('已安装(5)'))

/* ---------- 6. 已安装视图 ---------- */
click(w, modal().querySelector('[data-installed-toggle]'))
await tick()
check('installed-only view shows installed skills',
  modal().querySelectorAll('#sk-grid .sk-card').length === 5
  && modal().querySelectorAll('#sk-grid .sk-plus.is-installed').length === 5)
click(w, modal().querySelector('[data-installed-toggle]'))
await tick()
check('installed-only toggle restores discovery grid',
  modal().querySelectorAll('#sk-grid .sk-card').length === DISCOVERY_SKILLS.length)

/* ---------- 7. 自定义技能：prompt + 确认后真实入库 ---------- */
globalThis.prompt = () => '我的自定义技能'
click(w, modal().querySelector('[data-add-skill]'))
await tick()
confirmBox = [...doc.querySelectorAll('.modal-box')].find((m) => m.textContent.includes('手动安装'))
check('custom skill prompts then asks install confirmation', !!confirmBox)
click(w, confirmBox.querySelector('[data-act="ok"]'))
await tick()
check('custom skill persisted',
  readState(storage).skills.some((s) => s.name === '我的自定义技能'))
check('custom skill appears in left management',
  [...modal().querySelectorAll('#skills-root .primary')].some((p) => p.textContent.includes('我的自定义技能')))
delete globalThis.prompt

/* ---------- 8. 左侧信任门控 + 检查更新 ---------- */
const firstSwitch = modal().querySelector('#skills-root [data-sk]')
const before = readState(storage).skills.find((s) => s.id === firstSwitch.dataset.sk)?.enabled
click(w, firstSwitch)
await tick()
const after = readState(storage).skills.find((s) => s.id === firstSwitch.dataset.sk)?.enabled
check('untrusted switch blocked and hinted', before === after
  && [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('信任技能')))
click(w, modal().querySelector('[data-check-update]'))
await tick()
check('check update reports up-to-date',
  [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('最新版本')))

/* ---------- 9. 顶部三弹窗切换 + 关闭 ---------- */
click(w, modal().querySelector('[data-open="experts"]'))
await tick()
check('experts tab leaves for the experts page',
  !doc.querySelector('.modal-skills') && !doc.querySelector('.modal-mask'))
await openSkills()
click(w, modal().querySelector('[data-open="connectors"]'))
await tick()
check('connectors tab opens connectors modal',
  doc.body.textContent.includes('Google Drive') && !doc.querySelector('.modal-skills'))
click(w, doc.querySelector('.modal-close'))
await tick()
await openSkills()
click(w, doc.querySelector('.modal-close'))
await tick()
check('modal close works', !doc.querySelector('.modal-mask'))

check('skills flow: no runtime errors', errors.length === 0, JSON.stringify(errors))

console.log(`\n${fails.length === 0 ? `ALL ${passed} SKILLS CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
