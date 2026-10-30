import { PRESENTATION_TEMPLATES } from './presentation-templates.js'
import { GENERATED_DOCUMENT_TEMPLATES } from './document-generator.js'
import { planContentArt, renderContentArtSVG, contentArtURL } from './content-art.js'
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const all = [...PRESENTATION_TEMPLATES, ...GENERATED_DOCUMENT_TEMPLATES]
const categories = ['技术文档','报告','融资演讲稿','营销材料','教育','商业规划']
const names = { concept: '主题概念插图', flow: '内容步骤图', metrics: '页面指标', comparison: '双侧对照', table: '数据表', topics: '主题信息图' }
export const samples = categories.flatMap(cat => {
  const tpl = all.find(t => t.cat === cat)
  const indices = []
  const seen = new Set()
  // Select five different visual tasks, not five adjacent chapter dividers.
  tpl.pages.forEach((page,index) => {
    if (index === 0 || ['divider','closing','agenda'].includes(page.layout)) return
    const kind = planContentArt(tpl,index).kind
    if (indices.length < 5 && !seen.has(kind)) { indices.push(index); seen.add(kind) }
  })
  for (let i=1; indices.length<5 && i<tpl.pages.length; i++) if (!indices.includes(i)) indices.push(i)
  return indices.map(index => ({ cat, tpl, index }))
})
const grid = document.querySelector('#review-grid')
const filters = document.querySelector('#review-filters')
let active = '全部'
function render() {
  filters.innerHTML = ['全部',...categories].map(cat => `<button type="button" data-cat="${cat}" aria-pressed="${cat===active}">${cat}${cat==='全部'?' / 30':' / 5'}</button>`).join('')
  grid.innerHTML = samples.map(({cat,tpl,index},i) => {
    if (active!=='全部' && cat!==active) return ''
    const plan = planContentArt(tpl,index)
    return `<article><div class="art-preview">${plan.scene ? `<img src="${plan.scene.src}" alt="${esc(plan.scene.brief)}" loading="lazy">` : renderContentArtSVG(tpl,index)}</div><div class="art-caption"><p class="eyebrow">${cat} / PAGE ${index+1} / ${plan.scene ? 'AI 场景插画' : names[plan.kind]}</p><h2>${esc(plan.title)}</h2><p>${esc(tpl.name)}</p><details><summary>查看配图依据与生成说明</summary><p>来源：当前模板第 ${index+1} 页；介质：${plan.scene ? 'AI 生成的概念插画（非实景照片）' : '可编辑 SVG'}。${plan.comparable?'同单位指标，按原始值比例绘制。':'不推测数值或未经提供的关系。'}</p><pre>${esc(plan.brief)}</pre></details><button type="button" data-download="${i}">${plan.scene ? '下载插画' : '下载 SVG'}</button></div></article>`
  }).join('')
}
filters.addEventListener('click',event=>{ const button=event.target.closest('[data-cat]'); if(button){active=button.dataset.cat;render()} })
grid.addEventListener('click',event=>{
  const button=event.target.closest('[data-download]'); if(!button)return
  const {tpl,index}=samples[Number(button.dataset.download)]
  const scene = planContentArt(tpl,index).scene
  if (scene) { const a=document.createElement('a');a.href=contentArtURL(tpl,index);a.download=scene.src.split('/').pop();a.click();return }
  const url=URL.createObjectURL(new Blob([renderContentArtSVG(tpl,index)],{type:'image/svg+xml'}))
  const a=document.createElement('a');a.href=url;a.download=`${tpl.id}-page-${index+1}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
})
render()
