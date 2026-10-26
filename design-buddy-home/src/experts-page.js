/* ============================================================
   专家页：把截图式发现区做成真实页面（左侧沿用首页窄栏 rail）
   - 顶部 专家 / 技能 / 连接器：三者都是独立页面
   - 场景卡 / 专家·专家团 / 综合·最热·最新 / 分类 chips 全部真实过滤
   - 卡片点击 = 固定 / 取消固定，与首页专家子菜单同源持久化
   ============================================================ */

import './rail-flyout.js'
import { requireAuth } from './auth.js'
requireAuth()
import './experts.css'
import { store, toast, uid } from './core.js'
import { initGlobalUI } from './global-ui.js'
import { EXPERT_CATEGORIES, EXPERT_CATALOG, EXPERT_FILTERS, formatUsage } from './experts-catalog.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const PIN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/></svg>'

// 页面内筛选状态（不持久化，刷新回到默认视图）
const ui = { q: '', kind: 'expert', sort: '综合', chip: '全部', mineOnly: false }

const pinnedNames = () => new Set(store.state.experts.filter((e) => e.pinned).map((e) => e.name))

/* ---------- 固定 / 取消固定：真实落库，与首页专家子菜单共享 ---------- */

const togglePin = (entry) => {
  const existing = store.state.experts.find((e) => e.name === entry.name)
  if (existing) {
    existing.pinned = !existing.pinned
    toast(existing.pinned ? `已固定「${entry.name}」` : `已取消固定「${entry.name}」`)
  } else {
    store.state.experts.push({ id: uid('ex'), name: entry.name, color: entry.color, desc: entry.desc, pinned: true })
    toast(`已固定「${entry.name}」`)
  }
  store.save()
}

/* ---------- 渲染 ---------- */

const renderCategories = () => {
  $('#ex-cat-grid').innerHTML = EXPERT_CATEGORIES.map((c) => `
    <button class="ex-cat" type="button" data-cat="${c.filter}" aria-pressed="false">
      <span class="ex-cat-banner" style="background-image:url('${c.art}')">
        <span class="ex-cat-name">${c.name}</span>
      </span>
      <span class="ex-cat-subs">${c.subs.map((s) => `
        <span class="ex-cat-sub"><span class="ex-cat-sub-label">${s}</span><i>›</i></span>`).join('')}</span>
    </button>`).join('')
  syncCategory()
}

const renderChips = () => {
  $('#ex-chip-track').innerHTML = EXPERT_FILTERS.map((f) => `
    <button class="ex-chip${ui.chip === f ? ' is-active' : ''}" type="button" data-chip="${f}">${f}</button>`).join('')
}

const computeList = () => {
  let list = EXPERT_CATALOG.filter((e) => e.kind === ui.kind)
  if (ui.chip !== '全部') list = list.filter((e) => e.category === ui.chip)
  if (ui.mineOnly) {
    const pinned = pinnedNames()
    list = list.filter((e) => pinned.has(e.name))
  }
  const q = ui.q.trim().toLowerCase()
  if (q) list = list.filter((e) => [e.name, e.desc, ...e.tags].join(' ').toLowerCase().includes(q))
  if (ui.sort === '最热') list = [...list].sort((a, b) => b.usage - a.usage)
  else if (ui.sort === '最新') list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return list
}

const renderGrid = () => {
  const list = computeList()
  const pinned = pinnedNames()
  $('#ex-grid').innerHTML = list.length ? list.map((e) => `
    <button class="ex-card${pinned.has(e.name) ? ' is-pinned' : ''}" type="button" data-pin="${e.id}"
      aria-pressed="${pinned.has(e.name)}">
      <span class="ex-card-head">
        <span class="expert-avatar ${e.color}">${e.name[0]}</span>
        <span class="ex-card-title">
          <span class="ex-card-name">
            <span class="ex-card-name-text">${e.name}</span>${e.badge ? `<b class="ex-badge">${e.badge}</b>` : ''}
          </span>
          <span class="ex-card-desc" title="${e.desc}">${e.desc}</span>
        </span>
      </span>
      <span class="ex-card-tags">${e.tags.map((t) => `<span class="ex-tag">${t}</span>`).join('')}</span>
      <span class="ex-card-foot">
        <span class="ex-usage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>
          ${formatUsage(e.usage)}</span>
        <span class="ex-pin-mark">${pinned.has(e.name) ? '已固定' : ''}${PIN_ICON}</span>
      </span>
    </button>`).join('')
    : '<p class="ex-empty">没有匹配的专家，换个关键词或筛选条件试试。</p>'
}

const syncCategory = () => {
  $$('.ex-cat').forEach((c) => {
    const on = c.dataset.cat === ui.chip
    c.classList.toggle('is-active', on)
    c.setAttribute('aria-pressed', String(on))
  })
}

/* ---------- 事件 ---------- */

// 顶部页签：技能已是独立页面（顶部是链接），这里只处理「我的专家」与搜索
$('.ex-top-actions').addEventListener('click', (ev) => {
  if (ev.target.closest('[data-mine]')) {
    ui.mineOnly = !ui.mineOnly
    $('[data-mine]').classList.toggle('is-active', ui.mineOnly)
    renderGrid()
  }
})

$('#ex-search-input').addEventListener('input', (ev) => {
  ui.q = ev.target.value
  renderGrid()
})

// 场景卡：等于激活对应分类 chip
$('#ex-cat-grid').addEventListener('click', (ev) => {
  const card = ev.target.closest('[data-cat]')
  if (!card) return
  ui.chip = card.dataset.cat
  $$('.ex-chip').forEach((c) => c.classList.toggle('is-active', c.dataset.chip === ui.chip))
  renderChips()
  syncCategory()
  renderGrid()
})

$('#ex-chip-track').addEventListener('click', (ev) => {
  const chip = ev.target.closest('[data-chip]')
  if (!chip) return
  ui.chip = chip.dataset.chip
  renderChips()
  syncCategory()
  renderGrid()
})

$('[data-chip-scroll]').addEventListener('click', () => {
  $('#ex-chip-track').scrollBy?.({ left: 220, behavior: 'smooth' })
})

$('.ex-kind-tabs').addEventListener('click', (ev) => {
  const tab = ev.target.closest('[data-kind]')
  if (!tab) return
  ui.kind = tab.dataset.kind
  $$('[data-kind]').forEach((b) => b.classList.toggle('is-active', b === tab))
  renderGrid()
})

$('.ex-sort').addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-sort]')
  if (!btn) return
  ui.sort = btn.dataset.sort
  $$('[data-sort]').forEach((b) => b.classList.toggle('is-active', b === btn))
  renderGrid()
})

$('#ex-grid').addEventListener('click', (ev) => {
  const card = ev.target.closest('[data-pin]')
  if (!card) return
  const entry = EXPERT_CATALOG.find((e) => e.id === card.dataset.pin)
  if (!entry) return
  togglePin(entry)
  renderGrid()
})

/* ---------- 首屏 ---------- */

renderCategories()
renderChips()
renderGrid()
