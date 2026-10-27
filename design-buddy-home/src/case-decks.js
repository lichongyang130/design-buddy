/* ============================================================
   DesignBuddy 商业级演示文稿案例
   4 个完整案例，每个 15 页，满足商业版视觉/内容/编辑/交付标准
   ============================================================ */

import {
  FRAMEWORKS, PALETTES, FONT_PAIRS, mulberry32, hashStr,
  catLabel, fwLabel, gridLabel, buildDeck,
} from './template-engine.js'

/* ---------------- 案例定义 ---------------- */

export const CASE_DECKS = [
  /* ========== 案例 1：科技未来感产品发布会 ========== */
  {
    id: 'tech-launch',
    name: '科技未来感产品发布会',
    subtitle: '面向客户与投资人，15 页，科技未来感',
    cat: '融资演讲稿',
    format: '演示文稿',
    fw: 16,  // 赛博霓虹框架
    pal: 4,  // 暗色模式 + 紫粉强调
    font: 1,
    pageCount: 15,
    imgCount: 12,
    cover: { eyebrow: 'PRODUCT LAUNCH · 2026', title: '重新定义未来', sub: 'NEXT GENERATION' },
    pages: [
      { layout: 'cover' },
      { layout: 'agenda', title: '发布会议程', items: ['市场机遇', '产品方案', '核心技术', '商业增长', '融资计划', '行动规划'] },
      { layout: 'divider', no: 1, title: '市场机遇', sub: '一个正在增长的市场' },
      { layout: 'stats', title: '千亿级市场正在形成', stats: [
        { v: '¥8,200亿', l: '2026 市场规模' },
        { v: '23.4%', l: '年复合增长率' },
        { v: '4.2亿', l: '目标用户群体' },
        { v: '68%', l: '渗透率提升空间' },
      ], body: 'AI 驱动的下一代交互范式正在重塑人与信息的关系，消费级市场窗口期已至。' },
      { layout: 'hero', eyebrow: 'MARKET OPPORTUNITY', title: '为什么是现在', body: '生成式 AI 将内容创作门槛降至历史最低，但专业级商业演示仍面临效率与品质的双重瓶颈。' },
      { layout: 'divider', no: 2, title: '产品方案', sub: '从想法到落地的完整闭环' },
      { layout: 'split', eyebrow: '12 栏编辑网格', title: '一体化工作台', body0: '从需求输入到编辑、预览、交付，全部在一个工作区内完成。', body1: '支持多文件理解、智能图表、逐页精细编辑与品牌设计系统。' },
      { layout: 'timeline', title: '产品研发历程', steps: ['需求调研', '原型验证', '内测迭代', '公开测试', '正式上线', '持续优化'] },
      { layout: 'divider', no: 3, title: '核心技术', sub: '让每一页都经得起推敲' },
      { layout: 'big-stat', eyebrow: 'TECH EDGE', stat: '99.2%', sub: '内容生成准确率', body: '基于自研的多专家协作引擎，内容策划、视觉设计、数据校验同步进行。' },
      { layout: 'comparison', title: '技术能力对比', leftTitle: '传统工具', rightTitle: 'DesignBuddy',
        left: ['模板填充，缺乏逻辑', '手动排版，耗时费力', '视觉风格难以统一'],
        right: ['AI 叙事，逻辑自洽', '自动布局，秒级生成', '专业视觉系统，一键切换'] },
      { layout: 'divider', no: 4, title: '商业增长', sub: '让增长可以衡量' },
      { layout: 'stats', title: '关键增长指标', stats: [
        { v: '50,000+', l: '注册用户' },
        { v: '12,000+', l: '付费客户' },
        { v: '¥3,200万', l: '年度营收' },
        { v: '92%', l: '客户续费率' },
      ], body: '从免费体验到付费转化，从个人创作到团队协作，增长飞轮已全面启动。' },
      { layout: 'closing', title: '谢谢观看', sub: '让每一次表达都成为产品设计' },
    ],
  },

  /* ========== 案例 2：极简商务商业计划书 ========== */
  {
    id: 'business-plan',
    name: '极简商务商业计划书',
    subtitle: '面向投资人与管理层，15 页，极简商务',
    cat: '商业规划',
    format: '演示文稿',
    fw: 1,  // 极简留白体系
    pal: 0,  // 暖白 + 深蓝绿
    font: 1,
    pageCount: 15,
    imgCount: 12,
    cover: { eyebrow: 'BUSINESS PLAN · 2026', title: '商业计划书', sub: 'BUSINESS PLAN 2026' },
    pages: [
      { layout: 'cover' },
      { layout: 'agenda', title: '目录', items: ['项目概述', '市场分析', '商业模式', '财务预测', '团队介绍', '融资需求'] },
      { layout: 'divider', no: 1, title: '项目概述', sub: '用一句话说清楚你在做什么' },
      { layout: 'hero', eyebrow: 'PROJECT OVERVIEW', title: '让商业演示像产品设计一样精准', body: 'DesignBuddy 是一个 AI 驱动的商业演示设计与制作工作台，帮助企业和个人快速生成专业级演示文稿。' },
      { layout: 'split', eyebrow: '8 栏秩序网格', title: '核心价值主张', body0: '从内容策划到视觉设计到演讲交付，全流程 AI 辅助。', body1: '用户只需提供主题、文件或想法，即可获得可直接使用的完整演示文稿。' },
      { layout: 'divider', no: 2, title: '市场分析', sub: '用数据支撑每一个判断' },
      { layout: 'stats', title: '目标市场规模', stats: [
        { v: '¥1,500亿', l: '全球演示市场' },
        { v: '35%', l: 'AI 渗透率' },
        { v: '¥580亿', l: '可服务市场' },
        { v: '18%', l: '年增长率' },
      ], body: '全球超过 5 亿职场人士需要制作演示文稿，其中 72% 认为现有工具效率不足。' },
      { layout: 'comparison', title: '竞争格局分析', leftTitle: '现有方案', rightTitle: 'DesignBuddy',
        left: ['模板堆砌，品质不稳定', '编辑能力有限', '导出格式单一'],
        right: ['AI 生成，品质可控', '逐页精细编辑', 'PPTX/PDF/网页多格式'] },
      { layout: 'divider', no: 3, title: '商业模式', sub: '从免费到旗舰的完整路径' },
      { layout: 'timeline', title: '商业化路径', steps: ['免费体验获客', 'Pro 版转化', '团队版扩展', '企业定制', '生态合作', '平台化运营'] },
      { layout: 'big-stat', eyebrow: 'UNIT ECONOMICS', stat: '¥128', sub: '人均月 ARPU', body: '通过免费+付费+企业三层漏斗，实现可持续的商业化增长。' },
      { layout: 'divider', no: 4, title: '财务预测', sub: '三年财务模型' },
      { layout: 'table', title: '三年财务预测', head: ['维度', '第一年', '第二年', '第三年'],
        rows: [
          ['用户规模', '50 万', '180 万', '500 万'],
          ['付费客户', '1.2 万', '8 万', '25 万'],
          ['年营收', '¥3,200 万', '¥2.1 亿', '¥8.5 亿'],
          ['净利润率', '-15%', '8%', '22%'],
        ] },
      { layout: 'closing', title: '谢谢', sub: '让我们一起重新定义商业演示' },
    ],
  },

  /* ========== 案例 3：数据科技市场分析报告 ========== */
  {
    id: 'market-analysis',
    name: '数据科技市场分析报告',
    subtitle: '面向管理层与决策者，15 页，数据科技',
    cat: '报告',
    format: '演示文稿',
    fw: 11,  // 数据仪表盘网格
    pal: 15,  // 深蓝 + 科技蓝
    font: 3,
    pageCount: 15,
    imgCount: 12,
    cover: { eyebrow: 'MARKET REPORT · 2026', title: '2026 市场分析报告', sub: 'DATA & TECH INDUSTRY' },
    pages: [
      { layout: 'cover' },
      { layout: 'agenda', title: '报告目录', items: ['市场概览', '数据分析', '趋势预测', '策略建议'] },
      { layout: 'divider', no: 1, title: '市场概览', sub: '用数据勾勒行业全景' },
      { layout: 'stats', title: '全球市场规模', stats: [
        { v: '$2.8万亿', l: '2026 全球科技支出' },
        { v: '11.2%', l: '年增长率' },
        { v: '$4,200亿', l: 'AI 基础设施' },
        { v: '63%', l: '企业已部署 AI' },
      ], body: '全球科技行业进入新一轮增长周期，AI 基础设施投资成为核心驱动力。' },
      { layout: 'hero', eyebrow: 'MARKET OVERVIEW', title: '行业进入加速期', body: '云计算、AI、数据安全三大领域同步增长，企业数字化转型从可选变为必选。' },
      { layout: 'divider', no: 2, title: '数据分析', sub: '从数据中提炼洞察' },
      { layout: 'big-stat', eyebrow: 'KEY FINDING', stat: '3.4x', sub: 'AI 投资回报率', body: '企业 AI 投资的平均回报率达到 3.4 倍，远高于其他技术投资类别。' },
      { layout: 'comparison', title: '区域市场对比', leftTitle: '北美市场', rightTitle: '亚太市场',
        left: ['$1.2万亿', '成熟度高', '增长趋稳'],
        right: ['$9,800亿', '增速最快', '政策利好'] },
      { layout: 'timeline', title: '技术演进时间线', steps: ['云计算普及', '大数据爆发', 'AI 工程化', '多模态融合', '自主 Agent', '通用智能'] },
      { layout: 'divider', no: 3, title: '趋势预测', sub: '看见未来三年的确定性' },
      { layout: 'stats', title: '2026-2029 增长预测', stats: [
        { v: '$4.5万亿', l: '2029 市场规模' },
        { v: '19.8%', l: 'AI 年增速' },
        { v: '$8,200亿', l: '数据安全市场' },
        { v: '85%', l: 'AI 普及率' },
      ], body: '未来三年，AI 将从辅助工具进化为核心生产力，数据安全与合规成为关键议题。' },
      { layout: 'table', title: '行业对标分析', head: ['指标', '本行业', '标杆行业', '差距'],
        rows: [
          ['数字化率', '62%', '88%', '26%'],
          ['AI 渗透率', '35%', '72%', '37%'],
          ['数据利用率', '45%', '78%', '33%'],
          ['人才密度', '58%', '81%', '23%'],
        ] },
      { layout: 'closing', title: '报告结束', sub: '数据驱动决策，洞察创造价值' },
    ],
  },

  /* ========== 案例 4：奢华品牌品牌手册 ========== */
  {
    id: 'luxury-brand',
    name: '奢华品牌品牌手册',
    subtitle: '面向品牌团队与合作伙伴，15 页，奢华品牌',
    cat: '品牌设计',
    format: '演示文稿',
    fw: 29,  // 品牌手册框架
    pal: 13,  // 深紫 + 粉紫
    font: 2,
    pageCount: 15,
    imgCount: 12,
    cover: { eyebrow: 'BRAND MANUAL · 2026', title: '品牌手册', sub: 'THE ART OF LUXURY' },
    pages: [
      { layout: 'cover' },
      { layout: 'agenda', title: '目录', items: ['品牌故事', '视觉体系', '产品系列', '品牌承诺'] },
      { layout: 'divider', no: 1, title: '品牌故事', sub: '每一件作品都是一次对话' },
      { layout: 'hero', eyebrow: 'OUR STORY', title: '始于匠心，成于极致', body: '我们相信，真正的奢华不在于价格的标注，而在于每一处细节被认真对待的态度。' },
      { layout: 'quote', quote: '奢华是让日常变得不平凡的力量，是时间与技艺的结晶。', source: '品牌创始人' },
      { layout: 'divider', no: 2, title: '视觉体系', sub: '统一的视觉语言' },
      { layout: 'split', eyebrow: '模块化网格', title: '设计哲学', body0: '以极简的线条、克制的色彩、考究的材质，构建一套历久弥新的视觉语言。', body1: '每一季产品延续同一基因，在变化中保持永恒。' },
      { layout: 'stats', title: '品牌资产', stats: [
        { v: '38年', l: '品牌传承' },
        { v: '12个', l: '全球工坊' },
        { v: '46国', l: '市场覆盖' },
        { v: '9.2分', l: '客户满意度' },
      ], body: '从巴黎到东京，从米兰到纽约，品牌故事在世界每个角落被讲述。' },
      { layout: 'divider', no: 3, title: '产品系列', sub: '经典与创新的平衡' },
      { layout: 'triple-grid', title: '核心产品系列', sub: '永恒经典 · 当代诠释 · 限量臻品' },
      { layout: 'timeline', title: '品牌发展历程', steps: ['工坊创立', '首系列发布', '国际扩展', '数字化转型', '可持续发展', '未来愿景'] },
      { layout: 'divider', no: 4, title: '品牌承诺', sub: '对每一位客户的承诺' },
      { layout: 'comparison', title: '品牌承诺', leftTitle: '我们承诺', rightTitle: '您将获得',
        left: ['终身保养服务', '个性化定制', '专属顾问', '全球联保'],
        right: ['传世品质', '独一无二', '尊享体验', '无忧安心'] },
      { layout: 'quote', quote: '我们制作的不是产品，而是一个可以传承的故事。', source: '首席工匠' },
      { layout: 'closing', title: '谢谢', sub: 'THE ART OF LUXURY · 2026' },
    ],
  },
]

/* ---------------- 案例渲染 ---------------- */

const I18N_ZH = {
  stats: ['覆盖用户', '同比增长', '满意度', '交付项目', '活跃客户', '复购率', '完课率', '转化率', '留存率', 'NPS 评分'],
  subtitles: ['用清晰的结构呈现关键判断', '把复杂信息拆解为可执行的步骤', '以数据支撑每一个结论',
    '让叙事节奏与视觉节奏保持一致', '从问题出发，以行动收尾', '兼顾专业表达与阅读愉悦感'],
}

function paletteVars(caseDeck) {
  const p = PALETTES[caseDeck.pal]
  const f = FRAMEWORKS[caseDeck.fw]
  const font = FONT_PAIRS[caseDeck.font]
  return `--dp-bg:${p[0]};--dp-paper:${p[1]};--dp-ink:${p[2]};--dp-muted:${p[3]};--dp-accent:${p[4]};--dp-accent2:${p[5]};--dp-radius:${f.radius}px;--dp-head:${font.head};--dp-body:${font.body};`
}

/* 生成程序化 SVG 配图（与模板引擎一致的母题风格） */
function caseArt(deck, slot) {
  const page = deck.pages[slot]
  if (!page) return ''
  const rng = mulberry32(hashStr(`case:${deck.id}:${slot}`))
  const motif = slot % 12
  const p = PALETTES[deck.pal]
  const w = 400, h = 300
  const bg = p[0]
  const ink = p[2]
  const accent = p[4]
  const accent2 = p[5]

  let inner = ''
  switch (motif) {
    case 0: // 网格
      inner = Array.from({ length: 5 }, (_, i) => {
        const x = 20 + i * 72
        return `<rect x="${x}" y="${40 + rng() * 60}" width="56" height="${80 + rng() * 120}" rx="4" fill="${i % 2 ? accent : accent2}" opacity="${0.3 + rng() * 0.5}"/>`
      }).join('')
      break
    case 1: // 同心圆
      inner = Array.from({ length: 5 }, (_, i) =>
        `<circle cx="200" cy="150" r="${120 - i * 24}" fill="none" stroke="${i % 2 ? accent : ink}" stroke-width="${2 + rng() * 3}" opacity="${0.6 - i * 0.1}"/>`
      ).join('')
      break
    case 2: // 波形
      inner = `<path d="M0 ${150} Q 50 ${100 - rng() * 50}, 100 ${150} T 200 ${150} T 300 ${150} T 400 ${150}" fill="none" stroke="${accent}" stroke-width="3" opacity="0.7"/>
        <path d="M0 ${170} Q 50 ${220}, 100 ${170} T 200 ${170} T 300 ${170} T 400 ${170}" fill="none" stroke="${accent2}" stroke-width="2" opacity="0.5"/>`
      break
    case 3: // 点阵
      inner = Array.from({ length: 36 }, (_, i) => {
        const x = 20 + (i % 6) * 65
        const y = 30 + Math.floor(i / 6) * 65
        return `<circle cx="${x}" cy="${y}" r="${4 + rng() * 6}" fill="${i % 3 ? accent : accent2}" opacity="${0.4 + rng() * 0.5}"/>`
      }).join('')
      break
    case 4: // 线条
      inner = Array.from({ length: 8 }, (_, i) => {
        const y = 20 + i * 35
        return `<line x1="20" y1="${y}" x2="${380 - rng() * 100}" y2="${y}" stroke="${i % 2 ? accent : ink}" stroke-width="${1 + rng() * 2}" opacity="${0.3 + rng() * 0.5}"/>`
      }).join('')
      break
    case 5: // 三角
      inner = Array.from({ length: 5 }, (_, i) => {
        const x = 40 + i * 68
        const s = 40 + rng() * 30
        return `<polygon points="${x},${200} ${x + s},${200} ${x + s / 2},${200 - s * 0.866}" fill="${i % 2 ? accent : accent2}" opacity="${0.4 + rng() * 0.4}"/>`
      }).join('')
      break
    case 6: // 弧线
      inner = Array.from({ length: 4 }, (_, i) => {
        const x = 60 + i * 80
        return `<path d="M${x} 280 Q ${x + 40} ${100 + rng() * 50}, ${x + 80} 280" fill="none" stroke="${i % 2 ? accent : ink}" stroke-width="${2 + rng() * 2}" opacity="${0.5}"/>`
      }).join('')
      break
    case 7: // 六边形
      inner = Array.from({ length: 4 }, (_, i) => {
        const x = 60 + i * 80
        const r = 30 + rng() * 15
        const pts = Array.from({ length: 6 }, (_, k) => {
          const a = Math.PI / 6 + k * Math.PI / 3
          return `${x + r * Math.cos(a)},${150 + r * Math.sin(a)}`
        }).join(' ')
        return `<polygon points="${pts}" fill="none" stroke="${i % 2 ? accent : accent2}" stroke-width="2" opacity="0.6"/>`
      }).join('')
      break
    case 8: // 散点
      inner = Array.from({ length: 20 }, () => {
        const x = 20 + rng() * 360
        const y = 20 + rng() * 260
        const r = 3 + rng() * 8
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${rng() > 0.5 ? accent : accent2}" opacity="${0.3 + rng() * 0.5}"/>`
      }).join('')
      break
    case 9: // 柱状
      inner = Array.from({ length: 7 }, (_, i) => {
        const x = 30 + i * 52
        const bh = 60 + rng() * 140
        return `<rect x="${x}" y="${280 - bh}" width="36" height="${bh}" rx="4" fill="${i % 2 ? accent : accent2}" opacity="${0.5 + rng() * 0.4}"/>`
      }).join('')
      break
    case 10: // 星形
      inner = Array.from({ length: 6 }, (_, i) => {
        const x = 50 + i * 65
        const r = 25 + rng() * 15
        const pts = Array.from({ length: 8 }, (_, k) => {
          const r2 = k % 2 ? r * 0.4 : r
          const a = -Math.PI / 2 + k * Math.PI / 4
          return `${x + r2 * Math.cos(a)},${150 + r2 * Math.sin(a)}`
        }).join(' ')
        return `<polygon points="${pts}" fill="${i % 2 ? accent : accent2}" opacity="${0.3 + rng() * 0.4}"/>`
      }).join('')
      break
    default: // 渐变
      inner = `<defs><linearGradient id="g${slot}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity="0.7"/><stop offset="1" stop-color="${accent2}" stop-opacity="0.3"/></linearGradient></defs>
        <rect x="0" y="0" width="400" height="300" fill="url(#g${slot})"/>`
  }
  return `<svg class="dp-art" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" style="background:${bg}">${inner}</svg>`
}

function renderCasePage(deck, pageIdx) {
  const page = deck.pages[pageIdx]
  const fw = FRAMEWORKS[deck.fw]
  const p = PALETTES[deck.pal]
  const L = page.layout
  const img = (slot) => caseArt(deck, (pageIdx * 2 + slot) % deck.imgCount)

  let inner = ''
  switch (L) {
    case 'cover':
      inner = `<div class="dp-cover-art">${img(0)}</div>
        <div class="dp-cover-text">
          <span class="dp-eyebrow">${deck.cover.eyebrow}</span>
          <h2>${deck.cover.title}</h2>
          <p>${deck.cover.sub}</p>
        </div>`
      break
    case 'agenda':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <span class="dp-eyebrow">目录</span><h3>${page.title}</h3>
          <ol class="dp-agenda">${page.items.map((s, k) =>
        `<li><i>${String(k + 1).padStart(2, '0')}</i><span>${s}</span></li>`).join('')}</ol>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'divider':
      inner = `<div class="dp-divider-art">${img(0)}</div>
        <span class="dp-big-no">${String(page.no).padStart(2, '0')}</span>
        <h3>${page.title}</h3><p>${page.sub}</p>`
      break
    case 'hero':
      inner = `<div class="dp-hero-art">${img(0)}</div>
        <div class="dp-hero-copy"><span class="dp-eyebrow">${page.eyebrow}</span><h3>${page.title}</h3><p>${page.body}</p></div>`
      break
    case 'split':
      inner = `<div class="dp-split-art">${img(0)}</div>
        <div class="dp-split-copy"><span class="dp-eyebrow">${page.eyebrow}</span><h3>${page.title}</h3><p>${page.body0}</p><p>${page.body1}</p></div>`
      break
    case 'two-image':
      inner = `<h3>${page.title}</h3><p class="dp-lead">${page.sub}</p>
        <div class="dp-two">${img(0)}${img(1)}</div><p>${page.body0}</p>`
      break
    case 'triple-grid':
      inner = `<h3>${page.title}</h3>
        <div class="dp-triple">${img(0)}${img(1)}${img(2)}</div>
        <p class="dp-lead">${page.sub}</p>`
      break
    case 'stats':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3>${page.title}</h3><div class="dp-stats">${page.stats.map((s, k) => `
          <div class="dp-stat">
            <b>${s.v}</b>
            <span>${s.l}</span>
          </div>`).join('')}</div><p>${page.body}</p>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'big-stat':
      inner = `<div class="dp-split-grid"><div class="dp-main-col dp-main-center">
          <span class="dp-eyebrow">${page.eyebrow}</span>
          <b class="dp-big-stat">${page.stat}</b><p class="dp-lead">${page.sub}</p><p>${page.body}</p>
        </div><div class="dp-side-art dp-side-round">${img(0)}</div></div>`
      break
    case 'quote':
      inner = `<div class="dp-quote-art">${img(0)}</div>
        <blockquote>${page.quote}</blockquote><span class="dp-eyebrow">— ${page.source}</span>`
      break
    case 'timeline':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3>${page.title}</h3>
          <div class="dp-timeline">${page.steps.map((s, k) => `<div class="dp-tl-item"><i></i><b>${String(k + 1).padStart(2, '0')}</b><span>${s}</span></div>`).join('')}</div>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'comparison':
      inner = `<h3>${page.title}</h3>
        <div class="dp-compare"><div><h4>${page.leftTitle}</h4><ul>${page.left.map((s) => `<li>${s}</li>`).join('')}</ul></div>
        <div><h4>${page.rightTitle}</h4><ul>${page.right.map((s) => `<li>${s}</li>`).join('')}</ul></div></div>`
      break
    case 'table':
      inner = `<h3>${page.title}</h3>
        <table class="dp-table"><thead><tr>${page.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${page.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      break
    case 'closing':
      inner = `<div class="dp-cover-art">${img(0)}</div>
        <div class="dp-cover-text">
          <h2>${page.title}</h2>
          <p>${page.sub}</p>
        </div>`
      break
    default:
      inner = `<h3>${page.title ?? ''}</h3><p>${page.body ?? ''}</p>`
  }

  const layoutClass = `lay-${L}`
  return `<div class="dp-page ${layoutClass}" style="${paletteVars(deck)}">${inner}</div>`
}

/* 渲染整个案例的文档形态（纵向滚动） */
export function renderCaseDocumentHTML(deck) {
  return deck.pages.map((_, i) => renderCasePage(deck, i)).join('')
}

/* 渲染单页（幻灯片形态） */
export function renderCaseSlideHTML(deck, pageIdx) {
  return renderCasePage(deck, pageIdx)
}

/* 获取案例元数据 */
export function caseMeta(deck) {
  const fw = FRAMEWORKS[deck.fw]
  return {
    name: deck.name,
    subtitle: deck.subtitle,
    cat: deck.cat,
    format: deck.format,
    framework: fwLabel(fw, 'zh'),
    grid: gridLabel(fw, 'zh'),
    pageCount: deck.pageCount,
  }
}

/* 获取案例封面样式 */
export function caseCoverStyle(deck) {
  const p = PALETTES[deck.pal]
  const f = FRAMEWORKS[deck.fw]
  return { bg: p[0], ink: p[2], accent: p[4], accent2: p[5], radius: f.radius }
}
