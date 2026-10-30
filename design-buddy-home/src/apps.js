import {APP_CASES,DOMAINS} from './app-catalog.js'
import {escapeAppText as esc} from './app-case-art.js'
let domain='all',query='',sort='default'
const families={editorial:'杂志式叙事',athletic:'力量型界面',minimal:'极简留白',paper:'纸感手记',organic:'自然有机',playful:'轻趣卡片',gallery:'画廊陈列',utility:'工具工作台',studio:'创作工作室',zen:'静谧生活'}
function render(){
 document.querySelector('#apps-filters').innerHTML=[['all','全部案例'],...Object.entries(DOMAINS).map(([id,d])=>[id,d.name])].map(([id,name])=>`<button data-domain="${id}" class="${id===domain?'active':''}" aria-pressed="${id===domain}">${esc(name)}<small>${id==='all'?50:5}</small></button>`).join('')
 let list=APP_CASES.filter(a=>(domain==='all'||a.domain===domain)&&`${a.name} ${a.id} ${a.tagline} ${a.domainLabel}`.toLowerCase().includes(query.toLowerCase().trim()))
 if(sort==='pages')list.sort((a,b)=>b.pageCount-a.pageCount);if(sort==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'))
 document.querySelector('#apps-count').textContent=`${list.length} 个案例 / ${list.reduce((n,a)=>n+a.pageCount,0).toLocaleString('en-US')} 个页面`
 document.querySelector('#apps-grid').innerHTML=list.map(a=>`<article class="apps-card"><a class="apps-cover" href="${a.href}" aria-label="打开${esc(a.name)}，${a.pageCount}页交互原型"><img src="${a.cover}" alt="${esc(a.name)}品牌封面与真实 App 首页" loading="lazy" width="1200" height="714"><span>${String(a.index+1).padStart(2,'0')} / ${a.id.toUpperCase()}</span><i>打开原型 ↗</i></a><div class="apps-card-heading"><a href="${a.href}"><h3>${esc(a.name)}</h3></a><span>${a.pageCount} 页 · 可交互</span></div><p>${esc(a.tagline)}</p><div class="apps-card-tags"><span>${esc(a.domainLabel)}</span><span>${families[a.framework.family]}</span><small>${a.framework.id}</small></div></article>`).join('')||'<p class="apps-empty">没有找到匹配的案例，试试其他关键词。</p>'
}
document.querySelector('#apps-filters').addEventListener('click',e=>{const b=e.target.closest('[data-domain]');if(b){domain=b.dataset.domain;render()}})
document.querySelector('#apps-search').addEventListener('input',e=>{query=e.target.value;render()})
document.querySelector('#apps-sort').addEventListener('change',e=>{sort=e.target.value;render()})
render()
