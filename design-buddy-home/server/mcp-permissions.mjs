// Deny by default. Tool annotations/names are not treated as proof that a tool is read-only.
import { createHash, randomBytes } from 'node:crypto'
const approvals = new Map()
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
export function normalizePermissions(value, tools) {
  if (!value || typeof value !== 'object') throw Error('缺少权限配置')
  const known = new Set((tools || []).map(t => t.name))
  const result = {}
  for (const kind of ['readTools', 'writeTools']) {
    if (!Array.isArray(value[kind]) || value[kind].some(n => typeof n !== 'string' || !known.has(n))) throw Error('权限只能包含远端已声明的工具')
    result[kind] = [...new Set(value[kind])]
  }
  if (result.readTools.some(n => result.writeTools.includes(n))) throw Error('一个工具不能同时标为只读和写入')
  return result
}
export function issueApproval(server, toolName, args) {
  if (!server.permissions?.writeTools?.includes(toolName)) throw Error('未授权此写入工具')
  const now = Date.now()
  for (const [token, item] of approvals) if (item.until < now) approvals.delete(token)
  if (approvals.size >= 1000) throw Error('待确认操作过多')
  const token = randomBytes(32).toString('hex')
  approvals.set(token, { serverId: server.id, digest: digest({ toolName, args: args ?? {} }), until: now + 60000 })
  return token
}
export function authorizeCall(server, toolName, args, approvalToken) {
  if (server.permissions?.readTools?.includes(toolName)) return true
  if (!server.permissions?.writeTools?.includes(toolName)) return false
  const approval = approvals.get(approvalToken)
  approvals.delete(approvalToken)
  return !!approval && approval.serverId === server.id && approval.until >= Date.now() && approval.digest === digest({ toolName, args: args ?? {} })
}
