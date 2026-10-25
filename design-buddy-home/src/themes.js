/* ============================================================
   主题页：标准 18 套 + 自定义 / 已归档主题，全部持久化
   - 应用主题 / 设为默认 / 复制 / 归档 / 删除 均为真实操作
   - 新建主题：颜色表单 + 实时预览，保存后全站换肤
   ============================================================ */

import './rail-flyout.js'
import { store, toast, openModal, confirmModal, uid } from './core.js'
import { initGlobalUI, applyAppearance } from './global-ui.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const STANDARD_THEMES = [
  { name: 'Pearl', cls: 'th-pearl' },
  { name: 'Vortex', cls: 'th-vortex' },
  { name: 'Clementa', cls: 'th-clementa' },
  { name: 'Stratos', cls: 'th-stratos' },
  { name: 'Nova', cls: 'th-nova' },
  { name: 'Twilight', cls: 'th-twilight' },
  { name: 'Coral Glow', cls: 'th-coral-glow' },
  { name: 'Mercury', cls: 'th-mercury' },
  { name: 'Ashrose', cls: 'th-ashrose' },
  { name: 'Spectrum', cls: 'th-spectrum' },
  { name: 'Chisel', cls: 'th-chisel' },
  { name: 'Stardust', cls: 'th-stardust' },
  { name: 'Seafoam', cls: 'th-seafoam' },
  { name: 'Nebulae', cls: 'th-nebulae' },
  { name: 'Creme', cls: 'th-creme' },
  { name: 'Lux', cls: 'th-lux' },
  { name: 'Consultant', cls: 'th-consultant' },
  { name: 'Marine', cls: 'th-marine' },
]

const MORE_ICON = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>`

const grid = $('#theme-grid')
const emptyBox = $('#th-empty')
const emptyText = $('#th-empty-text')
const searchInput = $('#th-search-input')
const view = { tab: 'standard', query: '' }

/* ---------------- 工具 ---------------- */

function customVarsStyle(vars) {
  const accent = vars.accent ?? vars.link ?? '#3b6ef6'
  return `--th-bg:${vars.bg};--th-slide:${vars.slide ?? vars.bg};--th-title:${vars.title};--th-body:${vars.body};--th-link:${accent};`
}

function isApplied(id) {
  return store.state.appliedTheme === id
}

function cardMenu(theme, archived = false) {
  if (archived) {
    return `<div class="card-menu" hidden>
      <button type="button" data-card-action="恢复主题" data-id="${theme.id}">恢复主题</button>
      <button type="button" class="danger" data-card-action="删除主题" data-id="${theme.id}">删除主题</button>
    </div>`
  }
  const standard = !theme.custom
  return `<div class="card-menu" hidden>
    <button type="button" data-card-action="应用主题" data-id="${theme.cls ?? theme.id}">应用主题</button>
    <button type="button" data-card-action="设为默认" data-id="${theme.cls ?? theme.id}">设为默认</button>
    <button type="button" data-card-action="复制主题" data-id="${theme.cls ?? theme.id}">复制主题</button>
    ${standard ? '' : `<button type="button" data-card-action="归档主题" data-id="${theme.id}">归档主题</button>
    <button type="button" class="danger" data-card-action="删除主题" data-id="${theme.id}">删除主题</button>`}
  </div>`
}

function cardHtml(theme, archived = false) {
  const id = theme.cls ?? theme.id
  const style = theme.custom && theme.vars ? `style="${customVarsStyle(theme.vars)}"` : ''
  const badge = isApplied(id) ? '<span class="th-applied-badge">已应用</span>' : ''
  return `
    <article class="theme-card" data-theme-card="${theme.name}" tabindex="0">
      <div class="theme-preview ${theme.cls ?? ''}" ${style}>
        ${badge}
        <div class="theme-slide">
          <p class="th-title">标题</p>
          <p class="th-body">正文和<span class="th-link">链接</span></p>
        </div>
      </div>
      <div class="theme-meta">
        <span class="theme-name">${theme.name}</span>
        <button class="theme-more" type="button" aria-label="${theme.name} 更多操作" aria-haspopup="true">${MORE_ICON}</button>
      </div>
      ${cardMenu(theme, archived)}
    </article>`
}

function currentList() {
  if (view.tab === 'custom') return store.state.customThemes.map((t) => ({ ...t, custom: true }))
  if (view.tab === 'archived') return store.state.archivedThemes.map((t) => ({ ...t, custom: true }))
  return STANDARD_THEMES
}

function applyView() {
  closeAllMenus()
  const list = currentList().filter((t) => !view.query || t.name.toLowerCase().includes(view.query))
  const archived = view.tab === 'archived'

  if (!list.length) {
    grid.innerHTML = ''
    emptyBox.hidden = false
    emptyText.textContent = view.query
      ? `没有找到与「${view.query}」匹配的主题`
      : view.tab === 'custom'
        ? '还没有自定义主题，点击「新建主题」开始创建'
        : '归档中暂无主题'
    $('#th-empty-cta').style.display = view.tab === 'custom' && !view.query ? 'inline-flex' : 'none'
    return
  }

  emptyBox.hidden = true
  grid.innerHTML = list.map((t) => cardHtml(t, archived)).join('')
}

/* ---------------- 选项卡 / 搜索 ---------------- */

$$('.th-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    view.tab = tab.dataset.tab
    $$('.th-tab').forEach((item) => {
      const active = item === tab
      item.classList.toggle('is-active', active)
      item.setAttribute('aria-selected', String(active))
    })
    applyView()
  })
})

searchInput.addEventListener('input', (event) => {
  view.query = event.target.value.trim().toLowerCase()
  applyView()
})

/* ---------------- 卡片菜单与应用 ---------------- */

function closeAllMenus() {
  $$('.card-menu').forEach((menu) => { menu.hidden = true })
}

function applyTheme(id) {
  store.state.appliedTheme = id
  store.state.settings.appearance.themeId = id
  store.save()
  applyAppearance()
  applyView()
  const name = [...STANDARD_THEMES, ...store.state.customThemes, ...store.state.archivedThemes].find(
    (t) => (t.cls ?? t.id) === id,
  )?.name ?? id
  toast(`已应用主题「${name}」，全站配色已更新`)
}

grid.addEventListener('click', (event) => {
  const moreBtn = event.target.closest('.theme-more')
  if (moreBtn) {
    event.stopPropagation()
    const card = moreBtn.closest('.theme-card')
    const menu = $('.card-menu', card)
    const willOpen = menu.hidden
    closeAllMenus()
    menu.hidden = !willOpen
    return
  }

  const actionBtn = event.target.closest('[data-card-action]')
  if (actionBtn) {
    event.stopPropagation()
    handleCardAction(actionBtn.dataset.cardAction, actionBtn.dataset.id)
    closeAllMenus()
    return
  }

  const card = event.target.closest('.theme-card')
  if (card) {
    const theme = currentList().find((t) => t.name === card.dataset.themeCard)
    if (theme) applyTheme(theme.cls ?? theme.id)
  }
})

function handleCardAction(action, id) {
  const standard = STANDARD_THEMES.find((t) => t.cls === id)
  const custom = [...store.state.customThemes, ...store.state.archivedThemes].find((t) => t.id === id)

  switch (action) {
    case '应用主题':
      applyTheme(id)
      break
    case '设为默认':
      store.state.defaultTheme = id
      store.save()
      toast('已设为新工作区的默认主题')
      break
    case '复制主题': {
      const src = standard ?? custom
      const copy = {
        id: uid('th'),
        name: `${src.name} 副本`,
        custom: true,
        cls: src.cls ?? null,
        vars: src.vars ?? null,
        createdAt: Date.now(),
      }
      store.state.customThemes.unshift(copy)
      store.save()
      view.tab = 'custom'
      syncTabs()
      applyView()
      toast(`已复制为自定义主题「${copy.name}」`)
      break
    }
    case '归档主题': {
      const idx = store.state.customThemes.findIndex((t) => t.id === id)
      if (idx < 0) return
      const [t] = store.state.customThemes.splice(idx, 1)
      store.state.archivedThemes.unshift(t)
      if (store.state.appliedTheme === id) {
        store.state.appliedTheme = null
        applyAppearance()
      }
      store.save()
      applyView()
      toast(`「${t.name}」已归档`)
      break
    }
    case '恢复主题': {
      const idx = store.state.archivedThemes.findIndex((t) => t.id === id)
      if (idx < 0) return
      const [t] = store.state.archivedThemes.splice(idx, 1)
      store.state.customThemes.unshift(t)
      store.save()
      applyView()
      toast(`「${t.name}」已恢复到自定义主题`)
      break
    }
    case '删除主题':
      if (standard) {
        toast('标准主题不可删除，但可在自定义主题中复制后调整')
        return
      }
      confirmModal('删除主题', `确定删除「${custom.name}」吗？此操作不可撤销。`, '删除').then((ok) => {
        if (!ok) return
        store.state.customThemes = store.state.customThemes.filter((t) => t.id !== id)
        store.state.archivedThemes = store.state.archivedThemes.filter((t) => t.id !== id)
        if (store.state.appliedTheme === id) {
          store.state.appliedTheme = null
          applyAppearance()
        }
        store.save()
        applyView()
        toast('主题已删除')
      })
      break
    default:
      toast(action)
  }
}

function syncTabs() {
  $$('.th-tab').forEach((tab) => {
    const active = tab.dataset.tab === view.tab
    tab.classList.toggle('is-active', active)
    tab.setAttribute('aria-selected', String(active))
  })
}

document.addEventListener('click', closeAllMenus)
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAllMenus() })

/* ---------------- 新建主题：全屏编辑器（按截图 1:1） ---------------- */

const TE_DEFAULTS = {
  bg: '#191a1e',
  slide: '#0c0d10',
  accent: '#F2F2F3',
  accents: [],
  title: '#F2F2F3',
  subtitle: '#F2F2F3',
  body: '#E5E0DF',
  eyebrow: '#F2F2F3',
  headingFont: 'system',
  bodyFont: 'system',
  radius: 12,
  density: 'comfortable',
  imageRadius: 12,
  logoName: '',
  logoInitials: '',
  chartColors: ['#F2F2F3', '#8a8f98', '#E5E0DF'],
  css: '',
}

const TE_TABS = [
  { key: 'color', label: '颜色', icon: '🎨' },
  { key: 'font', label: '字体', icon: 'Aa' },
  { key: 'logo', label: '标志', icon: '🏅' },
  { key: 'design', label: '设计', icon: '📐' },
  { key: 'image', label: '图片', icon: '🖼️' },
  { key: 'chart', label: '图表', icon: '📊' },
  { key: 'css', label: '自定义 CSS', icon: '</>' },
]

const FONT_OPTIONS = [
  ['system', '系统默认'], ['song', '宋体'], ['hei', '黑体'], ['georgia', 'Georgia 衬线'], ['mono', '等宽字体'],
]
const HEX_RE = /^#[0-9a-fA-F]{6}$/

function openCreator() {
  const draft = structuredClone(TE_DEFAULTS)
  let activeTab = 'color'

  const mask = document.createElement('div')
  mask.className = 'te-mask'
  mask.innerHTML = `
    <button class="te-x" type="button" aria-label="关闭">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
    </button>
    <section class="te-panel" role="dialog" aria-modal="true" aria-label="新建主题">
      <header class="te-head">
        <div class="te-name-wrap">
          <input class="te-name" id="te-name" type="text" placeholder="无标题主题" />
          <button class="te-pencil" type="button" aria-label="编辑名称">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
        </div>
        <p class="te-usage"><b id="te-usage-count">0</b> 人 Design Buddy 正在使用此主题。</p>
      </header>
      <div class="te-body">
        <nav class="te-nav" id="te-nav" aria-label="主题设置分组">
          ${TE_TABS.map((t) => `
            <button type="button" class="te-nav-item" data-te-tab="${t.key}">
              <span class="te-nav-ic">${t.icon}</span><span>${t.label}</span>
            </button>`).join('')}
        </nav>
        <div class="te-content" id="te-content"></div>
      </div>
      <footer class="te-foot">
        <button class="btn btn-ghost" id="te-cancel" type="button">取消</button>
        <button class="btn btn-primary" id="te-save" type="button">保存主题</button>
      </footer>
    </section>
    <section class="te-preview-wrap">
      <div class="te-preview" id="te-preview">
        <article class="pv-card">
          <p class="pv-label">主题预览</p>
          <h1 class="pv-title">看看您的主题如何塑造演示文稿的每个部分</h1>
          <p class="pv-body">接下来的卡片将逐一介绍每项主题设置，并通过可编辑的画布内容展示其实际效果。</p>
          <p class="pv-body pv-body-2">当您自定义主题时，可实时观察字体排版、颜色、版块、卡片设计和数据的同步更新效果。</p>
          <div class="pv-tags">
            <span class="pv-tag pv-tag-solid">可编辑</span>
            <span class="pv-tag pv-tag-outline">主题感知</span>
          </div>
          <div class="pv-btns">
            <button type="button" class="pv-btn pv-btn-primary">主按钮</button>
            <button type="button" class="pv-btn pv-btn-secondary">次按钮</button>
          </div>
        </article>
        <article class="pv-card">
          <p class="pv-label">排版</p>
          <h2 class="pv-subtitle">让每个想法都清晰表达</h2>
          <p class="pv-body">选择标题字体和正文字体，然后调整每种文字样式的大小和颜色。Design Buddy 会在您的幻灯片中统一应用该层级结构。</p>
        </article>
      </div>
    </section>`
  document.body.append(mask)
  document.body.style.overflow = 'hidden'

  const content = mask.querySelector('#te-content')
  const preview = mask.querySelector('#te-preview')

  /* ---------- 通用颜色字段 ---------- */

  function colorField(key, { label, default: def, defaultLabel = false, withBadge = false } = {}) {
    const value = draft[key]
    const isDefault = value.toLowerCase() === def.toLowerCase()
    return `
      <div class="te-field-row">
        ${label ? `
          <div class="te-field-head">
            <span class="te-field-label">${label}</span>
            ${withBadge ? `<span class="te-aa-badge">Aa<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#22a06b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>` : ''}
          </div>` : ''}
        <div class="te-color-input">
          <label class="te-swatch"><input type="color" data-color="${key}" value="${value}"></label>
          <input type="text" data-hex="${key}" value="${value.toUpperCase()}" spellcheck="false">
          ${isDefault && defaultLabel ? '<span class="te-default-tag">（默认）</span>' : ''}
          <button type="button" class="te-reset" data-reset="${key}" data-default="${def}" title="恢复默认" ${isDefault ? 'hidden' : ''}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          </button>
        </div>
      </div>`
  }

  function syncResetStates() {
    content.querySelectorAll('[data-reset]').forEach((btn) => {
      const key = btn.dataset.reset
      const atDefault = draft[key].toLowerCase() === btn.dataset.default.toLowerCase()
      btn.hidden = atDefault
      const tag = btn.closest('.te-color-input')?.querySelector('.te-default-tag')
      if (tag) tag.style.display = atDefault ? '' : 'none'
    })
  }

  /* ---------- 各分组内容 ---------- */

  function renderTab() {
    mask.querySelectorAll('.te-nav-item').forEach((b) => b.classList.toggle('is-active', b.dataset.teTab === activeTab))

    if (activeTab === 'color') {
      content.innerHTML = `
        <h3 class="te-section-title">颜色</h3>
        <p class="te-group-label">主题调色板 <i class="te-info">i</i></p>
        <div class="te-sub-label">主要强调色 <i class="te-info">i</i></div>
        ${colorField('accent', { label: '', default: TE_DEFAULTS.accent })}
        <div class="te-sub-label">辅助点缀色（可选） <i class="te-info">i</i></div>
        <div id="te-accents">
          ${draft.accents.map((c, i) => `
            <div class="te-color-input te-accent-row">
              <label class="te-swatch"><input type="color" data-accent-color="${i}" value="${c}"></label>
              <input type="text" data-accent-hex="${i}" value="${c.toUpperCase()}" spellcheck="false">
              <button type="button" class="te-reset" data-accent-del="${i}" title="移除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </button>
            </div>`).join('')}
        </div>
        <button type="button" class="te-add-color" id="te-add-accent">＋ 添加颜色</button>

        <h3 class="te-section-title te-text-title">文本</h3>
        ${colorField('title', { label: '标题颜色', default: TE_DEFAULTS.title, withBadge: true })}
        ${colorField('subtitle', { label: '副标题颜色', default: TE_DEFAULTS.subtitle, defaultLabel: true, withBadge: true })}
        ${colorField('body', { label: '正文颜色', default: TE_DEFAULTS.body, withBadge: true })}
        ${colorField('eyebrow', { label: '题眉颜色', default: TE_DEFAULTS.eyebrow, defaultLabel: true, withBadge: true })}`
      bindColorInputs()
      mask.querySelector('#te-add-accent').addEventListener('click', () => {
        draft.accents.push('#98a1b2')
        renderTab()
        syncPreview()
      })
    }

    if (activeTab === 'font') {
      content.innerHTML = `
        <h3 class="te-section-title">字体</h3>
        <div class="field"><label>标题字体</label>
          <select data-draft="headingFont">${FONT_OPTIONS.map(([v, l]) => `<option value="${v}" ${draft.headingFont === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label>正文字体</label>
          <select data-draft="bodyFont">${FONT_OPTIONS.map(([v, l]) => `<option value="${v}" ${draft.bodyFont === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <p class="te-tip">字体选择会实时反映到右侧预览，并在应用主题后作用于全站。</p>`
      content.querySelectorAll('select[data-draft]').forEach((sel) => {
        sel.addEventListener('change', () => { draft[sel.dataset.draft] = sel.value; syncPreview() })
      })
    }

    if (activeTab === 'logo') {
      content.innerHTML = `
        <h3 class="te-section-title">标志</h3>
        <div class="field"><label>品牌名称</label><input type="text" data-draft="logoName" value="${draft.logoName}" placeholder="例如：Design Buddy" /></div>
        <div class="field"><label>缩写标志（两字符以内）</label><input type="text" data-draft="logoInitials" value="${draft.logoInitials}" maxlength="2" placeholder="DB" /></div>
        <p class="te-tip">标志信息随主题保存，应用主题的 Design Buddy 会在页眉处展示。</p>`
      bindDraftInputs()
    }

    if (activeTab === 'design') {
      content.innerHTML = `
        <h3 class="te-section-title">设计</h3>
        <div class="field"><label>卡片圆角：<b id="te-radius-val">${draft.radius}px</b></label>
          <input type="range" min="0" max="28" value="${draft.radius}" data-draft-num="radius" /></div>
        <div class="field"><label>版面密度</label>
          <div class="seg" id="te-density">
            ${[['comfortable', '舒适'], ['compact', '紧凑']].map(([v, l]) => `<button type="button" data-density="${v}" class="${draft.density === v ? 'is-on' : ''}">${l}</button>`).join('')}
          </div></div>`
      content.querySelector('input[data-draft-num="radius"]').addEventListener('input', (e) => {
        draft.radius = Number(e.target.value)
        content.querySelector('#te-radius-val').textContent = `${draft.radius}px`
        syncPreview()
      })
      content.querySelector('#te-density').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-density]')
        if (!btn) return
        draft.density = btn.dataset.density
        renderTab()
        syncPreview()
      })
    }

    if (activeTab === 'image') {
      content.innerHTML = `
        <h3 class="te-section-title">图片</h3>
        <div class="field"><label>图片圆角：<b id="te-img-radius-val">${draft.imageRadius}px</b></label>
          <input type="range" min="0" max="28" value="${draft.imageRadius}" data-draft-num="imageRadius" /></div>
        <p class="te-tip">控制主题下所有图片与截图的默认圆角。</p>`
      content.querySelector('input[data-draft-num="imageRadius"]').addEventListener('input', (e) => {
        draft.imageRadius = Number(e.target.value)
        content.querySelector('#te-img-radius-val').textContent = `${draft.imageRadius}px`
        syncPreview()
      })
    }

    if (activeTab === 'chart') {
      content.innerHTML = `
        <h3 class="te-section-title">图表</h3>
        <p class="te-sub-label">图表配色</p>
        <div id="te-chart-colors">
          ${draft.chartColors.map((c, i) => `
            <div class="te-color-input te-accent-row">
              <label class="te-swatch"><input type="color" data-chart-color="${i}" value="${c}"></label>
              <input type="text" data-chart-hex="${i}" value="${c.toUpperCase()}" spellcheck="false">
              <button type="button" class="te-reset" data-chart-del="${i}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </button>
            </div>`).join('')}
        </div>
        <button type="button" class="te-add-color" id="te-add-chart">＋ 添加颜色</button>`
      bindChartInputs()
      mask.querySelector('#te-add-chart').addEventListener('click', () => {
        draft.chartColors.push('#3b6ef6')
        renderTab()
      })
    }

    if (activeTab === 'css') {
      content.innerHTML = `
        <h3 class="te-section-title">自定义 CSS</h3>
        <div class="field"><label>追加到主题的样式（高级）</label>
          <textarea id="te-css" rows="10" spellcheck="false" placeholder=".pv-title { letter-spacing: 2px; }">${draft.css}</textarea></div>`
      content.querySelector('#te-css').addEventListener('input', (e) => { draft.css = e.target.value })
    }
  }

  function bindDraftInputs() {
    content.querySelectorAll('input[data-draft]').forEach((inputEl) => {
      inputEl.addEventListener('input', () => { draft[inputEl.dataset.draft] = inputEl.value })
    })
  }

  function bindColorInputs() {
    content.querySelectorAll('[data-color]').forEach((picker) => {
      picker.addEventListener('input', () => {
        draft[picker.dataset.color] = picker.value
        syncHex(picker.dataset.color)
        syncResetStates()
        syncPreview()
      })
    })
    content.querySelectorAll('[data-hex]').forEach((hexEl) => {
      hexEl.addEventListener('input', () => {
        if (!HEX_RE.test(hexEl.value)) return
        draft[hexEl.dataset.hex] = hexEl.value
        syncResetStates()
        syncPreview()
      })
      hexEl.addEventListener('change', renderTab)
    })
    content.querySelectorAll('[data-reset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        draft[btn.dataset.reset] = btn.dataset.default
        renderTab()
        syncPreview()
      })
    })
    content.querySelectorAll('[data-accent-color]').forEach((picker) => {
      picker.addEventListener('input', () => { draft.accents[Number(picker.dataset.accentColor)] = picker.value; syncPreview() })
    })
    content.querySelectorAll('[data-accent-hex]').forEach((hexEl) => {
      hexEl.addEventListener('change', () => {
        if (HEX_RE.test(hexEl.value)) draft.accents[Number(hexEl.dataset.accentHex)] = hexEl.value
        renderTab()
      })
    })
    content.querySelectorAll('[data-accent-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        draft.accents.splice(Number(btn.dataset.accentDel), 1)
        renderTab()
      })
    })
  }

  function bindChartInputs() {
    content.querySelectorAll('[data-chart-color]').forEach((picker) => {
      picker.addEventListener('input', () => { draft.chartColors[Number(picker.dataset.chartColor)] = picker.value })
    })
    content.querySelectorAll('[data-chart-hex]').forEach((hexEl) => {
      hexEl.addEventListener('change', () => {
        if (HEX_RE.test(hexEl.value)) draft.chartColors[Number(hexEl.dataset.chartHex)] = hexEl.value
        renderTab()
      })
    })
    content.querySelectorAll('[data-chart-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        draft.chartColors.splice(Number(btn.dataset.chartDel), 1)
        renderTab()
      })
    })
  }

  function syncHex(key) {
    const hexEl = content.querySelector(`[data-hex="${key}"]`)
    if (hexEl) hexEl.value = draft[key].toUpperCase()
  }

  function syncPreview() {
    preview.style.setProperty('--pv-accent', draft.accent)
    preview.style.setProperty('--pv-title', draft.title)
    preview.style.setProperty('--pv-subtitle', draft.subtitle)
    preview.style.setProperty('--pv-body', draft.body)
    preview.style.setProperty('--pv-eyebrow', draft.eyebrow)
    preview.style.setProperty('--pv-slide', draft.slide)
    preview.style.setProperty('--pv-radius', `${draft.radius}px`)
    preview.style.setProperty('--pv-img-radius', `${draft.imageRadius}px`)
    preview.style.setProperty('--pv-heading-font', FONT_STACKS_CSS[draft.headingFont] ?? FONT_STACKS_CSS.system)
    preview.style.setProperty('--pv-body-font', FONT_STACKS_CSS[draft.bodyFont] ?? FONT_STACKS_CSS.system)
  }

  mask.querySelector('#te-nav').addEventListener('click', (e) => {
    const item = e.target.closest('[data-te-tab]')
    if (!item) return
    activeTab = item.dataset.teTab
    renderTab()
  })

  function close() {
    mask.remove()
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onEsc)
  }
  function onEsc(e) {
    if (e.key === 'Escape') close()
  }
  mask.querySelector('.te-x').addEventListener('click', close)
  mask.querySelector('#te-cancel').addEventListener('click', close)
  document.addEventListener('keydown', onEsc)
  mask.querySelector('#te-save').addEventListener('click', () => {
    const name = mask.querySelector('#te-name').value.trim() || '无标题主题'
    const vars = {
      ...draft,
      // 兼容旧版主题卡片与全局取色逻辑
      link: draft.accent,
    }
    store.state.customThemes.unshift({
      id: uid('th'), name, custom: true, cls: null, vars, createdAt: Date.now(),
    })
    store.save()
    close()
    view.tab = 'custom'
    syncTabs()
    applyView()
    toast(`主题「${name}」已保存，可在卡片菜单中应用`)
  })

  renderTab()
  syncPreview()
  mask.querySelector('#te-name').focus()
}

const FONT_STACKS_CSS = {
  system: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  song: "'Songti SC', 'SimSun', serif",
  hei: "'Heiti SC', 'Microsoft YaHei', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  mono: "'SF Mono', 'Cascadia Code', Consolas, monospace",
}

$('#th-create').addEventListener('click', openCreator)
$('#th-empty-cta').addEventListener('click', openCreator)

/* ---------------- 侧栏：自定义字体 / 自定义指令 ---------------- */

document.addEventListener('click', (event) => {
  const demo = event.target.closest('[data-demo]')
  if (!demo) return
  event.preventDefault()
  if (demo.dataset.demo === '自定义字体') {
    const fonts = [
      ['system', '系统默认'], ['song', '宋体'], ['hei', '黑体'], ['georgia', 'Georgia 衬线'], ['mono', '等宽字体'],
    ]
    const { close, bodyEl, footEl } = openModal({
      title: '自定义字体',
      body: `<div class="modal-list">${fonts.map(([v, label]) => `
        <button class="modal-list-item" data-font="${v}">
          <span class="ws-check">${store.state.settings.fontFamily === v ? '✓' : ''}</span>
          <span class="grow"><span class="primary">${label}</span></span>
        </button>`).join('')}</div>`,
      footer: '<button class="btn btn-primary" data-close>完成</button>',
    })
    bodyEl.querySelectorAll('[data-font]').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.state.settings.fontFamily = btn.dataset.font
        store.save()
        applyAppearance()
        toast('字体已切换')
        close()
      })
    })
    footEl.querySelector('[data-close]').addEventListener('click', close)
  } else if (demo.dataset.demo === '自定义指令') {
    const { close, bodyEl, footEl } = openModal({
      title: '自定义指令',
      body: `<div class="field"><label>告诉 Buddy 你的固定偏好（每次创作都会遵循）</label>
        <textarea id="instr-text" placeholder="例如：所有演示默认 16:9，文案使用简体中文，避免使用 emoji。">${store.state.instructions}</textarea></div>`,
      footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>保存指令</button>',
    })
    footEl.querySelector('[data-ok]').addEventListener('click', () => {
      store.state.instructions = bodyEl.querySelector('#instr-text').value.trim()
      store.save()
      close()
      toast('自定义指令已保存')
    })
    footEl.querySelector('[data-close]').addEventListener('click', close)
  }
})

applyView()
