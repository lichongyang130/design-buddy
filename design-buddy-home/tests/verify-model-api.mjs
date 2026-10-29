import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {createModelHandler,endpointFor,publicAddress} from '../server/api-models.mjs'
for(const ip of ['127.0.0.1','10.2.3.4','169.254.169.254','100.64.0.1','192.168.0.1','::1','::ffff:127.0.0.1','fc00::1','2001:db8::1'])assert.equal(publicAddress(ip),false,ip)
assert.equal(publicAddress('8.8.8.8'),true)
assert.equal(endpointFor('https://api.deepseek.com/v1',['api.deepseek.com']).pathname,'/v1/chat/completions')
assert.equal(endpointFor('https://api.deepseek.com/v1/chat/completions',['api.deepseek.com']).pathname,'/v1/chat/completions')
for(const url of ['http://api.deepseek.com/v1','https://evil.example/v1','https://user:secret@api.deepseek.com','https://api.deepseek.com/?key=secret','https://api.deepseek.com:8443'])assert.throws(()=>endpointFor(url,['api.deepseek.com']))
let clock=Date.now(),calls=[],failure=false
const handler=createModelHandler({env:{},now:()=>clock,completion:async options=>{calls.push(options);if(failure)throw Error('认证失败：请检查 API Key');return options.test?'OK':'真实 HTTP 网关集成测试回答（上游为模拟服务）'}})
const server=createServer(handler);await new Promise(r=>server.listen(0,'127.0.0.1',r))
const base=`http://127.0.0.1:${server.address().port}`,config={modelId:'deepseek-chat',baseURL:'https://api.deepseek.com/v1'}
const call=async(path,body,headers={})=>{
 const response=await fetch(base+'/api/models/'+path,{method:'POST',headers:{Origin:base,'X-DB-Client':'design-buddy','Content-Type':'application/json',...headers},body:JSON.stringify(body)})
 return {response,data:await response.json()}
}
try{
 let approved=await call('test',{config:{...config,baseURL:'https://discovery-api.intern-ai.org.cn/v1'}});assert.match(approved.data.error,/尚无可用密钥/);assert.equal(calls.length,0)
 let result=await call('test',{config},{Origin:'https://evil.example'});assert.equal(result.response.status,403)
 result=await call('test',{config});assert.match(result.data.error,/尚无可用密钥/);assert.equal(calls.length,0)
 const secret='sk-mock-only-not-a-real-key'
 result=await call('test',{config,apiKey:secret});assert.equal(result.data.ok,true);assert.ok(!JSON.stringify(result.data).includes(secret));assert.equal(calls[0].key,secret);assert.equal(calls[0].test,true)
 let cookie=result.response.headers.get('set-cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/SameSite=Strict/);cookie=cookie.split(';')[0]
 result=await call('chat',{config,messages:[{role:'user',content:'你好'}]},{Cookie:cookie});assert.equal(result.data.ok,true);assert.match(result.data.text,/网关集成测试回答/);assert.equal(calls.at(-1).key,secret)
 result=await call('chat',{config:{...config,modelId:'different-model'},messages:[{role:'user',content:'hi'}]},{Cookie:cookie});assert.match(result.data.error,/尚无可用密钥/)
 result=await call('chat',{config,messages:[{role:'system',content:'bad'}]},{Cookie:cookie});assert.match(result.data.error,/消息内容/)
 failure=true;result=await call('test',{config,apiKey:'sk-failing-fixture'});assert.match(result.data.error,/认证失败/);assert.equal(result.response.headers.get('set-cookie'),null);failure=false
 clock+=31*60000;result=await call('test',{config},{Cookie:cookie});assert.match(result.data.error,/尚无可用密钥/)
 for(let i=0;i<21;i++)result=await call('test',{config})
 assert.equal(result.response.status,429)
 console.log('PASS HTTP model gateway (mock upstream): same-origin, HTTPS/host allowlist, private addresses, actual handler calls, missing/invalid credentials, transient HttpOnly session, chat, expiry, message validation, rate limits, no secret echo')
}finally{await new Promise(r=>server.close(r))}
