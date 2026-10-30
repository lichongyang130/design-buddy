import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createServer } from 'node:http'
import { setTimeout as pause } from 'node:timers/promises'
import { normalizePermissions, issueApproval, authorizeCall } from '../server/mcp-permissions.mjs'
import { CORE_CONNECTORS, connectorStatus } from '../src/connector-policy.js'
import { startMockServer } from './mock-mcp-server.mjs'
import { templateBrowser } from '../scripts/template-browser.mjs'
assert.equal(CORE_CONNECTORS.length, 6)
assert.equal(connectorStatus({ lastHandshake: { ok: true, at: Date.now() - 31 * 60000 } }, {}), '已配置，未验证')
assert.equal(connectorStatus({ lastHandshake: { ok: true, at: Date.now() } }, {}), '已验证（MCP 端点）')
assert.equal(connectorStatus(null, null, { connected: true }), '已配置，未验证')
assert.equal(connectorStatus(null, null, { connected: true, lastCheck: { transport: 'local' } }), '本地演示')
assert.throws(() => normalizePermissions({ readTools: ['echo'], writeTools: ['echo'] }, [{ name: 'echo' }]))
const now = Date.now
try {
  Date.now = () => 0
  const server = { id: 'expiry-test', permissions: { readTools: [], writeTools: ['write'] } }
  const approval = issueApproval(server, 'write', { id: 'selected-document' })
  Date.now = () => 60001
  assert.equal(authorizeCall(server, 'write', { id: 'selected-document' }, approval), false)
} finally { Date.now = now }
const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'db-mcp-focus-'))
process.env.MCP_DATA_DIR = dir
const { handleMcpRequest } = await import('../server/api-mcp.mjs')
const gateway = createServer(handleMcpRequest)
await new Promise(r => gateway.listen(0, '127.0.0.1', r))
const apiBase = 'http://127.0.0.1:' + gateway.address().port
const mock = await startMockServer({ requireAuth: true }), legacy = await startMockServer({ mode: 'legacy' })
const client = async (suffix = '', method = 'GET', body) => {
  await pause(550)
  const res = await fetch(apiBase + '/api/mcp/servers' + suffix, { method, headers: { 'X-DB-Client': 'design-buddy', 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) })
  return { status: res.status, ...await res.json() }
}
let browser
try {
  const denied = await client('', 'POST', { label: 'No private opt-in', url: mock.url })
  assert.equal(denied.ok, false)
  const created = await client('', 'POST', { providerId: 'cn-feishu', label: '飞书', url: mock.url, allowPrivate: true, auth: { mode: 'bearer', token: 'sk-correct' } })
  assert(created.ok, JSON.stringify(created)); const server = created.server, id = server.id
  assert.equal(server.providerId, 'cn-feishu'); assert.deepEqual(server.permissions, { readTools: [], writeTools: [] })
  assert(!JSON.stringify(created).includes('sk-correct'))
  const beforeCalls = mock.received.filter(r => r.body?.method === 'tools/call').length
  assert.equal((await client('/' + id + '/call', 'POST', { toolName: 'echo', args: { text: 'no' } })).status, 403)
  assert.equal(mock.received.filter(r => r.body?.method === 'tools/call').length, beforeCalls)
  assert.equal((await client('/' + id + '/permissions', 'PATCH', { readTools: ['unknown'], writeTools: [] })).status, 400)
  assert((await client('/' + id + '/permissions', 'PATCH', { readTools: ['echo'], writeTools: ['add'] })).ok)
  const read = await client('/' + id + '/call', 'POST', { toolName: 'echo', args: { text: 'real endpoint result' } })
  assert.equal(read.result.content[0].text, 'real endpoint result')
  assert.equal((await client('/' + id + '/call', 'POST', { toolName: 'add', args: { a: 2, b: 3 } })).status, 403)
  const approval = await client('/' + id + '/approvals', 'POST', { toolName: 'add', args: { a: 2, b: 3 } })
  const write = await client('/' + id + '/call', 'POST', { toolName: 'add', args: { a: 2, b: 3 }, approvalToken: approval.approvalToken })
  assert.equal(write.result.content[0].text, '5')
  assert.equal((await client('/' + id + '/call', 'POST', { toolName: 'add', args: { a: 2, b: 3 }, approvalToken: approval.approvalToken })).status, 403)
  const changed = await client('/' + id + '/approvals', 'POST', { toolName: 'add', args: { a: 2, b: 3 } })
  assert.equal((await client('/' + id + '/call', 'POST', { toolName: 'add', args: { a: 99, b: 3 }, approvalToken: changed.approvalToken })).status, 403)
  const { getServer } = await import('../server/mcp-registry.mjs')
  const expiring = await getServer(id); expiring.lastHandshake.at = Date.now() - 31 * 60000
  assert.equal((await client('/' + id + '/call', 'POST', { toolName: 'echo', args: { text: 'expired' } })).status, 409)
  const renewed = await client('/' + id + '/handshake', 'POST', {})
  assert(renewed.ok); assert.deepEqual(renewed.server.permissions, { readTools: [], writeTools: [] })
  const legacyCreated = await client('', 'POST', { label: 'Legacy protocol fixture', url: legacy.url, allowPrivate: true })
  assert(legacyCreated.ok)
  await client('/' + legacyCreated.server.id + '/permissions', 'PATCH', { readTools: ['echo'], writeTools: [] })
  assert.equal((await client('/' + legacyCreated.server.id + '/call', 'POST', { toolName: 'echo', args: { text: 'legacy session' } })).result.content[0].text, 'legacy session')
  browser = await templateBrowser()
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.route('**/api/mcp/**', async route => {
    const request = route.request(), suffix = new URL(request.url()).pathname
    const response = await route.fetch({ url: apiBase + suffix, headers: { ...request.headers(), origin: apiBase, 'X-DB-Client': 'design-buddy' } })
    await route.fulfill({ response })
  })
  await page.goto('http://127.0.0.1:5174/auth.html'); await page.locator('#guest-entry').click(); await page.waitForURL('**/index.html')
  const original = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('design-buddy-state-v1'))
    state.connectors.push({ id: 'old-fixture', name: '通达信', connected: true, lastCheck: { transport: 'local' }, customNote: 'preserve' })
    localStorage.setItem('design-buddy-state-v1', JSON.stringify(state)); return state.connectors
  })
  await page.goto('http://127.0.0.1:5174/connectors.html')
  await page.waitForFunction(() => document.querySelector('#cn-connected-grid').textContent.includes('飞书'))
  assert.equal(await page.locator('#cn-grid .cn-card').count(), 6)
  assert(!await page.locator('#cn-grid').innerText().then(v => v.includes('通达信')))
  assert.equal(await page.locator('.cn-advanced').getAttribute('open'), null)
  await page.locator('#cn-grid [data-server="' + id + '"]').click()
  assert.match(await page.locator('#cn-test').innerText(), /MCP 端点/)
  await page.locator('[data-permissions]').click()
  await page.locator('[data-permission]').nth(0).selectOption('read')
  await page.locator('[data-permission]').nth(1).selectOption('write')
  await page.locator('.modal-foot [data-save]').click()
  await page.waitForSelector('#cn-test [data-tool="1"]:enabled')
  await page.locator('#cn-test [data-tool="1"]').click()
  await page.locator('#cn-arguments').fill('{"a":7,"b":8}')
  await page.locator('[data-execute]').click()
  await page.waitForSelector('.modal-foot [data-act="cancel"]')
  const callsBeforeCancel = mock.received.filter(r => r.body?.method === 'tools/call').length
  await page.locator('.modal-foot [data-act="cancel"]').click(); await pause(200)
  assert.equal(mock.received.filter(r => r.body?.method === 'tools/call').length, callsBeforeCancel)
  await pause(600); await page.locator('[data-execute]').click(); await page.locator('.modal-foot [data-act="ok"]').click()
  await page.waitForFunction(() => document.querySelector('#cn-result').textContent.includes('"text": "15"'))
  // Real configuration form, explicit private-network opt-in, no browser token persistence, backend disconnect.
  await page.locator('#cn-grid [data-provider="cn-notion"]').click()
  await page.locator('[data-config-provider="cn-notion"]').click()
  await page.locator('#cn-config-form [name="url"]').fill(mock.url)
  await page.locator('#cn-config-form [name="authMode"]').selectOption('bearer')
  await page.locator('#cn-config-form [name="token"]').fill('sk-correct')
  await page.locator('#cn-config-form [name="allowPrivate"]').check()
  await page.locator('.modal-foot [data-save]').click()
  await page.waitForFunction(() => document.querySelector('#cn-test h2')?.textContent === 'Notion')
  assert(!await page.evaluate(() => localStorage.getItem('design-buddy-state-v1').includes('sk-correct')))
  assert.equal(await page.locator('#cn-test [data-tool]:enabled').count(), 0)
  await page.locator('[data-disconnect]').click()
  await page.locator('.modal-foot [data-act="ok"]').click()
  await page.waitForFunction(() => !JSON.parse(localStorage.getItem('design-buddy-state-v1')).mcpServers.some(s => s.providerId === 'cn-notion'))
  assert(!(await client()).servers.some(s => s.providerId === 'cn-notion'))
  await page.locator('.cn-advanced summary').click()
  assert.match(await page.locator('#cn-legacy-list').innerText(), /本地演示/)
  assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('design-buddy-state-v1')).connectors), original)
  await page.setViewportSize({ width: 390, height: 844 })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  assert.deepEqual(errors, [])
  await mock.close()
  const failed = await client('/' + id + '/handshake', 'POST', {})
  assert.equal(failed.ok, false)
  assert.equal((await client()).servers.find(s => s.id === id).lastHandshake.ok, false)
  await client('/' + id, 'DELETE')
  assert(!(await client()).servers.some(s => s.id === id))
  console.log('PASS six core cards / collapsed advanced legacy records / actual mock-endpoint handshake and read/write calls / modern and legacy protocols / default deny / permissions / exact-argument single-use write confirmations / cancelled write sends nothing / secret redaction / failure status / backend deletion / old records unchanged / mobile / no runtime errors. Mock endpoint verification is not a claim of live vendor integration.')
} finally {
  await browser?.close(); await mock.close().catch(() => {}); await legacy.close(); await new Promise(r => gateway.close(r)); await fs.rm(dir, { recursive: true, force: true })
}
