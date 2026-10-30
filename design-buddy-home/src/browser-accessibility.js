import DOMPurify from 'dompurify'
import axeSource from 'axe-core/axe.min.js?raw'
export function browserAccessibility(host,source,onKeyboard=()=>{}) {
  if(source.length>200000)throw Error('HTML limit: 200000 characters')
  const clean=DOMPurify.sanitize(source,{WHOLE_DOCUMENT:true,ADD_TAGS:['style'],FORBID_TAGS:['script','iframe','object','embed','link','base','meta'],FORBID_ATTR:['nonce','autofocus']})
  const parsed=new DOMParser().parseFromString(clean,'text/html')
  if(parsed.querySelectorAll('*').length>3000)throw Error('HTML node limit: 3000')
  const nonce=crypto.randomUUID().replaceAll('-',''),token=crypto.randomUUID(),frame=document.createElement('iframe')
  frame.sandbox='allow-scripts';frame.title='Isolated accessibility audit';frame.className='fs-audit-frame'
  const csp=`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'`
  const script=`(()=>{const token=${JSON.stringify(token)};const send=(type,payload)=>parent.postMessage({token,type,payload},'*');let count=0;document.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault()},true);document.addEventListener('keydown',e=>{if(!e.isTrusted)return;if(e.key==='Escape')send('escape',{});if(e.key==='Tab')setTimeout(()=>{const a=document.activeElement;send('keyboard',{count:++count,shift:e.shiftKey,tag:a?.tagName,name:(a?.getAttribute('aria-label')||a?.textContent||a?.getAttribute('name')||'').trim().slice(0,120)})},0)},true);axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}).then(r=>send('audit',{violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,help:v.help,nodes:v.nodes.length})),passes:r.passes.length,engine:r.testEngine})).catch(e=>send('error',e.message))})()`
  frame.srcdoc=`<!doctype html><html lang="${parsed.documentElement.lang.replace(/[^a-zA-Z-]/g,'')}"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><title>${parsed.title.replace(/[<>&]/g,'')}</title>${[...parsed.querySelectorAll('style')].map(s=>s.outerHTML).join('')}</head><body>${parsed.body.innerHTML}<script nonce="${nonce}">${axeSource.replace(/<\/script/gi,'<\\/script')}</script><script nonce="${nonce}">${script}</script></body></html>`
  let finish,timer
  const promise=new Promise((resolve,reject)=>{finish=()=>{clearTimeout(timer);window.removeEventListener('message',message)};function message(e){if(e.source!==frame.contentWindow||e.data?.token!==token)return;if(e.data.type==='audit'){clearTimeout(timer);resolve(e.data.payload)}else if(e.data.type==='keyboard')onKeyboard(e.data.payload);else if(e.data.type==='escape')host.previousElementSibling?.focus();else if(e.data.type==='error'){finish();reject(Error(e.data.payload))}}window.addEventListener('message',message);timer=setTimeout(()=>{finish();frame.remove();reject(Error('Browser audit timed out'))},20000)})
  host.replaceChildren(frame)
  return {frame,promise,destroy(){finish?.();frame.remove()}}
}
