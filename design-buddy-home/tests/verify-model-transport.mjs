// Real transport adapter logic, injected DNS/socket fixtures. No official API call.
import assert from 'node:assert/strict'
import {EventEmitter} from 'node:events'
import {PassThrough} from 'node:stream'
import {requestCompletion} from '../server/api-models.mjs'
const captured=[]
const fixture=(status,body)=>({
 resolveHost:async()=>[{address:'8.8.8.8',family:4}],
 transport:(url,options,onResponse)=>{
  const req=new EventEmitter();req.setTimeout=()=>{};req.destroy=error=>req.emit('error',error)
  req.end=payload=>queueMicrotask(()=>{captured.push({url,options,payload:JSON.parse(payload)});const res=new PassThrough();res.statusCode=status;onResponse(res);res.end(body)})
  return req
 },
})
const config={url:new URL('https://api.deepseek.com/v1/chat/completions'),key:'sk-fake-test-only',model:'deepseek-chat',messages:[{role:'user',content:'hi'}]}
assert.equal(await requestCompletion({...config,...fixture(200,JSON.stringify({choices:[{message:{content:'answer'}}]}))}),'answer')
assert.equal(captured.at(-1).options.headers.Authorization,'Bearer sk-fake-test-only')
assert.equal(captured.at(-1).payload.stream,false)
await requestCompletion({...config,test:true,...fixture(200,JSON.stringify({choices:[{message:{reasoning_content:'thinking'}}]}))})
assert.equal(captured.at(-1).payload.max_tokens,32)
let pinned;captured.at(-1).options.lookup('api.deepseek.com',{all:true},(_,addresses)=>pinned=addresses);assert.equal(pinned[0].address,'8.8.8.8')
for(const [status,body,match]of [
 [401,'API Key sk-fake-should-not-echo',/认证失败/],[403,'hidden',/拒绝访问/],[404,'hidden',/不存在/],[429,'hidden',/额度/],[302,'redirect',/HTTP 302/],[200,'not json',/有效 JSON/],[200,JSON.stringify({choices:[{message:{content:''}}]}),/有效回答/],
])await assert.rejects(()=>requestCompletion({...config,...fixture(status,body)}),match)
await assert.rejects(()=>requestCompletion({...config,...fixture(200,'{}'),resolveHost:async()=>[{address:'169.254.169.254',family:4}]}),/受保护地址/)
console.log('PASS transport fixtures: pinned public DNS, auth header, real completion payload, content/reasoning validation, HTTP errors, no redirects, empty/invalid JSON, private-address rejection; no official API request')
