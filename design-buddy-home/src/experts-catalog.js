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
  },
  {
    id: 'ec-senior-dev', name: '高级开发工程师', kind: 'expert', category: '技术工程',
    desc: '10年以上全栈经验，精通多种主流框架与工程化体系', tags: ['全栈开发', '架构设计', '代码质量'],
    usage: 11546400, color: 'av-orange', createdAt: '2026-08-02',
  },
  {
    id: 'ec-miniprogram', name: '微信小程序开发者', kind: 'expert', category: '技术工程',
    desc: '精通微信小程序开发框架和生态，覆盖云开发与上线审核', tags: ['小程序开发', '微信生态', 'WXML开发'],
    usage: 3161500, color: 'av-lavender', createdAt: '2026-09-25',
  },
  {
    id: 'ec-fullstack', name: '高级全栈工程师', kind: 'expert', category: '技术工程',
    desc: '资深全栈研发专家，精通Java、Node与云原生全流程交付', tags: ['全栈研发', '多语言编程', '全流程交付'],
    usage: 159300, color: 'av-blue', createdAt: '2026-07-18',
  },
  {
    id: 'ec-opc', name: '知识OPC创业助手', kind: 'expert', category: 'OPC·一人公司',
    desc: '帮助知识型创业者将专业方法沉淀为可售卖的数字产品', tags: ['机会验证', '知识服务', '经营复盘'],
    usage: 437400, color: 'av-navy', createdAt: '2026-10-08',
  },
  {
    id: 'ec-news', name: '资讯速递专家', kind: 'team', category: '营销增长', badge: '特遣',
    desc: '一句话查到每天精选的 AI 模型、行业政策与竞品动态', tags: ['AI 资讯', '每日简报', 'AI 行业动态'],
    usage: 160300, color: 'av-indigo', createdAt: '2026-10-15',
  },
  {
    id: 'ec-firmware', name: '嵌入式固件工程师', kind: 'expert', category: '技术工程',
    desc: '精通微控制器编程，在资源受限设备上交付稳定固件', tags: ['嵌入式固件', 'RTOS开发'],
    usage: 390600, color: 'av-rose', createdAt: '2026-06-30',
  },
  {
    id: 'ec-python', name: '资深 Python 全栈开发专家', kind: 'expert', category: '技术工程',
    desc: '资深Python全栈专家，精通前后端架构选型与性能调优', tags: ['全栈开发与架构选型'],
    usage: 108500, color: 'av-gold', createdAt: '2026-09-05',
  },
  {
    id: 'ec-partner', name: '创业伙伴', kind: 'expert', category: 'OPC·一人公司',
    desc: '林老师分身+读书伙伴。送《一人公司创业实战手册》', tags: ['创业判断', 'GTM落地', '客户心法'],
    usage: 7683000, color: 'av-pink', createdAt: '2026-08-20',
  },
  {
    id: 'ec-workbench', name: '工作台搭建师', kind: 'expert', category: '数据智能',
    desc: '为不同人群定制专属数字工作台，打通数据与响应式网页', tags: ['工作台搭建', '响应式网页'],
    usage: 7683000, color: 'av-purple', createdAt: '2026-10-01',
  },
  {
    id: 'ec-longdoc', name: '长文档写作与改稿专家', kind: 'expert', category: '内容创作',
    desc: '轻松几十万字，不跑题，没有AI腔，结构与文风同步打磨', tags: ['长文档工程', '多场景创作'],
    usage: 612200, color: 'av-cyan', createdAt: '2026-07-09',
  },
  {
    id: 'ec-strategy', name: '战略咨询合伙人', kind: 'team', category: '金融投资',
    desc: '假设驱动的战略顾问，按需破局，输出可执行的决策备忘录', tags: ['战略分析', '决策备忘录'],
    usage: 138200, color: 'av-slate', createdAt: '2026-05-22',
  },
  {
    id: 'ec-webdeploy', name: '网站开发与部署专家', kind: 'expert', category: '技术工程',
    desc: '精通HTML、CSS与主流框架，覆盖开发、部署与优化全链路', tags: ['网站开发', '前端工程', '部署优化'],
    usage: 688500, color: 'av-green', createdAt: '2026-09-28',
  },
  {
    id: 'ec-equity', name: '买公司、卖股权', kind: 'team', category: '金融投资',
    desc: '谁会接你的股权？报价怎么谈？全流程陪跑并购交易', tags: ['公司买卖', '估值报告', '交易谈判'],
    usage: 37200, color: 'av-navy', createdAt: '2026-06-11',
  },
  {
    id: 'ec-boardsec', name: '董秘助手', kind: 'expert', category: '法务安全',
    desc: '面向公告、路演、投资者问答的信息披露合规助手', tags: ['信息披露合规', '投资者关系'],
    usage: 50500, color: 'av-indigo', createdAt: '2026-10-10',
  },
]

// 285100 → '28.51w'；97000 → '9.7w'
export function formatUsage(n) {
  const wan = n / 10000
  const text = Number.isInteger(wan) ? String(wan) : wan.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${text}w`
}
