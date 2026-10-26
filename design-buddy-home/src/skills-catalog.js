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

/* 发现页补充目录：截图里除注册表外的第三方/社区技能。
   只用于发现与安装（安装后进入 store.state.skills，与注册表技能同等对待），
   不参与 registryEntry 的版本升级判定，因此不会动到注册表的更新契约。 */
export const CATALOG_SKILLS = [
  {
    id: 'cat-neodata', name: 'NeoData金融搜索服务', desc: '自然语言查询股票、基金、宏观与研报数据', source: 'skillhub',
    color: 'av-indigo', glyph: 'N', category: '投资理财', tags: ['行情', '研报'], usage: 756600, downloads: 31000,
    space: 'deepseek', updatedAt: '2026-10-25 09:12:04', version: '1.2.0', risk: 'trusted',
  },
  {
    id: 'cat-excel', name: 'Excel 表格处理', desc: '创建、编辑、分析 Excel 表格与公式', source: 'recommend',
    color: 'av-green', glyph: 'X', category: '办公协同', tags: ['表格', '公式'], usage: 591400, downloads: 283200,
    space: 'deepseek', updatedAt: '2026-10-24 20:41:36', version: '1.1.0', risk: 'trusted',
  },
  {
    id: 'cat-qqmusic', name: 'QQ音乐助手', desc: 'QQ音乐官方智能助手，支持歌单与听歌识曲', source: 'skillhub',
    color: 'av-gold', glyph: '♫', category: '生活服务', tags: ['音乐', '歌单'], usage: 25100, downloads: 28900,
    space: 'deepseek', updatedAt: '2026-10-23 09:30:18', version: '1.0.0', risk: 'trusted',
  },
  {
    id: 'cat-inkswitch', name: '墨转Word', desc: '把 Markdown 转换成带真实排版的 Word 文档', source: 'recommend',
    color: 'av-pink', glyph: '墨', category: '效率工具', tags: ['Markdown', 'Word'], usage: 1097, downloads: 3323,
    space: 'deepseek', updatedAt: '2026-10-22 16:08:55', version: '1.0.1', risk: 'trusted',
  },
  {
    id: 'cat-sqlquery', name: '数据即查', desc: '用 SQL 直接查 CSV/JSON/Parquet 等数据文件', source: 'recommend',
    color: 'av-teal', glyph: '数', category: '数据分析', tags: ['SQL', '数据文件'], usage: 94, downloads: 0,
    space: 'deepseek', updatedAt: '2026-10-25 07:55:12', version: '1.0.0', risk: 'trusted',
  },
  {
    id: 'cat-pdf', name: 'PDF 文档处理', desc: 'PDF 文档处理工具，支持文本抽取与页面操作', source: 'skillhub',
    color: 'av-green', glyph: 'P', category: '办公协同', tags: ['PDF', '文档'], usage: 1104400, downloads: 179100,
    space: 'deepseek', updatedAt: '2026-10-24 11:22:47', version: '2.1.0', risk: 'trusted',
  },
  {
    id: 'cat-bookwriter', name: 'fbs-bookwriter', desc: '福帮手出品 | 高质量长文档书写与成稿', source: 'skillhub',
    color: 'av-cyan', glyph: 'fb', category: '内容创作', tags: ['长文档', '写作'], usage: 7728, downloads: 9219,
    space: 'deepseek', updatedAt: '2026-10-20 18:03:29', version: '1.0.0', risk: 'trusted',
  },
  {
    id: 'cat-workbuddy', name: 'WorkBuddy积分助手', desc: 'WorkBuddy积分助手：读取本机工作日历并汇总', source: 'recommend',
    color: 'av-blue', glyph: 'WB', category: '效率工具', tags: ['日历', '汇总'], usage: 707600, downloads: 239300,
    space: 'deepseek', updatedAt: '2026-10-23 14:36:51', version: '1.3.2', risk: 'trusted',
  },
  {
    id: 'cat-minimax', name: 'MiniMax H3 提示词生成', desc: '为 T2VA、I2VA、FL2VA、L2VA 生成结构化提示词', source: 'skillhub',
    color: 'av-rose', glyph: 'M', category: '内容创作', tags: ['提示词', '视频'], usage: 81300, downloads: 31400,
    space: 'deepseek', updatedAt: '2026-10-25 06:47:10', version: '1.1.0', risk: 'trusted',
  },
  {
    id: 'cat-skillguide', name: '技能创建指南', desc: '创建和维护自定义技能的指南与模板', source: 'suite',
    color: 'av-pink', glyph: '技', category: '开发工具', tags: ['技能开发', '模板'], usage: 0, downloads: 0,
    space: 'deepseek', updatedAt: '2026-10-19 10:11:03', version: '1.0.0', risk: 'trusted',
  },
  {
    id: 'cat-startup', name: '创业可以学', desc: '服务创业者和管理者，解答创业全流程问题', source: 'recommend',
    color: 'av-orange', glyph: 'O', category: '商业运营', tags: ['创业', '增长'], usage: 5830, downloads: 10300,
    space: 'deepseek', updatedAt: '2026-10-21 13:29:44', version: '1.0.2', risk: 'trusted',
  },
  {
    id: 'cat-research-paid', name: '专业底稿助手·研报版', desc: '专业底稿助手·研报版：研报口径的数据底稿生成', source: 'skillhub',
    color: 'av-teal', glyph: '专', category: '投资理财', tags: ['研报', '底稿'], usage: 5, downloads: 5,
    space: 'deepseek', updatedAt: '2026-10-25 09:05:00', version: '1.0.0', risk: 'trusted', paid: true,
  },
  {
    id: 'cat-grill', name: 'grill-me', desc: '深度追问式方案审查：逐层拆解假设与风险', source: 'skillhub',
    color: 'av-green', glyph: 'G', category: '开发工具', tags: ['方案评审', '追问'], usage: 122600, downloads: 38100,
    space: 'deepseek', updatedAt: '2026-10-24 22:19:05', version: '1.0.0', risk: 'review',
  },
  {
    id: 'cat-diagnose', name: '系统化问题定位', desc: '用可复现证据定位问题根因，输出修复建议', source: 'suite',
    color: 'av-indigo', glyph: '系', category: '开发工具', tags: ['排障', '根因'], usage: 16400, downloads: 8859,
    space: 'deepseek', updatedAt: '2026-10-23 19:52:38', version: '1.0.0', risk: 'trusted',
  },
  {
    id: 'cat-excelfile', name: 'Excel 文件处理', desc: 'Excel 文件创建与分析，兼容 xlsx/xlsm', source: 'recommend',
    color: 'av-green', glyph: 'E', category: '办公协同', tags: ['Excel', '分析'], usage: 133800, downloads: 101100,
    space: 'deepseek', updatedAt: '2026-10-22 08:14:26', version: '1.2.0', risk: 'trusted',
  },
  {
    id: 'cat-uicheck', name: '检查代码并按照截图调整界面', desc: '对照截图逐项核对界面还原度并给出改动建议', source: 'recommend',
    color: 'av-slate', glyph: '界', category: '开发工具', tags: ['界面还原', '截图比对'], usage: 41300, downloads: 19700,
    space: 'deepseek', updatedAt: '2026-10-25 09:50:30', version: '1.0.0', risk: 'trusted', runtime: '本地电脑',
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

// 发现页总表：注册表在前（保持 data-install 顺序契约），补充目录在后
export const PAGE_SKILLS = [...DISCOVERY_SKILLS, ...CATALOG_SKILLS]

// >=1 万显示为「12.07w」，不足原值展示（8842、0）
export function formatCount(n) {
  if (n >= 10000) {
    const wan = n / 10000
    const text = Number.isInteger(wan) ? String(wan) : wan.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
    return `${text}w`
  }
  return String(n)
}
