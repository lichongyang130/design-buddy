import { CREATION_SKILL_OVERRIDES } from './creation-skill-policy.js'
/* ============================================================
   技能目录（创作聚焦版；旧别名仅为已安装记录保留）
   - BUILTIN_SKILLS：由 12 位专家的技能清单生成的内置能力技能，
     每项标注所属专家（expertId/expertName），分类与专家页 9 类对齐
   - TOOL_SKILLS：保留与创作交付直接相关的本地工具技能
     （Excel/Word/PDF/MarkItDown/自检/方案审查/界面检查/SQL 查询）
   - 注册表技能：SKILL_REGISTRY 的 9 条（安装/更新的唯一事实源，契约不变）
   - FEATURED_SKILLS：顶部「精选技能」横滑池，「换一批」轮换
   - 已删除：与创作交付无关的金融行情、音乐、创业、视频提示词等技能
   - 历史种子统计仅保留兼容；当前技能页不展示虚构的调用量/安装量
   ============================================================ */

import { EXPERT_CATALOG, EXPERT_FILTERS } from './experts-catalog.js'
import { SKILL_REGISTRY } from './skill-registry.js'

// 分类 chips：与专家页完全对齐（9 类）
export const SKILL_FILTERS = EXPERT_FILTERS.filter(category => category !== '总调度')

// 精选池：每次展示 5 个，「换一批」在池中轮换
export const FEATURED_SIZE = 5

// 专家在技能页的简称（技能 tags 用）
const EXPERT_LABEL = {
  'ec-manager': '总调度',
  'ec-office-admin': '行政办公',
  'ec-automation': '自动化',
  'ec-research': '研究分析',
  'ec-ppt': 'PPT',
  'ec-doc': '文档',
  'ec-content': '内容优化',
  'ec-visual': '视觉设计',
  'ec-ai-image': 'AI图片',
  'ec-brand': '模板品牌',
  'ec-qa': '质量审核',
  'ec-web-prototype': '网页原型',
}

// 内置能力技能的一句话说明
export const SKILL_DESC = {
  '任务拆分': '把大目标拆成可执行的小任务并排优先级',
  '专家调度': '按任务匹配最合适的专家来承接',
  '进度跟踪': '记录各任务进度并提醒关键节点',
  '交付验收': '对照需求清单逐项验收交付物',
  'Excel合并': '把多个表格合并成一张总表',
  '数据去重': '找出重复记录并清理',
  '文件分类': '按规则把文件归入对应文件夹',
  '会议纪要': '把会议记录整理成结构化纪要',
  '通知生成': '起草群通知与邮件通知',
  '日程整理': '汇总多来源日程成一张表',
  '批量文件读取': '批量读取文件夹中的文件内容',
  '文件夹监听': '盯文件夹变化并触发处理',
  '表格自动汇总': '定时把多张表汇总成一张',
  '定时任务': '按设定时间自动执行步骤',
  '自动交付': '完成后自动打包并交付',
  '网页检索': '检索资料并汇总要点',
  'PDF阅读': '提取 PDF 中的文字与表格',
  '多文件对比': '对比多个版本的差异',
  '竞品分析': '整理竞品信息与差异点',
  '数据统计': '对数据做统计与汇总',
  '来源引用': '标注引用来源并核对链接',
  '大纲规划': '生成演示大纲并分配页数',
  '故事线设计': '设计贯穿全篇的叙事线',
  '页数控制': '按演讲时长压缩或扩充页数',
  '页面布局': '规划每页的版式与内容',
  '图表制作': '把数据做成图表',
  '演讲备注': '为每页撰写演讲备注',
  'PPT导出': '导出可演示的成品文件',
  '方案撰写': '起草方案正文',
  '报告生成': '生成结构化报告',
  '公文格式': '按公文格式规范排版',
  '合同要点提取': '提取合同关键条款',
  '摘要': '把长文档压缩成摘要',
  'Word/PDF转换': '在 Word 与 PDF 之间转换',
  '语气调整': '调整文案的语气与口吻',
  '专业润色': '润色成专业表达',
  '压缩扩写': '按目标长度压缩或扩写',
  '多语言翻译': '多语言互译',
  '受众适配': '按受众改写表达',
  '文案校对': '校对错别字与语病',
  '栅格布局': '用栅格系统规划版面',
  '字体层级': '设定标题与正文的字体层级',
  '色彩系统': '建立统一的色彩系统',
  '留白': '规划版面留白与呼吸感',
  '图文比例': '控制图文比例',
  '响应式设计': '处理多尺寸适配',
  '视觉一致性': '检查全篇视觉一致性',
  '文生图': '按描述生成图片',
  '参考图生成': '参照风格生成图片',
  '背景移除': '去掉图片背景',
  '图片编辑': '编辑已有图片',
  '图像裁切': '按尺寸裁切图片',
  '风格统一': '统一多张图的风格',
  '图表插画': '为图表配插画',
  '模板检索': '检索可用的模板',
  '主题切换': '切换模板主题',
  '品牌规范提取': '从素材提取品牌规范',
  '组件复用': '复用已有组件',
  '企业设计系统管理': '管理企业设计系统',
  '事实核验': '核对事实与数据',
  '数字校验': '校验数字一致性',
  '缺项检查': '检查必填项是否齐全',
  '错别字检查': '检查错别字',
  '页面溢出检测': '检测页面内容溢出',
  '导出结果验收': '验收导出文件',
  '原型搭建': '搭建可运行的原型',
  '响应式布局': '处理响应式布局',
  '交互验证': '验证交互逻辑',
}

const statFor = (i) => ({
  usage: 8000 + ((i * 7321) % 950000),
  downloads: 1000 + ((i * 3917) % 260000),
})

const DATES = [
  '2026-10-25 09:50:30', '2026-10-24 18:12:08', '2026-10-23 11:05:41',
  '2026-10-22 16:08:55', '2026-10-21 14:02:17', '2026-10-20 19:44:02',
]

// 内置能力技能：12 位专家 × 各自技能清单
export const BUILTIN_SKILLS = EXPERT_CATALOG.flatMap((e, ei) =>
  e.skills.map((name, i) => {
    const idx = ei * 10 + i
    const stats = statFor(idx)
    return {
      id: `sk-${e.id}-${i}`,
      name,
      desc: SKILL_DESC[name] ?? `${e.name}的核心能力`,
      expertId: e.id,
      expertName: e.name,
      category: e.category,
      color: e.color,
      glyph: name[0],
      tags: [EXPERT_LABEL[e.id] ?? e.name, e.category],
      usage: stats.usage,
      downloads: stats.downloads,
      space: 'deepseek',
      updatedAt: DATES[idx % DATES.length],
      version: '1.0.0',
      risk: 'trusted',
      source: 'builtin',
    }
  })
)

// 工具技能：只保留与创作交付直接相关的本地工具
export const TOOL_SKILLS = [
  {
    id: 'cat-excel', name: 'Excel 表格处理', desc: '创建、编辑、分析 Excel 表格与公式', source: 'recommend',
    color: 'av-green', glyph: 'X', category: '办公协同', tags: ['表格', '公式'], usage: 591400, downloads: 283200,
    space: 'deepseek', updatedAt: '2026-10-24 20:41:36', version: '1.1.0', risk: 'trusted',
  },
  {
    id: 'cat-pdf', name: 'PDF 文档处理', desc: 'PDF 文档处理工具，支持文本抽取与页面操作', source: 'skillhub',
    color: 'av-green', glyph: 'P', category: '文档报告', tags: ['PDF', '文档'], usage: 1104400, downloads: 179100,
    space: 'deepseek', updatedAt: '2026-10-24 11:22:47', version: '2.1.0', risk: 'trusted',
  },
  {
    id: 'ft-word', name: 'Word 文档处理', desc: '创建、读取、编辑、排版、审阅 Word 文档', source: 'recommend',
    color: 'av-teal', glyph: 'W', category: '文档报告', tags: ['Word', '排版'], usage: 45900, downloads: 46800,
    space: 'deepseek', updatedAt: '2026-10-21 14:02:17', version: '1.0.0', risk: 'trusted',
  },
  {
    id: 'ft-markit', name: 'MarkItDown', desc: '文档转 Markdown（PDF/Word/PPT 全覆盖）', source: 'recommend',
    color: 'av-gold', glyph: 'M', category: '文档报告', tags: ['Markdown', '格式转换'], usage: 133800, downloads: 63900,
    space: 'deepseek', updatedAt: '2026-10-20 19:44:02', version: '1.0.0', risk: 'trusted',
  },
  {
    id: 'ft-aicheck', name: 'AI交付前全自动自检', desc: 'AI交付前全自动自检技能，逐项核对质量门槛', source: 'recommend',
    color: 'av-indigo', glyph: '检', category: '导入与交付', tags: ['质量自检', '交付'], usage: 913900, downloads: 103500,
    space: 'deepseek', updatedAt: '2026-10-25 09:50:30', version: '1.0.0', risk: 'trusted',
  },
  {
    id: 'cat-grill', name: 'grill-me', desc: '深度追问式方案审查：逐层拆解假设与风险', source: 'skillhub',
    color: 'av-green', glyph: 'G', category: '导入与交付', tags: ['方案评审', '追问'], usage: 122600, downloads: 38100,
    space: 'deepseek', updatedAt: '2026-10-24 22:19:05', version: '1.0.0', risk: 'review',
  },
  {
    id: 'cat-uicheck', name: '检查代码并按照截图调整界面', desc: '对照截图逐项核对界面还原度并给出改动建议', source: 'recommend',
    color: 'av-slate', glyph: '界', category: '导入与交付', tags: ['界面还原', '截图比对'], usage: 41300, downloads: 19700,
    space: 'deepseek', updatedAt: '2026-10-25 09:50:30', version: '1.0.0', risk: 'trusted', runtime: '本地电脑',
  },
  {
    id: 'cat-sqlquery', name: '数据即查', desc: '用 SQL 直接查 CSV/JSON/Parquet 等数据文件', source: 'recommend',
    color: 'av-teal', glyph: '数', category: '研究分析', tags: ['SQL', '数据文件'], usage: 94, downloads: 0,
    space: 'deepseek', updatedAt: '2026-10-25 07:55:12', version: '1.0.0', risk: 'trusted',
  },
]

// 注册表 id → 发现页展示元数据（source：recommend 推荐 / skillhub SkillHub / suite 套件；
// category 已对齐专家页 9 类）
export const SKILL_META = {
  'reg-outline': {
    color: 'av-purple', glyph: '纲', category: '提案演示', source: 'recommend',
    tags: ['演示大纲', 'PPT'], usage: 285100, downloads: 198000, space: 'deepseek', updatedAt: '2026-10-25 09:50:30',
  },
  'reg-copy': {
    color: 'av-rose', glyph: '文', category: '文档报告', source: 'skillhub',
    tags: ['文案', '语气优化'], usage: 768300, downloads: 521000, space: 'deepseek', updatedAt: '2026-10-24 16:18:44',
  },
  'reg-chart': {
    color: 'av-blue', glyph: '图', category: '研究分析', source: 'recommend',
    tags: ['数据图表', '可视化'], usage: 316100, downloads: 204000, space: 'deepseek', updatedAt: '2026-10-23 10:31:09',
  },
  'reg-translate': {
    color: 'av-cyan', glyph: '译', category: '文档报告', source: 'skillhub',
    tags: ['双语', '专业翻译'], usage: 437400, downloads: 312000, space: 'deepseek', updatedAt: '2026-10-22 20:07:55',
  },
  'reg-seo': {
    color: 'av-green', glyph: 'SEO', category: '文档报告', source: 'recommend',
    tags: ['关键词', '落地页'], usage: 108500, downloads: 76200, space: 'deepseek', updatedAt: '2026-10-19 13:55:21',
  },
  'reg-email': {
    color: 'av-orange', glyph: '邮', category: '办公协同', source: 'recommend',
    tags: ['商务邮件', '草稿'], usage: 160300, downloads: 92700, space: 'deepseek', updatedAt: '2026-10-21 09:14:38',
  },
  'reg-summary': {
    color: 'av-teal', glyph: '摘', category: '文档报告', source: 'suite',
    tags: ['长文摘要', '结构化'], usage: 612200, downloads: 402000, space: 'deepseek', updatedAt: '2026-10-25 08:02:47',
  },
  'reg-research': {
    color: 'av-indigo', glyph: '研', category: '研究分析', source: 'suite',
    tags: ['联网调研', '多源汇总'], usage: 138200, downloads: 88500, space: 'deepseek', updatedAt: '2026-10-24 21:36:12',
  },
  'reg-automation': {
    color: 'av-slate', glyph: '流', category: '办公协同', source: 'suite',
    tags: ['工作流', '自动执行'], usage: 688500, downloads: 372000, space: 'deepseek', updatedAt: '2026-10-23 17:48:29',
  },
}

// Legacy metadata and runtime aliases above remain available for already installed skills.
// Only useful, distinct and accurately described capabilities appear in discovery.
export const DISCOVERY_SKILLS = SKILL_REGISTRY.filter(s => !s.retired).map(reg => ({
  ...reg, ...(SKILL_META[reg.id] || {}), ...CREATION_SKILL_OVERRIDES[reg.name],
  tags: SKILL_META[reg.id]?.tags || ['创作交付'], source: SKILL_META[reg.id]?.source || 'recommend',
  color: SKILL_META[reg.id]?.color || 'av-indigo', glyph: reg.glyph || SKILL_META[reg.id]?.glyph || 'S',
  category: reg.category || SKILL_META[reg.id]?.category || '导入与交付',
  usage: 0, downloads: 0, space: '本地', updatedAt: '2026-10-30',
}))
export const PAGE_SKILLS = [
  ...DISCOVERY_SKILLS,
  ...[...BUILTIN_SKILLS, ...TOOL_SKILLS].filter(s => CREATION_SKILL_OVERRIDES[s.name]).map(s => ({
    ...s, ...CREATION_SKILL_OVERRIDES[s.name], usage: 0, downloads: 0,
  })),
]
const byName = new Map(PAGE_SKILLS.map(s => [s.name, s]))
export const FEATURED_SKILLS = ['PPT 大纲生成', '文档结构检查', '页面可访问性检查', '素材引用清单', '原型搭建', '数据图表化', '页面布局', '品牌规范提取'].map(name => byName.get(name))
export const creationSkill = name => byName.get(name) || null
const legacyNames = new Set([...BUILTIN_SKILLS, ...TOOL_SKILLS, ...SKILL_REGISTRY].map(s => s.name))
export const installedSkillPresentation = name => creationSkill(name) || (legacyNames.has(name) ? {
  displayName: `${name}（旧版能力）`,
  desc: '已从推荐移除，保留旧安装记录；可能仅转发专家规则或输出方案，不执行名称暗示的外部操作。',
} : null)

// >=1 万显示为「12.07w」，不足原值展示（8842、0）
export function formatCount(n) {
  if (n >= 10000) {
    const wan = n / 10000
    const text = Number.isInteger(wan) ? String(wan) : wan.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
    return `${text}w`
  }
  return String(n)
}
