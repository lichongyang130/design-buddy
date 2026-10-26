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
import {
  testConnector, connectorLabel, connectorSample, connectorKind,
  handshake, validateCredential, issueCredential, pushConnectorLog, AUTH_METHODS,
} from './connector-runtime.js'
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
const allCards = () => {
  const mcpServers = (store.state.mcpServers ?? []).map((s) => ({
    id: s.id, name: s.label, desc: s.serverInfo?.name ? `${s.serverInfo.name} · ${s.toolCount} 个工具` : '远端 MCP 服务',
    color: '#3b82f6', shape: 'globe', category: '远端 MCP', remote: true,
  }))
  return [...CONNECTOR_CATALOG, ...extraCards(), ...mcpServers]
}

const cardOf = (name) => allCards().find((c) => c.name === name) ?? entryOf(name)

/* ---------- 渲染 ---------- */

const cardHtml = (c) => {
  const entry = entryOf(c.name)
  const connected = !!entry?.connected
  const check = entry?.lastCheck
  const mcpServer = (store.state.mcpServers ?? []).find((s) => s.label === c.name)
  const isRemote = !!mcpServer
  const meta = connected && check
    ? `<span class="cn-verified">已握手 · ${check.ok ? `${check.latency} ms` : '失败'}</span>`
    : isRemote
      ? `<span class="cn-verified">已连 · ${mcpServer.toolCount} 个工具</span>`
      : ''
  return `
    <div class="cn-card${connected || isRemote ? ' is-connected' : ''}" role="button" tabindex="0"
      data-cn="${c.id}" data-cn-name="${c.name}" aria-pressed="${connected || isRemote}"
      title="点卡片打开连接测试，点右上角 + 连接">
      <span class="cn-logo" style="--c:${c.color}">${icon(c.shape)}</span>
      <span class="cn-text">
        <span class="cn-name">${c.name}</span>
        <span class="cn-desc">${c.desc}</span>
        ${meta}
      </span>
      ${isRemote ? '<button class="cn-plus is-connected" type="button" data-mcp-delete="' + mcpServer.id + '" aria-label="删除" aria-pressed="true">✓</button>' :
        `<button class="cn-plus${connected ? ' is-connected' : ''}" type="button" data-cn-toggle="${c.name}"
        aria-label="${connected ? '断开' : '连接'} ${c.name}" aria-pressed="${connected}">${connected ? '✓' : '+'}</button>`}
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

/**
 * 连接 / 断开
 * 连接不是换个布尔值：先用本地引擎真跑一次握手，
 * 成功才写入 connected + 凭据指纹 + 握手结果，并记一条调用记录。
 */
const toggle = (name, { authMethod = 'local' } = {}) => {
  const catalog = CONNECTOR_CATALOG.find((c) => c.name === name)
  const existing = entryOf(name)

  if (existing?.connected) {
    existing.connected = false
    existing.disconnectedAt = Date.now()
    existing.lastCheck = null
    store.save()
    pushConnectorLog(store, { connector: name, action: 'disconnect', ok: true, detail: '用户主动断开，已清除握手结果' })
    renderGrid()
    toast(`${name} 已断开`)
    if (panelName === name) { openPanel(name) }
    return false
  }

  const target = existing ?? {
    id: uid('cn'), name,
    desc: catalog?.desc, color: catalog?.color, shape: catalog?.shape, category: catalog?.category,
  }
  // 用户已经填过凭据就沿用它（重连不能把 token 换成随机串）；只有本地引擎才自动签发
  const method = existing?.authMethod ?? authMethod
  const kept = existing?.credential
  if (method !== 'local' && !kept) {
    const reason = '还没有凭据：请先点「填写凭据」校验 token / 端点'
    pushConnectorLog(store, { connector: name, action: 'connect', ok: false, latency: 0, detail: reason })
    toast(`${name} 未连接 · ${reason}`)
    renderGrid()
    return false
  }
  const hs = handshake({ ...target, desc: target.desc ?? catalog?.desc })
  if (!hs.ok) {
    pushConnectorLog(store, { connector: name, action: 'connect', ok: false, latency: hs.latency, detail: hs.error })
    toast(`${name} 握手失败：${hs.error}`)
    renderGrid()
    return false
  }

  const cred = kept ?? issueCredential(method)
  Object.assign(target, {
    connected: true,
    connectedAt: Date.now(),
    authMethod: method,
    authLabel: AUTH_METHODS[method]?.label ?? method,
    credential: { masked: cred.masked, fingerprint: cred.fingerprint, issuedAt: cred.issuedAt },
    lastCheck: {
      ok: true, at: hs.at, latency: hs.latency, fields: hs.fields, artifacts: hs.artifacts, digest: hs.digest,
      transport: method === 'local' ? 'local' : 'local-fallback',
    },
  })
  if (!existing) store.state.connectors.push(target)
  store.save()
  pushConnectorLog(store, {
    connector: name, action: 'connect', ok: true, latency: hs.latency,
    artifacts: hs.artifacts,
    detail: `${AUTH_METHODS[method]?.label ?? method} · 传输 本地引擎 · 指纹 ${cred.fingerprint} · ${hs.fields} 个字段`,
  })
  renderGrid()
  toast(`${name} 已连接 · 握手 ${hs.latency} ms · ${hs.artifacts.length} 个产物`)
  if (panelName === name) openPanel(name)
  return true
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
  const mcpServer = (store.state.mcpServers ?? []).find((s) => s.label === name)
  const isRemote = !!mcpServer

  if (isRemote) {
    openRemotePanel(mcpServer)
    return
  }

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

    ${connectionCard(entry)}
    <textarea class="cn-test-input" id="cn-test-input" rows="3" aria-label="测试输入">${sample}</textarea>
    <div class="cn-test-actions">
      <button class="cn-run-btn" type="button" data-cn-test-run>运行连接测试</button>
      <button class="cn-run-ghost" type="button" data-cn-test-fill>填入示例</button>
      <span class="cn-test-hint">真实执行 · 计时 · 可下载</span>
    </div>
    <div class="cn-test-out" id="cn-test-out" hidden></div>`
  panel.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
}

const openRemotePanel = (server) => {
  panel.hidden = false
  panel.innerHTML = `
    <div class="cn-test-head">
      <span class="cn-logo" style="--c:#3b82f6">${icon('globe')}</span>
      <div class="cn-test-ident">
        <h3>${server.label}<span class="cn-test-tag">远端 MCP</span></h3>
        <p>${server.serverInfo?.name ?? '远端 MCP 服务'}</p>
      </div>
      <div class="cn-test-state">
        <span class="cn-state is-on">已连接</span>
        <button class="cn-state-btn" type="button" data-cn-delete="${server.id}">删除</button>
      </div>
      <button class="cn-test-close" type="button" data-cn-test-close aria-label="收起连接测试">×</button>
    </div>

    <div class="cn-conn">
      <div class="cn-conn-row">
        <span class="cn-conn-k">协议版本</span>
        <span class="cn-conn-v mono">${server.protocol.version}</span>
      </div>
      <div class="cn-conn-row">
        <span class="cn-conn-k">传输</span>
        <span class="cn-conn-v">远端 · ${server.url}</span>
      </div>
      <div class="cn-conn-row">
        <span class="cn-conn-k">服务信息</span>
        <span class="cn-conn-v">${server.serverInfo?.name ?? '—'} ${server.serverInfo?.version ?? ''}</span>
      </div>
      ${server.instructions ? `<div class="cn-conn-row">
        <span class="cn-conn-k">说明</span>
        <span class="cn-conn-v">${server.instructions}</span>
      </div>` : ''}
      <div class="cn-conn-row">
        <span class="cn-conn-k">最近握手</span>
        <span class="cn-conn-v">${fmtTime(server.lastHandshake?.at)} · ${server.lastHandshake?.ms ?? '—'} ms</span>
      </div>
    </div>

    <div class="cn-tools">
      <h4>工具列表 (${server.tools?.length ?? 0})</h4>
      <div class="cn-tool-list">
        ${(server.tools ?? []).map((t, i) => `
          <div class="cn-tool" data-tool-index="${i}">
            <div class="cn-tool-name">${t.name}</div>
            <div class="cn-tool-desc">${t.description ?? ''}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="cn-tool-form" id="cn-tool-form" hidden></div>
    <div class="cn-tool-result" id="cn-tool-result" hidden></div>`
  panel.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
}

const fmtTime = (ts) => (ts ? new Date(ts).toLocaleString('zh-CN', { hour12: false }) : '—')

/** 连接详情：认证方式、凭据指纹、连接时间、最近一次真实握手 */
const connectionCard = (entry) => {
  const live = entryOf(entry.name)
  const connected = !!live?.connected
  const check = live?.lastCheck
  const cred = live?.credential
  return `
    <div class="cn-conn">
      <div class="cn-conn-row">
        <span class="cn-conn-k">能力</span><span class="cn-conn-v">${connectorLabel(entry)[0]}</span>
      </div>
      <div class="cn-conn-row">
        <span class="cn-conn-k">认证方式</span>
        <span class="cn-conn-v">${connected ? (live.authLabel ?? AUTH_METHODS[live.authMethod]?.label ?? '本地引擎') : '未连接'}</span>
      </div>
      <div class="cn-conn-row">
        <span class="cn-conn-k">传输</span>
        <span class="cn-conn-v">${connected
          ? (check?.transport === 'local-fallback'
            ? '本地引擎（凭据仅做格式校验，尚未出网）'
            : '本地引擎（真实执行）')
          : '—'}</span>
      </div>
      <div class="cn-conn-row">
        <span class="cn-conn-k">凭据指纹</span>
        <span class="cn-conn-v mono">${cred ? `${cred.masked} · ${cred.fingerprint}` : '—'}</span>
      </div>
      <div class="cn-conn-row">
        <span class="cn-conn-k">连接时间</span><span class="cn-conn-v">${connected ? fmtTime(live.connectedAt) : '—'}</span>
      </div>
      <div class="cn-conn-row">
        <span class="cn-conn-k">最近握手</span>
        <span class="cn-conn-v">${check ? `${fmtTime(check.at)} · ${check.latency} ms · ${check.artifacts?.length ?? 0} 个产物 · #${check.digest}` : '—'}</span>
      </div>
      <div class="cn-conn-actions">
        <button class="cn-run-ghost" type="button" data-cn-cred>${connected ? '更换凭据' : '填写凭据'}</button>
        <button class="cn-run-ghost" type="button" data-cn-rehandshake ${connected ? '' : 'disabled'}>重新握手</button>
        <span class="cn-test-hint">本地引擎真实执行 · 远端服务未接入 · 凭据只做格式校验</span>
      </div>
    </div>`
}

/** 填写凭据：真校验格式，只保存掩码与指纹 */
const openCredential = (name) => {
  const entry = cardOf(name)
  const live = entryOf(name)
  const { mask, bodyEl, footEl } = openModal({
    title: `${entry.name} · 凭据`,
    body: `
      <p class="modal-copy">凭据只用于本地校验：通过后只保存<b>掩码与指纹</b>，原文不落库、不上传。</p>
      <label class="cn-field"><span>认证方式</span>
        <select id="cn-cred-method">
          ${Object.entries(AUTH_METHODS).map(([k, v]) => `<option value="${k}"${(live?.authMethod ?? 'local') === k ? ' selected' : ''}>${v.label}</option>`).join('')}
        </select>
      </label>
      <label class="cn-field" id="cn-cred-field"><span>凭据内容</span>
        <input id="cn-cred-value" type="text" autocomplete="off" spellcheck="false" placeholder="token / https://… / 授权码" />
      </label>
      <p class="cn-creds-hint" id="cn-cred-hint">${AUTH_METHODS[live?.authMethod ?? 'local'].hint}</p>`,
    footer: '<button class="btn btn-ghost" data-act="cancel" type="button">取消</button><button class="btn btn-primary" data-act="save" type="button">校验并保存</button>',
  })
  const methodEl = mask.querySelector('#cn-cred-method')
  const valueEl = mask.querySelector('#cn-cred-value')
  const hintEl = mask.querySelector('#cn-cred-hint')
  const fieldEl = mask.querySelector('#cn-cred-field')
  // 本地引擎不需要凭据：选它就把输入框收起来，不逼用户填无意义的内容
  const syncMethod = () => {
    const local = methodEl.value === 'local'
    fieldEl.hidden = local
    if (!local && !valueEl.value) valueEl.value = ''
    hintEl.classList.remove('is-bad')
    hintEl.textContent = AUTH_METHODS[methodEl.value].hint
  }
  syncMethod()
  methodEl.addEventListener('change', syncMethod)

  const submit = () => {
    const method = methodEl.value
    const verdict = validateCredential(method, valueEl.value)
    if (!verdict.ok) {
      hintEl.textContent = verdict.reason
      hintEl.classList.add('is-bad')
      toast(verdict.reason)
      return
    }
    let target = entryOf(name)
    if (!target) {
      target = { id: uid('cn'), name, connected: false, desc: entry.desc, color: entry.color, shape: entry.shape, category: entry.category }
      store.state.connectors.push(target)
    }
    target.authMethod = method
    target.authLabel = AUTH_METHODS[method].label
    target.credential = { masked: verdict.masked, fingerprint: verdict.fingerprint, issuedAt: verdict.issuedAt }
    pushConnectorLog(store, { connector: name, action: 'authorize', ok: true, detail: `${AUTH_METHODS[method].label} · 指纹 ${verdict.fingerprint} · 原文不落库` })
    // 已连接时换凭据：立刻用新凭据重跑一次握手，握手不过就不留旧的成功记录
    let hsNote = ''
    if (target.connected) {
      const hs = handshake(target)
      const transport = method === 'local' ? 'local' : 'local-fallback'
      target.lastCheck = hs.ok
        ? { ok: true, at: hs.at, latency: hs.latency, fields: hs.fields, artifacts: hs.artifacts, digest: hs.digest, transport }
        : { ok: false, at: Date.now(), latency: hs.latency, fields: 0, artifacts: [], digest: 'failed', transport }
      hsNote = hs.ok ? ` · 新凭据握手 ${hs.latency} ms` : ` · 新凭据握手失败：${hs.error}`
      if (!hs.ok) {
        target.connected = false
        target.disconnectedAt = Date.now()
      }
    }
    store.save()
    mask.remove()
    toast(`${entry.name} 凭据已校验通过（指纹 ${verdict.fingerprint}）${hsNote}`)
    if (target.connected) pushConnectorLog(store, {
      connector: name, action: 'handshake', ok: target.lastCheck.ok, latency: target.lastCheck.latency,
      artifacts: target.lastCheck.artifacts, detail: `更换凭据后重跑 · 指纹 ${verdict.fingerprint}`,
    })
    if (panelName === name) openPanel(name)
    renderGrid()
  }
  footEl.addEventListener('click', (ev) => {
    const act = ev.target.closest('[data-act]')?.dataset.act
    if (act === 'cancel') mask.remove()
    if (act === 'save') submit()
  })
  bodyEl.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') submit() })
}

/** 重新握手：真跑一次能力，刷新 lastCheck 与调用记录 */
const rehandshake = (name) => {
  const live = entryOf(name)
  if (!live?.connected) { toast('先连接再握手'); return }
  const hs = handshake(live)
  live.lastCheck = hs.ok
    ? { ok: true, at: hs.at, latency: hs.latency, fields: hs.fields, artifacts: hs.artifacts, digest: hs.digest, transport: live.lastCheck?.transport ?? 'local' }
    : { ok: false, at: Date.now(), latency: hs.latency, fields: 0, artifacts: [], digest: 'failed', transport: live.lastCheck?.transport ?? 'local' }
  store.save()
  pushConnectorLog(store, {
    connector: name, action: 'handshake', ok: hs.ok, latency: hs.latency,
    artifacts: hs.artifacts, detail: hs.ok ? `${hs.fields} 个字段 · #${hs.digest}` : hs.error,
  })
  toast(hs.ok ? `${name} 握手成功 · ${hs.latency} ms` : `${name} 握手失败：${hs.error}`)
  renderGrid()
  if (panelName === name) openPanel(name)
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
    pushConnectorLog(store, {
      connector: panelName, action: 'run', ok: status === 200, latency: t.latency,
      artifacts: panelArtifacts.map((a) => a.name),
      detail: `${t.fields} 个字段 · 错误码 ${t.error.code}${t.error.triggered ? '（已触发并捕获）' : ''}`,
    })
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
  if (el.closest('[data-cn-cred]')) {
    openCredential(panelName)
    return
  }
  if (el.closest('[data-cn-rehandshake]')) {
    rehandshake(panelName)
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
      <p class="modal-copy">接入尚未收录的服务：创建后会立即用本地引擎跑一次握手，握手成功才算连接。</p>
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
      id: uid('cn'), name, connected: false,
      desc: desc || '自定义连接器', color: '#5b6ef5', shape: 'sparkle', category: '自定义',
    })
    store.save()
    mask.remove()
    // 创建不等于连上：和内置连接器走同一条握手路径，失败就保持未连接
    toggle(name)
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

/* ---------- 调用记录（真实审计） ---------- */

const openLog = () => {
  const logs = store.state.connectorLogs ?? []
  const rows = logs.slice(0, 80).map((l) => `
    <tr>
      <td>${new Date(l.at).toLocaleString('zh-CN', { hour12: false })}</td>
      <td>${l.connector}</td>
      <td>${({ connect: '连接', disconnect: '断开', authorize: '授权', handshake: '握手', run: '运行' })[l.action] ?? l.action}</td>
      <td>${l.ok ? '成功' : '失败'}</td>
      <td>${Number.isFinite(l.latency) ? `${l.latency} ms` : '—'}</td>
      <td>${[l.detail, ...(l.artifacts ?? [])].filter(Boolean).join(' · ') || '—'}</td>
    </tr>`).join('')
  const { mask, bodyEl, footEl } = openModal({
    title: '连接器调用记录',
    wide: true,
    body: logs.length
      ? `<p class="modal-copy">最近 ${Math.min(logs.length, 80)} 条：每次连接 / 断开 / 授权 / 握手 / 运行都由本地引擎真实执行并记录。</p>
         <div class="xr-table-wrap"><table class="xr-table">
           <thead><tr><th>时间</th><th>连接器</th><th>动作</th><th>结果</th><th>耗时</th><th>详情 / 产物</th></tr></thead>
           <tbody>${rows}</tbody>
         </table></div>`
      : '<p class="modal-copy">还没有调用记录。点任意连接器的 + 连接，或打开卡片跑一次连接测试，这里就会出现真实记录。</p>',
    footer: `<button class="btn btn-ghost" data-log-clear type="button">清空记录</button>
      <button class="btn btn-ghost" data-log-export type="button">导出 JSON</button>
      <button class="btn btn-primary" data-log-close type="button">关闭</button>`,
  })
  footEl.addEventListener('click', (ev) => {
    if (ev.target.closest('[data-log-close]')) mask.remove()
    if (ev.target.closest('[data-log-export]')) {
      downloadFile('connector-logs.json', JSON.stringify(store.state.connectorLogs ?? [], null, 2), 'application/json')
      toast('已导出 connector-logs.json')
    }
    if (ev.target.closest('[data-log-clear]')) {
      store.state.connectorLogs = []
      store.save()
      mask.remove()
      toast('调用记录已清空')
    }
  })
}

/* ---------- MCP 远端服务接入 ---------- */

const mcpModal = async () => {
  const { mask, bodyEl, footEl } = openModal({
    title: '接入 MCP 服务',
    body: `
      <p class="modal-copy">接入真实的 MCP 协议服务（远端工具服务器）。会立即握手验证，成功后才保存。</p>
      <label class="cn-field"><span>名称</span>
        <input id="mcp-label" type="text" placeholder="例如：内部知识库" maxlength="40" />
      </label>
      <label class="cn-field"><span>MCP 地址</span>
        <input id="mcp-url" type="url" placeholder="https://mcp.example.com/mcp" />
      </label>
      <label class="cn-field"><span>认证方式</span>
        <select id="mcp-auth-mode">
          <option value="none">无需认证</option>
          <option value="bearer">Bearer Token</option>
          <option value="header">自定义 Header</option>
        </select>
      </label>
      <label class="cn-field" id="mcp-token-field" hidden><span>Token</span>
        <input id="mcp-token" type="password" placeholder="sk-..." autocomplete="off" />
      </label>
      <label class="cn-field" id="mcp-header-field" hidden><span>Header 名称</span>
        <input id="mcp-header-name" type="text" placeholder="X-Api-Key" />
      </label>
      <label class="cn-check">
        <input id="mcp-allow-private" type="checkbox" />
        <span>信任内网地址（本地部署 / VPN / 127.0.0.1）</span>
      </label>`,
    footer: `<button class="btn btn-ghost" data-act="cancel" type="button">取消</button>
             <button class="btn btn-primary" data-act="save" type="button">测试并保存</button>`,
  })

  const authSelect = mask.querySelector('#mcp-auth-mode')
  const tokenField = mask.querySelector('#mcp-token-field')
  const headerField = mask.querySelector('#mcp-header-field')

  const syncAuth = () => {
    const mode = authSelect.value
    tokenField.hidden = mode !== 'bearer'
    headerField.hidden = mode !== 'header'
  }
  syncAuth()
  authSelect.addEventListener('change', syncAuth)

  const submit = async () => {
    const label = mask.querySelector('#mcp-label').value.trim()
    const url = mask.querySelector('#mcp-url').value.trim()
    const authMode = authSelect.value
    const allowPrivate = mask.querySelector('#mcp-allow-private').checked

    if (!label) { 
      const hint = mask.querySelector('#mcp-hint') || (() => {
        const h = document.createElement('p')
        h.id = 'mcp-hint'
        h.className = 'cn-creds-hint is-bad'
        h.textContent = '请填写名称'
        mask.querySelector('.modal-body').prepend(h)
        return h
      })()
      hint.textContent = '请填写名称'
      hint.classList.add('is-bad')
      toast('请填写名称')
      return 
    }
    if (!url) { 
      const hint = mask.querySelector('#mcp-hint')
      if (hint) { hint.textContent = '请填写 MCP 地址'; hint.classList.add('is-bad') }
      toast('请填写 MCP 地址')
      return 
    }

    let auth = { mode: authMode }
    if (authMode === 'bearer') {
      const token = mask.querySelector('#mcp-token').value.trim()
      if (!token) { 
        const hint = mask.querySelector('#mcp-hint')
        if (hint) { hint.textContent = '请填写 Token'; hint.classList.add('is-bad') }
        toast('请填写 Token')
        return 
      }
      auth.token = token
    } else if (authMode === 'header') {
      const headerName = mask.querySelector('#mcp-header-name').value.trim()
      const token = mask.querySelector('#mcp-token').value.trim()
      if (!headerName || !token) { 
        const hint = mask.querySelector('#mcp-hint')
        if (hint) { hint.textContent = '请填写 Header 名称和 Token'; hint.classList.add('is-bad') }
        toast('请填写 Header 名称和 Token')
        return 
      }
      auth.headerName = headerName
      auth.token = token
    }

    // 校验 URL 格式
    try {
      new URL(url)
    } catch {
      const hint = mask.querySelector('#mcp-hint')
      if (hint) { hint.textContent = 'MCP 地址格式不正确'; hint.classList.add('is-bad') }
      toast('MCP 地址格式不正确')
      return
    }

    const submitBtn = footEl.querySelector('[data-act="save"]')
    submitBtn.disabled = true
    submitBtn.textContent = '握手中…'

    try {
      const apiUrl = new URL('/api/mcp/servers', window.location.origin).href
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-DB-Client': 'design-buddy' },
        body: JSON.stringify({ label, url, auth, allowPrivate, timeoutMs: 10000 }),
      })
      const data = await res.json()
      if (!data.ok) {
        // 翻译错误码为中文
        const errorMessages = {
          'MCP_REFUSED': '连接被拒',
          'MCP_TIMEOUT': '连接超时',
          'MCP_DNS': '无法连接',
          'MCP_NETWORK': '无法连接',
          'MCP_BAD_SCHEME': 'URL 格式错误',
          'MCP_PRIVATE_HOST': '不允许连接内网地址',
          'MCP_AUTH': '认证失败',
          'MCP_UNSUPPORTED': '不支持的协议版本',
        }
        const errorMsg = errorMessages[data.error.code] || data.error.message || '未知错误'
        // 在模态框中显示错误信息
        const hint = mask.querySelector('#mcp-hint') || (() => {
          const h = document.createElement('p')
          h.id = 'mcp-hint'
          h.className = 'cn-creds-hint is-bad'
          mask.querySelector('.modal-body').prepend(h)
          return h
        })()
        hint.textContent = `接入失败：${errorMsg}`
        hint.classList.add('is-bad')
        toast(`接入失败：${errorMsg}`)
        submitBtn.disabled = false
        submitBtn.textContent = '测试并保存'
        return
      }
      // 将远端服务信息写入 store
      store.state.mcpServers = store.state.mcpServers ?? []
      store.state.mcpServers.push({
        id: data.server.id,
        label,
        url,
        protocol: data.server.protocol,
        serverInfo: data.server.serverInfo,
        toolCount: data.server.toolCount,
        tools: data.server.tools,
        instructions: data.server.instructions,
        auth: data.server.auth,
        lastHandshake: data.server.lastHandshake,
        remote: true,
      })
      store.save()
      // 记录握手日志
      pushConnectorLog(store, {
        connector: label, action: 'handshake', ok: true,
        latency: data.server.lastHandshake?.ms,
        detail: `MCP · ${data.server.protocol?.version} · ${data.server.toolCount} 个工具`,
      })
      mask.remove()
      toast(`已接入「${label}」· ${data.server.toolCount} 个工具`)
      renderGrid()
    } catch (err) {
      toast(`接入失败：${err.message}`)
      submitBtn.disabled = false
      submitBtn.textContent = '测试并保存'
    }
  }

  footEl.addEventListener('click', (ev) => {
    const act = ev.target.closest('[data-act]')?.dataset.act
    if (act === 'cancel') mask.remove()
    if (act === 'save') submit()
  })
  bodyEl.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') submit() })
}

/* ---------- 事件 ---------- */

document.querySelector('[data-mcp-add]')?.addEventListener('click', mcpModal)
document.querySelector('[data-cn-logs]')?.addEventListener('click', openLog)

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

// 删除 MCP 服务（带确认）
document.addEventListener('click', (ev) => {
  const deleteBtn = ev.target.closest('[data-cn-delete]')
  if (!deleteBtn) return
  const id = deleteBtn.dataset.cnDelete
  const server = (store.state.mcpServers ?? []).find((s) => s.id === id)
  if (!server) return

  // 显示确认对话框
  const { mask, footEl } = openModal({
    title: '删除 MCP 服务',
    body: `<p class="modal-copy">确定要删除「${server.label}」吗？删除后需要重新握手才能使用。</p>`,
    footer: `<button class="btn btn-ghost" data-act="cancel" type="button">取消</button>
             <button class="btn btn-primary" data-act="confirm" type="button">确定删除</button>`,
  })

  footEl.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act
    if (act === 'cancel') {
      mask.remove()
    } else if (act === 'confirm') {
      store.state.mcpServers = (store.state.mcpServers ?? []).filter((s) => s.id !== id)
      store.save()
      mask.remove()
      renderGrid()
      if (panelName === server.label) {
        panel.hidden = true
        panelName = ''
      }
      toast('已删除')
    }
  })
})

// 工具列表点击
panel.addEventListener('click', (ev) => {
  const toolEl = ev.target.closest('.cn-tool')
  if (toolEl) {
    const index = parseInt(toolEl.dataset.toolIndex)
    const mcpServer = (store.state.mcpServers ?? []).find((s) => s.label === panelName)
    if (mcpServer && mcpServer.tools[index]) {
      showToolForm(mcpServer, mcpServer.tools[index])
    }
    return
  }

  const submitBtn = ev.target.closest('[data-tool-submit]')
  if (submitBtn) {
    submitToolCall()
    return
  }
})

let currentToolCall = null

const showToolForm = (server, tool) => {
  const form = $('#cn-tool-form')
  if (!form) return
  form.hidden = false
  const props = tool.inputSchema?.properties ?? {}
  const required = tool.inputSchema?.required ?? []
  
  currentToolCall = { server, tool }
  
  form.innerHTML = `
    <h4>调用工具：${tool.name}</h4>
    <p class="cn-tool-desc">${tool.description ?? ''}</p>
    <div class="cn-tool-params">
      ${Object.entries(props).map(([key, schema]) => {
        const isRequired = required.includes(key)
        const inputType = schema.type === 'number' ? 'number' : schema.type === 'boolean' ? 'checkbox' : 'text'
        return `
          <label class="cn-field">
            <span>${key}${isRequired ? ' *' : ''}</span>
            ${schema.description ? `<small>${schema.description}</small>` : ''}
            ${inputType === 'checkbox' 
              ? `<input type="checkbox" name="${key}" />`
              : `<input type="${inputType}" name="${key}" ${isRequired ? 'required' : ''} ${schema.type === 'number' ? 'step="any"' : ''} />`
            }
          </label>
        `
      }).join('')}
    </div>
    <button class="cn-run-btn" type="submit" data-tool-submit>调用</button>
  `
}

const submitToolCall = async () => {
  if (!currentToolCall) return
  const { server, tool } = currentToolCall
  const form = $('#cn-tool-form')
  const inputs = form.querySelectorAll('input[name]')
  const args = {}
  inputs.forEach((input) => {
    const name = input.name
    if (input.type === 'checkbox') {
      args[name] = input.checked
    } else if (input.type === 'number') {
      args[name] = parseFloat(input.value)
    } else {
      args[name] = input.value
    }
  })

  const resultEl = $('#cn-tool-result')
  if (!resultEl) return
  resultEl.hidden = false
  resultEl.innerHTML = '<div class="cn-tool-loading">调用中…</div>'

  try {
    const apiUrl = new URL('/api/mcp/servers/' + server.id + '/call', window.location.origin).href
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-DB-Client': 'design-buddy' },
      body: JSON.stringify({ toolName: tool.name, args }),
    })
    const data = await res.json()
    if (!data.ok) {
      resultEl.innerHTML = `<div class="cn-tool-error">调用失败：${data.error.message}</div>`
      return
    }
    const result = data.result
    const content = result.content?.map((c) => c.text ?? JSON.stringify(c)).join('\n') ?? '无结果'
    resultEl.innerHTML = `
      <div class="cn-tool-success">
        <div class="cn-tool-meta">
          <span>耗时：${result.ms} ms</span>
          <span>字节：${result.bytes}</span>
          ${result.isError ? '<span class="cn-tool-err">错误</span>' : '<span class="cn-tool-ok">成功</span>'}
        </div>
        <pre class="cn-tool-content">${content}</pre>
      </div>
    `
    // 记录调用日志
    pushConnectorLog(store, {
      connector: server.label, action: 'call', ok: !result.isError,
      latency: result.ms,
      detail: `MCP 调用 ${tool.name} · ${result.bytes} 字节`,
    })
  } catch (err) {
    resultEl.innerHTML = `<div class="cn-tool-error">调用失败：${err.message}</div>`
  }
}

$('#cn-grid').addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return
  const card = ev.target.closest('.cn-card')
  if (!card || ev.target.closest('[data-cn-toggle]')) return
  ev.preventDefault()
  openPanel(card.dataset.cnName)
})

/* ---------- 首屏 ---------- */

renderGrid()
