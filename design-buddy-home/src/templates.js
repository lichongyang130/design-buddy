/* ============================================================
   探索模板页：筛选 / 搜索 / 排序保留，套用模板真实生成 gamma
   侧栏四个视图：工作区模板 / 最近 / 由您创建 / 已归档（持久化）
   ============================================================ */

import './rail-flyout.js'
import { requireAuth, currentUser } from './auth.js'
requireAuth()
import { store, toast, openModal, confirmModal, uid, fmtDate, copyText } from './core.js'
import { initGlobalUI, openUpgrade, openAccount } from './global-ui.js'
import {
  buildCatalog, buildDeck, renderPageHTML, renderDocumentHTML, metaFor, coverStyle, coverDeco,
  FRAMEWORKS, PALETTES,
  displayTpl, catLabel, VISIBLE_CATS, HIDDEN_CATS, configureArt, getArtBase,
  getArtManifest, setArtOverride, clearArtOverride,
} from './template-engine.js'
import { ART_CONCEPTS, conceptLabel, conceptFor } from './art-concepts.js'
import { PRESENTATION_TEMPLATES, getPresentationMeta, getPresentationTemplates, renderPresentationSlide, renderPresentationDocument, renderDocumentPresentation } from './presentation-templates.js'
import { GENERATED_DOCUMENT_TEMPLATES } from './document-generator.js'
import { getCartoonForCategory } from './cartoon-characters.js'

initGlobalUI()

/* 语言状态（持久化）：zh | en */
store.state.templateLang ??= 'zh'
/* 配图模式（持久化）：illustration 绘本插画（默认）| photo 真实照片 | svg 经典 SVG */
store.state.imageMode ??= 'illustration'
/* 单页换图覆盖（持久化）：键 `${deckId}:${pageNo}:${slot}` → 素材 URL/dataURL */
store.state.artOverrides ??= {}
configureArt({ mode: store.state.imageMode, overrides: store.state.artOverrides })
// 加载构建期素材清单；缺失/离线时静默失败，引擎自动回退内联 SVG
// 用 document.baseURI 拼绝对地址，保证 jsdom/Node fetch 与子路径部署都能解析；代理基址生效时走代理
function loadArtManifest() {
  const rel = 'art/manifest.json'
  const url = getArtBase()
    ? `${getArtBase()}/${rel}`
    : new URL(rel, document.baseURI).href
  fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .then((m) => { if (m?.concepts) configureArt({ manifest: m.concepts }) })
    .catch(() => {})
}
loadArtManifest()
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
      panelTitle: '模板设置', beta: '测试版',
      viewerNotice: '您正在查看此模板。只有编辑者才能编辑此模板的说明。',
      tabBrief: '说明', tabImages: '图片',
      visualTone: '视觉气质', howItWorks: '示范如何工作', writingStyle: '写作方式',
      slideNotes: (n) => `↓ ${n} 幻灯片级别说明`,
      slideNotesTitle: '幻灯片级别说明',
      sharedWithYou: '此模板已与您共享',
      addToWorkspace: '添加到我的工作区',
      settings: '设置', present: '演示', madeBy: '由 Design Buddy 制作',
      advanced: '模板规格与样式设置',
      moreTopic: '主题', moreShare: '分享模板', moreUpgrade: '升级到 Plus', moreClose: '关闭详情',
      presentFromStart: '从头开始演示', presentAuto: '自动播放（2.6 秒/页）',
      useNew: '使用此模板新建', useJson: '复制模板 JSON',
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
      panelTitle: 'Template settings', beta: 'Beta',
      viewerNotice: 'You are viewing this template. Only editors can edit its guidance notes.',
      tabBrief: 'Brief', tabImages: 'Images',
      visualTone: 'Visual tone', howItWorks: 'How the sample works', writingStyle: 'Writing style',
      slideNotes: (n) => `↓ ${n} slide-level notes`,
      slideNotesTitle: 'Slide-level notes',
      sharedWithYou: 'Shared with you',
      addToWorkspace: 'Add to my workspace',
      settings: 'Settings', present: 'Present', madeBy: 'Made by Design Buddy',
      advanced: 'Specs & style settings',
      moreTopic: 'Themes', moreShare: 'Share template', moreUpgrade: 'Upgrade to Plus', moreClose: 'Close detail',
      presentFromStart: 'Present from first slide', presentAuto: 'Autoplay (2.6s/slide)',
      useNew: 'Create with this template', useJson: 'Copy template JSON',
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

/* ---------------- 内置模板（示例已全部清空，仅保留自定义模板入口） ---------------- */

const CATEGORIES_VISIBLE = VISIBLE_CATS
const CATEGORIES_HIDDEN = HIDDEN_CATS

const TEMPLATES = [
  ...PRESENTATION_TEMPLATES.map((t) => getPresentationMeta(t)),
  ...GENERATED_DOCUMENT_TEMPLATES.map((t) => getPresentationMeta(t)),
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
  // ---- 演示文稿模板元数据 ----
  '投资者路演套件': {
    desc: 'A 35-slide investor pitch deck built on the cyber-neon framework: dark blue canvases, electric-blue accents and full-bleed photography for Series A funding rounds.',
    fits: ['Series A and B fundraising pitches', 'startup roadshows', 'angel investor meetings', 'venture capital demo days'],
    colors: ['#0d1b3e', '#2563eb', '#f8fafc'], themes: ['商业', '科技'],
  },
  '季度经营回顾': {
    desc: 'A 30-slide quarterly business review on a data-dashboard framework: clean blue-gray palette, KPI boards, line charts and comparison tables for leadership reviews.',
    fits: ['quarterly board presentations', 'executive leadership reviews', 'investor update meetings', 'cross-team progress reviews'],
    colors: ['#1e3a5f', '#3b82f6', '#f1f5f9'], themes: ['商业', '数据'],
  },
  '品牌传承故事': {
    desc: 'A 35-slide brand heritage story on an editorial framework: warm gold-brown palette, serif headlines and full-bleed photography for luxury brand narratives.',
    fits: ['luxury and heritage brand stories', 'brand anniversary celebrations', 'craftsmanship and legacy narratives', 'brand book presentations'],
    colors: ['#7c5e1e', '#d4a73a', '#faf6ef'], themes: ['品牌', '文化'],
  },
  '市场扩张战略': {
    desc: 'A 30-slide market expansion strategy on the Swiss International typographic grid: strict blue-gray palette, data tables, timelines and comparison layouts for strategic planning.',
    fits: ['market entry strategies', 'geographic expansion plans', 'competitive positioning decks', 'board strategy presentations'],
    colors: ['#1a2b3c', '#4a6fa5', '#e8edf2'], themes: ['商业', '战略'],
  },
  '产品发布主题演讲': {
    desc: 'A 35-slide product launch keynote on a cover-impact framework: gradient purple-pink palette, dramatic hero slides and full-bleed photography for consumer product launches.',
    fits: ['consumer product launches', 'tech product keynotes', 'brand campaign announcements', 'trade show presentations'],
    colors: ['#4a1a6b', '#e84393', '#faf0ff'], themes: ['营销', '科技'],
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
      <p class="tpl-name">${FOLDER_ICON}<span>${displayTpl(tpl, lang()).name}</span>${tpl.format ? `<span class="tpl-fmt">${tpl.format}</span>` : ''}</p>
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

/* 缩略图风格变体：从 serial+fw+pal 计算 16 种布局 */
function thumbVariant(tpl) {
  const s = tpl.serial || 0
  const f = tpl.fw || 0
  const p = tpl.pal || 0
  return (s * 7 + f * 3 + p * 5) % 16
}

function coverHTML(tpl) {
  if (tpl.gen) {
    const d = displayTpl(tpl, lang())
    const cartoon = tpl.presentation ? getCartoonForCategory(tpl.cat, tpl.serial) : null
    const v = thumbVariant(tpl)
    const deco = coverDeco(tpl)
    const pal = tpl.pal != null ? PALETTES[tpl.pal] : null
    const palStyle = pal ? `--g-bg:${pal[0]};--g-ink:${pal[2]};--g-muted:${pal[3]};--g-accent:${pal[4]};--g-accent2:${pal[5]};` : ''
    // 变化图片选择：不同模板用不同图片做背景
    const imgIdx = (tpl.serial || 0) % Math.min(3, tpl.images?.length || 1)
    const coverImg = tpl.images && tpl.images[imgIdx]
    // 变化遮罩方向
    const scrimDeg = [135, 45, 180, 90, 270, 225, 315, 0][v % 8]
    // 卡通位置变体
    const cartoonPos = cartoon ? `tc-cartoon-p${Math.floor(v / 2) % 5}` : ''
    // 文字位置变体
    const textPos = `tc-text-p${v % 6}`
    // 额外的强调元素
    const accent = v >= 8 ? `<span class="tc-accent" aria-hidden="true"></span>` : ''
    return `<div class="tpl-cover tpl-gen thumb-v${v}" data-deco="${deco}" style="${palStyle}--tc-scrim:${scrimDeg}deg">
      ${coverImg ? `<img class="tc-bg" src="${coverImg}" alt="" loading="lazy">` : ''}
      <div class="tc-scrim"></div>
      <span class="tc-deco" aria-hidden="true"></span>
      ${accent}
      ${cartoon ? `<div class="tc-cartoon ${cartoonPos}">${cartoon.svg}</div>` : ''}
      <div class="tc-text ${textPos}">
        ${d.a ? `<span class="tc-a">${d.a}</span>` : ''}
        ${d.b ? `<span class="tc-b">${d.b}</span>` : ''}
      </div>
      ${pageBadge(tpl)}
    </div>`
  }
  return `<div class="tpl-cover ${coverClass(tpl)}" ${tpl.cover ? `style="--custom-cover:${tpl.cover}"` : ''}>${coverInner(tpl)}</div>`
}

/* ---------------- 模板查看器：版式中文/英文名与逐页说明生成 ---------------- */

const LAYOUT_NOTE_LABEL = {
  zh: {
    cover: '封面', agenda: '议程页', divider: '章节转场', hero: '主张页', split: '图文分栏',
    'two-image': '双图对照', 'triple-grid': '三图网格', stats: '指标看板', 'big-stat': '核心大数字',
    quote: '金句引用', timeline: '时间线', process: '流程步骤', comparison: '对照比较', table: '数据表格',
    cards: '卡片组', gallery: '图库', team: '团队肖像', testimonial: '用户证言', pricing: '定价方案',
    bars: '条形排行', 'line-chart': '折线趋势', map: '路线地图', faq: '常见问题', logos: '客户标识',
    'index-list': '索引目录', closing: '收尾页',
  },
  en: {
    cover: 'Cover', agenda: 'Agenda', divider: 'Section divider', hero: 'Hero statement', split: 'Text & image',
    'two-image': 'Two images', 'triple-grid': 'Three-up grid', stats: 'KPI board', 'big-stat': 'Big number',
    quote: 'Pull quote', timeline: 'Timeline', process: 'Process', comparison: 'Comparison', table: 'Data table',
    cards: 'Card grid', gallery: 'Gallery', team: 'Team portraits', testimonial: 'Testimonial', pricing: 'Pricing',
    bars: 'Bar ranking', 'line-chart': 'Line trend', map: 'Route map', faq: 'FAQ', logos: 'Logo wall',
    'index-list': 'Index', closing: 'Closing',
  },
}

// 每种版式的写作指引（中英），按页号取变体避免重复感
const LAYOUT_NOTE_TEXT = {
  zh: {
    cover: ['用一句话亮出核心判断，副标题交代场景与文档身份，日期与署名保持克制。', '封面只回答「这是什么、给谁看」，其余信息留给议程页。'],
    agenda: ['把全篇拆成 3–5 个章节，序号与后续转场页严格对应。', '议程条目用名词短语，每条不超过 8 个字。'],
    divider: ['只放章节名与一句章节宣言，清空多余装饰，制造呼吸感。', '转场页是节奏标点，用大号序号提示读者叙事位置。'],
    hero: ['先给结论再给理由，主张句控制在一行半以内，强调色只落在关键词。', '主张页承担全场最重要的判断，删掉一切支撑性细节。'],
    split: ['左图右文（或反之）各讲一件事，正文三行以内，图片说明与正文互补不重复。', '分栏页保持视觉中轴对齐，文字块与图片块留白对称。'],
    'two-image': ['两张图必须构成对照关系，标题点明比较维度，结论写进图注。', '用并列结构呈现「之前/之后」或「方案 A/B」。'],
    'triple-grid': ['三格共用同一个判断框架，每格一个关键词加一句证据。', '三格文案保持相同句式与字数，形成节奏。'],
    stats: ['每个指标带名称、数值与口径，最重要的一项用强调色。', '指标之间要有共同主题，避免无关数字拼盘。'],
    'big-stat': ['只保留一个英雄数字，配一句解释它为什么重要。', '大数字页一页一结论，辅助信息压到页脚口径行。'],
    quote: ['引用必须有出处，金句独立成行，字号大于正文小于标题。', '引用页用于停顿与说服，不要在同页堆第二个观点。'],
    timeline: ['时间节点按同一粒度排列（季度/月份），已发生与计划中要视觉区分。', '每个节点一句话写动作，不写背景。'],
    process: ['步骤按先后编号，每步一个动词开头，标明输入与产出。', '流程页最多 5 步，更复杂的流程拆成两页。'],
    comparison: ['对照表固定比较维度，优势项用强调色但不夸大。', '左右两列逐项对齐，读者扫视即可得出结论。'],
    table: ['表头先行、数据右对齐，超过 7 行考虑分页或摘要。', '表格只放决策所需数据，完整数据放附录。'],
    cards: ['卡片标题保持同一词性，正文同一句式，便于横向扫读。', '每张卡片一个独立信息单元，卡片之间不互相依赖。'],
    gallery: ['图库每张图配一句说明，统一裁切比例与图注位置。', '用图库讲「系列感」而不是单图秀，图片风格必须统一。'],
    team: ['每人一句角色定位加一项可信背书，肖像风格统一。', '团队页强调互补性：职能、经验与分工一目了然。'],
    testimonial: ['证言写客户原话并署名职位，数据型证言优先于感受型。', '一条证言一个论点，多条证言用相同版式重复。'],
    pricing: ['三档定价对齐功能维度，推荐档视觉前置但不隐藏其他档价格。', '定价页必须写明口径与计费周期。'],
    bars: ['条形按数值排序，最大值与最小值给出解读。', '排行类图表保留刻度感，颜色只强调需要讨论的条目。'],
    'line-chart': ['趋势线不超过三条，关键拐点加文字注释。', '坐标轴写清单位与时间范围，避免双轴误读。'],
    map: ['地图只标与叙事相关的点位，路线用序号串联。', '每个点位配一句事实，不把地图当装饰。'],
    faq: ['问题写成用户真实会问的原话，答案先结论后解释。', '一条问答一屏内读完，长答案拆成两条问题。'],
    logos: ['客户标识统一灰度与高度，按行业或时间排序。', '标识墙是信任证据，下方可补一句客户规模数据。'],
    'index-list': ['目录回收全部章节与页码，标题与转场页逐字一致。', '索引页帮助会后检索，条目编号与正文严格对应。'],
    closing: ['收尾页重复核心主张并给出明确行动项与联系方式。', '最后一页只留一个号召动作，避免信息发散。'],
  },
  en: {
    cover: ['Lead with the core judgement in one line; the subtitle states the context and document type.', 'The cover only answers “what is this and who is it for” — leave detail to the agenda.'],
    agenda: ['Split the story into 3–5 chapters whose numbers match the divider pages exactly.', 'Keep agenda items as short noun phrases, under eight words each.'],
    divider: ['Show only the chapter name and one chapter statement; strip extra decoration for breathing room.', 'Dividers are punctuation: a large numeral tells readers where they are.'],
    hero: ['Conclusion first, reasoning second; keep the statement to one and a half lines with accent color on key words.', 'The hero carries the single most important claim — cut every supporting detail.'],
    split: ['Each side covers one idea; body copy under three lines, captions complement rather than repeat.', 'Keep the visual axis aligned with symmetrical whitespace between text and image.'],
    'two-image': ['The two images must contrast; the title names the comparison dimension, the verdict goes in captions.', 'Use parallel structure for before/after or option A/B stories.'],
    'triple-grid': ['All three cells share one decision frame: one keyword plus one piece of evidence each.', 'Keep identical sentence patterns and lengths across cells for rhythm.'],
    stats: ['Every metric needs a name, value and caliber note; highlight the most important one only.', 'Metrics must share a common theme — no unrelated number salad.'],
    'big-stat': ['Keep one hero number with a single line explaining why it matters.', 'One conclusion per big-number page; supporting detail moves to the footer caliber line.'],
    quote: ['Always attribute the quote; pull quotes sit alone, sized between headline and body.', 'Quote pages create pause and persuasion — never stack a second viewpoint.'],
    timeline: ['Use one time granularity; visually distinguish past milestones from planned ones.', 'One action sentence per node, no background text.'],
    process: ['Number steps in order, start each with a verb, and state inputs and outputs.', 'Maximum five steps per page; split longer processes across two pages.'],
    comparison: ['Fix comparison dimensions in rows; accent strengths without overstating them.', 'Align columns row by row so the verdict is visible at a glance.'],
    table: ['Headers first, numbers right-aligned; paginate or summarize beyond seven rows.', 'Tables hold decision-grade data only — full datasets go to the appendix.'],
    cards: ['Match card titles in part of speech and body copy in sentence pattern for easy scanning.', 'Each card is one self-contained unit that never depends on its neighbors.'],
    gallery: ['Every image gets a caption; unify crop ratios and caption placement.', 'A gallery sells a series, not a single hero — image style must stay consistent.'],
    team: ['One role line plus one credible credential per person; portraits share one treatment.', 'Emphasize complementarity: functions, experience and division of labor at a glance.'],
    testimonial: ['Use the client’s own words with name and title; prefer numeric proof over vague praise.', 'One argument per testimonial, repeated with the same layout.'],
    pricing: ['Align tiers on the same feature dimensions; feature the recommended tier without hiding prices.', 'Always state the billing period and pricing caliber.'],
    bars: ['Sort bars by value and interpret both the maximum and minimum.', 'Keep the scale honest; color only the item under discussion.'],
    'line-chart': ['No more than three trend lines; annotate the key inflection points.', 'Label units and time range on both axes; avoid misleading dual axes.'],
    map: ['Mark only points relevant to the story and connect the route with numbers.', 'Pair each pin with one fact — the map is evidence, not decoration.'],
    faq: ['Write questions as users actually ask them; answers lead with the conclusion.', 'Each Q&A fits on one screen; split long answers into two questions.'],
    logos: ['Unify logos in grayscale and height; sort by industry or tenure.', 'The logo wall is trust evidence — add one customer-scale fact below if possible.'],
    'index-list': ['Recap every chapter with page numbers; titles match dividers word for word.', 'The index supports post-meeting lookup — numbering must match the body exactly.'],
    closing: ['Restate the core claim and end with one clear call to action and contact route.', 'Leave a single call to action on the last page — nothing that dilutes it.'],
  },
}

function layoutLabel(layout, locale) {
  return LAYOUT_NOTE_LABEL[locale === 'en' ? 'en' : 'zh'][layout] ?? layout
}

function slideNoteFor(page, locale) {
  const variants = LAYOUT_NOTE_TEXT[locale === 'en' ? 'en' : 'zh'][page.layout] ?? LAYOUT_NOTE_TEXT.zh.split
  return variants[(page.no - 1) % variants.length]
}

// 视觉气质：基于真实调色板/框架/栅格生成，不写空话
function buildVisualTone(t, deck, meta, locale) {
  const fw = deck.framework
  const [c1, c2, c3] = meta.colors
  if (locale === 'en') {
    return `Built for high-density live delivery and post-meeting reading. The “${fw.nameEn}” framework organizes every page on a ${fw.gridEn.toLowerCase()}: the deep ground tone (${c1}) holds the canvas, the information tone (${c2}) carries body surfaces and charts, and a single accent (${c3}) lands only on the page’s most important judgement. The full ${deck.pages.length}-slide deck shares one grid, axis set and image treatment, so cross-page rhythm stays consistent while no two slide layouts repeat.`
  }
  return `面向现场讲述与会后阅读的高密度演示。「${fw.name}」框架以${fw.grid}组织每一页：深底色（${c1}）安静托底，信息色（${c2}）承载信息面与图示，唯一的强调色（${c3}）只落在当页最重要的判断上。全套 ${deck.pages.length} 页共享同一套栅格、轴线与图像处理，跨页节奏一致，且没有任何两页版式重复。`
}

// 示范如何工作：基于真实页面结构（封面/议程/转场/目录/收尾数量）
function buildHowItWorks(t, deck, locale) {
  const n = deck.pages.length
  const count = (l) => deck.pages.filter((p) => p.layout === l).length
  const dividers = count('divider')
  const hasIndex = count('index-list') > 0
  const imgCount = deck.images ? deck.images.length : 0
  if (locale === 'en') {
    return `This sample is a complete ${n}-slide story: the cover and agenda set the narrative contract first${dividers ? `, ${dividers} section divider${dividers > 1 ? 's' : ''} break the content into clear chapters` : ''}${hasIndex ? ', and an index page before the closing recaps every chapter' : ''}. KPI boards, data tables, comparisons, native charts, team portraits and route maps each play their own role across ${imgCount} original illustrations. Click any text to replace it with your own — edits persist per page, in both languages.`
  }
  return `示范稿是一套 ${n} 页的完整叙事：封面与议程先立叙事契约${dividers ? `，${dividers} 个章节转场把内容切成清晰段落` : ''}${hasIndex ? '，收尾前的索引目录回收全部章节' : ''}；指标看板、数据表格、对照比较、原生图表、团队肖像与路线地图各司其职，贯穿 ${imgCount} 张原创配图。点击任意文字即可替换为你的真实内容，修改按页持久化，中英双语同步。`
}

function buildWritingStyle(locale) {
  if (locale === 'en') {
    return 'Lead with the judgement, then support it with numbers, mechanisms and sources. Keep headlines in sentence case — complete sentences instead of keyword fragments. Every chart and figure carries a caliber note and every claim a source; one argument per page, body copy within three lines, with detail moved to notes or the appendix. All copy is inline-editable and persists per slide; switch the whole deck between Chinese and English at any time.'
  }
  return '先给判断，再以序号、数据、机制与来源支撑；标题保持 sentence case，写完整句而不是堆短语。图表与数字必须带口径说明，引用标注来源；每页只讲一个主张，正文控制在三行以内，细节放进备注与附录。所有文案均可内联编辑并按页持久化，整套幻灯支持中英一键切换。'
}

function openTemplateDetail(tpl) {
  const list = allTemplates()
  let idx = list.findIndex((t) => t.name === tpl.name)
  if (idx < 0) idx = 0
  let pageIdx = 0
  let autoplay = false
  let timer = null
  const PAGE_WINDOW = 9

  const mask = document.createElement('div')
  mask.className = 'td-mask'
  mask.innerHTML = `
    <div class="td-topbar">
      <div class="td-topbar-left">
        <button class="td-brand-mark td-back" id="td-brand" type="button" aria-label="Design Buddy">G</button>
        <svg class="td-crumb-sep" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span class="td-topbar-title" id="td-topbar-title"></span>
      </div>
      <div class="td-topbar-right">
        <div class="td-present-split">
          <button class="td-top-btn td-present" id="td-present" type="button">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <span id="td-present-label">演示</span>
          </button>
          <button class="td-present-caret" id="td-present-caret" type="button" aria-haspopup="true" aria-label="演示选项">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="td-pop-menu" id="td-present-menu" hidden>
            <button type="button" data-present="start" id="td-present-start"></button>
            <button type="button" data-present="auto" id="td-present-auto"></button>
          </div>
        </div>
        <div class="td-more-wrap">
          <button class="td-more-btn" id="td-more" type="button" aria-haspopup="true" aria-label="更多操作">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
          </button>
          <div class="td-pop-menu" id="td-more-menu" hidden>
            <button type="button" id="td-topic">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 22a10 10 0 1 1 10-10c0 2.5-2 3-3.5 3H15a2.5 2.5 0 0 0-2 4c-.5 1.5-1 3-1 3z"/></svg>
              <span id="td-more-topic"></span>
            </button>
            <button type="button" id="td-share-top">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              <span id="td-more-share"></span>
            </button>
            <button type="button" id="td-upgrade">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"/></svg>
              <span id="td-more-upgrade"></span>
            </button>
            <hr/>
            <button type="button" class="td-close" id="td-close">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              <span id="td-more-close"></span>
            </button>
          </div>
        </div>
        <button class="td-top-avatar" id="td-top-avatar" type="button" aria-label="账号">
          <span class="avatar av-blue" id="td-top-avatar-badge">D</span>
        </button>
      </div>
    </div>
    <div class="td-ribbon">
      <button class="td-ribbon-settings" id="td-settings-toggle" type="button">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83 1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span id="td-ribbon-settings-label"></span>
      </button>
      <span class="td-ribbon-center">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
        <span id="td-shared-label"></span>
        <button class="td-add-ws" id="td-add-workspace" type="button">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span id="td-add-ws-label"></span>
        </button>
      </span>
      <div class="td-ribbon-right">
        <div class="td-use-wrap">
          <button class="td-use-ribbon" id="td-use-ribbon" type="button" aria-haspopup="true">
            <span id="td-use-ribbon-label"></span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="td-pop-menu td-use-menu" id="td-use-menu" hidden>
            <button type="button" data-use="new" id="td-use-new"></button>
            <button type="button" id="td-api"></button>
          </div>
        </div>
      </div>
    </div>
    <div class="td-body">
    <aside class="td-panel" id="td-panel"></aside>
    <div class="td-left">
      <div class="td-toolbar">
        <button class="td-tool td-tool-edit is-active" type="button" title="编辑">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
        </button>
        <button class="td-tool" id="td-agent" type="button" title="Agent">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
          Agent
        </button>
        <button class="td-tool" id="td-undo" type="button" title="撤销" disabled>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></svg>
        </button>
        <button class="td-tool" id="td-redo" type="button" title="重做" disabled>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></svg>
        </button>
        <button class="td-add-block" id="td-add-block" type="button">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          添加版块
        </button>
        <div class="td-form-switch" id="td-form-switch" role="group" aria-label="创作形式">
          <button type="button" data-form="slide" class="is-active">幻灯片</button>
          <button type="button" data-form="doc">文档</button>
        </div>
      </div>
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
        <span class="td-made-by" id="td-made-by">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          <span id="td-made-label"></span>
        </span>
      </div>
      <div class="td-progress"><i id="td-progress-i"></i></div>
      <div class="td-pages" id="td-pages"></div>
    </div>
    </div>`
  document.body.append(mask)
  document.body.style.overflow = 'hidden'

  const deckEl = mask.querySelector('#td-deck')
  const panel = mask.querySelector('#td-panel')
  const pageCountEl = mask.querySelector('#td-page-count')
  const frameEl = mask.querySelector('#td-frame')
  const progressEl = mask.querySelector('#td-progress-i')
  const pagesStrip = mask.querySelector('#td-pages')
  const autoBtn = mask.querySelector('#td-autoplay')

  const cur = () => list[idx]
  const styleIdxOf = (t) => store.state.templateStyles[t.name] ?? 0

  /* 创作形式（幻灯片/文档）与自定义版块，均按模板名持久化 */
  store.state.templateForm ??= {}
  store.state.templateBlocks ??= {}
  const formOf = (t) => store.state.templateForm[t.name] ?? (t.format === '文档' ? 'doc' : 'slide')
  const blocksOf = (t) => (store.state.templateBlocks[t.name] ??= [])
  let activeTab = 'brief'

  /* 撤销/重做：会话级编辑历史，记录字段级变化 */
  const undoStack = []
  const redoStack = []
  const pushHistory = (rec) => { undoStack.push(rec); redoStack.length = 0; syncHistoryButtons() }
  const syncHistoryButtons = () => {
    mask.querySelector('#td-undo')?.toggleAttribute('disabled', undoStack.length === 0)
    mask.querySelector('#td-redo')?.toggleAttribute('disabled', redoStack.length === 0)
  }

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
    const form = formOf(t)

    // 演示文稿模板：使用自定义渲染函数
    if (t.presentation) {
      const presTpl = t._tpl
      const totalPages = presTpl.pages.length
      if (pageIdx >= totalPages) pageIdx = 0
      mask.querySelector('#td-topbar-title').textContent = displayTpl(t, locale).name
      const slideOnly = mask.querySelectorAll('.td-deck-bar, .td-page-arrow, .td-progress, .td-pages')

      if (t.docMode) {
        // 文档模式：渲染全部页面为可滚动文档
        mask.querySelectorAll('#td-form-switch [data-form]').forEach((b) =>
          b.classList.toggle('is-active', b.dataset.form === 'doc'))
        deckEl.classList.add('is-doc')
        deckEl.classList.remove('is-square')
        slideOnly.forEach((el) => { el.hidden = true })
        deckEl.innerHTML = renderDocumentPresentation(presTpl, locale)
        deckEl.scrollTop = 0
        const fw = FRAMEWORKS[presTpl.fw]
        frameEl.textContent = locale === 'en' ? fw.nameEn : fw.name
        pageCountEl.textContent = `${String(totalPages).padStart(2, '0')} ${uiText().pages}`
      } else {
        // 幻灯片模式：逐页渲染
        mask.querySelectorAll('#td-form-switch [data-form]').forEach((b) =>
          b.classList.toggle('is-active', b.dataset.form === 'slide'))
        deckEl.classList.remove('is-doc')
        deckEl.classList.remove('is-square')
        slideOnly.forEach((el) => { el.hidden = false })
        deckEl.innerHTML = renderPresentationSlide(presTpl, pageIdx)
        deckEl.querySelector('.dp-page')?.classList.add('is-shown')
        pageCountEl.textContent = `${String(pageIdx + 1).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`
        const fw = FRAMEWORKS[presTpl.fw]
        frameEl.textContent = locale === 'en' ? fw.nameEn : fw.name
        progressEl.style.width = `${((pageIdx + 1) / totalPages) * 100}%`
        renderPageStrip(totalPages)
      }
      syncLangButtons()
      return
    }

    configureArt({ mode: store.state.imageMode ?? 'illustration', overrides: store.state.artOverrides })
    const deck = buildDeck(t, locale)
    if (pageIdx >= deck.pages.length) pageIdx = 0
    mask.querySelector('#td-topbar-title').textContent = displayTpl(t, locale).name
    mask.querySelectorAll('#td-form-switch [data-form]').forEach((b) =>
      b.classList.toggle('is-active', b.dataset.form === form))
    const slideOnly = mask.querySelectorAll('.td-deck-bar, .td-page-arrow, .td-progress, .td-pages')
    if (form === 'doc') {
      // 文档形态：整篇纵向滚动、图文流式，不再分页
      deckEl.classList.add('is-doc')
      deckEl.classList.remove('is-square')
      slideOnly.forEach((el) => { el.hidden = true })
      const editsByPage = editRoot(t)[locale] ?? {}
      deckEl.innerHTML = renderDocumentHTML(t, locale, editsByPage, blocksOf(t))
      deckEl.scrollTop = 0
    } else {
      deckEl.classList.remove('is-doc')
      // 社交轮播卡片：方形画幅（1:1），其余格式保持 16:9
      deckEl.classList.toggle('is-square', t.format === '社交轮播卡片')
      slideOnly.forEach((el) => { el.hidden = false })
      const edits = pageEdits(t, locale, pageIdx)
      deckEl.innerHTML = renderPageHTML(t, pageIdx, styleIdxOf(t), locale, edits)
      deckEl.querySelector('.dp-page')?.classList.add('is-shown')
    }
    pageCountEl.textContent = `${String(pageIdx + 1).padStart(2, '0')} / ${String(deck.pages.length).padStart(2, '0')}`
    frameEl.textContent = metaFor(t, locale).spec.framework
    progressEl.style.width = `${((pageIdx + 1) / deck.pages.length) * 100}%`
    renderPageStrip(deck.pages.length)
    syncLangButtons()
  }

  // 进入编辑区时记录旧值，供撤销恢复
  deckEl.addEventListener('focusin', (e) => {
    const el = e.target.closest?.('[data-edit],[data-block-edit]')
    if (el) el.dataset.oldText = el.textContent
  })
  // 编辑内容：input 实时保存（幻灯/文档/自定义版块共用），粘贴仅保留纯文本
  deckEl.addEventListener('input', (e) => {
    const blockEl = e.target.closest?.('[data-block-edit]')
    if (blockEl) {
      const b = blocksOf(cur()).find((x) => x.id === blockEl.dataset.blockEdit)
      if (b) {
        pushHistory({ type: 'block', id: b.id, old: blockEl.dataset.oldText ?? '', val: blockEl.textContent })
        b.text = blockEl.textContent
        store.save()
      }
      return
    }
    const el = e.target.closest?.('[data-edit]')
    if (!el) return
    const scope = el.closest('[data-no]')
    // data-no 为 1-based 页码，存储统一用 0-based；文档 .doc-block 与幻灯 .dp-page 同源
    const no = scope ? Number(scope.dataset.no) - 1 : pageIdx
    pushHistory({ type: 'edit', no, key: el.dataset.edit, old: el.dataset.oldText ?? '', val: el.textContent })
    pageEdits(cur(), lang(), no)[el.dataset.edit] = el.textContent
    store.save()
    const resetBtn = panel.querySelector('#td-reset-edits')
    if (resetBtn) resetBtn.hidden = false
  })
  deckEl.addEventListener('paste', (e) => {
    if (!e.target.closest?.('[data-edit],[data-block-edit]')) return
    e.preventDefault()
    const text = (e.clipboardData).getData('text/plain')
    try { document.execCommand('insertText', false, text) } catch { el_insertFallback(e.target, text) }
  })
  function el_insertFallback(el, text) { el.textContent = `${el.textContent}${text}` }

  // 撤销/重做：恢复到引擎默认文案（删除覆盖），自定义版块直接还原文本
  function applyHistory(rec, forward) {
    const t = cur()
    if (rec.type === 'block') {
      const b = blocksOf(t).find((x) => x.id === rec.id)
      if (!b) return
      b.text = forward ? rec.val : rec.old
    } else if (rec.type === 'delete') {
      const arr = blocksOf(t)
      if (forward) {
        const i = arr.findIndex((x) => x.id === rec.block.id)
        if (i >= 0) arr.splice(i, 1)
      } else {
        arr.splice(Math.min(rec.index, arr.length), 0, rec.block)
      }
    } else {
      const m = pageEdits(t, lang(), rec.no)
      if (forward) m[rec.key] = rec.val
      else delete m[rec.key]
    }
    store.save()
    renderDeck()
    syncHistoryButtons()
  }

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

  // 点击配图外壳 → 换图弹窗；自定义版块 → 删除 / 媒体地址设置
  deckEl.addEventListener('click', (e) => {
    const delEl = e.target.closest?.('[data-block-del]')
    if (delEl) {
      const arr = blocksOf(cur())
      const i = arr.findIndex((x) => x.id === delEl.dataset.blockDel)
      if (i >= 0) {
        const [removed] = arr.splice(i, 1)
        pushHistory({ type: 'delete', block: removed, index: i })
        store.save()
        renderDeck()
      }
      return
    }
    const urlEl = e.target.closest?.('[data-block-url]')
    if (urlEl) {
      const b = blocksOf(cur()).find((x) => x.id === urlEl.dataset.blockUrl)
      if (!b) return
      const url = window.prompt(urlEl.dataset.prompt ?? '粘贴媒体地址（https://…）', b.url ?? '')
      if (url === null) return
      b.url = url.trim()
      store.save()
      renderDeck()
      return
    }
    const imgEl = e.target.closest?.('[data-block-image]')
    if (imgEl) {
      const b = blocksOf(cur()).find((x) => x.id === imgEl.dataset.blockImage)
      if (!b) return
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/*'
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          b.src = String(reader.result)
          store.save()
          renderDeck()
        }
        reader.readAsDataURL(file)
      })
      fileInput.click()
      return
    }
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

  function syncLangButtons() {
    const P = uiText().panel
    mask.querySelectorAll('#td-lang [data-lang]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.lang === lang())
    })
    mask.querySelector('#td-autoplay-label').textContent = P.autoplay
    // 顶栏 / 粉色带 / 面板固定文案随语言刷新
    const setText = (id, txt) => { const el = mask.querySelector(id); if (el) el.textContent = txt }
    setText('#td-present-label', P.present)
    setText('#td-present-start', P.presentFromStart)
    setText('#td-present-auto', P.presentAuto)
    setText('#td-more-topic', P.moreTopic)
    setText('#td-more-share', P.moreShare)
    setText('#td-more-upgrade', P.moreUpgrade)
    setText('#td-more-close', P.moreClose)
    setText('#td-ribbon-settings-label', P.settings)
    setText('#td-shared-label', P.sharedWithYou)
    setText('#td-add-ws-label', P.addToWorkspace)
    setText('#td-use-ribbon-label', P.use)
    setText('#td-use-new', P.useNew)
    setText('#td-api', P.useJson)
    setText('#td-made-label', P.madeBy)
    // 头像缩写：登录用户优先
    const u = currentUser()
    const badge = mask.querySelector('#td-top-avatar-badge')
    if (badge) {
      const n = (u?.name ?? '').trim()
      badge.textContent = n ? (/[\u4e00-\u9fa5]/.test(n) ? n.slice(0, 2) : n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()) : 'D'
      if (u?.color) badge.className = `avatar ${u.color}`
    }
  }

  function renderPanel() {
    const t = cur()
    const locale = lang()
    const P =uiText().panel
    const meta = TPL_META[t.name] ?? metaFor(t, locale)
    const spec = metaFor(t, locale).spec
    const styleIdx = styleIdxOf(t)
    const styleWord = locale === 'en' ? 'Style' : '样式'
    const tabBrief = locale === 'en' ? 'Brief' : '说明'
    const tabImages = locale === 'en' ? 'Images' : '图片'
    // 收集整篇配图：页码 + 槽位 + 概念 key（与幻灯/文档渲染完全同源）
    // 演示文稿模板使用真实图片，创建 mock deck 供视觉气质/工作原理使用
    const deck = t.presentation ? {
      framework: FRAMEWORKS[t.fw],
      pages: t._tpl.pages.map((p, i) => ({ no: i + 1, layout: p.layout })),
    } : buildDeck(t, locale)
    const artRows = []
    if (!t.presentation) {
      deck.pages.forEach((p) => {
        const count = LAYOUT_SLOT_COUNT[p.layout] ?? 1
        for (let slot = 0; slot < count; slot++) {
          artRows.push({ page: p.no, slot, key: conceptFor(t, p, slot) })
        }
      })
    }
    const manifest = getArtManifest()
    panel.innerHTML = `
      <div class="tdp-head">
        <div class="tdp-title-row">
          <strong>${P.panelTitle}</strong>
          <span class="tdp-beta">${P.beta}</span>
        </div>
        <button class="tdp-close" id="td-panel-close" type="button" aria-label="${P.panelTitle}">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>
      </div>
      <div class="tdp-notice">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>${P.viewerNotice}</span>
      </div>
      <div class="tdp-tabs" role="tablist">
        <button type="button" class="tdp-tab ${activeTab === 'brief' ? 'is-active' : ''}" data-tab="brief">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l1.9 5.8L20 9.7l-5.1 3.7L16.5 20 12 16.4 7.5 20l1.6-6.6L4 9.7l6.1-1.9z"/></svg>
          ${P.tabBrief}
        </button>
        <button type="button" class="tdp-tab ${activeTab === 'images' ? 'is-active' : ''}" data-tab="images">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>
          ${P.tabImages}<i>${artRows.length}</i>
        </button>
      </div>

      <div class="tdp-pane" data-pane="brief" ${activeTab !== 'brief' ? 'hidden' : ''}>
      <section class="tdp-guide">
        <h3>${P.visualTone}</h3>
        <p>${buildVisualTone(t, deck, meta, locale)}</p>
        <h3>${P.howItWorks}</h3>
        <p>${buildHowItWorks(t, deck, locale)}</p>
        <h3>${P.writingStyle}</h3>
        <p>${buildWritingStyle(locale)}</p>
      </section>
      <button class="tdp-slide-jump" id="td-slide-jump" type="button">${P.slideNotes(deck.pages.length)}</button>
      <section class="tdp-slide-notes" id="td-slide-notes">
        <h4>${P.slideNotesTitle}</h4>
        <ol>
          ${deck.pages.map((p) => `<li>
            <b>${String(p.no).padStart(2, '0')} · ${layoutLabel(p.layout, locale)}</b>
            <span>${slideNoteFor(p, locale)}</span>
          </li>`).join('')}
        </ol>
      </section>
      <details class="tdp-advanced" ${hasEdits(t, locale) ? 'open' : ''}>
        <summary>${P.advanced}</summary>
      <div class="td-head">
        <h2>${displayTpl(t, locale).name}</h2>
        <button class="td-share" id="td-share" title="分享模板" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
      </div>
      <p class="td-meta">${t.format} · ${RATIO_LABEL[t.format] ?? '16:9'} · ${formOf(t) === 'doc' ? (locale === 'en' ? 'Document' : '文档') : (locale === 'en' ? 'Slides' : '幻灯片')}</p>

      <div class="td-provider">
        <span class="td-g-badge">D</span>
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
      </div>
      </details>
      </div>

      <div class="tdp-pane tdp-images" data-pane="images" ${activeTab !== 'images' ? 'hidden' : ''}>
        <p class="tdp-images-hint">${locale === 'en' ? 'Click any image to replace it — changes persist across slides and document view.' : '点击任意配图即可替换，幻灯与文档形态同步生效。'}</p>
        <div class="tdp-image-grid">
          ${artRows.map((r) => {
            const src = manifest[r.key]?.illustration?.src
            const override = store.state.artOverrides[`${t.id}:${r.page}:${r.slot}`]
            return `<button type="button" class="tdp-image-card" data-art-pick="${r.page}:${r.slot}:${r.key}">
              <span class="tdp-image-thumb">${(override || src) ? `<img src="${override || src}" alt="">` : `<i style="background:${meta.colors[r.page % meta.colors.length]}"></i>`}</span>
              <span class="tdp-image-meta"><b>${conceptLabel(r.key, locale)}</b><em>${locale === 'en' ? 'Page' : '第'} ${r.page + 1} ${locale === 'en' ? '' : '页'}</em></span>
            </button>`
          }).join('')}
        </div>
      </div>`

    panel.onclick = (e) => {
      const tab = e.target.closest?.('[data-tab]')
      if (tab) {
        activeTab = tab.dataset.tab
        panel.querySelectorAll('.tdp-tab').forEach((b) => b.classList.toggle('is-active', b === tab))
        panel.querySelectorAll('.tdp-pane').forEach((p) => { p.hidden = p.dataset.pane !== activeTab })
        return
      }
      const artPick = e.target.closest?.('[data-art-pick]')
      if (artPick) {
        const [page, slot, key] = artPick.dataset.artPick.split(':')
        openArtPicker(cur(), Number(page), Number(slot), key)
      }
    }

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

    // 面板 X：收起左侧设置区（与粉色带「设置」开关同源）
    panel.querySelector('#td-panel-close').addEventListener('click', () => {
      mask.classList.add('panel-collapsed')
    })
    // 粉色徽章：滚动到逐页说明区
    panel.querySelector('#td-slide-jump').addEventListener('click', () => {
      panel.querySelector('#td-slide-notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function render() {
    renderDeck()
    renderPanel()
  }

  function goPage(delta) {
    const t = cur()
    const total = t.presentation ? t._tpl.pages.length : buildDeck(t).pages.length
    pageIdx = (pageIdx + delta + total) % total
    renderDeck()
  }

  function close() {
    stopAuto()
    mask.remove()
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKey)
    document.removeEventListener('click', onDocClick)
  }

  function onKey(e) {
    // 正在编辑文字时，Esc 先退出编辑而不是关掉整个弹层（幻灯 .dp-editable / 文档 .db-editable）
    const editing = e.target?.closest?.('.dp-editable,.db-editable')
    if (e.key === 'Escape' && editing) { editing.blur(); return }
    // 二级弹窗（换图 / 块选择器等）打开时，Esc 只关弹窗，不连带关闭编辑器
    if (e.key === 'Escape' && document.querySelector('.modal-mask')) return
    if (e.key === 'Escape') close()
    if (formOf(cur()) !== 'slide') return
    if (e.key === 'ArrowRight' && !editing) goPage(1)
    if (e.key === 'ArrowLeft' && !editing) goPage(-1)
  }

  function onDocClick(e) {
    const menu = mask.querySelector('#td-style-menu')
    if (menu && !menu.hidden && !e.target.closest('.td-style-row')) {
      menu.hidden = true
      mask.querySelector('#td-dots')?.setAttribute('aria-expanded', 'false')
    }
    // 顶栏 / 粉色带的弹出菜单：点到外部即收起
    mask.querySelectorAll('.td-pop-menu').forEach((m) => {
      if (!m.hidden && !e.target.closest(`#${m.id.replace('-menu', '-wrap')}, .td-present-split, .td-use-wrap`)) {
        m.hidden = true
      }
    })
  }

  // 弹出菜单统一开关
  function toggleMenu(menuId, btn) {
    const menu = mask.querySelector(menuId)
    const wasHidden = menu.hidden
    mask.querySelectorAll('.td-pop-menu').forEach((m) => { m.hidden = true })
    menu.hidden = !wasHidden
    btn?.setAttribute('aria-expanded', String(!wasHidden))
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
  mask.querySelector('.td-back').addEventListener('click', close)
  mask.querySelector('.td-close').addEventListener('click', close)
  mask.addEventListener('click', (e) => { if (e.target === mask) close() })

  /* ---------- 形态切换 / 版块库 / 撤销重做 / 新顶栏 ---------- */
  function setForm(form) {
    const t = cur()
    if (formOf(t) === form) return
    stopAuto()
    store.state.templateForm[t.name] = form
    store.save()
    render()
  }
  mask.querySelector('#td-form-switch').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-form]')
    if (btn) setForm(btn.dataset.form)
  })
  mask.querySelector('#td-undo').addEventListener('click', () => {
    const rec = undoStack.pop()
    if (!rec) return
    redoStack.push(rec)
    applyHistory(rec, false)
  })
  mask.querySelector('#td-redo').addEventListener('click', () => {
    const rec = redoStack.pop()
    if (!rec) return
    undoStack.push(rec)
    applyHistory(rec, true)
  })
  syncHistoryButtons()

  function addBlock(def) {
    const block = { id: uid('bk'), kind: def.kind, cat: def.cat, text: def.ph ?? '', url: '' }
    blocksOf(cur()).push(block)
    store.save()
    renderDeck()
    toast(lang() === 'en' ? 'Block added — scroll to the bottom to edit' : '版块已添加，滚动到文末即可编辑')
  }
  function openBlockPicker() {
    const locale = lang()
    if (formOf(cur()) === 'slide') {
      setForm('doc')
      toast(locale === 'en' ? 'Block editing lives in the document view — switched for you' : '版块编辑在文档形态中进行，已自动切换')
    }
    let cat = 'all'
    let q = ''
    const nameOf = (d) => (locale === 'en' ? d.en : d.zh)
    const body = document.createElement('div')
    body.className = 'block-picker'
    body.innerHTML = `
      <label class="block-search">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="search" placeholder="${locale === 'en' ? 'Search all blocks' : '搜索所有区块'}" data-bp-search>
      </label>
      <div class="block-picker-body">
        <nav class="block-cats" data-bp-cats>
          ${BLOCK_CATS.map((c) => `<button type="button" class="block-cat ${c.id === 'all' ? 'is-active' : ''}" data-cat="${c.id}">${locale === 'en' ? c.en : c.zh}</button>`).join('')}
        </nav>
        <div class="block-grid" data-bp-grid></div>
      </div>`
    const grid = body.querySelector('[data-bp-grid]')
    const draw = () => {
      const kw = q.trim().toLowerCase()
      const items = BLOCK_LIB.filter((d) => (cat === 'all' || d.cat === cat)
        && (!kw || nameOf(d).toLowerCase().includes(kw)))
      grid.innerHTML = items.length
        ? items.map((d) => `<button type="button" class="block-card" data-block-kind="${d.kind}">
            <span class="block-card-ic block-ic-${d.kind}">${blockIcon(d.kind)}</span>
            <span class="block-card-name">${nameOf(d)}</span>
          </button>`).join('')
        : `<p class="block-empty">${locale === 'en' ? 'No matching blocks' : '没有匹配的区块'}</p>`
    }
    draw()
    body.querySelector('[data-bp-search]').addEventListener('input', (e) => { q = e.target.value; draw() })
    body.querySelector('[data-bp-cats]').addEventListener('click', (e) => {
      const c = e.target.closest('[data-cat]')
      if (!c) return
      cat = c.dataset.cat
      body.querySelectorAll('.block-cat').forEach((b) => b.classList.toggle('is-active', b === c))
      draw()
    })
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('[data-block-kind]')
      if (!card) return
      const def = BLOCK_LIB.find((d) => d.kind === card.dataset.blockKind)
      closeModal()
      addBlock(def)
    })
    const { close: closeModal } = openModal({
      title: locale === 'en' ? 'Add block' : '添加版块',
      body,
      footer: `<button class="btn btn-ghost" data-close>${locale === 'en' ? 'Close' : '关闭'}</button>`,
      wide: true,
    })
  }
  mask.querySelector('#td-add-block').addEventListener('click', openBlockPicker)

  // 左面板折叠（截图中的「设置」开关）
  mask.querySelector('#td-settings-toggle').addEventListener('click', () => {
    mask.classList.toggle('panel-collapsed')
  })
  // Agent：本地无云端大模型，打开命令面板这一真实的本地智能入口
  mask.querySelector('#td-agent').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('db:open-palette'))
    toast(lang() === 'en' ? 'Local command palette — no cloud AI in the zero-backend build' : '本地命令面板：零后端版本未接入云端 AI')
  })
  mask.querySelector('#td-topic').addEventListener('click', () => { location.href = 'themes.html' })
  mask.querySelector('#td-share-top').addEventListener('click', () => {
    copyText(`${location.origin}${location.pathname}?tpl=${encodeURIComponent(cur().name)}`)
  })
  mask.querySelector('#td-present').addEventListener('click', () => {
    if (formOf(cur()) === 'doc') {
      toast(lang() === 'en' ? 'Document view scrolls vertically — use slides for autoplay' : '文档形态为纵向滚动，自动演示请切回幻灯片')
      return
    }
    autoplay ? stopAuto() : startAuto()
  })
  mask.querySelector('#td-upgrade').addEventListener('click', () => { openUpgrade() })

  // 顶栏「…」更多菜单 / 演示拆分按钮
  mask.querySelector('#td-more').addEventListener('click', (e) => {
    e.stopPropagation()
    toggleMenu('#td-more-menu', mask.querySelector('#td-more'))
  })
  mask.querySelector('#td-present-caret').addEventListener('click', (e) => {
    e.stopPropagation()
    if (formOf(cur()) === 'doc') {
      toast(lang() === 'en' ? 'Document view scrolls vertically — use slides for autoplay' : '文档形态为纵向滚动，自动演示请切回幻灯片')
      return
    }
    toggleMenu('#td-present-menu', mask.querySelector('#td-present-caret'))
  })
  mask.querySelector('#td-present-menu').addEventListener('click', (e) => {
    const item = e.target.closest('[data-present]')
    if (!item) return
    mask.querySelector('#td-present-menu').hidden = true
    if (formOf(cur()) === 'doc') {
      toast(lang() === 'en' ? 'Switch to slides to present' : '请先切换到幻灯片形态再演示')
      return
    }
    if (item.dataset.present === 'start') { pageIdx = 0; renderDeck(); startAuto() }
    else { autoplay ? stopAuto() : startAuto() }
  })
  // 顶栏头像 → 账号弹窗
  mask.querySelector('#td-top-avatar').addEventListener('click', () => openAccount())

  // 粉色带：添加到我的工作区（真实创建并保留在查看器内，弹窗浮于上层）
  mask.querySelector('#td-add-workspace').addEventListener('click', () => {
    useTemplate(cur())
  })
  // 使用模板 ▾：菜单选择
  mask.querySelector('#td-use-ribbon').addEventListener('click', (e) => {
    e.stopPropagation()
    toggleMenu('#td-use-menu', mask.querySelector('#td-use-ribbon'))
  })
  mask.querySelector('#td-use-new').addEventListener('click', () => {
    const t = cur()
    mask.querySelector('#td-use-menu').hidden = true
    close()
    useTemplate(t)
  })
  mask.querySelector('#td-api').addEventListener('click', () => {
    mask.querySelector('#td-use-menu').hidden = true
    const locale = lang()
    const t = cur()
    const payload = JSON.stringify({
      app: 'Design Buddy',
      template: displayTpl(t, locale).name,
      format: formOf(t),
      pages: t.presentation ? t._tpl.pages.length : buildDeck(t, lang()).pages.length,
      style: styleIdxOf(t),
      blocks: blocksOf(t),
    }, null, 2)
    const body = document.createElement('div')
    body.innerHTML = `<p class="api-hint">${locale === 'en'
      ? 'Local-first build: no server or API key. This is the exact JSON your template produces — copy it into any workflow.'
      : '本地优先版本：无服务器、无 API 密钥。以下是该模板产出的真实 JSON，可复制到任意工作流。'}</p>
      <pre class="api-pre">${payload.replace(/</g, '&lt;')}</pre>`
    const { close: closeApi } = openModal({
      title: '</> API',
      body,
      wide: true,
      footer: `<button class="btn btn-ghost" data-close>${locale === 'en' ? 'Close' : '关闭'}</button>
               <button class="btn btn-primary" data-copy>${locale === 'en' ? 'Copy JSON' : '复制 JSON'}</button>`,
    })
    body.parentElement.querySelector('[data-copy]')?.addEventListener('click', () => copyText(payload))
    void closeApi
  })

  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)

  render()
}

/* 各版式实际渲染的配图槽位数（与 template-engine 的 img() 调用对齐，缺省 1 张） */
const LAYOUT_SLOT_COUNT = {
  gallery: 4,
  'triple-grid': 3, team: 3, cards: 3, pricing: 3,
  'two-image': 2,
}

/* ---------------- 文档版块库（块选择器，分类与 Gamma 截图对齐） ---------------- */

const BLOCK_CATS = [
  { id: 'all', zh: '全部', en: 'All' },
  { id: 'text', zh: '基本块', en: 'Basic' },
  { id: 'image', zh: '图片', en: 'Images' },
  { id: 'shape', zh: '形状', en: 'Shapes' },
  { id: 'layout', zh: '布局', en: 'Layout' },
  { id: 'chart', zh: '图表', en: 'Charts' },
  { id: 'media', zh: '视频/嵌入', en: 'Media' },
  { id: 'form', zh: '表单', en: 'Forms' },
]

const BLOCK_LIB = [
  { kind: 'h1', cat: 'text', zh: '标题 H1', en: 'Heading 1', ph: '标题文字' },
  { kind: 'h2', cat: 'text', zh: '标题 H2', en: 'Heading 2', ph: '二级标题' },
  { kind: 'h3', cat: 'text', zh: '标题 H3', en: 'Heading 3', ph: '三级标题' },
  { kind: 'h4', cat: 'text', zh: '标题 H4', en: 'Heading 4', ph: '四级标题' },
  { kind: 'p', cat: 'text', zh: '正文 / md', en: 'Paragraph', ph: '正文段落，直接输入文字…' },
  { kind: 'caption', cat: 'text', zh: '说明文字', en: 'Caption', ph: '说明文字' },
  { kind: 'label', cat: 'text', zh: '标签文本', en: 'Label', ph: '标签文本' },
  { kind: 'quote', cat: 'text', zh: '块引用 / Quote', en: 'Block quote', ph: '引用内容…' },
  { kind: 'image', cat: 'image', zh: '配图', en: 'Image', ph: '图片说明（点击图片即可替换）' },
  { kind: 'gallery', cat: 'image', zh: '图库', en: 'Gallery', ph: '图库标题' },
  { kind: 'divider', cat: 'shape', zh: '分隔线', en: 'Divider', ph: '' },
  { kind: 'card', cat: 'layout', zh: '卡片', en: 'Card', ph: '卡片标题与正文…' },
  { kind: 'columns', cat: 'layout', zh: '双栏', en: 'Two columns', ph: '左栏文字，右栏可继续补充…' },
  { kind: 'stat', cat: 'chart', zh: '统计数字', en: 'Big stat', ph: '88%' },
  { kind: 'bars', cat: 'chart', zh: '条形列表', en: 'Bar list', ph: '指标一' },
  { kind: 'video', cat: 'media', zh: '视频', en: 'Video', ph: '视频标题' },
  { kind: 'embed', cat: 'media', zh: '网页嵌入', en: 'Embed', ph: '嵌入标题' },
  { kind: 'input', cat: 'form', zh: '输入框', en: 'Input', ph: '请输入邮箱' },
  { kind: 'button', cat: 'form', zh: '按钮', en: 'Button', ph: '立即开始' },
]

function blockIcon(kind) {
  const paths = {
    h1: '<path d="M4 12h8"/><path d="M4 6v12"/><path d="M12 6v12"/><path d="m17 9 3-2v11"/>',
    h2: '<path d="M4 12h8"/><path d="M4 6v12"/><path d="M12 6v12"/><path d="M17 8a2 2 0 1 1 3 2c-2 1-3 2-3 4h4"/>',
    h3: '<path d="M4 12h8"/><path d="M4 6v12"/><path d="M12 6v12"/><path d="M17 8a2 2 0 1 1 3 2 2 2 0 0 1-2 2 2 2 0 0 1 2 2 2 2 0 1 1-3 2"/>',
    h4: '<path d="M4 12h8"/><path d="M4 6v12"/><path d="M12 6v12"/><path d="M17 6v10"/><path d="M17 12h3"/><path d="M20 16v6"/>',
    p: '<path d="M13 6H7v12"/><path d="M13 6a4 4 0 0 1 0 8H7"/>',
    caption: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>',
    label: '<path d="M20 12 12 20l-8-8V4h8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    quote: '<path d="M7 7h4v6a4 4 0 0 1-4 4"/><path d="M15 7h4v6a4 4 0 0 1-4 4"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    gallery: '<rect x="3" y="4" width="8" height="7" rx="1"/><rect x="13" y="4" width="8" height="7" rx="1"/><rect x="3" y="13" width="8" height="7" rx="1"/><rect x="13" y="13" width="8" height="7" rx="1"/>',
    divider: '<path d="M3 12h18"/><circle cx="12" cy="12" r="2.4"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/>',
    columns: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
    stat: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-4"/><path d="M12 16V8"/><path d="M16 16v-6"/>',
    bars: '<path d="M4 8h16"/><path d="M4 12h11"/><path d="M4 16h14"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
    embed: '<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13 6-2 12"/>',
    input: '<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 12h6"/>',
    button: '<rect x="4" y="8" width="16" height="8" rx="4"/><path d="M9 12h6"/>',
  }
  return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[kind] ?? paths.p}</svg>`
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
