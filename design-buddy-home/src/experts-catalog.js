/* ============================================================
   专家目录：只保留这个产品真正要解决的问题
   —— 对齐 Design Buddy / Gamma / OpenDesign 的实际能力：
      一句话到成套演示、版式与品牌统一、长文档与报告、社媒物料、
      可运行网页原型、导入导出保真。
   每张卡片都写清「它能解决什么」，不做与产品无关的泛行业专家。
   - EXPERT_CATEGORIES：顶部六大问题场景卡
   - EXPERT_FILTERS：分类 chips（「全部」+ 六个场景）
   - EXPERT_CATALOG：专家/专家团，usage 为调用次数，formatUsage 转「28.51w」
   固定状态不在这里，而在 store.state.experts（与首页专家子菜单共享）。
   ============================================================ */

export const EXPERT_FILTERS = ['全部', '提案演示', '品牌视觉', '文档报告', '社媒增长', '网站原型', '导入与交付']

export const EXPERT_CATEGORIES = [
  {
    id: 'cat-deck', name: '提案与演示', filter: '提案演示',
    gradient: 'linear-gradient(135deg,#ece4ff,#d8cbff)',
    art: '/art/illustration/proposal.sign.svg',
    icon: 'M3 3h18v12H3zM8 21h8M12 15v6',
    subs: ['提案叙事专家', '演讲口播教练', '投标提案小组'],
  },
  {
    id: 'cat-brand', name: '品牌与视觉', filter: '品牌视觉',
    gradient: 'linear-gradient(135deg,#e0f4e7,#c7e8d4)',
    art: '/art/illustration/brand.guide.svg',
    icon: 'M12 2a10 10 0 1 0 0 20 2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5h2a6 6 0 0 0 6-6 10 10 0 0 0-8-4z',
    subs: ['设计系统管家', '版式设计师', '配图与插画师'],
  },
  {
    id: 'cat-doc', name: '文档与报告', filter: '文档报告',
    gradient: 'linear-gradient(135deg,#fdeee2,#f8dcc6)',
    art: '/art/illustration/course.board.svg',
    icon: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6',
    subs: ['长文档与白皮书专家', '改稿与精简编辑', '数据图表师'],
  },
  {
    id: 'cat-social', name: '社媒与增长', filter: '社媒增长',
    gradient: 'linear-gradient(135deg,#e3f4eb,#c9e9d7)',
    art: '/art/illustration/art.brush.svg',
    icon: 'M4 20l4-1 9-9-3-3-9 9zM14 6l3 3',
    subs: ['社媒轮播编导', '一稿多用改编师', '新品发布小组'],
  },
  {
    id: 'cat-web', name: '网站与原型', filter: '网站原型',
    gradient: 'linear-gradient(135deg,#dfeafb,#c2d8f7)',
    art: '/art/illustration/report.dashboard.svg',
    icon: 'M3 4h18v16H3zM3 9h18M8 14h8',
    subs: ['网页原型工程师', '落地页文案师', '多端适配检查员'],
  },
  {
    id: 'cat-deliver', name: '导入与交付', filter: '导入与交付',
    gradient: 'linear-gradient(135deg,#e9ebf1,#d5dae5)',
    art: '/art/illustration/art.gallery.svg',
    icon: 'M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    subs: ['导入导出修复师', '交付质检员', '交付交接小组'],
  },
]

// kind: expert = 专家，team = 专家团；createdAt 供「最新」排序
// solves：它到底解决什么问题（卡片和详情里都会露出）
export const EXPERT_CATALOG = [
  {
    id: 'ec-deck-writer', name: '提案叙事专家', kind: 'expert', category: '提案演示',
    desc: '把一句需求写成有主线的提案大纲，再逐页落成初稿',
    tags: ['大纲结构', '故事线', '页面节奏'], usage: 328400, color: 'av-teal', createdAt: '2026-09-12',
    persona: '陆非', version: 'v2.3.0',
    solves: ['打开空白页，不知道第一页该写什么', '素材很多，但讲不出一条主线', '客户只给 10 分钟，不知道砍哪几页'],
    prompts: [
      '帮我把这次需求拆成大纲',
      '下周要给一家制造业客户做数字化方案提案，只有两轮沟通机会。请先给出 12 页的大纲：每页一句话主张、要用的素材类型，并标出哪三页是决策人最关心的。',
      '这份初稿的主线不够清楚，帮我重排顺序',
    ],
  },
  {
    id: 'ec-slide-designer', name: '版式设计师', kind: 'expert', category: '品牌视觉',
    desc: '同一份内容排出疏密得当的版式，标题、正文与留白互不打架',
    tags: ['版式栅格', '信息密度', '视觉层级'], usage: 261900, color: 'av-amber', createdAt: '2026-09-25',
    persona: '于小满', version: 'v1.8.2',
    solves: ['内容全塞在一页，挤成一团', '标题正文没有层级，观众找不到重点', '换了模板就全乱，只能一页页重排'],
    prompts: [
      '这一页信息太多，帮我降密度',
      '我这页有 6 个要点、2 张图和一段说明，读者反馈看不下去。请给出三种版式方案（分屏 / 上下 / 卡片），说明各自适合什么场景，并指出该删掉哪些字。',
      '给这套 deck 统一一下版式规范',
    ],
  },
  {
    id: 'ec-brand-guardian', name: '设计系统管家', kind: 'expert', category: '品牌视觉',
    desc: '把品牌色、字体与间距固化成一套规范，之后每份产出自动统一',
    tags: ['品牌色板', '字体规范', '组件一致性'], usage: 143700, color: 'av-navy', createdAt: '2026-08-18',
    persona: '简宁', version: 'v1.5.0',
    solves: ['每份提案看起来像不同公司做的', '同事各自挑颜色，品牌被慢慢稀释', '新人想做出合规稿子却没依据'],
    prompts: [
      '帮我把品牌整理成一套规范',
      '我们是 B 端 SaaS，主色深蓝、辅助色青绿。请给出一套可落地的设计系统：色板与用法比例、标题与正文字号阶梯、间距基准、图表配色，并说明在演示、文档、网页三种产出里怎么复用。',
      '检查这份稿子有没有破坏品牌规范',
    ],
  },
  {
    id: 'ec-data-viz', name: '数据图表师', kind: 'expert', category: '文档报告',
    desc: '挑对图型、去掉噪音，让数字自己把结论说出来',
    tags: ['图型选择', '对比逻辑', '结论提炼'], usage: 205600, color: 'av-slate', createdAt: '2026-07-30',
    persona: '周衡', version: 'v2.0.1',
    solves: ['数据堆成表格，没人看得下去', '图表做得漂亮，但看不出结论', '不知道该用柱状、折线还是散点'],
    prompts: [
      '这组数据用什么图最合适',
      '我有三个渠道 12 个月的收入、成本和转化率，想说明「增长靠 A，利润靠 B」。请给出图型选择、每张图的标题结论句，以及必须删掉的装饰元素。',
      '把这张图改成一页能看懂的对比图',
    ],
  },
  {
    id: 'ec-illustrator', name: '配图与插画师', kind: 'expert', category: '品牌视觉',
    desc: '按内容与调性挑图或生成插画，整份稿子风格统一不违和',
    tags: ['配图风格', '插画生成', '素材合规'], usage: 187300, color: 'av-rose', createdAt: '2026-09-03',
    persona: '米雅', version: 'v1.9.4',
    solves: ['页面只有文字，看起来干巴巴', '东拼西凑的配图风格不统一', '找不到可商用又不撞车的素材'],
    prompts: [
      '这几页需要什么风格的配图',
      '这是一份面向制造业客户的方案，整体要专业克制。请给出配图策略：哪些页用真实照片、哪些用抽象插画、色温与构图怎么统一，以及每页的配图描述词。',
      '检查全篇配图风格是否一致',
    ],
  },
  {
    id: 'ec-doc-writer', name: '长文档与白皮书专家', kind: 'expert', category: '文档报告',
    desc: '几十页的报告先搭骨架，再控制每节的字数与论证顺序',
    tags: ['文档结构', '篇幅控制', '论证严谨'], usage: 156800, color: 'av-lavender', createdAt: '2026-07-09',
    persona: '沈书', version: 'v1.7.1',
    solves: ['文档越写越长，也越写越散', '章节之间没有递进关系', '领导只想要三页摘要'],
    prompts: [
      '帮我把这份材料搭成白皮书结构',
      '我要写一份 30 页的行业白皮书，主题是制造业的 AI 落地。请给出章节目录、每章字数额度、核心论点顺序，以及开头三页的摘要怎么写。',
      '把这份 8000 字的文档压成 3 页摘要',
    ],
  },
  {
    id: 'ec-social-carousel', name: '社媒轮播编导', kind: 'expert', category: '社媒增长',
    desc: '把一份长内容切成 5–10 张轮播，每张只讲一件事',
    tags: ['轮播脚本', '平台尺寸', '首图钩子'], usage: 231500, color: 'av-orange', createdAt: '2026-08-20',
    persona: '陶乐', version: 'v1.6.3',
    solves: ['一篇内容不知道怎么拆成多图', '每张图信息太满，没人滑到最后', '同一套物料要适配好几个平台尺寸'],
    prompts: [
      '把这篇文章拆成 8 张轮播',
      '这份稿子要发小红书和公众号。请拆成 8 张轮播：每张一句标题 + 一句正文 + 配图建议，第一张要有钩子，最后一张给行动号召，并标注两个平台的尺寸差异。',
      '检查这组轮播的滑动节奏',
    ],
  },
  {
    id: 'ec-content-repurpose', name: '一稿多用改编师', kind: 'expert', category: '社媒增长',
    desc: '一次内容产出，改编成演示、文档、轮播与短文案四个版本',
    tags: ['多格式改编', '口径一致', '平台适配'], usage: 168200, color: 'av-gold', createdAt: '2026-10-02',
    persona: '文多多', version: 'v1.2.6',
    solves: ['同一件事要重复做好几遍', '各个渠道版本说法互相打架', '改了一处，别处忘了同步'],
    prompts: [
      '把这份方案改编成四个版本',
      '我有一份 20 页的产品方案。请改编成：10 页汇报版、2 页客户一页纸、6 张社媒轮播、300 字公众号开头，并保证核心口径与数字完全一致。',
      '检查各个渠道版本有没有说法冲突',
    ],
  },
  {
    id: 'ec-web-prototype', name: '网页原型工程师', kind: 'expert', category: '网站原型',
    desc: '描述需求就产出可运行的 HTML 原型，能直接点、直接改',
    tags: ['可运行 HTML', '响应式', '落地页'], usage: 274900, color: 'av-green', createdAt: '2026-09-28',
    persona: '方野', version: 'v2.1.0',
    solves: ['想做落地页，但排期排不到开发', '原型只是图片，客户点不了', '改一句话也要重新找人做'],
    prompts: [
      '帮我做一个产品落地页原型',
      '做一个 B 端产品的落地页原型：首屏主张 + 三个能力卡片 + 客户证言 + 表单。要求单文件 HTML、跟随品牌色、桌面与手机都能看，按钮和卡片要有真实交互。',
      '这个原型在手机上排版有问题，帮我修',
    ],
  },
  {
    id: 'ec-web-copy', name: '落地页文案师', kind: 'expert', category: '网站原型',
    desc: '把功能清单翻译成访客愿意读下去的首屏主张与卖点',
    tags: ['首屏主张', '卖点排序', '行动号召'], usage: 134600, color: 'av-cyan', createdAt: '2026-10-11',
    persona: '顾言', version: 'v1.1.4',
    solves: ['首屏全是功能名词，访客三秒就走', '卖点列了十条，没有一条记得住', '不知道按钮上该写什么'],
    prompts: [
      '帮我写落地页首屏文案',
      '我们的产品是给小团队用的 AI 设计工具。请给三版首屏主张（各 12 字以内）+ 一句副标题 + 三个卖点，并说明每版适合什么投放渠道。',
      '这版文案太像内部说明，改成说人话',
    ],
  },
  {
    id: 'ec-editor-in-chief', name: '改稿与精简编辑', kind: 'expert', category: '文档报告',
    desc: '删套话、压篇幅、换成人话，让稿子读起来不像 AI 写的',
    tags: ['去 AI 腔', '压缩篇幅', '文风统一'], usage: 312600, color: 'av-purple', createdAt: '2026-09-05',
    persona: '林见', version: 'v1.8.0',
    solves: ['一眼就能看出是 AI 写的', '字数超了一倍，还得往下砍', '一句话三个形容词，说不清重点'],
    prompts: [
      '把这段改写成像人写的',
      '这段 800 字的介绍太空。请改写成 300 字：保留事实与数字，删掉所有形容词堆砌和过渡套话，句式长短交错，读起来像从业者在说话。',
      '这版超字数了，帮我压到一半',
    ],
  },
  {
    id: 'ec-speaker-coach', name: '演讲口播教练', kind: 'expert', category: '提案演示',
    desc: '按页写讲稿、标好时长与停顿，上台不用背稿',
    tags: ['讲稿撰写', '时间控制', '问答准备'], usage: 129400, color: 'av-teal', createdAt: '2026-08-11',
    persona: '邢舟', version: 'v1.3.2',
    solves: ['稿子做完了，上台还是不知道说什么', '10 分钟的环节讲成了 25 分钟', '被追问时当场答不上来'],
    prompts: [
      '按这 12 页帮我写 10 分钟讲稿',
      '我有 12 页方案，只给 10 分钟。请写出逐页讲稿（每页标注秒数）、两处停顿与一个反问，最后预判评审最可能追问的 5 个问题并给答案。',
      '彩排时超时了，帮我砍讲稿',
    ],
  },
  {
    id: 'ec-prompt-architect', name: '需求翻译官', kind: 'expert', category: '提案演示',
    desc: '把一句模糊想法翻译成结构化需求，让生成一次就到位',
    tags: ['需求澄清', '结构化提示', '约束设定'], usage: 268100, color: 'av-teal', createdAt: '2026-10-08',
    persona: '苏答', version: 'v1.2.0',
    solves: ['不知道该怎么描述才出得来', '生成结果总差一点意思，只能反复抽卡', '改来改去，不如重写一遍'],
    prompts: [
      '帮我补全这个需求描述',
      '我只想好了「做一份给经销商的季度回顾」，但不知道该交代什么。请反问我 5 个关键问题，再把我的回答整理成一段可直接使用的结构化需求（含受众、页数、风格、必须包含的内容）。',
      '我这个提示词该怎么改才稳定',
    ],
  },
  {
    id: 'ec-import-fixer', name: '导入导出修复师', kind: 'expert', category: '导入与交付',
    desc: '把 PPT / PDF 搬进来不跑版，交付时再原样导回去',
    tags: ['格式还原', '脏数据清理', '高保真导出'], usage: 98200, color: 'av-green', createdAt: '2026-07-17',
    persona: '何立', version: 'v1.4.5',
    solves: ['旧 PPT 导进来全跑版', '字体和图片丢失，得一张张重贴', '交付要 PPT，但内容是在别处做的'],
    prompts: [
      '这份导入的 PPT 排版乱了，帮我修',
      '我从旧 PPT 导入了 30 页，出现字体替换、图文错位、母版丢失三类问题。请给出逐项修复顺序，以及哪些页建议直接重排而不是硬修。',
      '导出成 PPT 后要注意哪些保真问题',
    ],
  },

  {
    id: 'ec-responsive-audit', name: '多端适配检查员', kind: 'expert', category: '网站原型',
    desc: '同一个页面在手机、平板、大屏上都不许错位',
    tags: ['断点设计', '触控尺寸', '兼容回归'], usage: 118400, color: 'av-cyan', createdAt: '2026-09-15',
    persona: '许澄', version: 'v1.2.3',
    solves: ['大屏好看，手机上按钮挤成一团', '各断点分别改，漏一处就露馅', '交付后客户在平板上打开就错位'],
    prompts: [
      '帮我检查这个页面在手机上有没有问题',
      '这是一版落地页，主要在手机上投放。请按 375 / 768 / 1440 三个宽度列出会出问题的地方：字号、按钮触控区、图片比例、横向滚动，并给出修复优先级。',
      '给这套物料定一套响应式规范',
    ],
  },
  {
    id: 'ec-delivery-checker', name: '交付质检员', kind: 'expert', category: '导入与交付',
    desc: '导出前逐项过一遍：字体、图片、链接、页码和错位',
    tags: ['导出保真', '资源自检', '交付清单'], usage: 96300, color: 'av-slate', createdAt: '2026-08-27',
    persona: '华清', version: 'v1.3.0',
    solves: ['导出后才发现字体被替换', '图片是外链，客户打开是空白', '交出去的稿子里还留着占位符'],
    prompts: [
      '帮我做一份交付前检查清单',
      '这份 40 页的方案明天要交给客户。请给出一份逐项可勾选的交付清单：字体与字号、图片分辨率与外链、超链接、页码、图表数据来源、占位符残留，并标出哪几项最容易漏。',
      '检查这版导出稿有哪些保真问题',
    ],
  },

  /* ---------- 专家团：多个角色接力，解决单角色做不完的活 ---------- */
  {
    id: 'ec-team-proposal', name: '投标提案小组', kind: 'team', category: '提案演示', badge: '多角色',
    desc: '叙事 + 版式 + 数据三个角色接力，48 小时交一份完整标书',
    tags: ['多角色协作', '标书结构', '时间倒排'], usage: 86400, color: 'av-blue', createdAt: '2026-10-14',
    persona: '提案组', version: 'v1.0.6',
    solves: ['标书要得急，一个人顶不下来', '技术部分和商务部分各说各的', '评审关注点没被正面回答'],
    prompts: [
      '48 小时要交一份标书，怎么分工',
      '我们有三个人、两天时间，要交一份 60 页的数字化项目标书。请拆出角色分工与时间倒排表，并给出一份评分表对照清单。',
      '检查这份标书有没有内部矛盾',
    ],
  },
  {
    id: 'ec-team-launch', name: '新品发布小组', kind: 'team', category: '社媒增长', badge: '多角色',
    desc: '从发布口径到主视觉再到轮播，一套素材一次出齐',
    tags: ['发布节奏', '主视觉', '多尺寸物料'], usage: 74800, color: 'av-rose', createdAt: '2026-10-05',
    persona: '发布组', version: 'v1.1.2',
    solves: ['发布会前三天才定稿', '主视觉和社媒图风格对不上', '同一件事要出五种尺寸'],
    prompts: [
      '帮我排一份新品发布物料清单',
      '我们下月发布一款硬件产品。请给出完整物料清单（主视觉、发布会 deck、社媒轮播、落地页、通稿），标注每项的交付时间与尺寸规范。',
      '检查这版主视觉能不能撑起全渠道',
    ],
  },
  {
    id: 'ec-team-rebrand', name: '品牌焕新小组', kind: 'team', category: '品牌视觉', badge: '多角色',
    desc: '先定设计系统，再回刷全部存量物料',
    tags: ['品牌升级', '存量清理', '规范落地'], usage: 42600, color: 'av-navy', createdAt: '2026-09-19',
    persona: '焕新组', version: 'v1.0.3',
    solves: ['换了 logo 之后旧物料全过时', '各部门各用一版视觉', '规范写完没人真的执行'],
    prompts: [
      '品牌升级后要回刷哪些物料',
      '我们刚换了品牌色和字体。请列出需要更新的存量物料清单与优先级，给出三个月落地排期，以及如何用一条规范约束所有新产出。',
      '检查各部门交上来的稿子是否合规',
    ],
  },
  {
    id: 'ec-team-handover', name: '交付交接小组', kind: 'team', category: '导入与交付', badge: '多角色',
    desc: '质检 + 归档 + 交接，把成品完整交给客户或工程',
    tags: ['多角色协作', '归档规范', '交接文档'], usage: 38900, color: 'av-green', createdAt: '2026-10-18',
    persona: '交接组', version: 'v1.0.2',
    solves: ['交付之后没人说得清哪一版是最终版', '工程拿到稿子还要重做一遍', '客户要可编辑源文件，拿不出来'],
    prompts: [
      '帮我把这版交付规范化',
      '项目要结束了，需要把成品交给客户和工程两边。请给出归档结构、命名规范、交接文档清单（含源文件、导出件、素材授权），以及验收确认流程。',
      '检查这次交接有没有漏项',
    ],
  },
]

// 285100 → '28.51w'；97000 → '9.7w'
export function formatUsage(n) {
  const wan = n / 10000
  const text = Number.isInteger(wan) ? String(wan) : wan.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${text}w`
}
