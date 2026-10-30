// Data-only executable packages. No eval, Function, JS imports, regular expressions or ambient permissions.
export const PLUGIN_ENGINE='db-text-v1'
export const PLUGIN_DEPENDENCIES=Object.freeze({'db-text':'1.0.0'})
const OPS=new Set(['trim','uppercase','lowercase','prefix','suffix','replace','filter-lines','number-lines'])
const LIMIT=2*1024*1024
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k)
export function validatePlugin(source) {
  if(typeof source!=='string'||source.length>512000)throw Error('Plugin package limit: 512 KB')
  const p=JSON.parse(source),m=p?.manifest
  if(!p||Object.keys(p).some(k=>!['manifest','program'].includes(k))||!m||Object.keys(m).some(k=>!['id','name','version','engine','permissions','dependencies'].includes(k)))throw Error('Unknown package or manifest field')
  if(!m||!/^[a-z][a-z0-9.-]{2,63}$/.test(m.id)||typeof m.name!=='string'||!m.name.trim()||m.name.length>80||!/^\d{1,5}\.\d{1,5}\.\d{1,5}$/.test(m.version)||m.engine!==PLUGIN_ENGINE)throw Error('Invalid plugin manifest or unsupported engine')
  if(!Array.isArray(m.permissions)||m.permissions.length!==2||!m.permissions.includes('input:read')||!m.permissions.includes('output:write'))throw Error('Only input:read and output:write are permitted')
  if(!m.dependencies||Array.isArray(m.dependencies)||Object.keys(m.dependencies).length!==1||m.dependencies['db-text']!==PLUGIN_DEPENDENCIES['db-text'])throw Error('Unsupported dependency; db-text@1.0.0 is required')
  if(!Array.isArray(p.program)||p.program.length<1||p.program.length>50)throw Error('Plugin program requires 1–50 instructions')
  for(const step of p.program){
    if(!step||!OPS.has(step.op)||Object.keys(step).some(k=>!['op','text','from','to'].includes(k)))throw Error('Unsupported plugin instruction')
    for(const k of ['text','from','to'])if(own(step,k)&&(typeof step[k]!=='string'||step[k].length>4096))throw Error('Invalid instruction value')
    if(['prefix','suffix','filter-lines'].includes(step.op)&&typeof step.text!=='string')throw Error('Instruction text is required')
    if(step.op==='replace'&&(!step.from||typeof step.to!=='string'))throw Error('Literal replacement requires nonempty from and a to string')
  }
  return {manifest:{id:m.id,name:m.name,version:m.version,engine:m.engine,permissions:[...m.permissions],dependencies:{'db-text':'1.0.0'}},program:p.program.map(s=>({...s}))}
}
export function compareVersions(a,b){const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]>y[i]?1:-1;return 0}
export async function pluginDigest(p){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(p))))].map(b=>b.toString(16).padStart(2,'0')).join('')}
export function runPlugin(p,input) {
  p=validatePlugin(JSON.stringify(p))
  if(typeof input!=='string'||input.length>200000)throw Error('Plugin input limit: 200000 characters')
  let out=input
  for(const s of p.program){
    if(s.op==='trim')out=out.trim()
    else if(s.op==='uppercase')out=out.toUpperCase()
    else if(s.op==='lowercase')out=out.toLowerCase()
    else if(s.op==='prefix')out=s.text+out
    else if(s.op==='suffix')out+=s.text
    else if(s.op==='replace'){
      const parts=out.split(s.from)
      if(out.length+(parts.length-1)*(s.to.length-s.from.length)>LIMIT)throw Error('Plugin output limit exceeded')
      out=parts.join(s.to)
    }else if(s.op==='filter-lines')out=out.split('\n').filter(l=>l.includes(s.text)).join('\n')
    else if(s.op==='number-lines')out=out.split('\n').map((l,i)=>`${i+1}. ${l}`).join('\n')
    if(out.length>LIMIT)throw Error('Plugin output limit exceeded')
  }
  return out
}
export const EXAMPLE_PLUGIN={manifest:{id:'example.clean-notes',name:'Clean numbered notes',version:'1.0.0',engine:PLUGIN_ENGINE,permissions:['input:read','output:write'],dependencies:{'db-text':'1.0.0'}},program:[{op:'trim'},{op:'replace',from:'TODO',to:'ACTION'},{op:'number-lines'}]}
function database(){return new Promise((resolve,reject)=>{const r=indexedDB.open('design-buddy-plugin-packages-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('packages',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function transaction(mode,action){const db=await database();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('packages',mode);let result;try{const request=action(tx.objectStore('packages'));request.onsuccess=()=>{result=request.result};request.onerror=()=>tx.abort()}catch(e){reject(e);return}tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error||Error('Plugin storage transaction aborted'));tx.onerror=()=>{}})}finally{db.close()}}
export const listPlugins=()=>transaction('readonly',store=>store.getAll())
export async function installPlugin(p,expectedDigest) {
  p=validatePlugin(JSON.stringify(p));const digest=await pluginDigest(p)
  if(digest!==expectedDigest)throw Error('Package changed after permission review')
  const existing=await transaction('readonly',s=>s.get(p.manifest.id))
  if(existing){const comparison=compareVersions(p.manifest.version,existing.package.manifest.version);if(comparison<0)throw Error('Downgrades are not allowed');if(comparison===0&&digest!==existing.digest)throw Error('Same version has different content')}
  const receipt={id:p.manifest.id,package:p,digest,enabled:true,installedAt:Date.now()}
  // Read, compare and write together: concurrent installs cannot overwrite a newer version.
  const db=await database()
  try{await new Promise((resolve,reject)=>{const tx=db.transaction('packages','readwrite'),s=tx.objectStore('packages'),get=s.get(receipt.id);get.onsuccess=()=>{const old=get.result,c=old?compareVersions(p.manifest.version,old.package.manifest.version):1;if(c<0||(c===0&&old.digest!==digest)){tx.abort();return}s.put(receipt)};tx.oncomplete=resolve;tx.onabort=()=>reject(Error('Install conflict or storage failure'));tx.onerror=()=>{}})}finally{db.close()}
  return receipt
}
export const uninstallPlugin=id=>transaction('readwrite',s=>s.delete(id))
export async function executeInstalledPlugin(id,input){const r=await transaction('readonly',s=>s.get(id));if(!r||!r.enabled)throw Error('Plugin is not installed or enabled');if(await pluginDigest(r.package)!==r.digest)throw Error('Plugin integrity check failed');return runPlugin(r.package,input)}
