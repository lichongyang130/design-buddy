/* ============================================================
   连接器目录（写死种子数据，零后端 / 零外部素材）
   - 每项 = 稳定 id + 名称 + 一句话说明 + 品牌色 + 图标形状
   - 图标统一用 24×24 线性 SVG（内置，无外链、无商标素材）
   - 连接状态仍存放在 store.state.connectors（按名称对齐），
     与首页菜单、专家页「已启用的智能体」等既有数据同源
   ============================================================ */

// 图标形状池：一个形状可被多个连接器复用，避免为每家品牌单独画标
export const CONNECTOR_ICONS = {
  trend: '<path d="M3 17l5-5 4 3 8-8"/><path d="M15 7h5v5"/>',
  chart: '<path d="M4 20V10M10 20V5M16 20v-7M22 20H2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.4-7.98A6 6 0 0 1 18 9.5a3.5 3.5 0 0 1 .5 6.96"/><path d="M7 18h11"/>',
  code: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4"/><path d="m13 5-2 14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4.4-4.4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.6-3.8-9S9.5 5.4 12 3Z"/>',
  video: '<rect x="3" y="6" width="12" height="12" rx="2.5"/><path d="m15 11 6-3.5v9L15 13Z"/>',
  form: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="m8 12 3 3 5-6"/>',
  map: '<path d="M9 4 3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5Z"/><path d="M9 4v14M15 6.5v14"/>',
  sparkle: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  send: '<path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z"/><path d="m10 13 4.5-4.5"/>',
  bug: '<rect x="7" y="7" width="10" height="12" rx="5"/><path d="M9 3v3M15 3v3M3 11h4M17 11h4M4 17l3-2M20 17l-3-2"/>',
}

// shape 决定图形，color 是品牌主色（logo 底色取同色 10% 淡染）
export const CONNECTOR_CATALOG = [
  { id: 'cn-tdx', name: '通达信', desc: '通过通达信 MCP 查询全球股票行情与财报数据', color: '#e0362f', shape: 'trend', category: '投资理财' },
  { id: 'cn-zxg', name: '腾讯自选股', desc: '直连腾讯自选股，实时掌握持仓与自选行情', color: '#e1483c', shape: 'trend', category: '投资理财' },
  { id: 'cn-qqmail', name: 'QQ邮箱', desc: '收发、搜索和整理 QQ 邮件，支持附件与日程', color: '#d27a06', shape: 'mail', category: '办公协同' },
  { id: 'cn-ima', name: 'ima', desc: '腾讯AI知识管家，连接后支持笔记与知识库问答', color: '#2b2b2b', shape: 'sparkle', category: '知识与学习' },
  { id: 'cn-lexiang', name: '乐享知识库', desc: '搜索、创建和管理乐享知识库内容', color: '#2f6fdb', shape: 'cloud', category: '知识与学习' },
  { id: 'cn-docs', name: '腾讯文档', desc: '创建、编辑和协作腾讯文档，支持导出与权限', color: '#2b6cf6', shape: 'doc', category: '办公协同' },
  { id: 'cn-meeting', name: '腾讯会议', desc: '通过命令行创建、查询和管理会议与录制', color: '#2d7ef7', shape: 'video', category: '办公协同' },
  { id: 'cn-wecom', name: '企业微信', desc: '企业微信官方 CLI 套件，覆盖客户群与日程', color: '#2e9aca', shape: 'chat', category: '办公协同' },
  { id: 'cn-feishu', name: '飞书', desc: '通过命令行管理飞书/Lark 全量开放能力', color: '#3370ff', shape: 'send', category: '办公协同' },
  { id: 'cn-dingtalk', name: '钉钉', desc: '通过命令行管理钉钉全产品能力', color: '#1677ff', shape: 'chat', category: '办公协同' },
  { id: 'cn-wj', name: '腾讯问卷', desc: '创建、管理和分析腾讯问卷，支持结果导出', color: '#2aa462', shape: 'form', category: '办公协同' },
  { id: 'cn-tapd', name: 'TAPD', desc: '管理需求、缺陷、任务和迭代，联动项目看板', color: '#2e99c9', shape: 'form', category: '开发工具' },
  { id: 'cn-neodata', name: '腾讯金融科技NeoData', desc: '由腾讯金融科技链接各大权威金融数据源', color: '#2b6cf6', shape: 'chart', category: '投资理财' },
  { id: 'cn-cnb', name: 'CNB', desc: '通过自然语言管理 CNB 平台的代码与流水线', color: '#e46b1a', shape: 'code', category: '开发工具' },
  { id: 'cn-weiyun', name: '微云', desc: '查看、下载、删除微云文件，支持批量整理', color: '#2d8cf0', shape: 'cloud', category: '效率工具' },
  { id: 'cn-fbs', name: '福帮手', desc: '福帮手连接器：保留身份、场景与成稿上下文', color: '#2e99c9', shape: 'sparkle', category: '效率工具' },
  { id: 'cn-wps', name: '金山文档WPS云文档', desc: '金山文档官方 Skill，对话即操作云文档', color: '#2f7bf6', shape: 'doc', category: '办公协同' },
  { id: 'cn-pkulaw', name: '北大法宝·法律智能检索', desc: '检索 + 核验一体：语义检索法律法规与案例', color: '#c0392b', shape: 'doc', category: '法务安全' },
  { id: 'cn-qcc', name: '企查查', desc: '一次连接，查询企业工商与股东等全量信息', color: '#2b6cf6', shape: 'search', category: '商业运营' },
  { id: 'cn-tyc', name: '天眼查', desc: '通过天眼查 MCP 查询多维度企业与风险信息', color: '#2f7bf6', shape: 'search', category: '商业运营' },
  { id: 'cn-bdwp', name: '百度网盘', desc: '连接百度网盘，支持文件上传、下载与分享', color: '#2b7ef7', shape: 'cloud', category: '效率工具' },
  { id: 'cn-tushare', name: 'Tushare', desc: 'Tushare 金融数据服务，支持行情与财务数据', color: '#c28219', shape: 'chart', category: '投资理财' },
  { id: 'cn-openboost', name: 'OpenBoost 跨境数据', desc: 'OpenBoost 跨境数据连接器：全球电商与广告数据', color: '#5b6ef5', shape: 'globe', category: '数据分析' },
  { id: 'cn-dnb', name: '邓白氏查全球', desc: '通过自然语言查询邓白氏全球企业与信用信息', color: '#0f9d8f', shape: 'globe', category: '商业运营' },
  { id: 'cn-xhcj', name: '新华财经资讯MCP', desc: '公告、新闻、政策数据，包含结构化字段', color: '#1d3f8f', shape: 'doc', category: '信息资讯' },
  { id: 'cn-github', name: 'GitHub', desc: '在 GitHub 上克隆、推送代码与管理 Issue', color: '#24292f', shape: 'code', category: '开发工具' },
  { id: 'cn-notion', name: 'Notion', desc: '创建、搜索和管理 Notion 工作区页面', color: '#111827', shape: 'doc', category: '知识与学习' },
  { id: 'cn-qidian', name: '腾讯企点客服', desc: '腾讯企点客服连接器：用自然语言处理会话', color: '#279f90', shape: 'chat', category: '商业运营' },
  { id: 'cn-edgeone', name: 'EdgeOne Makers', desc: '将项目部署到 EdgeOne Makers 并管理域名', color: '#2563eb', shape: 'code', category: '网站部署' },
  { id: 'cn-cloudbase', name: '腾讯云 CloudBase', desc: '腾讯云开发 CloudBase 全栈能力与数据库', color: '#2f7bf6', shape: 'cloud', category: '网站部署' },
  { id: 'cn-bugly', name: 'Bugly 质量概览', desc: '查看产品的质量概览，包括崩溃与卡顿率', color: '#2f7bf6', shape: 'bug', category: '开发工具' },
  { id: 'cn-xiaoshouyi', name: '销售易CRM', desc: '用自然语言查客户、推商机、跟进销售流程', color: '#2b6cf6', shape: 'trend', category: '销售商务' },
  { id: 'cn-xiaoe', name: '小鹅通', desc: '用自然语言管理小鹅通店铺：课程与订单', color: '#1f8bf7', shape: 'chat', category: '教育学习' },
  { id: 'cn-huayu', name: '华宇元典法律数据', desc: '华宇元典法律数据为智能体提供法规与判例', color: '#3f7f7f', shape: 'doc', category: '法务安全' },
  { id: 'cn-weisheng', name: '微盛企微管家SCRM', desc: '查询或管理企业微信中的客户与标签', color: '#2b6cf6', shape: 'chat', category: '销售商务' },
  { id: 'cn-zte', name: '中兴新云AI智报', desc: '财务云 AI 报错助手：用自然语言定位问题', color: '#2f6fd0', shape: 'chart', category: '数据分析' },
  { id: 'cn-txad', name: '腾讯营销投放', desc: '腾讯营销投放 Skill，为大模型提供投放入口', color: '#2f7bf6', shape: 'send', category: '营销增长' },
  { id: 'cn-hs', name: '恒生聚源 MCP', desc: '连接恒生聚源 MCP，查询金融数据与指标', color: '#2a96d9', shape: 'chart', category: '投资理财' },
  { id: 'cn-map', name: '腾讯地图', desc: '接入腾讯地图各类位置服务，支持路线规划', color: '#2f7bf6', shape: 'map', category: '生活服务' },
  { id: 'cn-qixin', name: '启信慧眼', desc: '通过启信慧眼 MCP 接入企业风险与关系图谱', color: '#2f7bf6', shape: 'search', category: '商业运营' },
]
