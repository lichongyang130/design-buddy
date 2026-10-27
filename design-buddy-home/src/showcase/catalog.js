import {CASES,FORMATS} from './data.js'
import {esc} from './art.js'
let format=new URLSearchParams(location.search).get('format')||'all',query='',sort='default',limit=24
if(!FORMATS.some(f=>f.id===format))format='all'
function render(){const found=CASES.filter(c=>(format==='all'||format===c.format)&&`${c.name} ${c.tagline} ${c.formatName} ${c.topic.name}`.toLowerCase().includes(query.trim().toLowerCase()));if(sort==='name')found.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'))
 document.querySelector('#lab-filters').innerHTML=[{id:'all',name:'全部案例'},...FORMATS].map(f=>`<button data-format="${f.id}" aria-pressed="${f.id===format}" class="${f.id===format?'active':''}">${f.name}<small>${f.id==='all'?500:100}</small></button>`).join('')
 document.querySelector('#lab-count').textContent=`${found.length} 个案例 / 已显示 ${Math.min(limit,found.length)} 个`
 document.querySelector('#lab-grid').innerHTML=found.slice(0,limit).map(c=>`<article class="apps-card" data-case="${c.id}"><a class="apps-cover" href="${c.href}" aria-label="打开${esc(c.name)}"><img src="${c.cover}" alt="${esc(c.name)}对应实际案例画面" loading="lazy" width="1200" height="714"><span>${c.id.toUpperCase()}</span><i>打开体验 ↗</i></a><div class="apps-card-heading"><a href="${c.href}"><h3>${esc(c.name.split(' · ')[0])}</h3></a><span>${c.formatName}</span></div><p>${esc(c.name.split(' · ')[1]||c.tagline)}</p><div class="apps-card-tags"><span>${c.topic.name}</span><span>${c.format==='social'?'10 页可编辑':c.format==='webgl'?'真实 GPU 渲染':c.format==='website'?'可交互网站':c.format==='live'?'真实计算与导出':'可编辑与导出'}</span><small>${c.id}</small></div></article>`).join('')||'<p class="apps-empty">没有匹配的案例，试试其他关键词。</p>'
 document.querySelector('#lab-load').hidden=limit>=found.length
}
document.querySelector('#lab-filters').addEventListener('click',e=>{const b=e.target.closest('[data-format]');if(b){format=b.dataset.format;limit=24;history.replaceState(null,'',`?format=${format}`);render()}})
document.querySelector('#lab-search').addEventListener('input',e=>{query=e.target.value;limit=24;render()})
document.querySelector('#lab-sort').addEventListener('change',e=>{sort=e.target.value;render()})
document.querySelector('#lab-load').addEventListener('click',()=>{limit+=24;render()})
render()
