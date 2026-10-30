import { NEW_CREATION_SKILLS, RETIRED_REGISTRY_NAMES } from './creation-skill-policy.js'
/* ============================================================
   本地技能注册表（零后端、零密钥）
   - 已安装技能在 store.state.skills，注册表是「可安装 / 可更新」的唯一事实源
   - risk: trusted = 安全检测通过，可被「自动安装可信技能」消费；
           review  = 高风险，任何情况下都必须手动确认
   - 版本号语义化比较，驱动「技能自动更新」
   ============================================================ */

const LEGACY_SKILL_REGISTRY = [
  { id: 'reg-outline', name: 'PPT 大纲生成', desc: '根据主题自动生成演示大纲', version: '1.3.0', risk: 'trusted' },
  { id: 'reg-copy', name: '文案润色', desc: '优化表达与语气', version: '1.2.0', risk: 'trusted' },
  { id: 'reg-chart', name: '数据图表化', desc: '把数字转成图表建议', version: '2.0.0', risk: 'trusted' },
  { id: 'reg-translate', name: '中英互译', desc: '专业级双语翻译', version: '1.4.0', risk: 'trusted' },
  { id: 'reg-seo', name: 'SEO 关键词规划', desc: '生成搜索关键词与落地页标题', version: '1.0.0', risk: 'trusted' },
  { id: 'reg-email', name: '邮件撰写助手', desc: '按场景生成商务邮件草稿', version: '1.1.0', risk: 'trusted' },
  { id: 'reg-summary', name: '长文摘要', desc: '把长文档压缩为结构化摘要', version: '1.0.0', risk: 'trusted' },
  { id: 'reg-research', name: '深度联网调研', desc: '自动浏览多个来源并汇总，涉及外部数据访问', version: '1.0.0', risk: 'review' },
  { id: 'reg-automation', name: '自动化工作流执行', desc: '代表你执行多步操作与外部写入', version: '1.0.0', risk: 'review' },
]

export const SKILL_REGISTRY = [
  ...LEGACY_SKILL_REGISTRY.map(s => ({ ...s, retired: RETIRED_REGISTRY_NAMES.has(s.name) })),
  ...NEW_CREATION_SKILLS.map(s => ({ ...s, version: '1.0.0', risk: 'trusted' })),
]

// 预置技能（core.js seed）→ 注册表条目的名称映射，用于升级检测
export const SEED_SKILL_VERSION = '1.0.0'

export function registryEntry(name) {
  return SKILL_REGISTRY.find((r) => r.name === name) || null
}

export function compareVersion(a, b) {
  const pa = String(a).split('.').map((n) => Number(n) || 0)
  const pb = String(b).split('.').map((n) => Number(n) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0)
    if (d) return d
  }
  return 0
}

export function hasUpdate(skill) {
  const reg = registryEntry(skill.name)
  return !!reg && compareVersion(reg.version, skill.version || SEED_SKILL_VERSION) > 0
}

export function availableToInstall(installed) {
  const names = new Set(installed.map((s) => s.name))
  return SKILL_REGISTRY.filter((r) => !r.retired && !names.has(r.name))
}
