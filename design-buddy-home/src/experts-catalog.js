/* ============================================================
   专家目录：办公问题 → 专家 → 技能
   对齐 Gamma 研究结论（8 类办公痛点 → 11 个专家的团队架构）：
   - Manager Agent：总调度，拆解任务、调度专家、验收交付
   - 10 位专业专家：行政办公 / 自动化流程 / 研究分析 / PPT /
     文档 / 内容优化 / 视觉设计 / AI 图片 / 模板与品牌 / 质量审核
   - 网页原型工程师：本产品核心能力（可运行 HTML 原型），保留
   每张卡片都写清「它能解决什么」，不做与产品无关的泛行业专家。
   - EXPERT_CATEGORIES：顶部问题场景卡
   - EXPERT_FILTERS：分类 chips
   - EXPERT_CATALOG：专家，usage 为调用次数，formatUsage 转「28.51w」
   固定状态不在这里，而在 store.state.experts（与首页专家子菜单共享）。
   ============================================================ */

export const EXPERT_FILTERS = ['全部', '提案演示', '品牌视觉', '文档报告', '网站原型', '导入与交付', '办公协同', '研究分析', '总调度']

export const EXPERT_CATEGORIES = [
  {
    id: 'cat-deck', name: '提案与演示', filter: '提案演示',
    gradient: 'linear-gradient(135deg,#ece4ff,#d8cbff)',
    art: '/art/illustration/proposal.sign.svg',
    icon: 'M3 3h18v12H3zM8 21h8M12 15v6',
    subs: ['PPT 专家'],
  },
  {
    id: 'cat-brand', name: '品牌与视觉', filter: '品牌视觉',
    gradient: 'linear-gradient(135deg,#e0f4e7,#c7e8d4)',
    art: '/art/illustration/brand.guide.svg',
    icon: 'M12 2a10 10 0 1 0 0 20 2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5h2a6 6 0 0 0 6-6 10 10 0 0 0-8-4z',
    subs: ['视觉设计专家', 'AI 图片专家', '模板与品牌专家'],
  },
  {
    id: 'cat-doc', name: '文档与报告', filter: '文档报告',
    gradient: 'linear-gradient(135deg,#fdeee2,#f8dcc6)',
    art: '/art/illustration/course.board.svg',
    icon: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6',
    subs: ['文档专家', '内容优化专家'],
  },
  {
    id: 'cat-web', name: '网站与原型', filter: '网站原型',
    gradient: 'linear-gradient(135deg,#dfeafb,#c2d8f7)',
    art: '/art/illustration/report.dashboard.svg',
    icon: 'M3 4h18v16H3zM3 9h18M8 14h8',
    subs: ['网页原型工程师'],
  },
  {
    id: 'cat-deliver', name: '导入与交付', filter: '导入与交付',
    gradient: 'linear-gradient(135deg,#e9ebf1,#d5dae5)',
    art: '/art/illustration/art.gallery.svg',
    icon: 'M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
    subs: ['质量审核专家'],
  },
  {
    id: 'cat-office', name: '办公与协同', filter: '办公协同',
    gradient: 'linear-gradient(135deg,#fdf1e7,#f9e2cf)',
    art: '/art/illustration/proposal.handshake.svg',
    icon: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8',
    subs: ['行政办公专家', '自动化流程专家'],
  },
  {
    id: 'cat-research', name: '研究与情报', filter: '研究分析',
    gradient: 'linear-gradient(135deg,#f3eafc,#e8d7f7)',
    art: '/art/illustration/tech.satellite.svg',
    icon: 'M12 2a7 7 0 0 0-4 12.7V18h8v-3.3A7 7 0 0 0 12 2zM9 21h6M10 18v3M14 18v3',
    subs: ['研究分析专家'],
  },
  {
    id: 'cat-manager', name: '总调度', filter: '总调度',
    gradient: 'linear-gradient(135deg,#e6f0ff,#d3e0fb)',
    art: '/art/illustration/planning.chess.svg',
    icon: 'M9 9V4M15 9V4M9 9h6v6H9zM4 19h16',
    subs: ['Manager Agent'],
  },
]

// kind: expert = 专家；createdAt 供「最新」排序
// solves：它到底解决什么问题（卡片和详情里都会露出）
// skills：该专家负责的可执行技能（与技能页联动）
export const EXPERT_CATALOG = [
  {
    id: 'ec-manager', name: 'Manager Agent', kind: 'expert', category: '总调度', badge: '总调度',
    desc: '拆解任务、调度专家、跟踪进度、验收交付',
    tags: ['任务拆分', '专家调度', '交付验收'], usage: 412000, color: 'av-navy', createdAt: '2026-10-20',
    persona: '司南', version: 'v1.0.0',
    solves: ['任务复杂，不知道该找哪个专家', '多个专家各做一段，拼起来风格不统一', '做完之后没人整体验收'],
    prompts: [
      '帮我拆解这个任务',
      '下季度要给管理层做一份经营分析汇报：数据来自三个部门的月报，需要出一页纸摘要和 12 页汇报。请拆解任务、安排专家，并给出验收标准。',
      '检查这次交付有没有问题',
    ],
    skills: ['任务拆分', '专家调度', '进度跟踪', '交付验收'],
  },
  {
    id: 'ec-office-admin', name: '行政办公专家', kind: 'expert', category: '办公协同',
    desc: '收文件、汇总表格、写纪要与通知，行政琐事一次办完',
    tags: ['文件收集', '表格汇总', '会议纪要'], usage: 96800, color: 'av-green', createdAt: '2026-10-08',
    persona: '周敏', version: 'v1.2.0',
    solves: ['各部门文件催收靠群消息，漏一个就要重发', '月底手工合并十几张表，数字总是错', '会议结束没人整理纪要，行动项没人跟'],
    prompts: [
      '帮我汇总这周各部门提交的表格',
      '月底了，我把市场、运营、财务三个部门的 Excel 放在一个文件夹里，请读取它们，统一字段后合并成一张汇总表，标出缺失数据和重复行。',
      '把这次会议整理成纪要和行动项',
    ],
    skills: ['Excel 合并', '数据去重', '文件分类', '会议纪要', '通知生成', '日程整理'],
  },
  {
    id: 'ec-automation', name: '自动化流程专家', kind: 'expert', category: '办公协同',
    desc: '批量处理文件、定时汇总、自动交付，把重复劳动交给机器',
    tags: ['批量处理', '定时任务', '自动交付'], usage: 121300, color: 'av-slate', createdAt: '2026-10-12',
    persona: '陈舟', version: 'v1.1.0',
    solves: ['同样的报表每周都要手工做一遍', '文件一多就没法一个个处理', '做完还要逐个发送，容易漏'],
    prompts: [
      '把每周重复的工作自动化',
      '每周五要汇总各渠道的销售数据并发送。请设计自动化流程：读取指定文件夹的新文件、合并、生成周报、按名单发送，并说明失败重试策略。',
      '帮我批量处理这一批文件',
    ],
    skills: ['批量文件读取', '文件夹监听', '表格自动汇总', '定时任务', 'API/MCP 集成', '自动交付'],
  },
  {
    id: 'ec-research', name: '研究分析专家', kind: 'expert', category: '研究分析',
    desc: '检索资料、对比多文件、统计数据、核查来源',
    tags: ['资料检索', '多文件对比', '数据核查'], usage: 158700, color: 'av-indigo', createdAt: '2026-10-05',
    persona: '苏明', version: 'v1.3.0',
    solves: ['资料散落在 Word、PDF 和网页里，找不全', '多个版本对比靠肉眼，容易漏掉改动', '数据来源说不清，汇报被挑战'],
    prompts: [
      '帮我对比这几份资料',
      '我把竞品的产品白皮书、官网介绍和一份第三方测评放在文件夹里，请对比功能清单、定价策略和差异点，标出矛盾之处。',
      '这些数据来源可靠吗',
    ],
    skills: ['网页检索', 'PDF 阅读', '多文件对比', '竞品分析', '数据统计', '来源引用'],
  },
  {
    id: 'ec-ppt', name: 'PPT 专家', kind: 'expert', category: '提案演示',
    desc: '大纲规划、故事线、页面布局、图表与演讲备注',
    tags: ['大纲规划', '故事线', '页面布局'], usage: 389200, color: 'av-purple', createdAt: '2026-10-15',
    persona: '方远', version: 'v2.1.0',
    solves: ['打开空白页不知道第一页写什么', '素材很多但讲不出一条主线', '图表做了但看不出结论'],
    prompts: [
      '帮我规划这份演示的大纲',
      '给管理层汇报数字化转型进展，12 页，只有 15 分钟。请给出每页一句话主张、图表类型和演讲备注，标出决策人最关心的三页。',
      '这一页信息太多，帮我降密度',
    ],
    skills: ['大纲规划', '故事线设计', '页数控制', '页面布局', '图表制作', '演讲备注', 'PPT 导出'],
  },
  {
    id: 'ec-doc', name: '文档专家', kind: 'expert', category: '文档报告',
    desc: '方案撰写、报告生成、公文格式、合同要点提取',
    tags: ['方案撰写', '报告生成', '公文格式'], usage: 142600, color: 'av-navy', createdAt: '2026-10-10',
    persona: '沈知', version: 'v1.4.0',
    solves: ['面对一堆资料不知道如何组织成报告', '公文格式不规范，被打回重改', '合同太长，找不到关键条款'],
    prompts: [
      '帮我写一份项目方案',
      '基于三个部门的月报和一份会议记录，写一份 4000 字的项目进展报告，包含背景、进展、风险和下一步计划，符合内部公文格式。',
      '提取这份合同的要点',
    ],
    skills: ['方案撰写', '报告生成', '公文格式', '合同要点提取', '摘要', 'Word/PDF 转换'],
  },
  {
    id: 'ec-content', name: '内容优化专家', kind: 'expert', category: '文档报告',
    desc: '润色、改写、翻译、摘要、受众适配',
    tags: ['专业润色', '压缩扩写', '多语言'], usage: 263400, color: 'av-teal', createdAt: '2026-10-18',
    persona: '何思', version: 'v1.6.0',
    solves: ['写出来的内容像 AI，一眼看出来', '同样的内容要给不同人看，版本越做越多', '长文没人读完，重点埋在中间'],
    prompts: [
      '帮我润色这段话',
      '请把这段产品介绍改写得更像人写的：去掉套话，突出三个卖点，控制在 120 字以内。',
      '把这份报告压缩成一页纸',
    ],
    skills: ['语气调整', '专业润色', '压缩扩写', '多语言翻译', '受众适配', '文案校对'],
  },
  {
    id: 'ec-visual', name: '视觉设计专家', kind: 'expert', category: '品牌视觉',
    desc: '栅格布局、字体层级、色彩系统、响应式设计',
    tags: ['栅格布局', '字体层级', '视觉一致性'], usage: 197800, color: 'av-amber', createdAt: '2026-10-06',
    persona: '柯岚', version: 'v1.5.0',
    solves: ['内容全塞在一页，挤成一团', '标题正文没有层级，观众找不到重点', '换模板就全乱，只能一页页重排'],
    prompts: [
      '这一页版式怎么排',
      '这页有 6 个要点、2 张图和一段说明，读者反馈看不下去。请给出三种版式方案，说明各自适合什么场景，并指出该删掉哪些字。',
      '给这套产出统一版式规范',
    ],
    skills: ['栅格布局', '字体层级', '色彩系统', '留白', '图文比例', '响应式设计', '视觉一致性'],
  },
  {
    id: 'ec-ai-image', name: 'AI 图片专家', kind: 'expert', category: '品牌视觉',
    desc: '文生图、参考图生成、背景移除、图表插画',
    tags: ['文生图', '图片编辑', '风格统一'], usage: 165200, color: 'av-rose', createdAt: '2026-10-14',
    persona: '云图', version: 'v1.2.0',
    solves: ['页面只有文字，看起来干巴巴', '东拼西凑的配图风格不统一', '找不到可商用又不撞车的素材'],
    prompts: [
      '这几页需要什么配图',
      '这是一份面向制造业客户的方案，整体要专业克制。请给出配图策略：哪些页用真实照片、哪些用抽象插画，并给出每页的配图描述词。',
      '把这张图统一成全套风格',
    ],
    skills: ['文生图', '参考图生成', '背景移除', '图片编辑', '图像裁切', '风格统一', '图表插画'],
  },
  {
    id: 'ec-brand', name: '模板与品牌专家', kind: 'expert', category: '品牌视觉',
    desc: '模板检索、主题切换、品牌规范、设计系统管理',
    tags: ['模板检索', '品牌规范', '设计系统'], usage: 124900, color: 'av-orange', createdAt: '2026-10-02',
    persona: '顾衡', version: 'v1.3.0',
    solves: ['每份产出看起来像不同公司做的', '同事各自挑颜色，品牌被慢慢稀释', '新人想做出合规稿子却没依据'],
    prompts: [
      '帮我找到合适的模板',
      '我们要给三个部门做同一套汇报模板，主色深蓝、辅助色青绿。请给出模板结构、色板与字体阶梯，并说明在演示、文档、网页三种产出里怎么复用。',
      '检查这份稿子有没有破坏品牌规范',
    ],
    skills: ['模板检索', '主题切换', '品牌规范提取', '组件复用', '企业设计系统管理'],
  },
  {
    id: 'ec-qa', name: '质量审核专家', kind: 'expert', category: '导入与交付',
    desc: '事实核验、数字校验、缺项检查、导出验收',
    tags: ['事实核验', '数字校验', '导出验收'], usage: 89400, color: 'av-blue', createdAt: '2026-10-22',
    persona: '严守', version: 'v1.0.0',
    solves: ['汇报前没人检查，数据错了当场翻车', '页面溢出、错别字这类低级问题反复出现', '交付文件在不同设备上打不开'],
    prompts: [
      '帮我审核这份交付物',
      '明天要交付的 12 页方案和一份数据表，请逐项核对：数字是否与原始表一致、有没有错别字、页面是否溢出、导出格式是否兼容。',
      '这版稿子能不能发',
    ],
    skills: ['事实核验', '数字校验', '缺项检查', '错别字检查', '页面溢出检测', '导出结果验收'],
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
    skills: ['原型搭建', '响应式布局', '交互验证'],
  },
]

// 285100 → '28.51w'；97000 → '9.7w'
export function formatUsage(n) {
  const wan = n / 10000
  const text = Number.isInteger(wan) ? String(wan) : wan.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${text}w`
}
