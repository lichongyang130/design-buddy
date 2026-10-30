/* ============================================================
   真实配图语义概念层（P1）
   - 每个概念 = 一个稳定 key + 中英文名 + 素材管线搜索词
   - 19 个类别各有主题概念池；人物肖像/地图/标志墙为全类别共享池
   - 概念 key 一经发布不得改名：manifest、用户单页换图覆盖都依赖它
   - 素材来源（全部免费可商用，管线 scripts/asset-pipeline.mjs 落地）：
     Openverse(CC 聚合, 免密钥) / Pixabay(免费 key) / Pexels(免费 key)
     unDraw(MIT) / Open Doodles(CC0) / Open Peeps · Humaaans(CC0 人物)
   ============================================================ */

// 条目：[key, 中文名, 英文名, 管线搜索词(缺省用英文名)]
const def = (key, zh, en, q) => [key, { zh, en, q: q || en }]

export const ART_CONCEPTS = Object.fromEntries([
  /* ---------------- 共享池 ---------------- */
  ...['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16']
    .map((n, i) =>
      def(`shared.portrait.${n}`, `手绘人物 ${n}`, `Illustrated portrait ${n}`, `open peeps person portrait ${i + 1}`)),
  def('shared.map', '手绘地图', 'Illustrated map', 'hand drawn map illustration'),
  def('shared.logowall', '品牌标志墙', 'Brand logo wall', 'minimal logo marks collection'),
  def('shared.teamwork', '团队协作', 'Teamwork', 'team collaboration flat illustration'),
  def('shared.growth', '增长曲线', 'Growth', 'growth chart flat illustration'),

  /* ---------------- 课程 ---------------- */
  def('course.book', '打开的书', 'Open book'),
  def('course.lightbulb', '灵感灯泡', 'Idea lightbulb'),
  def('course.classroom', '课堂', 'Classroom'),
  def('course.online', '在线课堂', 'Online learning', 'online learning laptop illustration'),
  def('course.board', '讲课白板', 'Presentation board'),
  def('course.notebook', '笔记本', 'Notebook'),
  def('course.cap', '学位帽', 'Graduation cap'),
  def('course.quiz', '测验问答', 'Quiz'),
  def('course.workshop', '工作坊', 'Workshop'),
  def('course.video', '视频课程', 'Video lesson'),

  /* ---------------- 提案 ---------------- */
  def('proposal.handshake', '握手合作', 'Handshake'),
  def('proposal.blueprint', '方案蓝图', 'Blueprint'),
  def('proposal.target', '目标靶心', 'Target'),
  def('proposal.sign', '签署文件', 'Signing document'),
  def('proposal.meeting', '项目会议', 'Meeting'),
  def('proposal.strategy', '战略看板', 'Strategy board'),
  def('proposal.compass', '指南针', 'Compass'),
  def('proposal.checklist', '清单核对', 'Checklist'),

  /* ---------------- 报告 ---------------- */
  def('report.chart', '数据报告', 'Report chart'),
  def('report.clipboard', '记录夹板', 'Clipboard'),
  def('report.analytics', '分析仪表', 'Analytics'),
  def('report.document', '报告文档', 'Document'),
  def('report.magnifier', '调研放大镜', 'Research magnifier'),
  def('report.dashboard', '仪表盘', 'Dashboard'),

  /* ---------------- 融资演讲稿 ---------------- */
  def('funding.rocket', '火箭起飞', 'Rocket launch'),
  def('funding.growth', '业绩增长', 'Growth trend'),
  def('funding.piggy', '储蓄罐', 'Piggy bank'),
  def('funding.investor', '投资人', 'Investor meeting'),
  def('funding.trend', '上升曲线', 'Trend line'),
  def('funding.coins', '资金硬币', 'Funding coins'),

  /* ---------------- 营销材料 ---------------- */
  def('marketing.megaphone', '扩音器', 'Megaphone'),
  def('marketing.mobile', '手机广告', 'Mobile ads'),
  def('marketing.coupon', '优惠券', 'Coupon'),
  def('marketing.social', '社交气泡', 'Social chat'),
  def('marketing.bag', '购物袋', 'Shopping bag'),
  def('marketing.campaign', '营销战役', 'Campaign'),

  /* ---------------- 培训 ---------------- */
  def('training.mentor', '导师带教', 'Mentor'),
  def('training.gears', '技能齿轮', 'Gears skill'),
  def('training.path', '成长路径', 'Learning path'),
  def('training.certificate', '结业证书', 'Certificate'),
  def('training.elearning', '线上培训', 'E-learning'),
  def('training.practice', '实操演练', 'Practice training'),

  /* ---------------- 商业规划 ---------------- */
  def('planning.chess', '棋局战略', 'Chess strategy'),
  def('planning.roadmap', '路线图', 'Roadmap'),
  def('planning.orgchart', '组织架构', 'Org chart'),
  def('planning.calendar', '计划日历', 'Planning calendar'),
  def('planning.briefcase', '公文包', 'Briefcase'),

  /* ---------------- 活动 ---------------- */
  def('event.stage', '活动舞台', 'Stage'),
  def('event.confetti', '礼花彩带', 'Confetti'),
  def('event.ticket', '门票', 'Ticket'),
  def('event.calendar', '活动日历', 'Event calendar'),
  def('event.balloon', '派对气球', 'Party balloons'),
  def('event.venue', '活动场馆', 'Venue'),

  /* ---------------- 作品集 ---------------- */
  def('portfolio.palette', '调色盘', 'Artist palette'),
  def('portfolio.camera', '相机', 'Camera'),
  def('portfolio.grid', '作品网格', 'Design grid'),
  def('portfolio.desk', '创作桌面', 'Artist desk'),
  def('portfolio.frame', '展示画框', 'Showcase frame'),

  /* ---------------- 品牌设计 ---------------- */
  def('brand.mark', '品牌标志', 'Logo mark'),
  def('brand.guide', '品牌规范', 'Brand guidelines'),
  def('brand.swatches', '色卡', 'Color swatches'),
  def('brand.type', '字体排版', 'Typography'),
  def('brand.packaging', '包装设计', 'Packaging'),

  /* ---------------- 教育（含自然科普：蜜蜂/授粉主题，对齐 Scintilla） ---------------- */
  def('edu.bee', '蜜蜂', 'Honey bee', 'honey bee pollination illustration'),
  def('edu.butterfly', '蝴蝶', 'Butterfly'),
  def('edu.flower', '花朵', 'Flower bloom'),
  def('edu.hive', '蜂巢', 'Beehive'),
  def('edu.microscope', '显微镜', 'Microscope'),
  def('edu.globe', '课堂地球仪', 'Classroom globe'),
  def('edu.apple', '苹果与书', 'Apple and book'),
  def('edu.pencil', '铅笔', 'Pencil'),
  def('edu.atom', '原子模型', 'Atom'),
  def('edu.dna', 'DNA 双螺旋', 'DNA strand'),
  def('edu.telescope', '望远镜', 'Telescope'),
  def('edu.sprout', '幼苗', 'Plant sprout'),

  /* ---------------- 科技 ---------------- */
  def('tech.robot', '机器人', 'Robot'),
  def('tech.circuit', '电路板', 'Circuit board'),
  def('tech.chip', 'AI 芯片', 'AI chip'),
  def('tech.cloud', '云数据', 'Cloud data'),
  def('tech.phone', '智能手机', 'Smartphone'),
  def('tech.satellite', '卫星', 'Satellite'),
  def('tech.vr', 'VR 头显', 'VR headset'),
  def('tech.code', '代码窗口', 'Code window'),

  /* ---------------- 医疗健康 ---------------- */
  def('health.stethoscope', '听诊器', 'Stethoscope'),
  def('health.heart', '心跳脉搏', 'Heart pulse'),
  def('health.doctor', '医生', 'Doctor'),
  def('health.medicine', '药品', 'Medicine'),
  def('health.hospital', '医院', 'Hospital'),
  def('health.shield', '健康护盾', 'Health shield'),
  def('health.tooth', '牙齿', 'Tooth'),
  def('health.flask', '实验烧瓶', 'Lab flask'),

  /* ---------------- 艺术 ---------------- */
  def('art.brush', '画笔', 'Paint brush'),
  def('art.sculpture', '雕塑', 'Sculpture'),
  def('art.gallery', '画廊', 'Art gallery'),
  def('art.music', '音符', 'Music note'),
  def('art.masks', '戏剧面具', 'Theater masks'),
  def('art.pottery', '陶艺', 'Pottery'),

  /* ---------------- 文化 ---------------- */
  def('culture.lantern', '灯笼', 'Lantern'),
  def('culture.temple', '古建庙宇', 'Temple'),
  def('culture.scroll', '书画卷轴', 'Scroll'),
  def('culture.tea', '茶艺', 'Tea cup'),
  def('culture.dance', '节庆舞蹈', 'Festival dance'),
  def('culture.museum', '博物馆', 'Museum'),

  /* ---------------- 旅游 ---------------- */
  def('travel.airplane', '飞机', 'Airplane'),
  def('travel.suitcase', '行李箱', 'Suitcase'),
  def('travel.passport', '护照', 'Passport'),
  def('travel.beach', '海滩棕榈', 'Beach palm'),
  def('travel.mountain', '山川', 'Mountain'),
  def('travel.camera', '旅行相机', 'Travel camera'),
  def('travel.pin', '地图定位', 'Map pin'),

  /* ---------------- 餐饮 ---------------- */
  def('food.chef', '厨师帽', 'Chef hat'),
  def('food.plate', '精致餐盘', 'Plated dish'),
  def('food.coffee', '咖啡', 'Coffee cup'),
  def('food.table', '餐厅餐桌', 'Restaurant table'),
  def('food.ingredients', '食材', 'Ingredients'),
  def('food.dessert', '甜点', 'Dessert'),

  /* ---------------- 零售 ---------------- */
  def('retail.storefront', '店铺门面', 'Storefront'),
  def('retail.cart', '购物车', 'Shopping cart'),
  def('retail.gift', '礼盒', 'Gift box'),
  def('retail.tag', '价签', 'Price tag'),
  def('retail.boutique', '精品陈列', 'Boutique display'),
  def('retail.parcel', '快递包裹', 'Parcel'),

  /* ---------------- 建筑 ---------------- */
  def('arch.building', '楼宇', 'Building'),
  def('arch.blueprint', '建筑图纸', 'Architecture blueprint'),
  def('arch.crane', '塔吊', 'Construction crane'),
  def('arch.skyline', '城市天际线', 'City skyline'),
  def('arch.interior', '室内空间', 'Interior room'),
  def('arch.bridge', '桥梁', 'Bridge'),
])

// 每个类别的概念池（key 顺序即轮换顺序，确定性选取由种子取模）
export const CONCEPT_POOLS = {
  课程: ['course.book', 'course.lightbulb', 'course.classroom', 'course.online', 'course.board', 'course.notebook', 'course.cap', 'course.quiz', 'course.workshop', 'course.video'],
  提案: ['proposal.handshake', 'proposal.blueprint', 'proposal.target', 'proposal.sign', 'proposal.meeting', 'proposal.strategy', 'proposal.compass', 'proposal.checklist'],
  报告: ['report.chart', 'report.clipboard', 'report.analytics', 'report.document', 'report.magnifier', 'report.dashboard'],
  融资演讲稿: ['funding.rocket', 'funding.growth', 'funding.piggy', 'funding.investor', 'funding.trend', 'funding.coins'],
  营销材料: ['marketing.megaphone', 'marketing.mobile', 'marketing.coupon', 'marketing.social', 'marketing.bag', 'marketing.campaign'],
  培训: ['training.mentor', 'training.gears', 'training.path', 'training.certificate', 'training.elearning', 'training.practice'],
  商业规划: ['planning.chess', 'planning.roadmap', 'planning.orgchart', 'planning.calendar', 'planning.briefcase'],
  活动: ['event.stage', 'event.confetti', 'event.ticket', 'event.calendar', 'event.balloon', 'event.venue'],
  作品集: ['portfolio.palette', 'portfolio.camera', 'portfolio.grid', 'portfolio.desk', 'portfolio.frame'],
  品牌设计: ['brand.mark', 'brand.guide', 'brand.swatches', 'brand.type', 'brand.packaging'],
  教育: ['edu.bee', 'edu.butterfly', 'edu.flower', 'edu.hive', 'edu.microscope', 'edu.globe', 'edu.apple', 'edu.pencil', 'edu.atom', 'edu.dna', 'edu.telescope', 'edu.sprout'],
  科技: ['tech.robot', 'tech.circuit', 'tech.chip', 'tech.cloud', 'tech.phone', 'tech.satellite', 'tech.vr', 'tech.code'],
  医疗健康: ['health.stethoscope', 'health.heart', 'health.doctor', 'health.medicine', 'health.hospital', 'health.shield', 'health.tooth', 'health.flask'],
  艺术: ['art.brush', 'art.sculpture', 'art.gallery', 'art.music', 'art.masks', 'art.pottery'],
  文化: ['culture.lantern', 'culture.temple', 'culture.scroll', 'culture.tea', 'culture.dance', 'culture.museum'],
  旅游: ['travel.airplane', 'travel.suitcase', 'travel.passport', 'travel.beach', 'travel.mountain', 'travel.camera', 'travel.pin'],
  餐饮: ['food.chef', 'food.plate', 'food.coffee', 'food.table', 'food.ingredients', 'food.dessert'],
  零售: ['retail.storefront', 'retail.cart', 'retail.gift', 'retail.tag', 'retail.boutique', 'retail.parcel'],
  建筑: ['arch.building', 'arch.blueprint', 'arch.crane', 'arch.skyline', 'arch.interior', 'arch.bridge'],
  技术文档: ['tech.robot', 'tech.circuit', 'tech.chip', 'tech.cloud', 'tech.code', 'tech.phone', 'tech.satellite', 'tech.vr'],
}

const PORTRAIT_KEYS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16']
  .map((n) => `shared.portrait.${n}`)

// 版式级固定概念：人物页用共享肖像，地图页用插画地图，标志墙用品牌集合
const PINNED = {
  team: (seed, no, slot) => PORTRAIT_KEYS[Math.abs(seed + no * 3 + slot) % PORTRAIT_KEYS.length],
  testimonial: (seed, no, slot) => PORTRAIT_KEYS[Math.abs(seed + no * 5 + slot) % PORTRAIT_KEYS.length],
  map: () => 'shared.map',
  logos: () => 'shared.logowall',
}

/**
 * 确定性计算某页某槽位的语义概念 key
 * @param {{id:string, seed:number, cats:string[]}} tpl 模板
 * @param {{layout:string, no:number}} page 页面
 * @param {number} slot 槽位序号
 */
export function conceptFor(tpl, page, slot = 0) {
  const pinned = PINNED[page.layout]
  if (pinned) return pinned(tpl.seed ?? 0, page.no ?? 0, slot)
  const pool = CONCEPT_POOLS[tpl.cats?.[0]] || ['shared.teamwork', 'shared.growth']
  const idx = Math.abs((tpl.seed ?? 0) + (page.no ?? 1) * 7 + slot * 13) % pool.length
  return pool[idx]
}

export function conceptLabel(key, locale = 'zh') {
  return ART_CONCEPTS[key]?.[locale] || ART_CONCEPTS[key]?.en || key
}

export function conceptQuery(key) {
  return ART_CONCEPTS[key]?.q || key
}
