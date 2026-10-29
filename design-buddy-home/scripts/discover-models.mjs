// Server-side / CLI discovery only. Keys are read from the environment.
// DEEPSEEK_API_KEY=... npm run discover-models
// Optional LLM_API_KEY, LLM_BASE_URL, --base-url, --models id1,id2,
// --timeout 20000, --out src/model-config.js. Probes can incur API charges.
import {mkdirSync,writeFileSync,renameSync,rmSync} from 'node:fs'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {dirname,resolve} from 'node:path'
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..')
export function optionsFrom(args=process.argv.slice(2),env=process.env){
 const values={};for(let i=0;i<args.length;i+=2){const name=args[i];if(!['--base-url','--timeout','--out','--models'].includes(name))throw Error('不支持的参数；密钥只能通过 DEEPSEEK_API_KEY 或 LLM_API_KEY 环境变量提供');if(!args[i+1]||args[i+1].startsWith('--'))throw Error('参数缺少值');values[name]=args[i+1]}
 const key=env.DEEPSEEK_API_KEY||env.LLM_API_KEY||''
 if(!key.trim())throw Error('缺少服务端密钥：请在本机环境设置 DEEPSEEK_API_KEY（或 LLM_API_KEY），不要发到聊天或写入前端源码')
 const url=new URL(values['--base-url']||env.LLM_BASE_URL||env.LLM_API_BASE_URL||env.DEEPSEEK_BASE_URL||'https://api.deepseek.com/v1')
 if(url.username||url.password||url.search||url.hash)throw Error('API 地址不能包含凭据、查询参数或片段')
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)))throw Error('API 地址必须使用 HTTPS（仅本地测试允许 HTTP）')
 const timeout=Number(values['--timeout']||20000);if(!Number.isFinite(timeout)||timeout<100||timeout>180000)throw Error('超时必须在 100–180000 毫秒之间')
 return {base:url.href.replace(/\/+$/,''),key:key.trim(),timeout,out:resolve(ROOT,values['--out']||'src/model-config.js'),models:values['--models']?.split(',').map(s=>s.trim()).filter(Boolean)||null}
}
function statusError(status){return ({401:'密钥无效或已过期',403:'账号没有此服务权限',402:'余额不足',429:'请求限流或额度不足',404:'端点或模型不存在'}[status]||'服务请求失败')+`（HTTP ${status}）`}
async function jsonRequest(url,options,timeout){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout)
 try{const response=await fetch(url,{...options,signal:controller.signal});if(!response.ok){await response.body?.cancel();throw Error(statusError(response.status))}try{return await response.json()}catch(error){if(controller.signal.aborted)throw Error('请求超时');throw Error('响应不是有效 JSON')}}
 catch(error){if(controller.signal.aborted)throw Error('请求超时');if(error.message==='fetch failed')throw Error('网络连接失败，请检查 DNS、代理与出站限制');throw error}
 finally{clearTimeout(timer)}
}
export async function discover(options,log=console.log){
 const {base,key,timeout}=options,headers={Authorization:`Bearer ${key}`,'Content-Type':'application/json'}
 log('① 获取账号模型列表（GET /models）')
 const data=await jsonRequest(`${base}/models`,{headers},timeout),rows=Array.isArray(data)?data:data?.data
 if(!Array.isArray(rows))throw Error('模型列表结构无效：需要 {data:[{id}]}')
 let ids=[...new Set(rows.map(m=>typeof m==='string'?m:m?.id).filter(id=>typeof id==='string'&&id.trim()&&id.length<200&&!id.includes(key)))]
 if(options.models){ids=ids.filter(id=>options.models.includes(id));if(!ids.length)throw Error('指定模型不在账号返回的列表中')}
 if(!ids.length)throw Error('账号返回的模型列表为空')
 if(ids.length>30)throw Error('账号模型超过 30 个，请使用 --models 指定要探测的模型，避免意外费用')
 log(`② 对 ${ids.length} 个模型执行最小对话请求（可能产生少量费用）`)
 const available=[]
 for(const id of ids){const start=Date.now();try{
  const answer=await jsonRequest(`${base}/chat/completions`,{method:'POST',headers,body:JSON.stringify({model:id,messages:[{role:'user',content:'Reply OK.'}],max_tokens:16,stream:false})},timeout)
  const message=answer?.choices?.[0]?.message
  if(!message||![message.content,message.reasoning_content].some(text=>typeof text==='string'&&text.trim()))throw Error('未返回有效对话内容，不能标为验证通过')
  available.push({id,verified:true,latencyMs:Date.now()-start});log('  ✓ 一个模型验证通过')
 }catch(error){log(`  ✗ 一个模型验证失败：${String(error.message).split(key).join('[REDACTED]')}`)}}
 if(!available.length)throw Error('没有模型通过实测，保留原配置；请检查密钥、余额、权限和网络')
 return available.sort((a,b)=>a.latencyMs-b.latencyMs)
}
export function writeConfig(options,models){
 const date=new Date().toISOString(),body=`// Generated after authenticated chat probes. Public identifiers only; no API credentials.\nexport const MODEL_BASE_URL = ${JSON.stringify(options.base)}\nexport const MODEL_DISCOVERED_AT = ${JSON.stringify(date)}\nexport const AVAILABLE_MODELS = ${JSON.stringify(models,null,2)}\nexport const CONFIGURED_MODELS = AVAILABLE_MODELS\nexport const SELECTABLE_MODELS = AVAILABLE_MODELS\n`
 if(body.includes(options.key))throw Error('安全检查失败，未写入配置')
 mkdirSync(dirname(options.out),{recursive:true});const temporary=options.out+`.${process.pid}.tmp`
 try{writeFileSync(temporary,body,'utf8');renameSync(temporary,options.out)}finally{rmSync(temporary,{force:true})}
}
export async function main(args=process.argv.slice(2),env=process.env){const options=optionsFrom(args,env),models=await discover(options);writeConfig(options,models);console.log(`✓ 已保存 ${models.length} 个通过实测的模型标识（不含密钥）。请重新构建并刷新应用。`)}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)main().catch(error=>{const key=process.env.DEEPSEEK_API_KEY||process.env.LLM_API_KEY;console.error('探测失败：',key?String(error.message).split(key).join('[REDACTED]'):error.message);process.exitCode=1})
