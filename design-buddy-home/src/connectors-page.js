import './rail-flyout.js'
import './connectors.css'
import { requireAuth } from './auth.js'
import { store, openModal, confirmModal, toast, downloadFile } from './core.js'
import { initGlobalUI } from './global-ui.js'
import { CORE_CONNECTORS, connectorStatus, isVerifiedEndpoint } from './connector-policy.js'
import { CONNECTOR_ICONS } from './connectors-catalog.js'
requireAuth(); initGlobalUI()
const $ = s => document.querySelector(s)
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
let servers = [], gatewayError = '', selected = null
const saved = () => store.state.mcpServers || []
const backend = id => servers.find(s => s.id === id)
const forProvider = p => servers.find(s => s.providerId === p.id)
const savedProvider = p => saved().find(s => s.providerId === p.id || s.label === p.name)
async function api(path = '', method = 'GET', body) {
  const response = await fetch('/api/mcp/servers' + path, { method, headers: { 'Content-Type': 'application/json', 'X-DB-Client': 'design-buddy' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(45000) })
  const data = await response.json()
  if (!response.ok || !data.ok) { const error = Error(data.error?.message || '连接器服务暂不可用'); error.status = response.status; throw error }
  return data
}
function cache(server) {
  servers = [...servers.filter(s => s.id !== server.id), server]
  // Public metadata only. Never put the endpoint token or the tool call arguments in browser storage.
  store.state.mcpServers = [...saved().filter(s => s.id !== server.id), server]
  store.save()
}
async function refresh() {
  try {
    const data = await api(); servers = data.servers; gatewayError = ''
    store.state.mcpServers = [...servers, ...saved().filter(s => !servers.some(v => v.id === s.id))]; store.save()
  } catch { servers = []; gatewayError = '网关暂不可用；历史配置保留，不能据此判断远端已连接。' }
  render()
}
function status(p) { return connectorStatus(forProvider(p), savedProvider(p), store.state.connectors.find(c => c.name === p.name)) }
function card(p, server) {
  const state = server ? connectorStatus(server, server) : status(p)
  return `<article class="cn-card" data-cn-name="${esc(p.name)}"><span class="cn-logo" style="--c:${p.color || '#3370ff'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${CONNECTOR_ICONS[p.shape] || CONNECTOR_ICONS.globe}</svg></span><div class="cn-text"><strong class="cn-name" translate="no">${esc(p.name)}</strong><p class="cn-desc">${esc(p.desc)}</p><span class="cn-verified">${esc(state)}</span>${server?.lastHandshake?.at ? `<small>${esc(new Date(server.lastHandshake.at).toLocaleString(document.documentElement.lang))}</small>` : ''}<button type="button" class="cn-configure" ${server ? `data-server="${esc(server.id)}"` : `data-provider="${p.id}"`}>${server || savedProvider(p) ? '管理连接' : '配置连接'}</button></div></article>`
}
function render() {
  const q = $('#cn-search-input').value.trim().toLowerCase()
  $('#cn-gateway-status').textContent = gatewayError
  const connected = servers.filter(isVerifiedEndpoint)
  $('#cn-connected-grid').innerHTML = connected.length ? connected.filter(s => `${s.label} ${s.serverInfo?.name || ''}`.toLowerCase().includes(q)).map(s => card({ name: s.label, desc: s.serverInfo?.name || '远端 MCP 服务', shape: 'globe' }, s)).join('') : '<p class="cn-empty">尚无已验证的远端连接</p>'
  $('#cn-grid').innerHTML = CORE_CONNECTORS.filter(p => `${p.name} ${p.desc}`.toLowerCase().includes(q)).map(p => card(p, forProvider(p))).join('') || '<p class="cn-empty">没有匹配的连接器。</p>'
  const custom = [...servers, ...saved().filter(s => !backend(s.id))].filter(s => !CORE_CONNECTORS.some(p => s.providerId === p.id))
  $('#cn-advanced-list').innerHTML = custom.map(s => `<div class="cn-legacy-row"><span translate="no">${esc(s.label)}</span><span>${esc(connectorStatus(backend(s.id), s))}</span><button data-server="${esc(s.id)}">管理连接</button></div>`).join('')
  $('#cn-legacy-list').innerHTML = store.state.connectors.filter(c => !CORE_CONNECTORS.some(p => p.name === c.name) || c.connected || c.credential || c.lastCheck).map(c => `<div class="cn-legacy-row"><span translate="no">${esc(c.name)}</span><span>${esc(connectorStatus(null, null, c))}</span><button data-legacy="${esc(c.id)}">查看旧配置</button></div>`).join('') || '<p>没有历史配置</p>'
}
function panel(server) {
  selected = server; const el = $('#cn-test'); el.hidden = false
  const permissions = server.permissions || { readTools: [], writeTools: [] }
  el.innerHTML = `<header class="cn-test-head"><h2 translate="no">${esc(server.label)}</h2><button data-panel-close aria-label="关闭">×</button></header><p>验证仅针对你配置的 MCP 端点，不代表厂商官方授权或所有业务操作均可用。</p><p><b>${esc(connectorStatus(backend(server.id), server))}</b></p><p>认证方式 <span translate="no">${esc(server.auth?.mode || 'none')}</span> · <span translate="no">${esc(server.url)}</span></p><p>默认不授权任何工具。请核对工具的真实行为，将需要的工具加入只读或写入白名单；名称和远端标注不能证明它只读。资源访问范围还必须在服务商侧限制到选定内容。</p><div class="cn-panel-actions"><button data-retest>测试连接</button><small>重新验证后工具白名单会清空，请重新核对权限。</small><button data-permissions>管理权限</button><button data-server-logs>调用记录</button><button data-disconnect>断开连接</button></div><div class="cn-tools">${(server.tools || []).map((t, i) => `<div class="cn-tool"><strong translate="no">${esc(t.name)}</strong><p translate="no">${esc(t.description)}</p><button data-tool="${i}" ${!isVerifiedEndpoint(backend(server.id)) || (!permissions.readTools.includes(t.name) && !permissions.writeTools.includes(t.name)) ? 'disabled' : ''}>${permissions.writeTools.includes(t.name) ? '确认写入后运行' : permissions.readTools.includes(t.name) ? '运行只读工具' : '未授权'}</button></div>`).join('')}</div><div id="cn-tool-form"></div><p id="cn-panel-status" role="status"></p>`
  el.scrollIntoView({ block: 'start', behavior: 'smooth' })
}
function showProvider(p) {
  const server = forProvider(p) || savedProvider(p)
  if (server) return panel(server)
  const el = $('#cn-test'); selected = null; el.hidden = false
  el.innerHTML = `<header><h2 translate="no">${esc(p.name)}</h2><button data-panel-close aria-label="关闭">×</button></header><p>${esc(p.desc)}</p><p>尚未接通厂商服务。请配置你有权访问的 MCP 端点；本应用不会伪造 OAuth 授权或厂商连接。</p><p><span>认证方式</span>：<span>由你提供的 MCP 服务决定</span></p><button data-config-provider="${p.id}">配置连接</button>`
}
function configure(provider) {
  const { mask, bodyEl, footEl, close } = openModal({ title: '配置连接', body: `<p>只连接你信任且有权访问的 MCP 服务。不会自动接入厂商账号；授权范围请在服务商侧限制。</p><form id="cn-config-form"><label class="cn-field"><span>名称</span><input name="label" maxlength="40" required value="${esc(provider?.name || '')}" ${provider ? 'readonly' : ''}></label><label class="cn-field"><span>MCP 地址</span><input name="url" type="url" required placeholder="https://mcp.example.com/mcp"></label><label class="cn-field"><span>认证方式</span><select name="authMode"><option value="none">无需认证</option><option value="bearer">Bearer Token</option><option value="header">自定义 Header</option></select></label><label class="cn-field" id="cn-secret-wrap" hidden><span>Token</span><input name="token" type="password" autocomplete="off"></label><label class="cn-field" id="cn-header-wrap" hidden><span>Header 名称</span><input name="headerName" value="X-Api-Key"></label><label class="cn-check"><input name="allowPrivate" type="checkbox"><span>信任内网地址（本地部署 / VPN / 127.0.0.1）</span></label><p id="cn-config-status" role="alert"></p></form>`, footer: '<button data-cancel>取消</button><button type="submit" form="cn-config-form" data-save>测试并保存</button>' })
  const form = bodyEl.querySelector('form'), fields = form.elements
  fields.authMode.onchange = () => { bodyEl.querySelector('#cn-secret-wrap').hidden = fields.authMode.value === 'none'; bodyEl.querySelector('#cn-header-wrap').hidden = fields.authMode.value !== 'header' }
  footEl.querySelector('[data-cancel]').onclick = () => { fields.token.value = ''; close() }
  // Clear secrets also on backdrop / Escape / close button.
  const cleanup = new MutationObserver(() => { if (!mask.isConnected) { fields.token.value = ''; cleanup.disconnect() } }); cleanup.observe(document.body, { childList: true })
  form.onsubmit = async event => {
    event.preventDefault(); const button = footEl.querySelector('[data-save]'); button.disabled = true
    try {
      const auth = { mode: fields.authMode.value }
      if (auth.mode !== 'none') { if (!fields.token.value.trim()) throw Error('请输入 Token'); auth.token = fields.token.value.trim(); if (auth.mode === 'header') auth.headerName = fields.headerName.value.trim() }
      const data = await api('', 'POST', { label: fields.label.value.trim(), url: fields.url.value.trim(), auth, providerId: provider?.id, allowPrivate: fields.allowPrivate.checked })
      fields.token.value = ''; cache(data.server); close(); render(); panel(data.server)
    } catch (error) { fields.token.value = ''; bodyEl.querySelector('#cn-config-status').textContent = error.message } finally { button.disabled = false }
  }
}
function permissions(server) {
  const current = server.permissions || { readTools: [], writeTools: [] }
  const { bodyEl, footEl, close } = openModal({ title: '管理权限', body: `<p>默认禁止所有工具。请逐项核对真实行为；不能仅根据工具名称将它标为只读。写入工具每次运行前仍需确认。</p><div class="cn-permissions">${(server.tools || []).map((t, i) => `<label><span translate="no">${esc(t.name)}</span><select data-permission="${i}"><option value="deny">未授权</option><option value="read" ${current.readTools.includes(t.name) ? 'selected' : ''}>只读</option><option value="write" ${current.writeTools.includes(t.name) ? 'selected' : ''}>写入（每次确认）</option></select></label>`).join('')}</div><p data-error role="alert"></p>`, footer: '<button data-cancel>取消</button><button data-save>保存</button>' })
  footEl.querySelector('[data-cancel]').onclick = close
  footEl.querySelector('[data-save]').onclick = async () => {
    const value = { readTools: [], writeTools: [] }
    bodyEl.querySelectorAll('[data-permission]').forEach(el => { const name = server.tools[Number(el.dataset.permission)].name; if (el.value !== 'deny') value[el.value === 'read' ? 'readTools' : 'writeTools'].push(name) })
    try { const data = await api('/' + server.id + '/permissions', 'PATCH', value); cache(data.server); close(); render(); panel(data.server) } catch (e) { bodyEl.querySelector('[data-error]').textContent = e.message }
  }
}
function toolForm(server, tool) {
  const target = $('#cn-tool-form')
  target.innerHTML = `<h3 translate="no">${esc(tool.name)}</h3><p>请只传入用户选定内容所需的资源 ID 或路径，不要请求全量资料。</p><label class="cn-field"><span>JSON 参数</span><textarea id="cn-arguments" rows="6">{}</textarea></label><button data-execute>运行</button><pre id="cn-result" translate="no"></pre>`
  target.querySelector('[data-execute]').onclick = async event => {
    const button = event.currentTarget, output = target.querySelector('#cn-result'); button.disabled = true
    try {
      const args = JSON.parse(target.querySelector('#cn-arguments').value)
      if (!args || typeof args !== 'object' || Array.isArray(args)) throw Error('JSON 参数必须是对象')
      let approvalToken
      if (server.permissions?.writeTools?.includes(tool.name)) {
        if (!await confirmModal('确认外部写入', `<span translate="no">${esc(server.label)} · ${esc(tool.name)}</span><pre translate="no">${esc(JSON.stringify(args, null, 2))}</pre>`, '确认执行')) return
        approvalToken = (await api('/' + server.id + '/approvals', 'POST', { toolName: tool.name, args })).approvalToken
      }
      const data = await api('/' + server.id + '/call', 'POST', { toolName: tool.name, args, approvalToken })
      output.textContent = JSON.stringify(data.result, null, 2)
      const download = document.createElement('button'); download.textContent = '导出 JSON'; download.onclick = () => downloadFile('mcp-result.json', output.textContent, 'application/json'); target.append(download)
    } catch (e) { output.textContent = e.message } finally { button.disabled = false }
  }
}
async function logs(server) {
  try { const data = await api('/' + server.id + '/logs'); const { bodyEl } = openModal({ title: '调用记录' }); const pre = document.createElement('pre'); pre.setAttribute('translate', 'no'); pre.textContent = JSON.stringify(data.logs, null, 2); bodyEl.append(pre) } catch (e) { toast(e.message) }
}
$('.connectors-page').addEventListener('click', async event => {
  const target = event.target.closest('button'); if (!target) return
  const providerId = target.dataset.provider || target.dataset.configProvider
  if (providerId) { const provider = CORE_CONNECTORS.find(p => p.id === providerId); if (target.hasAttribute('data-config-provider')) configure(provider); else showProvider(provider); return }
  if (target.dataset.server) { const server = backend(target.dataset.server) || saved().find(s => s.id === target.dataset.server); if (server) panel(server); return }
  if (target.hasAttribute('data-mcp-add')) { configure(); return }
  if (target.hasAttribute('data-panel-close')) { $('#cn-test').hidden = true; selected = null; return }
  if (target.dataset.legacy) {
    const entry = store.state.connectors.find(c => c.id === target.dataset.legacy)
    if (!entry) return
    const { bodyEl } = openModal({ title: '查看旧配置', body: '<p>旧记录仅作兼容保留，不代表真实厂商授权。不会在这里执行本地模拟连接。</p>' })
    const pre = document.createElement('pre'); pre.setAttribute('translate', 'no'); pre.textContent = JSON.stringify({ name: entry.name, connected: entry.connected, status: connectorStatus(null, null, entry), transport: entry.lastCheck?.transport || null }, null, 2); bodyEl.append(pre); return
  }
  if (!selected) return
  const server = selected
  if (target.hasAttribute('data-permissions')) { if (!backend(server.id)) { toast('请先测试连接'); return } permissions(server); return }
  if (target.hasAttribute('data-server-logs')) { await logs(server); return }
  if (target.hasAttribute('data-tool')) { toolForm(server, server.tools[Number(target.dataset.tool)]); return }
  target.disabled = true
  try {
    if (target.hasAttribute('data-retest')) {
      const data = await api('/' + server.id + '/handshake', 'POST', {}); cache(data.server); render(); panel(data.server)
    }
    if (target.hasAttribute('data-disconnect')) {
      if (!await confirmModal('断开连接', '将删除此远端服务配置与服务端保存的凭据，旧本地演示记录不受影响。', '断开连接')) return
      try { await api('/' + server.id, 'DELETE') } catch (error) { if (error.status !== 404) throw error }
      servers = servers.filter(s => s.id !== server.id); store.state.mcpServers = saved().filter(s => s.id !== server.id); store.save(); selected = null; $('#cn-test').hidden = true; render()
    }
  } catch (e) { if (target.hasAttribute('data-retest')) { await refresh(); const live = backend(server.id); if (live) panel(live) } const status = $('#cn-panel-status'); if (status) status.textContent = e.message } finally { target.disabled = false }
})
$('#cn-search-input').addEventListener('input', render)
render(); refresh().then(() => { const provider = CORE_CONNECTORS.find(p => p.id === new URLSearchParams(location.search).get('provider')); if (provider) showProvider(provider) })

// Re-evaluate age even when the page remains open. No background provider calls.
setInterval(() => { render(); if (selected && !isVerifiedEndpoint(backend(selected.id))) { $('#cn-test').querySelectorAll('[data-tool],[data-execute]').forEach(button => { button.disabled = true }); const status = $('#cn-panel-status'); if (status) status.textContent = '请先重新验证远端连接' } }, 60000)
