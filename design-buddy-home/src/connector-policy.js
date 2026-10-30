export const CORE_CONNECTORS = [
  { id: 'cn-feishu', name: '飞书', shape: 'send', color: '#3370ff', desc: '选定团队文档作为创作资料，按需回传成果', phase: 1 },
  { id: 'cn-notion', name: 'Notion', shape: 'doc', color: '#111827', desc: '导入选定知识库页面，保存创作结果', phase: 1 },
  { id: 'cn-github', name: 'GitHub', shape: 'code', color: '#24292f', desc: '读取指定仓库资料，确认后提交原型源码', phase: 1 },
  { id: 'cn-drive', name: 'Google Drive', shape: 'cloud', color: '#1a8f4c', desc: '选择云端文件作为素材，保存导出成果', phase: 2 },
  { id: 'cn-docs', name: '腾讯文档', shape: 'doc', color: '#2b6cf6', desc: '导入协作文档资料，按需回传交付文档', phase: 2 },
  { id: 'cn-slack', name: 'Slack', shape: 'chat', color: '#611f69', desc: '确认后将成果链接发送到指定频道', phase: 2 },
]
export const VERIFICATION_TTL_MS = 30 * 60 * 1000
export const isVerifiedEndpoint = server => server?.lastHandshake?.ok === true && Number.isFinite(server.lastHandshake.at) && Date.now() - server.lastHandshake.at >= 0 && Date.now() - server.lastHandshake.at <= VERIFICATION_TTL_MS
// Only backend-returned endpoint evidence counts; a legacy `connected` flag is not proof.
export function connectorStatus(server, saved, legacy) {
  if (server?.lastHandshake?.ok === false) return '连接异常'
  if (isVerifiedEndpoint(server)) return '已验证（MCP 端点）'
  if (saved) return '已配置，未验证'
  if (legacy?.lastCheck?.transport?.startsWith('local') || legacy?.authMethod === 'local') return '本地演示'
  if (legacy?.connected || legacy?.credential) return '已配置，未验证'
  return '未配置'
}
