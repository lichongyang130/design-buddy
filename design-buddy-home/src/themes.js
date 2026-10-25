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
  return `--th-bg:${vars.bg};--th-slide:${vars.slide};--th-title:${vars.title};--th-body:${vars.body};--th-link:${vars.link};`
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

/* ---------------- 新建主题 ---------------- */

function openCreator() {
  const defaults = { bg: '#f4f6fb', slide: '#ffffff', title: '#1e2b4d', body: '#98a1b2', link: '#3b6ef6' }
  const { close, bodyEl, footEl } = openModal({
    title: '新建主题',
    wide: true,
    body: `
      <div class="th-creator">
        <form class="th-form">
          <div class="field"><label>主题名称</label><input type="text" id="th-name" placeholder="例如：品牌蓝" /></div>
          ${Object.entries({ bg: '页面背景', slide: '卡片背景', title: '标题颜色', body: '正文颜色', link: '链接 / 强调色' })
            .map(([key, label]) => `
            <div class="field th-color-field">
              <label>${label}</label>
              <input type="color" id="c-${key}" value="${defaults[key]}" />
              <input type="text" id="t-${key}" value="${defaults[key]}" />
            </div>`).join('')}
        </form>
        <div class="theme-preview th-live" id="th-live" style="${customVarsStyle(defaults)}">
          <div class="theme-slide">
            <p class="th-title">标题</p>
            <p class="th-body">正文和<span class="th-link">链接</span></p>
          </div>
        </div>
      </div>`,
    footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>保存主题</button>',
  })

  const vars = { ...defaults }
  bodyEl.querySelectorAll('.th-color-field').forEach((field) => {
    const key = field.querySelector('input[type="color"]').id.slice(2)
    const color = field.querySelector('input[type="color"]')
    const text = field.querySelector('input[type="text"]')
    const sync = (val) => {
      vars[key] = val
      color.value = val
      text.value = val
      $('#th-live', bodyEl).style.cssText = customVarsStyle(vars)
    }
    color.addEventListener('input', () => sync(color.value))
    text.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(text.value)) sync(text.value) })
  })

  footEl.querySelector('[data-ok]').addEventListener('click', () => {
    const name = bodyEl.querySelector('#th-name').value.trim()
    if (!name) return toast('请输入主题名称')
    store.state.customThemes.unshift({
      id: uid('th'), name, custom: true, cls: null, vars: { ...vars }, createdAt: Date.now(),
    })
    store.save()
    close()
    view.tab = 'custom'
    syncTabs()
    applyView()
    toast(`主题「${name}」已保存，可在卡片菜单中应用`)
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
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
