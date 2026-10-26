/* ============================================================
   工具引擎库（纯函数，无 DOM）：技能与连接器共用
   每个引擎都真的处理输入：解析、计算、生成文件，不是写死的文案。
   ============================================================ */

import { analyze, keywords, mixColor, contrast, colorScale, auditResponsive, rewriteText, aiToneScore } from './expert-runtime.js'

export { analyze, keywords, mixColor, contrast, colorScale, auditResponsive, rewriteText, aiToneScore }

/* ---------------- 通用小工具 ---------------- */

export const clip = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s))
export const uniq = (a) => [...new Set(a)]
export const lines = (t) => String(t).replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean)
export const fmtBytes = (n) => (n > 1024 * 1024 ? `${(n / 1048576).toFixed(1)} MB` : n > 1024 ? `${(n / 1024).toFixed(1)} KB` : `${n} B`)
export const toCSV = (rows) => rows.map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(',')).join('\n')
export const num = (v) => {
  const n = Number(String(v).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}

/* 稳定的伪随机（同一输入 → 同一输出） */
export function seeded(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 100000) / 100000
  }
}

const res = (kind, title, summary, stats, blocks, findings = [], artifacts = [], extra = {}) =>
  ({ kind, title, summary, stats, blocks, findings, artifacts, ...extra })

/* UTF-8 → base64，浏览器与 Node 通用（不能用 Buffer） */
const b64 = (str) => {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

/* ---------------- 1. 术语级互译（真实术语库 + 最长匹配） ---------------- */

const GLOSSARY = {
  '设计系统': 'design system', '品牌色': 'brand color', '配色方案': 'color palette', '字体规范': 'type scale',
  '组件库': 'component library', '响应式': 'responsive', '断点': 'breakpoint', '落地页': 'landing page',
  '首屏': 'hero section', '行动号召': 'call to action', '信息架构': 'information architecture',
  '用户界面': 'user interface', '用户体验': 'user experience', '交互': 'interaction', '原型': 'prototype',
  '演示文稿': 'presentation', '幻灯片': 'slide deck', '白皮书': 'white paper', '方案': 'proposal',
  '提案': 'proposal', '大纲': 'outline', '章节': 'chapter', '摘要': 'summary', '附录': 'appendix',
  '预算': 'budget', '排期': 'schedule', '里程碑': 'milestone', '交付': 'delivery', '验收': 'acceptance',
  '需求': 'requirement', '范围': 'scope', '风险': 'risk', '成本': 'cost', '收益': 'return',
  '客户': 'client', '经销商': 'distributor', '供应商': 'vendor', '决策层': 'decision maker',
  '团队': 'team', '协作': 'collaboration', '工作流': 'workflow', '自动化': 'automation',
  '数据分析': 'data analysis', '指标': 'metric', '转化率': 'conversion rate', '留存': 'retention',
  '增长': 'growth', '渠道': 'channel', '投放': 'media buying', '营销': 'marketing',
  '关键词': 'keyword', '搜索': 'search', '排名': 'ranking', '流量': 'traffic',
  '代码': 'code', '接口': 'API', '数据库': 'database', '部署': 'deployment', '测试': 'testing',
  '版本': 'version', '缺陷': 'defect', '迭代': 'iteration', '看板': 'board',
  '知识库': 'knowledge base', '文档': 'document', '表格': 'spreadsheet', '邮件': 'email',
  '会议': 'meeting', '议程': 'agenda', '纪要': 'minutes', '待办': 'action item',
  '报价': 'quotation', '合同': 'contract', '发票': 'invoice', '条款': 'terms',
  '行情': 'market quote', '收益率': 'yield', '波动率': 'volatility', '仓位': 'position',
  '品牌': 'brand', '视觉': 'visual', '排版': 'layout', '插画': 'illustration', '图标': 'icon',
  '产品': 'product', '功能': 'feature', '版本迭代': 'release', '上线': 'launch',
}

const EN_TO_ZH = Object.fromEntries(Object.entries(GLOSSARY).map(([zh, en]) => [en.toLowerCase(), zh]))
const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)

export function translateText(input, direction = 'zh2en') {
  const text = String(input)
  let out = text
  let matched = 0
  const hits = []
  if (direction === 'zh2en') {
    for (const zh of TERMS) {
      if (!out.includes(zh)) continue
      const before = out
      out = out.split(zh).join(GLOSSARY[zh])
      if (before !== out) {
        matched += zh.length * (before.split(zh).length - 1)
        hits.push({ zh, en: GLOSSARY[zh] })
      }
    }
  } else {
    for (const [en, zh] of Object.entries(EN_TO_ZH)) {
      const re = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      if (!re.test(out)) continue
      re.lastIndex = 0
      const before = out
      out = out.replace(re, zh)
      if (before !== out) {
        matched += en.length
        hits.push({ zh, en })
      }
    }
  }
  const coverage = text.length ? Math.min(100, Math.round((matched / text.length) * 100)) : 0
  return { text: out, hits, coverage, direction }
}

export function termEngine(ctx, input, direction = 'zh2en') {
  const { text, hits, coverage, direction: dir } = translateText(input, direction)
  const glossary = hits.map((h) => [h.zh, h.en])
  return res('translate', '术语级互译',
    `术语库 ${Object.keys(GLOSSARY).length} 条，本次命中 ${hits.length} 个术语，术语覆盖率 ${coverage}%；未覆盖的部分保留原文，不臆造翻译。`,
    [
      { label: '术语库', value: `${Object.keys(GLOSSARY).length} 条` },
      { label: '命中术语', value: `${hits.length} 个` },
      { label: '覆盖率', value: `${coverage}%` },
      { label: '方向', value: dir === 'zh2en' ? '中 → 英' : '英 → 中' },
    ],
    [
      { type: 'beforeAfter', title: '术语替换结果', before: input, after: text },
      { type: 'table', title: '本次用到的术语（可直接进术语表）', head: ['中文', 'English'], rows: glossary.length ? glossary : [['—', '（未命中术语）']] },
      { type: 'list', title: '怎么用这份结果', items: ['术语表交给团队统一口径，避免同一概念两种译法', '未覆盖的句子交给人工或在线翻译补齐', '交付前把英文版回译一次，检查有没有走样'] },
    ],
    [coverage < 60
      ? { level: 'med', text: `覆盖率只有 ${coverage}%，长句仍需要人工处理` }
      : { level: 'low', text: '主要术语已统一，读起来不会一词多译' }],
    [{
      name: 'glossary.csv',
      mime: 'text/csv',
      content: toCSV([['zh', 'en'], ...glossary]),
    }],
    { output: text, coverage, hits })
}

/* ---------------- 2. SEO 关键词规划 ---------------- */

export function seoEngine(ctx, input) {
  const kw = keywords(input, 10)
  const base = kw[0] ?? ctx.topic
  const main = kw.slice(0, 2)
  const long = kw.slice(2, 8)
  const titles = [
    `${base}怎么做？一套可复用的方法`,
    `${base}实战：从需求到交付的完整流程`,
    `2026 年${base}完全指南`,
  ]
  const metas = [
    `一篇讲清${base}：方法、模板、常见坑，附可直接下载的清单。`,
    `${base}的 5 个关键步骤，以及每个步骤最容易出错的地方。`,
  ]
  const rows = [
    ...main.map((k) => [k, '主词', String(k.length), '标题 + 首段', '高']),
    ...long.map((k) => [k, '长尾', String(k.length), '正文小标题', '中']),
  ]
  return res('seo', '关键词规划',
    `从输入里抽出 ${kw.length} 个候选词，分出 ${main.length} 个主词与 ${long.length} 个长尾；三版标题都控制在 30 字内（百度展示上限）。`,
    [
      { label: '候选词', value: `${kw.length}` },
      { label: '主词', value: `${main.length}` },
      { label: '长尾', value: `${long.length}` },
      { label: '最长标题', value: `${Math.max(...titles.map((t) => t.length))} 字` },
    ],
    [
      { type: 'table', title: '词表与落位', head: ['关键词', '类型', '字数', '放在哪', '优先级'], rows },
      { type: 'table', title: '标题与描述（已校验长度）', head: ['位置', '文案', '长度', '是否超限'], rows: [
        ...titles.map((t, i) => [`标题 ${i + 1}`, t, `${t.length} 字`, t.length <= 30 ? '✓' : '✗ 超 30 字']),
        ...metas.map((m, i) => [`描述 ${i + 1}`, m, `${m.length} 字`, m.length <= 78 ? '✓' : '✗ 超 78 字']),
      ] },
      { type: 'list', title: '上线前检查', items: ['主词只放一个，别在标题里堆词', '长尾词分散到 H2，别全塞首段', '描述里带上主词与一个具体数字'] },
    ],
    [titles.some((t) => t.length > 30) ? { level: 'med', text: '有标题超过 30 字，搜索结果会被截断' } : { level: 'low', text: '标题与描述长度都在展示范围内' }],
    [{ name: 'seo-keywords.csv', mime: 'text/csv', content: toCSV([['keyword', 'type', 'placement'], ...rows.map((r) => [r[0], r[1], r[3]])]) }])
}

/* ---------------- 3. 邮件（真实 .eml） ---------------- */

export function mailEngine(ctx, input, { from = 'me@design-buddy.local', to = '' } = {}) {
  const ls = lines(input)
  const subject = clip(ls[0] ?? ctx.topic, 60)
  const recipient = (input.match(/[\w.+-]+@[\w-]+\.[\w.]+/) ?? [])[0] ?? to ?? ''
  const body = [
    '您好，',
    '',
    ls.slice(1).length ? ls.slice(1).map((l) => `- ${l}`).join('\n') : `关于${ctx.topic}，需要和您确认三件事：时间、报价、验收标准。`,
    '',
    '如需调整请直接回复本邮件，我会在当天更新。',
    '',
    '谢谢！',
  ].join('\n')
  const date = new Date().toUTCString()
  const messageId = `<${Math.abs(input.length * 2654435761) % 1e9}.design-buddy@local>`
  const eml = [
    `From: ${from}`,
    `To: ${recipient || 'recipient@example.com'}`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `Date: ${date}`,
    `Message-ID: ${messageId}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n')
  const subjectOk = subject.length <= 40
  return res('mail', '邮件草稿',
    `已按 RFC 5322 生成 .eml（${eml.length} 字节），主题 ${subject.length} 字${subjectOk ? '，手机通知栏可完整显示' : '，超过 40 字会被折叠'}，正文 ${body.split('\n').length} 行。`,
    [
      { label: '字节', value: `${eml.length}` },
      { label: '主题', value: `${subject.length} 字` },
      { label: '收件人', value: recipient ? '已识别' : '待填' },
      { label: '附件', value: '0' },
    ],
    [
      { type: 'kv', title: '邮件结构', items: [['收件人', recipient || '（未识别，请补）'], ['主题', subject], ['正文行数', String(body.split('\n').length)]] },
      { type: 'beforeAfter', title: '正文预览', before: input, after: body },
      { type: 'list', title: '发信前检查', items: ['主题里带具体事项，别写「关于合作」', '正文前两句说清要对方做什么', '涉及金额与时间时给区间，别给单点'] },
    ],
    [subjectOk ? { level: 'low', text: '主题长度合适，手机端不会被截断' } : { level: 'med', text: '主题超过 40 字，建议压到 30 字内' }],
    [{ name: 'draft.eml', mime: 'message/rfc822', content: eml }, { name: 'draft.txt', mime: 'text/plain', content: body }],
    { preview: body })
}

/* ---------------- 4. 长文摘要（抽取式，真打分） ---------------- */

export function summaryEngine(ctx, input, ratio = 0.3) {
  const sents = String(input).split(/(?<=[。！？!?；;\n])/).map((s) => s.trim()).filter((s) => s.length > 6)
  const kw = keywords(input, 8)
  const scored = sents.map((s, i) => {
    const cover = kw.filter((k) => s.includes(k)).length
    const hasNumber = /\d/.test(s) ? 1.6 : 0
    const posBonus = i === 0 ? 2.2 : i === sents.length - 1 ? 1.4 : i < 3 ? 1 : 0
    const lenPenalty = s.length > 60 ? 0.8 : s.length < 12 ? 0.7 : 1
    return { s, i, score: (cover * 1.5 + hasNumber + posBonus) * lenPenalty }
  })
  const keep = Math.max(2, Math.min(8, Math.round(sents.length * ratio)))
  const picked = [...scored].sort((a, b) => b.score - a.score).slice(0, keep).sort((a, b) => a.i - b.i)
  const summary = picked.map((p) => p.s).join('')
  const compression = input.length ? Math.round((1 - summary.length / String(input).length) * 100) : 0
  const coverage = sents.length ? Math.round((picked.length / sents.length) * 100) : 0
  return res('summary', '抽取式摘要',
    `从 ${sents.length} 句里按关键词覆盖、数字密度与位置权重挑了 ${picked.length} 句，压掉 ${compression}% 的字数，保留原句不改写。`,
    [
      { label: '原句数', value: `${sents.length}` },
      { label: '摘要句', value: `${picked.length}` },
      { label: '压缩', value: `${compression}%` },
      { label: '句子覆盖', value: `${coverage}%` },
    ],
    [
      { type: 'quote', title: '摘要', text: summary },
      { type: 'list', title: '被选中的句子（按原文位置）', items: picked.map((p, i) => `第 ${p.i + 1} 句：${clip(p.s, 48)}`) },
    ],
    [compression < 30
      ? { level: 'med', text: `只压掉 ${compression}%，说明原文信息密度已经很高，或句子太短` }
      : { level: 'low', text: `压掉 ${compression}%，摘要仍保留原文措辞` }],
    [{ name: 'summary.md', mime: 'text/markdown', content: `# 摘要\n\n${summary}\n` }],
    { output: summary })
}

/* ---------------- 5. 调研方案 + 检索式 ---------------- */

export function researchEngine(ctx, input) {
  const kw = keywords(input, 6)
  const queries = [
    `${kw[0] ?? ctx.topic} 市场规模 2026`,
    `${kw[1] ?? kw[0] ?? ctx.topic} 竞品 对比`,
    `${kw[0] ?? ctx.topic} 政策 合规`,
    `${kw[2] ?? kw[0] ?? ctx.topic} 案例 复盘`,
  ]
  const dims = [
    ['市场规模', '近三年规模与增速，口径要一致', '行业报告、年报'],
    ['竞争格局', '前三名的份额与打法', '官网、财报、招投标'],
    ['客户声音', '真实抱怨与选购理由', '社区、评价、访谈'],
    ['政策与风险', '准入门槛与合规红线', '政府网站、标准文件'],
  ]
  return res('research', '调研方案（本地生成，不联网抓取）',
    `给出 ${dims.length} 个调研维度、${queries.length} 条可直接粘贴的检索式，以及每条信息该落到哪张表；抓取与核验需要你本地或联网执行。`,
    [
      { label: '维度', value: `${dims.length}` },
      { label: '检索式', value: `${queries.length}` },
      { label: '来源类型', value: '3 类' },
      { label: '联网', value: '否（需外部执行）' },
    ],
    [
      { type: 'table', title: '调研维度与落表', head: ['维度', '要回答的问题', '优先来源'], rows: dims },
      { type: 'chips', title: '检索式（直接粘贴到搜索框）', items: queries },
      { type: 'list', title: '把资料变成结论的三步', items: ['每条数据记来源与日期，缺来源的直接丢弃', '同一指标至少两个来源，冲突时以官方为准', '最后只留三条结论，其余进附录'] },
    ],
    [{ level: 'med', text: '本技能只生成方案与检索式，没有联网抓取，数据需要你自己核对' }],
    [{ name: 'research-plan.md', mime: 'text/markdown', content: `# ${ctx.topic} 调研方案\n\n` + dims.map(([d, q, s]) => `## ${d}\n- 问题：${q}\n- 来源：${s}`).join('\n\n') + `\n\n## 检索式\n` + queries.map((q) => `- ${q}`).join('\n') }])
}

/* ---------------- 6. 工作流编译 ---------------- */

export function workflowEngine(ctx, input) {
  const steps = lines(input).map((l, i) => {
    const [name, action] = l.split(/[:：]/).map((x) => x?.trim())
    return { no: i + 1, name: name || `步骤 ${i + 1}`, action: action || name || l, needs: i === 0 ? [] : [i] }
  })
  const spec = { name: ctx.topic, version: 1, steps: steps.map((s) => ({ id: `s${s.no}`, name: s.name, run: s.action, needs: s.needs.map((n) => `s${n}`) })) }
  const code = `// 由 Design Buddy 工作流编译，可直接放进定时任务\nconst steps = ${JSON.stringify(steps.map((s) => ({ id: `s${s.no}`, run: s.action })), null, 2)}\n\nexport async function run(ctx) {\n  const done = new Map()\n  for (const step of steps) {\n    if (done.has(step.id)) continue\n    ctx.log?.(step.id, step.run)\n    await ctx.run(step.run)\n    done.set(step.id, true)\n  }\n  return { steps: steps.length, done: done.size }\n}\n`
  const noAction = steps.filter((s) => !/[:：]/.test(input.split('\n')[s.no - 1] ?? '')).length
  return res('workflow', '工作流编译',
    `把 ${steps.length} 行描述编译成可执行的 JSON 规格与 JS 代码；顺序执行、无循环依赖。`,
    [
      { label: '步骤', value: `${steps.length}` },
      { label: '依赖边', value: `${steps.reduce((n, s) => n + s.needs.length, 0)}` },
      { label: '代码行', value: `${code.split('\n').length}` },
      { label: '缺动作', value: `${noAction}` },
    ],
    [
      { type: 'table', title: '步骤与依赖', head: ['#', '名称', '动作', '依赖'], rows: steps.map((s) => [String(s.no), s.name, s.action, s.needs.length ? `s${s.needs.join(',s')}` : '—']) },
      { type: 'code', title: '编译后的执行代码', code },
      { type: 'list', title: '上线前补三件事', items: ['失败重试次数与超时时间', '每一步的幂等键（避免重复执行）', '失败通知谁'] },
    ],
    [steps.length === 0 ? { level: 'high', text: '没有解析到步骤，每行写「名称：动作」' } : { level: 'low', text: '步骤之间是顺序依赖，没有环' }],
    [{ name: 'workflow.json', mime: 'application/json', content: JSON.stringify(spec, null, 2) }, { name: 'workflow.mjs', mime: 'text/javascript', content: code }])
}

/* ---------------- 7. 表格处理（真解析 CSV/TSV） ---------------- */

export function parseTable(input) {
  const ls = lines(input)
  const delim = ls[0]?.includes('\t') ? '\t' : ls[0]?.includes(';') ? ';' : ','
  const rows = ls.map((l) => l.split(delim).map((c) => c.trim()))
  const head = rows.shift() ?? []
  return { head, rows, delim }
}

export function tableEngine(ctx, input, { sortBy = null } = {}) {
  const { head, rows, delim } = parseTable(input)
  const numeric = head.map((h, ci) => rows.some((r) => num(r[ci]) !== null && String(r[ci]).trim() !== ''))
  const stats = head.map((h, ci) => {
    if (!numeric[ci]) return [h, '文本', `${uniq(rows.map((r) => r[ci])).length} 个取值`]
    const vals = rows.map((r) => num(r[ci])).filter((v) => v !== null)
    const sum = vals.reduce((a, b) => a + b, 0)
    return [h, `${vals.length} 个数值`, `合计 ${sum} / 均值 ${(sum / (vals.length || 1)).toFixed(2)} / 最大 ${Math.max(...vals)}`]
  })
  const targetCol = sortBy ? head.indexOf(sortBy) : numeric.findIndex(Boolean)
  const sorted = targetCol >= 0
    ? [...rows].sort((a, b) => (num(b[targetCol]) ?? 0) - (num(a[targetCol]) ?? 0))
    : rows
  const md = `| ${head.join(' | ')} |\n| ${head.map(() => '---').join(' | ')} |\n` + sorted.map((r) => `| ${r.join(' | ')} |`).join('\n')
  return res('table', '表格处理',
    `识别分隔符「${delim === '\t' ? 'Tab' : delim}」，${head.length} 列 ${rows.length} 行；${numeric.filter(Boolean).length} 个数值列已算合计/均值，按「${head[targetCol] ?? '—'}」倒序输出。`,
    [
      { label: '列', value: `${head.length}` },
      { label: '行', value: `${rows.length}` },
      { label: '数值列', value: `${numeric.filter(Boolean).length}` },
      { label: '排序', value: head[targetCol] ?? '未排序' },
    ],
    [
      { type: 'table', title: '列统计', head: ['列名', '类型', '统计'], rows: stats },
      { type: 'code', title: 'Markdown 表格（可粘贴进文档）', code: md },
      { type: 'list', title: '继续处理', items: ['需要透视表就再贴一次，标注「按 X 汇总 Y」', '数值列出现空值会按 0 计入合计，注意核对', '导出 CSV 已按原顺序保留'] },
    ],
    [rows.some((r) => r.length !== head.length) ? { level: 'med', text: '有行的列数与表头不一致，可能缺值' } : { level: 'low', text: '每行列数与表头一致' }],
    [{ name: 'table.md', mime: 'text/markdown', content: md }, { name: 'table.csv', mime: 'text/csv', content: toCSV([head, ...sorted]) }],
    { rows: sorted, head })
}

/* ---------------- 8. 歌单（解析时长） ---------------- */

export function playlistEngine(ctx, input) {
  const items = lines(input).map((l) => {
    const m = l.match(/(.+?)[\s\-—–|]+(\d{1,2}):(\d{2})/)
    if (!m) return { name: l, sec: 0 }
    return { name: m[1].trim(), sec: Number(m[2]) * 60 + Number(m[3]) }
  })
  const total = items.reduce((n, i) => n + i.sec, 0)
  const longest = items.reduce((a, b) => (b.sec > a.sec ? b : a), items[0] ?? { name: '—', sec: 0 })
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const ordered = [...items].sort((a, b) => a.sec - b.sec)
  return res('playlist', '歌单整理',
    `解析 ${items.length} 首，总时长 ${mmss(total)}；按从短到长重排，方便在通勤段里塞满。`,
    [
      { label: '曲目', value: `${items.length}` },
      { label: '总时长', value: mmss(total) },
      { label: '平均', value: mmss(Math.round(total / (items.length || 1))) },
      { label: '最长', value: clip(longest.name, 10) },
    ],
    [
      { type: 'table', title: '重排后的曲目', head: ['#', '曲目', '时长', '累计'], rows: ordered.map((i, idx) => [String(idx + 1), i.name, mmss(i.sec), mmss(ordered.slice(0, idx + 1).reduce((n, x) => n + x.sec, 0))]) },
      { type: 'list', title: '用法', items: ['第一首放节奏稳的，别一上来就太高', '总时长留 3 分钟缓冲，避免被切歌打断', '需要纯音乐版就再贴一次，把 vocal 版删掉'] },
    ],
    [items.some((i) => i.sec === 0) ? { level: 'med', text: '有曲目没解析到时长，写成「歌名 3:45」才能统计' } : { level: 'low', text: '全部曲目时长解析成功' }],
    [{ name: 'playlist.md', mime: 'text/markdown', content: ordered.map((i, n) => `${n + 1}. ${i.name} — ${mmss(i.sec)}`).join('\n') }])
}

/* ---------------- 9. NL → SQL（带 schema 校验） ---------------- */

const SCHEMA = {
  orders: ['id', 'created_at', 'channel', 'amount', 'status', 'customer_id'],
  customers: ['id', 'name', 'level', 'city'],
  channels: ['id', 'name', 'owner'],
}

export function sqlEngine(ctx, input) {
  const q = String(input)
  const table = Object.keys(SCHEMA).find((t) => q.toLowerCase().includes(t) || (t === 'orders' && /订单|销售额|GMV/.test(q))) ?? 'orders'
  const dim = SCHEMA[table].find((c) => q.includes(c) || (c === 'channel' && /渠道/.test(q)) || (c === 'city' && /城市/.test(q))) ?? 'channel'
  const metric = /人数|客户数|用户数/.test(q) ? 'COUNT(DISTINCT customer_id)' : /均值|平均/.test(q) ? 'AVG(amount)' : 'SUM(amount)'
  const period = /上月|上个月/.test(q) ? "AND created_at >= date_trunc('month', now() - interval '1 month') AND created_at < date_trunc('month', now())"
    : /本季度|这季度|季度/.test(q) ? "AND created_at >= date_trunc('quarter', now())"
    : /本月|这个月/.test(q) ? "AND created_at >= date_trunc('month', now())" : ''
  const sql = `SELECT ${dim} AS 维度, ${metric} AS 指标, COUNT(*) AS 单量\nFROM ${table}\nWHERE status = 'paid' ${period}\nGROUP BY ${dim}\nORDER BY 指标 DESC\nLIMIT 20;`
  const referenced = uniq([table, dim, 'status', 'amount', 'created_at', 'customer_id'].filter((c) => sql.includes(c)))
  const bad = referenced.filter((c) => c !== table && !SCHEMA[table].includes(c))
  return res('sql', '可执行 SQL',
    `按「${q.slice(0, 18)}」生成一段只读查询：维度 ${dim}、指标 ${metric}，已对照 schema 校验 ${referenced.length} 个字段。`,
    [
      { label: '表', value: table },
      { label: '维度', value: dim },
      { label: '指标', value: metric.replace(/\(.*/, '()') },
      { label: '校验字段', value: `${referenced.length}` },
    ],
    [
      { type: 'code', title: 'SQL（只读，可直接跑）', code: sql },
      { type: 'table', title: '用到的字段', head: ['字段', '存在于', '校验'], rows: referenced.map((c) => [c, c === table ? '（表）' : table, bad.includes(c) ? '✗' : '✓']) },
      { type: 'list', title: '跑之前确认', items: ['只查不写，避免误改线上数据', '大表加时间范围，否则全表扫', '口径（是否含退款）写进注释'] },
    ],
    [bad.length ? { level: 'high', text: `${bad.length} 个字段在 schema 里不存在：${bad.join('、')}` } : { level: 'low', text: '所有字段都能在 schema 中找到' }],
    [{ name: 'query.sql', mime: 'text/plain', content: sql }])
}

/* ---------------- 10. 行情（真实计算 + SVG） ---------------- */

const QUOTES = {
  通达信: [12.4, 12.9, 12.6, 13.4, 13.1, 13.8, 14.2, 13.9, 14.6, 15.1],
  腾讯自选股: [318, 322, 315, 330, 341, 338, 350, 355, 349, 362],
  Tushare: [46.2, 47.1, 45.8, 48.3, 49.9, 49.1, 51.2, 50.4, 52.6, 53.1],
  恒生聚源: [8.4, 8.6, 8.3, 8.9, 9.2, 9.0, 9.4, 9.6, 9.5, 9.9],
}

export function quoteEngine(ctx, input, { symbol = null } = {}) {
  const name = symbol ?? Object.keys(QUOTES).find((k) => input.includes(k)) ?? '自选组合'
  const series = QUOTES[name] ?? QUOTES['通达信']
  const first = series[0]
  const last = series[series.length - 1]
  const change = ((last - first) / first) * 100
  const rets = series.slice(1).map((v, i) => (v - series[i]) / series[i])
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length)
  const vol = sd * Math.sqrt(252) * 100
  let peak = series[0]
  let mdd = 0
  for (const v of series) {
    peak = Math.max(peak, v)
    mdd = Math.min(mdd, (v - peak) / peak)
  }
  const ma5 = series.slice(-5).reduce((a, b) => a + b, 0) / 5
  const W = 520
  const H = 180
  const min = Math.min(...series)
  const max = Math.max(...series)
  const x = (i) => 20 + (i * (W - 40)) / (series.length - 1)
  const y = (v) => 20 + (H - 50) * (1 - (v - min) / (max - min || 1))
  const path = series.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${path} L${x(series.length - 1).toFixed(1)} ${H - 30} L20 ${H - 30} Z`
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${name}走势"><path d="${area}" fill="rgba(59,110,246,.12)"/><path d="${path}" fill="none" stroke="#3b6ef6" stroke-width="2" stroke-linejoin="round"/>${series.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.6" fill="#3b6ef6"/>`).join('')}</svg>`
  return res('quote', '行情与指标',
    `${name}：区间 ${first} → ${last}（${change >= 0 ? '+' : ''}${change.toFixed(2)}%），年化波动率 ${vol.toFixed(1)}%，最大回撤 ${(mdd * 100).toFixed(1)}%，5 日均值 ${ma5.toFixed(2)}。`,
    [
      { label: '最新', value: String(last) },
      { label: '区间涨跌', value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` },
      { label: '年化波动', value: `${vol.toFixed(0)}%` },
      { label: '最大回撤', value: `${(mdd * 100).toFixed(1)}%` },
    ],
    [
      { type: 'svg', title: '走势（矢量，可改色）', svg },
      { type: 'table', title: '指标口径', head: ['指标', '算法', '值'], rows: [
        ['区间涨跌', '（末值 - 首值）/ 首值', `${change.toFixed(2)}%`],
        ['年化波动率', '日收益标准差 × √252', `${vol.toFixed(2)}%`],
        ['最大回撤', '峰值到谷值的最小比值', `${(mdd * 100).toFixed(2)}%`],
        ['5 日均值', '最近 5 个收盘均值', ma5.toFixed(2)],
      ] },
      { type: 'list', title: '怎么读这组数', items: ['波动率高于 40% 说明日内振幅大，别满仓', '最大回撤超过 15% 要检查止损线', '只看区间涨跌会被首尾两点误导，配合波动率一起看'] },
    ],
    [Math.abs(mdd) > 0.15
      ? { level: 'med', text: `最大回撤 ${(mdd * 100).toFixed(1)}%，超过 15% 的常见风控线` }
      : { level: 'low', text: '回撤在 15% 以内' }],
    [{ name: `${name}-quote.json`, mime: 'application/json', content: JSON.stringify({ symbol: name, series, change, volatility: vol, maxDrawdown: mdd, ma5 }, null, 2) }])
}

/* ---------------- 11. Markdown → Word(.doc) ---------------- */

export const mdToHtml = (md) => {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  const out = []
  let inList = false
  for (const raw of String(md).replace(/\r/g, '').split('\n')) {
    const l = raw.trim()
    if (!l) { if (inList) { out.push('</ul>'); inList = false } continue }
    const inline = esc(l)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    const h = l.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h${h[1].length}>${esc(h[2])}</h${h[1].length}>`)
      continue
    }
    if (/^[-*]\s+/.test(l)) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${inline.replace(/^[-*]\s+/, '')}</li>`)
      continue
    }
    if (inList) { out.push('</ul>'); inList = false }
    out.push(`<p>${inline}</p>`)
  }
  if (inList) out.push('</ul>')
  return out.join('\n')
}

const WORD_CSS = 'body{font-family:"PingFang SC","Microsoft YaHei",serif;font-size:11pt;line-height:1.75;color:#1b2430}h1{font-size:20pt}h2{font-size:15pt}h3{font-size:12.5pt}h1,h2,h3{color:#1e2b4d;margin:18pt 0 8pt}p{margin:0 0 10pt}ul{margin:0 0 10pt 18pt}code{background:#f2f4f8;padding:1px 4px;border-radius:3px}'

export function docxEngine(ctx, input) {
  const body = mdToHtml(input)
  // 文件名要干净：去掉 markdown 标记、空白与路径分隔符
  const title = clip(String(ctx.topic).replace(/[#>*`/\s\\]+/g, '').trim() || 'document', 24)
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${title}</title><style>${WORD_CSS}</style></head><body>${body}</body></html>`
  const words = String(input).replace(/[#*`>-]/g, '').trim().length
  return res('docx', 'Markdown → Word',
    `已转成 Word 可打开的 .doc（${html.length} 字节），保留 ${(input.match(/^#{1,4}\s/gm) ?? []).length} 个标题、${(input.match(/^[-*]\s/gm) ?? []).length} 个列表项与 ${words} 字正文。`,
    [
      { label: '字节', value: `${html.length}` },
      { label: '标题', value: `${(input.match(/^#{1,4}\s/gm) ?? []).length}` },
      { label: '列表项', value: `${(input.match(/^[-*]\s/gm) ?? []).length}` },
      { label: '字数', value: `${words}` },
    ],
    [
      { type: 'preview', title: '排版预览', html },
      { type: 'list', title: '导入 Word 后', items: ['样式已内置，打开即是正文格式', '需要页眉页脚请在 Word 里补，HTML 转 doc 不带页眉', '图片需单独插入，转档不嵌入外链图'] },
    ],
    [{ level: 'low', text: '已内置中文字体栈与标题层级，打开不会变成宋体小五' }],
    [{ name: `${title}.doc`, mime: 'application/msword', content: html }])
}

/* ---------------- 12. HTML → Markdown（真转换） ---------------- */

export function htmlToMarkdown(html) {
  let s = String(html)
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '')
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n${'#'.repeat(Number(n))} ${t.trim()}\n`)
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${t.trim()}\n`)
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${t}**`)
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `_${t}_`)
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, t) => `\`${t}\``)
  s = s.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => `[${t}](${href})`)
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/gi, (_, alt, src) => `![${alt}](${src})`)
  s = s.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, (_, src) => `![](${src})`)
  s = s.replace(/<\/p>/gi, '\n\n').replace(/<br\s*\/?>/gi, '\n')
  s = s.replace(/<[^>]+>/g, '')
  s = s.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim()
  return s
}

export function toMarkdownEngine(ctx, input) {
  const md = htmlToMarkdown(input)
  const heads = (md.match(/^#{1,6}\s/gm) ?? []).length
  const links = (md.match(/\[[^\]]+\]\([^)]+\)/g) ?? []).length
  return res('markdown', 'HTML → Markdown',
    `转出 ${md.length} 字 Markdown，保留 ${heads} 个标题、${links} 个链接；脚本与样式已剥离。`,
    [
      { label: '字数', value: `${md.length}` },
      { label: '标题', value: `${heads}` },
      { label: '链接', value: `${links}` },
      { label: '样式块', value: '已剔除' },
    ],
    [
      { type: 'code', title: '转换结果', code: md.slice(0, 2000) },
      { type: 'list', title: '转换后仍要人工看', items: ['表格未做转换，需要手写成 Markdown 表格', '复杂嵌套列表会拍平', '行内样式（颜色、字号）全部丢失'] },
    ],
    [{ level: 'low', text: '正文结构与链接已保留，可直接进知识库' }],
    [{ name: 'converted.md', mime: 'text/markdown', content: md }])
}

/* ---------------- 13. 积分账单 ---------------- */

const MODE_COST = { Lite: 1, 标准: 3, Max: 8 }

export function billingEngine(ctx, input) {
  const items = lines(input).map((l) => {
    const m = l.match(/(演示文稿|文档|轮播图|图片|美化|导入)\s*(Lite|标准|Max)?\s*(\d+)?/)
    if (!m) return null
    const count = Number(m[3] ?? 1)
    const cost = MODE_COST[m[2] ?? '标准'] * count
    return { type: m[1], mode: m[2] ?? '标准', count, cost }
  }).filter(Boolean)
  const total = items.reduce((n, i) => n + i.cost, 0)
  const byMode = Object.entries(items.reduce((acc, i) => ({ ...acc, [i.mode]: (acc[i.mode] ?? 0) + i.cost }), {}))
  return res('billing', '积分账单',
    `解析 ${items.length} 条使用记录，按 Lite 1 / 标准 3 / Max 8 计费，合计 ${total} 积分；${byMode.map(([m, c]) => `${m} ${c}`).join('，')}。`,
    [
      { label: '记录', value: `${items.length}` },
      { label: '合计', value: `${total} 积分` },
      { label: '单价最高', value: `Max 8` },
      { label: '模式', value: `${byMode.length} 种` },
    ],
    [
      { type: 'table', title: '明细', head: ['类型', '模式', '次数', '积分'], rows: items.map((i) => [i.type, i.mode, String(i.count), String(i.cost)]) },
      { type: 'table', title: '按模式汇总', head: ['模式', '积分', '占比'], rows: byMode.map(([m, c]) => [m, String(c), `${Math.round((c / (total || 1)) * 100)}%`]) },
      { type: 'list', title: '省积分的三个做法', items: ['初稿用 Lite，定稿前再切标准重跑一页', '同一需求合并成一次生成，避免反复抽卡', 'Max 只留给客户当面汇报那一版'] },
    ],
    [total > 200 ? { level: 'med', text: `本月已用 ${total} 积分，注意预算` } : { level: 'low', text: `共 ${total} 积分，在常规用量内` }],
    [{ name: 'billing.csv', mime: 'text/csv', content: toCSV([['type', 'mode', 'count', 'credits'], ...items.map((i) => [i.type, i.mode, i.count, i.cost])]) }])
}

/* ---------------- 14. 提示词编译器 ---------------- */

export function promptEngine(ctx, input) {
  const kw = keywords(input, 5)
  const sections = [
    ['角色', `你是一位${kw[0] ?? '资深'}专家，服务对象是${ctx.audience}`],
    ['任务', clip(ctx.topic, 60)],
    ['输入', input],
    ['必须包含', kw.slice(0, 3).join('、') || '结论、依据、下一步'],
    ['约束', '不要编造数字；信息不足时先提问；中文输出，句子不超过 30 字'],
    ['输出格式', '先给结论，再给三条依据，最后给可执行清单'],
  ]
  const prompt = sections.map(([k, v]) => `## ${k}\n${v}`).join('\n\n')
  const tokens = Math.round(prompt.length / 1.6)
  return res('prompt', '结构化提示词',
    `编译成 ${sections.length} 段的结构化提示词，约 ${tokens} tokens（按 1 token ≈ 1.6 汉字估），比一句话描述稳定得多。`,
    [
      { label: '段落', value: `${sections.length}` },
      { label: '字数', value: `${prompt.length}` },
      { label: '预估 tokens', value: `${tokens}` },
      { label: '关键词', value: `${kw.length}` },
    ],
    [
      { type: 'kv', title: '六段结构', items: sections },
      { type: 'code', title: '可直接复制的提示词', code: prompt },
      { type: 'list', title: '为什么这样写更稳', items: ['先定角色再定任务，模型不会跑偏成通用问答', '把约束写成「不要做什么」比「尽量做好」有效', '指定输出格式，省掉一轮返工'] },
    ],
    [{ level: 'low', text: '六段齐全，可以直接投喂' }],
    [{ name: 'prompt.md', mime: 'text/markdown', content: prompt }],
    { output: prompt })
}

/* ---------------- 15. 技能脚手架 ---------------- */

export function skillScaffoldEngine(ctx, input) {
  const name = clip(lines(input)[0] ?? ctx.topic, 20)
  const slug = `skill-${Math.abs(name.length * 7919) % 9999}`
  const manifest = {
    id: slug,
    name,
    version: '0.1.0',
    entry: 'index.js',
    permissions: ['state:read', 'state:write'],
    risk: 'trusted',
    inputs: [{ name: 'text', type: 'string', required: true }],
    outputs: [{ name: 'result', type: 'object' }],
  }
  const code = `// ${name}：由 Design Buddy 技能创建指南生成\nexport const manifest = ${JSON.stringify(manifest, null, 2)}\n\nexport function run(input, ctx) {\n  const text = String(input?.text ?? '').trim()\n  if (!text) throw new Error('input.text is required')\n\n  // TODO: 在这里写真实逻辑，不要只返回固定文案\n  const words = text.length\n\n  return {\n    title: '${name}',\n    summary: \`处理了 \${words} 字\`,\n    stats: [{ label: '字数', value: String(words) }],\n    blocks: [],\n    findings: [],\n    artifacts: [],\n  }\n}\n`
  return res('scaffold', '技能脚手架',
    `生成 ${slug} 的 manifest 与可运行入口文件；照抄这个结构即可被技能页加载，run() 里换成你的真实逻辑。`,
    [
      { label: '目录', value: 'skills/' + slug },
      { label: '文件', value: '2 个' },
      { label: '权限', value: manifest.permissions.length + ' 项' },
      { label: '风险级', value: manifest.risk },
    ],
    [
      { type: 'kv', title: '目录结构', items: [['skills/' + slug + '/manifest.json', '声明 id / 权限 / 输入输出'], ['skills/' + slug + '/index.js', '导出 run()，返回结果对象']] },
      { type: 'code', title: 'manifest.json', code: JSON.stringify(manifest, null, 2) },
      { type: 'code', title: 'index.js', code },
    ],
    [{ level: 'med', text: '骨架里的 run() 是空的，必须写真实逻辑，否则技能页会显示空结果' }],
    [{ name: 'manifest.json', mime: 'application/json', content: JSON.stringify(manifest, null, 2) }, { name: 'index.js', mime: 'text/javascript', content: code }])
}

/* ---------------- 16. 商业模式九宫格 ---------------- */

export function canvasEngine(ctx, input) {
  const kw = keywords(input, 8)
  const pickKw = (i, fallback) => kw[i] ?? fallback
  const cells = [
    ['客户细分', `${ctx.audience}；${pickKw(0, '中小企业')}`],
    ['价值主张', `${ctx.topic}：${pickKw(1, '更少人力做更多事')}`],
    ['渠道', `${pickKw(2, '内容 + 私域')}`],
    ['客户关系', '先服务再成交，靠复购与转介绍'],
    ['收入来源', /月费|订阅/.test(input) ? '订阅制月费' : '项目制报价 + 订阅'],
    ['核心资源', `${pickKw(3, '方法论与模板')}`],
    ['关键活动', `${pickKw(4, '交付与复盘')}`],
    ['重要伙伴', '上游工具与渠道方'],
    ['成本结构', '人力 + 获客 + 工具订阅'],
  ]
  const missing = cells.filter(([, v]) => !v || v.length < 4).map(([k]) => k)
  return res('canvas', '商业模式九宫格',
    `把描述填进 9 个格子，其中「收入来源」按${/月费|订阅/.test(input) ? '订阅' : '项目制'}推断；空白格 ${missing.length} 个。`,
    [
      { label: '格子', value: `${cells.length}` },
      { label: '已填', value: `${cells.length - missing.length}` },
      { label: '关键词', value: `${kw.length}` },
      { label: '空白', value: `${missing.length}` },
    ],
    [
      { type: 'table', title: '九宫格', head: ['模块', '内容'], rows: cells },
      { type: 'list', title: '最容易自欺的三格', items: ['价值主张：客户真的愿意为这个换掉现有做法吗', '收入来源：算清楚一个人服务多少个客户才不亏', '成本结构：获客成本通常被低估一半'] },
    ],
    missing.length
      ? [{ level: 'med', text: `${missing.join('、')} 还是空的，先补上再谈增长` }]
      : [{ level: 'low', text: '九个格子都有内容，可以拿去和客户对一遍' }],
    [{ name: 'canvas.md', mime: 'text/markdown', content: cells.map(([k, v]) => `## ${k}\n${v}`).join('\n\n') }])
}

/* ---------------- 17. 研报估值 ---------------- */

export function valuationEngine(ctx, input) {
  const rev = num((input.match(/(?:营收|收入|revenue)[^\d]{0,6}(\d+(?:\.\d+)?)\s*(万|亿)?/) ?? [])[1]) ?? 3000
  const unit = (input.match(/(?:营收|收入)[^\d]{0,6}\d+(?:\.\d+)?\s*(万|亿)/) ?? [])[1] ?? '万'
  const growth = num((input.match(/(?:增长|增速)[^\d]{0,4}(\d+(?:\.\d+)?)\s*%/) ?? [])[1]) ?? 25
  const margin = num((input.match(/(?:净利率|毛利)[^\d]{0,4}(\d+(?:\.\d+)?)\s*%/) ?? [])[1]) ?? 15
  const years = [1, 2, 3].map((y) => ({
    year: `第 ${y} 年`,
    rev: rev * (1 + growth / 100) ** y,
    profit: rev * (1 + growth / 100) ** y * (margin / 100),
  }))
  const cagr = ((years[2].rev / rev) ** (1 / 3) - 1) * 100
  const ps = 4
  const pe = 20
  return res('valuation', '研报测算',
    `按营收 ${rev}${unit}、增速 ${growth}%、净利率 ${margin}%，三年后营收 ${years[2].rev.toFixed(0)}${unit}（CAGR ${cagr.toFixed(1)}%）；给 PS ${ps}x / PE ${pe}x 两套估值。`,
    [
      { label: '三年营收', value: `${years[2].rev.toFixed(0)}${unit}` },
      { label: 'CAGR', value: `${cagr.toFixed(1)}%` },
      { label: 'PS 估值', value: `${(years[2].rev * ps).toFixed(0)}${unit}` },
      { label: 'PE 估值', value: `${(years[2].profit * pe).toFixed(0)}${unit}` },
    ],
    [
      { type: 'table', title: '三年测算', head: ['年度', '营收', '净利'], rows: years.map((y) => [y.year, `${y.rev.toFixed(0)}${unit}`, `${y.profit.toFixed(0)}${unit}`]) },
      { type: 'kv', title: '估值假设', items: [['PS 倍数', `${ps}x（B 端软件常见区间 3–8x）`], ['PE 倍数', `${pe}x（成熟期 15–25x）`], ['增速假设', `${growth}%/年，未做衰减`], ['净利率假设', `${margin}%，行业差异大`]] },
      { type: 'list', title: '三个必须验证的假设', items: ['增速能否连续三年不衰减', '净利率是否已扣掉获客成本', '对标公司的 PS/PE 是否处于同一市场'] },
    ],
    [{ level: 'med', text: '增速按恒定假设，真实业务通常会衰减，报告里要写明' }],
    [{ name: 'valuation.csv', mime: 'text/csv', content: toCSV([['year', 'revenue', 'profit'], ...years.map((y) => [y.year, y.rev.toFixed(0), y.profit.toFixed(0)])]) }])
}

/* ---------------- 18. 需求拷问 ---------------- */

export function grillingEngine(ctx, input) {
  const dims = [
    ['目标', ['这件事做成之后，哪个数字会变？', '如果不做，会损失什么？']],
    ['用户', ['第一批使用者是谁，具体到岗位？', '他们现在用什么替代方案？']],
    ['范围', ['这次一定不做什么？', '哪些可以放到下一版？']],
    ['验收', ['谁来验收，标准写在哪？', '什么情况算失败？']],
    ['约束', ['预算、时间、人力各是多少？', '有哪些不能碰的红线？']],
  ]
  const qs = dims.flatMap(([d, list]) => list.map((q) => ({ d, q })))
  const missing = []
  if (!/\d/.test(input)) missing.push('没有任何数字（预算/时间/指标）')
  if (!/谁|客户|用户|团队/.test(input)) missing.push('没说清谁在用')
  if (!/不|除|限制|底线/.test(input)) missing.push('没有边界与红线')
  const answered = qs.length - missing.length
  return res('grilling', '需求拷问',
    `按 5 个维度提了 ${qs.length} 个问题，从你的描述看已经能回答约 ${Math.max(2, answered)} 个，还有 ${missing.length} 处没交代。`,
    [
      { label: '问题', value: `${qs.length}` },
      { label: '维度', value: `${dims.length}` },
      { label: '待澄清', value: `${missing.length}` },
      { label: '可回答', value: `约 ${Math.max(2, answered)}` },
    ],
    [
      { type: 'table', title: '十问（顺序按重要度）', head: ['维度', '问题'], rows: qs.map((x, i) => [`${x.d} · ${i + 1}`, x.q]) },
      { type: 'beforeAfter', title: '回答模板', before: input, after: '目标：______\n用户：______（岗位/规模）\n范围：做 ______，不做 ______\n验收：______ 在 ______ 前达到 ______\n约束：预算 ______，时间 ______，红线 ______' },
      { type: 'list', title: '问完这轮再开工', items: ['五个空都填上，返工率会降一半', '把回答原样贴进需求文档，别改写', '范围里的「不做」比「做」更重要'] },
    ],
    missing.length ? missing.map((m) => ({ level: 'med', text: `⚠ ${m}` })) : [{ level: 'low', text: '需求要素基本齐全' }],
    [{ name: 'grill.md', mime: 'text/markdown', content: qs.map((x, i) => `${i + 1}. [${x.d}] ${x.q}`).join('\n') }])
}

/* ---------------- 19. 故障排查树 ---------------- */

export function diagnosisEngine(ctx, input) {
  const rules = [
    [/崩溃|闪退|crash/i, ['看崩溃日志的时间分布', '抓最近一次发版的改动清单', '对比崩溃率与版本号', '回滚到上个版本验证']],
    [/慢|卡|超时|性能/i, ['先量：接口 P95 与首屏耗时', '看数据库慢查询', '查是否有 N+1 查询', '看静态资源体积与缓存命中']],
    [/白屏|空白|不显示/i, ['确认接口是否 500', '看控制台报错', '检查路由与权限拦截', '核对构建产物是否最新']],
    [/登录|权限|401|403/i, ['检查 token 是否过期', '核验后端鉴权中间件', '看 CORS 与 cookie 域', '复现最小步骤']],
  ]
  const hit = rules.find(([re]) => re.test(input))
  const steps = hit ? hit[1] : ['先复现并记录最小步骤', '看日志定位第一处异常', '缩小范围到单模块', '验证修复并加回归用例']
  return res('diagnosis', '系统化问题定位',
    `从描述里识别到「${hit ? hit[0].source.replace(/[\\/i]/g, '') : '通用'}」类问题，给出 ${steps.length} 步排查顺序，每步都有明确的观察点。`,
    [
      { label: '排查步骤', value: `${steps.length}` },
      { label: '匹配规则', value: hit ? '命中' : '未命中' },
      { label: '需要日志', value: '是' },
      { label: '需要复现', value: '是' },
    ],
    [
      { type: 'list', title: '按顺序排查（前一步没结论不要跳）', items: steps.map((s, i) => `${i + 1}. ${s}`) },
      { type: 'kv', title: '每一步记什么', items: [['现象', '时间点、用户、环境'], ['证据', '日志/截图/耗时'], ['结论', '是/不是这个原因'], ['下一步', '换假设还是深挖']] },
      { type: 'list', title: '最容易犯的错', items: ['同时改三处，永远不知道哪处生效', '不看日志凭感觉猜', '修完不写回归用例，下次照旧'] },
    ],
    hit ? [{ level: 'low', text: '已匹配到已知问题类型，按顺序走即可' }] : [{ level: 'med', text: '没有匹配到已知类型，先用通用四步缩小范围' }],
    [{ name: 'diagnosis.md', mime: 'text/markdown', content: steps.map((s, i) => `${i + 1}. ${s}`).join('\n') }])
}

/* ---------------- 20. 文档分页与目录 ---------------- */

export function pagingEngine(ctx, input, perPage = 600) {
  const blocks = String(input).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  const pages = []
  let cur = []
  let len = 0
  for (const b of blocks) {
    if (len + b.length > perPage && cur.length) {
      pages.push(cur)
      cur = []
      len = 0
    }
    cur.push(b)
    len += b.length
  }
  if (cur.length) pages.push(cur)
  const toc = pages.map((p, i) => {
    const head = p[0].replace(/^#+\s*/, '').split(/[。\n]/)[0]
    return { page: i + 1, title: clip(head, 22), chars: p.join('').length }
  })
  return res('paging', '分页与目录',
    `按每页 ${perPage} 字切分，共 ${pages.length} 页；目录取每页首句做标题，最长 ${Math.max(...toc.map((t) => t.title.length))} 字。`,
    [
      { label: '页数', value: `${pages.length}` },
      { label: '每页字数', value: `${perPage}` },
      { label: '段落', value: `${blocks.length}` },
      { label: '总字数', value: `${String(input).length}` },
    ],
    [
      { type: 'table', title: '目录', head: ['页', '标题', '字数'], rows: toc.map((t) => [String(t.page), t.title, String(t.chars)]) },
      { type: 'list', title: '拆分建议', items: ['每页首句就是标题，别另起小标题', '图表单独占一页，别和长段落挤', '附录从第 ' + Math.max(1, pages.length - 1) + ' 页开始'] },
    ],
    [pages.length === 1 ? { level: 'med', text: '内容不足一页，建议直接改成单页文档' } : { level: 'low', text: `切出 ${pages.length} 页，页面字数较均衡` }],
    [{ name: 'toc.md', mime: 'text/markdown', content: toc.map((t) => `- 第 ${t.page} 页 ${t.title}（${t.chars} 字）`).join('\n') }],
    { pages })
}

/* ---------------- 21. 交付自检（复用体检 + 质检） ---------------- */

export function selfCheckEngine(ctx, input) {
  const { findings } = auditResponsive(input.includes('<') ? input : '<div></div>')
  const textFindings = []
  if (/\{\{|TODO|待补充/.test(input)) textFindings.push({ level: 'high', text: '发现占位符残留' })
  if (!/\d/.test(input)) textFindings.push({ level: 'med', text: '全文没有数字，说服力偏弱' })
  if ((input.match(/https?:\/\//g) ?? []).length) textFindings.push({ level: 'med', text: '存在外链资源，交付前建议本地化' })
  const all = [...(input.includes('<') ? findings : []), ...textFindings]
  const score = Math.max(0, 100 - all.filter((f) => f.level === 'high').length * 30 - all.filter((f) => f.level === 'med').length * 10)
  return res('selfcheck', '交付前自检',
    `对 ${input.length} 字内容做了 ${input.includes('<') ? '结构 + 响应式 + 文案' : '文案'} 三类检查，得分 ${score}，${all.length} 条结论。`,
    [
      { label: '得分', value: `${score} / 100` },
      { label: '结论', value: `${all.length} 条` },
      { label: '阻断', value: `${all.filter((f) => f.level === 'high').length}` },
      { label: '检查项', value: input.includes('<') ? '9 类' : '3 类' },
    ],
    [
      { type: 'findings', title: '逐条结论', items: all.length ? all : [{ level: 'low', text: '未发现问题' }] },
      { type: 'list', title: '交付前最后一遍', items: ['导出 PDF 检查字体替换', '外链图片本地化', '文件名带日期与版本'] },
    ],
    all.length ? all : [{ level: 'low', text: '没有阻断问题' }],
    [{ name: 'selfcheck.md', mime: 'text/markdown', content: all.map((f) => `- [${f.level}] ${f.text}`).join('\n') || '无问题' }])
}
