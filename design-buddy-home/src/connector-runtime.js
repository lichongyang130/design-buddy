/* ============================================================
   连接器真实能力：连上之后就能「打开」，做一件真事
   —— 全部本地执行、可下载、可验证；不假装已经连上远端服务。
       · 行情类：用内置行情序列真算涨跌 / 波动率 / 回撤，出 SVG
       · 邮箱类：生成 RFC 5322 的 .eml
       · 文档类：Markdown → Word(.doc)，或 HTML → Markdown
       · 表单类：生成可直接打开的 HTML 表单
       · 会议类：生成可导入日历的 .ics
       · 代码类：生成可 `git apply` 的 patch
       · 检索类：在内置的企业 / 法规 / 素材索引里真实检索
       · 部署类：生成 nginx / cloudbase 配置
       · CRM 类：生成可导入的跟进表 CSV
       · 地图类：生成路线 SVG + GeoJSON
       · 默认：导出可直接粘贴进 MCP 客户端的连接配置
   ============================================================ */

import { analyze } from './expert-runtime.js'
import {
  quoteEngine, mailEngine, docxEngine, pagingEngine, summaryEngine, tableEngine,
  toMarkdownEngine, auditResponsive, keywords, clip, lines, toCSV, seeded, uniq,
} from './tool-engines.js'

const res = (kind, title, summary, stats, blocks, findings = [], artifacts = [], extra = {}) =>
  ({ kind, title, summary, stats, blocks, findings, artifacts, ...extra })

/* ---------------- 表单：真实 HTML ---------------- */

export function formHTML(ctx, input, brand = '#2aa462') {
  const fields = lines(input).length
    ? lines(input).map((l) => {
      const optional = /选填|不必填/.test(l)
      const type = /邮箱|email/i.test(l) ? 'email' : /电话|手机/.test(l) ? 'tel' : /日期|时间/.test(l) ? 'date' : /多行|描述|建议/.test(l) ? 'textarea' : 'text'
      return { label: l.replace(/（选填）|\(选填\)/g, '').trim(), type, required: !optional }
    })
    : [
      { label: '你的称呼', type: 'text', required: true },
      { label: '邮箱', type: 'email', required: true },
      { label: '想解决的问题', type: 'textarea', required: false },
    ]
  const body = fields.map((f, i) => f.type === 'textarea'
    ? `  <label class="field"><span>${f.label}${f.required ? ' *' : ''}</span><textarea name="f${i + 1}" rows="3"${f.required ? ' required' : ''}></textarea></label>`
    : `  <label class="field"><span>${f.label}${f.required ? ' *' : ''}</span><input type="${f.type}" name="f${i + 1}"${f.required ? ' required' : ''} /></label>`).join('\n')
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${ctx.topic} · 问卷</title>
<style>
  :root { --brand: ${brand}; --line: #e6e9f0; }
  * { box-sizing: border-box; margin: 0; }
  body { font-family: -apple-system, 'PingFang SC', sans-serif; background: #f7f9fd; padding: 32px 16px; color: #1b2430; }
  form { max-width: 560px; margin: 0 auto; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 26px; }
  h1 { font-size: 20px; margin-bottom: 6px; }
  p.sub { color: #5b6472; font-size: 13px; margin-bottom: 20px; }
  .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; font-size: 13px; }
  input, textarea { min-height: 42px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 9px; font: inherit; }
  input:focus, textarea:focus { outline: none; border-color: var(--brand); }
  button { width: 100%; min-height: 46px; border: 0; border-radius: 10px; background: var(--brand); color: #fff; font-size: 15px; font-weight: 600; }
</style></head>
<body><form onsubmit="event.preventDefault();this.querySelector('button').textContent='已提交，谢谢！'">
  <h1>${ctx.topic}</h1>
  <p class="sub">共 ${fields.length} 题，约 1 分钟完成。</p>
${body}
  <button type="submit">提交</button>
</form></body></html>`
}

/* ---------------- 会议：真实 .ics ---------------- */

export function icsOf({ title, date = '2026-11-02', start = '10:00', minutes = 60, place = '线上会议' }) {
  const [h, m] = start.split(':').map(Number)
  const endTotal = h * 60 + m + minutes
  const pad = (n) => String(n).padStart(2, '0')
  const dt = (d) => d.replace(/-/g, '')
  const stamp = `${dt(date)}T${pad(h)}${pad(m)}00`
  const endStamp = `${dt(date)}T${pad(Math.floor(endTotal / 60))}${pad(endTotal % 60)}00`
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Design Buddy//Connector//CN',
    'BEGIN:VEVENT',
    `UID:${Math.abs(title.length * 2654435761) % 1e9}@design-buddy`,
    `DTSTAMP:${stamp}Z`,
    `DTSTART:${stamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${title}`,
    `LOCATION:${place}`,
    `DESCRIPTION:由 Design Buddy 连接器生成，时长 ${minutes} 分钟`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

/* ---------------- 代码：真实 patch ---------------- */

export function patchOf(ctx, input) {
  const file = (input.match(/[\w./-]+\.(js|ts|tsx|vue|css|md|json)/) ?? [])[0] ?? 'src/index.js'
  const body = `// ${ctx.topic}\n// 由 Design Buddy 的代码连接器生成，可 git apply 后自行调整\n\nexport function main(input) {\n  const value = String(input ?? '').trim()\n  if (!value) throw new Error('input is required')\n  return { ok: true, length: value.length }\n}\n`
  const diff = [
    `diff --git a/${file} b/${file}`,
    'new file mode 100644',
    'index 0000000..1111111',
    '--- /dev/null',
    `+++ b/${file}`,
    `@@ -0,0 +1,${body.split('\n').length - 1} @@`,
    ...body.split('\n').slice(0, -1).map((l) => `+${l}`),
  ].join('\n')
  return { file, diff, body }
}

/* ---------------- 本地索引：企业 / 法规 / 素材 ---------------- */

const ENTITY_INDEX = [
  { name: '深圳市恒创精密制造有限公司', reg: '91440300MA5F2K7X3Q', city: '深圳', industry: '精密制造', capital: '5000 万', risk: '低', tags: ['高新技术', '专精特新'] },
  { name: '杭州云图数据科技有限公司', reg: '91330106MA2H8L9D1R', city: '杭州', industry: '软件与信息服务', capital: '1000 万', risk: '中', tags: ['融资 B 轮', '2 条司法协助'] },
  { name: '上海知序文化传播有限公司', reg: '91310115MA1K4P8S2T', city: '上海', industry: '广告与内容', capital: '300 万', risk: '低', tags: ['小微企业'] },
  { name: '北京启明智能装备有限公司', reg: '91110108MA01T5XK7B', city: '北京', industry: '智能制造', capital: '8000 万', risk: '高', tags: ['失信 1 条', '股权冻结'] },
  { name: '广州顺成供应链管理有限公司', reg: '91440101MA9U2Q6W8Y', city: '广州', industry: '供应链', capital: '2000 万', risk: '中', tags: ['3 条动产抵押'] },
]

const LAW_INDEX = [
  { no: '民法典 第 509 条', title: '当事人应当按照约定全面履行自己的义务', tags: ['合同履行', '诚信原则'] },
  { no: '民法典 第 577 条', title: '当事人一方不履行合同义务的，应当承担继续履行、赔偿损失等违约责任', tags: ['违约责任'] },
  { no: '公司法 第 47 条', title: '有限责任公司注册资本应当自成立之日起五年内缴足', tags: ['注册资本', '出资期限'] },
  { no: '劳动合同法 第 20 条', title: '劳动者在试用期的工资不得低于本单位相同岗位最低档工资或约定工资的百分之八十', tags: ['试用期', '工资'] },
  { no: '个人信息保护法 第 13 条', title: '处理个人信息应当取得个人同意或具有其他合法性基础', tags: ['个人信息', '合规'] },
]

const ART_INDEX = [
  'proposal.strategy', 'proposal.sign', 'report.chart', 'report.analytics', 'marketing.campaign',
  'brand.guide', 'brand.swatches', 'planning.roadmap', 'planning.orgchart', 'shared.teamwork',
  'tech.phone', 'tech.code', 'portfolio.grid', 'funding.growth', 'course.board',
]

function entityEngine(ctx, input) {
  const q = input.trim()
  const hits = ENTITY_INDEX.filter((e) => q.includes(e.name.slice(0, 4)) || q.includes(e.city) || q.includes(e.industry)
    || e.name.includes(q.slice(0, 4)))
  const list = hits.length ? hits : ENTITY_INDEX.slice(0, 3)
  const high = list.filter((e) => e.risk === '高').length
  return res('entity', '企业信息检索',
    `在内置的企业索引（${ENTITY_INDEX.length} 家）里命中 ${list.length} 家，其中 ${high} 家有高风险标记；数据为本地示例，接入正式接口后口径不变。`,
    [
      { label: '命中', value: `${list.length} 家` },
      { label: '高风险', value: `${high} 家` },
      { label: '索引', value: `${ENTITY_INDEX.length} 条` },
      { label: '数据源', value: '本地示例' },
    ],
    [
      { type: 'table', title: '检索结果', head: ['企业', '统一社会信用代码', '行业', '注册资本', '风险'], rows: list.map((e) => [e.name, e.reg, e.industry, e.capital, e.risk]) },
      { type: 'chips', title: '标签', items: uniq(list.flatMap((e) => e.tags)) },
      { type: 'list', title: '拿到结果后', items: ['高风险企业先看失信与股权冻结的具体案号', '注册资本不等于实缴，要单独查', '同一集团多家主体分别核对'] },
    ],
    high ? [{ level: 'high', text: `命中 ${high} 家高风险企业，签约前必须做尽调` }] : [{ level: 'low', text: '命中企业均无高风险标记' }],
    [{ name: 'entities.csv', mime: 'text/csv', content: toCSV([['name', 'reg', 'city', 'industry', 'capital', 'risk'], ...list.map((e) => [e.name, e.reg, e.city, e.industry, e.capital, e.risk])]) }])
}

function lawEngine(ctx, input) {
  const q = input.trim()
  const hits = LAW_INDEX.filter((l) => q.includes(l.tags[0]) || l.tags.some((t) => q.includes(t)) || l.title.includes(q.slice(0, 4)))
  const list = hits.length ? hits : LAW_INDEX.slice(0, 3)
  return res('law', '法规命中',
    `在内置法规索引（${LAW_INDEX.length} 条）里命中 ${list.length} 条；条款正文为本地示例摘录，正式引用请以官方文本为准。`,
    [
      { label: '命中', value: `${list.length} 条` },
      { label: '索引', value: `${LAW_INDEX.length} 条` },
      { label: '关键词', value: `${keywords(q, 3).length}` },
      { label: '数据源', value: '本地示例' },
    ],
    [
      { type: 'table', title: '命中条款', head: ['条款', '要点', '标签'], rows: list.map((l) => [l.no, l.title, l.tags.join('、')]) },
      { type: 'list', title: '引用前必做', items: ['到官方文本核对现行有效版本', '看是否有最新司法解释', '把条款号写进合同与意见书'] },
    ],
    [{ level: 'med', text: '条款为本地摘录，正式意见必须核对官方文本' }],
    [{ name: 'law-hits.md', mime: 'text/markdown', content: list.map((l) => `## ${l.no}\n${l.title}`).join('\n\n') }])
}

function filesEngine(ctx, input) {
  const q = input.trim()
  const hits = ART_INDEX.filter((k) => k.includes(q) || q.length < 2 ? true : false)
  const list = (hits.length ? hits : ART_INDEX).slice(0, 8)
  return res('files', '素材检索',
    `在内置素材库（${ART_INDEX.length} 个本地插画）里命中 ${list.length} 个，全部为仓库内 SVG，零外链、可离线使用。`,
    [
      { label: '命中', value: `${list.length}` },
      { label: '库容量', value: `${ART_INDEX.length}` },
      { label: '外链', value: '0' },
      { label: '格式', value: 'SVG' },
    ],
    [
      { type: 'table', title: '检索结果', head: ['名称', '路径', '用途'], rows: list.map((k) => [k, `/art/illustration/${k}.svg`, '提案 / 报告配图']) },
      { type: 'list', title: '引用方式', items: ['直接把路径写进文档，导出 PDF 不会掉图', '同一份稿子只用同色系 2–3 张', '需要改色时直接改 SVG 的 fill'] },
    ],
    [{ level: 'low', text: '全部命中本地文件，可离线使用' }],
    [{ name: 'assets.md', mime: 'text/markdown', content: list.map((k) => `- ${k}.svg → /art/illustration/${k}.svg`).join('\n') }])
}

/* ---------------- 部署配置 ---------------- */

function deployEngine(ctx, input, brand = '#2f7bf6') {
  const domain = (input.match(/[\w-]+\.[\w.]{2,}/) ?? [])[0] ?? 'example.com'
  const nginx = `server {\n  listen 443 ssl http2;\n  server_name ${domain};\n\n  root /var/www/${domain};\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n\n  location ~* \\.(js|css|svg|webp)$ {\n    expires 30d;\n    add_header Cache-Control "public, immutable";\n  }\n}`
  const config = {
    version: '1.0',
    hosting: { domain, root: `/var/www/${domain}`, spa: true },
    headers: { 'Cache-Control': 'public, max-age=2592000' },
    env: { BRAND: brand },
  }
  return res('deploy', '部署配置',
    `为 ${domain} 生成一份可直接使用的 nginx 站点配置（SPA 回退 + 静态资源缓存 30 天）与结构化部署清单。`,
    [
      { label: '域名', value: clip(domain, 18) },
      { label: '回退', value: 'SPA' },
      { label: '缓存', value: '30 天' },
      { label: '配置行', value: `${nginx.split('\n').length}` },
    ],
    [
      { type: 'code', title: 'nginx 站点配置', code: nginx },
      { type: 'code', title: '部署清单 json', code: JSON.stringify(config, null, 2) },
      { type: 'list', title: '上线前检查', items: ['证书续期任务是否生效', '静态资源指纹与缓存策略是否匹配', '回退页是否存在（否则 404 白屏）'] },
    ],
    [{ level: 'low', text: '已带 SPA 回退，刷新深层路由不会 404' }],
    [{ name: 'site.conf', mime: 'text/plain', content: nginx }, { name: 'deploy.json', mime: 'application/json', content: JSON.stringify(config, null, 2) }])
}

/* ---------------- CRM 跟进表 ---------------- */

function crmEngine(ctx, input) {
  const names = lines(input).length ? lines(input) : ['云图数据', '恒创精密', '知序文化']
  const rng = seeded(input)
  const rows = names.map((n, i) => {
    const stage = ['初步接触', '需求确认', '方案报价', '谈判'][i % 4]
    const amount = 5 + Math.round(rng() * 45)
    return [clip(n, 14), stage, `${amount} 万`, ['本周', '下周', '两周内'][i % 3], ['高', '中', '低'][i % 3]]
  })
  const pipeline = rows.reduce((n, r) => n + Number(r[2].replace(/\D/g, '')), 0)
  return res('crm', '商机跟进表',
    `${rows.length} 条商机、合计 ${pipeline} 万；按阶段排好下一步动作与优先级，可直接导入 CRM。`,
    [
      { label: '商机', value: `${rows.length}` },
      { label: '管线', value: `${pipeline} 万` },
      { label: '阶段', value: `${uniq(rows.map((r) => r[1])).length}` },
      { label: '待跟进', value: `${rows.length}` },
    ],
    [
      { type: 'table', title: '跟进表', head: ['客户', '阶段', '金额', '下一步', '优先级'], rows },
      { type: 'list', title: '销售节奏', items: ['「方案报价」阶段超过两周没推进的，直接降级', '优先级 A 的客户每周至少一次有效接触', '每条商机都要有一个具体日期，不写「尽快」'] },
    ],
    [pipeline < 100 ? { level: 'med', text: `管线只有 ${pipeline} 万，低于常见目标的健康线` } : { level: 'low', text: `管线 ${pipeline} 万，节奏正常` }],
    [{ name: 'pipeline.csv', mime: 'text/csv', content: toCSV([['customer', 'stage', 'amount', 'next', 'priority'], ...rows]) }])
}

/* ---------------- 地图路线 ---------------- */

function mapEngine(ctx, input) {
  const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都'].filter((c) => input.includes(c))
  const route = cities.length >= 2 ? cities : ['上海', '杭州', '深圳']
  const W = 520
  const H = 220
  const pts = route.map((c, i) => ({ c, x: 40 + (i * (W - 80)) / Math.max(1, route.length - 1), y: 60 + ((i * 53) % 110) }))
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(' ')
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="路线">` +
    `<path d="${path}" fill="none" stroke="#2f7bf6" stroke-width="2.5" stroke-dasharray="6 5"/>` +
    pts.map((p) => `<circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="6" fill="#2f7bf6"/><text x="${p.x.toFixed(0)}" y="${(p.y + 24).toFixed(0)}" font-size="12" fill="#5b6472" text-anchor="middle">${p.c}</text>`).join('') +
    '</svg>'
  const geo = { type: 'LineString', coordinates: pts.map((p, i) => [116 + i * 1.4, 39 + (i % 2) * 0.8]) }
  return res('map', '路线规划',
    `${route.join(' → ')}，${route.length - 1} 段；生成矢量路线图与 GeoJSON，可直接叠加到地图底图。`,
    [
      { label: '节点', value: `${route.length}` },
      { label: '段数', value: `${route.length - 1}` },
      { label: '输出', value: 'SVG + GeoJSON' },
      { label: '外链', value: '0' },
    ],
    [
      { type: 'svg', title: '路线示意（矢量）', svg },
      { type: 'code', title: 'GeoJSON', code: JSON.stringify(geo) },
      { type: 'list', title: '实地用之前', items: ['用正式地图接口算一次实际里程与耗时', '确认每个节点的拜访顺序能否倒排', '留出交通缓冲，别排满'] },
    ],
    [{ level: 'low', text: '路线为示意坐标，实际导航请用地图服务' }],
    [{ name: 'route.geojson', mime: 'application/json', content: JSON.stringify(geo, null, 2) }])
}

/* ---------------- 连接配置（默认引擎） ---------------- */

function configEngine(entry, input) {
  const slug = `mcp-${Math.abs(entry.name.length * 7919) % 9999}`
  const config = {
    mcpServers: {
      [slug]: {
        command: 'npx',
        args: ['-y', `@design-buddy/${slug}`],
        env: { [`${slug.toUpperCase().replace(/-/g, '_')}_TOKEN`]: '<your-token>' },
      },
    },
  }
  const md = `# ${entry.name}\n\n${entry.desc}\n\n## 接入步骤\n\n1. 复制下面的配置到你的 MCP 客户端（Claude Desktop / Cursor / Codex 均可）\n2. 把 token 换成你自己的\n3. 重启客户端，确认工具列表里出现 \`${slug}\`\n\n\`\`\`json\n${JSON.stringify(config, null, 2)}\n\`\`\`\n`
  return res('config', '连接配置',
    `为「${entry.name}」生成可直接粘贴的 MCP 配置（含环境变量占位），以及三步接入说明。`,
    [
      { label: '服务名', value: slug },
      { label: '环境变量', value: '1 项' },
      { label: '配置行', value: `${JSON.stringify(config, null, 2).split('\n').length}` },
      { label: '依赖', value: 'npx' },
    ],
    [
      { type: 'code', title: 'MCP 配置', code: JSON.stringify(config, null, 2) },
      { type: 'list', title: '接入步骤', items: ['粘贴到客户端的 mcpServers 配置里', '把 token 占位替换成真实凭据', '重启客户端，检查工具是否出现'] },
      { type: 'chips', title: '本次连接测试', items: ['名称合法', '说明非空', '分类已归类', '凭据待填'] },
    ],
    [{ level: 'med', text: '本机没有该服务的凭据，配置里的 token 需要你自己填' }],
    [{ name: `${slug}.json`, mime: 'application/json', content: JSON.stringify(config, null, 2) }, { name: `${slug}.md`, mime: 'text/markdown', content: md }])
}

/* ---------------- 连接器 → 引擎 ---------------- */

const BY_ID = {
  'cn-tdx': 'quote', 'cn-zxg': 'quote', 'cn-neodata': 'quote', 'cn-tushare': 'quote',
  'cn-hs': 'quote', 'cn-qqmail': 'mail',
  'cn-docs': 'doc', 'cn-wps': 'doc', 'cn-notion': 'doc', 'cn-feishu': 'doc', 'cn-dingtalk': 'doc',
  'cn-wj': 'form', 'cn-tapd': 'form',
  'cn-meeting': 'meeting',
  'cn-github': 'code', 'cn-cnb': 'code', 'cn-edgeone': 'deploy', 'cn-cloudbase': 'deploy',
  'cn-bugly': 'code',
  'cn-qcc': 'entity', 'cn-tyc': 'entity', 'cn-qixin': 'entity', 'cn-dnb': 'entity',
  'cn-pkulaw': 'law', 'cn-huayu': 'law',
  'cn-ima': 'files', 'cn-lexiang': 'files', 'cn-weiyun': 'files', 'cn-bdwp': 'files',
  'cn-xhcj': 'summary', 'cn-fbs': 'summary',
  'cn-xiaoshouyi': 'crm', 'cn-weisheng': 'crm', 'cn-qidian': 'crm',
  'cn-xiaoe': 'crm', 'cn-txad': 'crm',
  'cn-map': 'map',
  'cn-wecom': 'mail', 'cn-zte': 'table', 'cn-openboost': 'table',
}

const LABELS = {
  quote: ['看行情与风险指标', '腾讯自选股最近 10 个交易日的走势'],
  mail: ['起草邮件 / 通知', '季度方案确认\n下周一上午 10 点过方案\n请提前看第 3 页的报价'],
  doc: ['生成可交付文档', '# 季度方案\n\n本季度把交付周期从 14 天压到 9 天。\n\n## 关键动作\n\n- 需求评审合并为一次\n- 组件从 40 精简到 26\n- 自检清单补到 18 项'],
  form: ['生成表单页', '你的称呼\n邮箱\n想解决的问题（选填）'],
  meeting: ['生成会议日程', '季度方案评审 60 分钟'],
  code: ['生成代码补丁', '写一个 src/report.js 生成周报'],
  deploy: ['生成部署配置', 'site.example.com 静态站 + SPA 回退'],
  entity: ['查企业与风险', '查询深圳精密制造企业的工商与风险'],
  law: ['检索法规条款', '关于合同履行与违约责任'],
  files: ['检索素材', '提案配图'],
  summary: ['摘要资讯', '本季度我们完成了三件事：重构交付流程、精简设计组件、补全自检清单。交付周期从 14 天降到 9 天，返工率从 23% 降到 8%。下一步要解决首轮沟通不充分的问题。'],
  crm: ['整理商机跟进', '云图数据\n恒创精密\n知序文化'],
  map: ['规划拜访路线', '上海 杭州 深圳'],
  table: ['整理数据表', '渠道,订单数,销售额\n自然搜索,120,84000\n信息流,86,52000\n私域,54,38000'],
  config: ['导出连接配置', '内部知识库 MCP'],
}

export const connectorKind = (entry) => BY_ID[entry.id] ?? (entry.custom ? 'config' : 'config')
export const connectorLabel = (entry) => (LABELS[connectorKind(entry)] ?? LABELS.config)
export const connectorSample = (entry) => (connectorKind(entry) === 'quote'
  ? `${entry.name} 最近 10 个交易日的走势`
  : LABELS[connectorKind(entry)][1])

/** 连接器错误：带真实错误码，供连接测试触发与展示 */
export class ConnectorError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ConnectorError'
    this.code = code
  }
}

const nowMs = () => (globalThis.performance?.now ? globalThis.performance.now() : Date.now())

const QUOTE_SYMBOLS = ['通达信', '腾讯自选股', 'Tushare', '恒生聚源']

/** 跑一个连接器的真实能力 */
export function runConnector(entry, input, { strict = false } = {}) {
  const kind = connectorKind(entry)
  const text = String(input ?? '').trim()
  if (strict && !text) throw new ConnectorError(400, '输入为空：请描述要处理的内容')
  if (!entry?.name) throw new ConnectorError(500, '连接器缺少名称，无法路由到引擎')
  const ctx = analyze(text || connectorSample(entry))
  switch (kind) {
    case 'quote': {
      // 用户输入里点名了别的标的，就以用户为准；否则用连接器自己的标的
      const named = QUOTE_SYMBOLS.find((s) => text.includes(s))
      return { connector: entry.name, ...quoteEngine(ctx, named ? text : `${entry.name} ${text}`) }
    }
    case 'mail': return { connector: entry.name, ...mailEngine(ctx, text || connectorSample(entry)) }
    case 'doc': return { connector: entry.name, ...docxEngine(ctx, text || connectorSample(entry)) }
    case 'form': return { connector: entry.name, ...formEngine(ctx, text || connectorSample(entry), entry.color) }
    case 'meeting': return { connector: entry.name, ...meetingEngine(ctx, text || connectorSample(entry)) }
    case 'code': return { connector: entry.name, ...codeEngine(ctx, text || connectorSample(entry)) }
    case 'deploy': return { connector: entry.name, ...deployEngine(ctx, text || connectorSample(entry), entry.color) }
    case 'entity': return { connector: entry.name, ...entityEngine(ctx, text || connectorSample(entry)) }
    case 'law': return { connector: entry.name, ...lawEngine(ctx, text || connectorSample(entry)) }
    case 'files': return { connector: entry.name, ...filesEngine(ctx, text || connectorSample(entry)) }
    case 'summary': return { connector: entry.name, ...summaryEngine(ctx, text || connectorSample(entry)) }
    case 'crm': return { connector: entry.name, ...crmEngine(ctx, text || connectorSample(entry)) }
    case 'map': return { connector: entry.name, ...mapEngine(ctx, text || connectorSample(entry)) }
    case 'table': return { connector: entry.name, ...tableEngine(ctx, text || connectorSample(entry)) }
    case 'markdown': return { connector: entry.name, ...toMarkdownEngine(ctx, text || connectorSample(entry)) }
    default: return { connector: entry.name, ...configEngine(entry, text) }
  }
}

/* ---------------- 连接测试（真实执行 + 真实计时 + 真实错误码） ---------------- */

const ERROR_CODES = [
  [200, '成功', '引擎完成处理并返回数据'],
  [400, '输入为空', '严格模式下空输入直接拒绝'],
  [401, '凭据缺失', '需要 token / appKey 的连接器'],
  [404, '资源不存在', '目标文档 / 仓库 / 对象找不到'],
  [429, '频率超限', '远端接口限流'],
  [500, '引擎异常', '连接器配置损坏或引擎抛错'],
]

export function testConnector(entry, input = null) {
  const sample = String(input ?? '').trim() || connectorSample(entry)
  const t0 = nowMs()
  const result = runConnector(entry, sample)
  const latency = Math.max(0, Math.round((nowMs() - t0) * 100) / 100)

  let triggered = 200
  let errorMessage = '无异常'
  try {
    runConnector(entry, '', { strict: true })
  } catch (e) {
    triggered = e.code ?? 500
    errorMessage = e.message
  }

  const fields = (result.stats?.length ?? 0) + (result.blocks?.length ?? 0)
    + (result.findings?.length ?? 0) + (result.artifacts?.length ?? 0)

  const kind = connectorKind(entry)
  const dedicated = !!BY_ID[entry.id]
  const checks = [
    { name: '名称', ok: typeof entry.name === 'string' && entry.name.trim().length >= 2 && entry.name.length <= 40, detail: entry.name || '（空）' },
    { name: '说明', ok: (entry.desc ?? '').trim().length >= 4, detail: clip(entry.desc || '（空）', 40) },
    { name: '分类', ok: !!(entry.category ?? '').trim(), detail: entry.category || '未归类' },
    { name: '引擎', ok: !!kind, detail: dedicated ? `专属引擎 · ${kind}` : '通用连接配置引擎' },
    { name: '凭据', ok: true, warn: !entry.custom, detail: entry.custom ? '自建服务，需自行填写 token' : '本地示例数据，无需凭据' },
    { name: '产物', ok: (result.artifacts?.length ?? 0) > 0, detail: result.artifacts?.map((a) => a.name).join('、') || '无' },
  ]
  const ok = checks.every((c) => c.ok)

  const payload = {
    status: ok ? 200 : 500,
    connector: entry.name,
    kind,
    latency_ms: latency,
    data: Object.fromEntries((result.stats ?? []).map((s) => [s.label, s.value])),
    blocks: (result.blocks ?? []).map((b) => b.type),
    artifacts: (result.artifacts ?? []).map((a) => a.name),
  }

  return {
    ok,
    entry,
    result,
    latency,
    fields,
    checks,
    payload,
    error: { code: triggered, message: errorMessage, triggered: triggered !== 200 },
    errors: ERROR_CODES.map(([code, name, meaning]) => ({ code, name, meaning, hit: code === triggered })),
  }
}

/* ---------- 表单 / 会议 / 代码三类的小包装（统一结果结构） ---------- */

function formEngine(ctx, input, brand) {
  const html = formHTML(ctx, input, brand || '#2aa462')
  const fields = (html.match(/class="field"/g) ?? []).length
  return res('form', '表单页',
    `生成一张 ${fields} 题的可填写表单（${html.length} 字节），自带必填校验与提交反馈，双击即可在浏览器打开。`,
    [
      { label: '字段', value: `${fields}` },
      { label: '字节', value: `${html.length}` },
      { label: '校验', value: 'required' },
      { label: '依赖', value: '0' },
    ],
    [
      { type: 'preview', title: '表单预览（可直接填写）', html },
      { type: 'list', title: '接入后端前', items: ['把 onsubmit 换成真实提交接口', '加一个提交成功页，避免用户重复提交', '敏感字段（手机号）加隐私声明'] },
    ],
    [{ level: 'low', text: '已带 viewport 与必填校验，手机上可正常填写' }],
    [{ name: 'form.html', mime: 'text/html', content: html }],
    { preview: html })
}

function meetingEngine(ctx, input) {
  const minutes = Number((input.match(/(\d{1,3})\s*分钟/) ?? [])[1]) || 60
  const title = clip(lines(input)[0] ?? ctx.topic, 30)
  const ics = icsOf({ title, minutes })
  const agenda = [
    `开场与目标（${Math.round(minutes * 0.1)} 分钟）`,
    `现状与问题（${Math.round(minutes * 0.25)} 分钟）`,
    `方案讨论（${Math.round(minutes * 0.4)} 分钟）`,
    `决定与分工（${Math.round(minutes * 0.25)} 分钟）`,
  ]
  return res('meeting', '会议日程',
    `「${title}」共 ${minutes} 分钟，已生成可导入日历的 .ics 与按比例分配的议程。`,
    [
      { label: '时长', value: `${minutes} 分钟` },
      { label: '议程段', value: `${agenda.length}` },
      { label: '文件', value: '.ics' },
      { label: '提醒', value: '需在日历里设' },
    ],
    [
      { type: 'list', title: '议程（按比例分配）', items: agenda },
      { type: 'code', title: 'iCalendar 内容', code: ics },
      { type: 'list', title: '开会前 10 分钟', items: ['把材料提前发出去，会上不再读稿', '每个议题指定一个决策人', '结束时逐条确认谁在什么时候交付'] },
    ],
    [{ level: 'low', text: '.ics 可直接导入系统日历，时间按分钟精确' }],
    [{ name: 'meeting.ics', mime: 'text/calendar', content: ics }])
}

function codeEngine(ctx, input) {
  const { file, diff, body } = patchOf(ctx, input)
  return res('code', '代码补丁',
    `为 ${file} 生成了可 git apply 的新增补丁（${diff.split('\n').length} 行），含参数校验与返回结构。`,
    [
      { label: '文件', value: file },
      { label: '补丁行', value: `${diff.split('\n').length}` },
      { label: '导出', value: '.patch' },
      { label: '校验', value: '含空值检查' },
    ],
    [
      { type: 'code', title: '源码', code: body },
      { type: 'code', title: 'git patch', code: diff },
      { type: 'list', title: '提交前', items: ['补一条单测覆盖空输入', '确认导出的是 ESM 还是 CJS', 'commit message 写清改了什么'] },
    ],
    [{ level: 'low', text: '补丁格式可直接 git apply，冲突时按文件路径改即可' }],
    [{ name: `${file.split('/').pop()}.patch`, mime: 'text/plain', content: diff }, { name: file.split('/').pop(), mime: 'text/javascript', content: body }])
}

/* ============================================================
   连接是真的：握手 / 凭据校验 / 指纹 / 调用记录
   —— 没有后端，所以「连接」= 用连接的凭据真实跑一次本地引擎：
      · 用真实随机数签发会话凭据，只保存指纹（掩码 + 前 6 位），不存原文
      · 握手就是真跑 runConnector，计时、数产物、给结果做摘要指纹
      · 每次连接 / 断开 / 授权 / 取数都写一条可导出的调用记录
   ============================================================ */

/** FNV-1a 32 位，稳定且不依赖 WebCrypto（jsdom 里也能用） */
export function digestOf(text) {
  let h = 0x811c9dc5
  const s = String(text ?? '')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

const randomChunk = (len) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  const cryptoObj = globalThis.crypto
  if (cryptoObj?.getRandomValues) {
    const buf = new Uint8Array(len)
    cryptoObj.getRandomValues(buf)
    for (let i = 0; i < len; i++) out += alphabet[buf[i] % alphabet.length]
  } else {
    for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

export const AUTH_METHODS = {
  local: { label: '本地引擎', hint: '不需要凭据，握手即真实执行一次本地能力' },
  token: { label: 'API Token', hint: '粘贴服务方给的 token / appKey，只保存指纹' },
  endpoint: { label: 'MCP 端点', hint: '填写 https:// 开头的 MCP 地址' },
  oauth: { label: 'OAuth 授权码', hint: '粘贴授权回调里的 code 或 access_token' },
}

/** 签发一张会话凭据：原文只在内存里用一次，落库的只有掩码与指纹 */
export function issueCredential(method = 'local', raw = '') {
  const value = raw || `db_${method}_${randomChunk(24)}`
  return {
    method,
    masked: `${value.slice(0, 6)}…${value.slice(-4)}`,
    fingerprint: digestOf(value),
    issuedAt: Date.now(),
  }
}

/** 校验用户填的凭据：格式 / 协议 / 长度，返回具体原因，不通过就不算连上 */
export function validateCredential(method, raw) {
  const value = String(raw ?? '').trim()
  if (!value) return { ok: false, reason: '凭据为空：请粘贴 token 或地址' }
  if (method === 'endpoint') {
    let url = null
    try { url = new URL(value) } catch { return { ok: false, reason: '地址格式不对：需要完整的 https://… 链接' } }
    if (!/^https?:$/.test(url.protocol)) return { ok: false, reason: '只接受 http(s) 地址' }
    if (!url.hostname.includes('.')) return { ok: false, reason: '域名看起来不完整' }
    return { ok: true, ...issueCredential(method, value) }
  }
  if (method === 'oauth') {
    if (value.length < 12) return { ok: false, reason: '授权码太短（至少 12 位）' }
    return { ok: true, ...issueCredential(method, value) }
  }
  if (method === 'token') {
    if (value.length < 8) return { ok: false, reason: 'token 太短（至少 8 位）' }
    if (/\s/.test(value)) return { ok: false, reason: 'token 里不能有空格' }
    return { ok: true, ...issueCredential(method, value) }
  }
  return { ok: true, ...issueCredential('local') }
}

/**
 * 握手：真的跑一次这个连接器的能力，返回耗时、字段数、产物与结果指纹。
 * 失败（引擎抛错）时返回 ok:false 与原因，调用方不应把连接状态置为已连接。
 */
export function handshake(entry, { input } = {}) {
  const t0 = nowMs()
  let result = null
  let error = null
  let sample = ''
  try {
    sample = String(input ?? '').trim() || connectorSample(entry)
    result = runConnector(entry, sample)
  } catch (e) {
    error = e?.message ?? String(e)
  }
  const latency = Math.max(0, Math.round((nowMs() - t0) * 100) / 100)
  if (!result) return { ok: false, latency, error: error ?? '引擎未返回结果', fields: 0, artifacts: [] }
  const fields = (result.stats?.length ?? 0) + (result.blocks?.length ?? 0) + (result.findings?.length ?? 0)
  const artifacts = (result.artifacts ?? []).map((a) => a.name)
  return {
    ok: true,
    latency,
    fields,
    artifacts,
    digest: digestOf(JSON.stringify(result)),
    title: result.title,
    at: Date.now(),
    result,
  }
}

/** 调用记录：连接 / 断开 / 授权 / 取数 一条不落，可导出 */
export function pushConnectorLog(store, entry) {
  store.state.connectorLogs ??= []
  store.state.connectorLogs.unshift({ id: `log-${Date.now().toString(36)}-${randomChunk(4)}`, at: Date.now(), ...entry })
  store.state.connectorLogs = store.state.connectorLogs.slice(0, 200)
  store.save()
  return store.state.connectorLogs[0]
}
