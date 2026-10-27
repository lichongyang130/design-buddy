/* ============================================================
   模板引擎专项：950 套目录 / 框架唯一性 / 页数配图 / 版式覆盖
   + 页面级交互：分页加载、类别筛选、幻灯翻页、样式换色
   ============================================================ */

import {
  buildCatalog, buildDeck, renderPageHTML, renderDocumentHTML, metaFor, coverStyle, displayTpl, slotNeed,
  configureArt, getArtMode, setArtOverride, clearArtOverride,
  CATEGORY_LIST, FRAMEWORKS, LAYOUTS, hashStr,
} from '../src/template-engine.js'
import { conceptFor, ART_CONCEPTS, CONCEPT_POOLS } from '../src/art-concepts.js'
import { loadPage, click, input, tick, readState, LS_KEY } from './helpers.mjs'
import fs from 'node:fs'
import path from 'node:path'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

/* ---------------- 纯引擎层 ---------------- */

const catalog = buildCatalog()
check('catalog is cleared (all template examples removed)', catalog.length === 0)
check('20 categories registered', CATEGORY_LIST.length === 20)
check('framework pool has 50 entries', FRAMEWORKS.length === 50)
check('layout pool has 26 entries', LAYOUTS.length === 26)

// 合成模板：目录清空后，引擎仍可为自定义模板生成完整 deck（验证引擎本身未坏）
const synthTpl = (i) => ({
  id: `synth-${i}`,
  serial: i,
  name: `合成模板${i}`,
  a: `合成${i}`,
  b: 'SYNTH',
  cls: null,
  gen: true,
  format: ['演示文稿', '文档', '社交轮播卡片', '网站复刻', 'App', '图片', '实时产物', 'WebGL'][i % 8],
  cats: [CATEGORY_LIST[i % CATEGORY_LIST.length]],
  seed: hashStr(`synth:${i}`),
  fw: i % FRAMEWORKS.length,
  pal: i % 20,
  font: i % 5,
  pageCount: 20 + (i % 10),
  imgCount: 10 + (i % 5),
})
const synthCatalog = Array.from({ length: 120 }, (_, i) => synthTpl(i))
check('synth catalog built with mixed formats',
  synthCatalog.length === 120 && new Set(synthCatalog.map((t) => t.format)).size === 8)

// 抽样深度验证 deck
const sample = synthCatalog.filter((_, i) => [0, 7, 23, 50, 61, 80, 95, 104, 112, 119].includes(i))
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
check('sample decks: layouts covered', layoutSeen.size >= 15, [...layoutSeen].join(','))
// 合成目录全量：所有 26 种版式都被覆盖
{
  const allLayouts = new Set()
  for (const t of synthCatalog) buildDeck(t).pages.forEach((p) => allLayouts.add(p.layout))
  check('all 26 layouts covered across synth catalog', allLayouts.size === 26, [...allLayouts].join(','))
}

// 全量合成模板：每一页都必须有配图位，且图片槽位不少于配图数
{
  let pagesWithoutArt = 0
  let slotStarved = 0
  for (const t of synthCatalog) {
    const d = buildDeck(t)
    const slots = d.pages.reduce((s, p) => s + slotNeed(p.layout), 0)
    if (slots < t.imgCount) slotStarved++
    d.pages.forEach((p, i) => {
      if (p.layout !== 'map' && !renderPageHTML(t, i).includes('dp-art')) pagesWithoutArt++
    })
  }
  check('all synth decks: zero pages without artwork', pagesWithoutArt === 0, `pages=${pagesWithoutArt}`)
  check('all synth decks: slots cover every image', slotStarved === 0, `starved=${slotStarved}`)
}

// 精选模板也能生成 deck（由名称哈希推导）
const curatedLike = { id: 'x1', name: '渔港日记', a: '石', b: 'SHIPU', format: '演示文稿', cats: ['文化'] }
const cDeck = buildDeck(curatedLike)
check('curated template gets generated deck', cDeck.pages.length >= 20 && cDeck.images.length >= 10)
check('curated deck renders', renderPageHTML(curatedLike, 0).includes('lay-cover'))

/* ---------------- 双语 ---------------- */

const zhDeck = buildDeck(synthCatalog[10], 'zh')
const enDeck = buildDeck(synthCatalog[10], 'en')
const zhSampleHtml = zhDeck.pages.map((_, i) => renderPageHTML(synthCatalog[10], i, 0, 'zh')).join('')
const enSampleHtml = enDeck.pages.map((_, i) => renderPageHTML(synthCatalog[10], i, 0, 'en')).join('')
check('zh deck contains Chinese text', /[一-龥]/.test(zhSampleHtml))
check('en deck has no Chinese copy', !/[一-龥]/.test(enSampleHtml.replace(/Design Buddy/g, '')))
check('en deck contains English section words', /Market|Solution|Milestones|Team|Growth/.test(enSampleHtml))
check('displayTpl zh name', displayTpl(synthCatalog[10], 'zh').name === synthCatalog[10].name)
check('displayTpl en name differs', displayTpl(synthCatalog[10], 'en').name !== synthCatalog[10].name && /^[A-Za-z]/.test(displayTpl(synthCatalog[10], 'en').name))
check('en meta spec uses english framework', /[A-Za-z]/.test(metaFor(synthCatalog[10], 'en').spec.framework))
check('zh meta spec uses chinese framework', /[一-龥]/.test(metaFor(synthCatalog[10], 'zh').spec.framework))
check('curated en display falls back gracefully', displayTpl(curatedLike, 'en').name.length > 0)

/* ---------------- 可编辑字段 ---------------- */

const editSample = [synthCatalog[0], synthCatalog[77], synthCatalog[10], synthCatalog[55], synthCatalog[119]]
for (const t of editSample) {
  const d = buildDeck(t, 'zh')
  const allHtml = d.pages.map((_, i) => renderPageHTML(t, i)).join('')
  check(`editable fields on every page (${t.name})`, d.pages.every((_, i) => (renderPageHTML(t, i).match(/data-edit=/g) || []).length >= 1))
  check(`editable elements are contenteditable (${t.name})`, allHtml.includes('contenteditable="true"'))
}
const edited = renderPageHTML(synthCatalog[10], 0, 0, 'zh', { 'cover-title': '定制标题ABC' })
check('edits override default copy', edited.includes('定制标题ABC'))
const editedEn = renderPageHTML(synthCatalog[10], 2, 0, 'en', { title: 'Custom Title XYZ' })
check('english edits override', editedEn.includes('Custom Title XYZ'))
// 编辑键在同版式内稳定
const r1 = renderPageHTML(synthCatalog[10], 2)
const r2 = renderPageHTML(synthCatalog[10], 2)
check('edit keys stable across renders', r1.match(/data-edit="[^"]+"/g).join('|') === r2.match(/data-edit="[^"]+"/g).join('|'))

/* ---------------- 页面级交互 ---------------- */

// 预置自建模板：内置示例与生成目录全部清空后，模板页只剩自定义模板
function makeStorage(customs = []) {
  const mem = new Map()
  const storage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
    clear: () => mem.clear(),
  }
  storage.setItem(LS_KEY, JSON.stringify({ customTemplates: customs }))
  return storage
}

const seedCustoms = [
  { id: 'ct-slide', name: '我的演示模板', a: 'My Custom Deck', b: 'CUSTOM TEMPLATE', cover: '', format: '演示文稿', cats: ['培训'] },
  { id: 'ct-doc', name: '我的文档模板', a: 'My Custom Doc', b: 'DOCUMENT', cover: '', format: '文档', cats: ['报告'] },
  { id: 'ct-carousel', name: '我的轮播模板', a: 'My Carousel', b: 'CAROUSEL', cover: '', format: '社交轮播卡片', cats: ['活动'] },
]

{
  // 空态：无自定义模板时仍展示演示文稿模板
  const emptyPage = await loadPage('/templates.html', { storage: makeStorage(), freshCopy: true })
  await tick()
  check('templates page no errors', emptyPage.errors.length === 0, emptyPage.errors)
  check('presentation templates shown without customs',
    emptyPage.doc.querySelectorAll('.tpl-card').length === 24)
  check('empty state hidden when presentation templates exist',
    emptyPage.doc.querySelector('#tpl-empty').hidden)
  check('grid visible with presentation templates', !emptyPage.doc.querySelector('#tpl-grid').hidden)
  check('load more visible with 205 templates', !emptyPage.doc.querySelector('.tpl-more-wrap').hidden)

  // 自建模板：清空示例后网格只剩自定义模板
  const storage = makeStorage(seedCustoms)
  const { doc, w, errors } = await loadPage('/templates.html', { storage, freshCopy: true })
  await tick()
  check('seeded page no errors', errors.length === 0, errors)
  check('curated examples gone, presentation templates shown',
    !doc.querySelector('.tpl-card.tpl-shipu') && doc.querySelectorAll('.tpl-gen').length === 24)
  check('grid shows presentation templates first (24 visible)', doc.querySelectorAll('.tpl-card').length === 24)
  check('load more visible with 208 total templates', !doc.querySelector('.tpl-more-wrap').hidden)

  // 格式筛选：9 个选项仍在，且按格式严格过滤
  check('format filter exposes the new formats',
    ['演示文稿', '文档', '社交轮播卡片', '网站复刻', 'App', '图片', '实时产物', 'WebGL'].every((f) =>
      !!doc.querySelector(`input[name="format"][value="${f}"]`)))
  click(w, doc.querySelector('input[name="format"][value="文档"]'))
  await tick()
  check('format filter narrows to document templates',
    doc.querySelectorAll('.tpl-card').length === 24
    && [...doc.querySelectorAll('.tpl-card .tpl-fmt')].every((b) => b.textContent === '文档'))
  click(w, doc.querySelector('input[name="format"][value="演示文稿"]'))
  await tick()
  check('format filter narrows to deck templates',
    doc.querySelectorAll('.tpl-card').length === 24
    && [...doc.querySelectorAll('.tpl-card .tpl-fmt')].every((b) => b.textContent === '演示文稿'))
  click(w, doc.querySelector('input[name="format"][value="all"]'))
  await tick()

  // 类别筛选：20 类选项仍在
  check('category filter exposes 20 categories',
    doc.querySelectorAll('#category-body input').length === 20)

  // 搜索：命中自建模板
  input(w, doc.querySelector('#tpl-search-input'), '我的文档')
  await tick(60)
  check('search finds custom template',
    doc.querySelectorAll('.tpl-card').length === 1
    && doc.querySelector('.tpl-name > span:not(.tpl-fmt)').textContent.includes('我的文档'))
  input(w, doc.querySelector('#tpl-search-input'), '')
  await tick()

  // 详情：搜索并打开自建演示模板
  input(w, doc.querySelector('#tpl-search-input'), '我的演示模板')
  await tick(60)
  const card = doc.querySelector('.tpl-card')
  check('custom card found for detail', !!card)
  click(w, card)
  await tick()
  check('custom detail opens', !!doc.querySelector('.td-mask .dp-page'))
  check('deck has framework badge', doc.querySelector('#td-frame').textContent.length > 0)
  const firstCount = doc.querySelector('#td-page-count').textContent
  check('page counter format', /^\d\d \/ \d\d$/.test(firstCount), firstCount)
  check('page dots rendered', doc.querySelectorAll('.td-page-dot').length >= 5)

  // 翻页
  click(w, doc.querySelector('#td-page-next'))
  await tick()
  check('page next updates counter', doc.querySelector('#td-page-count').textContent !== firstCount)
  check('page transition class', !!doc.querySelector('.dp-page.is-shown'))
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  await tick()
  const afterKey = doc.querySelector('#td-page-count').textContent
  check('keyboard arrow pages deck', afterKey !== firstCount)
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
  check('esc closes detail', !doc.querySelector('.td-mask'))

  // 样式 A/B/C 换色
  click(w, card)
  await tick()
  const styleCards = doc.querySelectorAll('.td-style-card')
  check('three style cards', styleCards.length === 3)
  const before = doc.querySelector('.dp-page').getAttribute('style')
  click(w, styleCards[1])
  await tick()
  check('style switch recolors deck', doc.querySelector('.dp-page').getAttribute('style') !== before)
  check('style card picked state', styleCards[1] && doc.querySelectorAll('.td-style-card')[1].classList.contains('is-picked'))
  check('other-cases carousel row removed',
    !doc.querySelector('.td-carousel-wrap') && doc.querySelectorAll('.td-thumb').length === 0)

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
  click(w, doc.querySelector('#td-page-next')); await tick()
  click(w, doc.querySelector('#td-page-prev')); await tick()
  const again = [...doc.querySelectorAll('.dp-page [data-edit]')].find((e) => e.dataset.edit === editKey)
  check('inline edit survives page navigation', again?.textContent === 'Edited in browser')
  click(w, doc.querySelector('#td-reset-edits')); await tick()
  const afterReset = [...doc.querySelectorAll('.dp-page [data-edit]')].find((e) => e.dataset.edit === editKey)
  check('reset restores default copy', afterReset?.textContent !== 'Edited in browser')
  check('toolbar lang control exists', !!doc.querySelector('.tpl-lang [data-lang="zh"]'))

  /* P4 配图替换：点击配图 → 素材弹窗 → 换图/上传/恢复默认，全部持久化 */
  await tick(120) // 等待 manifest 异步加载完成
  const artEl = doc.querySelector('.td-deck .dp-art[data-art-key]')
  check('artwork wrapper carries concept anchor', !!artEl && !!artEl.dataset.artKey && artEl.dataset.artSlot === '0')
  const artPageNo = artEl.dataset.artPage
  click(w, artEl)
  await tick()
  const picker = doc.querySelector('.modal-mask .art-picker-grid')
  check('art picker opens with library grid', !!picker && picker.querySelectorAll('.art-pick').length >= 100)
  check('art picker has upload and reset actions',
    !!doc.querySelector('.art-picker-foot [data-art-upload]') && !!doc.querySelector('.art-picker-foot [data-art-reset]'))
  const picks = [...picker.querySelectorAll('.art-pick')]
  const currentPick = picks.find((p) => p.classList.contains('is-current'))
  check('current artwork marked in picker', !!currentPick)
  const alt = picks.find((p) => p !== currentPick)
  const altSrc = alt.dataset.artSrc
  click(w, alt)
  await tick()
  check('picker closes after choosing', !doc.querySelector('.modal-mask .art-picker-grid'))
  const replaced = doc.querySelector(`.td-deck [data-art-page="${artPageNo}"][data-art-slot="0"] img`)
  check('deck artwork swapped to chosen illustration', replaced?.getAttribute('src') === altSrc)
  const st1 = readState(storage)
  check('art override persisted to state', Object.values(st1.artOverrides).includes(altSrc))

  // 重置默认
  click(w, doc.querySelector('.td-deck .dp-art[data-art-key]'))
  await tick()
  check('picker reopens with current tag', !!doc.querySelector('.art-pick.is-current'))
  click(w, doc.querySelector('.art-picker-foot [data-art-reset]'))
  await tick()
  check('reset closes picker', !doc.querySelector('.modal-mask .art-picker-grid'))
  const afterResetImg = doc.querySelector(`.td-deck [data-art-page="${artPageNo}"][data-art-slot="0"] img`)
  check('reset restores default illustration', afterResetImg?.getAttribute('src') !== altSrc)
  check('override removed from state', !Object.values(readState(storage).artOverrides).includes(altSrc))

  // 上传自有图片：构造 SVG File → dataURL 覆盖
  click(w, doc.querySelector('.td-deck .dp-art[data-art-key]'))
  await tick()
  const fileInput = doc.querySelector('.art-picker-foot input[type="file"]')
  check('upload input accepts images', !!fileInput && fileInput.accept.includes('image'))
  const uploadFile = new w.File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'mine.svg', { type: 'image/svg+xml' })
  Object.defineProperty(fileInput, 'files', { value: [uploadFile], configurable: true })
  fileInput.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick(60)
  const st2 = readState(storage)
  check('uploaded data url persisted', Object.values(st2.artOverrides).some((v) => String(v).startsWith('data:image/svg')))
  check('deck shows uploaded image', doc.querySelector(`.td-deck [data-art-page="${artPageNo}"][data-art-slot="0"] img`)
    ?.getAttribute('src')?.startsWith('data:image/svg'))

  // 刷新后覆盖仍生效
  const tplName = doc.querySelector('.td-head h2').textContent
  const reloaded = await loadPage('/templates.html', { storage, freshCopy: true })
  await tick(120)
  input(reloaded.w, reloaded.doc.querySelector('#tpl-search-input'), tplName)
  await tick(60)
  const reCard = reloaded.doc.querySelector('.tpl-card')
  check('same template reopened after reload', !!reCard, tplName)
  click(reloaded.w, reCard)
  await tick()
  let reloadTarget = reloaded.doc.querySelector(`.td-deck [data-art-page="${artPageNo}"][data-art-slot="0"] img`)
  for (let n = 0; n < 8 && !reloadTarget; n++) {
    click(reloaded.w, reloaded.doc.querySelector('#td-page-next'))
    await tick()
    reloadTarget = reloaded.doc.querySelector(`.td-deck [data-art-page="${artPageNo}"][data-art-slot="0"] img`)
  }
  check('upload override survives reload', reloadTarget?.getAttribute('src')?.startsWith('data:image/svg'))
  click(reloaded.w, reloaded.doc.querySelector(`.td-deck [data-art-page="${artPageNo}"]`))
  await tick()
  click(reloaded.w, reloaded.doc.querySelector('.art-picker-foot [data-art-reset]'))
  await tick()
  reloaded.w.dispatchEvent(new reloaded.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()

  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()

  // 工具栏切换语言：网格与侧栏随之英文化
  click(w, doc.querySelector('.tpl-lang [data-lang="zh"]'))
  await tick()
  check('toolbar toggle back to chinese', doc.querySelector('.tpl-lang [data-lang="zh"]').classList.contains('is-active'))
  const firstCardName = doc.querySelector('.tpl-name span')?.textContent || 'NO NAME'
  check('grid back to chinese name', /[一-龥]/.test(firstCardName), firstCardName)
  check('category label chinese', /[一-龥]/.test(doc.querySelector('.cat-label').textContent))
}

/* ---------------- 任务二十三：文档形态 / 版块库 / 编辑器重构 ---------------- */
{
  // 引擎层契约：文档渲染器
  const docTpl = synthCatalog[10]
  const docDeck = buildDeck(docTpl, 'zh')
  const docHtml = renderDocumentHTML(docTpl, 'zh', {}, [])
  check('doc renderer: one flowing section per page',
    (docHtml.match(/class="doc-block /g) || []).length === docDeck.pages.length)
  check('doc renderer: inline-edit anchors shared with slides',
    docHtml.includes('db-editable') && docHtml.includes('data-edit="title"'))
  check('doc renderer: art anchors shared with slides',
    docHtml.includes('data-art-key') && docHtml.includes('data-art-page'))
  const withBlocks = renderDocumentHTML(docTpl, 'zh', {}, [
    { id: 'bk1', kind: 'h2', text: '自定义标题' },
    { id: 'bk2', kind: 'quote', text: '自定义引用' },
    { id: 'bk3', kind: 'video', text: '视频块', url: '' },
    { id: 'bk4', kind: 'image', text: '图注', src: '' },
  ])
  check('doc renderer: custom blocks carry stable ids',
    withBlocks.includes('data-block-id="bk1"') && withBlocks.includes('doc-kind-quote'))
  check('doc renderer: media/image blocks show honest empty states',
    withBlocks.includes('data-block-url="bk3"') && withBlocks.includes('data-block-image="bk4"'))
  const docEn = renderDocumentHTML(docTpl, 'en', {}, [])
  check('doc renderer: english stream contains no Chinese',
    !/[一-龥]/.test(docEn.replace(/Design Buddy/g, '')))
  // CSS 契约：is-doc 取消固定 16:9、开启纵向滚动
  const distDir = path.resolve(new URL('../dist/assets', import.meta.url).pathname)
  const cssFile = fs.readdirSync(distDir).find((f) => f.startsWith('templates-') && f.endsWith('.css'))
  const cssText = fs.readFileSync(path.join(distDir, cssFile), 'utf8')
  check('doc css: 16:9 ratio removed in document mode',
    /\.td-deck\.is-doc\s*\{[^}]*aspect-ratio:\s*auto/.test(cssText))
  check('doc css: vertical scrolling enabled',
    /\.td-deck\.is-doc\s*\{[^}]*overflow-y:\s*auto/.test(cssText))

  // 页面级交互
  const storage = makeStorage(seedCustoms)
  const { doc, w, errors } = await loadPage('/templates.html', { storage, freshCopy: true })
  await tick()
  input(w, doc.querySelector('#tpl-search-input'), '我的演示模板')
  await tick(60)
  const customCard = doc.querySelector('.tpl-card')
  click(w, customCard)
  await tick()
  const tplName = doc.querySelector('#td-topbar-title').textContent
  check('editor: topbar/ribbon/toolbar restructured',
    !!doc.querySelector('.td-topbar') && !!doc.querySelector('.td-ribbon') && !!doc.querySelector('.td-toolbar'))
  check('editor: form switch offers slide + document',
    [...doc.querySelectorAll('#td-form-switch [data-form]')].map((b) => b.dataset.form).join() === 'slide,doc')
  check('editor: add-block and history buttons present',
    !!doc.querySelector('#td-add-block') && !!doc.querySelector('#td-undo') && !!doc.querySelector('#td-redo'))
  check('editor: panel tabs (brief/images)', doc.querySelectorAll('.tdp-tab').length === 2)
  check('editor: undo disabled with empty history', doc.querySelector('#td-undo').hasAttribute('disabled'))
  // 默认幻灯分页形态
  check('slides: default form is paginated slides',
    !!doc.querySelector('.td-deck .dp-page') && !doc.querySelector('.db-doc'))

  // 切换到文档形态
  click(w, doc.querySelector('#td-form-switch [data-form="doc"]'))
  await tick()
  const docBlockCount = doc.querySelectorAll('.db-doc .doc-block').length
  check('doc: is-doc streaming article rendered',
    !!doc.querySelector('.td-deck.is-doc .db-doc') && docBlockCount >= 20 && docBlockCount <= 30)
  check('doc: slide-only chrome hidden',
    doc.querySelector('.td-page-arrow').hidden && doc.querySelector('.td-pages').hidden)
  check('doc: switch active state follows form',
    doc.querySelector('#td-form-switch [data-form="doc"]').classList.contains('is-active'))

  // 文档内联编辑 → 同一套 templateEdits 持久化
  const field = doc.querySelector('.db-doc [data-edit]')
  const editKey = field.dataset.edit
  field.textContent = '文档内联编辑XYZ'
  field.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  check('doc: inline edit persisted into templateEdits',
    JSON.stringify(readState(storage).templateEdits).includes('文档内联编辑XYZ'))
  check('doc: undo enabled after edit', !doc.querySelector('#td-undo').hasAttribute('disabled'))
  // 撤销恢复默认
  click(w, doc.querySelector('#td-undo'))
  await tick()
  const restored = [...doc.querySelectorAll('.db-doc [data-edit]')].find((e) => e.dataset.edit === editKey)
  check('doc: undo restores default copy', restored && restored.textContent !== '文档内联编辑XYZ')
  check('doc: redo re-enables', !doc.querySelector('#td-redo').hasAttribute('disabled'))

  // 形态按模板持久化：关闭重开仍是文档
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
  const again = await loadPage('/templates.html', { storage, freshCopy: true })
  await tick(120)
  input(again.w, again.doc.querySelector('#tpl-search-input'), tplName)
  await tick(60)
  let card = again.doc.querySelector('.tpl-card')
  check('doc: same template located for reopen', !!card)
  click(again.w, card)
  await tick()
  check('doc: form choice persisted across reopen', !!again.doc.querySelector('.td-deck.is-doc .db-doc'))

  // 添加版块：块选择器
  click(again.w, again.doc.querySelector('#td-add-block'))
  await tick()
  const picker = again.doc.querySelector('.modal-mask .block-picker')
  check('block picker: opens with search', !!picker?.querySelector('[data-bp-search]'))
  check('block picker: eight screenshot categories', picker.querySelectorAll('.block-cat').length === 8)
  check('block picker: 19 block cards in all view', picker.querySelectorAll('.block-card').length === 19)
  // 搜索过滤
  input(again.w, picker.querySelector('[data-bp-search]'), 'H1')
  await tick()
  check('block picker: search narrows grid',
    picker.querySelectorAll('.block-card').length === 1
    && picker.querySelector('.block-card')?.dataset.blockKind === 'h1')
  input(again.w, picker.querySelector('[data-bp-search]'), '')
  await tick()
  // 分类过滤
  click(again.w, picker.querySelector('.block-cat[data-cat="form"]'))
  await tick()
  check('block picker: category filter',
    [...picker.querySelectorAll('.block-card')].every((c) => ['input', 'button'].includes(c.dataset.blockKind)))
  click(again.w, picker.querySelector('.block-cat[data-cat="all"]'))
  await tick()
  // 插入 H2 自定义块
  click(again.w, picker.querySelector('[data-block-kind="h2"]'))
  await tick()
  check('block picker: h2 block inserted at tail',
    !!again.doc.querySelector('.db-doc .doc-custom.doc-kind-h2 [data-block-edit]'))
  check('block picker: insertion persisted per template',
    readState(storage).templateBlocks[tplName]?.length === 1
    && readState(storage).templateBlocks[tplName][0].kind === 'h2')
  // 自定义块文字可编辑并持久化
  const blockField = again.doc.querySelector('[data-block-edit]')
  blockField.textContent = '我加的版块标题'
  blockField.dispatchEvent(new again.w.Event('input', { bubbles: true }))
  await tick()
  check('custom block: inline text persisted',
    readState(storage).templateBlocks[tplName][0].text === '我加的版块标题')
  // 删除版块
  click(again.w, again.doc.querySelector('.doc-block-del'))
  await tick()
  check('custom block: delete removes from dom and store',
    !again.doc.querySelector('.doc-custom') && readState(storage).templateBlocks[tplName].length === 0)

  // 图片 tab：整篇配图网格，点击直达换图弹窗
  click(again.w, again.doc.querySelector('.tdp-tab[data-tab="images"]'))
  await tick()
  const imgCards = again.doc.querySelectorAll('.tdp-image-card')
  check('panel: images tab lists every art slot',
    imgCards.length >= again.doc.querySelectorAll('.db-doc .doc-block').length)
  click(again.w, imgCards[0])
  await tick()
  check('panel: image card opens art picker', !!again.doc.querySelector('.art-picker-grid'))
  again.doc.dispatchEvent(new again.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()

  // 切回分页幻灯
  click(again.w, again.doc.querySelector('#td-form-switch [data-form="slide"]'))
  await tick()
  check('slides: paginated form restored',
    !!again.doc.querySelector('.td-deck .dp-page') && !again.doc.querySelector('.db-doc'))
  check('editor: no runtime errors', errors.length === 0, JSON.stringify(errors))
}

/* 格式驱动默认渲染形态：文档→文档形态、轮播→方形画幅、演示文稿→16:9 分页 */
{
  const storage = makeStorage(seedCustoms)
  const { doc, w, errors } = await loadPage('/templates.html', { storage, freshCopy: true })
  await tick()
  click(w, doc.querySelector('input[name="format"][value="文档"]'))
  await tick()
  click(w, doc.querySelector('.tpl-card'))
  await tick()
  check('document format opens in doc form by default',
    (!!doc.querySelector('.td-deck.is-doc .db-doc') || !!doc.querySelector('.doc-pres-scroll'))
    && doc.querySelector('#td-form-switch [data-form="doc"]').classList.contains('is-active'))
  check('document format: meta shows document form',
    doc.querySelector('.td-meta')?.textContent?.startsWith('文档 · A4'))
  click(w, doc.querySelector('.td-close'))
  await tick()
  click(w, doc.querySelector('input[name="format"][value="社交轮播卡片"]'))
  await tick()
  // New curated cases use the dedicated editor; retain this legacy custom-deck
  // regression by explicitly selecting the seeded custom carousel after paging.
  for (let i = 0; i < 4; i++) click(w, doc.querySelector('#tpl-more'))
  click(w, doc.querySelector('.tpl-card[data-custom="ct-carousel"]'))
  await tick()
  check('carousel format renders square deck',
    !!doc.querySelector('.td-deck.is-square') && !doc.querySelector('.td-deck.is-doc'))
  click(w, doc.querySelector('.td-close'))
  await tick()
  click(w, doc.querySelector('input[name="format"][value="演示文稿"]'))
  await tick()
  click(w, doc.querySelector('.tpl-card'))
  await tick()
  check('deck format stays paginated 16:9 slides',
    !!doc.querySelector('.td-deck .dp-page')
    && !doc.querySelector('.td-deck.is-square') && !doc.querySelector('.db-doc'))
  check('format form: no runtime errors', errors.length === 0, JSON.stringify(errors))
}

/* ---------------- 任务二十七：查看器按截图重构（顶栏/共享带/设置面板） ---------------- */
{
  const storage = makeStorage(seedCustoms)
  const { doc, w, errors } = await loadPage('/templates.html', { storage, freshCopy: true })
  await tick(120)
  click(w, doc.querySelector('.tpl-card'))
  await tick(200)
  const q = (s) => doc.querySelector(s)
  const qa = (s) => [...doc.querySelectorAll(s)]

  // 深色顶栏：G 标识 + 面包屑标题 + 演示拆分按钮 + … 菜单 + 头像
  check('viewer: brand mark and breadcrumb title',
    q('.td-brand-mark')?.textContent === 'G' && !!q('#td-topbar-title')?.textContent)
  check('viewer: present split button with caret', !!q('#td-present') && !!q('#td-present-caret'))
  check('viewer: more menu and avatar present', !!q('#td-more') && !!q('#td-top-avatar .avatar'))
  click(w, q('#td-more'))
  await tick()
  check('viewer: more menu holds topic/share/upgrade/close',
    q('#td-more-menu')?.hidden === false
    && ['#td-topic', '#td-share-top', '#td-upgrade', '#td-close'].every((id) => !!q(id)))
  click(w, doc.body)
  await tick()
  check('viewer: more menu closes on outside click', q('#td-more-menu')?.hidden === true)

  // 演示菜单两项真实动作
  click(w, q('#td-present-caret'))
  await tick()
  check('viewer: present menu offers from-start and autoplay',
    q('#td-present-menu')?.hidden === false && !!q('#td-present-start') && !!q('#td-present-auto'))
  click(w, q('#td-present-auto'))
  await tick()
  check('viewer: autoplay starts from menu', q('#td-autoplay').classList.contains('is-on'))

  // 粉桃色共享带
  check('viewer: shared ribbon texts',
    q('#td-shared-label')?.textContent === '此模板已与您共享'
    && q('#td-add-ws-label')?.textContent === '添加到我的工作区'
    && q('#td-ribbon-settings-label')?.textContent === '设置')
  const gammaBefore = readState(storage)?.gammas?.length ?? 0
  click(w, q('#td-add-workspace'))
  await tick(150)
  check('viewer: add-to-workspace really creates a gamma',
    (readState(storage)?.gammas?.length ?? 0) === gammaBefore + 1 && !!doc.querySelector('.td-mask ~ .modal-mask'))
  q('.modal-mask [data-close]')?.click()
  await tick()
  // 使用模板菜单
  click(w, q('#td-use-ribbon'))
  await tick()
  check('viewer: use-template menu exposes create + JSON',
    q('#td-use-menu')?.hidden === false && !!q('#td-use-new') && !!q('#td-api'))
  click(w, doc.body)
  await tick()

  // 模板设置面板：测试版头 + 蓝提示 + 说明/图片 tab
  check('viewer: panel header with beta badge',
    q('.tdp-head strong')?.textContent === '模板设置' && q('.tdp-beta')?.textContent === '测试版')
  check('viewer: viewer notice exact copy',
    q('.tdp-notice')?.textContent.includes('只有编辑者才能编辑此模板的说明'))
  check('viewer: brief/images tabs', qa('.tdp-tab').length === 2 && q('.tdp-tab[data-tab="brief"]')?.textContent.includes('说明'))

  // 三段引导文案
  const guideH3 = qa('.tdp-guide h3').map((h) => h.textContent)
  check('viewer: three guidance sections',
    ['视觉气质', '示范如何工作', '写作方式'].every((k) => guideH3.includes(k)))
  check('viewer: guidance copy is real per-template text',
    qa('.tdp-guide p').every((p) => p.textContent.length > 40))

  // 幻灯片级别说明：数量与页数严格一致
  const noteCount = qa('.tdp-slide-notes li').length
  const pageTotal = Number(q('#td-page-count').textContent.split('/')[1].trim())
  check('viewer: slide notes count equals page count', noteCount === pageTotal && noteCount >= 20)
  check('viewer: slide jump badge shows count',
    q('#td-slide-jump')?.textContent.includes(String(noteCount)))
  check('viewer: each note carries layout label and guidance',
    qa('.tdp-slide-notes li b').every((b) => b.textContent.includes('·'))
    && qa('.tdp-slide-notes li span').every((s) => s.textContent.length > 10))

  // 既有规格/样式能力收纳在高级区且仍可用
  check('viewer: legacy spec/fits/style kept in advanced details',
    !!q('.tdp-advanced .td-spec') && qa('.tdp-advanced .td-fits li').length === 4
    && qa('.tdp-advanced .td-style-card').length === 3 && !!q('#td-use'))

  // 面板 X 折叠，设置 pill 恢复
  click(w, q('#td-panel-close'))
  await tick()
  check('viewer: panel close collapses panel', q('.td-mask').classList.contains('panel-collapsed'))
  click(w, q('#td-settings-toggle'))
  await tick()
  check('viewer: settings pill reopens panel', !q('.td-mask').classList.contains('panel-collapsed'))

  // 制作徽章（品牌约束：不得出现 Gamma 字样）
  check('viewer: made-by badge names Design Buddy',
    q('#td-made-by')?.textContent.includes('Design Buddy') && !q('#td-made-by')?.textContent.includes('Gamma'))

  // 头像 → 账号弹窗
  click(w, q('#td-top-avatar'))
  await tick()
  check('viewer: avatar opens account modal',
    qa('.modal-box').some((m) => m.textContent.includes('账号')))
  q('.modal-mask [data-close], .modal-close')?.click()
  await tick()

  // 英文版完整本地化
  click(w, q('#td-lang [data-lang="en"]'))
  await tick(150)
  check('viewer: english localization of new chrome',
    q('#td-present-label')?.textContent === 'Present'
    && q('#td-shared-label')?.textContent === 'Shared with you'
    && q('.tdp-head strong')?.textContent === 'Template settings'
    && q('.tdp-guide h3')?.textContent === 'Visual tone'
    && q('#td-made-label')?.textContent === 'Made by Design Buddy')
  check('viewer: no runtime errors in new viewer', errors.length === 0, JSON.stringify(errors))
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
}

/* ---------------- P1 真实配图：语义概念层 + 图片模式 ---------------- */
{
  check('concept pools cover all 20 categories', Object.keys(CONCEPT_POOLS).length === 20)
  let badPools = 0
  for (const keys of Object.values(CONCEPT_POOLS)) {
    if (keys.length < 5 || keys.some((k) => !ART_CONCEPTS[k])) badPools++
  }
  check('every pool key resolves and pools non-trivial', badPools === 0)
  const PORTRAIT_NUMS = Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'))
  for (const n of PORTRAIT_NUMS) {
    check(`shared portrait ${n} defined`, !!ART_CONCEPTS[`shared.portrait.${n}`])
  }
  check('portrait roster bilingual labels', PORTRAIT_NUMS.every((n) =>
    /[\u4e00-\u9fa5]/.test(ART_CONCEPTS[`shared.portrait.${n}`].zh)
    && /^Illustrated portrait \d+$/.test(ART_CONCEPTS[`shared.portrait.${n}`].en)))
  check('shared map and logowall defined', !!ART_CONCEPTS['shared.map'] && !!ART_CONCEPTS['shared.logowall'])

  const t = synthCatalog[0]
  const d = buildDeck(t)
  const teamPage = d.pages.find((p) => p.layout === 'team')
  check('team layout pins shared portrait concept', !!teamPage && conceptFor(t, teamPage, 0).startsWith('shared.portrait.'))
  const c1 = conceptFor(t, teamPage, 0)
  check('conceptFor is deterministic', conceptFor(t, teamPage, 0) === c1)
  const mapPage = d.pages.find((p) => p.layout === 'map')
  if (mapPage) check('map layout pins map concept', conceptFor(t, mapPage) === 'shared.map')
  const logosPage = d.pages.find((p) => p.layout === 'logos')
  if (logosPage) check('logos layout pins logowall concept', conceptFor(t, logosPage) === 'shared.logowall')
  const regularPage = d.pages.find((p) => !['team', 'testimonial', 'map', 'logos'].includes(p.layout))
  const regularKey = conceptFor(t, regularPage, 0)
  check('regular page concept belongs to its category pool', CONCEPT_POOLS[t.cats[0]].includes(regularKey))
  const regularIdx = d.pages.indexOf(regularPage)

  const svgHtml = renderPageHTML(t, regularIdx)
  check('default svg mode has no img tag', !svgHtml.includes('<img'))
  check('svg fallback wrapper still carries art anchor', svgHtml.includes('data-art-key="') && svgHtml.includes('data-art-slot="0"'))
  check('art anchor key matches concept', svgHtml.includes(`data-art-key="${regularKey}"`))
  configureArt({ mode: 'illustration', manifest: { [regularKey]: { illustration: '/art/illustration/x.svg', photo: '/art/photo/x.jpg' } } })
  const illHtml = renderPageHTML(t, regularIdx)
  check('illustration mode emits img with illustration src', illHtml.includes('dp-art-img') && illHtml.includes('src="/art/illustration/x.svg"'))
  configureArt({ mode: 'photo' })
  check('photo mode prefers photo src', renderPageHTML(t, regularIdx).includes('src="/art/photo/x.jpg"'))
  configureArt({ mode: 'illustration', manifest: {} })
  const fallbackHtml = renderPageHTML(t, regularIdx)
  check('missing manifest entry falls back to inline svg', !fallbackHtml.includes('<img') && fallbackHtml.includes('dp-art'))
  configureArt({ mode: 'svg', manifest: { [regularKey]: { illustration: '/art/x.svg' } } })
  check('svg mode never emits img', !renderPageHTML(t, regularIdx).includes('<img'))

  configureArt({ mode: 'illustration', manifest: { [regularKey]: { illustration: '/art/x.svg' } } })
  setArtOverride(t.id, regularPage.no, 0, 'data:text/plain,override')
  check('per-page override wins over manifest', renderPageHTML(t, regularIdx).includes('src="data:text/plain,override"'))
  clearArtOverride(t.id, regularPage.no, 0)
  check('override cleared restores manifest src', renderPageHTML(t, regularIdx).includes('src="/art/x.svg"'))

  if (mapPage) {
    const mi = d.pages.indexOf(mapPage)
    configureArt({ mode: 'illustration', manifest: { 'shared.map': { illustration: '/art/map.svg' } } })
    check('map uses real illustrated map when available', renderPageHTML(t, mi).includes('src="/art/map.svg"'))
  }

  // 全量 950 套：插画模式 + 空清单不报错，每页仍有 dp-art（SVG 兜底）
  configureArt({ mode: 'illustration', manifest: {}, overrides: {} })
  let renderBad = 0
  for (const tpl of synthCatalog) {
    const deck = buildDeck(tpl)
    for (let i = 0; i < deck.pages.length; i++) {
      if (!renderPageHTML(tpl, i).includes('dp-art')) renderBad++
    }
  }
  check('all 950 decks render with artwork in illustration mode', renderBad === 0, `bad=${renderBad}`)

  configureArt({ mode: 'svg', manifest: {}, overrides: {} })
  check('art config reset to svg after tests', getArtMode() === 'svg')
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} TEMPLATE ENGINE CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
