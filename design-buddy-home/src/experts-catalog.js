/* ============================================================
   专家发现目录（写死种子数据，零后端 / 零外部素材）
   - EXPERT_CATEGORIES：顶部横向滚动的六大场景卡
   - EXPERT_FILTERS：分类筛选 chips（「全部」+ 18 个行业分类）
   - EXPERT_CATALOG：专家/专家团卡片，usage 为原始调用次数，
     展示时用 formatUsage 转成「28.51w」样式
   固定状态不在这里，而在 store.state.experts（与首页专家子菜单共享）。
   ============================================================ */

export const EXPERT_FILTERS = [
  '全部', 'OPC·一人公司', '腾讯专家', '双十一', '产品设计', '技术工程', '金融投资',
  '全球发展', '教育学习', '游戏空间', '数据智能', '营销增长', '内容创作', '销售商务',
  '运营人力', '健康医疗', '法务安全', '项目质量', '行业顾问',
]

export const EXPERT_CATEGORIES = [
  {
    id: 'cat-ecom', name: '电商运营', filter: '营销增长', gradient: 'linear-gradient(135deg,#ece4ff,#d8cbff)',
    art: '/art/illustration/retail.storefront.svg',
    icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Zm0 4h12M3 6h18M9 10a3 3 0 0 0 6 0',
    subs: ['中国电商运营专家', '商家宣传页与海报设计师', '跨境电商专家'],
  },
  {
    id: 'cat-content', name: '内容创作', filter: '内容创作', gradient: 'linear-gradient(135deg,#e0f4e7,#c7e8d4)',
    art: '/art/illustration/art.brush.svg',
    icon: 'm9 18 6-6-6-6M15 12H3',
    subs: ['内容创作专家团', '内容创作专家', '微信公众号运营专家'],
  },
  {
    id: 'cat-invest', name: '投资分析', filter: '金融投资', gradient: 'linear-gradient(135deg,#dfeafb,#c2d8f7)',
    art: '/art/illustration/funding.growth.svg',
    icon: 'M3 3v18h18M7 14l4-4 3 3 5-6',
    subs: ['交易分析团队', '股票研究专家', '腾讯自选股股票投研专家团'],
  },
  {
    id: 'cat-legal', name: '法律咨询', filter: '法务安全', gradient: 'linear-gradient(135deg,#e9ebf1,#d5dae5)',
    art: '/art/illustration/proposal.sign.svg',
    icon: 'M12 3v18M5 7h14M7 7l-3 7a4 4 0 0 0 6 0l-3-7Zm10 0-3 7a4 4 0 0 0 6 0l-3-7Z',
    subs: ['法律检索专家', '资深合同法务专家', '财税合规专家团'],
  },
  {
    id: 'cat-smb', name: '小微企业', filter: 'OPC·一人公司', gradient: 'linear-gradient(135deg,#e3f4eb,#c9e9d7)',
    art: '/art/illustration/retail.boutique.svg',
    icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',
    subs: ['销售教练', '微信公众号运营专家', '创业伙伴'],
  },
  {
    id: 'cat-data', name: '数据分析', filter: '数据智能', gradient: 'linear-gradient(135deg,#e2f0fc,#c9e2f8)',
    art: '/art/illustration/report.dashboard.svg',
    icon: 'M4 19V5m6 14V9m6 10v-7m6 7H2',
    subs: ['数据分析报告师', '深度研究团队', '花椒数据分析专家团'],
  },
]

// kind: expert = 专家，team = 专家团；createdAt 供「最新」排序
export const EXPERT_CATALOG = [
  {
    id: 'ec-mentor', name: '创业导师助手', kind: 'expert', category: '教育学习',
    desc: '为创业导师准备辅导、履职与专业成长的全套工作流', tags: ['导师辅导', '履职育人', '专业成长'],
    usage: 285100, color: 'av-teal', createdAt: '2026-09-12',
    persona: '启明', version: 'v1.0.0',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我梳理这周三个学员的辅导进展',
      '我想给团队做一次关于长期主义的分享，请帮我列出提纲、配三个真实案例，并控制在一小时内讲完。',
      '评审我的辅导计划，指出最容易落空的地方',
    ],
  },
  {
    id: 'ec-senior-dev', name: '高级开发工程师', kind: 'expert', category: '技术工程',
    desc: '10年以上全栈经验，精通多种主流框架与工程化体系', tags: ['全栈开发', '架构设计', '代码质量'],
    usage: 11546400, color: 'av-orange', createdAt: '2026-08-02',
    persona: '码叔', version: 'v1.3.2',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我评审这段代码的可维护性',
      '我们需要在两周内上线一个带权限控制的后台管理页，请给出技术选型、任务拆分和上线前的检查清单。',
      '给出这套架构的风险清单和改造顺序',
    ],
  },
  {
    id: 'ec-miniprogram', name: '微信小程序开发者', kind: 'expert', category: '技术工程',
    desc: '精通微信小程序开发框架和生态，覆盖云开发与上线审核', tags: ['小程序开发', '微信生态', 'WXML开发'],
    usage: 3161500, color: 'av-lavender', createdAt: '2026-09-25',
    persona: '小程', version: 'v1.1.0',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我规划小程序首版的页面结构',
      '我们要做一个小程序会员中心，包含登录、积分、订单与在线客服，请给出 WXML 结构、云开发数据表设计和审核注意事项。',
      '检查我的小程序有没有踩审核红线',
    ],
  },
  {
    id: 'ec-fullstack', name: '高级全栈工程师', kind: 'expert', category: '技术工程',
    desc: '资深全栈研发专家，精通Java、Node与云原生全流程交付', tags: ['全栈研发', '多语言编程', '全流程交付'],
    usage: 159300, color: 'av-blue', createdAt: '2026-07-18',
    persona: '阿泽', version: 'v2.0.1',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我拆解这个需求的前后端任务',
      '现有系统要支持多租户，请给出数据库改造方案、灰度发布步骤，以及每一步出问题时的回滚方式。',
      '评审这套接口设计的一致性问题',
    ],
  },
  {
    id: 'ec-opc', name: '知识OPC创业助手', kind: 'expert', category: 'OPC·一人公司',
    desc: '帮助知识型创业者将专业方法沉淀为可售卖的数字产品', tags: ['机会验证', '知识服务', '经营复盘'],
    usage: 437400, color: 'av-navy', createdAt: '2026-10-08',
    persona: '独步', version: 'v1.0.3',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我把方法论变成可售卖的产品',
      '我是一名有十年经验的 HR 顾问，想把经验做成订阅制知识产品，请帮我设计定价、交付形式和增长路径。',
      '复盘我上个月的经营数据',
    ],
  },
  {
    id: 'ec-news', name: '资讯速递专家', kind: 'team', category: '营销增长', badge: '特遣',
    desc: '一句话查到每天精选的 AI 模型、行业政策与竞品动态', tags: ['AI 资讯', '每日简报', 'AI 行业动态'],
    usage: 160300, color: 'av-indigo', createdAt: '2026-10-15',
    persona: '快讯', version: 'v1.2.0',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '给我今天最值得关注的 5 条 AI 动态',
      '用一句话总结本周大模型领域的融资、发布与政策变化，并标注哪些会影响内容团队的业务。',
      '把这份行业简报改写成 60 秒口播稿',
    ],
  },
  {
    id: 'ec-firmware', name: '嵌入式固件工程师', kind: 'expert', category: '技术工程',
    desc: '精通微控制器编程，在资源受限设备上交付稳定固件', tags: ['嵌入式固件', 'RTOS开发'],
    usage: 390600, color: 'av-rose', createdAt: '2026-06-30',
    persona: '老李', version: 'v1.0.1',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我排查设备偶发重启的原因',
      '在 64KB RAM 的 MCU 上跑 FreeRTOS 并接入低功耗蓝牙，请给出任务划分、栈大小估算和内存预算表。',
      '评审我的中断处理是否存在竞态',
    ],
  },
  {
    id: 'ec-python', name: '资深 Python 全栈开发专家', kind: 'expert', category: '技术工程',
    desc: '资深Python全栈专家，精通前后端架构选型与性能调优', tags: ['全栈开发与架构选型'],
    usage: 108500, color: 'av-gold', createdAt: '2026-09-05',
    persona: '蟒叔', version: 'v1.6.0',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我做一次性能瓶颈分析',
      '我们要把一个 Django 单体拆成三个服务，请给出服务边界、数据迁移顺序和灰度上线的完整步骤。',
      '评审这套 Python 代码的类型标注与异常处理',
    ],
  },
  {
    id: 'ec-partner', name: '创业伙伴', kind: 'expert', category: 'OPC·一人公司',
    desc: '林老师分身+读书伙伴。送《一人公司创业实战手册》', tags: ['创业判断', 'GTM落地', '客户心法'],
    usage: 7683000, color: 'av-pink', createdAt: '2026-08-20',
    persona: '老友', version: 'v2.2.0',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我想清楚这单生意值不值得做',
      '我准备从大厂出来做企业培训，手上有三个潜在客户，请帮我判断先做哪一类、怎么报价、第一个月怎么落地。',
      '陪我过一遍这周的关键决策',
    ],
  },
  {
    id: 'ec-workbench', name: '工作台搭建师', kind: 'expert', category: '数据智能',
    desc: '为不同人群定制专属数字工作台，打通数据与响应式网页', tags: ['工作台搭建', '响应式网页'],
    usage: 7683000, color: 'av-purple', createdAt: '2026-10-01',
    persona: '搭搭', version: 'v1.0.2',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我搭一个个人数据工作台',
      '我需要一个能同时看项目进度、收入与内容排期的响应式工作台，请给出页面结构、数据字段和刷新策略。',
      '看看我的工作台哪里信息过载',
    ],
  },
  {
    id: 'ec-longdoc', name: '长文档写作与改稿专家', kind: 'expert', category: '内容创作',
    desc: '轻松几十万字，不跑题，没有AI腔，结构与文风同步打磨', tags: ['长文档工程', '多场景创作'],
    usage: 612200, color: 'av-cyan', createdAt: '2026-07-09',
    persona: '长文君', version: 'v1.4.1',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我把这一章改写得更像人写的',
      '我有一份 8 万字的行业报告，需要在不改变结论的前提下压缩到 5 万字，请给出删改策略和执行顺序。',
      '检查全文的逻辑断层和重复段落',
    ],
  },
  {
    id: 'ec-strategy', name: '战略咨询合伙人', kind: 'team', category: '金融投资',
    desc: '假设驱动的战略顾问，按需破局，输出可执行的决策备忘录', tags: ['战略分析', '决策备忘录'],
    usage: 138200, color: 'av-slate', createdAt: '2026-05-22',
    persona: '谋远', version: 'v1.1.3',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我用假设驱动拆解这个问题',
      '我们要进入一个新市场但预算有限，请用假设驱动的方法给出验证路径、关键指标和止损条件。',
      '把结论整理成一页决策备忘录',
    ],
  },
  {
    id: 'ec-webdeploy', name: '网站开发与部署专家', kind: 'expert', category: '技术工程',
    desc: '精通HTML、CSS与主流框架，覆盖开发、部署与优化全链路', tags: ['网站开发', '前端工程', '部署优化'],
    usage: 688500, color: 'av-green', createdAt: '2026-09-28',
    persona: '站长', version: 'v1.2.4',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我检查站点首屏性能',
      '我需要把一个静态站点部署到自有服务器，带 HTTPS、缓存策略和自动发布，请给出完整配置方案。',
      '评审我的部署流程有没有单点风险',
    ],
  },
  {
    id: 'ec-equity', name: '买公司、卖股权', kind: 'team', category: '金融投资',
    desc: '谁会接你的股权？报价怎么谈？全流程陪跑并购交易', tags: ['公司买卖', '估值报告', '交易谈判'],
    usage: 37200, color: 'av-navy', createdAt: '2026-06-11',
    persona: '交易君', version: 'v1.0.0',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我判断这家公司值不值得买',
      '我们想收购一家年营收 3000 万的区域性服务公司，请给出估值区间、交易结构和谈判要点。',
      '列出这笔交易最容易被忽略的风险',
    ],
  },
  {
    id: 'ec-boardsec', name: '董秘助手', kind: 'expert', category: '法务安全',
    desc: '面向公告、路演、投资者问答的信息披露合规助手', tags: ['信息披露合规', '投资者关系'],
    usage: 50500, color: 'av-indigo', createdAt: '2026-10-10',
    persona: '董小秘', version: 'v1.3.0',
    // 「专家帮你做」的三条示例提示词（详情抽屉里可直接带入首页输入框）
    prompts: [
      '帮我起草一份董事会决议公告',
      '公司要发布季度业绩预告，请按信息披露要求给出公告框架、必备要素和常见问询点。',
      '检查这份投资者问答是否有合规风险',
    ],
  },
]

// 285100 → '28.51w'；97000 → '9.7w'
export function formatUsage(n) {
  const wan = n / 10000
  const text = Number.isInteger(wan) ? String(wan) : wan.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${text}w`
}
