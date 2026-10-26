/**
 * MCP 前端集成测试：连接器页能接入真实 MCP 服务并调用工具
 * 用 mock MCP 服务器验证完整流程。
 */

import { loadPage, click, input, tick } from './helpers.mjs'
import { startMockServer } from './mock-mcp-server.mjs'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS', name) }
  else { fails.push(name); console.log('FAIL', name, extra ?? '') }
}

/* ---------- 启动 mock MCP 服务 ---------- */

const mock = await startMockServer({ mode: 'modern', port: 9877 })
console.log(`Mock MCP server started at ${mock.url}`)

/* ---------- 加载连接器页 ---------- */

const { doc, w, errors } = await loadPage('/connectors.html')
const $ = (s) => doc.querySelector(s)

check('connectors page loads without errors', errors.length === 0, errors)

/* ---------- 1. 接入 MCP 服务弹窗 ---------- */

// 点击「接入 MCP 服务」按钮
const mcpBtn = $('[data-mcp-add]')
check('MCP add button exists', !!mcpBtn)

click(w, mcpBtn)
await tick(100)

const modal = $('.modal-mask')
check('MCP modal opens', !!modal)

const title = modal.querySelector('.modal-head h3')
check('modal title mentions MCP', title?.textContent.includes('MCP'))

const labelInput = $('#mcp-label')
const urlInput = $('#mcp-url')
const authSelect = $('#mcp-auth-mode')
const tokenInput = $('#mcp-token')
const privateCheck = $('#mcp-allow-private')
const submitBtn = modal.querySelector('[data-act="save"]')

check('label input exists', !!labelInput)
check('url input exists', !!urlInput)
check('auth select exists', !!authSelect)
check('token input exists', !!tokenInput)
check('allow private checkbox exists', !!privateCheck)
check('submit button exists', !!submitBtn)

/* ---------- 2. 表单校验 ---------- */

// 空表单提交
click(w, submitBtn)
await tick(100)
check('empty form shows error', modal.textContent.includes('请填写'))

// 填入信息
input(w, labelInput, '测试 MCP')
input(w, urlInput, mock.url)
authSelect.value = 'none'
authSelect.dispatchEvent(new w.Event('change', { bubbles: true }))
privateCheck.checked = true
privateCheck.dispatchEvent(new w.Event('change', { bubbles: true }))

/* ---------- 3. 真握手并接入 ---------- */

click(w, submitBtn)
await tick(2000) // 等待握手完成

check('modal closes after success', !$('.modal-mask'), 'modal still open')
check('toast reports success', doc.querySelector('.toast')?.textContent.includes('已接入'), 'toast: ' + doc.querySelector('.toast')?.textContent)

/* ---------- 4. 卡片显示远端信息 ---------- */

const card = doc.querySelector('.cn-card[data-cn-name="测试 MCP"]')
check('new connector card appears', !!card)

const verified = card.querySelector('.cn-verified')
check('card shows handshake badge', verified?.textContent.includes('已连'))
check('badge shows tool count', verified?.textContent.includes('5 个工具'))

const desc = card.querySelector('.cn-desc')
check('card shows server info', desc?.textContent.includes('MockMCP'))

/* ---------- 5. 面板显示协议详情 ---------- */

click(w, card.querySelector('.cn-name'))
await tick(100)

const panel = $('#cn-test')
check('panel opens', !!panel)

const rows = [...panel.querySelectorAll('.cn-conn-row')]
const getText = (key) => rows.find((r) => r.textContent.includes(key))?.textContent

check('panel shows protocol version', getText('协议版本')?.includes('2026-07-28'))
check('panel shows transport', getText('传输')?.includes('远端'))
check('panel shows server info', getText('服务信息')?.includes('MockMCP'))
check('panel shows instructions', getText('说明')?.includes('测试用的 MCP 服务'))

/* ---------- 6. 工具列表 ---------- */

const toolList = panel.querySelector('.cn-tools')
check('tool list exists', !!toolList)

const tools = [...toolList.querySelectorAll('.cn-tool')]
check('tool list shows 5 tools', tools.length === 5)

const echoTool = tools.find((t) => t.textContent.includes('echo'))
check('echo tool exists', !!echoTool)
check('tool shows description', echoTool?.textContent.includes('原样返回'))

/* ---------- 7. 调用工具 ---------- */

click(w, echoTool)
await tick(100)

const form = panel.querySelector('.cn-tool-form')
check('tool form appears', !!form)

const textInput = form.querySelector('[name="text"]')
check('text input exists', !!textInput)

input(w, textInput, 'hello world')

const callBtn = form.querySelector('button[type="submit"]')
check('call button exists', !!callBtn)

click(w, callBtn)
await tick(300)

const result = panel.querySelector('.cn-tool-result')
check('result area appears', !!result)
check('result shows success', result?.textContent.includes('成功'))
check('result shows content', result?.textContent.includes('hello world'))

/* ---------- 8. 调用记录 ---------- */

const logsBtn = $('[data-cn-logs]')
click(w, logsBtn)
await tick(100)

const logModal = $('.modal-mask')
check('log modal opens', !!logModal)

const logRows = logModal.querySelectorAll('tbody tr')
check('log has entries', logRows.length >= 2) // handshake + call

const hasHandshake = [...logRows].some((r) => r.textContent.includes('握手'))
const hasCall = [...logRows].some((r) => r.textContent.includes('调用'))
check('log shows handshake', hasHandshake)
check('log shows call', hasCall)

click(w, logModal.querySelector('[data-log-close]'))
await tick(100)

/* ---------- 9. 清理 ---------- */

// 删除服务
const deleteBtn = panel.querySelector('[data-cn-delete]')
check('delete button exists', !!deleteBtn)

click(w, deleteBtn)
await tick(200)

const confirmModal = $('.modal-mask')
check('confirm modal appears', !!confirmModal)

const confirmBtn = confirmModal.querySelector('[data-act="confirm"]')
click(w, confirmBtn)
await tick(100)

check('card removed after delete', !doc.querySelector('.cn-card[data-cn-name="测试 MCP"]'))

/* ---------- 10. 错误处理 ---------- */

// 尝试接入一个不存在的地址
click(w, $('[data-mcp-add]'))
await tick(100)

input(w, $('#mcp-label'), '失败测试')
input(w, $('#mcp-url'), 'http://127.0.0.1:9999/mcp')
$('#mcp-auth-mode').value = 'none'
$('#mcp-allow-private').checked = true

click(w, $('.modal-mask [data-act="save"]'))
await tick(500)

check('error modal stays open on failure', !!$('.modal-mask'))
check('error shows message', $('.modal-mask').textContent.includes('连接被拒') || $('.modal-mask').textContent.includes('无法连接'))

click(w, $('.modal-mask [data-act="cancel"]'))
await tick(100)

/* ---------- 清理 mock 服务 ---------- */

await mock.close()

/* ---------- 检查运行时错误 ---------- */

check('no runtime errors during MCP flow', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} MCP UI CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
