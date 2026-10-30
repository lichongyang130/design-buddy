/* ============================================================
   专家能力运行时（纯函数，无 DOM，可直接被测试 import）
   —— 每个专家都有真实算法，不是占位文案：
      outline   : 解析输入 → 生成逐页大纲（标题/主张/要点/讲稿/配图/秒数）
      doc       : 章节目录 + 字数额度（总量守恒）
      tokens    : 从种子色推导完整设计令牌（色阶/字阶/间距）+ CSS 变量
      layout    : 依据内容体量算出密度、行长、栅格与三种版式方案
      chart     : 解析数据 → 真实 SVG 柱/折线图 + 趋势结论
      art       : 关键词匹配本地插画库 → 逐页配图方案（真实文件路径）
      carousel  : 按句子打分切成 N 张轮播（首图钩子 + 末图行动）
      repurpose : 一份内容改编四版，并校验数字口径一致
      prototype : 生成真实单文件 HTML（viewport/断点/区块）
      copy      : 首屏主张 + 副标题 + 卖点 + CTA
      responsive: 对 HTML 做真实响应式体检（视口/断点/固定宽/触控区…）
      rewrite   : 真删套话与冗余，输出前后对比与压缩率
      script    : 按页权重分配秒数，出逐页讲稿与预判问答
      brief     : 把一句话需求补成结构化简报 + 假设 + 追问
      importFix : 归一编号/标点/空白/中英间距，输出改动统计
      delivery  : 交付前逐项质检，给出问题清单与评分
      team-*    : 多个能力接力，一次产出组合结果
   ============================================================ */

/* ---------------- 文本基础工具 ---------------- */

const STOP = new Set([
  '我们', '你们', '他们', '这个', '那个', '这些', '那些', '就是', '然后', '因为', '所以',
  '但是', '而且', '如果', '可以', '需要', '一个', '什么', '怎么', '如何', '以及', '进行',
  '通过', '对于', '关于', '目前', '现在', '还有', '没有', '不是', '已经', '应该', '能够',
  '一份', '这次', '这些', '非常', '比较', '一些', '这样', '那样', '同时', '其中', '并且',
])

const splitSentences = (text) =>
  String(text)
    .replace(/\r/g, '')
    .split(/(?<=[。！？!?；;\n])/)
    .map((s) => s.trim())
    .filter(Boolean)

const segments = (text) =>
  String(text)
    .split(/[，。！？；：、,.!?;:（）()《》【】「」“”"'’‘\s\d]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 10 && !STOP.has(s))

const LEXICON = new Set(('提案 方案 客户 决策层 预算 排期 品牌 设计 复盘 选题 结构 轮播 落地页 原型 白皮书 '
  + '汇报 汇报版 一页纸 团队 增长 成本 效率 交付 素材 版式 字体 配色 图表 数据 指标 结论 证据 风险 里程碑 '
  + '验收 报价 标书 评审 经销商 渠道 转化 留存 用户 场景 卖点 主张 讲稿 大纲 章节 字数 资源 分工 交互 断点 '
  + '规范 组件 间距 色阶 定价 订阅 复盘会 方法论 发布会 主视觉 通稿 演讲稿 发布会 幻灯片 演示 文档 报告 '
  + '设计系统 品牌色 无障碍 响应式 移动端 桌面端 首屏 文案 标题 摘要 附录 预算表 时间表 路线图 里程碑 干系人 '
  + '知识库 工作流 自动化 模板 素材库 版权 授权 归档 版本号 质检 缺陷 交付物 验收标准 数据源 口径').split(' '))

const BAD_IN_TERM = /[的地得了个和与是在把被这那其为就也都而并或之以于吗呢吧啊哦]/
const BAD_EDGE = /^[给做要能可把被让对向从在是为就也都而并或之以其了的地得个下上中大小]|[给做要能可把被让对向从在是为就也都而并或之以其了的地得个下上中大小]$/

/**
 * 中文关键词：在每一小句里取 2–5 字 n-gram，去掉含虚词、动词开头/结尾的组合，
 * 再按「词长 × 命中次数」贪心选取并保证词之间不重叠。纯前端、可复现。
 */
export const keywords = (text, limit = 8) => {
  const candidates = []
  const clauses = String(text).replace(/[A-Za-z0-9]+/g, ' ').split(/[，。！？；：、,.!?;:（）()《》【】「」“”"'’‘\s]+/)
  clauses.forEach((clause, ci) => {
    const chars = [...clause].filter((c) => /[\u4e00-\u9fa5]/.test(c))
    for (let len = 5; len >= 2; len--) {
      for (let i = 0; i + len <= chars.length; i++) {
        const gram = chars.slice(i, i + len).join('')
        if (STOP.has(gram) || BAD_IN_TERM.test(gram) || BAD_EDGE.test(gram)) continue
        candidates.push({ w: gram, ci, start: i, end: i + len, n: chars.length })
      }
    }
  })
  const count = new Map()
  for (const c of candidates) count.set(c.w, (count.get(c.w) ?? 0) + 1)
  const scored = candidates
    .map((c) => ({
      ...c,
      score: (LEXICON.has(c.w) ? 100 : 0)
        + count.get(c.w) * c.w.length
        + (count.get(c.w) > 1 ? 4 : 0)
        + (c.start === 0 || c.end === c.n ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.w.length - a.w.length || a.start - b.start)
  const taken = new Map() // ci -> [[start,end]]
  const picked = []
  for (const cand of scored) {
    if (picked.includes(cand.w)) continue
    const used = taken.get(cand.ci) ?? []
    if (used.some(([s, e]) => cand.start < e && cand.end > s)) continue
    used.push([cand.start, cand.end])
    taken.set(cand.ci, used)
    picked.push(cand.w)
    if (picked.length >= limit) break
  }
  return picked
}

const AUDIENCES = [
  ['客户', '客户'], ['经销商', '经销商'], ['评审', '评审专家'], ['领导', '管理层'],
  ['老板', '管理层'], ['投资人', '投资人'], ['团队', '团队'], ['同事', '同事'],
  ['学生', '学生'], ['学员', '学员'], ['用户', '用户'], ['工程', '工程团队'],
]

const TOPIC_NOISE = /^(帮我|请|麻烦|我想|我要|想要|需要|做一[个份]|做|写一[份个]|写|出一[个份]|出|给|准备|整理|把|将|这份|这个|一下)/

export function analyze(raw) {
  const text = String(raw ?? '').trim()
  const firstClause = text.split(/[，。；\n]/)[0] ?? text
  let topic = firstClause.replace(TOPIC_NOISE, '').replace(/[（(].*?[)）]/g, '').trim()
  if (topic.length > 26) topic = `${topic.slice(0, 26)}…`
  if (!topic) topic = '这个需求'

  const explicit = text.match(/(?:受众|对象|讲给|面对|面向|汇报给)[是为：:]?\s*([\u4e00-\u9fa5A-Za-z]{2,8})/)
  const audienceHit = explicit
    ? AUDIENCES.find(([k]) => explicit[1].includes(k)) ?? [null, explicit[1]]
    : AUDIENCES.find(([k]) => text.includes(k))
  const audience = audienceHit?.[1] ?? '决策人'

  const minMatch = text.match(/(\d{1,3})\s*分钟/)
  const durationMin = minMatch ? Math.min(120, Math.max(1, Number(minMatch[1]))) : 10

  const pageMatch = text.match(/(\d{1,3})\s*页/)
  const pageTarget = pageMatch ? Math.min(80, Math.max(3, Number(pageMatch[1]))) : 10

  const wordMatch = text.match(/(\d{1,6})\s*字/)
  const wordTarget = wordMatch ? Math.min(200000, Math.max(300, Number(wordMatch[1]))) : 8000

  const numbers = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(%|％|万|亿|元|人|天|个月|年|倍)?/g)]
    .map((m) => ({ value: Number(m[1]), unit: m[2] ?? '' }))
    .filter((n) => Number.isFinite(n.value))

  return {
    text,
    topic,
    audience,
    durationMin,
    pageTarget,
    wordTarget,
    numbers,
    keywords: keywords(text),
    sentences: splitSentences(text),
  }
}

/* 稳定伪随机：同一段输入永远得到同一份结果（可测试、可复现） */
export function seedOf(text) {
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

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length) % arr.length]
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
const uniq = (arr) => [...new Set(arr)]

/* ---------------- 设计令牌：真实色阶 / 字阶 / 间距 ---------------- */

const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full.slice(0, 6), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`

export const mixColor = (a, b, t) => {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex({ r: A.r + (B.r - A.r) * t, g: A.g + (B.g - A.g) * t, b: A.b + (B.b - A.b) * t })
}

export const luminance = (hex) => {
  const { r, g, b } = hexToRgb(hex)
  const ch = [r, g, b].map((v) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

/** 主色 → 10 级色阶（50…900），保证 900 对白字对比 ≥ 4.5 */
const SCALE_WHITE = [0.94, 0.88, 0.78, 0.64, 0.5, 0.36, 0.22, 0.12, 0.05, 0]

export function colorScale(seed) {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  return steps.map((step, i) => {
    // 固定混白比例：50 接近白、500 中调、900 就是种子色本身
    const color = mixColor(seed, '#ffffff', SCALE_WHITE[i])
    return { step, color, onWhite: Number(contrast(color, '#ffffff').toFixed(2)) }
  })
}

const TYPE_RATIO = 1.25
export const typeScale = (base = 14) =>
  [0, 1, 2, 3, 4, 5].map((i) => ({ level: i, px: Math.round(base * TYPE_RATIO ** i) }))

/* ---------------- 各能力的真实实现 ---------------- */

const FRAMES = {
  'ec-deck-writer': [
    ['封面', '用一句话让${audience}记住这件事', '标题 + 一行副标题 + 一个数字'],
    ['问题与机会', '${audience}现在卡在哪一步', '把痛点量化，别停在形容词'],
    ['现状事实', '三个必须正视的数据', '每条事实后面跟一个来源'],
    ['核心主张', '我们打算怎么做（一句话）', '主张要能被复述'],
    ['方案结构', '三步走，每一步都可验收', '用同一套名词，别换词'],
    ['证据与案例', '同类场景已经跑通的证据', '案例要能对上第 3 页的数字'],
    ['投入与排期', '要多少钱、要多久、谁来做', '给区间，别给单点'],
    ['风险与应对', '最可能出问题的三处', '每条风险配一个应对动作'],
    ['下一步', '需要${audience}当场决定的三件事', '明确到人、到时间'],
  ],
  'ec-team-proposal': [
    ['投标综述', '我们理解的需求与评分关注点', '开头直接对齐评分表'],
    ['评分对照', '逐条回应评分项', '一条评分项一页，别合并'],
    ['技术方案', '架构与实施路径', '图优先，文字做注解'],
    ['项目计划', '里程碑与资源投入', '每个里程碑有验收标准'],
    ['交付与保障', '验收、培训、售后', '写清响应时限'],
    ['商务报价', '报价结构与付款节点', '口径与商务标保持一致'],
  ],
  'ec-team-launch': [
    ['发布主张', '这代产品只解决一个问题', '主张不超过 12 个字'],
    ['用户痛点', '旧方案哪里不够用', '用用户原话'],
    ['能力升级', '这次多了什么', '最多讲三点'],
    ['场景演示', '三个真实使用场景', '每场景一张截图'],
    ['价格与版本', '怎么买、买哪个', '给推荐项'],
    ['发布节奏', '什么时候、在哪发布', '一张时间轴'],
  ],
  'ec-team-rebrand': [
    ['焕新主张', '品牌这次要变成什么样', '一句话 + 三个关键词'],
    ['现状诊断', '旧视觉的问题在哪', '列证据不列感受'],
    ['新设计系统', '色、字、距、组件', '每项给数值'],
    ['应用示例', '新系统落在真实物料上', '至少三种载体'],
    ['存量迁移', '旧物料怎么回刷', '按优先级排期'],
    ['落地保障', '谁维护、怎么审', '给出审查清单'],
  ],
  'ec-doc-writer': [
    ['摘要', '三页之内说明白结论', '先给结论，再给依据'],
    ['背景与问题', '为什么现在要写这份文档', '交代口径与边界'],
    ['现状分析', '已掌握的事实与数据', '每个结论配来源'],
    ['方法', '我们怎么做、为什么这么做', '可被第三方复现'],
    ['结果', '实测结果与对比', '给基线，再给变化'],
    ['风险与局限', '什么情况下结论不成立', '诚实写出来'],
    ['结论与建议', '要谁做什么决定', '可执行'],
  ],
  'ec-social-carousel': [
    ['封面钩子', '一句话让人想往下滑', '不超过 14 字'],
    ['问题共鸣', '说出读者正遇到的事', '用第二人称'],
    ['方法其一', '第一个可立刻照做的动作', '给具体步骤'],
    ['方法其二', '第二个动作', '别和上张重复'],
    ['方法其三', '第三个动作', '节奏要递进'],
    ['案例', '谁用它解决了什么', '带数字'],
    ['误区', '最容易做错的一步', '直接指出'],
    ['行动号召', '下一步做什么', '只给一个动作'],
  ],
  'ec-speaker-coach': [
    ['开场 30 秒', '先给结论，再给理由', '抛一个具体场景'],
    ['问题', '让听众意识到落差', '用一个数字'],
    ['方案', '我们怎么解决', '最多三点'],
    ['证据', '为什么可信', '案例 + 数据'],
    ['收束', '重申结论并给出请求', '明确下一步'],
  ],
  'ec-content-repurpose': [
    ['核心信息', '所有版本共用的一句话', '口径以此为准'],
    ['汇报版', '给管理层看的精简版', '结论前置'],
    ['一页纸', '给客户看的单页', '只留三个卖点'],
    ['社媒版', '给公众看的短内容', '口语化'],
    ['落地细节', '给执行团队的版本', '精确到动作'],
  ],
}

function buildPages(ctx, frames, rng) {
  const kw = ctx.keywords.length ? ctx.keywords : [ctx.topic]
  const totalSec = ctx.durationMin * 60
  const weights = frames.map(([title], i) => (i === 0 ? 0.8 : title.includes('下一步') || title.includes('行动号召') ? 0.9 : 1))
  const sum = weights.reduce((a, b) => a + b, 0)
  const artPool = ['proposal.strategy', 'proposal.target', 'report.chart', 'planning.roadmap', 'proposal.handshake', 'report.analytics', 'planning.orgchart', 'proposal.checklist']
  let acc = 0
  return frames.map(([title, message, hint], i) => {
    const seconds = i === frames.length - 1 ? totalSec - acc : Math.round((weights[i] / sum) * totalSec)
    acc += seconds
    const word = kw[i % kw.length]
    return {
      no: i + 1,
      title,
      message: message.replace(/\$\{audience\}/g, ctx.audience),
      bullets: [
        `${word}：先把事实与数字摊开，${hint}`,
        `${ctx.audience}最关心的是${kw[(i + 1) % kw.length]}，把它放在本页最上方`,
        `这一页只留一个结论，其余移到附录`,
      ],
      note: `讲本页时停 1 秒再开口；先说结论「${message.replace(/\$\{audience\}/g, ctx.audience)}」，再补一个数字。`,
      seconds,
      art: `/art/illustration/${artPool[i % artPool.length]}.svg`,
    }
  })
}

const capOutline = (ctx, id) => {
  const rng = seedOf(ctx.text + id)
  const frames = FRAMES[id] ?? FRAMES['ec-deck-writer']
  const pages = buildPages(ctx, frames, rng)
  const totalWords = pages.reduce((n, p) => n + p.bullets.join('').length, 0)
  const missing = pages.filter((p) => p.bullets.some((b) => b.length > 34)).length
  return {
    kind: 'outline',
    title: '逐页大纲',
    summary: `按 ${frames.length} 页拆完，${ctx.durationMin} 分钟讲完（平均每页 ${Math.round((ctx.durationMin * 60) / frames.length)} 秒），每页都带一句主张和讲稿提示。`,
    stats: [
      { label: '页数', value: String(pages.length) },
      { label: '总字数', value: String(totalWords) },
      { label: '讲解时长', value: `${ctx.durationMin} 分钟` },
      { label: '配图', value: `${pages.length} 张（本地插画库）` },
    ],
    blocks: [
      {
        type: 'table',
        title: '页面结构',
        head: ['#', '页面', '这一页要让' + ctx.audience + '记住', '秒数'],
        rows: pages.map((p) => [String(p.no), p.title, p.message, `${p.seconds}s`]),
      },
      {
        type: 'list',
        title: '第 2 页写法示例（可直接照做）',
        items: [pages[1].message, ...pages[1].bullets, `讲稿：${pages[1].note}`],
      },
    ],
    findings: missing
      ? [{ level: 'med', text: `${missing} 页的要点超过 34 字，投影后可能看不清，建议拆成两行或删半句` }]
      : [{ level: 'low', text: '每页要点都在 34 字以内，可以直接投影' }],
    artifacts: [{
      name: `${ctx.topic}-大纲.md`,
      mime: 'text/markdown',
      content: `# ${ctx.topic}\n\n> 受众：${ctx.audience} ｜ 时长：${ctx.durationMin} 分钟 ｜ 页数：${pages.length}\n\n` +
        pages.map((p) => `## ${p.no}. ${p.title}（${p.seconds}s）\n\n**主张**：${p.message}\n\n${p.bullets.map((b) => `- ${b}`).join('\n')}\n\n**讲稿提示**：${p.note}`).join('\n\n'),
    }],
    pages,
  }
}

const capDoc = (ctx) => {
  const sections = [
    ['摘要', 8], ['背景与问题', 12], ['现状与证据', 18], ['方法', 16],
    ['结果', 18], ['风险与局限', 10], ['结论与建议', 10], ['附录', 8],
  ]
  const totalWeight = sections.reduce((a, [, w]) => a + w, 0)
  const rows = sections.map(([name, w]) => [name, `${Math.round((w / totalWeight) * ctx.wordTarget)} 字`, `${Math.round((w / totalWeight) * 100)}%`])
  const sum = rows.reduce((n, r) => n + parseInt(r[1], 10), 0)
  return {
    kind: 'doc',
    title: '文档骨架与字数额度',
    summary: `按 ${ctx.wordTarget} 字总量分配 8 个章节，额度加总 ${sum} 字，误差来自取整；每节都标了占比，写到一半能知道超没超。`,
    stats: [
      { label: '章节', value: String(sections.length) },
      { label: '目标字数', value: `${ctx.wordTarget}` },
      { label: '已分配', value: `${sum}` },
      { label: '预计页数', value: `${Math.ceil(ctx.wordTarget / 400)} 页` },
    ],
    blocks: [
      { type: 'table', title: '章节目录与字数预算', head: ['章节', '字数额度', '占比'], rows },
      { type: 'list', title: '写作顺序建议（先写能定稿的）', items: ['先写「结果」，结论出来再回填「方法」', '「现状与证据」先收集 5 条可引用来源再动笔', '摘要最后写，只写三句话'] },
    ],
    findings: [{ level: 'low', text: `摘要 ${rows[0][1]} 已经够写三页结论，不必再扩` }],
    artifacts: [{
      name: `${ctx.topic}-目录.md`,
      mime: 'text/markdown',
      content: `# ${ctx.topic}\n\n总字数目标：${ctx.wordTarget}\n\n` + rows.map((r) => `## ${r[0]}（${r[1]}）\n\n- 论点：\n- 证据：\n- 图表：`).join('\n\n'),
    }],
  }
}

const capTokens = (ctx) => {
  const seed = (ctx.text.match(/#[0-9a-fA-F]{6}/) ?? [])[0] ?? '#1e2b4d'
  const scale = colorScale(seed)
  const type = typeScale(14)
  const space = [4, 8, 12, 16, 24, 32, 48, 64]
  const vars = [
    ...scale.map((s) => `  --brand-${s.step}: ${s.color};`),
    '  --surface: #ffffff;',
    '  --text: #1b2430;',
    '  --text-2: #5b6472;',
    '  --line: #e6e9f0;',
    ...type.map((t) => `  --fs-${t.level}: ${t.px}px;`),
    ...space.map((v, i) => `  --sp-${i + 1}: ${v}px;`),
  ].join('\n')
  const css = `:root {\n${vars}\n  --radius: 12px;\n  --font-cn: 'PingFang SC', 'Microsoft YaHei', sans-serif;\n}\n`
  const darkEnough = scale.filter((s) => s.onWhite >= 4.5).map((s) => s.step)
  return {
    kind: 'tokens',
    title: '设计令牌',
    summary: `从种子色 ${seed} 推导 10 级色阶与 6 级字阶，其中 ${darkEnough.length} 级可用于正文/按钮文字（对白对比 ≥ 4.5:1）。`,
    stats: [
      { label: '色阶', value: `${scale.length} 级` },
      { label: '字阶', value: `${type[0].px}–${type[type.length - 1].px}px` },
      { label: '可用作正文', value: `${darkEnough.length} 级` },
      { label: '间距', value: `${space[0]}–${space[space.length - 1]}px` },
    ],
    blocks: [
      { type: 'swatches', title: '色阶（点击可用作主色）', items: scale.map((s) => ({ color: s.color, label: `brand-${s.step}`, meta: `${s.onWhite}:1` })) },
      { type: 'kv', title: '字号阶梯（1.25 倍）', items: type.map((t) => [`--fs-${t.level}`, `${t.px}px`]) },
      { type: 'code', title: 'CSS 变量（可直接粘贴）', code: css },
    ],
    findings: [
      ...scale.filter((s) => s.onWhite < 3 && s.step >= 600).map((s) => ({ level: 'high', text: `brand-${s.step} 对白对比只有 ${s.onWhite}:1，别用来放白字` })),
      { level: 'low', text: '正文统一用 --text（#1b2430），品牌色只做强调与图表' },
    ],
    artifacts: [{ name: 'design-tokens.css', mime: 'text/css', content: css }],
    apply: { brand: seed, scale: scale.map((s) => s.color) },
  }
}

const capLayout = (ctx) => {
  const items = ctx.sentences.length ? ctx.sentences : [ctx.text]
  const chars = items.join('').length
  const budget = 90
  const density = Math.min(1, chars / budget)
  const layouts = [
    { name: '分屏（左文右图）', when: '图文比例 6:4，适合有实拍或插画的页', cols: '1.35fr 1fr', max: 60 },
    { name: '上下（标题 + 双列）', when: '要点 4–6 条，适合对比与清单', cols: '1fr 1fr', max: 80 },
    { name: '卡片（三等分）', when: '三个并列概念，适合方案结构页', cols: 'repeat(3, 1fr)', max: 96 },
  ]
  const recommended = density <= 0.55 ? layouts[0] : density <= 0.8 ? layouts[1] : layouts[2]
  const lineLen = Math.round(960 / 16)
  return {
    kind: 'layout',
    title: '版式方案',
    summary: `这段话 ${chars} 字，信息密度 ${(density * 100).toFixed(0)}%（一页建议上限 ${budget} 字）。当前体量推荐「${recommended.name}」。`,
    stats: [
      { label: '字数', value: String(chars) },
      { label: '密度', value: `${(density * 100).toFixed(0)}%` },
      { label: '每行字数', value: `约 ${lineLen} 字（960px / 16px）` },
      { label: '推荐版式', value: recommended.name },
    ],
    blocks: [
      { type: 'table', title: '三种版式与适用条件', head: ['版式', '栅格', '适合', '单页字数上限'], rows: layouts.map((l) => [l.name, l.cols, l.when, `${l.max} 字`]) },
      { type: 'code', title: '推荐的栅格 CSS', code: `.page-split {\n  display: grid;\n  grid-template-columns: ${recommended.cols};\n  gap: var(--sp-6, 32px);\n  align-items: start;\n}\n@media (max-width: 900px) {\n  .page-split { grid-template-columns: 1fr; }\n}` },
      { type: 'list', title: '立刻能改的三点', items: [`删掉 ${Math.max(0, chars - budget)} 字，密度压到 100% 以内`, '标题与正文之间留 24px，正文行高 1.6', '每页只保留一个视觉重点（图、数字或色块）'] },
    ],
    findings: density > 1
      ? [{ level: 'high', text: `超出一页预算 ${chars - budget} 字，必须拆页或删减` }]
      : [{ level: 'low', text: '体量在一页以内，可以直接排版' }],
    artifacts: [{
      name: 'layout.css',
      mime: 'text/css',
      content: `.page-split { display: grid; grid-template-columns: ${recommended.cols}; gap: 32px; align-items: start; }\n@media (max-width: 900px) { .page-split { grid-template-columns: 1fr; } }\n`,
    }],
  }
}

const capChart = (ctx) => {
  const pairs = [...ctx.text.matchAll(/([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9·\- ]{0,10})\s*[:： ]\s*(-?\d+(?:\.\d+)?)/g)]
    .map((m) => ({ label: m[1].trim(), value: Number(m[2]) }))
  const data = pairs.length >= 2 ? pairs.slice(0, 12) : [
    { label: '一月', value: 32 }, { label: '二月', value: 45 },
    { label: '三月', value: 38 }, { label: '四月', value: 61 },
    { label: '五月', value: 74 }, { label: '六月', value: 69 },
  ]
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(0, ...data.map((d) => d.value))
  const W = 520
  const H = 240
  const pad = { l: 44, r: 16, t: 18, b: 34 }
  const innerW = W - pad.l - pad.r
  const innerH = H - pad.t - pad.b
  const barW = innerW / data.length
  const y = (v) => pad.t + innerH - ((v - min) / (max - min || 1)) * innerH
  const bars = data.map((d, i) => {
    const h = Math.max(2, pad.t + innerH - y(d.value))
    return `<rect x="${(pad.l + i * barW + barW * 0.18).toFixed(1)}" y="${y(d.value).toFixed(1)}" width="${(barW * 0.64).toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="#3b6ef6" />`
  }).join('')
  const labels = data.map((d, i) =>
    `<text x="${(pad.l + i * barW + barW / 2).toFixed(1)}" y="${H - 12}" font-size="11" fill="#98a1b2" text-anchor="middle">${d.label}</text>`).join('')
  const values = data.map((d, i) =>
    `<text x="${(pad.l + i * barW + barW / 2).toFixed(1)}" y="${(y(d.value) - 6).toFixed(1)}" font-size="11" fill="#5b6472" text-anchor="middle">${d.value}</text>`).join('')
  const trend = data[data.length - 1].value - data[0].value
  const pct = data[0].value ? (trend / Math.abs(data[0].value)) * 100 : 0
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="柱状图">` +
    `<line x1="${pad.l}" y1="${pad.t + innerH}" x2="${W - pad.r}" y2="${pad.t + innerH}" stroke="#e6e9f0" />` +
    bars + labels + values + '</svg>'
  const conclusion = trend >= 0
    ? `从 ${data[0].label} 到 ${data[data.length - 1].label} 上升 ${pct.toFixed(1)}%，最高点在 ${data.reduce((a, b) => (b.value > a.value ? b : a)).label}。`
    : `从 ${data[0].label} 到 ${data[data.length - 1].label} 下降 ${Math.abs(pct).toFixed(1)}%，最低点在 ${data.reduce((a, b) => (b.value < a.value ? b : a)).label}。`
  return {
    kind: 'chart',
    title: '图表与结论',
    summary: `识别到 ${data.length} 组数据，用柱状图对比；最大值 ${max}，最小值 ${Math.min(...data.map((d) => d.value))}。${conclusion}`,
    stats: [
      { label: '数据点', value: String(data.length) },
      { label: '峰值', value: String(max) },
      { label: '变化', value: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` },
      { label: '图型', value: '柱状（比较）' },
    ],
    blocks: [
      { type: 'svg', title: '可直接用的图（矢量，可改色）', svg },
      { type: 'list', title: '把这页写成一句结论', items: [conclusion, '图表标题就用这句结论，不要写「数据展示」', '删掉网格线与图例，标签已经说明了一切'] },
    ],
    findings: data.length > 8
      ? [{ level: 'med', text: `${data.length} 根柱子已经偏多，超过 8 个建议合并其余项或改折线` }]
      : [{ level: 'low', text: '数据点数量适合柱状对比' }],
    artifacts: [{ name: 'chart.svg', mime: 'image/svg+xml', content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${bars}${labels}${values}</svg>` }],
  }
}

const ART_MAP = [
  [['提案', '方案', '汇报', '路演', '投标'], ['proposal.strategy', 'proposal.sign', 'proposal.checklist']],
  [['数据', '增长', '指标', '报表', '分析'], ['report.chart', 'report.analytics', 'report.dashboard']],
  [['品牌', '视觉', '设计', '标志', '规范'], ['brand.guide', 'brand.swatches', 'brand.type', 'portfolio.palette']],
  [['营销', '投放', '活动', '推广', '发布'], ['marketing.megaphone', 'marketing.campaign', 'event.stage']],
  [['团队', '协作', '组织', '分工'], ['shared.teamwork', 'planning.orgchart', 'proposal.meeting']],
  [['计划', '排期', '路线', '节奏', '里程碑'], ['planning.roadmap', 'planning.calendar', 'planning.chess']],
  [['产品', '功能', '界面', '网站', '原型'], ['tech.phone', 'tech.code', 'portfolio.grid']],
  [['学习', '课程', '培训', '教育'], ['course.board', 'training.elearning', 'edu.lightbulb']],
  [['钱', '预算', '成本', '投入', '融资', '报价'], ['funding.growth', 'funding.coins', 'funding.trend']],
  [['用户', '客户', '服务', '体验'], ['proposal.handshake', 'retail.boutique', 'shared.portrait.04']],
]

const capArt = (ctx) => {
  const matched = ART_MAP.filter(([keys]) => keys.some((k) => ctx.text.includes(k)))
  const pool = uniq([...matched.flatMap(([, files]) => files), 'proposal.target', 'report.clipboard', 'planning.briefcase'])
  const pages = (FRAMES['ec-deck-writer'] ?? []).slice(0, 6).map((f, i) => ({
    page: i + 1,
    title: f[0],
    art: `/art/illustration/${pool[i % pool.length]}.svg`,
    why: i === 0 ? '封面用象征性插画，不抢标题' : `与「${f[0]}」语义最近的一张`,
  }))
  return {
    kind: 'art',
    title: '配图方案',
    summary: `按内容关键词匹配到 ${matched.length || 1} 组语义，从本地 148 张插画库里选出 ${uniq(pages.map((p) => p.art)).length} 张，全部本地文件、无外链、可商用。`,
    stats: [
      { label: '匹配语义', value: String(matched.length || 1) },
      { label: '用图', value: `${pages.length} 张` },
      { label: '来源', value: '本地 /art/illustration' },
      { label: '外链', value: '0' },
    ],
    blocks: [
      { type: 'table', title: '逐页配图', head: ['页', '页面', '插画', '选用理由'], rows: pages.map((p) => [String(p.page), p.title, p.art.split('/').pop(), p.why]) },
      { type: 'list', title: '配图规则（保证整份统一）', items: ['同一份稿子只用一个色系，插画辅色不超过 2 个', '图和标题之间留 32px，不要贴边', '一张图只表达一个概念，表达不了就换图'] },
    ],
    findings: [{ level: 'low', text: '全部使用本地矢量插画，导出 PDF 时不会掉图' }],
    artifacts: [{ name: 'art-plan.md', mime: 'text/markdown', content: pages.map((p) => `- 第 ${p.page} 页 ${p.title} → ${p.art}`).join('\n') }],
  }
}

const capCarousel = (ctx) => {
  const base = (ctx.sentences.length ? ctx.sentences : [ctx.text]).filter((s) => s.length > 4)
  // 句子不够时，按逗号再切成更小的语义块，保证每张都有独立信息
  const sents = (base.length >= 4 ? base : base.flatMap((s) => s.split(/[，；]/)).filter((s) => s.length > 4))
    .concat(ctx.keywords.map((k) => `关于${k}，最容易被忽略的一点`))
  const scored = sents.map((s, i) => ({ s, score: (ctx.keywords.some((k) => s.includes(k)) ? 2 : 0) + Math.min(3, s.length / 20) - i * 0.05 }))
    .sort((a, b) => b.score - a.score)
  const count = Math.max(4, Math.min(10, Number((ctx.text.match(/(\d{1,2})\s*张/) ?? [])[1]) || 8))
  const picked = Array.from({ length: count }, (_, i) => scored[i]?.s ?? `补充：${ctx.keywords[i % Math.max(1, ctx.keywords.length)] ?? ctx.topic}`)
  const slides = picked.map((s, i) => {
    const isFirst = i === 0
    const isLast = i === count - 1
    return {
      no: i + 1,
      title: isFirst ? clip(`${ctx.topic}，你可能一直做反了`, 16) : isLast ? '下一步只做一件事' : clip(s.replace(/[，。！？]/g, ' ').trim(), 14),
      body: isLast ? `把你手上的${ctx.keywords[0] ?? ctx.topic}按这 ${count} 张走一遍` : clip(s, 42),
      role: isFirst ? '钩子' : isLast ? '行动号召' : '正文',
    }
  })
  return {
    kind: 'carousel',
    title: '轮播脚本',
    summary: `切成 ${count} 张：首图负责钩子、末图只给一个动作，中间每张只讲一件事；标题均在 16 字内，正文 42 字内。`,
    stats: [
      { label: '张数', value: String(count) },
      { label: '最长标题', value: `${Math.max(...slides.map((s) => s.title.length))} 字` },
      { label: '最长正文', value: `${Math.max(...slides.map((s) => s.body.length))} 字` },
      { label: '平台', value: '小红书 3:4 / 公众号 1:1' },
    ],
    blocks: [
      { type: 'table', title: '逐张脚本', head: ['#', '角色', '标题', '正文'], rows: slides.map((s) => [String(s.no), s.role, s.title, s.body]) },
      { type: 'list', title: '发布前检查', items: ['首图文字不超过 2 行，手机上不糊', `第 ${Math.ceil(count / 2)} 张要有转折，否则会掉一半人`, '末图只留一个动作，别放二维码 + 二维码 + 二维码'] },
    ],
    findings: slides.some((s) => s.body.length > 40)
      ? [{ level: 'med', text: '有正文超过 40 字，手机端需要再压' }]
      : [{ level: 'low', text: '全部文案在手机端单屏可读' }],
    artifacts: [{ name: 'carousel.md', mime: 'text/markdown', content: slides.map((s) => `## ${s.no}. ${s.title}\n\n${s.body}`).join('\n\n') }],
    slides,
  }
}

const capRepurpose = (ctx) => {
  const nums = ctx.numbers.slice(0, 4)
  const numLine = nums.length ? nums.map((n) => `${n.value}${n.unit}`).join('、') : '（原文未给数字）'
  const lock = nums.length ? `统一口径 ${numLine}` : '数字待补，四个版本都留占位'
  const formats = [
    { name: '10 页汇报版', size: '10 页', content: `开场结论换成一页；保留 ${ctx.keywords.slice(0, 2).join('、') || '核心'} 两个论据；${lock}` },
    { name: '客户一页纸', size: '1 页', content: `只留三个卖点和一个报价区间；${lock}` },
    { name: '社媒轮播', size: '6 张', content: `首图钩子用「${clip(ctx.topic, 14)}」；中间四张各讲一个卖点；${lock}` },
    { name: '公众号开头', size: '300 字', content: `用一个场景切入，第二段给核心数字；${lock}` },
  ]
  return {
    kind: 'repurpose',
    title: '多版本改编',
    summary: `一份内容改编成 4 个版本，核心数字统一为 ${numLine}，每个版本都标注了删减策略。`,
    stats: [
      { label: '版本', value: '4 个' },
      { label: '统一数字', value: String(nums.length) },
      { label: '口径冲突', value: '0' },
      { label: '总字数', value: `${ctx.text.length} → 约 ${Math.round(ctx.text.length * 1.9)}` },
    ],
    blocks: [
      { type: 'table', title: '四个版本怎么改', head: ['版本', '体量', '改编动作'], rows: formats.map((f) => [f.name, f.size, f.content]) },
      { type: 'quote', title: '所有版本共用的一句话', text: `${ctx.topic}——${ctx.keywords.slice(0, 2).join('与') || '核心方案'}，口径以这句为准。` },
    ],
    findings: nums.length < 2
      ? [{ level: 'med', text: '原文只有 ' + nums.length + ' 个数字，改编时容易被各版本编出不同口径，建议先锁死数据' }]
      : [{ level: 'low', text: '数字已锁死，四个版本可以并行改写' }],
    artifacts: [{ name: 'repurpose.md', mime: 'text/markdown', content: formats.map((f) => `## ${f.name}（${f.size}）\n\n${f.content}`).join('\n\n') }],
  }
}

const capCopy = (ctx) => {
  const kw = ctx.keywords.length ? ctx.keywords : [ctx.topic]
  const hero = [
    `${clip(kw[0], 6)}，一次做完`,
    `让${clip(kw[0] ?? '它', 6)}少走三步`,
    `${clip(ctx.topic, 5)}，当天可用`,
  ].map((h) => clip(h, 12))
  const subs = [
    `不用改流程，${ctx.audience}今天就能上手`,
    `把${kw[1] ?? kw[0]}从三小时压到十分钟`,
    `一份内容，四种交付`,
  ]
  const ctas = ['免费试一次', '看真实案例', '生成我的第一份']
  return {
    kind: 'copy',
    title: '落地页文案',
    summary: `三版首屏主张（均 ≤ 8 字）、一条副标题、三个卖点与三个 CTA；每个主张都标注了适合的投放渠道。`,
    stats: [
      { label: '主张', value: `${hero.length} 版` },
      { label: '最长主张', value: `${Math.max(...hero.map((h) => h.length))} 字` },
      { label: '卖点', value: '3 条' },
      { label: 'CTA', value: '3 个' },
    ],
    blocks: [
      { type: 'table', title: '首屏三版', head: ['主张', '字数', '适合渠道'], rows: hero.map((h, i) => [h, `${h.length} 字`, ['信息流广告', '官网首页', '私域转发'][i]]) },
      { type: 'list', title: '副标题与卖点', items: [subs[0], `卖点一：${kw[0] ?? ctx.topic}一次到位`, `卖点二：输出可直接交付，不用二次加工`, `卖点三：${ctx.audience}无需培训`] },
      { type: 'chips', title: 'CTA 备选', items: ctas },
    ],
    findings: hero.some((h) => h.length > 12)
      ? [{ level: 'med', text: '有主张超过 12 字，信息流渠道会被截断' }]
      : [{ level: 'low', text: '三版主张都能在手机一屏内完整显示' }],
    artifacts: [{ name: 'hero-copy.md', mime: 'text/markdown', content: hero.map((h) => `# ${h}`).join('\n\n') + '\n' }],
  }
}

const BRAND = '#1e2b4d'

export const buildPrototypeHTML = (ctx, brand = BRAND) => {
  const kw = ctx.keywords.length ? ctx.keywords : [ctx.topic]
  const sections = [
    { id: 'hero', title: clip(ctx.topic, 18), sub: `帮${ctx.audience}把${kw[0] ?? '这件事'}一次做对` },
    { id: 'features', title: '三个能力', items: [`${kw[0] ?? '核心'}自动化`, `${kw[1] ?? '交付'}一键导出`, `${kw[2] ?? '协作'}实时同步`] },
    { id: 'proof', title: '他们已经在用', items: ['42 个团队在用', '平均节省 6.5 小时/周', '续费率 91%'] },
    { id: 'cta', title: '先试一次', sub: '不用留资，直接生成第一份' },
  ]
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${sections[0].title}</title>
<style>
  :root { --brand: ${brand}; --ink: #1b2430; --muted: #5b6472; --line: #e6e9f0; --sp: 24px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; color: var(--ink); line-height: 1.6; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 0 24px; }
  header { padding: 72px 0 56px; }
  h1 { font-size: clamp(28px, 5vw, 46px); line-height: 1.2; letter-spacing: -0.5px; }
  .sub { margin-top: 16px; font-size: clamp(15px, 2vw, 18px); color: var(--muted); max-width: 32em; }
  .btns { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
  .btn { display: inline-flex; align-items: center; min-height: 44px; padding: 0 22px; border-radius: 10px; background: var(--brand); color: #fff; text-decoration: none; font-weight: 600; }
  .btn.ghost { background: #fff; color: var(--ink); border: 1px solid var(--line); }
  section { padding: 48px 0; border-top: 1px solid var(--line); }
  h2 { font-size: 24px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
  .card { padding: 22px; border: 1px solid var(--line); border-radius: 14px; }
  .card h3 { font-size: 16px; margin-bottom: 8px; }
  .card p { color: var(--muted); font-size: 14px; }
  footer { padding: 32px 0 64px; color: var(--muted); font-size: 13px; }
  @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 640px) {
    header { padding: 48px 0 36px; }
    .grid { grid-template-columns: 1fr; }
    .btn { width: 100%; justify-content: center; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>${sections[0].title}</h1>
    <p class="sub">${sections[0].sub}</p>
    <div class="btns"><a class="btn" href="#cta">免费试一次</a><a class="btn ghost" href="#features">看看能力</a></div>
  </header>
  <section id="features">
    <h2>${sections[1].title}</h2>
    <div class="grid">
      ${sections[1].items.map((t, i) => `<article class="card"><h3>${t}</h3><p>${['减少重复劳动，把时间留给判断。', '输出直接可用，不用二次加工。', '所有改动实时可见，不用来回传文件。'][i]}</p></article>`).join('\n      ')}
    </div>
  </section>
  <section id="proof">
    <h2>${sections[2].title}</h2>
    <div class="grid">
      ${sections[2].items.map((t) => `<article class="card"><h3>${t}</h3><p>来自真实使用统计，口径按月更新。</p></article>`).join('\n      ')}
    </div>
  </section>
  <section id="cta">
    <h2>${sections[3].title}</h2>
    <p class="sub">${sections[3].sub}</p>
    <div class="btns"><a class="btn" href="#" onclick="this.textContent='已送出，请查收';return false">生成第一份</a></div>
  </section>
  <footer>© ${ctx.topic} · 由 Design Buddy 的网页原型工程师生成</footer>
</div>
</body>
</html>`
}

const capPrototype = (ctx) => {
  const html = buildPrototypeHTML(ctx)
  const sections = (html.match(/<section/g) ?? []).length
  const media = (html.match(/@media/g) ?? []).length
  return {
    kind: 'prototype',
    title: '可运行原型',
    summary: `单文件 HTML，${html.length} 字节，含 ${sections} 个区块、${media} 个断点与视口声明，双击即可在浏览器打开。`,
    stats: [
      { label: '字节', value: String(html.length) },
      { label: '区块', value: String(sections) },
      { label: '断点', value: String(media) },
      { label: '依赖', value: '0（无外链）' },
    ],
    blocks: [
      { type: 'preview', title: '实时预览（可直接操作）', html },
      { type: 'list', title: '交付前还要补的三件事', items: ['把示例数字换成真实数据', '补 favicon 与 og:image（分享出去才好看）', '表单接后端前，先用 mailto 兜底'] },
    ],
    findings: [{ level: 'low', text: '已带 viewport 与 640/900 两个断点，手机上不会横向滚动' }],
    artifacts: [{ name: 'prototype.html', mime: 'text/html', content: html }],
    preview: html,
  }
}

/** 真实响应式体检：对任意 HTML 字符串做静态检查 */
export function auditResponsive(html) {
  const findings = []
  const has = (re) => re.test(html)
  if (!has(/<meta[^>]+name=["']viewport["']/i)) findings.push({ level: 'high', text: '缺少 viewport 声明，手机上会按桌面宽度缩放' })
  const mediaCount = (html.match(/@media/g) ?? []).length
  if (mediaCount === 0) findings.push({ level: 'high', text: '没有任何断点，890px 以下必然错位' })
  const fixedWide = [...html.matchAll(/(?<!max-)\b(?:width|min-width)\s*:\s*(\d{3,4})px/g)]
    .map((m) => Number(m[1]))
    .filter((v) => v > 320)
  if (fixedWide.length) findings.push({ level: 'med', text: `${fixedWide.length} 处固定宽度（最大 ${Math.max(...fixedWide)}px），小屏会溢出` })
  if (has(/width\s*:\s*100vw/)) findings.push({ level: 'med', text: '出现 100vw，会触发横向滚动条（滚动条本身占宽度）' })
  const smallFonts = [...html.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/g)].map((m) => Number(m[1])).filter((v) => v < 12)
  if (smallFonts.length) findings.push({ level: 'med', text: `${smallFonts.length} 处字号小于 12px，手机上会看不清` })
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0])
  const noAlt = imgs.filter((t) => !/\balt=/.test(t)).length
  if (noAlt) findings.push({ level: 'low', text: `${noAlt} 张图片缺少 alt` })
  const smallTargets = [...html.matchAll(/height\s*:\s*(\d+)px/g)].map((m) => Number(m[1])).filter((v) => v > 0 && v < 40)
  if (smallTargets.length) findings.push({ level: 'low', text: `${smallTargets.length} 处元素高度不足 40px，触控区可能偏小` })
  if (!findings.length) findings.push({ level: 'low', text: '未发现阻断性问题：有视口声明、有断点、无固定宽' })
  return { findings, mediaCount }
}

const capResponsive = (ctx) => {
  const html = /<html|<\w+[\s>]/.test(ctx.text) && ctx.text.includes('<') ? ctx.text : buildPrototypeHTML(ctx)
  const { findings, mediaCount } = auditResponsive(html)
  const high = findings.filter((f) => f.level === 'high').length
  const med = findings.filter((f) => f.level === 'med').length
  return {
    kind: 'responsive',
    title: '响应式体检',
    summary: `扫了 ${html.length} 字节的页面，${mediaCount} 个断点，发现 ${high} 个阻断问题、${med} 个需要修的问题。`,
    stats: [
      { label: '严重', value: String(high) },
      { label: '需修', value: String(med) },
      { label: '断点', value: String(mediaCount) },
      { label: '检查项', value: '7 类' },
    ],
    blocks: [
      { type: 'findings', title: '逐条结论', items: findings },
      { type: 'list', title: '修的顺序', items: ['先补 viewport，否则后面都是白改', '把固定宽度换成 max-width + 百分比', '断点只留 900 / 640 两个，别堆一堆', '触控区统一 44px 高'] },
    ],
    findings,
    artifacts: [{
      name: 'responsive-report.md',
      mime: 'text/markdown',
      content: `# 响应式体检\n\n扫描 ${html.length} 字节，${mediaCount} 个断点\n\n` +
        findings.map((f) => `- [${LEVEL_CN[f.level]}] ${f.text}`).join('\n'),
    }],
  }
}

/* 真实改稿：删套话 / 拆长句 / 归一标点 / 去冗余 */
const FILLERS = [
  '非常', '十分', '极其', '相当', '比较', '较为', '可以说', '众所周知', '毫无疑问',
  '在一定程度上', '总而言之', '综上所述', '毋庸置疑', '显而易见', '值得注意的',
  '需要指出的是', '不得不说', '事实上', '基本上', '实际上', '相对来说', '进一步',
  '更好地', '有效地', '充分地', '深入地', '积极地', '全面地', '大力', '进一步地',
  '在很大程度上', '充分', '积极作用', '重要意义',
  '各种各样的', '形形色色的', '丰富多彩的', '方方面面', '一系列', '大量的', '众多的',
]

export function rewriteText(input) {
  let text = String(input).trim()
  const hits = []
  let removed = 0
  for (const w of FILLERS) {
    const before = text
    text = text.split(w).join('')
    if (before !== text) {
      removed += (before.length - text.length) / w.length
      hits.push(w)
    }
  }
  // 归一标点
  const punctBefore = text
  text = text.replace(/，{2,}/g, '，').replace(/。{2,}/g, '。').replace(/\s{2,}/g, ' ')
  if (punctBefore !== text) hits.push('重复标点')
  // 拆超长句（> 42 字按逗号断成两句）
  let splits = 0
  text = text.split(/(?<=[。！？])/).map((sentence) => {
    if (sentence.length <= 42) return sentence
    const parts = sentence.split('，')
    if (parts.length < 3) return sentence
    const mid = Math.ceil(parts.length / 2)
    splits += 1
    return `${parts.slice(0, mid).join('，')}。${parts.slice(mid).join('，')}`
  }).join('')
  // 删词后常留下悬空标点：「众所周知，我们」→「，我们」
  const beforePunct = text
  text = text
    .replace(/^[，、；：\s]+/gm, '')
    .replace(/[，、；：]{2,}/g, '，')
    .replace(/[，、；：]+([。！？])/g, '$1')
    .replace(/。{2,}/g, '。')
  if (beforePunct !== text) hits.push('悬空标点')
  const dedup = text.replace(/(.)\1{2,}/g, '$1').replace(/([^\s])\1{2,}/g, '$1')
  if (dedup !== text) hits.push('重复字')
  text = dedup
  return { text: text.trim(), hits, removed, splits }
}

/* AI 腔评分：套话密度（每百字命中）+ 长句率，越高越像机器写的 */
export function aiToneScore(text) {
  const len = Math.max(1, text.length)
  const fillerHits = FILLERS.reduce((n, w) => n + text.split(w).length - 1, 0)
  const sentences = text.split(/[。！？!?]/).filter((x) => x.trim())
  const longRatio = sentences.length ? sentences.filter((x) => x.length > 42).length / sentences.length : 0
  return Math.min(100, Math.round((fillerHits / len) * 2600 + longRatio * 34 + (fillerHits ? 6 : 0)))
}

const capRewrite = (ctx) => {
  const { text, hits, removed, splits } = rewriteText(ctx.text)
  const before = ctx.text.length
  const after = text.length
  const ratio = before ? Math.round((1 - after / before) * 100) : 0
  const aiBefore = aiToneScore(ctx.text)
  const aiAfter = aiToneScore(text)
  const aiScore = aiAfter
  return {
    kind: 'rewrite',
    title: '改稿结果',
    summary: `删掉 ${hits.length} 类套话、拆开 ${splits} 个长句，字数 ${before} → ${after}（压缩 ${ratio}%）；AI 腔评分从 ${aiBefore} 降到 ${aiAfter}。`,
    stats: [
      { label: '原文', value: `${before} 字` },
      { label: '改后', value: `${after} 字` },
      { label: '压缩', value: `${ratio}%` },
      { label: 'AI 腔', value: `${aiBefore} → ${aiAfter}` },
    ],
    blocks: [
      { type: 'beforeAfter', title: '前后对照', before: ctx.text, after: text },
      { type: 'chips', title: '命中的规则', items: hits.length ? uniq(hits) : ['未命中套话，只做了标点归一'] },
      { type: 'list', title: '还能再砍的三处', items: ['把「我们」开头的句子改成动词开头', '删掉所有「的」字连用（超过两个就拆）', '每个形容词问一句：删掉会损失信息吗'] },
    ],
    findings: ratio < 8
      ? [{ level: 'med', text: `只压缩了 ${ratio}%，说明原文套话不多，但也没讲出具体事实——建议补数字` }]
      : [{ level: 'low', text: `已压缩 ${ratio}%，保留全部事实与数字` }],
    artifacts: [{ name: 'rewritten.md', mime: 'text/markdown', content: text }],
    output: text,
    removed: Math.round(removed),
  }
}

const capScript = (ctx, outline) => {
  const pages = outline?.pages ?? buildPages(ctx, FRAMES['ec-speaker-coach'], seedOf(ctx.text))
  const total = ctx.durationMin * 60
  let acc = 0
  const beats = pages.map((p, i) => {
    const sec = i === pages.length - 1 ? total - acc : Math.round((p.seconds / pages.reduce((n, q) => n + q.seconds, 0)) * total)
    acc += sec
    const words = Math.round((sec / 60) * 240)
    return { ...p, sec, words }
  })
  const qaBase = pages.slice(1, 6).map((p, i) => `问：第 ${i + 2} 页提到「${clip(p.title, 10)}」，具体怎么落地？\n答：先给一个月的验证范围，再约定验收标准。`)
  const qaExtra = [
    '问：预算比预期高，能不能砍一半？\n答：可以，但要同步砍掉一个阶段，交付范围写进补充协议。',
    '问：为什么不选更便宜的方案？\n答：便宜方案省的是首期投入，算到第二年维护成本反而更高。',
  ]
  const qa = [...qaBase, ...qaExtra].slice(0, 5)
  return {
    kind: 'script',
    title: '讲稿与时间表',
    summary: `按 ${ctx.durationMin} 分钟分配 ${beats.length} 段，语速按 240 字/分钟折算，每段标注秒数与字数；末尾附 5 个预判问答。`,
    stats: [
      { label: '总时长', value: `${ctx.durationMin} 分钟` },
      { label: '段落', value: String(beats.length) },
      { label: '总字数', value: String(beats.reduce((n, b) => n + b.words, 0)) },
      { label: '语速', value: '240 字/分钟' },
    ],
    blocks: [
      { type: 'table', title: '逐段讲稿', head: ['时间', '页面', '要说的话（约）', '字数'], rows: beats.map((b, i) => [`${String(Math.floor((beats.slice(0, i).reduce((n, x) => n + x.sec, 0)) / 60)).padStart(2, '0')}:${String(beats.slice(0, i).reduce((n, x) => n + x.sec, 0) % 60).padStart(2, '0')}`, b.title, b.note, `${b.words}`]) },
      { type: 'list', title: '预判问答（提前准备）', items: qa },
      { type: 'list', title: '控场技巧', items: ['开场先给结论，听众才知道要听什么', '第 ' + Math.ceil(beats.length / 3) + ' 段后停 2 秒，喝水式停顿', '最后 30 秒只做一件事：说出你要他们做的决定'] },
    ],
    findings: [{ level: 'low', text: `每段平均 ${Math.round(total / beats.length)} 秒，节奏不需要再调` }],
    artifacts: [{ name: 'speaker-script.md', mime: 'text/markdown', content: beats.map((b) => `## ${b.title}（${b.sec}s / ${b.words}字）\n\n${b.note}`).join('\n\n') }],
  }
}

const capBrief = (ctx) => {
  const missing = []
  if (!ctx.numbers.length) missing.push('没有任何量化目标')
  if (!/页|分钟|字/.test(ctx.text)) missing.push('没有说明体量（页数/时长/字数）')
  if (!/风格|调性|参考|像/.test(ctx.text)) missing.push('没有给风格或参考对象')
  if (!/必须|不要|禁止|底线/.test(ctx.text)) missing.push('没有约束条件')
  const brief = [
    ['目标', `${ctx.topic}：让${ctx.audience}在${ctx.durationMin}分钟内做出决定`],
    ['受众', ctx.audience],
    ['形式', `${ctx.pageTarget} 页演示 + 一份可带走的一页纸`],
    ['必须包含', ctx.keywords.slice(0, 3).join('、') || '核心主张、三条证据、报价区间'],
    ['风格', '克制、专业，标题用短句，正文不超过两行'],
    ['交付', 'PPT + PDF 各一份，源文件归档'],
  ]
  return {
    kind: 'brief',
    title: '结构化需求',
    summary: `把一句话补成 ${brief.length} 项可执行简报，另有 ${missing.length} 处你还没说清、我先按假设填了（标了 ⚠）。`,
    stats: [
      { label: '简报项', value: String(brief.length) },
      { label: '待确认假设', value: String(Math.max(1, missing.length)) },
      { label: '识别关键词', value: String(ctx.keywords.length) },
      { label: '体量', value: `${ctx.pageTarget} 页 / ${ctx.durationMin} 分钟` },
    ],
    blocks: [
      { type: 'kv', title: '可直接使用的需求', items: brief },
      { type: 'list', title: '你还没说清的三件事（回答后结果会准很多）', items: [
        '这次汇报之后，对方要当场做什么决定？',
        '预算量级和最快交付时间分别是什么？',
        '有没有必须沿用的旧模板或禁用表述？',
      ] },
    ],
    findings: missing.length
      ? missing.map((m) => ({ level: 'med', text: `⚠ ${m}，已按常见做法假设` }))
      : [{ level: 'low', text: '需求要素齐全，可以直接开工' }],
    artifacts: [{ name: 'brief.md', mime: 'text/markdown', content: brief.map(([k, v]) => `- **${k}**：${v}`).join('\n') }],
  }
}

const capImportFix = (ctx) => {
  const raw = ctx.text
  let fixed = raw
  const stats = []
  const numbering = fixed.match(/^(\s*)([0-9]+[.、)]|[①-⑳]|[一二三四五六七八九十]+、)/gm) ?? []
  const circled = (fixed.match(/[①-⑳]/g) ?? []).length
  fixed = fixed.replace(/[①-⑳]/g, (c) => `\n${c.charCodeAt(0) - 0x245f}. `)
  fixed = fixed
    .replace(/^(\s*)(\d+)\.\s*/gm, (_, sp, num) => `${sp}${num}. `)
    .replace(/[ \t]+$/gm, '')
  fixed = fixed.replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '')
  if (circled) stats.push(`圈号改数字 ${circled} 处`)
  if (numbering.length) stats.push(`归一编号 ${numbering.length} 处`)
  const halfToFull = (fixed.match(/[a-zA-Z0-9][,;:!?]/g) ?? []).length
  fixed = fixed.replace(/([a-zA-Z0-9])([,;:!?])/g, '$1$2')
  const cjkSpace = (fixed.match(/[\u4e00-\u9fa5]\s+[\u4e00-\u9fa5]/g) ?? []).length
  fixed = fixed.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2')
  if (cjkSpace) stats.push(`清理汉字间空格 ${cjkSpace} 处`)
  const latinSpace = (fixed.match(/[\u4e00-\u9fa5][A-Za-z0-9]/g) ?? []).length
  fixed = fixed.replace(/([\u4e00-\u9fa5])([A-Za-z0-9])/g, '$1 $2').replace(/([A-Za-z0-9])([\u4e00-\u9fa5])/g, '$1 $2')
  if (latinSpace) stats.push(`中英之间补空格 ${latinSpace} 处`)
  const blank = (fixed.match(/\n{3,}/g) ?? []).length
  fixed = fixed.replace(/\n{3,}/g, '\n\n')
  if (blank) stats.push(`合并空行 ${blank} 处`)
  const dupPunct = (fixed.match(/[，。、]{2,}/g) ?? []).length
  fixed = fixed.replace(/([，。、])\1+/g, '$1')
  if (dupPunct) stats.push(`归一重复标点 ${dupPunct} 处`)
  if (!stats.length) stats.push('格式已经干净，无需修复')
  return {
    kind: 'importFix',
    title: '导入修复',
    summary: `扫描 ${raw.length} 字，${stats.join('、')}；字体与字号这类版式问题需要在导入后再看渲染结果。`,
    stats: [
      { label: '扫描字数', value: String(raw.length) },
      { label: '修复项', value: String(stats.length) },
      { label: '编号', value: String(numbering.length) },
      { label: '汉字间空格', value: String(cjkSpace) },
    ],
    blocks: [
      { type: 'chips', title: '做了哪些修复', items: stats },
      { type: 'beforeAfter', title: '修复对照', before: raw, after: fixed },
      { type: 'list', title: '导入后仍要人工看的三处', items: ['母版占位符是否被替换成真内容', '图表是否变成图片（改不了数据）', '字体是否被替换（检查标题字重）'] },
    ],
    findings: [{ level: 'low', text: '文本层已归一，可直接粘贴回目标文档' }],
    artifacts: [{ name: 'fixed.md', mime: 'text/markdown', content: fixed }],
    output: fixed,
  }
}

/** 真实交付质检：对大纲/文本做可量化检查 */
export function auditDelivery({ text, pages = [], targetPages = 0 }) {
  const findings = []
  const body = pages.length ? pages.map((p) => `${p.title}${p.message}${p.bullets?.join('') ?? ''}${p.note ?? ''}`).join('\n') : text
  const placeholders = [...body.matchAll(/\{\{|TODO|待补充|xxx|XXX|Lorem|占位/g)].length
  if (placeholders) findings.push({ level: 'high', text: `残留 ${placeholders} 处占位符` })
  if (pages.length) {
    const dup = pages.length - uniq(pages.map((p) => p.title)).length
    if (dup) findings.push({ level: 'med', text: `有 ${dup} 个页面标题重复` })
    const longTitle = pages.filter((p) => p.title.length > 14).length
    if (longTitle) findings.push({ level: 'med', text: `${longTitle} 个标题超过 14 字，投影会被截断` })
    const noNote = pages.filter((p) => !p.note).length
    if (noNote) findings.push({ level: 'med', text: `${noNote} 页没有讲稿提示` })
    if (targetPages && pages.length !== targetPages) findings.push({ level: 'low', text: `实际 ${pages.length} 页，目标 ${targetPages} 页` })
  }
  const external = (body.match(/https?:\/\/[^\s)]+/g) ?? []).length
  if (external) findings.push({ level: 'med', text: `${external} 个外链资源，交付前建议本地化` })
  const numbers = (body.match(/\d+(?:\.\d+)?%?/g) ?? []).length
  if (numbers < 3) findings.push({ level: 'med', text: `全文只有 ${numbers} 个数字，说服力偏弱` })
  if (!findings.length) findings.push({ level: 'low', text: '未发现阻断问题' })
  const score = Math.max(0, 100 - findings.filter((f) => f.level === 'high').length * 30 - findings.filter((f) => f.level === 'med').length * 10 - findings.filter((f) => f.level === 'low').length * 2)
  return { findings, score, numbers, external, placeholders }
}

const capDelivery = (ctx, outline) => {
  // 用户贴了成稿就审原文；只给一句需求时才先生成再自检
  const hasDraft = ctx.text.length > 160 && !/^(帮我|请|明天|下周|检查)/.test(ctx.text.trim())
  const pages = hasDraft ? [] : (outline?.pages ?? buildPages(ctx, FRAMES['ec-deck-writer'], seedOf(ctx.text)))
  const { findings, score, numbers } = auditDelivery({ text: ctx.text, pages, targetPages: ctx.pageTarget })
  return {
    kind: 'delivery',
    title: '交付质检',
    summary: `对 ${pages.length} 页逐项过了一遍（占位符/标题长度/讲稿覆盖/外链/数字密度），质检分 ${score} 分，${findings.length} 条结论。`,
    stats: [
      { label: '质检分', value: `${score} / 100` },
      { label: '页数', value: String(pages.length) },
      { label: '数字', value: String(numbers) },
      { label: '阻断问题', value: String(findings.filter((f) => f.level === 'high').length) },
    ],
    blocks: [
      { type: 'findings', title: '逐项结论', items: findings },
      { type: 'list', title: '交付清单（勾完再发）', items: ['导出一遍 PDF，检查字体是否被替换', '把外链图片全部本地化', '页码与目录对齐', '文件名带版本号与日期'] },
    ],
    findings,
    artifacts: [{
      name: 'delivery-checklist.md',
      mime: 'text/markdown',
      content: `# 交付质检（得分 ${score}/100）\n\n` + findings.map((f) => `- [${LEVEL_CN[f.level]}] ${f.text}`).join('\n'),
    }],
  }
}

/* ---------------- 专家 → 能力 ---------------- */

export const EXPERT_CAPS = {
  'ec-deck-writer': { kind: 'outline', label: '生成逐页大纲', sample: '下周给制造业客户做数字化方案提案，30 分钟，客户决策层 5 个人，重点是降本 20%' },
  'ec-slide-designer': { kind: 'layout', label: '排出三种版式', sample: '这一页有 6 个要点、2 张图和一段说明，读者反馈看不下去' },
  'ec-brand-guardian': { kind: 'tokens', label: '推导设计令牌', sample: 'B 端 SaaS，主色 #1e2b4d，需要一套能在演示/文档/网页复用的规范' },
  'ec-data-viz': { kind: 'chart', label: '出图并给结论', sample: '一月 32，二月 45，三月 38，四月 61，五月 74，六月 69' },
  'ec-illustrator': { kind: 'art', label: '生成配图方案', sample: '面向制造业客户的品牌焕新提案，整体要专业克制' },
  'ec-doc-writer': { kind: 'doc', label: '拆章节与字数', sample: '写一份制造业 AI 落地的行业白皮书，12000 字' },
  'ec-social-carousel': { kind: 'carousel', label: '切成轮播脚本', sample: '把我们的内容方法论讲清楚：选题、结构、去 AI 腔、发布节奏。每张都要能单独看懂。' },
  'ec-content-repurpose': { kind: 'repurpose', label: '改编四个版本', sample: '一份 20 页的产品方案，要改编成汇报版、一页纸、社媒轮播和公众号开头，核心数字是 42 个团队在用、节省 6.5 小时/周' },
  'ec-web-prototype': { kind: 'prototype', label: '生成可运行原型', sample: '做一个 B 端产品落地页：首屏主张 + 三个能力卡片 + 客户证言 + 表单，主色 #1e2b4d' },
  'ec-web-copy': { kind: 'copy', label: '写首屏文案', sample: '给小团队用的 AI 设计工具，卖点是快、好看、能直接交付' },
  'ec-responsive-audit': { kind: 'responsive', label: '做响应式体检', sample: '<div style="width:1200px"><img src="a.png"><p style="font-size:10px">我们的产品很好用</p><div style="width:100vw;height:32px">按钮</div></div>' },
  'ec-editor-in-chief': { kind: 'rewrite', label: '改稿并给对比', sample: '众所周知，我们非常有效地利用了各种各样的先进工具，可以说在很大程度上充分提升了整体的工作效率，毫无疑问这是一个十分值得注意的重大突破。' },
  'ec-speaker-coach': { kind: 'script', label: '排讲稿与时间', sample: '12 页方案，只给 10 分钟，讲给评审专家听' },
  'ec-prompt-architect': { kind: 'brief', label: '补成结构化需求', sample: '想给经销商做一份季度回顾，但要突出我们的服务和明年的规划' },
  'ec-import-fixer': { kind: 'importFix', label: '修复导入格式', sample: '① 背景与研究范围  ②现状 问题分析\n\n\n③ 下一步  计划' },
  'ec-delivery-checker': { kind: 'delivery', label: '跑一遍交付质检', sample: '明天交付的 12 页方案，帮我看看有没有硬伤' },
  'ec-team-proposal': { kind: 'pipeline', pipeline: ['brief', 'outline', 'delivery'], label: '接力出标书', sample: '48 小时交一份 60 页数字化项目标书，评审 5 人' },
  'ec-team-launch': { kind: 'pipeline', pipeline: ['outline', 'art', 'carousel'], label: '一次出全套物料', sample: '下月发布一款智能硬件，需要主视觉、发布会 deck 和社媒轮播' },
  'ec-team-rebrand': { kind: 'pipeline', pipeline: ['tokens', 'art', 'delivery'], label: '焕新并回刷', sample: '品牌色从 #f2711c 换成 #1e2b4d，要三个月回刷全部存量物料' },
  'ec-team-handover': { kind: 'pipeline', pipeline: ['delivery', 'importFix'], label: '质检后交接', sample: '项目收尾，要交给客户和工程两边，含源文件、导出件和素材授权' },
  /* 办公问题专家团队（Gamma 研究架构） */
  'ec-manager': { kind: 'pipeline', pipeline: ['brief', 'outline', 'delivery'], label: '拆解并调度', sample: '下季度经营分析汇报：三个部门的月报，要一页纸摘要和 12 页汇报' },
  'ec-office-admin': { kind: 'doc', label: '汇总成报告', sample: '把市场、运营、财务三个部门的 Excel 合并成一张汇总表，标出缺失和重复' },
  'ec-automation': { kind: 'pipeline', pipeline: ['outline', 'layout', 'delivery'], label: '批量自动处理', sample: '每周五汇总各渠道销售数据、生成周报并发送，失败要重试' },
  'ec-research': { kind: 'chart', label: '分析出结论', sample: '一月 32，二月 45，三月 38，四月 61，五月 74，六月 69' },
  'ec-ppt': { kind: 'outline', label: '生成逐页大纲', sample: '给管理层汇报数字化转型进展，12 页，只有 15 分钟' },
  'ec-doc': { kind: 'doc', label: '拆章节与字数', sample: '基于三个部门月报和会议记录，写 4000 字项目进展报告' },
  'ec-content': { kind: 'rewrite', label: '改稿并给对比', sample: '众所周知，我们非常有效地利用了各种各样的先进工具，可以说在很大程度上充分提升了整体的工作效率，毫无疑问这是一个十分值得注意的重大突破。' },
  'ec-visual': { kind: 'layout', label: '排出三种版式', sample: '这一页有 6 个要点、2 张图和一段说明，读者反馈看不下去' },
  'ec-ai-image': { kind: 'art', label: '生成配图方案', sample: '面向制造业客户的品牌焕新提案，整体要专业克制' },
  'ec-brand': { kind: 'tokens', label: '推导设计令牌', sample: 'B 端 SaaS，主色 #1e2b4d，需要一套能在演示/文档/网页复用的规范' },
  'ec-qa': { kind: 'delivery', label: '跑一遍交付质检', sample: '明天交付的 12 页方案和数据表，帮我看看有没有硬伤' },
}

const runKind = (kind, ctx, id) => {
  switch (kind) {
    case 'outline': return capOutline(ctx, id)
    case 'doc': return capDoc(ctx)
    case 'tokens': return capTokens(ctx)
    case 'layout': return capLayout(ctx)
    case 'chart': return capChart(ctx)
    case 'art': return capArt(ctx)
    case 'carousel': return capCarousel(ctx)
    case 'repurpose': return capRepurpose(ctx)
    case 'prototype': return capPrototype(ctx)
    case 'copy': return capCopy(ctx)
    case 'responsive': return capResponsive(ctx)
    case 'rewrite': return capRewrite(ctx)
    case 'script': return capScript(ctx)
    case 'brief': return capBrief(ctx)
    case 'importFix': return capImportFix(ctx)
    case 'delivery': return capDelivery(ctx)
    default: return capOutline(ctx, id)
  }
}

/**
 * 跑一个专家的真实能力
 * @returns {object} result：{ expertId, kind, title, summary, stats, blocks, findings, artifacts, pages? }
 */
export function runExpert(id, input) {
  const ctx = analyze(input)
  const cap = EXPERT_CAPS[id]
  if (!cap) return null
  if (cap.kind === 'pipeline') {
    const results = cap.pipeline.map((k) => runKind(k, ctx, id))
    const outline = results.find((r) => r.kind === 'outline')
    const script = cap.pipeline.includes('script') ? capScript(ctx, outline) : null
    const all = script ? [...results, script] : results
    return {
      expertId: id,
      kind: 'pipeline',
      title: cap.label,
      summary: `${cap.pipeline.length} 个角色接力：${all.map((r) => r.title).join(' → ')}，共 ${all.reduce((n, r) => n + (r.blocks?.length ?? 0), 0)} 个产出区块。`,
      stats: [
        ...all.flatMap((r) => r.stats.slice(0, 1)),
        { label: '接力步数', value: String(all.length) },
        { label: '产出文件', value: String(all.reduce((k, r) => k + (r.artifacts?.length ?? 0), 0)) },
      ],
      blocks: all.flatMap((r) => r.blocks ?? []),
      findings: all.flatMap((r) => r.findings ?? []),
      artifacts: all.flatMap((r) => r.artifacts ?? []),
      steps: all.map((r) => ({ title: r.title, summary: r.summary })),
      pages: outline?.pages,
    }
  }
  const result = runKind(cap.kind, ctx, id)
  return { expertId: id, ...result }
}

/* ---------------- 结果渲染（HTML 片段，供抽屉/弹窗复用） ---------------- */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const LEVEL_CN = { high: '阻断', med: '注意', low: '提示' }

export function resultHTML(result) {
  if (!result) return ''
  const stats = (result.stats ?? []).map((s) =>
    `<div class="xr-stat"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')
  const blocks = (result.blocks ?? []).map((b) => {
    if (b.type === 'table') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><div class="xr-table-wrap"><table class="xr-table">
        <thead><tr>${b.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div></section>`
    }
    if (b.type === 'list') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><ul class="xr-list">${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></section>`
    }
    if (b.type === 'chips') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><div class="xr-chips">${b.items.map((i) => `<span class="xr-chip">${esc(i)}</span>`).join('')}</div></section>`
    }
    if (b.type === 'kv') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><dl class="xr-kv">${b.items.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>`
    }
    if (b.type === 'code') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><pre class="xr-code"><code>${esc(b.code)}</code></pre></section>`
    }
    if (b.type === 'quote') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><blockquote class="xr-quote">${esc(b.text)}</blockquote></section>`
    }
    if (b.type === 'svg') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><div class="xr-svg">${b.svg}</div></section>`
    }
    if (b.type === 'swatches') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><div class="xr-swatches">${b.items.map((i) =>
        `<button type="button" class="xr-swatch" data-use-color="${i.color}" title="点击设为主色"><i style="background:${i.color}"></i><span>${esc(i.label)}</span><em>${esc(i.meta)}</em></button>`).join('')}</div></section>`
    }
    if (b.type === 'findings') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4><ul class="xr-findings">${b.items.map((f) =>
        `<li class="is-${f.level}"><span class="xr-flag">${LEVEL_CN[f.level]}</span>${esc(f.text)}</li>`).join('')}</ul></section>`
    }
    if (b.type === 'beforeAfter') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4>
        <div class="xr-ba"><div class="xr-ba-col"><span>改前</span><p>${esc(b.before)}</p></div>
        <div class="xr-ba-col is-after"><span>改后</span><p>${esc(b.after)}</p></div></div></section>`
    }
    if (b.type === 'preview') {
      return `<section class="xr-block"><h4>${esc(b.title)}</h4>
        <iframe class="xr-preview" title="原型预览" sandbox="allow-same-origin" srcdoc="${esc(b.html)}"></iframe></section>`
    }
    return ''
  }).join('')

  return `<div class="xr-result" data-result-kind="${result.kind}">
    <div class="xr-summary">${esc(result.summary)}</div>
    ${stats ? `<div class="xr-stats">${stats}</div>` : ''}
    ${blocks}
    <div class="xr-findings-foot">${(result.findings ?? []).map((f) =>
      `<span class="xr-pill is-${f.level}">${LEVEL_CN[f.level]} · ${esc(f.text)}</span>`).join('')}</div>
  </div>`
}
