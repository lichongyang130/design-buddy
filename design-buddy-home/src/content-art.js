import { contentSceneFor } from './content-art-scenes.js'
// Content-first artwork. No stock-image rotation, random charts or network calls.
// Recipes are deterministic, inspectable and can also brief a future image provider.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const hash = s => { let n = 2166136261; for (const c of s) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0 }
const textOf = value => typeof value === 'string' || typeof value === 'number' ? String(value) : Array.isArray(value) ? value.map(textOf).join(' ') : value && typeof value === 'object' ? Object.values(value).map(textOf).join(' ') : ''
const labelOf = value => typeof value === 'object' && value ? value.title || value.lab || value.label || textOf(value) : String(value ?? '')
const domains = [
  ['security', /cyber|secur|threat|permission|authentication|安全|权限|信任/i],
  ['data', /database|pipeline|data engineer|analytics|数据|分析|存储/i],
  ['cloud', /cloud|api|software|microservice|platform|devops|architecture|云|架构|软件/i],
  ['health', /health|medical|patient|pharma|hospital|医疗|健康|患者/i],
  ['ecology', /sustainab|climate|energy|agricultur|environment|solar|生态|能源|农业|环境/i],
  ['education', /educat|learn|curriculum|course|school|training|教育|课程|学习|培训/i],
  ['commerce', /retail|commerce|customer|marketing|brand|campaign|supply chain|零售|营销|客户|供应链/i],
  ['finance', /financ|invest|revenue|budget|portfolio|market|business|商业|财务|融资|预算/i],
]
const domainLabels = { security: 'Security / Trust', data: 'Data / Information', cloud: 'Systems / Infrastructure', health: 'Care / Research', ecology: 'Environment / Resources', education: 'Learning / Knowledge', commerce: 'Commerce / Experience', finance: 'Business / Value', editorial: 'Ideas / Perspectives' }
const themes = [['#eef3ef','#193e37','#c5723c'],['#eef1f7','#253d65','#d4673e'],['#f5eddf','#463c2d','#648a61'],['#f2eaf0','#563754','#b77943'],['#e9f2f3','#194b56','#c99136']]

function numeric(value) {
  const match = String(value).trim().match(/^([+$€¥£]?)(-?\d[\d,]*(?:\.\d+)?)\s*(%|[KMB]|x)?$/i)
  if (!match) return null
  return { number: Number(match[2].replace(/,/g, '')), unit: `${match[1] === '+' ? '' : match[1]}${(match[3] || '').toUpperCase()}` }
}
export function planContentArt(tpl, pageIndex, { revision = 0 } = {}) {
  const page = tpl.pages?.[pageIndex] || {}
  const context = [tpl.name, tpl.a, tpl.b, tpl.cat, ...((tpl.pages || []).slice(0, 4).map(p => [p.title, p.body, p.sub].filter(Boolean).join(' ')))].join(' ')
  const content = textOf(Object.fromEntries(Object.entries(page).filter(([key]) => key !== 'img')))
  const subjectText = [page.title, page.body, page.body0, page.body1].filter(Boolean).join(' ')
  const domain = domains.find(([, re]) => re.test(subjectText))?.[0] || domains.find(([, re]) => re.test(context))?.[0] || 'editorial'
  let kind = 'concept'
  let labels = []
  let metrics = []
  if (Array.isArray(page.steps) && page.steps.length) { kind = 'flow'; labels = page.steps.map(labelOf) }
  else if (Array.isArray(page.left) && Array.isArray(page.right)) { kind = 'comparison'; labels = [page.leftTitle || 'A', page.rightTitle || 'B'] }
  else if (Array.isArray(page.stats) && page.stats.length) { kind = 'metrics'; metrics = page.stats.map(s => ({ label: String(s.lab || ''), value: String(s.val ?? '') })) }
  else if (page.stat != null) { kind = 'metrics'; metrics = [{ label: page.lab || page.sub || page.title, value: String(page.stat) }] }
  else if (page.layout === 'bars' && Array.isArray(page.items)) {
    metrics = page.items.flatMap(item => { const m = String(item).match(/^(.*?)\s+([+$€¥£]?-?\d[\d,.]*\s*(?:%|[KMB]|x)?)$/i); return m ? [{ label: m[1], value: m[2] }] : [] })
    if (metrics.length === page.items.length && metrics.length) kind = 'metrics'
  }
  else if (Array.isArray(page.rows) && page.rows.length) { kind = 'table'; labels = page.head || [] }
  else if (Array.isArray(page.items) && page.items.length) { kind = 'topics'; labels = page.items.map(labelOf) }
  const parsed = metrics.map(m => numeric(m.value))
  // Only same-unit, nonnegative values get comparable bars. Years are not magnitudes.
  const comparable = metrics.length > 1 && parsed.every(Boolean) && new Set(parsed.map(p => p.unit)).size === 1 && parsed.every(p => p.number >= 0) && !metrics.some(m => /year|年|date|日期/i.test(m.label))
  const scene = contentSceneFor(tpl, pageIndex)
  const identity = `${tpl.id || tpl.name}:${pageIndex}:${content}:${revision}`
  return {
    id: `content-art-${hash(identity).toString(16)}`, templateId: tpl.id || tpl.name,
    pageIndex, title: String(page.title || page.quote || tpl.name || ''), domain, kind, scene,
    labels, metrics, comparable, palette: themes[hash(tpl.id || tpl.name || '') % themes.length],
    evidence: [page.body, page.body0, page.body1, page.sub, page.quote].filter(v => typeof v === 'string' && v.trim()).slice(0, 2),
    source: 'template-content', medium: scene ? 'ai-illustration' : 'editable-svg', revision,
    description: `${domainLabels[domain]} · ${kind} · ${page.title || tpl.name}`,
    brief: scene?.brief || `Create a ${domain} ${kind} visual for “${page.title || tpl.name}”. Case context: ${context}. Page content: ${content}. Keep case palette and subject consistent. Do not invent numbers, people or factual relationships.`,
  }
}

function lines(value, width = 25, limit = 3) {
  const words = String(value ?? '').split(/\s+/)
  const result = []; let line = ''
  for (const word of words) {
    for (const chunk of word.match(new RegExp(`.{1,${width}}`, 'gu')) || ['']) {
      if (line && line.length + chunk.length + 1 > width) { result.push(line); line = '' }
      line += (line ? ' ' : '') + chunk
    }
  }
  if (line) result.push(line)
  return result.slice(0, limit).map((s, i) => i === limit - 1 && result.length > limit ? s.replace(/.$/, '…') : s)
}
function text(value, x, y, { size = 15, width = 25, limit = 3, fill = 'currentColor', weight = 400 } = {}) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}">${lines(value, width, limit).map((s, i) => `<tspan x="${x}" dy="${i ? size * 1.3 : 0}">${esc(s)}</tspan>`).join('')}</text>`
}
const rect = (x,y,w,h,fill,rx=10) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`

function scene(domain, ink, accent) {
  const stroke = `fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`
  const shapes = {
    security: `<path d="M250 88L355 124V197Q350 267 250 305Q150 267 145 197V124Z" fill="${accent}" opacity=".17"/><g ${stroke}><path d="M250 88L355 124V197Q350 267 250 305Q150 267 145 197V124Z"/><rect x="214" y="170" width="72" height="64" rx="10"/><path d="M226 170v-18a24 24 0 0148 0v18M250 196v16"/><path d="M96 155h30m-30 50h30m248-50h30m-30 50h30"/></g>`,
    data: `<g ${stroke}><ellipse cx="250" cy="123" rx="78" ry="26"/><path d="M172 123v120c0 35 156 35 156 0V123M172 163c0 35 156 35 156 0M172 203c0 35 156 35 156 0"/><path d="M80 170h62m218 40h60M130 160l12 10-12 10M408 200l12 10-12 10"/></g><circle cx="94" cy="170" r="8" fill="${accent}"/><circle cx="395" cy="210" r="8" fill="${accent}"/>`,
    cloud: `<g ${stroke}><path d="M179 143a35 35 0 0157-32 48 48 0 0187 24 30 30 0 010 60H183a26 26 0 01-4-52Z"/><path d="M250 195v33M127 251v-23h246v23M250 228v23"/><rect x="91" y="253" width="72" height="48" rx="5"/><rect x="214" y="253" width="72" height="48" rx="5"/><rect x="337" y="253" width="72" height="48" rx="5"/></g><path d="M113 276h28m96 0h26m96 0h28" stroke="${accent}" stroke-width="6"/>`,
    health: `<circle cx="250" cy="192" r="100" fill="${accent}" opacity=".13"/><g ${stroke}><path d="M215 105h70v51h51v70h-51v51h-70v-51h-51v-70h51Z"/><path d="M82 207h55l16-30 20 65 22-43h20m118 0h25l18-32 19 53 14-22h31"/></g>`,
    ecology: `<g ${stroke}><path d="M250 295V150M250 230q-100-5-95-115 101-4 95 115M251 193q-2-100 99-96-2 99-99 96M174 138l75 92m82-112-79 76M104 296h292"/><circle cx="386" cy="98" r="23"/><path d="M386 60v-12m0 100v-12m-39-38h-12m100 0h-12"/></g><path d="M172 149q50 7 64 63-52-3-64-63" fill="${accent}" opacity=".5"/>`,
    education: `<g ${stroke}><path d="M250 145q-70-44-150-17v148q80-27 150 17 70-44 150-17V128q-80-27-150 17v148"/><path d="M125 165q47-10 98 13m-98 17q47-10 98 13m-98 17q47-10 98 13m54-60q51-23 98-13m-98 43q51-23 98-13m-98 43q51-23 98-13"/></g><circle cx="250" cy="89" r="16" fill="${accent}"/>`,
    commerce: `<g ${stroke}><path d="M139 179h223l-20 90H162l-30-135h-32M174 180v-48h151v48M210 132V98h81v34"/><circle cx="182" cy="294" r="12"/><circle cx="321" cy="294" r="12"/></g><path d="M226 208h60v32h-60Z" fill="${accent}" opacity=".65"/>`,
    finance: `<g ${stroke}><rect x="125" y="91" width="178" height="218" rx="8"/><path d="M152 126h122M152 154h122M152 185h53m-53 28h53m-53 28h53m-53 28h53M245 181h29m-29 28h29m-29 28h29m-29 28h29"/><circle cx="330" cy="248" r="57"/><path d="M330 219v58m15-45q-28-18-29 2c0 12 29 8 29 21q-1 20-30 3"/></g><circle cx="330" cy="248" r="46" fill="${accent}" opacity=".15"/>`,
    editorial: `<g ${stroke}><rect x="118" y="95" width="184" height="225" rx="5"/><path d="M151 139h114m-114 24h114m-114 95h114m-114 24h70"/><circle cx="320" cy="194" r="59"/><path d="M363 237l42 48"/></g><path d="M151 193h80v42h-80Z" fill="${accent}" opacity=".5"/>`,
  }
  return shapes[domain] || shapes.editorial
}

export function renderContentArtSVG(tpl, pageIndex, options) {
  const plan = planContentArt(tpl, pageIndex, options)
  const page = tpl.pages?.[pageIndex] || {}
  const [paper, ink, accent] = plan.palette
  let drawing = ''
  if (plan.kind === 'flow') {
    const nodes = plan.labels.slice(0, 6)
    drawing = nodes.map((label, i) => {
      const x = 32, y = 79 + i * 43
      return `${rect(x,y,436,36,'#ffffff',6)}<circle cx="55" cy="${y+18}" r="12" fill="${ink}"/>${text(i+1,51,y+22,{size:12,fill:paper})}${text(label,79,y+22,{size:12,width:57,limit:1})}${i+1<nodes.length ? `<path d="M250 ${y+36}v7m-3-3 3 3 3-3" stroke="${accent}" fill="none" stroke-width="2"/>` : ''}`
    }).join('')
  } else if (plan.kind === 'metrics') {
    const max = Math.max(...plan.metrics.map(m => numeric(m.value)?.number || 0), 1)
    drawing = plan.metrics.slice(0, 5).map((m, i) => {
      const y = 84 + i * 54
      return `${text(m.label,32,y+13,{size:12,width:33,limit:1})}${text(m.value,468,y+14,{size:18,width:18,weight:600}).replace('<text ', '<text text-anchor="end" ')}${plan.comparable ? `${rect(32,y+24,436,8,'#ffffff')}${rect(32,y+24,436 * numeric(m.value).number / max,8,accent)}` : `<path d="M32 ${y+35}h436" stroke="${ink}" opacity=".12"/>`}`
    }).join('')
  } else if (plan.kind === 'comparison') {
    drawing = [page.left || [],page.right || []].map((items,i) => {
      const x = 26+i*238
      return `${rect(x,82,222,254,i ? '#ffffff' : paper)}${text(plan.labels[i],x+16,111,{size:16,width:22,weight:600})}${items.slice(0,5).map((item,j) => `${rect(x+16,132+j*38,4,23,accent,0)}${text(labelOf(item),x+29,144+j*38,{size:11,width:27,limit:2})}`).join('')}`
    }).join('')
  } else if (plan.kind === 'table') {
    const rows = (page.rows || []).slice(0,5).map(r => Array.isArray(r) ? r : Object.values(r))
    const cols = Math.min(4, Math.max(plan.labels.length, rows[0]?.length || 0, 1))
    drawing = `${rect(24,82,452,40,ink,5)}${plan.labels.slice(0,cols).map((l,i) => text(l,34+i*448/cols,105,{size:11,width:15,limit:1,fill:paper})).join('')}${rows.map((r,j) => `${rect(24,126+j*41,452,39,'#ffffff',3)}${r.slice(0,cols).map((c,i) => text(c,34+i*448/cols,150+j*41,{size:11,width:15,limit:1})).join('')}`).join('')}`
  } else if (plan.kind === 'topics') {
    drawing = plan.labels.slice(0,6).map((label,i) => {
      const x = 26+(i%2)*239, y = 87+Math.floor(i/2)*84
      return `${rect(x,y,223,72,'#ffffff')}${text(String(i+1).padStart(2,'0'),x+13,y+26,{size:20,fill:accent,weight:600})}${text(label,x+49,y+24,{size:13,width:23,limit:3})}`
    }).join('')
  } else {
    if (plan.evidence.length) {
      drawing = `<g transform="translate(-20,30) scale(.66)">${scene(plan.domain,ink,accent)}</g>`
      drawing += plan.evidence.map((e,i) => `${rect(302,91+i*112,174,100,'#ffffff',8)}${text(e,314,112+i*112,{size:11,width:24,limit:6})}`).join('')
    } else drawing = scene(plan.domain,ink,accent)
    // A conceptual scene, never a claimed architecture or measured trend.
    drawing += text(page.eyebrow || domainLabels[plan.domain],32,336,{size:12,width:55,limit:1,fill:accent})
  }
  const sourceLabel = plan.kind === 'concept' ? 'CONCEPT ILLUSTRATION · NOT A FACTUAL SCHEMATIC' : 'SOURCE: THIS TEMPLATE PAGE · SAMPLE CONTENT'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 380" role="img" aria-label="${esc(plan.description)}" data-art-id="${plan.id}" data-art-kind="${plan.kind}"><title>${esc(plan.description)}</title><desc>${esc(plan.brief)}</desc><rect width="500" height="380" fill="${paper}"/><g fill="${ink}" color="${ink}" font-family="Arial, sans-serif">${text(plan.title,26,32,{size:17,width:43,limit:2,weight:600})}<path d="M26 67h448" stroke="${ink}" opacity=".18"/>${drawing}${text(sourceLabel,26,361,{size:8,width:85,limit:1})}</g></svg>`
}
export function contentArtURL(tpl, pageIndex, options) {
  const scene = contentSceneFor(tpl, pageIndex)
  if (scene) return scene.src
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderContentArtSVG(tpl, pageIndex, options))}`
}
export function renderContentArt(tpl, pageIndex, options) {
  const plan = planContentArt(tpl, pageIndex, options)
  if (plan.scene) return `<div class="dp-art dp-art-img dp-art-scene" data-art-id="${plan.id}" data-art-kind="illustration"><img src="${esc(plan.scene.src)}" alt="${esc(plan.scene.brief)}" loading="lazy"></div>`
  return `<div class="dp-art dp-art-content" data-art-kind="${plan.kind}" data-art-id="${plan.id}">${renderContentArtSVG(tpl,pageIndex,options)}</div>`
}
