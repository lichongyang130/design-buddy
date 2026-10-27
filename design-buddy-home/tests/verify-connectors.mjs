/* ============================================================
   连接器页（connectors.html）：截图式目录 + 首页同款左侧窄栏
   栏目 / 搜索 / 连接与断开持久化 / 自定义连接器 / 空态 / 入口
   ============================================================ */

import fs from 'node:fs'
import path from 'node:path'
import { loadPage, click, input, tick, readState, DIST } from './helpers.mjs'
import { CONNECTOR_CATALOG, CONNECTOR_ICONS } from '../src/connectors-catalog.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

/* 产物 CSS 契约：5 列栅格与卡片尺寸，防止改动静默退形 */
const cssCompact = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n')
  .replace(/\s+/g, '')
const layoutOk = cssCompact.includes('.connectors-page{flex:1;min-width:0')
  && cssCompact.includes('.cn-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr))')
  && cssCompact.includes('.cn-card{display:flex;align-items:flex-start')
  && cssCompact.includes('.cn-logo{width:44px;height:44px')
  && cssCompact.includes('color:#fff;background:var(--c)')

const { doc, w, errors, storage } = await loadPage('/connectors.html', { freshCopy: true })
const cards = () => [...doc.querySelectorAll('.cn-card')]
const cardNames = () => cards().map((c) => c.dataset.cnName)

/* ---------- 1. 页面骨架 ---------- */
check('connectors page loads without errors', errors.length === 0, errors)
check('screenshot layout contract holds in built CSS', layoutOk)
check('keeps the homepage rail (vertical icon column)',
  [...doc.querySelectorAll('.rail .rail-item span')].map((s) => s.textContent).join() === '首页,媒体,模板,主题,设置,更多')
check('only the more entry is active in the rail',
  [...doc.querySelectorAll('.rail .rail-item-active')].length === 1
  && doc.querySelector('.rail .more-wrap .rail-item').classList.contains('rail-item-active'))
check('themes entry is not marked active on the connectors page',
  !doc.querySelector('.rail a[href="themes.html"]').classList.contains('rail-item-active')
  && !doc.querySelector('.rail a[href="themes.html"]').hasAttribute('aria-current'))
check('top tabs are 专家 / 技能 / 连接器',
  [...doc.querySelectorAll('.ex-top-tab')].map((t) => t.textContent.trim()).join() === '专家,技能,连接器')
check('connectors tab is the active page link',
  doc.querySelector('.ex-top-tab.is-active')?.getAttribute('href') === 'connectors.html')
check('experts and skills tabs link to their pages',
  doc.querySelector('.ex-top-tab[href="experts.html"]') !== null
  && doc.querySelector('.ex-top-tab[href="skills.html"]') !== null)
check('search box present', !!doc.querySelector('#cn-search-input'))
check('custom connector button present',
  doc.querySelector('[data-custom]')?.textContent.trim() === '自定义连接器')
check('custom connector button carries a pencil icon',
  doc.querySelector('[data-custom] svg path[d^="M16.5 3.5"]') !== null)

/* ---------- 2. 目录与卡片 ---------- */
check('catalog has 40 connectors', CONNECTOR_CATALOG.length === 40)
check('every catalog entry has a known icon shape',
  CONNECTOR_CATALOG.every((c) => !!CONNECTOR_ICONS[c.shape]))
check('every catalog entry has a brand color',
  CONNECTOR_CATALOG.every((c) => /^#[0-9a-f]{6}$/i.test(c.color)))
check('brand colors stay dark enough for a white icon', (() => {
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16)
    const ch = [n >> 16 & 255, n >> 8 & 255, n & 255].map((v) => {
      const x = v / 255
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
  }
  return CONNECTOR_CATALOG.every((c) => 1.05 / (lum(c.color) + 0.05) >= 3)
})())
check('grid renders catalog plus persisted extras',
  cards().length === CONNECTOR_CATALOG.length + 1)
check('catalog order matches the screenshot start',
  cardNames().slice(0, 5).join() === '通达信,腾讯自选股,QQ邮箱,ima,乐享知识库')
check('catalog order matches the screenshot end',
  cardNames().slice(-6, -1).join() === '中兴新云AI智报,腾讯营销投放,恒生聚源 MCP,腾讯地图,启信慧眼')
check('extra (already connected, not in catalog) card goes last',
  cardNames().at(-1) === 'Google Drive')
check('unconnected cards show a plus button',
  doc.querySelector('[data-cn-name="通达信"] .cn-plus')?.textContent === '+')
check('seeded connected connectors show a check',
  ['GitHub', 'Google Drive'].every((n) =>
    doc.querySelector(`[data-cn-name="${n}"] .cn-plus`)?.textContent === '✓'))
check('card carries name and one-line description',
  (() => {
    const c = doc.querySelector('[data-cn-name="腾讯文档"]')
    return c.querySelector('.cn-name').textContent === '腾讯文档'
      && c.querySelector('.cn-desc').textContent.includes('腾讯文档')
  })())
check('logo paints with its own brand color',
  doc.querySelector('[data-cn-name="通达信"] .cn-logo')?.getAttribute('style').includes('#e0362f'))

/* ---------- 3. 搜索 ---------- */
input(w, doc.querySelector('#cn-search-input'), '法律')
await tick()
check('search filters by name/desc/category',
  cardNames().join() === '北大法宝·法律智能检索,华宇元典法律数据')
input(w, doc.querySelector('#cn-search-input'), 'no-such-connector-zzz')
await tick()
check('no-match shows honest empty state',
  !!doc.querySelector('.cn-empty') && cards().length === 0)
input(w, doc.querySelector('#cn-search-input'), '')
await tick()
check('clearing search restores grid', cards().length === CONNECTOR_CATALOG.length + 1)

/* ---------- 4. 连接 / 断开 ---------- */
click(w, doc.querySelector('[data-cn-name="通达信"] [data-cn-toggle]'))
await tick()
// 现在会弹出连接确认弹窗，需要点击"连接"按钮
const connectModal = doc.querySelector('.modal-mask')
if (connectModal) {
  click(w, connectModal.querySelector('[data-connect]'))
  await tick()
}
check('clicking + connects and persists',
  readState(storage).connectors.find((c) => c.name === '通达信')?.connected === true)
check('connected card flips to check and keeps details',
  doc.querySelector('[data-cn-name="通达信"]').classList.contains('is-connected')
  && doc.querySelector('[data-cn-name="通达信"] .cn-plus').textContent === '✓'
  && !!doc.querySelector('[data-cn-name="通达信"] .cn-desc').textContent.trim())
check('connect toast shown',
  [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('通达信 已连接')))

click(w, doc.querySelector('[data-cn-name="通达信"] [data-cn-toggle]'))
await tick()
check('clicking again disconnects', readState(storage).connectors.find((c) => c.name === '通达信')?.connected === false)
check('disconnected card returns to plus',
  doc.querySelector('[data-cn-name="通达信"] .cn-plus').textContent === '+'
  && !doc.querySelector('[data-cn-name="通达信"]').classList.contains('is-connected'))

click(w, doc.querySelector('[data-cn-name="GitHub"] [data-cn-toggle]'))
await tick()
// GitHub 已连接，点击应该直接断开（不需要弹窗）
check('disconnecting a seeded connector persists',
  readState(storage).connectors.find((c) => c.name === 'GitHub')?.connected === false)
click(w, doc.querySelector('[data-cn-name="GitHub"] [data-cn-toggle]'))
await tick()
// 再次点击应该弹出连接弹窗
const ghModal = doc.querySelector('.modal-mask')
if (ghModal) {
  click(w, ghModal.querySelector('[data-connect]'))
  await tick()
}

/* ---------- 5. 自定义连接器：表单 → 持久化 → 出现在列表 ---------- */
click(w, doc.querySelector('[data-custom]'))
await tick()
check('custom connector opens a form modal',
  !!doc.querySelector('.modal-mask') && !!doc.querySelector('#cn-custom-name') && !!doc.querySelector('#cn-custom-desc'))

const nameInput = doc.querySelector('#cn-custom-name')
const descInput = doc.querySelector('#cn-custom-desc')
input(w, nameInput, ' '); await tick()
click(w, doc.querySelector('[data-act="save"]'))
await tick()
check('empty name is rejected honestly',
  !readState(storage).connectors.some((c) => c.name === ' ')
  && [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('请先填写'))
  && !!doc.querySelector('.modal-mask'))

input(w, nameInput, '内部知识库 MCP')
input(w, descInput, '接入自建知识库的检索与写回')
click(w, doc.querySelector('[data-act="save"]'))
await tick()
check('custom connector persisted and connected',
  readState(storage).connectors.find((c) => c.name === '内部知识库 MCP')?.connected === true)
check('custom connector modal closes', !doc.querySelector('.modal-mask'))
check('custom connector appears in the grid as connected',
  doc.querySelector('[data-cn-name="内部知识库 MCP"]')?.classList.contains('is-connected')
  && doc.querySelector('[data-cn-name="内部知识库 MCP"] .cn-desc').textContent === '接入自建知识库的检索与写回')

input(w, doc.querySelector('#cn-search-input'), '内部知识库')
await tick()
check('custom connector is searchable', cards().length === 1)
input(w, doc.querySelector('#cn-search-input'), '')
await tick()

/* ---------- 6. 取消按钮不落库 ---------- */
click(w, doc.querySelector('[data-custom]'))
await tick()
input(w, doc.querySelector('#cn-custom-name'), '临时连接器')
click(w, doc.querySelector('[data-act="cancel"]'))
await tick()
check('cancel closes without persisting',
  !doc.querySelector('.modal-mask') && !readState(storage).connectors.some((c) => c.name === '临时连接器'))

check('connectors page flow: no runtime errors', errors.length === 0, JSON.stringify(errors))

/* ---------- 7. 入口：窄栏「更多 → 连接器」不再弹窗 ---------- */
{
  const home = await loadPage('/index.html', { freshCopy: true })
  click(home.w, home.doc.querySelector('.more-wrap .rail-item'))
  await tick()
  click(home.w, home.doc.querySelector('[data-more="连接器"]'))
  await tick()
  check('connectors entry closes flyout and opens no modal',
    home.doc.querySelector('.more-pop').hidden === true && !home.doc.querySelector('.modal-mask'))
  check('connectors entry keeps home error-free', home.errors.length === 0, home.errors)
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} CONNECTORS CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
