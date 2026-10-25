/* ============================================================
   模板生成引擎（纯前端、确定性）
   - 19 个类别 × 每类 50 套 = 950 套生成模板（+24 套手工精选）
   - 每套：20–30 个页面、10–15 张独家程序化 SVG 配图
   - 50 种框架，同一类别内 50 套模板框架互不重复
   - 全部由种子随机数驱动，刷新后结果完全一致，无网络依赖
   ============================================================ */

/* ---------------- 确定性随机 ---------------- */

export function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)]
const int = (rng, min, max) => min + Math.floor(rng() * (max - min + 1))

/* ---------------- 类别 ---------------- */

export const VISIBLE_CATS = ['课程', '提案', '报告', '融资演讲稿', '营销材料', '培训', '商业规划', '活动']
export const HIDDEN_CATS = ['作品集', '品牌设计', '教育', '科技', '医疗健康', '艺术', '文化', '旅游', '餐饮', '零售', '建筑']
export const CATEGORY_LIST = [...VISIBLE_CATS, ...HIDDEN_CATS]

/* ---------------- 调色板（20 套：bg/paper/ink/muted/accent/accent2） ---------------- */

const PALETTES = [
  ['#f4f1ea', '#fffdf7', '#1f2a30', '#6b7780', '#1f5f6b', '#e08a3c'],
  ['#0f1b2d', '#16263f', '#eef3fb', '#9db0c8', '#5b82f5', '#7fd1c4'],
  ['#f6efe4', '#fffaf1', '#33281d', '#8a7a66', '#b0563a', '#d9a441'],
  ['#f2f6f3', '#fcfffd', '#20302a', '#6f8378', '#3f7d5c', '#9fc3b8'],
  ['#14141c', '#1e1e2b', '#f2f0fa', '#a39fc0', '#8b5cf6', '#f472b6'],
  ['#fdf3f0', '#fff8f5', '#3a2320', '#97736b', '#d6553f', '#f0a35b'],
  ['#eef2fb', '#f8faff', '#1d2b4a', '#67759a', '#3a6df0', '#27b8e6'],
  ['#f4f0e8', '#fbf8f1', '#2f2a22', '#7e7566', '#8a6a3f', '#557a58'],
  ['#10231d', '#17322a', '#eaf4ee', '#93b4a4', '#46a37b', '#e8c35c'],
  ['#f7f4f9', '#fdfbfe', '#2e2438', '#7d6f8c', '#9b5de5', '#00bbf9'],
  ['#20242c', '#2b303b', '#f1f2f5', '#a2a7b3', '#ef8354', '#4f9d69'],
  ['#fef9f3', '#fffdf9', '#302a24', '#898074', '#c98a3d', '#7d9d6b'],
  ['#eaf0ee', '#f7faf9', '#1d302b', '#62807a', '#2d7a6e', '#c2564b'],
  ['#231a2e', '#322543', '#f4eefb', '#b3a4c9', '#b14aed', '#ff7ab8'],
  ['#f3f5f2', '#fbfcf9', '#26302a', '#6d7a6f', '#587a4b', '#b47b3e'],
  ['#0e2233', '#143149', '#eaf4fb', '#8fb4cc', '#27b8e6', '#f6c959'],
  ['#f8f1f2', '#fefafb', '#3a2429', '#8e6f77', '#c0566d', '#7d6bb0'],
  ['#edeae3', '#f8f6f0', '#2b2b26', '#77756c', '#4d6c54', '#a06a35'],
  ['#1d1420', '#2c1d31', '#f6eef7', '#b29ab8', '#e0559b', '#7a5cf0'],
  ['#f0f4f8', '#fafcfd', '#22303c', '#6d7e8d', '#3568b0', '#e0702a'],
]

/* ---------------- 字体搭配 ---------------- */

const FONT_PAIRS = [
  { head: '"Noto Serif SC", Georgia, "Songti SC", serif', body: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { head: '"PingFang SC", "Microsoft YaHei", sans-serif', body: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { head: 'Georgia, "Times New Roman", "Noto Serif SC", serif', body: 'Georgia, "Noto Serif SC", serif' },
  { head: '"Arial Narrow", "PingFang SC", sans-serif', body: '"PingFang SC", "Microsoft YaHei", sans-serif' },
  { head: '"Kaiti SC", "STKaiti", "Noto Serif SC", serif', body: '"PingFang SC", "Microsoft YaHei", sans-serif' },
]

/* ---------------- 50 种框架（同类内绝不重复） ---------------- */

const FW_NAMES = [
  '杂志编辑网格', '极简留白体系', '瑞士国际网格', '粗野海报框架', '暗色玻璃拟态',
  '新中式留白', '圆角卡片矩阵', 'Bento 模块网格', '全屏影像框架', '分栏叙事框架',
  '数据仪表盘网格', '杂志跨页框架', '拼贴手账框架', '孟菲斯跳色框架', '包豪斯构成框架',
  '日式竖排框架', '赛博霓虹框架', '柔和有机形态', '档案文档框架', '路演焦点框架',
  '培训步骤框架', '时间轴叙事框架', '画廊展陈框架', '零售橱窗框架', '餐饮菜单框架',
  '旅游画册框架', '医疗信息图框架', '科技蓝图框架', '教育课程框架', '品牌手册框架',
  '作品集索引框架', '活动海报框架', '融资数据框架', '咨询报告框架', '提案对照框架',
  '社媒卡片流框架', '竖屏故事框架', '深色模式框架', '纸张质感框架', '高对比黑白框架',
  '渐变光晕框架', '等距网格框架', '放射极轴框架', '模块化卡片墙', '封面冲击框架',
  '双色调 Riso 框架', '玻璃卡片框架', '手绘画板框架', '未来主义框架', '东方雅致框架',
]
const IMG_FRAMES = ['rect', 'round', 'keylined', 'polaroid', 'arch', 'soft']
const HEADINGS = ['serif', 'sans', 'serif', 'sans', 'condensed']
const RADII = [0, 4, 8, 12, 16, 20, 24]
const GRIDS = ['12 栏编辑网格', '8 栏秩序网格', '模块化网格', 'Bento 便当格', '非对称网格', '文档式单栏']

export const FRAMEWORKS = FW_NAMES.map((name, i) => ({
  id: `fw-${String(i + 1).padStart(2, '0')}`,
  name,
  deco: (i % 12) + 1,
  imgFrame: IMG_FRAMES[i % IMG_FRAMES.length],
  heading: HEADINGS[i % HEADINGS.length],
  radius: RADII[i % RADII.length],
  grid: GRIDS[i % GRIDS.length],
}))

/* ---------------- 文案词库 ---------------- */

const ADJ = ['灵动', '沉静', '先锋', '温润', '高效', '克制', '鲜活', '专业', '松弛', '明朗',
  '雅致', '大胆', '细腻', '澎湃', '轻盈', '厚重', '清新', '摩登', '东方', '现代',
  '极简', '丰盈', '理性', '热情', '从容']

const CAT_NOUNS = {
  课程: ['公开课', '训练营', '进阶课', '工作坊', '大师班', '研习社', '微课集', '实训营', '讲座录', '成长课'],
  提案: ['方案书', '竞标案', '合作案', '策划案', '推介案', '投标集', '需求案', '构想案', '落地案', '蓝图案'],
  报告: ['白皮书', '观察报', '年鉴', '调研报', '复盘录', '季报', '综述报', '洞察报', '评估报', '数据志'],
  融资演讲稿: ['路演稿', '融资案', 'Pitch 稿', '募资书', '创投稿', '商业案', '增长稿', '估值案', '扩张稿', '启动稿'],
  营销材料: ['品牌册', '推广包', ' campaign 集', '种草集', '传播案', '物料库', '投放案', '造势集', '获客册', '焕新案'],
  培训: ['内训册', '讲师包', '集训稿', '带教录', '演练册', '赋能包', '训战稿', '导学册', '通关集', '晨课录'],
  商业规划: ['规划书', '作战图', '路线图', '蓝图册', '增长案', '布局录', '经营稿', '破局案', '年度案', '战略图'],
  活动: ['邀请函', '流程册', '峰会稿', '快闪案', '庆典集', '沙龙录', '展会包', '巡演稿', '开幕集', '主题案'],
  作品集: ['作品集', '精选集', '创作录', '项目集', '代表作', '手稿集', '成果册', '设计志', '影像集', '获奖录'],
  品牌设计: ['品牌手册', '视觉志', '识别册', 'VI 手册', '焕新录', '形象册', '规范集', '调性稿', '标识集', '品牌志'],
  教育: ['课件集', '教案册', '课堂录', '实验册', '启蒙集', '校本稿', '研学录', '课程志', '教具包', '学园册'],
  科技: ['产品稿', '技术白皮书', '发布稿', '蓝图志', '极客册', '算法录', '硬件案', '平台稿', '智能集', '前沿报'],
  医疗健康: ['科普册', '健康志', '护理录', '义诊稿', '疗愈集', '诊疗册', '关怀报', '身心录', '预防册', '康复志'],
  艺术: ['展陈册', '画集', '装置录', '展演稿', '跨界集', '美学志', '创作稿', '馆藏录', '策展案', '艺术志'],
  文化: ['风物志', '非遗册', '雅集录', '记忆册', '人文稿', '寻根集', '传承录', '城事册', '节令志', '文脉集'],
  旅游: ['旅行志', '攻略册', '度假集', '漫游录', '秘境册', '行旅稿', '目的地册', '轻装集', '旅居录', '风景志'],
  餐饮: ['菜单集', '食单册', '风味志', '探店录', '宴席稿', '烘焙册', '茶饮集', '主厨录', '食材志', '小食册'],
  零售: ['陈列册', '选品集', '门店稿', '橱窗录', '上新册', '货盘案', '顾客志', '零售包', '快消集', '门店手册'],
  建筑: ['方案册', '营造录', '空间志', '建筑集', '改造案', '图纸集', '场地册', '栖居稿', '结构录', '城市册'],
}

const EN_A = ['Aurora', 'Silent', 'Bold', 'Gentle', 'Urban', 'Golden', 'North', 'Echo', 'Lumen', 'Vivid', 'Orbit', 'Paper']
const EN_B = ['Studio', 'Notes', 'Series', 'Journal', 'Report', 'Collective', 'Edition', 'Lab', 'Atlas', 'Folio', 'Review', 'Bureau']

const SECTION_TITLES = ['市场洞察', '核心数据', '方案概览', '执行路径', '案例展示', '团队介绍', '节奏规划',
  '风险与应对', '投入与回报', '用户之声', '竞品对照', '常见问题', '行动清单', '里程碑', '资源配置', '体验流程', '视觉体系', '增长策略']
const SUBTITLES = ['用清晰的结构呈现关键判断', '把复杂信息拆解为可执行的步骤', '以数据支撑每一个结论',
  '让叙事节奏与视觉节奏保持一致', '从问题出发，以行动收尾', '兼顾专业表达与阅读愉悦感', '为跨部门协作提供统一语境']
const BODY_LINES = ['围绕核心目标拆解关键动作，确保每一页都服务于同一个叙事主线。',
  '结合一线调研与公开数据，呈现可验证、可追溯的判断依据。',
  '通过分阶段的里程碑设计，让长期目标落到可检查的节点上。',
  '视觉层级与信息层级同步规划，重点内容始终处于视觉焦点。',
  '预留可替换的内容模块，便于团队在实际项目中快速调整。',
  '每个章节配备小结与行动项，读完即可进入下一步执行。']
const STAT_LABELS = ['覆盖用户', '同比增长', '满意度', '交付项目', '活跃客户', '复购率', '完课率', '转化率', '留存率', 'NPS 评分']
const QUOTES = ['真正打动人的，从来不是信息的堆叠，而是被认真组织过的秩序。',
  '好的框架让内容自己说话，让读者在不知不觉中被说服。',
  '把每一次表达都当作一次产品设计，细节会替你赢得信任。',
  '复杂的事情简单说，简单的事情认真做，认真的事情重复做。']
const STEPS = ['发现机会', '定义问题', '共创方案', '快速验证', '规模落地', '持续优化']
const TEAM_ROLES = ['项目负责人', '策略顾问', '视觉设计', '数据分析师', '内容主笔', '运营专家']
const FAQ_Q = ['这个方案适合什么样的团队？', '落地周期通常需要多久？', '如何衡量项目的实际效果？', '已有系统能否平滑接入？', '预算有限时如何分阶段推进？', '团队需要配合哪些资源？']

/* ---------------- 程序化 SVG 配图（12 种母题） ---------------- */

const SVG_W = 400
const SVG_H = 300

function svgWrap(seedTag, inner, bg) {
  return `<svg viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="http://www.w3.org/2000/svg" role="img" data-seed="${seedTag}">
<rect width="${SVG_W}" height="${SVG_H}" fill="${bg}"/>${inner}</svg>`
}

const ART_KINDS = [
  // 1 层叠山峦
  (r, p) => {
    const sun = int(r, 40, 90)
    return `<circle cx="${int(r, 250, 340)}" cy="${int(r, 50, 100)}" r="${sun / 3}" fill="${p[5]}"/>
${[0, 1, 2].map((k) => `<path d="M0 ${210 - k * 36 + int(r, -12, 12)} Q${100 + k * 30} ${150 - k * 34} 200 ${190 - k * 30} T400 ${180 - k * 28} V300 H0 Z" fill="${p[4 + (k % 2)]}" opacity="${0.55 + k * 0.15}"/>`).join('')}`
  },
  // 2 波浪带
  (r, p) => [0, 1, 2, 3].map((k) =>
    `<path d="M0 ${70 + k * 52} Q100 ${40 + k * 52 + int(r, -14, 14)} 200 ${70 + k * 52} T400 ${70 + k * 52} V${96 + k * 52} Q300 ${118 + k * 52} 200 ${96 + k * 52} T0 ${96 + k * 52} Z" fill="${k % 2 ? p[5] : p[4]}" opacity="${0.35 + k * 0.14}"/>`).join(''),
  // 3 有机色块
  (r, p) => [0, 1, 2, 3].map((k) => {
    const cx = int(r, 60, 340), cy = int(r, 60, 240), rad = int(r, 45, 110)
    return `<path d="M${cx} ${cy - rad} C${cx + rad} ${cy - rad} ${cx + rad} ${cy} ${cx + rad * 0.7} ${cy + rad * 0.6} C${cx} ${cy + rad} ${cx - rad} ${cy + rad * 0.7} ${cx - rad * 0.8} ${cy} C${cx - rad} ${cy - rad * 0.6} ${cx - rad * 0.4} ${cy - rad} ${cx} ${cy - rad} Z" fill="${k % 2 ? p[5] : p[4]}" opacity="${0.32 + k * 0.13}"/>`
  }).join(''),
  // 4 拱门
  (r, p) => [0, 1, 2].map((k) => {
    const w = int(r, 70, 110), x = 40 + k * 110 + int(r, -10, 10)
    return `<path d="M${x} 260 V${130 + k * 12} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V260 Z" fill="${k === 1 ? p[5] : p[4]}" opacity="${0.5 + k * 0.16}"/>`
  }).join(''),
  // 5 城市天际线
  (r, p) => Array.from({ length: 9 }, (_, k) => {
    const w = int(r, 26, 44), h = int(r, 70, 200), x = k * 42 + 8
    return `<rect x="${x}" y="${270 - h}" width="${w}" height="${h}" rx="4" fill="${k % 3 ? p[4] : p[5]}" opacity="${0.45 + (k % 3) * 0.18}"/>
${Array.from({ length: Math.floor(h / 34) }, (_, j) => `<rect x="${x + 7}" y="${270 - h + 12 + j * 30}" width="8" height="10" fill="${p[1]}" opacity="0.55"/>`).join('')}`
  }).join(''),
  // 6 植物枝叶
  (r, p) => Array.from({ length: 5 }, (_, k) => {
    const x = 40 + k * 78 + int(r, -8, 8), h = int(r, 130, 220)
    return `<path d="M${x} 275 V${275 - h}" stroke="${p[3]}" stroke-width="3" fill="none"/>
${Array.from({ length: 4 }, (_, j) => `<ellipse cx="${x + (j % 2 ? 16 : -16)}" cy="${275 - 30 - j * (h / 4.4)}" rx="17" ry="9" fill="${j % 2 ? p[5] : p[4]}" opacity="0.75" transform="rotate(${j % 2 ? 28 : -28} ${x} ${275 - 30 - j * (h / 4.4)})"/>`).join('')}`
  }).join(''),
  // 7 同心环
  (r, p) => {
    const cx = int(r, 120, 280), cy = int(r, 90, 210)
    return Array.from({ length: 7 }, (_, k) => `<circle cx="${cx}" cy="${cy}" r="${26 + k * 20}" fill="none" stroke="${k % 2 ? p[5] : p[4]}" stroke-width="${int(r, 4, 12)}" opacity="${0.85 - k * 0.09}"/>`).join('')
  },
  // 8 半调网点
  (r, p) => Array.from({ length: 7 }, (_, row) => Array.from({ length: 10 }, (_, col) => {
    const grow = 1 + Math.abs(col - 4.5) * 0.18 + row * 0.05
    return `<circle cx="${30 + col * 38}" cy="${28 + row * 40}" r="${int(r, 5, 9) * grow * 0.75}" fill="${(row + col) % 2 ? p[5] : p[4]}" opacity="0.72"/>`
  })).flat().join(''),
  // 9 斜向色带
  (r, p) => Array.from({ length: 8 }, (_, k) =>
    `<rect x="${-120 + k * 78 + int(r, -8, 8)}" y="-40" width="${int(r, 26, 46)}" height="400" fill="${k % 2 ? p[5] : p[4]}" opacity="${0.3 + (k % 4) * 0.14}" transform="rotate(${int(r, -4, 4)} 200 150)"/>`).join(''),
  // 10 渐变网格光晕
  (r, p) => {
    const id = `m${int(r, 1e6, 9e6)}`
    return `<defs><radialGradient id="${id}"><stop offset="0%" stop-color="${p[5]}"/><stop offset="100%" stop-color="${p[4]}" stop-opacity="0.25"/></radialGradient></defs>
${Array.from({ length: 4 }, (_, k) => `<circle cx="${int(r, 60, 340)}" cy="${int(r, 50, 250)}" r="${int(r, 60, 130)}" fill="url(#${id})" opacity="${0.8 - k * 0.12}"/>`).join('')}`
  },
  // 11 柱列
  (r, p) => Array.from({ length: 8 }, (_, k) => {
    const h = int(r, 70, 210), x = 24 + k * 46
    return `<rect x="${x}" y="${270 - h}" width="30" height="${h}" rx="10" fill="${k % 2 ? p[5] : p[4]}" opacity="${0.55 + (k % 3) * 0.14}"/>
<rect x="${x - 5}" y="${262 - h}" width="40" height="9" rx="4" fill="${p[3]}" opacity="0.5"/>`
  }).join(''),
  // 12 轨道星球
  (r, p) => {
    const cx = 200, cy = 150
    return Array.from({ length: 4 }, (_, k) => {
      const rr = 40 + k * 34
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rr}" ry="${rr * 0.42}" fill="none" stroke="${p[3]}" stroke-width="2" opacity="0.7"/>
<circle cx="${cx + rr}" cy="${cy}" r="${int(r, 7, 13)}" fill="${k % 2 ? p[5] : p[4]}"/>`
    }).join('') + `<circle cx="${cx}" cy="${cy}" r="26" fill="${p[4]}"/>`
  },
]

function buildImages(rng, tpl) {
  const pal = PALETTES[tpl.pal ?? 0]
  const order = [...ART_KINDS.keys()]
  // 洗牌：保证 12 种母题先各出现一次，再按洗牌结果循环，避免相邻重复
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const imgs = []
  for (let i = 0; i < tpl.imgCount; i++) {
    const kind = order[i % order.length]
    const local = mulberry32(tpl.seed + i * 7919 + kind * 131)
    imgs.push(svgWrap(`${tpl.id}-img-${i}`, ART_KINDS[kind](local, pal), pal[1]))
  }
  return imgs
}

/* ---------------- 26 种页面版式 ---------------- */

export const LAYOUTS = [
  'cover', 'agenda', 'divider', 'hero', 'split', 'two-image', 'triple-grid', 'stats',
  'big-stat', 'quote', 'timeline', 'process', 'comparison', 'table', 'cards', 'gallery',
  'team', 'testimonial', 'pricing', 'bars', 'line-chart', 'map', 'faq', 'logos', 'index-list', 'closing',
]
const IMAGE_LAYOUTS = new Set(['cover', 'divider', 'hero', 'split', 'two-image', 'triple-grid', 'cards', 'gallery', 'team', 'testimonial', 'quote', 'closing'])

function slotNeed(layout) {
  if (layout === 'gallery') return 4
  if (layout === 'triple-grid' || layout === 'team') return 3
  if (layout === 'two-image') return 2
  return IMAGE_LAYOUTS.has(layout) ? 1 : 0
}

// 槽位不足时，把纯数据版式替换为同语义的图片版式以补足配图位
const IMAGE_CONVERT = { table: 'cards', faq: 'split', logos: 'hero', bars: 'two-image', pricing: 'triple-grid', 'big-stat': 'split', 'line-chart': 'hero', comparison: 'cards', stats: 'cards', timeline: 'split', process: 'triple-grid' }

function makePage(rng, tpl, layout, i) {
  const title = SECTION_TITLES[i % SECTION_TITLES.length]
  return {
    layout,
    no: i + 1,
    title: layout === 'cover' ? tpl.a : title,
    sub: pick(rng, SUBTITLES),
    body: [pick(rng, BODY_LINES), pick(rng, BODY_LINES)],
    statLabel: STAT_LABELS[i % STAT_LABELS.length],
    statValue: `${int(rng, 62, 98)}%`,
    quote: pick(rng, QUOTES),
    step: STEPS[i % STEPS.length],
    role: TEAM_ROLES[i % TEAM_ROLES.length],
    faq: FAQ_Q[i % FAQ_Q.length],
    imgStart: 0,
  }
}

function buildPages(rng, tpl, images) {
  const n = tpl.pageCount
  // divider / index-list 为结构页，不进随机袋，杜绝相邻重复
  const middle = LAYOUTS.slice(2, -1).filter((l) => l !== 'divider' && l !== 'index-list')
  const bag = [...middle]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  const seq = ['cover', 'agenda']
  let bagIdx = 0
  const nextLayout = (avoid) => {
    let l = bag[bagIdx % bag.length]
    bagIdx++
    if (l === avoid) { l = bag[bagIdx % bag.length]; bagIdx++ }
    return l
  }
  while (seq.length < n - 1) {
    const pos = seq.length
    // 每 6 页插入一个章节分隔页，形成节奏
    if (pos % 6 === 0) seq.push('divider')
    else seq.push(nextLayout(seq[seq.length - 1]))
  }
  if (n >= 22) seq[n - 2] = 'index-list'
  seq.push('closing')

  // 槽位兜底：保证图片位不少于配图数，让每张图至少出现一次
  let totalSlots = seq.reduce((sum, l) => sum + slotNeed(l), 0)
  if (totalSlots < images.length) {
    for (let i = 2; i < seq.length - 1 && totalSlots < images.length; i++) {
      const to = IMAGE_CONVERT[seq[i]]
      if (!to || to === seq[i - 1] || to === seq[i + 1]) continue
      totalSlots += slotNeed(to) - slotNeed(seq[i])
      seq[i] = to
    }
  }

  // 全局轮转游标分配配图，顺序消费，覆盖全部图片后再循环
  let cursor = 0
  return seq.map((layout, i) => {
    const page = makePage(rng, tpl, layout, i)
    page.imgStart = cursor
    cursor += slotNeed(layout)
    return page
  })
}

/* ---------------- 目录与缓存 ---------------- */

const catalogCache = []
const deckCache = new Map()

function normalize(tpl) {
  if (tpl.gen) return tpl
  // 精选 / 自建模板：由名称哈希推导出引擎参数
  const seed = hashStr(`db:${tpl.name}`)
  const rng = mulberry32(seed)
  return {
    ...tpl,
    gen: false,
    seed,
    fw: int(rng, 0, 49),
    pal: int(rng, 0, PALETTES.length - 1),
    font: int(rng, 0, FONT_PAIRS.length - 1),
    pageCount: 20 + (seed % 11),
    imgCount: 10 + ((seed >>> 3) % 6),
  }
}

export function buildCatalog() {
  if (catalogCache.length) return catalogCache
  let serial = 0
  for (let ci = 0; ci < CATEGORY_LIST.length; ci++) {
    const primary = CATEGORY_LIST[ci]
    const nouns = CAT_NOUNS[primary]
    // 同类 50 套的框架洗牌排列，保证框架互不重复
    const fwOrder = [...FRAMEWORKS.keys()]
    const catRng = mulberry32(hashStr(`cat:${primary}`))
    for (let i = fwOrder.length - 1; i > 0; i--) {
      const j = Math.floor(catRng() * (i + 1))
      ;[fwOrder[i], fwOrder[j]] = [fwOrder[j], fwOrder[i]]
    }
    for (let i = 0; i < 50; i++) {
      const seed = hashStr(`${primary}:${i}`)
      const rng = mulberry32(seed)
      const name = `${ADJ[i % ADJ.length]}${nouns[i % nouns.length]}`
      catalogCache.push({
        id: `tpl-gen-${ci}-${i}`,
        serial: serial++,
        name,
        a: `${name} · ${primary}`,
        b: `${EN_A[i % EN_A.length]} ${EN_B[(i * 3) % EN_B.length]}`.toUpperCase(),
        cls: null,
        gen: true,
        format: ['演示文稿', '演示文稿', '演示文稿', '文档', '社交轮播卡片'][int(rng, 0, 4)],
        cats: [primary],
        seed,
        fw: fwOrder[i],
        pal: int(rng, 0, PALETTES.length - 1),
        font: int(rng, 0, FONT_PAIRS.length - 1),
        pageCount: 20 + int(rng, 0, 10),
        imgCount: 10 + int(rng, 0, 5),
      })
    }
  }
  return catalogCache
}

export function buildDeck(rawTpl) {
  const tpl = normalize(rawTpl)
  if (deckCache.has(tpl.id ?? tpl.name)) return deckCache.get(tpl.id ?? tpl.name)
  const rng = mulberry32(tpl.seed)
  const images = buildImages(rng, tpl)
  const pages = buildPages(rng, tpl, images)
  const deck = { tpl, pages, images, framework: FRAMEWORKS[tpl.fw], palette: PALETTES[tpl.pal], fonts: FONT_PAIRS[tpl.font] }
  deckCache.set(tpl.id ?? tpl.name, deck)
  return deck
}

/* ---------------- 元数据 ---------------- */

export function metaFor(rawTpl) {
  const tpl = normalize(rawTpl)
  const pal = PALETTES[tpl.pal]
  const fw = FRAMEWORKS[tpl.fw]
  const cat = tpl.cats?.[0] ?? '商业规划'
  return {
    desc: `基于「${fw.name}」搭建的 ${cat} 模板，采用${fw.grid}与「${fw.imgFrame}」图像框处理，全套 ${tpl.pageCount} 页、${tpl.imgCount} 张独家配图，页面版式互不重复，可直接替换为你的真实内容。`,
    fits: [
      `${cat}场景的完整叙事交付`,
      '需要统一视觉规范的团队协作',
      '快速产出高完成度汇报材料',
      '按页替换内容、保留版式骨架',
    ],
    colors: [pal[4], pal[5], pal[2]],
    themes: [cat, fw.heading === 'serif' ? '人文' : '现代'],
    spec: { pages: tpl.pageCount, images: tpl.imgCount, framework: fw.name, grid: fw.grid },
  }
}

/* ---------------- 封面变量与装饰 ---------------- */

export function coverStyle(rawTpl) {
  const tpl = normalize(rawTpl)
  const pal = PALETTES[tpl.pal]
  return `--g-bg:${pal[0]};--g-paper:${pal[1]};--g-ink:${pal[2]};--g-muted:${pal[3]};--g-accent:${pal[4]};--g-accent2:${pal[5]};`
}

export function coverDeco(rawTpl) {
  return FRAMEWORKS[normalize(rawTpl).fw].deco
}

/* ---------------- 页面渲染 ---------------- */

function art(deck, index, cls = '') {
  const svg = deck.images[((index % deck.images.length) + deck.images.length) % deck.images.length]
  return `<div class="dp-art ${cls}">${svg}</div>`
}

function statBlocks(deck, page) {
  return [0, 1, 2, 3].map((k) => `
    <div class="dp-stat">
      <b>${60 + ((page.no * 7 + k * 13) % 38)}%</b>
      <span>${STAT_LABELS[(page.no + k) % STAT_LABELS.length]}</span>
    </div>`).join('')
}

function bodyText(page, n = 2) {
  return Array.from({ length: n }, (_, k) => `<p>${page.body[k % page.body.length]}</p>`).join('')
}

export function renderPageHTML(rawTpl, pageIndex, styleIdx = 0) {
  const deck = buildDeck(rawTpl)
  const { tpl, pages, framework, palette, fonts } = deck
  const page = pages[pageIndex]
  const accent = styleIdx === 0 ? palette[4] : styleIdx === 1 ? palette[5] : palette[2]
  const rootVars = `--dp-bg:${palette[0]};--dp-paper:${palette[1]};--dp-ink:${palette[2]};--dp-muted:${palette[3]};--dp-accent:${accent};--dp-accent2:${palette[5]};--dp-radius:${framework.radius}px;--dp-head:${fonts.head};--dp-body:${fonts.body};`
  const img = (slot) => art(deck, (page.imgStart + slot) % deck.images.length)
  const L = page.layout
  let inner = ''

  switch (L) {
    case 'cover':
      inner = `<div class="dp-cover-art">${img(0)}</div>
        <div class="dp-cover-text">
          <span class="dp-eyebrow">${tpl.cats?.[0] ?? '模板'} · ${framework.name}</span>
          <h2>${tpl.a}</h2>
          <p>${tpl.b}</p>
        </div>`
      break
    case 'agenda':
      inner = `<span class="dp-eyebrow">CONTENTS</span><h3>${page.title}</h3>
        <ol class="dp-agenda">${SECTION_TITLES.slice(0, Math.min(8, tpl.pageCount - 4)).map((s, k) =>
        `<li><i>${String(k + 1).padStart(2, '0')}</i><span>${s}</span></li>`).join('')}</ol>`
      break
    case 'divider':
      inner = `<div class="dp-divider-art">${img(0)}</div>
        <span class="dp-big-no">${String(page.no).padStart(2, '0')}</span>
        <h3>${page.title}</h3><p>${page.sub}</p>`
      break
    case 'hero':
      inner = `<div class="dp-hero-art">${img(0)}</div>
        <div class="dp-hero-copy"><span class="dp-eyebrow">${page.statLabel}</span><h3>${page.title}</h3>${bodyText(page, 1)}</div>`
      break
    case 'split':
      inner = `<div class="dp-split-art">${img(0)}</div>
        <div class="dp-split-copy"><span class="dp-eyebrow">${framework.grid}</span><h3>${page.title}</h3>${bodyText(page)}</div>`
      break
    case 'two-image':
      inner = `<h3>${page.title}</h3><p class="dp-lead">${page.sub}</p>
        <div class="dp-two">${img(0)}${img(1)}</div>${bodyText(page, 1)}`
      break
    case 'triple-grid':
      inner = `<h3>${page.title}</h3>
        <div class="dp-triple">${img(0)}${img(1)}${img(2)}</div>
        <p class="dp-lead">${page.sub}</p>`
      break
    case 'stats':
      inner = `<h3>${page.title}</h3><div class="dp-stats">${statBlocks(deck, page)}</div>${bodyText(page, 1)}`
      break
    case 'big-stat':
      inner = `<span class="dp-eyebrow">${page.statLabel}</span>
        <b class="dp-big-stat">${page.statValue}</b><p class="dp-lead">${page.sub}</p>${bodyText(page, 1)}`
      break
    case 'quote':
      inner = `<div class="dp-quote-art">${img(0)}</div>
        <blockquote>“${page.quote}”</blockquote><span class="dp-eyebrow">— ${tpl.name}</span>`
      break
    case 'timeline':
      inner = `<h3>${page.title}</h3>
        <div class="dp-timeline">${STEPS.map((s, k) => `<div class="dp-tl-item"><i></i><b>${String(k + 1).padStart(2, '0')}</b><span>${s}</span></div>`).join('')}</div>`
      break
    case 'process':
      inner = `<h3>${page.title}</h3>
        <div class="dp-process">${STEPS.map((s, k) => `<div class="dp-step"><b>${k + 1}</b><span>${s}</span></div>`).join('')}</div>`
      break
    case 'comparison':
      inner = `<h3>${page.title}</h3>
        <div class="dp-compare"><div class="dp-col"><h4>传统做法</h4><ul><li>信息分散、口径不一</li><li>重复制作、耗时费力</li><li>视觉缺乏统一规范</li></ul></div>
        <div class="dp-col dp-col-hot"><h4>本方案</h4><ul><li>统一框架、口径清晰</li><li>模块复用、快速迭代</li><li>成套视觉、专业一致</li></ul></div></div>`
      break
    case 'table':
      inner = `<h3>${page.title}</h3>
        <table class="dp-table"><thead><tr><th>维度</th><th>现状</th><th>目标</th><th>负责方</th></tr></thead>
        <tbody>${['效率', '成本', '体验', '增长'].map((s, k) => `<tr><td>${s}</td><td>${60 + k * 7}%</td><td>${85 + k * 3}%</td><td>${TEAM_ROLES[k]}</td></tr>`).join('')}</tbody></table>`
      break
    case 'cards':
      inner = `<h3>${page.title}</h3>
        <div class="dp-cards">${[0, 1, 2].map((k) => `<article class="dp-card">${img(k)}<h4>${SECTION_TITLES[(page.no + k) % SECTION_TITLES.length]}</h4><p>${page.body[k % 2]}</p></article>`).join('')}</div>`
      break
    case 'gallery':
      inner = `<span class="dp-eyebrow">GALLERY</span><h3>${page.title}</h3>
        <div class="dp-gallery">${img(0)}${img(1)}${img(2)}${img(3)}</div>`
      break
    case 'team':
      inner = `<h3>${page.title}</h3>
        <div class="dp-team">${[0, 1, 2].map((k) => `<figure>${img(k)}<figcaption><b>${['林一舟', '苏晚晴', '陈墨'][k]}</b><span>${TEAM_ROLES[(page.no + k) % TEAM_ROLES.length]}</span></figcaption></figure>`).join('')}</div>`
      break
    case 'testimonial':
      inner = `<div class="dp-testi-art">${img(0)}</div>
        <blockquote class="dp-testi">“${page.quote}”</blockquote><p>— ${pick(mulberry32(tpl.seed + page.no), TEAM_ROLES)}反馈</p>`
      break
    case 'pricing':
      inner = `<h3>${page.title}</h3>
        <div class="dp-pricing">
        ${['入门版', '专业版', '旗舰版'].map((s, k) => `<div class="dp-price ${k === 1 ? 'is-hot' : ''}"><h4>${s}</h4><b>¥${[299, 899, 1999][k]}</b><span>/ 月</span><ul><li>核心模板 ${20 + k * 10} 套</li><li>协作席位 ${3 + k * 5} 个</li><li>${k === 2 ? '专属顾问服务' : '社区支持'}</li></ul><button type="button">选择方案</button></div>`).join('')}</div>`
      break
    case 'bars':
      inner = `<h3>${page.title}</h3>
        <div class="dp-bars">${STAT_LABELS.slice(0, 6).map((s, k) => { const v = 45 + ((page.no * 11 + k * 13) % 50); return `<div class="dp-bar-row"><span>${s}</span><div class="dp-bar"><i style="height:${v}%"></i></div><b>${v}%</b></div>` }).join('')}</div>`
      break
    case 'line-chart':
      inner = `<h3>${page.title}</h3>
        <svg class="dp-line" viewBox="0 0 600 260" preserveAspectRatio="none">
          <polyline points="${Array.from({ length: 9 }, (_, k) => `${30 + k * 67},${210 - ((page.no * 17 + k * 19) % 160)}`).join(' ')}" fill="none" stroke="var(--dp-accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          ${Array.from({ length: 9 }, (_, k) => `<circle cx="${30 + k * 67}" cy="${210 - ((page.no * 17 + k * 19) % 160)}" r="6" fill="var(--dp-paper)" stroke="var(--dp-accent)" stroke-width="3"/>`).join('')}
        </svg><p class="dp-lead">${page.sub}</p>`
      break
    case 'map':
      inner = `<h3>${page.title}</h3>
        <div class="dp-map">${svgWrap(`map-${tpl.id}-${page.no}`, `<path d="M40 240 L120 120 L190 180 L260 80 L360 160" fill="none" stroke="var(--dp-accent)" stroke-width="6" stroke-linecap="round"/>
          ${[120, 180, 80, 160].map((y, k) => `<circle cx="${[120, 190, 260, 360][k]}" cy="${y}" r="12" fill="var(--dp-accent2)"/>`).join('')}`, palette[1])}</div>
        <p class="dp-lead">覆盖 4 个重点区域，按季度滚动推进。</p>`
      break
    case 'faq':
      inner = `<h3>${page.title}</h3>
        <div class="dp-faq">${FAQ_Q.slice(0, 4).map((q, k) => `<details ${k === 0 ? 'open' : ''}><summary>${q}</summary><p>${BODY_LINES[k % BODY_LINES.length]}</p></details>`).join('')}</div>`
      break
    case 'logos':
      inner = `<h3>${page.title}</h3>
        <div class="dp-logos">${Array.from({ length: 8 }, (_, k) => `<span>${EN_A[k % EN_A.length]} ${EN_B[(k + page.no) % EN_B.length]}</span>`).join('')}</div>
        <p class="dp-lead">他们已经在用同一套框架沉淀团队表达。</p>`
      break
    case 'index-list':
      inner = `<span class="dp-eyebrow">APPENDIX</span><h3>${page.title}</h3>
        <ul class="dp-index">${SECTION_TITLES.map((s, k) => `<li><span>${s}</span><i>${String(k + 3).padStart(2, '0')}</i></li>`).join('')}</ul>`
      break
    case 'closing':
      inner = `<div class="dp-end-art">${img(0)}</div>
        <h3>谢谢观看</h3><p>${tpl.a}</p><span class="dp-eyebrow">${tpl.b}</span>`
      break
    default:
      inner = `<h3>${page.title}</h3>${bodyText(page)}`
  }

  return `<div class="dp-page ifr-${framework.imgFrame} head-${framework.heading} lay-${L}" style="${rootVars}" data-layout="${L}" data-no="${page.no}">
    <span class="dp-page-tag">${String(page.no).padStart(2, '0')} / ${String(tpl.pageCount).padStart(2, '0')}</span>
    <div class="dp-inner">${inner}</div>
  </div>`
}
