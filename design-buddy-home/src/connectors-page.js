/* ============================================================
   连接器页：把截图式目录做成真实页面（左侧沿用首页窄栏 rail）
   - 顶部 专家 / 技能 / 连接器：前两者是页面链接
   - 搜索连接器 + 「自定义连接器」（真实创建并持久化）
   - 40 个连接器 5 列卡片：右上角 + 连接 / 断开，状态写回 store
   - 点卡片打开「连接测试」：真实跑引擎、实测耗时、返回字段、
     示例响应、错误码、可下载产物 —— 不是只切一个开关
   ============================================================ */

import './rail-flyout.js'
import { requireAuth } from './auth.js'
requireAuth()
import './connectors.css'
import { store, toast, uid, openModal, downloadFile } from './core.js'
import { initGlobalUI } from './global-ui.js'
import { CONNECTOR_CATALOG, CONNECTOR_ICONS } from './connectors-catalog.js'
import { testConnector, connectorLabel, connectorSample, connectorKind } from './connector-runtime.js'
import { resultHTML } from './expert-runtime.js'

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

const cardOf = (name) => allCards().find((c) => c.name === name) ?? entryOf(name)

/* ---------- 渲染 ---------- */

const cardHtml = (c) => {
  const connected = isConnected(c.name)
  return `
    <div class="cn-card${connected ? ' is-connected' : ''}" role="button" tabindex="0"
      data-cn="${c.id}" data-cn-name="${c.name}" aria-pressed="${connected}"
      title="点卡片打开连接测试，点右上角 + 连接">
      <span class="cn-logo" style="--c:${c.color}">${icon(c.shape)}</span>
      <span class="cn-text">
        <span class="cn-name">${c.name}</span>
        <span class="cn-desc">${c.desc}</span>
      </span>
      <button class="cn-plus${connected ? ' is-connected' : ''}" type="button" data-cn-toggle="${c.name}"
        aria-label="${connected ? '断开' : '连接'} ${c.name}" aria-pressed="${connected}">${connected ? '✓' : '+'}</button>
    </div>`
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
  } else {
    const catalog = CONNECTOR_CATALOG.find((c) => c.name === name)
    store.state.connectors.push({
      id: uid('cn'), name, connected: true,
      desc: catalog?.desc, color: catalog?.color, shape: catalog?.shape, category: catalog?.category,
    })
  }
  store.save()
  renderGrid()
  const now = isConnected(name)
  toast(`${name} 已${now ? '连接' : '断开'}`)
  if (panelName === name) syncPanelState()
  return now
}

/* ---------- 连接测试面板 ---------- */

const panel = $('#cn-test')
let panelName = ''
let panelArtifacts = []
let panelText = ''

const statePill = (name) => {
  const connected = isConnected(name)
  return `<span class="cn-state ${connected ? 'is-on' : ''}">${connected ? '已连接' : '未连接'}</span>
    <button class="cn-state-btn" type="button" data-cn-panel-toggle="${name}">${connected ? '断开' : '连接'}</button>`
}

const syncPanelState = () => {
  const slot = panel.querySelector('#cn-test-state')
  if (slot) slot.innerHTML = statePill(panelName)
}

const openPanel = (name) => {
  const entry = cardOf(name)
  if (!entry) return
  panelName = name
  panelArtifacts = []
  panelText = ''
  const kind = connectorKind(entry)
  const [label] = connectorLabel(entry)
  const sample = connectorSample(entry)
  panel.hidden = false
  panel.innerHTML = `
    <div class="cn-test-head">
      <span class="cn-logo" style="--c:${entry.color}">${icon(entry.shape)}</span>
      <div class="cn-test-ident">
        <h3>${entry.name}<span class="cn-test-tag">${kind}</span></h3>
        <p>${entry.desc}</p>
      </div>
      <div class="cn-test-state" id="cn-test-state">${statePill(entry.name)}</div>
      <button class="cn-test-close" type="button" data-cn-test-close aria-label="收起连接测试">×</button>
    </div>
    <div class="cn-test-tools">
      <span class="cn-test-cap">能力：${label}</span>
      <span class="cn-test-hint">本地演示模式下跑的是同口径引擎；远端 API 需你填凭据后才会真正出网</span>
    </div>
    <textarea class="cn-test-input" id="cn-test-input" rows="3" aria-label="测试输入">${sample}</textarea>
    <div class="cn-test-actions">
      <button class="cn-run-btn" type="button" data-cn-test-run>运行连接测试</button>
      <button class="cn-run-ghost" type="button" data-cn-test-fill>填入示例</button>
      <span class="cn-test-hint">真实执行 · 计时 · 可下载</span>
    </div>
    <div class="cn-test-out" id="cn-test-out" hidden></div>`
  panel.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
}

const runTest = () => {
  const entry = cardOf(panelName)
  const out = panel.querySelector('#cn-test-out')
  const input = panel.querySelector('#cn-test-input')
  if (!entry || !out) return
  const raw = input?.value.trim() ?? ''
  if (!raw) {
    out.hidden = false
    out.innerHTML = '<p class="cn-run-empty">先写一句要处理的内容（或点「填入示例」）。</p>'
    return
  }
  out.hidden = false
  out.innerHTML = '<div class="xr-running"><span></span>正在握手并执行…</div>'
  setTimeout(() => {
    // 测试面板显示的必须是「你给的内容」跑出来的结果
    const t = testConnector(entry, raw)
    panelArtifacts = t.result.artifacts ?? []
    panelText = JSON.stringify(t.payload, null, 2)
    const status = t.payload.status
    out.innerHTML = `
      <div class="cn-test-summary">
        <span class="cn-req ${status === 200 ? 'is-ok' : 'is-bad'}">${status === 200 ? '连接正常' : '连接异常'}</span>
        <span class="cn-meta">平均耗时 <b>${t.latency} ms</b></span>
        <span class="cn-meta">返回字段 <b>${t.fields}</b></span>
        <span class="cn-meta">产物 <b>${t.result.artifacts?.length ?? 0}</b></span>
        <span class="cn-meta">错误码 <b>${t.error.code}</b>${t.error.triggered ? '（已触发并捕获）' : ''}</span>
      </div>
      <section class="xr-block"><h4>检查项</h4>
        <div class="xr-table-wrap"><table class="xr-table">
          <thead><tr><th>检查项</th><th>结果</th><th>说明</th></tr></thead>
          <tbody>${t.checks.map((c) => `<tr><td>${c.name}</td><td>${c.ok ? (c.warn ? '待填' : '通过') : '失败'}</td><td>${c.detail}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>
      <section class="xr-block"><h4>示例响应（本次实测）</h4><pre class="xr-code"><code>${JSON.stringify(t.payload, null, 2)}</code></pre></section>
      <section class="xr-block"><h4>错误码</h4>
        <div class="xr-table-wrap"><table class="xr-table">
          <thead><tr><th>码</th><th>含义</th><th>触发条件</th><th>本次</th></tr></thead>
          <tbody>${t.errors.map((e) => `<tr><td>${e.code}</td><td>${e.name}</td><td>${e.meaning}</td><td>${e.hit ? '是' : '—'}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>
      <section class="cn-test-data"><h4>引擎真实返回</h4>${resultHTML(t.result)}</section>
      <div class="cn-test-out-actions">
        ${panelArtifacts.map((a, i) => `<button class="xr-act" type="button" data-cn-download="${i}">下载 ${a.name}</button>`).join('')}
        <button class="xr-act" type="button" data-cn-copy>复制响应</button>
        <button class="xr-act ghost" type="button" data-cn-clear>收起结果</button>
      </div>`
  }, 240)
}

/* ---------- 面板事件 ---------- */

panel.addEventListener('click', (ev) => {
  const el = ev.target
  if (el.closest('[data-cn-test-close]')) {
    panel.hidden = true
    panel.innerHTML = ''
    panelName = ''
    return
  }
  const toggleBtn = el.closest('[data-cn-panel-toggle]')
  if (toggleBtn) {
    toggle(toggleBtn.dataset.cnPanelToggle)
    return
  }
  if (el.closest('[data-cn-test-fill]')) {
    const input = panel.querySelector('#cn-test-input')
    if (input) input.value = connectorSample(cardOf(panelName))
    return
  }
  if (el.closest('[data-cn-test-run]')) {
    runTest()
    return
  }
  const dl = el.closest('[data-cn-download]')
  if (dl) {
    const art = panelArtifacts[Number(dl.dataset.cnDownload)]
    if (art) {
      downloadFile(art.name, art.content, art.mime ?? 'text/plain')
      toast(`已下载 ${art.name}`)
    }
    return
  }
  if (el.closest('[data-cn-copy]')) {
    navigator.clipboard?.writeText(panelText).then(
      () => toast('响应已复制'),
      () => toast('复制失败，请手动选中'),
    )
    return
  }
  if (el.closest('[data-cn-clear]')) {
    const out = panel.querySelector('#cn-test-out')
    if (out) {
      out.hidden = true
      out.innerHTML = ''
    }
  }
})

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
  const toggleBtn = ev.target.closest('[data-cn-toggle]')
  if (toggleBtn) {
    toggle(toggleBtn.dataset.cnToggle)
    return
  }
  const card = ev.target.closest('[data-cn-name]')
  if (card) openPanel(card.dataset.cnName)
})

$('#cn-grid').addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return
  const card = ev.target.closest('.cn-card')
  if (!card || ev.target.closest('[data-cn-toggle]')) return
  ev.preventDefault()
  openPanel(card.dataset.cnName)
})

/* ---------- 首屏 ---------- */

renderGrid()
