/* ============================================================
   模板引擎专项：950 套目录 / 框架唯一性 / 页数配图 / 版式覆盖
   + 页面级交互：分页加载、类别筛选、幻灯翻页、样式换色
   ============================================================ */

import {
  buildCatalog, buildDeck, renderPageHTML, metaFor, coverStyle, displayTpl, slotNeed,
  CATEGORY_LIST, FRAMEWORKS, LAYOUTS,
} from '../src/template-engine.js'
import { loadPage, click, input, tick, readState } from './helpers.mjs'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

/* ---------------- 纯引擎层 ---------------- */

const catalog = buildCatalog()
check('catalog has 950 generated templates', catalog.length === 950)
check('19 categories registered', CATEGORY_LIST.length === 19)
check('framework pool has 50 entries', FRAMEWORKS.length === 50)
check('layout pool has 26 entries', LAYOUTS.length === 26)

for (const c of CATEGORY_LIST) {
  const inCat = catalog.filter((t) => t.cats[0] === c)
  check(`category ${c} has exactly 50`, inCat.length === 50)
  const fws = new Set(inCat.map((t) => t.fw))
  check(`category ${c} frameworks unique`, fws.size === 50)
}

check('every template has 20-30 pages', catalog.every((t) => t.pageCount >= 20 && t.pageCount <= 30))
check('every template has 10-15 images', catalog.every((t) => t.imgCount >= 10 && t.imgCount <= 15))
check('all template names unique', new Set(catalog.map((t) => t.name)).size === 950)
check('cover style exposes palette vars', coverStyle(catalog[0]).includes('--g-accent:'))

// 确定性：两次构建结果一致
const again = buildCatalog()
check('catalog deterministic', JSON.stringify(catalog[333]) === JSON.stringify(again[333]))

// 抽样 40 套深度验证 deck
const sample = [0, 7, 23, 50, 120, 250, 399, 512, 688, 812, 949].map((i) => catalog[i])
const layoutSeen = new Set()
for (const t of sample) {
  const deck = buildDeck(t)
  check(`deck ${t.name} page count matches`, deck.pages.length === t.pageCount)
  check(`deck ${t.name} image count matches`, deck.images.length === t.imgCount)
  check(`deck ${t.name} images unique`, new Set(deck.images).size === t.imgCount)
  check(`deck ${t.name} images are svg`, deck.images.every((s) => s.includes('<svg')))
  let adjacent = true
  for (let i = 1; i < deck.pages.length; i++) if (deck.pages[i].layout === deck.pages[i - 1].layout) adjacent = false
  check(`deck ${t.name} no adjacent repeat layout`, adjacent)
  deck.pages.forEach((p) => layoutSeen.add(p.layout))
  // 每张配图至少被使用一次（按各版式真实槽位数 slotNeed 统计）
  const used = new Set()
  deck.pages.forEach((p) => {
    for (let k = 0; k < slotNeed(p.layout); k++) used.add((p.imgStart + k) % deck.images.length)
  })
  check(`deck ${t.name} every image used at least once`, used.size === t.imgCount, [...used].join(','))
  // 渲染全部页面不炸，且每一页都含配图（map 自带 dp-art 场景插画）
  const pageHtmls = deck.pages.map((_, i) => renderPageHTML(t, i, i % 3))
  const html = pageHtmls.join('')
  check(`deck ${t.name} all pages render`, html.includes('dp-page') && html.includes('data-layout'))
  check(`deck ${t.name} every page has artwork`, pageHtmls.every((h) => h.includes('dp-art')))
  check(`deck ${t.name} no page without image slot`, deck.pages.every((p) => slotNeed(p.layout) >= 1 || p.layout === 'map'))
  const meta = metaFor(t)
  check(`deck ${t.name} meta spec consistent`, meta.spec.pages === t.pageCount && meta.spec.images === t.imgCount && meta.colors.length === 3)
}
check('all 26 layouts covered across sample', layoutSeen.size === 26, [...layoutSeen].join(','))

// 全量 950 套：每一页都必须有配图位，且图片槽位不少于配图数
{
  let pagesWithoutArt = 0
  let slotStarved = 0
  for (const t of catalog) {
    const d = buildDeck(t)
    const slots = d.pages.reduce((s, p) => s + slotNeed(p.layout), 0)
    if (slots < t.imgCount) slotStarved++
    d.pages.forEach((p, i) => {
      if (p.layout !== 'map' && !renderPageHTML(t, i).includes('dp-art')) pagesWithoutArt++
    })
  }
  check('all 950 decks: zero pages without artwork', pagesWithoutArt === 0, `pages=${pagesWithoutArt}`)
  check('all 950 decks: slots cover every image', slotStarved === 0, `starved=${slotStarved}`)
}

// 精选模板也能生成 deck（由名称哈希推导）
const curatedLike = { id: 'x1', name: '渔港日记', a: '石', b: 'SHIPU', format: '演示文稿', cats: ['文化'] }
const cDeck = buildDeck(curatedLike)
check('curated template gets generated deck', cDeck.pages.length >= 20 && cDeck.images.length >= 10)
check('curated deck renders', renderPageHTML(curatedLike, 0).includes('lay-cover'))

/* ---------------- 双语 ---------------- */

const zhDeck = buildDeck(catalog[10], 'zh')
const enDeck = buildDeck(catalog[10], 'en')
const zhSampleHtml = zhDeck.pages.map((_, i) => renderPageHTML(catalog[10], i, 0, 'zh')).join('')
const enSampleHtml = enDeck.pages.map((_, i) => renderPageHTML(catalog[10], i, 0, 'en')).join('')
check('zh deck contains Chinese text', /[一-龥]/.test(zhSampleHtml))
check('en deck has no Chinese copy', !/[一-龥]/.test(enSampleHtml.replace(/Design Buddy/g, '')))
check('en deck contains English section words', /Market|Solution|Milestones|Team|Growth/.test(enSampleHtml))
check('displayTpl zh name', displayTpl(catalog[10], 'zh').name === catalog[10].name)
check('displayTpl en name differs', displayTpl(catalog[10], 'en').name !== catalog[10].name && /^[A-Za-z]/.test(displayTpl(catalog[10], 'en').name))
check('en meta spec uses english framework', /[A-Za-z]/.test(metaFor(catalog[10], 'en').spec.framework))
check('zh meta spec uses chinese framework', /[一-龥]/.test(metaFor(catalog[10], 'zh').spec.framework))
check('curated en display falls back gracefully', displayTpl(curatedLike, 'en').name.length > 0)

/* ---------------- 可编辑字段 ---------------- */

const editSample = [catalog[0], catalog[77], catalog[250], catalog[512], catalog[949]]
for (const t of editSample) {
  const d = buildDeck(t, 'zh')
  const allHtml = d.pages.map((_, i) => renderPageHTML(t, i)).join('')
  check(`editable fields on every page (${t.name})`, d.pages.every((_, i) => (renderPageHTML(t, i).match(/data-edit=/g) || []).length >= 1))
  check(`editable elements are contenteditable (${t.name})`, allHtml.includes('contenteditable="true"'))
}
const edited = renderPageHTML(catalog[10], 0, 0, 'zh', { 'cover-title': '定制标题ABC' })
check('edits override default copy', edited.includes('定制标题ABC'))
const editedEn = renderPageHTML(catalog[10], 2, 0, 'en', { title: 'Custom Title XYZ' })
check('english edits override', editedEn.includes('Custom Title XYZ'))
// 编辑键在同版式内稳定
const r1 = renderPageHTML(catalog[10], 2)
const r2 = renderPageHTML(catalog[10], 2)
check('edit keys stable across renders', r1.match(/data-edit="[^"]+"/g).join('|') === r2.match(/data-edit="[^"]+"/g).join('|'))

/* ---------------- 页面级交互 ---------------- */

{
  const { doc, w, errors, storage } = await loadPage('/templates.html')
  check('templates page no errors', errors.length === 0, errors)
  check('first grid page shows 24 curated cards', doc.querySelectorAll('.tpl-card').length === 24)
  check('load more visible', !doc.querySelector('.tpl-more-wrap').hidden)
  check('load more count text', doc.querySelector('#tpl-more-count').textContent.includes('24 /'))

  click(w, doc.querySelector('#tpl-more'))
  await tick()
  check('load more appends next page', doc.querySelectorAll('.tpl-card').length === 48)
  check('fresh animation class applied', doc.querySelectorAll('.tpl-card.is-fresh').length === 24)
  check('generated cover rendered', !!doc.querySelector('.tpl-gen'))
  check('page badge on generated cards', /\d+ 页 · \d+ 图/.test(doc.querySelector('.tc-page-badge')?.textContent ?? ''))
  check('cover deco variants present', new Set([...doc.querySelectorAll('.tpl-gen')].map((e) => e.dataset.deco)).size > 1)

  // 类别筛选：课程恰好 50 套生成模板（精选无「课程」主类，命中另计）
  const box = [...doc.querySelectorAll('#category-body input')].find((i) => i.value === '课程')
  click(w, box)
  await tick()
  check('category filter resets pagination', doc.querySelectorAll('.tpl-card').length === 24)
  const totalText = doc.querySelector('#tpl-more-count').textContent
  const totalN = Number(totalText.match(/\/ (\d+) 套/)?.[1] ?? 0)
  // 每类生成模板恰好 50，另有少量手工精选命中加成
  check('category has at least 50 templates', totalN >= 50, totalText)
  check('category has exactly 50 generated', catalog.filter((t) => t.cats[0] === '课程').length === 50)
  // 全部加载完
  while (!doc.querySelector('.tpl-more-wrap').hidden) {
    click(w, doc.querySelector('#tpl-more'))
    await tick()
  }
  check('all category cards rendered', doc.querySelectorAll('.tpl-card').length === totalN)
  check('load more hidden after all', doc.querySelector('.tpl-more-wrap').hidden)
  click(w, box)
  await tick()

  // 搜索
  input(w, doc.querySelector('#tpl-search-input'), '灵动')
  await tick(60)
  check('search filters generated names', doc.querySelectorAll('.tpl-card').length > 0 &&
    [...doc.querySelectorAll('.tpl-name span')].every((s) => s.textContent.includes('灵动')))
  input(w, doc.querySelector('#tpl-search-input'), '')
  await tick()
  // 搜索清空后回到第一页（24 张精选），再加载出生成模板
  click(w, doc.querySelector('#tpl-more'))
  await tick()

  // 打开一套生成模板的详情
  const genCard = [...doc.querySelectorAll('.tpl-card')].find((c) => c.querySelector('.tpl-gen'))
  check('generated card exists', !!genCard)
  click(w, genCard)
  await tick()
  check('generated detail opens', !!doc.querySelector('.td-mask .dp-page'))
  check('deck has framework badge', doc.querySelector('#td-frame').textContent.length > 0)
  const firstCount = doc.querySelector('#td-page-count').textContent
  check('page counter format', /^\d\d \/ \d\d$/.test(firstCount), firstCount)
  check('page dots rendered', doc.querySelectorAll('.td-page-dot').length >= 5)

  // 翻页
  click(w, doc.querySelector('#td-page-next'))
  await tick()
  check('page next updates counter', doc.querySelector('#td-page-count').textContent !== firstCount)
  check('page transition class', !!doc.querySelector('.dp-page.is-shown'))
  // 键盘翻页
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  await tick()
  const afterKey = doc.querySelector('#td-page-count').textContent
  check('keyboard arrow pages deck', afterKey !== firstCount)
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
  check('esc closes detail', !doc.querySelector('.td-mask'))

  // 再次打开，验证样式 A/B/C 换色
  click(w, genCard)
  await tick()
  const styleCards = doc.querySelectorAll('.td-style-card')
  check('three style cards', styleCards.length === 3)
  const before = doc.querySelector('.dp-page').getAttribute('style')
  click(w, styleCards[1])
  await tick()
  check('style switch recolors deck', doc.querySelector('.dp-page').getAttribute('style') !== before)
  check('style card picked state', styleCards[1] && doc.querySelectorAll('.td-style-card')[1].classList.contains('is-picked'))
  // 轮播窗口切换模板
  const thumbs = doc.querySelectorAll('.td-thumb')
  check('windowed carousel 12 thumbs', thumbs.length === 12)
  click(w, thumbs[5])
  await tick()
  check('carousel switches template', doc.querySelector('.td-head h2').textContent === thumbs[5].querySelector('.td-thumb-name').textContent)

  // 弹层内中英切换
  const zhText = doc.querySelector('.dp-page [data-edit]')?.textContent
  click(w, doc.querySelector('#td-lang [data-lang="en"]'))
  await tick()
  check('deck lang toggle renders english', doc.querySelector('#td-lang [data-lang="en"]').classList.contains('is-active'))
  check('english deck copy shown', !/[一-龥]/.test(doc.querySelector('.dp-page').textContent.replace(/Design Buddy/g, '')))
  check('panel localized to english', doc.querySelector('#td-use').textContent === 'Use template')
  const persistedLang = readState(storage).templateLang
  check('language persisted', persistedLang === 'en')

  // 内联编辑：改文字 → input → 写入 localStorage
  const field = doc.querySelector('.dp-page [data-edit]')
  const editKey = field.dataset.edit
  field.textContent = 'Edited in browser'
  field.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  const st = readState(storage)
  check('inline edit persisted', JSON.stringify(st.templateEdits).includes('Edited in browser'))
  check('reset edit button appears', !doc.querySelector('#td-reset-edits').hidden)
  // 翻页后回来仍保留
  click(w, doc.querySelector('#td-page-next')); await tick()
  click(w, doc.querySelector('#td-page-prev')); await tick()
  const again = [...doc.querySelectorAll('.dp-page [data-edit]')].find((e) => e.dataset.edit === editKey)
  check('inline edit survives page navigation', again?.textContent === 'Edited in browser')
  // 重置
  click(w, doc.querySelector('#td-reset-edits')); await tick()
  const afterReset = [...doc.querySelectorAll('.dp-page [data-edit]')].find((e) => e.dataset.edit === editKey)
  check('reset restores default copy', afterReset?.textContent !== 'Edited in browser')
  // 工具栏语言控件同步
  check('toolbar lang control exists', !!doc.querySelector('.tpl-lang [data-lang="zh"]'))

  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()

  // 工具栏切换语言：网格与侧栏随之英文化
  click(w, doc.querySelector('.tpl-lang [data-lang="zh"]'))
  await tick()
  check('toolbar toggle back to chinese', doc.querySelector('.tpl-lang [data-lang="zh"]').classList.contains('is-active'))
  check('grid back to chinese name', /[一-龥]/.test(doc.querySelector('.tpl-name span').textContent))
  check('category label chinese', /[一-龥]/.test(doc.querySelector('.cat-label').textContent))
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} TEMPLATE ENGINE CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
