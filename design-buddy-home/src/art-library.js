import { artJobs, artCoverage } from './content-art-catalog.js'
import { contentArtURL } from './content-art.js'
import { ART_CASES } from './content-art-catalog.js'
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const jobs=artJobs()
const templates=new Map(ART_CASES.map(t=>[t.id,t]))
const coverage=artCoverage()
let category='全部',limit=36
const $=selector=>document.querySelector(selector)
$('#art-coverage').innerHTML=`<div><b>${coverage.cases}</b><span>全部案例</span></div><div><b>${coverage.casesWithAI}</b><span>已有专属 AI 插画</span></div><div><b>${coverage.casesPending}</b><span>待生成专属 AI 插画</span></div><div><b>${coverage.totalPages.toLocaleString()}</b><span>页面已有内容图解</span></div>`
function filtered(){
 const query=$('#art-search').value.trim().toLowerCase(),status=$('#art-status').value,format=$('#art-format').value
 return jobs.filter(job=>(category==='全部'||job.category===category)&&(status==='all'||job.status===status)&&(format==='all'||job.format===format)&&`${job.name} ${job.title} ${job.templateId}`.toLowerCase().includes(query))
}
function render(){
 const rows=filtered()
 $('#library-categories').innerHTML=['全部',...new Set(jobs.map(j=>j.category))].map(cat=>`<button type="button" data-category="${esc(cat)}" aria-pressed="${cat===category}">${esc(cat)}</button>`).join('')
 $('#library-count').textContent=`显示 ${Math.min(limit,rows.length)} / ${rows.length} 个案例`
 $('#library-grid').innerHTML=rows.slice(0,limit).map(job=>{
   const tpl=templates.get(job.templateId),ready=job.status==='generated'
   return `<article data-case="${esc(job.templateId)}" data-status="${job.status}"><div class="art-preview"><img src="${esc(contentArtURL(tpl,job.pageIndex))}" alt="${esc(job.title)}" loading="lazy"></div><div class="art-caption"><p class="eyebrow">${esc(job.category)} / ${job.format} / PAGE ${job.pageIndex+1}</p><h2>${esc(job.name)}</h2><p>${esc(job.title)}</p><span class="art-state ${ready?'ready':''}">${ready?'专属 AI 插画已生成':'当前为 SVG 图解 · 专属 AI 插画待生成'}</span><details><summary>查看配图任务与内容依据</summary><pre>${esc(job.brief)}</pre></details>${ready?`<a class="art-download" href="${esc(job.src)}" download>下载插画</a>`:''}<a class="case-open" href="/templates.html?tpl=${encodeURIComponent(job.name)}">查看案例 ↗</a></div></article>`
 }).join('')||'<p>没有匹配的案例。</p>'
 $('#library-more').hidden=rows.length<=limit
}
$('#library-categories').addEventListener('click',event=>{const b=event.target.closest('[data-category]');if(b){category=b.dataset.category;limit=36;render()}})
for(const selector of ['#art-search','#art-status','#art-format'])$(selector).addEventListener(selector==='#art-search'?'input':'change',()=>{limit=36;render()})
$('#library-more').addEventListener('click',()=>{limit+=36;render()})
$('#export-art-jobs').addEventListener('click',()=>{
 const pending=filtered().filter(job=>job.status==='pending')
 const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,scope:'case',coverage,jobs:pending},null,2)],{type:'application/json'}))
 const a=document.createElement('a');a.href=url;a.download='content-art-pending-jobs.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
})
render()
