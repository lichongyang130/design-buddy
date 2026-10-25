/* ============================================================
   模板引擎专项：950 套目录 / 框架唯一性 / 页数配图 / 版式覆盖
   + 页面级交互：分页加载、类别筛选、幻灯翻页、样式换色
   ============================================================ */

import {
  buildCatalog, buildDeck, renderPageHTML, metaFor, coverStyle,
  CATEGORY_LIST, FRAMEWORKS, LAYOUTS,
} from '../src/template-engine.js'
import { loadPage, click, input, tick } from './helpers.mjs'

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
  // 每张配图至少被使用一次
  const used = new Set()
  const IMG = new Set(['cover', 'divider', 'hero', 'split', 'two-image', 'triple-grid', 'cards', 'gallery', 'team', 'testimonial', 'quote', 'closing'])
  deck.pages.forEach((p) => {
    if (!IMG.has(p.layout)) return
    const need = p.layout === 'gallery' ? 4 : ['triple-grid', 'team'].includes(p.layout) ? 3 : p.layout === 'two-image' ? 2 : 1
    for (let k = 0; k < need; k++) used.add((p.imgStart + k) % deck.images.length)
  })
  check(`deck ${t.name} every image used at least once`, used.size === t.imgCount, [...used].join(','))
  // 渲染全部页面不炸
  const html = deck.pages.map((_, i) => renderPageHTML(t, i, i % 3)).join('')
  check(`deck ${t.name} all pages render`, html.includes('dp-page') && html.includes('data-layout'))
  const meta = metaFor(t)
  check(`deck ${t.name} meta spec consistent`, meta.spec.pages === t.pageCount && meta.spec.images === t.imgCount && meta.colors.length === 3)
}
check('all 26 layouts covered across sample', layoutSeen.size === 26, [...layoutSeen].join(','))

// 精选模板也能生成 deck（由名称哈希推导）
const curatedLike = { id: 'x1', name: '渔港日记', a: '石', b: 'SHIPU', format: '演示文稿', cats: ['文化'] }
const cDeck = buildDeck(curatedLike)
check('curated template gets generated deck', cDeck.pages.length >= 20 && cDeck.images.length >= 10)
check('curated deck renders', renderPageHTML(curatedLike, 0).includes('lay-cover'))

/* ---------------- 页面级交互 ---------------- */

{
  const { doc, w, errors } = await loadPage('/templates.html')
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
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} TEMPLATE ENGINE CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
