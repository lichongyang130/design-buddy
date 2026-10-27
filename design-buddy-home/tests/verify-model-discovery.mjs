import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {mkdtemp,readFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {optionsFrom,discover,writeConfig} from '../scripts/discover-models.mjs'
import {AVAILABLE_MODELS,SELECTABLE_MODELS,MODEL_DISCOVERED_AT,MODEL_BASE_URL} from '../src/model-config.js'
if(MODEL_DISCOVERED_AT===null){assert.equal(MODEL_BASE_URL,'https://api.deepseek.com/v1');assert.equal(AVAILABLE_MODELS.length,0);assert.equal(SELECTABLE_MODELS.length,2);assert.ok(SELECTABLE_MODELS.every(m=>m.verified===false))}else{assert.ok(AVAILABLE_MODELS.length>0);assert.ok(SELECTABLE_MODELS.every(m=>m.verified===true))}
assert.throws(()=>optionsFrom([],{}),/缺少/)
assert.throws(()=>optionsFrom(['--key','not-a-real-key'],{}),/环境变量/)
assert.throws(()=>optionsFrom(['--timeout','NaN'],{DEEPSEEK_API_KEY:'test-only'}),/超时/)
assert.throws(()=>optionsFrom(['--base-url','http://external.example/v1'],{DEEPSEEK_API_KEY:'test-only'}),/HTTPS/)
assert.throws(()=>optionsFrom(['--base-url','https://user:pass@example.com/v1'],{DEEPSEEK_API_KEY:'test-only'}),/凭据/)
const secret='test-only-local-mock-credential',logs=[],dir=await mkdtemp(join(tmpdir(),'model-discovery-')),out=join(dir,'models.mjs')
let scenario='mixed';const requested=[]
const server=createServer(async(req,res)=>{
 assert.equal(req.headers.authorization,'Bearer '+secret)
 res.setHeader('Content-Type','application/json')
 if(scenario==='unauthorized'){res.writeHead(401);res.end(JSON.stringify({error:{message:secret}}));return}
 if(scenario==='malformed'){res.end('not-json');return}
 if(scenario==='slow'){setTimeout(()=>res.end('{}'),250);return}
 if(req.url==='/v1/models'){res.end(JSON.stringify({data:scenario==='empty'?[]:[{id:'chat'},{id:'reasoning'},{id:'broken'},{id:'denied'},{id:'chat'}]}));return}
 let text='';for await(const chunk of req)text+=chunk;const payload=JSON.parse(text);requested.push(payload.model)
 assert.equal(payload.max_tokens,16);assert.equal(payload.stream,false)
 if(scenario==='allfail'||payload.model==='denied'){res.writeHead(402);res.end(JSON.stringify({error:{message:secret}}));return}
 if(payload.model==='broken'){res.end('{}');return}
 res.end(JSON.stringify({choices:[{message:payload.model==='reasoning'?{content:null,reasoning_content:'Reasoning test output'}:{content:'OK'}}]}))
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
const base=`http://127.0.0.1:${server.address().port}/v1`,options=optionsFrom(['--base-url',base,'--out',out],{DEEPSEEK_API_KEY:secret})
try{
 const models=await discover(options,line=>logs.push(line));assert.deepEqual(models.map(m=>m.id).sort(),['chat','reasoning']);assert.equal(requested.filter(id=>id==='chat').length,1);assert.ok(models.every(m=>m.verified&&m.latencyMs>=0))
 writeConfig(options,models);const body=await readFile(out,'utf8');assert.ok(!body.includes(secret));const exported=await import(pathToFileURL(out));assert.equal(exported.SELECTABLE_MODELS.length,2);assert.ok(exported.MODEL_DISCOVERED_AT)
 scenario='allfail';const original=body;await assert.rejects(()=>discover(options,line=>logs.push(line)),/保留原配置/);assert.equal(await readFile(out,'utf8'),original)
 scenario='unauthorized';await assert.rejects(()=>discover(options,line=>logs.push(line)),/密钥无效/)
 scenario='empty';await assert.rejects(()=>discover(options,line=>logs.push(line)),/列表为空/)
 scenario='malformed';await assert.rejects(()=>discover(options,line=>logs.push(line)),/有效 JSON/)
 scenario='slow';await assert.rejects(()=>discover({...options,timeout:100},line=>logs.push(line)),/超时/)
 assert.ok(!logs.join('\n').includes(secret));console.log('PASS: unverified DeepSeek presets; env/base validation; authenticated mock discovery, real-response checks, reasoning, failures, timeout, no secret in logs/files, previous config preserved')
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await rm(dir,{recursive:true,force:true})}
