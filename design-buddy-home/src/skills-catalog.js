/* ============================================================
   技能发现目录（写死种子数据，零后端 / 零外部素材）
   - FEATURED_SKILLS：顶部「精选技能」横滑池，「换一批」轮换
   - SKILL_META：为 skill-registry 的 9 条注册表补充发现页元数据
     （注册表仍是安装/更新的唯一事实源，测试契约不变）
   - SKILL_FILTERS：分类筛选 chips，与截图一致
   - usage 为调用量、downloads 为安装量，展示经 formatCount 转换
   ============================================================ */

import { SKILL_REGISTRY } from './skill-registry.js'

export const SKILL_FILTERS = [
  '全部', 'OPC·一人公司', '办公协同', '双十一', '开发工具', '投资理财', '效率工具', '内容创作',
  '信息资讯', '教育学习', '数据分析', '网站部署', '生活服务', '商业运营', '知识与学习', '健康医疗',
]

// 精选池：每次展示 5 个，「换一批」在池中轮换
export const FEATURED_SIZE = 5

export const FEATURED_SKILLS = [
  {
    id: 'ft-ima', name: '腾讯ima', desc: 'Ima笔记与知识库管理（读取、整理、问答一体）',
    color: 'av-green', glyph: 'ima', category: '效率工具', tags: ['知识库', '笔记管理'],
    usage: 120700, downloads: 196100, space: 'deepseek', updatedAt: '2026-10-25 09:50:30',
  },
  {
    id: 'ft-pdfkit', name: '腾讯文档 PDFKit', desc: 'PDF全能工具箱，覆盖阅读分拆、合并与转换',
    color: 'av-rose', glyph: 'PDF', category: '办公协同', tags: ['PDF', '文档处理'],
    usage: 134200, downloads: 99000, space: 'deepseek', updatedAt: '2026-10-24 18:12:08',
  },
  {
    id: 'ft-wecom', name: '企业微信套件', desc: '企业微信官方 CLI 套件，覆盖客户群与日程',
    color: 'av-cyan', glyph: '企', category: '办公协同', tags: ['企业微信', 'CLI'],
    usage: 173300, downloads: 62500, space: 'deepseek', updatedAt: '2026-10-23 11:05:41',
  },
  {
    id: 'ft-stock', name: '腾讯自选股-金融数据', desc: '由腾讯自选股团队提供，查询行情与研报',
    color: 'av-red', glyph: '股', category: '投资理财', tags: ['行情', '研报'],
    usage: 105700, downloads: 39700, space: 'deepseek', updatedAt: '2026-10-25 08:40:12',
  },
  {
    id: 'ft-enjoy', name: '腾讯乐享', desc: '支持多源导入、多模态问答的企业知识社区',
    color: 'av-blue', glyph: '享', category: '知识与学习', tags: ['多模态', '知识社区'],
    usage: 52800, downloads: 8842, space: 'deepseek', updatedAt: '2026-10-22 15:26:53',
  },
  {
    id: 'ft-aicheck', name: 'AI交付前全自动自检', desc: 'AI交付前全自动自检技能，逐项核对质量门槛',
    color: 'av-indigo', glyph: '检', category: '开发工具', tags: ['质量自检', '交付'],
    usage: 913900, downloads: 103500, space: 'deepseek', updatedAt: '2026-10-25 09:50:30',
  },
  {
    id: 'ft-word', name: 'Word 文档处理', desc: '创建、读取、编辑、排版、审阅 Word 文档',
    color: 'av-teal', glyph: 'W', category: '办公协同', tags: ['Word', '排版'],
    usage: 45900, downloads: 46800, space: 'deepseek', updatedAt: '2026-10-21 14:02:17',
  },
  {
    id: 'ft-markit', name: 'MarkItDown', desc: '文档转 Markdown（PDF/Word/PPT 全覆盖）',
    color: 'av-gold', glyph: 'M', category: '效率工具', tags: ['Markdown', '格式转换'],
    usage: 133800, downloads: 63900, space: 'deepseek', updatedAt: '2026-10-20 19:44:02',
  },
]

// 注册表 id → 发现页展示元数据（source：recommend 推荐 / skillhub SkillHub / suite 套件）
export const SKILL_META = {
  'reg-outline': {
    color: 'av-purple', glyph: '纲', category: '内容创作', source: 'recommend',
    tags: ['演示大纲', '内容创作'], usage: 285100, downloads: 198000, space: 'deepseek', updatedAt: '2026-10-25 09:50:30',
  },
  'reg-copy': {
    color: 'av-rose', glyph: '文', category: '内容创作', source: 'skillhub',
    tags: ['文案', '语气优化'], usage: 768300, downloads: 521000, space: 'deepseek', updatedAt: '2026-10-24 16:18:44',
  },
  'reg-chart': {
    color: 'av-blue', glyph: '图', category: '数据分析', source: 'recommend',
    tags: ['数据图表', '可视化'], usage: 316100, downloads: 204000, space: 'deepseek', updatedAt: '2026-10-23 10:31:09',
  },
  'reg-translate': {
    color: 'av-cyan', glyph: '译', category: '效率工具', source: 'skillhub',
    tags: ['双语', '专业翻译'], usage: 437400, downloads: 312000, space: 'deepseek', updatedAt: '2026-10-22 20:07:55',
  },
  'reg-seo': {
    color: 'av-green', glyph: 'SEO', category: '商业运营', source: 'recommend',
    tags: ['关键词', '落地页'], usage: 108500, downloads: 76200, space: 'deepseek', updatedAt: '2026-10-19 13:55:21',
  },
  'reg-email': {
    color: 'av-orange', glyph: '邮', category: '办公协同', source: 'recommend',
    tags: ['商务邮件', '草稿'], usage: 160300, downloads: 92700, space: 'deepseek', updatedAt: '2026-10-21 09:14:38',
  },
  'reg-summary': {
    color: 'av-teal', glyph: '摘', category: '知识与学习', source: 'suite',
    tags: ['长文摘要', '结构化'], usage: 612200, downloads: 402000, space: 'deepseek', updatedAt: '2026-10-25 08:02:47',
  },
  'reg-research': {
    color: 'av-indigo', glyph: '研', category: '信息资讯', source: 'suite',
    tags: ['联网调研', '多源汇总'], usage: 138200, downloads: 88500, space: 'deepseek', updatedAt: '2026-10-24 21:36:12',
  },
  'reg-automation': {
    color: 'av-slate', glyph: '流', category: '开发工具', source: 'suite',
    tags: ['工作流', '自动执行'], usage: 688500, downloads: 372000, space: 'deepseek', updatedAt: '2026-10-23 17:48:29',
  },
}

// 网格事实源：注册表顺序不变（测试依赖该顺序的 data-install 排列）
export const DISCOVERY_SKILLS = SKILL_REGISTRY.map((reg) => ({ ...reg, ...SKILL_META[reg.id] }))

// >=1 万显示为「12.07w」，不足原值展示（8842、0）
export function formatCount(n) {
  if (n >= 10000) {
    const wan = n / 10000
    const text = Number.isInteger(wan) ? String(wan) : wan.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
    return `${text}w`
  }
  return String(n)
}
