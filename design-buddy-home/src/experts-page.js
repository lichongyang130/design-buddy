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
import { avatarHTML, expertAvatar } from './expert-avatars.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const PIN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/></svg>'

// 卡片底部的一行「它解决什么问题」
const SOLVES_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/></svg>'

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
  $('#ex-grid').innerHTML = list.length ? list.map((e) => {
    const isPinned = pinned.has(e.name)
    return `
    <article class="ex-card${isPinned ? ' is-pinned' : ''}" data-expert="${e.id}">
      <button class="ex-card-hit" type="button" data-open-expert="${e.id}" aria-label="查看「${e.name}」详情"></button>
      <span class="ex-card-head">
        ${avatarHTML(e, { color: e.color, className: 'expert-avatar' })}
        <span class="ex-card-title">
          <span class="ex-card-name">
            <span class="ex-card-name-text">${e.name}</span>${e.badge ? `<b class="ex-badge">${e.badge}</b>` : ''}
          </span>
          <span class="ex-card-desc" title="${e.desc}">${e.desc}</span>
        </span>
      </span>
      <span class="ex-card-tags">${e.tags.map((t) => `<span class="ex-tag">${t}</span>`).join('')}</span>
      <span class="ex-card-solves" title="${e.solves?.[0] ?? ''}">
        ${SOLVES_ICON}<span>${e.solves?.[0] ?? ''}</span>
      </span>
      <span class="ex-card-foot">
        <span class="ex-usage">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>
          ${formatUsage(e.usage)}</span>
        <button class="ex-pin-btn${isPinned ? ' is-pinned' : ''}" type="button" data-pin="${e.id}"
          aria-pressed="${isPinned}" aria-label="${isPinned ? '取消固定' : '固定'}「${e.name}」">
          <span class="ex-pin-text">${isPinned ? '已固定' : ''}</span>${PIN_ICON}
        </button>
      </span>
    </article>`
  }).join('')
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
  const pinBtn = ev.target.closest('[data-pin]')
  if (pinBtn) {
    const entry = EXPERT_CATALOG.find((e) => e.id === pinBtn.dataset.pin)
    if (entry) {
      togglePin(entry)
      renderGrid()
    }
    return
  }
  const opener = ev.target.closest('[data-open-expert]')
  if (!opener) return
  const entry = EXPERT_CATALOG.find((e) => e.id === opener.dataset.openExpert)
  if (entry) openExpertDrawer(entry)
})

/* ---------- 专家详情抽屉（按截图：身份 / 召唤 / 介绍 / 能力标签 / 帮你做 / 更多） ---------- */

export const SUMMON_KEY = 'design-buddy-summon-v1'

// 召唤过场时长：够看清「正在召唤专家」，又不至于让人等
const SUMON_OVERLAY_MS = 1600

const DRAWER_ICON = {
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>',
  help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="8" r="3.1"/><path d="M3.8 20c0-3.4 2.8-6.2 6.2-6.2 1.2 0 2.3.3 3.2.9"/><path d="m17.4 4.2.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8Z"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="8" r="1.7"/><circle cx="16" cy="8" r="1.7"/><circle cx="8" cy="16" r="1.7"/><circle cx="16" cy="16" r="1.7"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  bubble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6a8 8 0 0 1-8.4 7.9 8.6 8.6 0 0 1-3.4-.7L4 20.5l1.5-4.3a8 8 0 0 1 6.6-12.1 8 8 0 0 1 8.4 7.5Z"/><circle cx="9" cy="11.5" r=".9" fill="currentColor" stroke="none"/><circle cx="12.5" cy="11.5" r=".9" fill="currentColor" stroke="none"/><circle cx="16" cy="11.5" r=".9" fill="currentColor" stroke="none"/></svg>',
}

let drawerMask = null
let drawerReturnFocus = null

const onDrawerKeydown = (ev) => {
  if (ev.key !== 'Escape') return
  ev.preventDefault()
  closeExpertDrawer()
}

const closeExpertDrawer = () => {
  if (!drawerMask) return
  drawerMask.remove()
  drawerMask = null
  document.removeEventListener('keydown', onDrawerKeydown)
  drawerReturnFocus?.focus?.()
  drawerReturnFocus = null
}

/* 召唤过场：先在当前页显示「正在召唤专家」，再带着数据进首页 */
const showSummonOverlay = (entry) => {
  if (document.querySelector('.ex-summon-mask')) return
  const mask = document.createElement('div')
  mask.className = 'ex-summon-mask'
  mask.dataset.summoning = entry.id
  const src = expertAvatar(entry)
  mask.innerHTML = `
    <div class="ex-summon-panel" role="status" aria-live="assertive">
      <span class="ex-summon-orbit" aria-hidden="true"><i></i><i></i><i></i></span>
      ${src
        ? `<img class="ex-summon-portrait" src="${src}" alt="" />`
        : `<span class="ex-summon-portrait is-initial ${entry.color}">${entry.name[0]}</span>`}
      <p class="ex-summon-title">正在召唤专家</p>
      <p class="ex-summon-name">${entry.name}${entry.persona ? ` · ${entry.persona}` : ''}</p>
      <span class="ex-summon-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>`
  document.body.appendChild(mask)
}

/* 召唤 / 带入提示词：过场动画后把意图交给首页（同一个 localStorage 域）再跳转 */
const summonExpert = (entry, prompt = '') => {
  try {
    localStorage.setItem(SUMMON_KEY, JSON.stringify({ id: entry.id, name: entry.name, prompt }))
  } catch {
    /* 隐私模式下写不进去也不阻断跳转 */
  }
  closeExpertDrawer()
  showSummonOverlay(entry)
  setTimeout(() => {
    location.href = 'index.html'
  }, SUMON_OVERLAY_MS)
}

const copyExpertId = async (entry) => {
  const text = entry.id
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      toast(`已复制专家 ID：${text}`)
      return
    }
  } catch {
    /* 落到手动选中兜底 */
  }
  const box = drawerMask?.querySelector('[data-copy-id]')
  if (box) {
    const range = document.createRange()
    range.selectNodeContents(box)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }
  toast('已选中 ID，按 Ctrl / ⌘ + C 复制')
}

const openExpertDrawer = (entry) => {
  if (!entry) return
  closeExpertDrawer()
  const usage = entry.usage ? formatUsage(entry.usage) : '暂无数据'
  const prompts = entry.prompts ?? []
  const mask = document.createElement('div')
  mask.className = 'ex-drawer-mask'
  mask.dataset.exDrawer = entry.id
  mask.innerHTML = `
    <aside class="ex-drawer" role="dialog" aria-modal="true" aria-labelledby="ex-drawer-title">
      <button class="ex-drawer-close" type="button" data-drawer-close aria-label="关闭专家详情">${DRAWER_ICON.close}</button>
      <div class="ex-drawer-head">
        ${avatarHTML(entry, { color: entry.color, className: 'expert-avatar' })}
        <div class="ex-drawer-ident">
          <h2 class="ex-drawer-title" id="ex-drawer-title">
            <span class="ex-drawer-name">${entry.name}</span>${entry.persona ? `<i aria-hidden="true">|</i><span class="ex-drawer-persona">${entry.persona}</span>` : ''}
          </h2>
          <button class="ex-summon" type="button" data-summon>召唤</button>
        </div>
      </div>
      <p class="ex-drawer-desc">${entry.desc}</p>
      <div class="ex-drawer-tags">${entry.tags.map((t) => `<span class="ex-tag">${t}</span>`).join('')}</div>
      <div class="ex-drawer-stats">
        <div class="ex-stat"><strong>${entry.version ?? 'v1.0.0'}</strong><span>版本</span></div>
        <div class="ex-stat"><strong>${DRAWER_ICON.bolt}${usage}</strong><span>使用量</span></div>
      </div>
      <section class="ex-drawer-sec">
        <h3 class="ex-drawer-sec-title">${DRAWER_ICON.target}<span>它能解决</span></h3>
        <ul class="ex-solve-list">${(entry.solves ?? []).map((s) => `
          <li class="ex-solve">${DRAWER_ICON.check}<span>${s}</span></li>`).join('')}</ul>
      </section>
      <section class="ex-drawer-sec">
        <h3 class="ex-drawer-sec-title">${DRAWER_ICON.help}<span>专家帮你做</span></h3>
        <div class="ex-prompt-list">${prompts.map((text) => `
          <button class="ex-prompt" type="button" data-prompt="${text}">
            <span class="ex-prompt-text">「${text}」</span>
            <span class="ex-prompt-ic">${DRAWER_ICON.bubble}</span>
          </button>`).join('')}</div>
      </section>
      <section class="ex-drawer-sec">
        <h3 class="ex-drawer-sec-title">${DRAWER_ICON.more}<span>更多</span></h3>
        <button class="ex-drawer-idbox" type="button" data-copy-id title="点击复制专家 ID">
          <span>ID: ${entry.id}</span>
        </button>
      </section>
    </aside>`

  drawerReturnFocus = document.activeElement
  document.body.appendChild(mask)
  drawerMask = mask
  document.addEventListener('keydown', onDrawerKeydown)
  mask.querySelector('[data-drawer-close]')?.focus?.()

  mask.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-drawer-close]') || ev.target === mask) {
      closeExpertDrawer()
      return
    }
    if (ev.target.closest('[data-summon]')) {
      summonExpert(entry)
      return
    }
    const promptBtn = ev.target.closest('[data-prompt]')
    if (promptBtn) {
      summonExpert(entry, promptBtn.dataset.prompt)
      return
    }
    if (ev.target.closest('[data-copy-id]')) copyExpertId(entry)
  })
}

/* ---------- 首屏 ---------- */

renderCategories()
renderChips()
renderGrid()
