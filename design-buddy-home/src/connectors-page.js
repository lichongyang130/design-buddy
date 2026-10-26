/* ============================================================
   连接器页：把截图式目录做成真实页面（左侧沿用首页窄栏 rail）
   - 顶部 专家 / 技能 / 连接器：前两者是页面链接
   - 搜索连接器 + 「自定义连接器」（真实创建并持久化）
   - 40 个连接器 5 列卡片，点 + 连接 / 再点断开，状态写回 store
   ============================================================ */

import './rail-flyout.js'
import { requireAuth } from './auth.js'
requireAuth()
import './connectors.css'
import { store, toast, uid, openModal } from './core.js'
import { initGlobalUI } from './global-ui.js'
import { CONNECTOR_CATALOG, CONNECTOR_ICONS } from './connectors-catalog.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)

const icon = (shape) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${CONNECTOR_ICONS[shape] ?? CONNECTOR_ICONS.sparkle}</svg>`

const entryOf = (name) => store.state.connectors.find((c) => c.name === name)
const isConnected = (name) => !!entryOf(name)?.connected

// 目录之外、但在 store 里已连接的连接器（含用户自定义 / 旧版本数据）也照常显示
const extraCards = () => store.state.connectors
  .filter((c) => c.connected && !CONNECTOR_CATALOG.some((k) => k.name === c.name))
  .map((c) => ({
    id: c.id, name: c.name, desc: c.desc || '自定义连接器', color: c.color || '#5b6ef5',
    shape: c.shape || 'sparkle', category: c.category || '自定义', custom: true,
  }))

// 目录顺序优先（与截图一致），目录外的历史/自定义连接器排在末尾
const allCards = () => [...CONNECTOR_CATALOG, ...extraCards()]

/* ---------- 渲染 ---------- */

const cardHtml = (c) => {
  const connected = isConnected(c.name)
  return `
    <button class="cn-card${connected ? ' is-connected' : ''}" type="button" data-cn="${c.id}"
      data-cn-name="${c.name}" aria-pressed="${connected}" title="${connected ? '点击断开' : '点击连接'}">
      <span class="cn-logo" style="--c:${c.color}">${icon(c.shape)}</span>
      <span class="cn-text">
        <span class="cn-name">${c.name}</span>
        <span class="cn-desc">${c.desc}</span>
      </span>
      <span class="cn-plus${connected ? ' is-connected' : ''}" aria-hidden="true">${connected ? '✓' : '+'}</span>
    </button>`
}

const renderGrid = () => {
  const q = $('#cn-search-input').value.trim().toLowerCase()
  const list = allCards().filter((c) => !q
    || [c.name, c.desc, c.category].join(' ').toLowerCase().includes(q))
  $('#cn-grid').innerHTML = list.length
    ? list.map(cardHtml).join('')
    : '<p class="cn-empty">没有匹配的连接器，换个关键词试试，或点右上角「自定义连接器」接入。</p>'
}

/* ---------- 连接 / 断开 ---------- */

const toggle = (name) => {
  const entry = entryOf(name)
  if (entry) {
    entry.connected = !entry.connected
    toast(`${name} 已${entry.connected ? '连接' : '断开'}`)
  } else {
    const catalog = CONNECTOR_CATALOG.find((c) => c.name === name)
    store.state.connectors.push({
      id: uid('cn'), name, connected: true,
      desc: catalog?.desc, color: catalog?.color, shape: catalog?.shape, category: catalog?.category,
    })
    toast(`${name} 已连接`)
  }
  store.save()
  renderGrid()
}

/* ---------- 自定义连接器 ---------- */

const openCustom = () => {
  const { mask, bodyEl, footEl } = openModal({
    title: '自定义连接器',
    body: `
      <p class="modal-copy">接入自建服务或尚未收录的连接器，创建后会出现在列表中并保持已连接状态。</p>
      <label class="cn-field">
        <span>名称</span>
        <input id="cn-custom-name" type="text" placeholder="例如：内部知识库 MCP" maxlength="40" />
      </label>
      <label class="cn-field">
        <span>说明</span>
        <input id="cn-custom-desc" type="text" placeholder="一句话说明它提供什么能力" maxlength="80" />
      </label>`,
    footer: `
      <button class="btn btn-ghost" data-act="cancel" type="button">取消</button>
      <button class="btn btn-primary" data-act="save" type="button">创建并连接</button>`,
  })

  const submit = () => {
    const name = mask.querySelector('#cn-custom-name').value.trim()
    const desc = mask.querySelector('#cn-custom-desc').value.trim()
    if (!name) { toast('请先填写连接器名称'); return }
    if (entryOf(name)) { toast(`「${name}」已在列表中`); return }
    store.state.connectors.push({
      id: uid('cn'), name, connected: true,
      desc: desc || '自定义连接器', color: '#5b6ef5', shape: 'sparkle', category: '自定义',
    })
    store.save()
    mask.remove()
    toast(`已创建并连接「${name}」`)
    renderGrid()
  }

  footEl.addEventListener('click', (ev) => {
    const act = ev.target.closest('[data-act]')?.dataset.act
    if (act === 'cancel') mask.remove()
    if (act === 'save') submit()
  })
  bodyEl.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') submit()
  })
}

/* ---------- 事件 ---------- */

$('#cn-search-input').addEventListener('input', renderGrid)

$('[data-custom]').addEventListener('click', openCustom)

$('#cn-grid').addEventListener('click', (ev) => {
  const card = ev.target.closest('[data-cn-name]')
  if (!card) return
  toggle(card.dataset.cnName)
})

/* ---------- 首屏 ---------- */

renderGrid()
