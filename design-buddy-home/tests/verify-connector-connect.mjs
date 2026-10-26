/* ============================================================
   连接器「真实连接」：点 + 真的握手 → 真实耗时 / 字段 / 产物 / 指纹
   覆盖：握手写证据 / 凭据格式校验 / 原文不落库 / 重连不换凭据 /
        重新握手刷新 / 失败不连 / 调用记录与导出
   ============================================================ */

import { loadPage, click, input, tick, readState, LS_KEY } from './helpers.mjs'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const { doc, w, errors, storage } = await loadPage('/connectors.html', { freshCopy: true })
const $ = (s) => doc.querySelector(s)
const card = (name) => doc.querySelector(`[data-cn-name="${name}"]`)
const live = (name) => readState(storage)?.connectors?.find((c) => c.name === name)
const logs = () => readState(storage)?.connectorLogs ?? []
const modal = () => doc.querySelector('.modal-mask')
const toast = () => [...doc.querySelectorAll('.toast')].map((t) => t.textContent).join(' | ')
const HEX8 = /^[0-9a-f]{8}$/

/* ---------- 1. 初始：没有假连接 ---------- */

check('connectors page loads without errors', errors.length === 0, errors)
check('toolbar exposes the real call-log entry',
  doc.querySelector('[data-cn-logs]')?.textContent.includes('调用记录'))
check('fresh connector is not connected and has no handshake evidence',
  card('通达信') && !live('通达信') && !card('通达信').querySelector('.cn-verified'))
check('no call log before any action', logs().length === 0)

/* ---------- 2. 点 + 真的跑一次握手 ---------- */

click(w, card('通达信').querySelector('[data-cn-toggle]'))
await tick(60)
const c1 = live('通达信')
check('plus click marks the connector connected', c1?.connected === true)
check('connect records a real timestamp', Number.isFinite(c1.connectedAt) && c1.connectedAt > 0)
check('handshake reports ok with a measured latency',
  c1.lastCheck?.ok === true && Number.isFinite(c1.lastCheck.latency) && c1.lastCheck.latency >= 0)
check('handshake reports the engine field count',
  Number.isFinite(c1.lastCheck.fields) && c1.lastCheck.fields >= 6, c1.lastCheck?.fields)
check('handshake lists the produced artifacts',
  Array.isArray(c1.lastCheck.artifacts) && c1.lastCheck.artifacts.length === 2
  && c1.lastCheck.artifacts.every((n) => /\.[a-z]+$/.test(n)), c1.lastCheck?.artifacts)
check('handshake fingerprints the real payload', HEX8.test(c1.lastCheck.digest ?? ''), c1.lastCheck?.digest)
check('local connection is labelled as the local engine',
  c1.authMethod === 'local' && c1.authLabel === '本地引擎' && c1.lastCheck.transport === 'local')
check('local connect keeps a credential fingerprint, not a raw secret',
  HEX8.test(c1.credential?.fingerprint ?? '') && c1.credential?.masked?.includes('…')
  && c1.credential?.masked.length <= 12)
check('connect toast states the handshake latency and artifact count',
  /已连接 · 握手 [\d.]+ ms · 2 个产物/.test(toast()), toast())
check('card shows the handshake badge with the real latency',
  card('通达信').querySelector('.cn-verified')?.textContent.includes(String(c1.lastCheck.latency)))
check('connect is written to the call log with the same latency',
  logs()[0]?.action === 'connect' && logs()[0]?.ok === true
  && logs()[0]?.latency === c1.lastCheck.latency
  && JSON.stringify(logs()[0]?.artifacts) === JSON.stringify(c1.lastCheck.artifacts))
check('connect log names the transport and credential fingerprint',
  logs()[0]?.detail.includes('本地引擎') && logs()[0]?.detail.includes(c1.credential.fingerprint))

/* ---------- 3. 面板把证据摆出来 ---------- */

click(w, card('通达信').querySelector('.cn-name'))
await tick()
const rows = [...doc.querySelectorAll('#cn-test .cn-conn-row')].map((r) => r.textContent.replace(/\s+/g, ' ').trim())
check('panel lists capability / auth / transport / credential / connect time / handshake',
  ['能力', '认证方式', '传输', '凭据指纹', '连接时间', '最近握手'].every((k) => rows.some((r) => r.startsWith(k))),
  rows)
check('transport row admits it is the local engine',
  rows.some((r) => r.startsWith('传输') && r.includes('本地引擎')))
check('credential row shows masked value plus fingerprint',
  rows.some((r) => r.includes(c1.credential.masked) && r.includes(c1.credential.fingerprint)))
check('handshake row shows time, latency, artifacts and digest',
  rows.some((r) => r.startsWith('最近握手') && r.includes(String(c1.lastCheck.latency))
    && r.includes(`${c1.lastCheck.artifacts.length} 个产物`) && r.includes(`#${c1.lastCheck.digest}`)))
check('panel is honest that no remote service is reached',
  doc.querySelector('#cn-test')?.textContent.includes('远端服务未接入'))
check('panel offers 更换凭据 and 重新握手',
  !!doc.querySelector('[data-cn-cred]') && !!doc.querySelector('[data-cn-rehandshake]'))

/* ---------- 4. 重新握手 = 真跑一次，指纹/时间都变 ---------- */

const before = { at: c1.lastCheck.at, digest: c1.lastCheck.digest }
await tick(20)
click(w, doc.querySelector('[data-cn-rehandshake]'))
await tick(60)
const c1b = live('通达信')
check('re-handshake refreshes the timestamp', c1b.lastCheck.at > before.at, [before.at, c1b.lastCheck.at])
check('re-handshake recomputes a deterministic content digest',
  HEX8.test(c1b.lastCheck.digest) && c1b.lastCheck.digest === before.digest, [before.digest, c1b.lastCheck.digest])
check('re-handshake keeps the connector connected', c1b.connected === true && c1b.connectedAt === c1.connectedAt)
check('re-handshake logs its own action',
  logs()[0]?.action === 'handshake' && logs()[0]?.ok === true && logs()[0]?.detail.includes(c1b.lastCheck.digest))
check('re-handshake toast reports success and latency',
  new RegExp(`握手成功 · ${c1b.lastCheck.latency} ms`).test(toast()), toast())

/* ---------- 5. 凭据：真校验，原文不落库 ---------- */

click(w, doc.querySelector('[data-cn-cred]'))
await tick()
check('credential modal opens with 4 auth methods',
  doc.querySelectorAll('#cn-cred-method option').length === 4)
check('local method hides the value field',
  !$('#cn-cred-method') || $('#cn-cred-method').value !== 'local' || $('#cn-cred-field').hidden)
const sel = $('#cn-cred-method')
sel.value = 'token'
sel.dispatchEvent(new w.Event('change', { bubbles: true }))
check('switching to token reveals the value field', $('#cn-cred-field').hidden === false)
click(w, doc.querySelector('[data-act="save"]'))
await tick()
check('empty credential is rejected with a concrete reason',
  $('#cn-cred-hint')?.classList.contains('is-bad') && $('#cn-cred-hint').textContent.includes('凭据为空'))
check('rejected credential keeps the modal open and writes nothing', !!modal()
  && live('通达信').credential.fingerprint === c1b.credential.fingerprint)
input(w, $('#cn-cred-value'), 'abc')
click(w, doc.querySelector('[data-act="save"]'))
await tick()
check('short token is rejected with the length rule',
  $('#cn-cred-hint').textContent.includes('至少 8 位'), $('#cn-cred-hint')?.textContent)
input(w, $('#cn-cred-value'), 'sk live 1234567890')
click(w, doc.querySelector('[data-act="save"]'))
await tick()
check('token with spaces is rejected',
  $('#cn-cred-hint').textContent.includes('空格'), $('#cn-cred-hint')?.textContent)

const RAW = 'sk-live-abcdef1234567890'
input(w, $('#cn-cred-value'), RAW)
click(w, doc.querySelector('[data-act="save"]'))
await tick(60)
const c2 = live('通达信')
check('valid token is accepted and the modal closes', !modal())
check('accepted token switches the auth method',
  c2.authMethod === 'token' && c2.authLabel === 'API Token')
check('credential fingerprint changes to the pasted token', c2.credential.fingerprint !== c1b.credential.fingerprint)
check('raw token never reaches storage', !storage.getItem(LS_KEY).includes(RAW))
check('stored credential is only a mask plus fingerprint',
  c2.credential.masked.startsWith('sk-liv') && c2.credential.masked.endsWith('7890')
  && HEX8.test(c2.credential.fingerprint))
check('token connect is labelled as format-checked only, not remote',
  c2.lastCheck.transport === 'local-fallback'
  && doc.querySelector('#cn-test').textContent.includes('尚未出网'))
check('authorize and handshake are both logged',
  logs().some((l) => l.action === 'authorize' && l.detail.includes(c2.credential.fingerprint))
  && logs()[0]?.action === 'handshake')
check('credential toast states it was verified', /凭据已校验通过/.test(toast()), toast())

/* ---------- 6. 断开 / 重连：不伪造、也不丢凭据 ---------- */

click(w, doc.querySelector('[data-cn-panel-toggle]'))
await tick(60)
const c3 = live('通达信')
check('disconnect clears the connection and handshake evidence',
  c3.connected === false && c3.lastCheck === null && Number.isFinite(c3.disconnectedAt))
check('disconnect is logged', logs()[0]?.action === 'disconnect' && logs()[0]?.ok === true)
check('disconnect toast is neutral', /已断开/.test(toast()))
check('disconnected card drops the handshake badge', !card('通达信').querySelector('.cn-verified'))

click(w, card('通达信').querySelector('[data-cn-toggle]'))
await tick(60)
const c4 = live('通达信')
check('reconnect runs a new handshake', c4.connected === true && Number.isFinite(c4.lastCheck.latency))
check('reconnect reuses the pasted token instead of issuing a random one',
  c4.credential.fingerprint === c2.credential.fingerprint && c4.authMethod === 'token')
check('reconnect keeps the honest transport label', c4.lastCheck.transport === 'local-fallback')

/* 另一个连接器的握手指纹必须不同：摘要是内容哈希，不是随机数 */
click(w, card('Tushare').querySelector('[data-cn-toggle]'))
await tick(60)
const other = live('Tushare')
check('a different connector produces a different payload digest',
  HEX8.test(other.lastCheck.digest) && other.lastCheck.digest !== c4.lastCheck.digest,
  [other.lastCheck.digest, c4.lastCheck.digest])

/* ---------- 7. 运行连接测试也进调用记录 ---------- */

click(w, card('金山文档WPS云文档').querySelector('.cn-name'))
await tick()
click(w, doc.querySelector('[data-cn-test-run]'))
await tick(380)
check('running a test appends a run entry with latency and field count',
  logs()[0]?.action === 'run' && logs()[0]?.ok === true
  && Number.isFinite(logs()[0]?.latency) && /个字段/.test(logs()[0]?.detail), logs()[0])
click(w, doc.querySelector('[data-cn-test-close]'))
await tick()

/* ---------- 8. 调用记录：可查 / 可导 / 可清 ---------- */

const logCount = logs().length
click(w, doc.querySelector('[data-cn-logs]'))
await tick()
check('call-log modal opens', /调用记录/.test(doc.querySelector('.modal-head h3')?.textContent ?? ''))
check('call-log table renders one row per record',
  doc.querySelectorAll('.modal-body tbody tr').length === logCount)
check('call-log table has time / connector / action / result / latency columns',
  ['时间', '连接器', '动作', '结果', '耗时'].every((h) =>
    [...doc.querySelectorAll('.modal-body thead th')].some((th) => th.textContent === h)))
const tableText = doc.querySelector('.modal-body tbody').textContent
check('call-log rows translate actions into readable labels',
  tableText.includes('连接') && tableText.includes('断开') && tableText.includes('授权')
  && tableText.includes('握手') && tableText.includes('运行'))
check('call-log rows carry artifacts or detail, never blank',
  [...doc.querySelectorAll('.modal-body tbody tr')].every((tr) => tr.lastElementChild.textContent.trim() !== '—'))
check('call-log offers JSON export and clear', !!doc.querySelector('[data-log-export]') && !!doc.querySelector('[data-log-clear]'))
click(w, doc.querySelector('[data-log-export]'))
await tick()
check('export reports the file name', /connector-logs\.json/.test(toast()), toast())
click(w, doc.querySelector('[data-log-close]'))
await tick()
check('closing the log modal removes it', !modal())

click(w, doc.querySelector('[data-cn-logs]'))
await tick()
click(w, doc.querySelector('[data-log-clear]'))
await tick()
check('clearing wipes the persisted log', logs().length === 0)
click(w, doc.querySelector('[data-cn-logs]'))
await tick()
check('empty log state explains how to produce records',
  doc.querySelector('.modal-body')?.textContent.includes('还没有调用记录'))
click(w, doc.querySelector('[data-log-close]'))
await tick()

/* ---------- 9. 失败不连：凭据缺失的远端连接必须拒绝 ---------- */

const broken = readState(storage)
broken.connectors.push({
  id: 'cn-broken', name: '飞书', desc: 'tampered', color: '#3370ff', shape: 'mail',
  connected: false, authMethod: 'endpoint', authLabel: 'MCP 端点',
})
storage.setItem(LS_KEY, JSON.stringify(broken))
const reload = await loadPage('/connectors.html', { storage })
const $2 = (s) => reload.doc.querySelector(s)
const toast2 = () => [...reload.doc.querySelectorAll('.toast')].map((t) => t.textContent).join(' | ')
$2('[data-cn-name="飞书"] [data-cn-toggle]').dispatchEvent(new reload.w.MouseEvent('click', { bubbles: true }))
await tick(60)
const brokenLive = readState(reload.storage).connectors.find((c) => c.name === '飞书')
check('a remote method without credential refuses to connect',
  brokenLive.connected === false && !brokenLive.lastCheck)
check('refusal names the missing credential', /还没有凭据/.test(toast2()), toast2())
check('refusal is logged as a failed connect',
  (readState(reload.storage).connectorLogs ?? [])[0]?.ok === false
  && (readState(reload.storage).connectorLogs ?? [])[0]?.action === 'connect')
check('a connected flag without evidence never shows the handshake badge',
  !$2('[data-cn-name="飞书"] .cn-verified'))
check('reload flow has no runtime errors', reload.errors.length === 0, reload.errors)

/* ---------- 10. 无运行时错误 ---------- */

check('connector connect flow has no runtime errors', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} CONNECTOR-CONNECT CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
