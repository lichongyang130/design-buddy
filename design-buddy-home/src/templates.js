/* ============================================================
   探索模板页：筛选 / 搜索 / 排序保留，套用模板真实生成 gamma
   侧栏四个视图：工作区模板 / 最近 / 由您创建 / 已归档（持久化）
   ============================================================ */

import './rail-flyout.js'
import { store, toast, openModal, confirmModal, uid, fmtDate, copyText } from './core.js'
import { initGlobalUI, openUpgrade } from './global-ui.js'
import {
  buildCatalog, buildDeck, renderPageHTML, metaFor, coverStyle, coverDeco,
  displayTpl, catLabel, VISIBLE_CATS, HIDDEN_CATS, configureArt,
  getArtManifest, setArtOverride, clearArtOverride,
} from './template-engine.js'
import { ART_CONCEPTS, conceptLabel } from './art-concepts.js'

initGlobalUI()

/* 语言状态（持久化）：zh | en */
store.state.templateLang ??= 'zh'
/* 配图模式（持久化）：illustration 绘本插画（默认）| photo 真实照片 | svg 经典 SVG */
store.state.imageMode ??= 'illustration'
/* 单页换图覆盖（持久化）：键 `${deckId}:${pageNo}:${slot}` → 素材 URL/dataURL */
store.state.artOverrides ??= {}
configureArt({ mode: store.state.imageMode, overrides: store.state.artOverrides })
// 加载构建期素材清单；缺失/离线时静默失败，引擎自动回退内联 SVG
// 用 document.baseURI 拼绝对地址，保证 jsdom/Node fetch 与子路径部署都能解析
const manifestUrl = new URL('art/manifest.json', document.baseURI).href
fetch(manifestUrl)
  .then((r) => (r.ok ? r.json() : null))
  .then((m) => { if (m?.concepts) configureArt({ manifest: m.concepts }) })
  .catch(() => {})
const lang = () => (store.state.templateLang === 'en' ? 'en' : 'zh')
const UI = {
  zh: {
    loadMore: '加载更多', shown: (a, b) => `已显示 ${a} / ${b} 套`,
    badge: (p, i) => `${p} 页 · ${i} 图`,
    empty: {
      recent: ['还没有用过模板', '套用任意模板后，它会自动出现在「最近」里。'],
      mine: ['还没有自建模板', '点击侧栏底部的「新建模板」，把常用结构沉淀下来。'],
      archived: ['归档中没有模板', '自建模板可在卡片菜单中归档，之后在这里恢复。'],
      workspace: ['没有匹配的模板', '试试调整筛选或搜索关键词。'],
    },
    panel: {
      back: '返回模板', provider: '由 Design Buddy 提供', bestFor: '最适合', style: '样式',
      category: '分类', theme: '主题', spec: '规格', pages: '个页面', images: '张配图',
      use: '使用模板', resetEdits: '重置本模板编辑', noEditsHint: '点击幻灯中的任意文字即可直接编辑，修改会自动保存。',
      autoplay: '自动播放',
    },
    showMore: (n) => `显示更多 ${n}`, collapse: '收起',
    artPicker: {
      title: '替换配图', hint: '从插画库选择，或上传自有图片',
      upload: '上传图片', reset: '恢复默认', current: '当前', done: '配图已替换',
      resetDone: '已恢复默认配图', empty: '素材库暂未就绪，仍可上传自有图片',
    },
  },
  en: {
    loadMore: 'Load more', shown: (a, b) => `Showing ${a} / ${b}`,
    badge: (p, i) => `${p} slides · ${i} imgs`,
    empty: {
      recent: ['No templates used yet', 'Once you apply a template, it shows up here in Recent.'],
      mine: ['No custom templates yet', 'Use “New template” at the bottom of the sidebar to save your own.'],
      archived: ['Archive is empty', 'Custom templates can be archived from the card menu and restored here.'],
      workspace: ['No matching templates', 'Try adjusting filters or search keywords.'],
    },
    panel: {
      back: 'Back to templates', provider: 'Provided by Design Buddy', bestFor: 'Best for', style: 'Style',
      category: 'Category', theme: 'Theme', spec: 'Specs', pages: 'slides', images: 'images',
      use: 'Use template', resetEdits: 'Reset edits', noEditsHint: 'Click any text in the slides to edit it — changes save automatically.',
      autoplay: 'Autoplay',
    },
    showMore: (n) => `Show more ${n}`, collapse: 'Collapse',
    artPicker: {
      title: 'Replace artwork', hint: 'Pick from the illustration library or upload your own image',
      upload: 'Upload image', reset: 'Restore default', current: 'Current', done: 'Artwork replaced',
      resetDone: 'Default artwork restored', empty: 'Library is not ready yet — you can still upload your own image',
    },
  },
}
const uiText = () => UI[lang()]

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

/* ---------------- 内置 24 套模板 ---------------- */

const CATEGORIES_VISIBLE = VISIBLE_CATS
const CATEGORIES_HIDDEN = HIDDEN_CATS

const TEMPLATES = [
  { name: '渔港日记', cls: 'tpl-shipu', a: '石', b: 'SHIPU', format: '演示文稿', cats: ['文化', '营销材料'] },
  { name: '水墨亭', cls: 'tpl-ink', a: '澄湖', b: 'INK PAVILION', format: '文档', cats: ['文化', '艺术'] },
  { name: 'Overtime', cls: 'tpl-overtime', a: '年终大复盘！', b: 'Phew!! Still cooking', format: '演示文稿', cats: ['培训', '商业规划'] },
  { name: '朱砂册页', cls: 'tpl-cinnabar', a: '茶事雅集', b: '', format: '社交轮播卡片', cats: ['文化', '活动'] },
  { name: '讲堂', cls: 'tpl-lecture', a: '城市生态：六周观察课', b: 'URBAN ECOLOGY', format: '演示文稿', cats: ['课程', '教育'] },
  { name: '国潮商务路演', cls: 'tpl-guochao', a: '用调度效率提升每一块算力的产出', b: '', format: '演示文稿', cats: ['融资演讲稿', '商业规划'] },
  { name: 'Quire', cls: 'tpl-quire', a: 'Back of House', b: '2026 RESTAURANT SURVEY', format: '文档', cats: ['报告', '餐饮'] },
  { name: 'Full Record', cls: 'tpl-fullrecord', a: 'Amara Osei', b: 'FULL RECORD', format: '文档', cats: ['作品集', '品牌设计'] },
  { name: 'Fit Check', cls: 'tpl-fitcheck', a: 'HOMEROOM', b: 'GENERAL UNIFORM POLICY', format: '演示文稿', cats: ['融资演讲稿', '营销材料', '作品集'] },
  { name: 'First Edition', cls: 'tpl-firstedition', a: 'Salt and Lemon', b: 'FIRST EDITION', format: '文档', cats: ['作品集', '艺术'] },
  { name: 'The Web Between Us', cls: 'tpl-web', a: 'THE WEB BETWEEN US', b: '', format: '社交轮播卡片', cats: ['科技', '艺术'] },
  { name: 'Soft Current', cls: 'tpl-soft', a: 'Migraine is more than a headache', b: '', format: '社交轮播卡片', cats: ['医疗健康', '课程'] },
  { name: 'Spark and Fire', cls: 'tpl-spark', a: '', b: 'SPARK AND FIRE', format: '演示文稿', cats: ['培训', '活动'] },
  { name: 'Scintilla', cls: 'tpl-scintilla', a: 'The secret life of pollinators', b: '', format: '演示文稿', cats: ['教育', '科技'] },
  { name: 'Sisyphus Riso', cls: 'tpl-sisyphus', a: 'FIND DELIGHT IN PUSHING YOUR ROCK UP YOUR HILL', b: '', format: '演示文稿', cats: ['培训', '商业规划'] },
  { name: 'Rebuilding the Past', cls: 'tpl-rebuilding', a: 'Rebuilding the Past', b: '', format: '演示文稿', cats: ['报告', '建筑'] },
  { name: 'Metamorphosis', cls: 'tpl-metamorphosis', a: '', b: 'METAMORPHOSIS', format: '社交轮播卡片', cats: ['艺术', '品牌设计'] },
  { name: 'Luminal', cls: 'tpl-luminal', a: 'The quiet cascade', b: '', format: '演示文稿', cats: ['作品集', '艺术'] },
  { name: 'Inner Weather', cls: 'tpl-inner', a: '', b: 'INNER WEATHER', format: '文档', cats: ['课程', '医疗健康'] },
  { name: 'Hush', cls: 'tpl-hush', a: 'Our year at the Brierley Institute', b: '', format: '文档', cats: ['报告', '文化'] },
  { name: 'Buzzer', cls: 'tpl-buzzer', a: 'TRIVIA NIGHT', b: 'Harper Street Library · Friday March 14', format: '演示文稿', cats: ['活动', '餐饮'] },
  { name: 'Vista', cls: 'tpl-vista', a: 'Kalai Retreat', b: '', format: '演示文稿', cats: ['旅游', '建筑'] },
  { name: 'Open House', cls: 'tpl-openhouse', a: '214 Birchwood Lane', b: '', format: '演示文稿', cats: ['建筑', '营销材料'] },
  { name: 'Monsoon Modern', cls: 'tpl-monsoon', a: 'A SEASON OF MAKING TOGETHER', b: '', format: '社交轮播卡片', cats: ['活动', '品牌设计'] },
]

const FOLDER_ICON = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`

/* ---------------- 模板详情元数据（描述 / 最适合 / 样式色 / 主题） ---------------- */

const RATIO_LABEL = { 演示文稿: '16:9', 文档: 'A4', 社交轮播卡片: '1:1' }

const TPL_META = {
  渔港日记: {
    desc: 'A quiet editorial layout built around harbor photography and warm sea-side tones, designed for stories that unfold like a hand-kept diary.',
    fits: ['travel journals and city guides', 'cultural and heritage storytelling', 'seafood and hospitality brand stories', 'photo-led editorial essays'],
    colors: ['#1f5f6b', '#5fa8b5', '#f0e2c8'], themes: ['人文', '旅行'],
  },
  水墨亭: {
    desc: 'An ink-wash inspired template with generous whitespace and serif headlines, echoing the calm rhythm of a traditional Chinese pavilion.',
    fits: ['art exhibitions and gallery guides', 'cultural lectures and salons', 'tea and lifestyle branding', 'book launch presentations'],
    colors: ['#2c3a36', '#8aa39b', '#f4f1ea'], themes: ['艺术', '文化'],
  },
  Overtime: {
    desc: 'A playful retro deck for year-end reviews, pairing bold condensed type with sticker-like accents that keep retrospectives light and energetic.',
    fits: ['annual and quarterly reviews', 'team retrospectives', 'training session recaps', 'internal all-hands meetings'],
    colors: ['#e8603c', '#2b2f38', '#f6c959'], themes: ['商业', '培训'],
  },
  朱砂册页: {
    desc: 'Cinnabar red accents on rice-paper neutrals, a social carousel format that turns tea ceremonies and cultural events into scrollable albums.',
    fits: ['event invitations', 'festival and holiday campaigns', 'cultural institution promotions', 'social media carousels'],
    colors: ['#b03a2e', '#efe7d8', '#3d4a42'], themes: ['艺术', '文化'],
  },
  讲堂: {
    desc: 'A clear educational deck with structured lesson blocks and calm greens, made for multi-week courses and science communication.',
    fits: ['online courses and curriculum decks', 'education program overviews', 'workshop and seminar materials', 'science communication'],
    colors: ['#3f7d5c', '#e6efe8', '#1f3d2e'], themes: ['教育', '科技'],
  },
  国潮商务路演: {
    desc: 'Modern guochao styling meets a serious investor deck: dark premium canvases, gold accents and data-forward slides for high-stakes pitches.',
    fits: ['investor fundraising pitches', 'product launch keynotes', 'technology roadshows', 'business plan competitions'],
    colors: ['#14213d', '#c9a24b', '#e9ecef'], themes: ['商业', '科技'],
  },
  Quire: {
    desc: 'A restrained document template for surveys and reports, using a deep navy cover, fine rules and readable long-form typography.',
    fits: ['industry research reports', 'market survey documents', 'annual summaries', 'consulting deliverables'],
    colors: ['#27314f', '#8b93a7', '#f4f6fa'], themes: ['商业', '餐饮'],
  },
  'Full Record': {
    desc: 'An editorial portfolio document with full-bleed imagery and confident captions, built to document a body of work cover to cover.',
    fits: ['creator and photographer portfolios', 'brand books and guidelines', 'project case studies', 'agency credentials'],
    colors: ['#1d1f24', '#b9b2a6', '#f7f5f0'], themes: ['艺术', '商业'],
  },
  'Fit Check': {
    desc: 'A playful retro-kitsch lookbook presentation: pistachio-mint ground, poster-weight condensed caps, rounded keylined photo frames, candy-pink pill stickers, argyle ribbon borders, and product cutouts on pastel fields.',
    fits: ['fashion collection and drop launches', 'lookbooks and wholesale previews', 'brand and campaign pitches to buyers', 'creator and stylist portfolios', 'student design and merch presentations'],
    colors: ['#a9d8bb', '#1f2d24', '#ef8fb0'], themes: ['艺术', '商业'],
  },
  'First Edition': {
    desc: 'A zine-style first edition layout with salt-and-lemon freshness: bright paper tones, oversized numerals and collectible cover energy.',
    fits: ['magazine and zine launches', 'brand editorial series', 'product launch lookbooks', 'limited edition releases'],
    colors: ['#f2e3a0', '#2e3a34', '#e77f67'], themes: ['艺术', '文化'],
  },
  'The Web Between Us': {
    desc: 'A bold cyan social carousel that visualizes technology and ecology together, with spider-web line art and high-contrast editorial type.',
    fits: ['technology explainers', 'digital awareness campaigns', 'social content series', 'creative tech portfolios'],
    colors: ['#27b8e6', '#0e2433', '#f2f7fa'], themes: ['科技', '艺术'],
  },
  'Soft Current': {
    desc: 'A gentle health-awareness deck with soft organic shapes and warm skin-tone palettes, handling sensitive topics with calm and clarity.',
    fits: ['healthcare awareness campaigns', 'wellness education programs', 'nonprofit advocacy decks', 'course materials'],
    colors: ['#7fb6a8', '#f3d9c6', '#33504a'], themes: ['医疗', '教育'],
  },
  'Spark and Fire': {
    desc: 'A warm event deck lit by flame-orange accents, structured for workshops and training sessions that need energy without clutter.',
    fits: ['workshop and training decks', 'event programs and agendas', 'community meetups', 'internal kick-offs'],
    colors: ['#e8702a', '#233047', '#f6e7d8'], themes: ['培训', '活动'],
  },
  Scintilla: {
    desc: 'A science-forward presentation about pollinators, pairing macro-photo style artwork with clean diagrams and luminous blue highlights.',
    fits: ['science education lessons', 'ecology and research reports', 'school and university projects', 'research showcases'],
    colors: ['#3a7bd5', '#e8f1fb', '#1d3557'], themes: ['教育', '科技'],
  },
  'Sisyphus Riso': {
    desc: 'A risograph-inspired deck in limited duotone inks, turning stubborn business topics into motivating, poster-worthy slides.',
    fits: ['training and workshop decks', 'business planning reviews', 'keynote presentations', 'team motivation sessions'],
    colors: ['#e0552f', '#2b4a7a', '#f4ecd8'], themes: ['培训', '商业'],
  },
  'Rebuilding the Past': {
    desc: 'An architecture and heritage report template with documentary photography, muted stone tones and precise drawing-style layouts.',
    fits: ['architecture portfolios', 'heritage preservation reports', 'construction project reviews', 'urban planning studies'],
    colors: ['#8c8578', '#3e4148', '#ece9e2'], themes: ['建筑', '报告'],
  },
  Metamorphosis: {
    desc: 'A transformative social carousel with surreal gradient fields and fluid shapes, designed for brand campaigns that signal change.',
    fits: ['brand transformation campaigns', 'art and design showcases', 'product reveal carousels', 'social media series'],
    colors: ['#8b5cf6', '#f472b6', '#1f2430'], themes: ['艺术', '品牌'],
  },
  Luminal: {
    desc: 'A quiet, light-filled portfolio deck where imagery floats in negative space, suited to refined creative showcases.',
    fits: ['creative and design portfolios', 'gallery exhibition decks', 'project showcases', 'design reviews'],
    colors: ['#c9d6e3', '#41566f', '#fbfcfd'], themes: ['艺术', '作品集'],
  },
  'Inner Weather': {
    desc: 'A document-style health template that reads like a calm guidebook, with soft section dividers and approachable medical typography.',
    fits: ['course handouts and workbooks', 'health and wellness guides', 'patient education documents', 'self-paced learning docs'],
    colors: ['#9fc3b8', '#f6efe6', '#405e55'], themes: ['教育', '医疗'],
  },
  Hush: {
    desc: 'A dignified annual report document for institutes and nonprofits, pairing understated type with generous impact photography.',
    fits: ['annual and impact reports', 'nonprofit year reviews', 'donor update documents', 'institute publications'],
    colors: ['#4a5568', '#c0564f', '#f3f1ec'], themes: ['报告', '文化'],
  },
  Buzzer: {
    desc: 'A trivia-night event deck with retro game-board energy, bold cards and quick-read prompts that keep a live audience engaged.',
    fits: ['event and game-night decks', 'community program materials', 'F&B promotions', 'interactive workshops'],
    colors: ['#d64545', '#1f2d4d', '#f5c542'], themes: ['活动', '餐饮'],
  },
  Vista: {
    desc: 'An airy travel and hospitality deck with panoramic image frames, evoking the open horizons of a retreat venue.',
    fits: ['travel and tourism decks', 'retreat and venue pitches', 'hospitality promotions', 'architecture showcases'],
    colors: ['#5b8e7d', '#e9ddc7', '#2f4858'], themes: ['旅行', '建筑'],
  },
  'Open House': {
    desc: 'A clean real-estate marketing deck with property-forward layouts, warm domestic neutrals and clear call-to-action closing slides.',
    fits: ['property launch decks', 'real estate marketing', 'open house event materials', 'sales and listing presentations'],
    colors: ['#b08968', '#f1e9dd', '#3d4044'], themes: ['建筑', '营销'],
  },
  'Monsoon Modern': {
    desc: 'A seasonal campaign carousel blending modernist grids with rain-washed indigos, made for collaborative making and storytelling.',
    fits: ['seasonal marketing campaigns', 'brand storytelling carousels', 'event invitations', 'social content series'],
    colors: ['#3957a8', '#7fb2e5', '#f2eadf'], themes: ['活动', '品牌'],
  },
}

const DEFAULT_META = {
  desc: '由你创建的自定义模板，保存了封面配色与内容结构，可随时套用于新的创作。',
  fits: ['快速启动同类型创作', '保持团队视觉统一', '沉淀常用页面结构', '一键生成新 Design Buddy'],
  colors: ['#3b6ef6', '#1e2b4d', '#98a1b2'], themes: ['自定义', '品牌'],
}

const view = {
  scope: 'workspace', // workspace | recent | mine | archived
  format: 'all',
  categories: new Set(),
  query: '',
  sort: 'date',
}

function setTemplateLang(next) {
  if (next === lang()) return
  store.state.templateLang = next
  store.save()
  updateCategoryLabels()
  syncToolbarLang()
  applyView()
}

/* 工具栏语言切换（与详情弹层内的切换共享同一状态） */
const toolbarLang = document.createElement('div')
toolbarLang.className = 'td-lang tpl-lang'
toolbarLang.setAttribute('role', 'group')
toolbarLang.setAttribute('aria-label', 'Language')
toolbarLang.innerHTML = '<button type="button" data-lang="zh">中文</button><button type="button" data-lang="en">EN</button>'
$('.sort-wrap').before(toolbarLang)
function syncToolbarLang() {
  toolbarLang.querySelectorAll('[data-lang]').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.lang === lang())
  })
}
toolbarLang.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-lang]')
  if (btn) setTemplateLang(btn.dataset.lang)
})
syncToolbarLang()

/* ---------------- 类别清单 ---------------- */

const categoryBody = $('#category-body')

function categoryRow(name, count) {
  const label = document.createElement('label')
  label.className = 'filter-option'
  label.innerHTML = `
    <input type="checkbox" value="${name}" />
    <span class="cat-label" data-cat="${name}">${catLabel(name, lang())}</span>
    ${count ? `<span class="count">${count}</span>` : ''}`
  return label
}

function updateCategoryLabels() {
  categoryBody.querySelectorAll('.cat-label').forEach((el) => {
    el.textContent = catLabel(el.dataset.cat, lang())
  })
  catToggle.textContent = extraWrap.hidden ?uiText().showMore(CATEGORIES_HIDDEN.length) :uiText().collapse
}

// 类别计数由目录动态统计（每类 50 套生成模板 + 手工精选命中项）
const CAT_COUNTS = new Map()
for (const t of allTemplates()) {
  for (const c of t.cats ?? []) CAT_COUNTS.set(c, (CAT_COUNTS.get(c) ?? 0) + 1)
}
for (const name of CATEGORIES_VISIBLE) categoryBody.appendChild(categoryRow(name, CAT_COUNTS.get(name) ?? 0))
const extraWrap = document.createElement('div')
extraWrap.className = 'cat-extra'
extraWrap.hidden = true
for (const name of CATEGORIES_HIDDEN) extraWrap.appendChild(categoryRow(name, CAT_COUNTS.get(name) ?? 0))
categoryBody.appendChild(extraWrap)

const catToggle = document.createElement('button')
catToggle.type = 'button'
catToggle.className = 'cat-toggle'
catToggle.textContent = `显示更多 ${CATEGORIES_HIDDEN.length}`
categoryBody.appendChild(catToggle)
catToggle.addEventListener('click', () => {
  const expanded = !extraWrap.hidden
  extraWrap.hidden = expanded
  catToggle.textContent = expanded ?uiText().showMore(CATEGORIES_HIDDEN.length) :uiText().collapse
})

/* ---------------- 数据集合 ---------------- */

function allTemplates() {
  const customs = (store.state.customTemplates ?? []).map((t) => ({ ...t, custom: true }))
  // 24 套手工精选在前，950 套引擎生成模板随后，自建模板最后
  return [...TEMPLATES, ...buildCatalog(), ...customs]
}

function scopedTemplates() {
  const customs = store.state.customTemplates
  switch (view.scope) {
    case 'recent': {
      const used = store.state.gammas
        .filter((g) => g.template)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((g) => g.template)
      const uniq = [...new Set(used)]
      return uniq.map((name) => allTemplates().find((t) => t.name === name)).filter(Boolean)
    }
    case 'mine':
      return customs.filter((t) => !t.archived)
    case 'archived':
      return customs.filter((t) => t.archived)
    default:
      return allTemplates().filter((t) => !t.archived)
  }
}

/* ---------------- 网格渲染 ---------------- */

const grid = $('#tpl-grid')
const empty = $('#tpl-empty')
const PAGE_SIZE = 24
let pageLimit = PAGE_SIZE
let currentItems = []

function coverClass(tpl) {
  if (tpl.cls) return tpl.cls
  if (tpl.gen) return 'tpl-gen'
  return 'tpl-custom'
}

function pageBadge(tpl) {
  if (!tpl.gen) return ''
  const meta = metaFor(tpl, lang())
  return `<span class="tc-page-badge">${uiText().badge(meta.spec.pages, meta.spec.images)}</span>`
}

function renderGrid(items) {
  currentItems = items
  const visible = items.slice(0, pageLimit)
  grid.innerHTML = visible.map((tpl) => `
    <article class="tpl-card" data-name="${tpl.name}" ${tpl.custom ? `data-custom="${tpl.id}"` : ''}>
      ${coverHTML(tpl)}
      <p class="tpl-name">${FOLDER_ICON}<span>${displayTpl(tpl, lang()).name}</span></p>
    </article>`).join('')
  const none = items.length === 0
  empty.hidden = !none
  grid.hidden = none
  updateLoadMore(items.length)
  if (none) {
    const [title, copy] = uiText().empty[view.scope]
    empty.querySelector('p').textContent = lang() === 'en' ? `${title}. ${copy}` : `${title}。${copy}`
  }
}

/* 分页：加载更多 */
const moreWrap = document.createElement('div')
moreWrap.className = 'tpl-more-wrap'
moreWrap.hidden = true
moreWrap.innerHTML = `<button class="btn btn-ghost" id="tpl-more" type="button">${UI.zh.loadMore}</button><p class="tpl-more-count" id="tpl-more-count"></p>`
grid.after(moreWrap)

function updateLoadMore(total) {
  const hasMore = pageLimit < total
  moreWrap.hidden = !hasMore
  moreWrap.querySelector('#tpl-more').textContent =uiText().loadMore
  if (hasMore) {
    moreWrap.querySelector('#tpl-more-count').textContent =uiText().shown(Math.min(pageLimit, total), total)
  }
}

moreWrap.querySelector('#tpl-more').addEventListener('click', () => {
  pageLimit += PAGE_SIZE
  renderGrid(currentItems)
  // 新卡片进入视口时的轻量动效
  grid.querySelectorAll('.tpl-card').forEach((card, i) => {
    if (i >= pageLimit - PAGE_SIZE) card.classList.add('is-fresh')
  })
})

function applyView() {
  pageLimit = PAGE_SIZE
  let items = scopedTemplates().filter((tpl) => {
    const formatOk = view.format === 'all' || tpl.format === view.format
    const catOk = view.categories.size === 0 || tpl.cats.some((c) => view.categories.has(c))
    const queryOk = !view.query
      || tpl.name.toLowerCase().includes(view.query)
      || displayTpl(tpl, 'en').name.toLowerCase().includes(view.query)
      || (tpl.a ?? '').toLowerCase().includes(view.query)
    return formatOk && catOk && queryOk
  })
  if (view.sort === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
  renderGrid(items)
}

/* ---------------- 侧栏视图切换 ---------------- */

$$('[data-demo]').forEach((nav) => {
  if (!['工作区模板', '最近', '由您创建', '已归档'].includes(nav.dataset.demo)) return
  nav.addEventListener('click', (e) => {
    e.preventDefault()
    view.scope = { 工作区模板: 'workspace', 最近: 'recent', 由您创建: 'mine', 已归档: 'archived' }[nav.dataset.demo]
    $$('.tpl-side-nav .nav-item, .sidebar .nav-item').forEach((n) => n.classList.remove('nav-item-active'))
    nav.classList.add('nav-item-active')
    applyView()
  })
})

/* ---------------- 筛选 / 搜索 / 排序 ---------------- */

$$('input[name="format"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    view.format = radio.value
    applyView()
  })
})

categoryBody.addEventListener('change', (event) => {
  const box = event.target
  if (!box || box.nodeName !== 'INPUT' || box.type !== 'checkbox') return
  if (box.checked) view.categories.add(box.value)
  else view.categories.delete(box.value)
  applyView()
})

$('#tpl-search-input').addEventListener('input', (event) => {
  view.query = event.target.value.trim().toLowerCase()
  applyView()
})

const sortBtn = $('#sort-btn')
const sortMenu = $('#sort-menu')
const sortLabel = $('#sort-label')

sortBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  sortMenu.hidden = !sortMenu.hidden
  sortBtn.setAttribute('aria-expanded', String(!sortMenu.hidden))
})
document.addEventListener('click', () => {
  sortMenu.hidden = true
  sortBtn.setAttribute('aria-expanded', 'false')
})
sortMenu.addEventListener('click', (event) => {
  const option = event.target.closest('.sort-option')
  if (!option) return
  view.sort = option.dataset.sort
  sortLabel.textContent = option.textContent.trim()
  $$('.sort-option', sortMenu).forEach((btn) => btn.classList.toggle('is-selected', btn === option))
  sortMenu.hidden = true
  applyView()
})

$$('.filter-head').forEach((head) => {
  head.addEventListener('click', () => head.closest('.filter-group').classList.toggle('collapsed'))
})

$('#tpl-reset').addEventListener('click', () => {
  view.format = 'all'
  view.categories.clear()
  view.query = ''
  const allRadio = $('input[name="format"][value="all"]')
  if (allRadio) allRadio.checked = true
  $$('input[type="checkbox"]', categoryBody).forEach((box) => { box.checked = false })
  $('#tpl-search-input').value = ''
  applyView()
  toast('已清除全部筛选条件')
})

/* ---------------- 套用模板：真实生成 gamma ---------------- */

function useTemplate(tpl) {
  const cost = 3
  if (store.state.credits < cost) {
    confirmModal('积分不足', `套用模板需要 ${cost} 积分，当前仅剩 ${store.state.credits} 积分。是否前往充值？`, '去充值').then((ok) => {
      if (ok) openUpgrade()
    })
    return
  }
  const now = Date.now()
  const prompt = `使用「${tpl.name}」模板创作一份${tpl.format}`
  store.state.credits -= cost
  const gamma = {
    id: uid('g'),
    title: `模板创作 · ${tpl.name}`,
    prompt,
    type: tpl.format,
    mode: '标准',
    imgMode: '自动',
    expert: null,
    template: tpl.name,
    origin: 'template',
    attachments: [],
    folderId: null,
    shared: false,
    deleted: false,
    createdAt: now,
    updatedAt: now,
  }
  store.state.gammas.unshift(gamma)
  store.state.conversations.unshift({ id: uid('c'), gammaId: gamma.id, title: gamma.title, at: now })
  store.save()

  const { close, bodyEl, footEl } = openModal({
    title: `已套用模板 · ${tpl.name}`,
    body: `
      <p class="modal-copy">Design Buddy 已创建并保存到当前工作区，消耗 ${cost} 积分（剩余 ${store.state.credits}）。</p>
      <p class="hint" style="margin-top:10px">创建时间：${fmtDate(now)}</p>
      <p class="hint">类型：${tpl.format} · 分类：${tpl.cats.join(' / ')}</p>`,
    footer: '<button class="btn btn-ghost" data-close>继续浏览</button><button class="btn btn-primary" data-go>回到首页查看</button>',
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
  footEl.querySelector('[data-go]').addEventListener('click', () => { location.href = 'index.html' })
  bodyEl // 保留引用，避免静态检查告警
}

grid.addEventListener('click', (event) => {
  const card = event.target.closest('.tpl-card')
  if (!card) return
  const tpl = allTemplates().find((t) => t.name === card.dataset.name)
  if (tpl) openTemplateDetail(tpl)
})

/* ---------------- 模板详情预览弹层（按截图 1:1） ---------------- */

store.state.templateStyles ??= {}

function coverInner(tpl) {
  return `${tpl.custom ? '<span class="tc-custom-tag">我的模板</span>' : ''}
    ${tpl.a ? `<span class="tc-a">${tpl.a}</span>` : ''}
    ${tpl.b ? `<span class="tc-b">${tpl.b}</span>` : ''}`
}

function coverHTML(tpl) {
  if (tpl.gen) {
    const d = displayTpl(tpl, lang())
    return `<div class="tpl-cover tpl-gen" data-deco="${coverDeco(tpl)}" style="${coverStyle(tpl)}">
      <span class="tc-deco" aria-hidden="true"></span>
      ${d.a ? `<span class="tc-a">${d.a}</span>` : ''}
      ${d.b ? `<span class="tc-b">${d.b}</span>` : ''}
      ${pageBadge(tpl)}
    </div>`
  }
  return `<div class="tpl-cover ${coverClass(tpl)}" ${tpl.cover ? `style="--custom-cover:${tpl.cover}"` : ''}>${coverInner(tpl)}</div>`
}

function openTemplateDetail(tpl) {
  const list = allTemplates()
  let idx = list.findIndex((t) => t.name === tpl.name)
  if (idx < 0) idx = 0
  let pageIdx = 0
  let autoplay = false
  let timer = null
  const THUMB_WINDOW = 12
  const PAGE_WINDOW = 9

  const mask = document.createElement('div')
  mask.className = 'td-mask'
  mask.innerHTML = `
    <button class="td-back" id="td-back" type="button">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      <span id="td-back-label">返回模板</span>
    </button>
    <button class="td-close" type="button" aria-label="关闭">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
    </button>
    <div class="td-left">
      <div class="td-deck-bar">
        <span class="td-frame-badge" id="td-frame"></span>
        <span class="td-page-count" id="td-page-count"></span>
        <div class="td-lang" id="td-lang" role="group" aria-label="Language">
          <button type="button" data-lang="zh">中文</button>
          <button type="button" data-lang="en">EN</button>
        </div>
        <button class="td-autoplay" id="td-autoplay" type="button" aria-pressed="false">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <span id="td-autoplay-label">自动播放</span>
        </button>
      </div>
      <div class="td-stage" id="td-stage">
        <button class="td-page-arrow" id="td-page-prev" type="button" aria-label="上一页">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="td-deck" id="td-deck"></div>
        <button class="td-page-arrow" id="td-page-next" type="button" aria-label="下一页">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div class="td-progress"><i id="td-progress-i"></i></div>
      <div class="td-pages" id="td-pages"></div>
      <div class="td-carousel-wrap">
        <button class="td-arrow" id="td-prev" type="button" aria-label="上一个模板">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="td-carousel" id="td-carousel"></div>
        <button class="td-arrow" id="td-next" type="button" aria-label="下一个模板">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
    <aside class="td-panel" id="td-panel"></aside>`
  document.body.append(mask)
  document.body.style.overflow = 'hidden'

  const deckEl = mask.querySelector('#td-deck')
  const panel = mask.querySelector('#td-panel')
  const carousel = mask.querySelector('#td-carousel')
  const pageCountEl = mask.querySelector('#td-page-count')
  const frameEl = mask.querySelector('#td-frame')
  const progressEl = mask.querySelector('#td-progress-i')
  const pagesStrip = mask.querySelector('#td-pages')
  const autoBtn = mask.querySelector('#td-autoplay')

  const cur = () => list[idx]
  const styleIdxOf = (t) => store.state.templateStyles[t.name] ?? 0

  /* 内联编辑持久化：templateEdits[模板名][语言][页码][字段键] */
  store.state.templateEdits ??= {}
  const editRoot = (tpl) => (store.state.templateEdits[tpl.name] ??= {})
  const pageEdits = (tpl, locale, pi) => ((editRoot(tpl)[locale] ??= {})[pi] ??= {})
  const hasEdits = (tpl, locale) => {
    const root = editRoot(tpl)[locale]
    return !!root && Object.values(root).some((m) => m && Object.keys(m).length)
  }

  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null }
    autoplay = false
    autoBtn.classList.remove('is-on')
    autoBtn.setAttribute('aria-pressed', 'false')
  }
  function startAuto() {
    stopAuto()
    autoplay = true
    autoBtn.classList.add('is-on')
    autoBtn.setAttribute('aria-pressed', 'true')
    timer = setInterval(() => goPage(1), 2600)
  }

  function renderDeck() {
    const t = cur()
    const locale = lang()
    configureArt({ mode: store.state.imageMode ?? 'illustration', overrides: store.state.artOverrides })
    const deck = buildDeck(t, locale)
    if (pageIdx >= deck.pages.length) pageIdx = 0
    const edits = pageEdits(t, locale, pageIdx)
    deckEl.innerHTML = renderPageHTML(t, pageIdx, styleIdxOf(t), locale, edits)
    deckEl.querySelector('.dp-page')?.classList.add('is-shown')
    pageCountEl.textContent = `${String(pageIdx + 1).padStart(2, '0')} / ${String(deck.pages.length).padStart(2, '0')}`
    frameEl.textContent = metaFor(t, locale).spec.framework
    progressEl.style.width = `${((pageIdx + 1) / deck.pages.length) * 100}%`
    renderPageStrip(deck.pages.length)
    syncLangButtons()
  }

  // 编辑内容：input 实时保存，粘贴仅保留纯文本
  deckEl.addEventListener('input', (e) => {
    const el = e.target.closest?.('[data-edit]')
    if (!el) return
    const no = Number(deckEl.querySelector('.dp-page')?.dataset.no ?? pageIdx + 1) - 1
    pageEdits(cur(), lang(), no)[el.dataset.edit] = el.textContent
    store.save()
    const resetBtn = panel.querySelector('#td-reset-edits')
    if (resetBtn) resetBtn.hidden = false
  })
  deckEl.addEventListener('paste', (e) => {
    if (!e.target.closest?.('[data-edit]')) return
    e.preventDefault()
    const text = (e.clipboardData).getData('text/plain')
    try { document.execCommand('insertText', false, text) } catch { el_insertFallback(e.target, text) }
  })
  function el_insertFallback(el, text) { el.textContent = `${el.textContent}${text}` }

  /* 配图替换（P4）：插画库选择 / 上传自有图 / 恢复默认，覆盖关系持久化 */
  function openArtPicker(tpl, pageNo, slot, currentKey) {
    const locale = lang()
    const T = uiText().artPicker
    const overrideKey = `${tpl.id}:${pageNo}:${slot}`
    const manifest = getArtManifest()
    const currentSrc = store.state.artOverrides[overrideKey]
      || manifest[currentKey]?.illustration?.src || ''

    const apply = (src) => {
      store.state.artOverrides[overrideKey] = src
      setArtOverride(tpl.id, pageNo, slot, src)
      // 替换配图需要在绘本/照片模式下才可见，经典 SVG 模式自动切走
      if (store.state.imageMode === 'svg') store.state.imageMode = 'illustration'
      configureArt({ mode: store.state.imageMode, overrides: store.state.artOverrides })
      store.save()
      close()
      renderDeck()
      toast(T.done)
    }
    const doReset = () => {
      delete store.state.artOverrides[overrideKey]
      clearArtOverride(tpl.id, pageNo, slot)
      store.save()
      close()
      renderDeck()
      toast(T.resetDone)
    }

    const grid = document.createElement('div')
    grid.className = 'art-picker-grid'
    const hasLib = Object.keys(ART_CONCEPTS).some((k) => manifest[k]?.illustration?.src)
    if (!hasLib) grid.innerHTML = `<p class="art-picker-empty">${T.empty}</p>`
    for (const [key] of Object.entries(ART_CONCEPTS)) {
      const src = manifest[key]?.illustration?.src
      if (!src) continue
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'art-pick' + (src === currentSrc ? ' is-current' : '')
      btn.dataset.artSrc = src
      btn.innerHTML = `<img src="${src}" alt=""><span>${conceptLabel(key, locale)}</span>`
      if (src === currentSrc) {
        const tag = document.createElement('i')
        tag.className = 'art-pick-tag'
        tag.textContent = T.current
        btn.append(tag)
      }
      btn.addEventListener('click', () => apply(src))
      grid.append(btn)
    }

    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.hidden = true
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => apply(String(reader.result))
      reader.readAsDataURL(file)
    })

    const footer = document.createElement('div')
    footer.className = 'art-picker-foot'
    footer.innerHTML =
      `<button type="button" class="btn btn-ghost" data-art-upload>${T.upload}</button>
       <button type="button" class="btn btn-ghost" data-art-reset>${T.reset}</button>`
    footer.querySelector('[data-art-upload]').addEventListener('click', () => fileInput.click())
    footer.querySelector('[data-art-reset]').addEventListener('click', doReset)
    footer.append(fileInput)

    const { close } = openModal({ title: T.title, body: grid, footer, wide: true })
  }

  // 点击幻灯内任意配图外壳 → 打开换图弹窗（文字编辑区不在 dp-art 内，互不干扰）
  deckEl.addEventListener('click', (e) => {
    const artEl = e.target.closest?.('[data-art-key]')
    if (!artEl || !deckEl.contains(artEl)) return
    openArtPicker(cur(), Number(artEl.dataset.artPage), Number(artEl.dataset.artSlot), artEl.dataset.artKey)
  })

  function renderPageStrip(total) {
    const start = Math.max(0, Math.min(pageIdx - 4, total - PAGE_WINDOW))
    const nums = Array.from({ length: Math.min(PAGE_WINDOW, total) }, (_, k) => start + k)
    pagesStrip.innerHTML = nums.map((n) =>
      `<button type="button" class="td-page-dot ${n === pageIdx ? 'is-active' : ''}" data-page="${n}">${n + 1}</button>`).join('')
  }

  function renderCarousel() {
    const total = list.length
    const start = Math.max(0, Math.min(idx - 5, total - THUMB_WINDOW))
    const nums = Array.from({ length: Math.min(THUMB_WINDOW, total) }, (_, k) => start + k)
    carousel.innerHTML = nums.map((i) => {
      const t = list[i]
      return `<button class="td-thumb ${i === idx ? 'is-active' : ''}" data-i="${i}" type="button">
        ${coverHTML(t)}
        <span class="td-thumb-name">${displayTpl(t, lang()).name}</span>
      </button>`
    }).join('')
  }

  function syncLangButtons() {
    mask.querySelectorAll('#td-lang [data-lang]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.lang === lang())
    })
    mask.querySelector('#td-back-label').textContent =uiText().panel.back
    mask.querySelector('#td-autoplay-label').textContent =uiText().panel.autoplay
  }

  function renderPanel() {
    const t = cur()
    const locale = lang()
    const P =uiText().panel
    const meta = TPL_META[t.name] ?? metaFor(t, locale)
    const spec = metaFor(t, locale).spec
    const styleIdx = styleIdxOf(t)
    const styleWord = locale === 'en' ? 'Style' : '样式'
    panel.innerHTML = `
      <div class="td-head">
        <h2>${displayTpl(t, locale).name}</h2>
        <button class="td-share" id="td-share" title="分享模板" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
      </div>
      <p class="td-meta">${t.format} · ${RATIO_LABEL[t.format] ?? '16:9'}</p>

      <div class="td-provider">
        <span class="td-g-badge">G</span>
        <span>${P.provider}</span>
      </div>

      <p class="td-desc">${meta.desc}</p>

      <h4>${P.bestFor}</h4>
      <ul class="td-fits">${meta.fits.map((f) => `<li>${f}</li>`).join('')}</ul>

      <h4>${P.style}</h4>
      <div class="td-style-row">
        <button class="td-dots" id="td-dots" type="button" aria-haspopup="true" aria-expanded="false">
          ${meta.colors.map((c, i) => `<span class="td-dot ${i === styleIdx ? 'is-picked' : ''}" style="background:${c}"></span>`).join('')}
          <svg class="icon tiny" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="td-style-menu" id="td-style-menu" hidden>
          ${meta.colors.map((c, i) => `
            <button type="button" data-style="${i}">
              <span class="td-dot ${i === styleIdx ? 'is-picked' : ''}" style="background:${c}"></span>
              ${styleWord} ${String.fromCharCode(65 + i)}${i === styleIdx ? ' ✓' : ''}
            </button>`).join('')}
        </div>
      </div>

      <h4>${P.category}</h4>
      <div class="td-tags">${t.cats.map((c) => `<span class="td-tag">${catLabel(c, locale)}</span>`).join('')}</div>

      <h4>${P.theme}</h4>
      <div class="td-tags td-tags-outline">${meta.themes.map((c) => `<span class="td-tag">${c}</span>`).join('')}</div>

      <h4>${P.style}</h4>
      <div class="td-style-cards">
        ${meta.colors.map((c, i) => `
          <button class="td-style-card ${i === styleIdx ? 'is-picked' : ''}" type="button" data-style-card="${i}">
            <span class="td-style-slide">
              <i style="background:${c}"></i>
              <i style="background:${meta.colors[(i + 1) % meta.colors.length]}"></i>
              <i style="background:${meta.colors[(i + 2) % meta.colors.length]}"></i>
            </span>
            <span class="td-style-name">${styleWord} ${String.fromCharCode(65 + i)}</span>
          </button>`).join('')}
      </div>

      <h4>${P.spec}</h4>
      <div class="td-spec">
        <div><b>${spec.pages}</b><span>${P.pages}</span></div>
        <div><b>${spec.images}</b><span>${P.images}</span></div>
        <div class="td-spec-fw"><b>${spec.framework}</b><span>${spec.grid}</span></div>
      </div>

      <p class="td-edit-hint">${P.noEditsHint}</p>
      <button class="td-reset-edits" id="td-reset-edits" type="button" hidden>${P.resetEdits}</button>

      <div class="td-use-wrap">
        <button class="td-use" id="td-use" type="button">${P.use}</button>
      </div>`

    if (hasEdits(t, locale)) panel.querySelector('#td-reset-edits').hidden = false

    panel.querySelector('#td-share').addEventListener('click', () => {
      copyText(`${location.origin}${location.pathname}?tpl=${encodeURIComponent(t.name)}`)
    })
    panel.querySelector('#td-reset-edits').addEventListener('click', () => {
      delete editRoot(t)[locale]
      store.save()
      render()
      toast(locale === 'en' ? 'Edits reset' : '已重置本模板编辑')
    })

    const dotsBtn = panel.querySelector('#td-dots')
    const styleMenu = panel.querySelector('#td-style-menu')
    dotsBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      styleMenu.hidden = !styleMenu.hidden
      dotsBtn.setAttribute('aria-expanded', String(!styleMenu.hidden))
    })
    styleMenu.addEventListener('click', (e) => {
      const row = e.target.closest('[data-style]')
      if (!row) return
      store.state.templateStyles[t.name] = Number(row.dataset.style)
      store.save()
      styleMenu.hidden = true
      render()
    })
    panel.querySelectorAll('[data-style-card]').forEach((card) => {
      card.addEventListener('click', () => {
        store.state.templateStyles[t.name] = Number(card.dataset.styleCard)
        store.save()
        render()
      })
    })
    panel.querySelector('#td-use').addEventListener('click', () => {
      close()
      useTemplate(t)
    })
  }

  function render() {
    renderDeck()
    renderCarousel()
    renderPanel()
  }

  function goPage(delta) {
    const deck = buildDeck(cur())
    pageIdx = (pageIdx + delta + deck.pages.length) % deck.pages.length
    renderDeck()
  }

  function goTemplate(delta) {
    stopAuto()
    idx = (idx + delta + list.length) % list.length
    pageIdx = 0
    render()
  }

  function close() {
    stopAuto()
    mask.remove()
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('click', onDocClick)
  }

  function onKey(e) {
    // 正在编辑文字时，Esc 先退出编辑而不是关掉整个弹层
    const editing = e.target?.closest?.('.dp-editable')
    if (e.key === 'Escape' && editing) { editing.blur(); return }
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight' && !editing) goPage(1)
    if (e.key === 'ArrowLeft' && !editing) goPage(-1)
  }

  function onDocClick(e) {
    const menu = mask.querySelector('#td-style-menu')
    if (menu && !menu.hidden && !e.target.closest('.td-style-row')) {
      menu.hidden = true
      mask.querySelector('#td-dots')?.setAttribute('aria-expanded', 'false')
    }
  }

  mask.querySelector('#td-page-prev').addEventListener('click', () => goPage(-1))
  mask.querySelector('#td-page-next').addEventListener('click', () => goPage(1))
  pagesStrip.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-page]')
    if (!dot) return
    pageIdx = Number(dot.dataset.page)
    renderDeck()
  })
  autoBtn.addEventListener('click', () => (autoplay ? stopAuto() : startAuto()))
  mask.querySelector('#td-lang').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]')
    if (!btn || btn.dataset.lang === lang()) return
    stopAuto()
    setTemplateLang(btn.dataset.lang)
    render()
  })
  mask.querySelector('#td-prev').addEventListener('click', () => goTemplate(-1))
  mask.querySelector('#td-next').addEventListener('click', () => goTemplate(1))
  carousel.addEventListener('click', (e) => {
    const thumb = e.target.closest('.td-thumb')
    if (!thumb) return
    stopAuto()
    idx = Number(thumb.dataset.i)
    pageIdx = 0
    render()
  })
  mask.querySelector('.td-back').addEventListener('click', close)
  mask.querySelector('.td-close').addEventListener('click', close)
  mask.addEventListener('click', (e) => { if (e.target === mask) close() })
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)

  render()
}

/* ---------------- 自建模板 ---------------- */

function openTemplateCreator() {
  const { close, bodyEl, footEl } = openModal({
    title: '新建模板',
    body: `
      <div class="field"><label>模板名称</label><input type="text" id="ct-name" placeholder="例如：季度经营分析" /></div>
      <div class="field"><label>格式</label>
        <select id="ct-format">
          <option>演示文稿</option><option>文档</option><option>社交轮播卡片</option>
        </select></div>
      <div class="field"><label>分类（逗号分隔）</label><input type="text" id="ct-cats" placeholder="报告, 商业规划" /></div>
      <div class="field"><label>封面色</label><input type="color" id="ct-color" value="#3b6ef6" /></div>`,
    footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>保存模板</button>',
  })
  footEl.querySelector('[data-ok]').addEventListener('click', () => {
    const name = bodyEl.querySelector('#ct-name').value.trim()
    if (!name) return toast('请输入模板名称')
    store.state.customTemplates.unshift({
      id: uid('tpl'),
      name,
      cls: null,
      a: name,
      b: '',
      format: bodyEl.querySelector('#ct-format').value,
      cats: bodyEl.querySelector('#ct-cats').value.split(/[,，]/).map((x) => x.trim()).filter(Boolean),
      cover: bodyEl.querySelector('#ct-color').value,
      archived: false,
      createdAt: Date.now(),
    })
    store.save()
    close()
    view.scope = 'mine'
    $$('[data-demo]').forEach((n) => n.classList.toggle('nav-item-active', n.dataset.demo === '由您创建'))
    applyView()
    toast(`模板「${name}」已保存`)
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
}

/* 侧栏底部新建入口（若模板页侧栏存在占位按钮则复用，否则注入） */
const sideCreate = $('[data-demo="新建模板"]')
if (sideCreate) {
  sideCreate.addEventListener('click', (e) => { e.preventDefault(); openTemplateCreator() })
} else {
  const cta = document.createElement('button')
  cta.className = 'btn btn-ghost'
  cta.style.cssText = 'margin:14px 18px;width:calc(100% - 36px)'
  cta.textContent = '＋ 新建模板'
  cta.addEventListener('click', openTemplateCreator)
  $('.sidebar .sidebar-inner')?.append(cta)
}

/* 自建模板的归档 / 删除：卡片右键菜单改用点击后弹窗确认 */
grid.addEventListener('contextmenu', (event) => {
  const card = event.target.closest('[data-custom]')
  if (!card) return
  event.preventDefault()
  const tpl = store.state.customTemplates.find((t) => t.id === card.dataset.custom)
  const { close, bodyEl } = openModal({
    title: tpl.name,
    body: `<div class="modal-list">
      <button class="modal-list-item" data-tpl-act="archive"><span class="grow"><span class="primary">${tpl.archived ? '恢复模板' : '归档模板'}</span></span></button>
      <button class="modal-list-item" data-tpl-act="delete"><span class="grow"><span class="primary" style="color:#d64545">删除模板</span></span></button>
    </div>`,
  })
  bodyEl.querySelector('[data-tpl-act="archive"]').addEventListener('click', () => {
    tpl.archived = !tpl.archived
    store.save()
    close()
    applyView()
    toast(tpl.archived ? '已归档' : '已恢复')
  })
  bodyEl.querySelector('[data-tpl-act="delete"]').addEventListener('click', () => {
    confirmModal('删除模板', `确定删除「${tpl.name}」吗？`, '删除').then((ok) => {
      if (!ok) return
      store.state.customTemplates = store.state.customTemplates.filter((t) => t.id !== tpl.id)
      store.save()
      close()
      applyView()
      toast('模板已删除')
    })
  })
})

/* 帮助 FAB（data-demo="帮助"）由 global-ui 委托统一处理 */

applyView()

/* 分享深链：?tpl=模板名 直达详情弹层 */
{
  const name = new URLSearchParams(location.search).get('tpl')
  if (name) {
    const tpl = allTemplates().find((t) => t.name === name)
    if (tpl) openTemplateDetail(tpl)
  }
}
