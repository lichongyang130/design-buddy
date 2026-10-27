/* ============================================================
   模板生成引擎（纯前端、确定性、中英双语、内容可编辑）
   - 19 个类别 × 每类 50 套 = 950 套生成模板（+24 套手工精选）
   - 每套：20–30 个页面、10–15 张独家程序化 SVG 配图
   - 50 种框架，同一类别内 50 套模板框架互不重复
   - locale: 'zh' | 'en'，所有文案按语言查表，种子随机保证一致
   - renderPageHTML 支持 edits 映射，所有文字带 data-edit 稳定键
   ============================================================ */

import { conceptFor, conceptLabel } from './art-concepts.js'

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

export const CAT_EN = {
  课程: 'Courses', 提案: 'Proposals', 报告: 'Reports', 融资演讲稿: 'Fundraising', 营销材料: 'Marketing',
  培训: 'Training', 商业规划: 'Business Planning', 活动: 'Events', 作品集: 'Portfolios', 品牌设计: 'Brand Design',
  教育: 'Education', 科技: 'Technology', 医疗健康: 'Healthcare', 艺术: 'Art', 文化: 'Culture',
  旅游: 'Travel', 餐饮: 'F&B', 零售: 'Retail', 建筑: 'Architecture',
}
export const catLabel = (cat, locale) => (locale === 'en' ? (CAT_EN[cat] ?? cat) : cat)

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
  { head: '"Kaiti SC", STKaiti, "Noto Serif SC", serif', body: '"PingFang SC", "Microsoft YaHei", sans-serif' },
]

/* ---------------- 50 种框架（中英双名，同类内绝不重复） ---------------- */

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
const FW_NAMES_EN = [
  'Magazine Editorial Grid', 'Minimal Whitespace System', 'Swiss International Grid', 'Brutalist Poster Frame', 'Dark Glassmorphism',
  'Neo-Chinese Whitespace', 'Rounded Card Matrix', 'Bento Modular Grid', 'Full-Bleed Image Frame', 'Split Narrative Frame',
  'Dashboard Data Grid', 'Magazine Spread Frame', 'Collage Journal Frame', 'Memphis Pop-Color Frame', 'Bauhaus Composition Frame',
  'Japanese Vertical Frame', 'Cyber Neon Frame', 'Soft Organic Shapes', 'Archive Document Frame', 'Roadshow Spotlight Frame',
  'Training Step Frame', 'Timeline Narrative Frame', 'Gallery Exhibition Frame', 'Retail Window Frame', 'Restaurant Menu Frame',
  'Travel Album Frame', 'Healthcare Infographic Frame', 'Tech Blueprint Frame', 'Education Course Frame', 'Brand Manual Frame',
  'Portfolio Index Frame', 'Event Poster Frame', 'Fundraising Data Frame', 'Consulting Report Frame', 'Proposal Comparison Frame',
  'Social Card Stream', 'Vertical Story Frame', 'Dark Mode Frame', 'Paper Texture Frame', 'High-Contrast Mono Frame',
  'Gradient Glow Frame', 'Isometric Grid Frame', 'Radial Polar Frame', 'Modular Card Wall', 'Cover Impact Frame',
  'Duotone Riso Frame', 'Glass Card Frame', 'Hand-Drawn Canvas', 'Futurist Frame', 'Oriental Elegance Frame',
]
const IMG_FRAMES = ['rect', 'round', 'keylined', 'polaroid', 'arch', 'soft']
const IMG_FRAME_LABEL = {
  zh: { rect: '直角', round: '圆角', keylined: '描边', polaroid: '宝丽来', arch: '拱门', soft: '柔光' },
  en: { rect: 'rectangular', round: 'rounded', keylined: 'key-lined', polaroid: 'polaroid', arch: 'arched', soft: 'soft-glow' },
}
const HEADINGS = ['serif', 'sans', 'serif', 'sans', 'condensed']
const RADII = [0, 4, 8, 12, 16, 20, 24]
const GRIDS = ['12 栏编辑网格', '8 栏秩序网格', '模块化网格', 'Bento 便当格', '非对称网格', '文档式单栏']
const GRIDS_EN = ['12-column editorial grid', '8-column ordered grid', 'modular grid', 'Bento grid', 'asymmetric grid', 'document single column']

export const FRAMEWORKS = FW_NAMES.map((name, i) => ({
  id: `fw-${String(i + 1).padStart(2, '0')}`,
  name,
  nameEn: FW_NAMES_EN[i],
  deco: (i % 12) + 1,
  imgFrame: IMG_FRAMES[i % IMG_FRAMES.length],
  heading: HEADINGS[i % HEADINGS.length],
  radius: RADII[i % RADII.length],
  grid: GRIDS[i % GRIDS.length],
  gridEn: GRIDS_EN[i % GRIDS_EN.length],
}))
export const fwLabel = (fw, locale) => (locale === 'en' ? fw.nameEn : fw.name)
export const gridLabel = (fw, locale) => (locale === 'en' ? fw.gridEn : fw.grid)

/* ---------------- 中文词库 ---------------- */

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

const EN_ADJ = ['Agile', 'Serene', 'Pioneering', 'Warm', 'Efficient', 'Restrained', 'Vivid', 'Professional', 'Relaxed', 'Bright',
  'Elegant', 'Bold', 'Delicate', 'Surging', 'Light', 'Solid', 'Fresh', 'Modern', 'Oriental', 'Contemporary',
  'Minimal', 'Rich', 'Rational', 'Passionate', 'Calm']

const CAT_NOUNS_EN = {
  课程: ['Masterclass', 'Bootcamp', 'Course', 'Workshop', 'Academy', 'Seminar', 'Micro-Course', 'Lab', 'Lecture Series', 'Program'],
  提案: ['Proposal', 'Pitch Book', 'Bid Deck', 'Partnership Plan', 'Brief', 'Tender Pack', 'Requirements Doc', 'Concept Plan', 'Delivery Plan', 'Blueprint'],
  报告: ['White Paper', 'Observatory', 'Yearbook', 'Survey', 'Retro Report', 'Quarterly', 'Review', 'Insight Report', 'Assessment', 'Data Journal'],
  融资演讲稿: ['Roadshow Deck', 'Fundraising Deck', 'Pitch', 'Investment Memo', 'Venture Deck', 'Business Case', 'Growth Deck', 'Valuation Story', 'Expansion Deck', 'Launch Deck'],
  营销材料: ['Brand Book', 'Promo Kit', 'Campaign Pack', 'Social Kit', 'Comms Plan', 'Asset Library', 'Media Plan', 'Buzz Kit', 'Acquisition Deck', 'Refresh Pack'],
  培训: ['Onboarding Pack', 'Trainer Kit', 'Bootcamp Deck', 'Coaching Notes', 'Drill Book', 'Enablement Pack', 'Practice Deck', 'Learner Guide', 'Pass-Through Set', 'Morning Class'],
  商业规划: ['Plan Book', 'Battle Map', 'Roadmap', 'Blueprint', 'Growth Plan', 'Layout Journal', 'Operating Plan', 'Breakthrough Deck', 'Annual Plan', 'Strategy Map'],
  活动: ['Invitation', 'Run-of-Show', 'Summit Deck', 'Pop-Up Plan', 'Gala Pack', 'Salon Notes', 'Expo Kit', 'Tour Deck', 'Opening Pack', 'Theme Deck'],
  作品集: ['Portfolio', 'Selected Works', 'Creation Journal', 'Project Collection', 'Greatest Hits', 'Sketchbook', 'Achievement Book', 'Design Journal', 'Image Collection', 'Awards Book'],
  品牌设计: ['Brand Manual', 'Visual Journal', 'Identity Book', 'VI Guidelines', 'Refresh Journal', 'Image Book', 'Standards Pack', 'Tone Deck', 'Logo Set', 'Brand Journal'],
  教育: ['Courseware', 'Lesson Plan', 'Class Notes', 'Lab Book', 'Primer', 'School Pack', 'Study Tour Journal', 'Curriculum', 'Teaching Kit', 'Academy Book'],
  科技: ['Product Deck', 'Tech White Paper', 'Launch Deck', 'Blueprint Journal', 'Geek Book', 'Algorithm Journal', 'Hardware Case', 'Platform Deck', 'Intelligence Pack', 'Frontier Report'],
  医疗健康: ['Science Book', 'Health Journal', 'Care Notes', 'Clinic Deck', 'Healing Pack', 'Clinical Book', 'Care Report', 'Mind-Body Journal', 'Prevention Book', 'Recovery Journal'],
  艺术: ['Exhibition Book', 'Art Album', 'Installation Notes', 'Performance Deck', 'Crossover Pack', 'Aesthetics Journal', 'Creation Deck', 'Collection Notes', 'Curation Plan', 'Art Journal'],
  文化: ['Lore Journal', 'Heritage Book', 'Gathering Notes', 'Memory Book', 'Humanities Draft', 'Roots Collection', 'Legacy Journal', 'City Stories', 'Seasonal Journal', 'Heritage Collection'],
  旅游: ['Travel Journal', 'Guidebook', 'Retreat Pack', 'Roam Notes', 'Hidden Places', 'Journey Draft', 'Destination Book', 'Light Pack', 'Stay Journal', 'Landscape Journal'],
  餐饮: ['Menu Collection', 'Recipe Book', 'Flavor Journal', 'Food Tour Notes', 'Banquet Plan', 'Bake Book', 'Tea Pack', 'Chef Journal', 'Ingredient Journal', 'Bites Book'],
  零售: ['Display Book', 'Selection Pack', 'Store Deck', 'Window Journal', 'New Arrivals', 'Merch Plan', 'Customer Journal', 'Retail Pack', 'FMCG Pack', 'Store Manual'],
  建筑: ['Scheme Book', 'Construction Journal', 'Space Journal', 'Architecture Set', 'Renovation Plan', 'Drawing Set', 'Site Book', 'Dwelling Draft', 'Structure Journal', 'City Book'],
}

const EN_A = ['Aurora', 'Silent', 'Bold', 'Gentle', 'Urban', 'Golden', 'North', 'Echo', 'Lumen', 'Vivid', 'Orbit', 'Paper']
const EN_B = ['Studio', 'Notes', 'Series', 'Journal', 'Report', 'Collective', 'Edition', 'Lab', 'Atlas', 'Folio', 'Review', 'Bureau']

/* ---------------- 双语文案表 ---------------- */

const I18N = {
  zh: {
    sections: ['市场洞察', '核心数据', '方案概览', '执行路径', '案例展示', '团队介绍', '节奏规划',
      '风险与应对', '投入与回报', '用户之声', '竞品对照', '常见问题', '行动清单', '里程碑', '资源配置', '体验流程', '视觉体系', '增长策略'],
    subtitles: ['用清晰的结构呈现关键判断', '把复杂信息拆解为可执行的步骤', '以数据支撑每一个结论',
      '让叙事节奏与视觉节奏保持一致', '从问题出发，以行动收尾', '兼顾专业表达与阅读愉悦感', '为跨部门协作提供统一语境'],
    bodies: ['围绕核心目标拆解关键动作，确保每一页都服务于同一个叙事主线。',
      '结合一线调研与公开数据，呈现可验证、可追溯的判断依据。',
      '通过分阶段的里程碑设计，让长期目标落到可检查的节点上。',
      '视觉层级与信息层级同步规划，重点内容始终处于视觉焦点。',
      '预留可替换的内容模块，便于团队在实际项目中快速调整。',
      '每个章节配备小结与行动项，读完即可进入下一步执行。'],
    stats: ['覆盖用户', '同比增长', '满意度', '交付项目', '活跃客户', '复购率', '完课率', '转化率', '留存率', 'NPS 评分'],
    quotes: ['真正打动人的，从来不是信息的堆叠，而是被认真组织过的秩序。',
      '好的框架让内容自己说话，让读者在不知不觉中被说服。',
      '把每一次表达都当作一次产品设计，细节会替你赢得信任。',
      '复杂的事情简单说，简单的事情认真做，认真的事情重复做。'],
    steps: ['发现机会', '定义问题', '共创方案', '快速验证', '规模落地', '持续优化'],
    roles: ['项目负责人', '策略顾问', '视觉设计', '数据分析师', '内容主笔', '运营专家'],
    faqs: ['这个方案适合什么样的团队？', '落地周期通常需要多久？', '如何衡量项目的实际效果？', '已有系统能否平滑接入？', '预算有限时如何分阶段推进？', '团队需要配合哪些资源？'],
    eyebrow: { contents: '目录', gallery: '图集', appendix: '附录' },
    closing: '谢谢观看',
    mapLead: '覆盖 4 个重点区域，按季度滚动推进。',
    logosLead: '他们已经在用同一套框架沉淀团队表达。',
    feedback: '反馈',
    compare: {
      leftTitle: '传统做法', rightTitle: '本方案',
      left: ['信息分散、口径不一', '重复制作、耗时费力', '视觉缺乏统一规范'],
      right: ['统一框架、口径清晰', '模块复用、快速迭代', '成套视觉、专业一致'],
    },
    tableHead: ['维度', '现状', '目标', '负责方'],
    tableDims: ['效率', '成本', '体验', '增长'],
    teamNames: ['林一舟', '苏晚晴', '陈墨'],
    plans: ['入门版', '专业版', '旗舰版'],
    perMonth: '/ 月',
    planFeatures: (k) => [
      [`核心模板 ${20 + k * 10} 套`, `协作席位 ${3 + k * 5} 个`, k === 2 ? '专属顾问服务' : '社区支持'],
    ][0],
    choosePlan: '选择方案',
  },
  en: {
    sections: ['Market Insights', 'Key Metrics', 'Solution Overview', 'Execution Roadmap', 'Case Studies', 'The Team', 'Cadence Planning',
      'Risks & Mitigation', 'Investment & Return', 'Voice of Customer', 'Competitive Comparison', 'FAQ', 'Action Checklist', 'Milestones', 'Resource Allocation', 'Experience Flow', 'Visual System', 'Growth Strategy'],
    subtitles: ['Key judgments presented with a clear, calm structure.', 'Complexity broken down into executable steps.',
      'Every conclusion backed by traceable data.', 'Narrative rhythm and visual rhythm kept in sync.',
      'Start from the problem, finish with an action.', 'Professional rigor paired with reading pleasure.', 'One shared language for cross-team collaboration.'],
    bodies: ['Key actions are broken down around the core goal so every slide serves one narrative thread.',
      'Frontline research and public data combine into verifiable, traceable judgments.',
      'Phased milestones turn long-term goals into checkable checkpoints.',
      'Visual hierarchy and information hierarchy are planned together, keeping key content in focus.',
      'Swappable content modules let teams adapt quickly in real projects.',
      'Each chapter closes with a summary and action items, ready for the next step.'],
    stats: ['Users Reached', 'YoY Growth', 'Satisfaction', 'Projects Delivered', 'Active Clients', 'Repurchase Rate', 'Completion Rate', 'Conversion', 'Retention', 'NPS Score'],
    quotes: ['What moves people is never piled-up information, but carefully organized order.',
      'A strong framework lets the content speak for itself and persuades without pressure.',
      'Treat every presentation as product design — the details earn the trust.',
      'Make the complex simple, take the simple seriously, and repeat what matters.'],
    steps: ['Spot Opportunity', 'Define Problem', 'Co-Create', 'Validate Fast', 'Scale Rollout', 'Keep Optimizing'],
    roles: ['Project Lead', 'Strategy Advisor', 'Visual Designer', 'Data Analyst', 'Lead Writer', 'Operations Expert'],
    faqs: ['Which teams is this solution built for?', 'How long does implementation usually take?', 'How do we measure real impact?', 'Can existing systems integrate smoothly?', 'How do we phase it with a limited budget?', 'What resources should our team contribute?'],
    eyebrow: { contents: 'CONTENTS', gallery: 'GALLERY', appendix: 'APPENDIX' },
    closing: 'Thank You',
    mapLead: 'Covering four key regions, rolled out quarter by quarter.',
    logosLead: 'Teams already use this framework to sharpen their storytelling.',
    feedback: 'feedback',
    compare: {
      leftTitle: 'Legacy Approach', rightTitle: 'This Solution',
      left: ['Scattered info, inconsistent claims', 'Duplicated work, slow production', 'No unified visual standard'],
      right: ['One framework, one clear voice', 'Reusable modules, fast iteration', 'Cohesive visuals, professional finish'],
    },
    tableHead: ['Dimension', 'Current', 'Target', 'Owner'],
    tableDims: ['Efficiency', 'Cost', 'Experience', 'Growth'],
    teamNames: ['Lin Yizhou', 'Su Wanqing', 'Chen Mo'],
    plans: ['Starter', 'Pro', 'Enterprise'],
    perMonth: '/mo',
    planFeatures: (k) => [
      `${20 + k * 10} core templates`, `${3 + k * 5} collaboration seats`, k === 2 ? 'Dedicated advisor' : 'Community support'],
    choosePlan: 'Choose Plan',
  },
}

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

// 每种版式消耗的配图槽位数：除 map 自带场景插画外，所有页面至少 1 个图位
export function slotNeed(layout) {
  switch (layout) {
    case 'gallery': return 4
    case 'triple-grid':
    case 'team':
    case 'cards':
    case 'pricing': return 3
    case 'two-image': return 2
    case 'map': return 0 // map 版式自带程序化地图插画
    default: return 1
  }
}


function makePage(rng, layout, i) {
  return {
    layout,
    no: i + 1,
    titleIdx: i % I18N.zh.sections.length,
    subIdx: int(rng, 0, I18N.zh.subtitles.length - 1),
    bodyIdx: [int(rng, 0, I18N.zh.bodies.length - 1), int(rng, 0, I18N.zh.bodies.length - 1)],
    statLabelIdx: i % I18N.zh.stats.length,
    statNum: int(rng, 62, 98),
    quoteIdx: int(rng, 0, I18N.zh.quotes.length - 1),
    roleIdx: i % I18N.zh.roles.length,
    faqIdx: i % I18N.zh.faqs.length,
    imgStart: 0,
  }
}

function buildPages(rng, tpl) {
  const n = tpl.pageCount
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
    if (pos % 6 === 0) seq.push('divider')
    else seq.push(nextLayout(seq[seq.length - 1]))
  }
  if (n >= 22) seq[n - 2] = 'index-list'
  seq.push('closing')

  // 所有版式均含配图位（map 自带场景插画），槽位必然覆盖全部配图
  let cursor = 0
  return seq.map((layout, i) => {
    const page = makePage(rng, layout, i)
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

const CURATED_EN = {
  渔港日记: 'Harbor Diary', 水墨亭: 'Ink Pavilion', 朱砂册页: 'Cinnabar Folio', 讲堂: 'Lecture Hall',
  国潮商务路演: 'Guochao Business Roadshow',
}

export function displayTpl(tpl, locale = 'zh') {
  if (locale !== 'en') return { name: tpl.name, a: tpl.a, b: tpl.b }
  if (tpl.gen) {
    const ci = CATEGORY_LIST.indexOf(tpl.cats[0])
    const i = tpl.serial % 50
    const enName = `${EN_ADJ[i % EN_ADJ.length]} ${CAT_NOUNS_EN[tpl.cats[0]][i % 10]}`
    return {
      name: enName,
      a: `${enName} · ${CAT_EN[tpl.cats[0]]}`,
      b: tpl.b,
    }
  }
  return { name: CURATED_EN[tpl.name] ?? tpl.name, a: CURATED_EN[tpl.name] ?? tpl.a ?? tpl.name, b: tpl.b }
}

export function buildCatalog() {
  // 示例目录已全部清空（保留引擎供自定义模板复用）；如需恢复展示可注释掉此返回
  return []
}

export function buildDeck(rawTpl, locale = 'zh') {
  const tpl = normalize(rawTpl)
  const key = `${tpl.id ?? tpl.name}::${locale}`
  if (deckCache.has(key)) return deckCache.get(key)
  const rng = mulberry32(tpl.seed)
  const images = buildImages(rng, tpl)
  const pages = buildPages(rng, tpl)
  const deck = {
    tpl, pages, images, locale,
    framework: FRAMEWORKS[tpl.fw],
    palette: PALETTES[tpl.pal],
    fonts: FONT_PAIRS[tpl.font],
    display: displayTpl(tpl, locale),
  }
  deckCache.set(key, deck)
  return deck
}

/* ---------------- 元数据 ---------------- */

export function metaFor(rawTpl, locale = 'zh') {
  const tpl = normalize(rawTpl)
  const pal = PALETTES[tpl.pal]
  const fw = FRAMEWORKS[tpl.fw]
  const cat = tpl.cats?.[0] ?? '商业规划'
  if (locale === 'en') {
    return {
      desc: `A ${CAT_EN[cat] ?? cat} template built on the “${fw.nameEn}” framework, using a ${fw.gridEn} and ${IMG_FRAME_LABEL.en[fw.imgFrame]} image treatment. The full deck contains ${tpl.pageCount} slides and ${tpl.imgCount} original illustrations, with no repeated slide layout — swap in your own content directly.`,
      fits: [
        `End-to-end storytelling for ${CAT_EN[cat] ?? cat} scenarios`,
        'Team collaboration with one visual standard',
        'High-polish reporting materials in minutes',
        'Edit slide by slide while keeping the layout skeleton',
      ],
      colors: [pal[4], pal[5], pal[2]],
      themes: [CAT_EN[cat] ?? cat, fw.heading === 'serif' ? 'Editorial' : 'Modern'],
      spec: { pages: tpl.pageCount, images: tpl.imgCount, framework: fw.nameEn, grid: fw.gridEn },
    }
  }
  return {
    desc: `基于「${fw.name}」搭建的 ${cat} 模板，采用${fw.grid}与「${IMG_FRAME_LABEL.zh[fw.imgFrame]}」图像框处理，全套 ${tpl.pageCount} 页、${tpl.imgCount} 张独家配图，页面版式互不重复，可直接替换为你的真实内容。`,
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

/* ---------------- 页面渲染（支持 edits 内联编辑） ---------------- */

/* ---------------- 真实配图模式（P1） ----------------
   mode: 'svg'（经典内联 SVG，默认）| 'illustration'（绘本插画）| 'photo'（真实照片）
   manifest: { [conceptKey]: { illustration?: string, photo?: string } }，由 public/art/manifest.json 提供
   overrides: 用户单页换图，键 `${deckId}:${pageNo}:${slot}`，值为 dataUrl 或素材 URL
   素材缺失时自动回退内联 SVG，保证离线/旧数据永不白屏 */
const ART_MODES = ['svg', 'illustration', 'photo']
let artConfig = { mode: 'svg', manifest: {}, overrides: {}, base: '' }

export function configureArt(opts = {}) {
  artConfig = {
    mode: ART_MODES.includes(opts.mode) ? opts.mode : artConfig.mode,
    manifest: opts.manifest ?? artConfig.manifest,
    overrides: opts.overrides ?? artConfig.overrides,
    base: opts.base === undefined ? artConfig.base : (opts.base || ''),
  }
}
export const getArtMode = () => artConfig.mode
export const getArtManifest = () => artConfig.manifest
export const getArtBase = () => artConfig.base
// 代理基址仅作用于站内 /art/ 素材；dataURL/blob/http 绝对地址不受影响
const withBase = (src) => (artConfig.base && src.startsWith('/') ? artConfig.base + src : src)

export function setArtOverride(deckId, pageNo, slot, src) {
  artConfig.overrides[`${deckId}:${pageNo}:${slot}`] = src
}
export function clearArtOverride(deckId, pageNo, slot) {
  delete artConfig.overrides[`${deckId}:${pageNo}:${slot}`]
}

const escAttr = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')

// manifest 条目既支持裸 URL 字符串，也支持 { src, author, license } 对象
const entrySrc = (entry, mode) => {
  const v = entry?.[mode]
  if (!v) return null
  return typeof v === 'string' ? v : (v.src ?? null)
}

function art(deck, index, page = null, slot = 0, locale = 'zh') {
  const i = ((index % deck.images.length) + deck.images.length) % deck.images.length
  const svg = deck.images[i]
  const key = conceptFor(deck.tpl, page ?? { layout: 'divider', no: 1 }, slot)
  const artAttrs = `data-art-key="${escAttr(key)}" data-art-slot="${slot}" data-art-page="${page?.no ?? 1}" title="${locale === 'en' ? 'Click to replace artwork' : '点击替换配图'}"`
  const fallback = `<div class="dp-art" ${artAttrs}>${svg}</div>`
  if (artConfig.mode === 'svg' || !page) return fallback
  let src = artConfig.overrides[`${deck.tpl.id}:${page.no}:${slot}`]
  if (!src) src = entrySrc(artConfig.manifest[key], artConfig.mode)
  if (!src) return fallback
  const alt = escAttr(conceptLabel(key, locale))
  return `<div class="dp-art dp-art-img" ${artAttrs}><img loading="lazy" src="${escAttr(withBase(src))}" alt="${alt}"></div>`
}

// map 版式：素材清单含 shared.map 时用真实插画地图，否则保留程序化 SVG
function mapArt(deck, page, fallbackSvg, locale) {
  if (artConfig.mode === 'svg') return fallbackSvg
  const src = artConfig.overrides[`${deck.tpl.id}:${page.no}:0`]
    || entrySrc(artConfig.manifest['shared.map'], artConfig.mode)
  if (!src) return fallbackSvg
  return `<img loading="lazy" src="${escAttr(withBase(src))}" alt="${escAttr(conceptLabel('shared.map', locale))}">`
}

export function renderPageHTML(rawTpl, pageIndex, styleIdx = 0, locale = 'zh', edits = {}) {
  const deck = buildDeck(rawTpl, locale)
  const { tpl, pages, framework, palette, fonts, display } = deck
  const T = I18N[locale]
  const page = pages[pageIndex]
  const accent = styleIdx === 0 ? palette[4] : styleIdx === 1 ? palette[5] : palette[2]
  const rootVars = `--dp-bg:${palette[0]};--dp-paper:${palette[1]};--dp-ink:${palette[2]};--dp-muted:${palette[3]};--dp-accent:${accent};--dp-accent2:${palette[5]};--dp-radius:${framework.radius}px;--dp-head:${fonts.head};--dp-body:${fonts.body};`
  const img = (slot) => art(deck, (page.imgStart + slot) % deck.images.length, page, slot, locale)
  const ed = (key, fallback) => (edits[key] != null && edits[key] !== '' ? edits[key] : fallback)
  const edAttr = (key) => ` class="dp-editable" contenteditable="true" data-edit="${key}"`
  const L = page.layout
  let inner = ''

  switch (L) {
    case 'cover':
      inner = `<div class="dp-cover-art">${img(0)}</div>
        <div class="dp-cover-text">
          <span class="dp-eyebrow dp-editable" contenteditable="true" data-edit="cover-eyebrow">${ed('cover-eyebrow', `${catLabel(tpl.cats?.[0] ?? (locale === 'en' ? 'Template' : '模板'), locale)} · ${fwLabel(framework, locale)}`)}</span>
          <h2${edAttr('cover-title')}>${ed('cover-title', display.a)}</h2>
          <p${edAttr('cover-sub')}>${ed('cover-sub', display.b ?? '')}</p>
        </div>`
      break
    case 'agenda':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <span class="dp-eyebrow">${T.eyebrow.contents}</span><h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
          <ol class="dp-agenda">${T.sections.slice(0, Math.min(8, tpl.pageCount - 4)).map((s, k) =>
        `<li><i>${String(k + 1).padStart(2, '0')}</i><span class="dp-editable" contenteditable="true" data-edit="agenda${k}">${ed(`agenda${k}`, s)}</span></li>`).join('')}</ol>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'divider':
      inner = `<div class="dp-divider-art">${img(0)}</div>
        <span class="dp-big-no">${String(page.no).padStart(2, '0')}</span>
        <h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3><p${edAttr('sub')}>${ed('sub', T.subtitles[page.subIdx])}</p>`
      break
    case 'hero':
      inner = `<div class="dp-hero-art">${img(0)}</div>
        <div class="dp-hero-copy"><span class="dp-eyebrow dp-editable" contenteditable="true" data-edit="eyebrow">${ed('eyebrow', T.stats[page.statLabelIdx])}</span><h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3><p${edAttr('body0')}>${ed('body0', T.bodies[page.bodyIdx[0]])}</p></div>`
      break
    case 'split':
      inner = `<div class="dp-split-art">${img(0)}</div>
        <div class="dp-split-copy"><span class="dp-eyebrow">${gridLabel(framework, locale)}</span><h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3><p${edAttr('body0')}>${ed('body0', T.bodies[page.bodyIdx[0]])}</p><p${edAttr('body1')}>${ed('body1', T.bodies[page.bodyIdx[1]])}</p></div>`
      break
    case 'two-image':
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3><p class="dp-lead dp-editable" contenteditable="true" data-edit="sub">${ed('sub', T.subtitles[page.subIdx])}</p>
        <div class="dp-two">${img(0)}${img(1)}</div><p${edAttr('body0')}>${ed('body0', T.bodies[page.bodyIdx[0]])}</p>`
      break
    case 'triple-grid':
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
        <div class="dp-triple">${img(0)}${img(1)}${img(2)}</div>
        <p class="dp-lead dp-editable" contenteditable="true" data-edit="sub">${ed('sub', T.subtitles[page.subIdx])}</p>`
      break
    case 'stats':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3><div class="dp-stats">${[0, 1, 2, 3].map((k) => `
          <div class="dp-stat">
            <b class="dp-editable" contenteditable="true" data-edit="stat-value${k}">${ed(`stat-value${k}`, `${60 + ((page.no * 7 + k * 13) % 38)}%`)}</b>
            <span class="dp-editable" contenteditable="true" data-edit="stat-label${k}">${ed(`stat-label${k}`, T.stats[(page.no + k) % T.stats.length])}</span>
          </div>`).join('')}</div><p${edAttr('body0')}>${ed('body0', T.bodies[page.bodyIdx[0]])}</p>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'big-stat':
      inner = `<div class="dp-split-grid"><div class="dp-main-col dp-main-center">
          <span class="dp-eyebrow dp-editable" contenteditable="true" data-edit="eyebrow">${ed('eyebrow', T.stats[page.statLabelIdx])}</span>
          <b class="dp-big-stat dp-editable" contenteditable="true" data-edit="stat-value0">${ed('stat-value0', `${page.statNum}%`)}</b><p class="dp-lead dp-editable" contenteditable="true" data-edit="sub">${ed('sub', T.subtitles[page.subIdx])}</p><p${edAttr('body0')}>${ed('body0', T.bodies[page.bodyIdx[0]])}</p>
        </div><div class="dp-side-art dp-side-round">${img(0)}</div></div>`
      break
    case 'quote':
      inner = `<div class="dp-quote-art">${img(0)}</div>
        <blockquote class="dp-editable" contenteditable="true" data-edit="quote">${ed('quote', T.quotes[page.quoteIdx])}</blockquote><span class="dp-eyebrow dp-editable" contenteditable="true" data-edit="quote-source">${ed('quote-source', `— ${display.name}`)}</span>`
      break
    case 'timeline':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
          <div class="dp-timeline">${T.steps.map((s, k) => `<div class="dp-tl-item"><i></i><b>${String(k + 1).padStart(2, '0')}</b><span class="dp-editable" contenteditable="true" data-edit="step${k}">${ed(`step${k}`, s)}</span></div>`).join('')}</div>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'process':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
          <div class="dp-process">${T.steps.map((s, k) => `<div class="dp-step"><b>${k + 1}</b><span class="dp-editable" contenteditable="true" data-edit="step${k}">${ed(`step${k}`, s)}</span></div>`).join('')}</div>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'comparison':
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
        <div class="dp-banner-art">${img(0)}</div>
        <div class="dp-compare"><div class="dp-col"><h4 class="dp-editable" contenteditable="true" data-edit="cmp-left-title">${ed('cmp-left-title', T.compare.leftTitle)}</h4><ul>${T.compare.left.map((s, k) => `<li class="dp-editable" contenteditable="true" data-edit="cmp-l${k}">${ed(`cmp-l${k}`, s)}</li>`).join('')}</ul></div>
        <div class="dp-col dp-col-hot"><h4 class="dp-editable" contenteditable="true" data-edit="cmp-right-title">${ed('cmp-right-title', T.compare.rightTitle)}</h4><ul>${T.compare.right.map((s, k) => `<li class="dp-editable" contenteditable="true" data-edit="cmp-r${k}">${ed(`cmp-r${k}`, s)}</li>`).join('')}</ul></div></div>`
      break
    case 'table':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
          <table class="dp-table"><thead><tr>${T.tableHead.map((h, k) => `<th class="dp-editable" contenteditable="true" data-edit="th${k}">${ed(`th${k}`, h)}</th>`).join('')}</tr></thead>
          <tbody>${T.tableDims.map((s, k) => `<tr><td class="dp-editable" contenteditable="true" data-edit="cell-${k}-0">${ed(`cell-${k}-0`, s)}</td><td class="dp-editable" contenteditable="true" data-edit="cell-${k}-1">${ed(`cell-${k}-1`, `${60 + k * 7}%`)}</td><td class="dp-editable" contenteditable="true" data-edit="cell-${k}-2">${ed(`cell-${k}-2`, `${85 + k * 3}%`)}</td><td class="dp-editable" contenteditable="true" data-edit="cell-${k}-3">${ed(`cell-${k}-3`, T.roles[k])}</td></tr>`).join('')}</tbody></table>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'cards':
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
        <div class="dp-cards">${[0, 1, 2].map((k) => `<article class="dp-card">${img(k)}<h4 class="dp-editable" contenteditable="true" data-edit="card-title${k}">${ed(`card-title${k}`, T.sections[(page.no + k) % T.sections.length])}</h4><p class="dp-editable" contenteditable="true" data-edit="card-body${k}">${ed(`card-body${k}`, T.bodies[page.bodyIdx[k % 2]])}</p></article>`).join('')}</div>`
      break
    case 'gallery':
      inner = `<span class="dp-eyebrow">${T.eyebrow.gallery}</span><h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
        <div class="dp-gallery">${img(0)}${img(1)}${img(2)}${img(3)}</div>`
      break
    case 'team':
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
        <div class="dp-team">${[0, 1, 2].map((k) => `<figure>${img(k)}<figcaption><b class="dp-editable" contenteditable="true" data-edit="team-name${k}">${ed(`team-name${k}`, T.teamNames[k])}</b><span class="dp-editable" contenteditable="true" data-edit="team-role${k}">${ed(`team-role${k}`, T.roles[(page.no + k) % T.roles.length])}</span></figcaption></figure>`).join('')}</div>`
      break
    case 'testimonial':
      inner = `<div class="dp-testi-art">${img(0)}</div>
        <blockquote class="dp-testi dp-editable" contenteditable="true" data-edit="quote">${ed('quote', T.quotes[page.quoteIdx])}</blockquote><p class="dp-editable" contenteditable="true" data-edit="testi-source">${ed('testi-source', `— ${pick(mulberry32(tpl.seed + page.no), T.roles)} ${T.feedback}`)}</p>`
      break
    case 'pricing':
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
        <div class="dp-pricing">
        ${T.plans.map((s, k) => `<div class="dp-price ${k === 1 ? 'is-hot' : ''}"><div class="dp-price-art">${img(k)}</div><h4 class="dp-editable" contenteditable="true" data-edit="plan${k}">${ed(`plan${k}`, s)}</h4><b class="dp-editable" contenteditable="true" data-edit="price${k}">${ed(`price${k}`, k === 0 ? (locale === 'en' ? '$299' : '¥299') : k === 1 ? (locale === 'en' ? '$899' : '¥899') : (locale === 'en' ? '$1999' : '¥1999'))}</b><span>${T.perMonth}</span><ul>${T.planFeatures(k).map((f, j) => `<li class="dp-editable" contenteditable="true" data-edit="feat-${k}-${j}">${ed(`feat-${k}-${j}`, f)}</li>`).join('')}</ul><button type="button" class="dp-editable" contenteditable="true" data-edit="cta${k}">${ed(`cta${k}`, T.choosePlan)}</button></div>`).join('')}</div>`
      break
    case 'bars':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
          <div class="dp-bars">${T.stats.slice(0, 6).map((s, k) => { const v = 45 + ((page.no * 11 + k * 13) % 50); return `<div class="dp-bar-row"><span class="dp-editable" contenteditable="true" data-edit="bar-label${k}">${ed(`bar-label${k}`, s)}</span><div class="dp-bar"><i style="height:${v}%"></i></div><b class="dp-editable" contenteditable="true" data-edit="bar-value${k}">${ed(`bar-value${k}`, `${v}%`)}</b></div>` }).join('')}</div>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'line-chart':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
          <svg class="dp-line" viewBox="0 0 600 260" preserveAspectRatio="none">
            <polyline points="${Array.from({ length: 9 }, (_, k) => `${30 + k * 67},${210 - ((page.no * 17 + k * 19) % 160)}`).join(' ')}" fill="none" stroke="var(--dp-accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            ${Array.from({ length: 9 }, (_, k) => `<circle cx="${30 + k * 67}" cy="${210 - ((page.no * 17 + k * 19) % 160)}" r="6" fill="var(--dp-paper)" stroke="var(--dp-accent)" stroke-width="3"/>`).join('')}
          </svg><p class="dp-lead dp-editable" contenteditable="true" data-edit="sub">${ed('sub', T.subtitles[page.subIdx])}</p>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'map':
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
        <div class="dp-map dp-art" data-art-key="shared.map" data-art-slot="0" data-art-page="${page.no}" title="${locale === 'en' ? 'Click to replace artwork' : '点击替换配图'}">${mapArt(deck, page, svgWrap(`map-${tpl.id}-${page.no}`, `<path d="M40 240 L120 120 L190 180 L260 80 L360 160" fill="none" stroke="var(--dp-accent)" stroke-width="6" stroke-linecap="round"/>
          ${[120, 180, 80, 160].map((y, k) => `<circle cx="${[120, 190, 260, 360][k]}" cy="${y}" r="12" fill="var(--dp-accent2)"/>`).join('')}`, palette[1]), locale)}</div>
        <p class="dp-lead dp-editable" contenteditable="true" data-edit="map-lead">${ed('map-lead', T.mapLead)}</p>`
      break
    case 'faq':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
          <div class="dp-faq">${T.faqs.slice(0, 4).map((q, k) => `<details ${k === 0 ? 'open' : ''}><summary class="dp-editable" contenteditable="true" data-edit="faq-q${k}">${ed(`faq-q${k}`, q)}</summary><p class="dp-editable" contenteditable="true" data-edit="faq-a${k}">${ed(`faq-a${k}`, T.bodies[k % T.bodies.length])}</p></details>`).join('')}</div>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'logos':
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
        <div class="dp-banner-art">${img(0)}</div>
        <div class="dp-logos">${Array.from({ length: 8 }, (_, k) => `<span class="dp-editable" contenteditable="true" data-edit="logo${k}">${ed(`logo${k}`, `${EN_A[k % EN_A.length]} ${EN_B[(k + page.no) % EN_B.length]}`)}</span>`).join('')}</div>
        <p class="dp-lead dp-editable" contenteditable="true" data-edit="logos-lead">${ed('logos-lead', T.logosLead)}</p>`
      break
    case 'index-list':
      inner = `<div class="dp-split-grid"><div class="dp-main-col">
          <span class="dp-eyebrow">${T.eyebrow.appendix}</span><h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3>
          <ul class="dp-index">${T.sections.map((s, k) => `<li><span class="dp-editable" contenteditable="true" data-edit="index${k}">${ed(`index${k}`, s)}</span><i>${String(k + 3).padStart(2, '0')}</i></li>`).join('')}</ul>
        </div><div class="dp-side-art">${img(0)}</div></div>`
      break
    case 'closing':
      inner = `<div class="dp-end-art">${img(0)}</div>
        <h3 class="dp-editable" contenteditable="true" data-edit="closing-title">${ed('closing-title', T.closing)}</h3><p class="dp-editable" contenteditable="true" data-edit="closing-sub">${ed('closing-sub', display.a)}</p><span class="dp-eyebrow dp-editable" contenteditable="true" data-edit="closing-eyebrow">${ed('closing-eyebrow', display.b ?? '')}</span>`
      break
    default:
      inner = `<h3${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h3><p${edAttr('body0')}>${ed('body0', T.bodies[page.bodyIdx[0]])}</p><p${edAttr('body1')}>${ed('body1', T.bodies[page.bodyIdx[1]])}</p>`
  }

  return `<div class="dp-page ifr-${framework.imgFrame} head-${framework.heading} lay-${L}" style="${rootVars}" data-layout="${L}" data-no="${page.no}">
    <span class="dp-page-tag">${String(page.no).padStart(2, '0')} / ${String(tpl.pageCount).padStart(2, '0')}</span>
    <div class="dp-inner">${inner}</div>
  </div>`
}

/* ============================================================
   文档形态渲染器（纵向滚动、图文流式，与幻灯分页形态明确区分）
   - 同一套 data-edit 键与配图锚点，幻灯/文档的内联编辑与换图共享
   - extraBlocks：用户通过「添加版块」插入的自定义块，持久化后传入
   ============================================================ */

function docArt(deck, page, slot, locale) {
  return art(deck, (page.imgStart + slot) % deck.images.length, page, slot, locale)
}

export function renderDocumentHTML(rawTpl, locale = 'zh', editsByPage = {}, extraBlocks = []) {
  const tpl = normalize(rawTpl)
  const deck = buildDeck(rawTpl, locale)
  const { pages, framework, palette, fonts, display } = deck
  const T = I18N[locale]
  const edOf = (pi) => (key, fallback) => {
    const m = editsByPage[pi]
    return m && m[key] != null && m[key] !== '' ? m[key] : fallback
  }
  const edAttr = (key) => ` class="db-editable" contenteditable="true" data-edit="${key}"`
  const rootVars = `--dp-bg:${palette[0]};--dp-paper:${palette[1]};--dp-ink:${palette[2]};--dp-muted:${palette[3]};--dp-accent:${palette[4]};--dp-accent2:${palette[5]};--dp-radius:${framework.radius}px;--dp-head:${fonts.head};--dp-body:${fonts.body};`

  const grid = (page, slots, cls) => `<div class="doc-img-grid doc-img-${cls}">${slots.map((k) => docArt(deck, page, k, locale)).join('')}</div>`

  const blocks = pages.map((page) => {
    const pi = page.no - 1
    const ed = edOf(pi)
    const L = page.layout
    const head = `<h2${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h2>`
    const body = `<p${edAttr('body0')}>${ed('body0', T.bodies[page.bodyIdx[0]])}</p>`
    let inner = ''
    switch (L) {
      case 'cover':
        inner = `<header class="doc-cover">${docArt(deck, page, 0, locale)}
          <span class="doc-eyebrow db-editable" contenteditable="true" data-edit="cover-eyebrow">${ed('cover-eyebrow', `${catLabel(tpl.cats?.[0] ?? (locale === 'en' ? 'Template' : '模板'), locale)} · ${fwLabel(framework, locale)}`)}</span>
          <h1${edAttr('cover-title')}>${ed('cover-title', display.a)}</h1>
          <p class="doc-lead" ${edAttr('cover-sub')}>${ed('cover-sub', display.b ?? '')}</p></header>`
        break
      case 'closing':
        inner = `<footer class="doc-cover doc-closing">${docArt(deck, page, 0, locale)}
          <h2${edAttr('closing-title')}>${ed('closing-title', T.closing)}</h2>
          <p class="doc-lead"${edAttr('closing-sub')}>${ed('closing-sub', display.a)}</p></footer>`
        break
      case 'divider':
        inner = `<div class="doc-divider"><span class="doc-big-no">${String(page.no).padStart(2, '0')}</span>${docArt(deck, page, 0, locale)}
          <h2${edAttr('title')}>${ed('title', T.sections[page.titleIdx])}</h2></div>`
        break
      case 'agenda':
        inner = `${head}<ol class="doc-toc">${T.sections.slice(0, Math.min(8, tpl.pageCount - 4)).map((s, k) =>
          `<li><i>${String(k + 1).padStart(2, '0')}</i><span class="db-editable" contenteditable="true" data-edit="agenda${k}">${ed(`agenda${k}`, s)}</span></li>`).join('')}</ol>${docArt(deck, page, 0, locale)}`
        break
      case 'stats':
        inner = `${head}<div class="doc-stats">${[0, 1, 2, 3].map((k) => `<div class="doc-stat"><b class="db-editable" contenteditable="true" data-edit="stat-value${k}">${ed(`stat-value${k}`, `${60 + ((page.no * 7 + k * 13) % 38)}%`)}</b><span class="db-editable" contenteditable="true" data-edit="stat-label${k}">${ed(`stat-label${k}`, T.stats[(page.no + k) % T.stats.length])}</span></div>`).join('')}</div>${body}`
        break
      case 'big-stat':
        inner = `<div class="doc-bigstat">${docArt(deck, page, 0, locale)}<div><span class="doc-eyebrow db-editable" contenteditable="true" data-edit="eyebrow">${ed('eyebrow', T.stats[page.statLabelIdx])}</span><b class="doc-bigno db-editable" contenteditable="true" data-edit="stat-value0">${ed('stat-value0', `${page.statNum}%`)}</b></div></div>
          <p class="doc-lead"${edAttr('sub')}>${ed('sub', T.subtitles[page.subIdx])}</p>${body}`
        break
      case 'quote':
      case 'testimonial':
        inner = `<blockquote class="doc-quote">${docArt(deck, page, 0, locale)}<p class="db-editable" contenteditable="true" data-edit="quote">${ed('quote', T.quotes[page.quoteIdx])}</p><cite>— ${display.name}</cite></blockquote>`
        break
      case 'timeline':
      case 'process':
        inner = `${head}<ol class="doc-steps">${T.steps.map((s, k) => `<li><b>${k + 1}</b><span class="db-editable" contenteditable="true" data-edit="step${k}">${ed(`step${k}`, s)}</span></li>`).join('')}</ol>`
        break
      case 'comparison':
        inner = `${head}<div class="doc-compare"><div><h4 class="db-editable" contenteditable="true" data-edit="cmp-left-title">${ed('cmp-left-title', T.compare.leftTitle)}</h4><ul>${T.compare.left.map((s, k) => `<li class="db-editable" contenteditable="true" data-edit="cmp-l${k}">${ed(`cmp-l${k}`, s)}</li>`).join('')}</ul></div><div><h4 class="db-editable" contenteditable="true" data-edit="cmp-right-title">${ed('cmp-right-title', T.compare.rightTitle)}</h4><ul>${T.compare.right.map((s, k) => `<li class="db-editable" contenteditable="true" data-edit="cmp-r${k}">${ed(`cmp-r${k}`, s)}</li>`).join('')}</ul></div></div>`
        break
      case 'table':
        inner = `${head}<table class="doc-table"><thead><tr>${T.tableHead.map((h, k) => `<th class="db-editable" contenteditable="true" data-edit="th${k}">${ed(`th${k}`, h)}</th>`).join('')}</tr></thead><tbody>${T.tableDims.map((s, r) => `<tr><td class="db-editable" contenteditable="true" data-edit="cell-${r}-0">${ed(`cell-${r}-0`, s)}</td><td class="db-editable" contenteditable="true" data-edit="cell-${r}-1">${ed(`cell-${r}-1`, `${60 + r * 7}%`)}</td><td class="db-editable" contenteditable="true" data-edit="cell-${r}-2">${ed(`cell-${r}-2`, `${85 + r * 3}%`)}</td><td class="db-editable" contenteditable="true" data-edit="cell-${r}-3">${ed(`cell-${r}-3`, T.roles[r])}</td></tr>`).join('')}</tbody></table>`
        break
      case 'faq':
        inner = `${head}<div class="doc-faq">${T.faqs.slice(0, 4).map((q, k) => `<details ${k === 0 ? 'open' : ''}><summary class="db-editable" contenteditable="true" data-edit="faq-q${k}">${ed(`faq-q${k}`, q)}</summary><p class="db-editable" contenteditable="true" data-edit="faq-a${k}">${ed(`faq-a${k}`, T.bodies[(page.bodyIdx[0] + k) % T.bodies.length])}</p></details>`).join('')}</div>`
        break
      case 'bars':
        inner = `${head}<ul class="doc-bars">${T.stats.slice(0, 6).map((s, k) => { const v = 45 + ((page.no * 11 + k * 13) % 50); return `<li><span class="db-editable" contenteditable="true" data-edit="bar-label${k}">${ed(`bar-label${k}`, s)}</span><i style="width:${v}%"></i><b class="db-editable" contenteditable="true" data-edit="bar-value${k}">${ed(`bar-value${k}`, `${v}%`)}</b></li>` }).join('')}</ul>`
        break
      case 'line-chart':
        inner = `${head}<svg class="doc-line" viewBox="0 0 600 260" preserveAspectRatio="none" role="img"><polyline points="${Array.from({ length: 9 }, (_, k) => `${30 + k * 67},${210 - ((page.no * 17 + k * 19) % 160)}`).join(' ')}" fill="none" stroke="var(--dp-accent)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="doc-lead"${edAttr('sub')}>${ed('sub', T.subtitles[page.subIdx])}</p>`
        break
      case 'map':
        inner = `${head}${docArt(deck, page, 0, locale)}<p class="doc-lead"${edAttr('map-lead')}>${ed('map-lead', T.mapLead)}</p>`
        break
      case 'gallery':
        inner = `${head}${grid(page, [0, 1, 2, 3], 'four')}${body}`
        break
      case 'triple-grid':
      case 'team':
      case 'cards':
      case 'pricing':
        inner = `${head}${grid(page, [0, 1, 2], 'three')}${body}`
        break
      case 'two-image':
        inner = `${head}${grid(page, [0, 1], 'two')}${body}`
        break
      case 'logos':
        inner = `${head}${grid(page, [0], 'wide')}`
        break
      case 'index-list':
        inner = `${head}<ul class="doc-index">${T.sections.map((s, k) => `<li><span class="db-editable" contenteditable="true" data-edit="index${k}">${ed(`index${k}`, s)}</span><i>${String(k + 3).padStart(2, '0')}</i></li>`).join('')}</ul>`
        break
      default:
        inner = `<div class="doc-prose">${head}${body}<p${edAttr('body1')}>${ed('body1', T.bodies[page.bodyIdx[1]])}</p>${docArt(deck, page, 0, locale)}</div>`
    }
    return `<section class="doc-block doc-lay-${L}" data-no="${page.no}" data-layout="${L}">${inner}</section>`
  }).join('')

  const esc = (s) => String(s ?? '').replace(/</g, '&lt;')
  const editOf = (b) => `<span class="db-editable db-block-edit" contenteditable="true" data-block-edit="${b.id}">${esc(b.text)}</span>`
  const mediaUrl = (b, hint) => (b.url
    ? (/\.(mp4|webm|ogg)(\?|$)/i.test(b.url)
      ? `<video class="doc-frame-media" src="${esc(b.url)}" controls></video>`
      : `<iframe class="doc-frame-media" src="${esc(b.url)}" title="${esc(b.text)}" loading="lazy" allowfullscreen></iframe>`)
    : `<button type="button" class="doc-media-empty" data-block-url="${b.id}" data-prompt="${hint}">＋ ${locale === 'en' ? 'Paste a media URL to enable this block' : '粘贴媒体地址后启用该版块'}</button>`)
  const renderCustomBlock = (b) => {
    const del = `<button type="button" class="doc-block-del" data-block-del="${b.id}" aria-label="删除版块">×</button>`
    let inner = ''
    switch (b.kind) {
      case 'h1': inner = `<h1 class="db-doc-h1">${editOf(b)}</h1>`; break
      case 'h2': inner = `<h2 class="db-doc-h2">${editOf(b)}</h2>`; break
      case 'h3': inner = `<h3 class="db-doc-h3">${editOf(b)}</h3>`; break
      case 'h4': inner = `<h4 class="db-doc-h4">${editOf(b)}</h4>`; break
      case 'quote': inner = `<blockquote class="doc-quote">${editOf(b)}</blockquote>`; break
      case 'caption': inner = `<p class="doc-caption">${editOf(b)}</p>`; break
      case 'label': inner = `<p class="doc-label">${editOf(b)}</p>`; break
      case 'divider': inner = '<hr class="doc-divider">'; break
      case 'image':
        inner = `<figure class="doc-custom-fig">
          ${b.src ? `<img src="${esc(b.src)}" alt="${esc(b.text)}">`
            : `<button type="button" class="doc-img-empty" data-block-image="${b.id}">＋ ${locale === 'en' ? 'Upload an image' : '点击上传图片'}</button>`}
          <figcaption>${editOf(b)}</figcaption></figure>`
        break
      case 'gallery':
        inner = `<div class="doc-custom-gallery">${editOf(b)}
          <div class="doc-gallery-row"><i></i><i></i><i></i></div></div>`
        break
      case 'card':
        inner = `<div class="doc-custom-card"><h3>${editOf(b)}</h3>
          <p>${locale === 'en' ? 'Supporting detail goes here — click to edit the heading above.' : '辅助说明文字，点击上方标题即可编辑。'}</p></div>`
        break
      case 'columns':
        inner = `<div class="doc-custom-columns"><div>${editOf(b)}</div>
          <div>${locale === 'en' ? 'Second column: use the add-block menu to insert more content.' : '第二栏：可继续通过「添加版块」补充内容。'}</div></div>`
        break
      case 'stat':
        inner = `<div class="doc-custom-stat"><b>${editOf(b)}</b>
          <span>${locale === 'en' ? 'Key metric label' : '关键指标标签'}</span></div>`
        break
      case 'bars':
        inner = `<div class="doc-custom-bars"><p>${editOf(b)}</p>
          <div class="doc-bars"><i style="--w:92%"></i><i style="--w:74%"></i><i style="--w:56%"></i></div></div>`
        break
      case 'video':
        inner = `<figure class="doc-media">${mediaUrl(b, locale === 'en' ? 'Paste video URL (mp4 / YouTube / Vimeo)' : '粘贴视频地址（mp4 / YouTube / Vimeo）')}
          <figcaption>${editOf(b)}</figcaption></figure>`
        break
      case 'embed':
        inner = `<figure class="doc-media">${mediaUrl(b, locale === 'en' ? 'Paste embed URL (https://…)' : '粘贴嵌入地址（https://…）')}
          <figcaption>${editOf(b)}</figcaption></figure>`
        break
      case 'input':
        inner = `<label class="doc-form-input"><span>${editOf(b)}</span><input type="text" readonly placeholder="${locale === 'en' ? 'Preview only' : '仅作排版预览'}"></label>`
        break
      case 'button':
        inner = `<div class="doc-form-btn"><button type="button" class="doc-cta">${editOf(b)}</button></div>`
        break
      default: inner = `<p>${editOf(b)}</p>`
    }
    return `<section class="doc-block doc-custom doc-kind-${b.kind}" data-block-id="${b.id}">${del}${inner}</section>`
  }
  const custom = extraBlocks.map(renderCustomBlock).join('')

  return `<article class="db-doc ifr-${framework.imgFrame} head-${framework.heading}" style="${rootVars}" data-tpl="${tpl.id}">${blocks}${custom}</article>`
}
