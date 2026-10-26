/* ============================================================
   技能真实能力：技能名 → 工具引擎
   安装之后就能在技能页「运行」，产出可下载的真实结果。
   高风险技能（联网调研、自动化执行）只生成本地可执行的方案与代码，
   不假装已经联网。
   ============================================================ */

import { analyze } from './expert-runtime.js'
import { runExpert } from './expert-runtime.js'
import {
  termEngine, seoEngine, mailEngine, summaryEngine, researchEngine, workflowEngine,
  tableEngine, playlistEngine, sqlEngine, quoteEngine, docxEngine, toMarkdownEngine,
  billingEngine, promptEngine, skillScaffoldEngine, canvasEngine, valuationEngine,
  grillingEngine, diagnosisEngine, pagingEngine, selfCheckEngine,
} from './tool-engines.js'

/* 复用专家引擎的技能：直接转发，保证同一能力只有一份实现 */
const viaExpert = (expertId) => (ctx, input) => runExpert(expertId, input)

const RUNNERS = {
  'PPT 大纲生成': viaExpert('ec-deck-writer'),
  '文案润色': viaExpert('ec-editor-in-chief'),
  '数据图表化': viaExpert('ec-data-viz'),
  '中英互译': (ctx, input) => termEngine(ctx, input, /^[A-Za-z\s.,;:'"()-]+$/.test(input.trim()) ? 'en2zh' : 'zh2en'),
  'SEO 关键词规划': seoEngine,
  '邮件撰写助手': mailEngine,
  '长文摘要': summaryEngine,
  '深度联网调研': researchEngine,
  '自动化工作流执行': workflowEngine,
  'Excel 表格处理': tableEngine,
  'Excel 文件处理': tableEngine,
  'QQ音乐助手': playlistEngine,
  '墨转Word': docxEngine,
  'Word 文档处理': docxEngine,
  '数据即查': sqlEngine,
  'PDF 文档处理': pagingEngine,
  'NeoData金融搜索服务': quoteEngine,
  'fbs-bookwriter': viaExpert('ec-doc-writer'),
  'WorkBuddy积分助手': billingEngine,
  'MiniMax H3 提示词生成': promptEngine,
  '技能创建指南': skillScaffoldEngine,
  '创业可以学': canvasEngine,
  '专业底稿助手·研报版': valuationEngine,
  'grill-me': grillingEngine,
  '系统化问题定位': diagnosisEngine,
  '检查代码并按照截图调整界面': (ctx, input) => (input.includes('<') ? selfCheckEngine(ctx, input) : diagnosisEngine(ctx, input)),
  'MarkItDown': toMarkdownEngine,
  'AI交付前全自动自检': selfCheckEngine,
  // 精选位里的连接型技能
  '腾讯文档 PDFKit': pagingEngine,
  '腾讯自选股-金融数据': quoteEngine,
  '腾讯乐享': (ctx, input) => termEngine(ctx, input, 'zh2en'),
  '腾讯ima': summaryEngine,
  '企业微信套件': mailEngine,
}

/* 每个技能的示例输入：点一下就能跑出真实结果 */
const SAMPLES = {
  'PPT 大纲生成': '下周给制造业客户做数字化方案提案，30 分钟，客户决策层 5 人，重点是降本 20%',
  '文案润色': '众所周知，我们非常有效地利用了各种各样的先进工具，可以说在很大程度上充分提升了整体效率，毫无疑问这是十分值得注意的突破。',
  '数据图表化': '一月 32，二月 45，三月 38，四月 61，五月 74，六月 69',
  '中英互译': '这份设计系统包含品牌色、字体规范与组件库，交付前要做响应式检查',
  'SEO 关键词规划': '设计系统 落地页 响应式 品牌色 组件库 团队协作 交付',
  '邮件撰写助手': '季度方案确认\n下周一上午 10 点过方案\n请提前看第 3 页的报价\n如有调整请在周五前回复',
  '长文摘要': '我们在过去两个季度里重构了整套交付流程。首先把需求评审压缩到一次会议，减少反复确认。其次把设计系统的组件从 40 个精简到 26 个，删掉了长期没人使用的部分。第三，交付前的自检清单从 12 项增加到 18 项，覆盖字体替换、外链图片、页码对齐。结果是平均交付周期从 14 天降到 9 天，返工率从 23% 降到 8%。但客户反馈里仍有一半提到首轮沟通不够充分，这是我们下一阶段要解决的问题。',
  '深度联网调研': '调研企业级 AI 设计工具的市场规模与竞争格局',
  '自动化工作流执行': '拉取表单数据：从问卷接口取最新 100 条\n生成周报：按渠道汇总并计算转化率\n发送通知：把周报发到企业微信群\n归档：把原始数据存到云盘',
  'Excel 表格处理': '渠道,订单数,销售额\n自然搜索,120,84000\n信息流,86,52000\n私域,54,38000\n伙伴,31,21000',
  'QQ音乐助手': '夜航 - 4:12\n城市光 - 3:48\n慢慢 - 5:02\n清晨 - 2:56',
  '墨转Word': '# 季度方案\n\n本季度重点是把交付周期压到 9 天。\n\n## 关键动作\n\n- 需求评审合并为一次\n- 组件从 40 精简到 26\n- 自检清单补到 18 项\n\n> 结论：先做流程，再做工具。',
  '数据即查': '查上月各渠道的销售额',
  'PDF 文档处理': '第一章 背景与目标\n\n我们过去两个季度重构了交付流程，目标是把周期从 14 天压到 9 天。\n\n第二章 方法与动作\n\n把需求评审合并为一次会议，组件从 40 精简到 26，自检清单补到 18 项。\n\n第三章 结果\n\n平均交付周期 9 天，返工率从 23% 降到 8%。\n\n第四章 下一步\n\n首轮沟通仍是最弱环节，下一阶段重点补齐。',
  'NeoData金融搜索服务': '查询腾讯自选股最近 10 个交易日的走势',
  'WorkBuddy积分助手': '演示文稿 标准 6 次\n文档 Lite 12 次\n轮播图 Max 2 次',
  'MiniMax H3 提示词生成': '帮我写一个能稳定输出提案大纲的提示词',
  '技能创建指南': '周报生成器：把本周记录整理成结构化周报',
  '创业可以学': '面向中小企业的一人公司设计服务，月度订阅',
  '专业底稿助手·研报版': '营收 3000 万，增速 25%，净利率 15%',
  'grill-me': '想做一个给设计师用的 AI 工具',
  '系统化问题定位': '小程序在某些机型上白屏',
  '检查代码并按照截图调整界面': '<div style="width:1200px"><img src="a.png"><p style="font-size:10px">标题</p></div>',
  'MarkItDown': '<h1>季度总结</h1><p>本季度<strong>交付周期</strong>降到 9 天，详见<a href="https://example.com">报告</a>。</p><ul><li>返工率 8%</li><li>客户满意度上升</li></ul>',
  'AI交付前全自动自检': '{{项目名}} 交付稿：本季度交付周期 9 天，返工率 8%，详见 https://example.com/report',
  '腾讯文档 PDFKit': '第一章 背景\n\n本季度目标是压缩交付周期。\n\n第二章 结果\n\n周期从 14 天降到 9 天。',
  '腾讯自选股-金融数据': '腾讯自选股最近走势',
  '腾讯乐享': '知识库 文档 搜索 权限 协作',
  '腾讯ima': '本季度我们完成了三件事：重构交付流程、精简设计组件、补全自检清单。交付周期从 14 天降到 9 天，返工率从 23% 降到 8%。下一步要解决首轮沟通不充分的问题。',
  '企业微信套件': '客户群维护\n本周完成 12 个客户群的问题回复\n下周一同步新版报价',
}

export const SKILL_CAPS = Object.fromEntries(
  Object.entries(RUNNERS).map(([name, run]) => [name, {
    name,
    run,
    sample: SAMPLES[name] ?? '把要处理的内容贴进来',
    label: '运行',
  }]),
)

export const skillCap = (name) => SKILL_CAPS[name] ?? null

/** 没有专属引擎的技能：给一个诚实的兜底（本地结构化整理），而不是假装能联网 */
const genericRunner = (ctx, input) => {
  const words = input.trim().length
  const sents = input.split(/[。！？\n]/).map((s) => s.trim()).filter(Boolean)
  return {
    kind: 'generic',
    title: '结构化整理',
    summary: `这个本地版本没有联网能力，先把 ${words} 字整理成结构：${sents.length} 条要点，可直接作输入继续处理。`,
    stats: [
      { label: '字数', value: String(words) },
      { label: '要点', value: String(sents.length) },
      { label: '联网', value: '否' },
      { label: '导出', value: 'Markdown' },
    ],
    blocks: [
      { type: 'list', title: '要点拆分', items: sents.slice(0, 12).map((s) => s.slice(0, 60)) },
      { type: 'list', title: '建议下一步', items: ['换成同类已实现能力的技能（大纲 / 摘要 / 表格）', '把结果贴回首页继续生成'] },
    ],
    findings: [{ level: 'med', text: '该技能在当前本地版本只做结构化整理，没有外部数据访问' }],
    artifacts: [{ name: 'structured.md', mime: 'text/markdown', content: sents.map((s, i) => `${i + 1}. ${s}`).join('\n') }],
  }
}

/**
 * 按技能名运行真实引擎
 * @returns {object|null} 结果对象（结构与专家结果一致，可直接交给 resultHTML）
 */
export function runSkill(name, input) {
  const cap = SKILL_CAPS[name]
  const text = String(input ?? '').trim()
  const ctx = analyze(text || cap?.sample || name)
  if (!cap) {
    if (!text) return null
    return { skill: name, ...genericRunner(ctx, text) }
  }
  const result = cap.run(ctx, text || cap.sample)
  return { skill: name, ...result }
}
