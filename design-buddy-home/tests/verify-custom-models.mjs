import assert from 'node:assert/strict'
import {validateModel,ensureCustomModels} from '../src/model-manager.js'
import {loadPage,click,tick,readState} from './helpers.mjs'
const valid={name:'我的模型',modelId:'custom-chat',baseURL:'https://api.example.com/v1/',keyEnv:'MY_MODEL_API_KEY'}
assert.equal(validateModel(valid).baseURL,'https://api.example.com/v1')
for(const patch of [{name:''},{modelId:'sk-secret'},{modelId:'has space'},{keyEnv:'sk-not-a-variable'},{baseURL:'javascript:alert(1)'},{baseURL:'https://user:pass@api.example.com'},{baseURL:'https://api.example.com?key=secret'},{baseURL:'http://api.example.com/v1'},{baseURL:'https://api.example.com/#secret'}])assert.throws(()=>validateModel({...valid,...patch}))
assert.equal(validateModel({...valid,baseURL:'http://localhost:11434/v1'}).baseURL,'http://localhost:11434/v1')
assert.throws(()=>validateModel(valid,[{...valid,uid:'existing'}]))
const empty={customModels:[],model:'old'};ensureCustomModels(empty,[{id:'preset'}],valid.baseURL);assert.deepEqual(empty.customModels,[]);assert.equal(empty.model,'')
const nativeFetch=globalThis.fetch
const requests=[]
globalThis.fetch=async (url,options)=>{
 if(String(url).startsWith('/api/models/')){requests.push(JSON.parse(options.body));return new Response(JSON.stringify({ok:true,message:'连接成功：模拟上游返回有效响应',latencyMs:10}),{headers:{'Content-Type':'application/json'}})}
 return nativeFetch(url,options)
}
const {doc,w,storage,errors}=await loadPage('/settings.html')
const open=()=>click(w,doc.querySelector('[data-settings="models"]'))
open();await tick()
assert.ok(doc.querySelector('.custom-models-card'))
const initial=doc.querySelectorAll('[data-model-row]').length
assert.ok(!doc.querySelector('.custom-models-card .switch'))
assert.match(doc.querySelector('.custom-models-header').textContent,/当前浏览器/)
assert.ok(!doc.querySelector('.custom-models-header').textContent.includes('~/.workbuddy'))
click(w,doc.querySelector('[data-model-add]'));await tick()
const fill=(values)=>{for(const [key,value]of Object.entries(values)){const field=doc.querySelector(`#custom-model-form [name="${key}"]`);if(field)field.value=value}}
const submit=()=>doc.querySelector('#custom-model-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}))
assert.equal(doc.querySelector('[name=provider]').value,'custom')
assert.equal(doc.querySelector('[name=toolCalling]').checked,true)
assert.equal(doc.querySelector('[name=apiKey]').type,'password')
fill({...valid,modelId:'<img src=x>'});submit();assert.match(doc.querySelector('.model-form-error').textContent,/有效的模型 ID/)
fill(valid)
const secret='sk-transient-test-never-persist'
doc.querySelector('[name=apiKey]').value=secret
click(w,doc.querySelector('.model-key-toggle'));assert.equal(doc.querySelector('[name=apiKey]').type,'text')
click(w,doc.querySelector('.model-key-toggle'));assert.equal(doc.querySelector('[name=apiKey]').type,'password')
click(w,doc.querySelector('[data-model-test]'));await tick();assert.match(doc.querySelector('[data-model-test-status]').textContent,/连接成功/);assert.equal(requests.at(-1).apiKey,secret);assert.equal(doc.querySelector('[name=apiKey]').value,'')
doc.querySelector('[name=imageInput]').checked=true
doc.querySelector('[name=thinking]').checked=true
doc.querySelector('[name=inputLimit]').value='128000'
doc.querySelector('[name=outputLimit]').value='8192'
submit();await tick()
assert.ok(!storage.getItem('design-buddy-state-v1').includes(secret))
assert.equal(doc.querySelectorAll('[data-model-row]').length,initial+1)
assert.ok(!doc.querySelector('.custom-models-list img'))
let added=readState(storage).settings.customModels.find(m=>m.modelId===valid.modelId)
assert.ok(added);assert.equal(added.verified,false);assert.equal(added.inputLimit,128000);assert.equal(added.outputLimit,8192);assert.equal(added.imageInput,true);assert.equal(added.thinking,true)
click(w,doc.querySelector(`[data-model="${valid.modelId}"]`));await tick();assert.equal(readState(storage).settings.model,valid.modelId)
click(w,doc.querySelector(`[data-model-edit="${added.uid}"]`));await tick();fill({name:'改名后的模型',modelId:'custom-chat-updated'});submit();await tick()
assert.equal(readState(storage).settings.model,'custom-chat-updated')
assert.equal(readState(storage).settings.customModels.find(m=>m.uid===added.uid).name,'custom-chat-updated')
click(w,doc.querySelector('[data-model-add]'));await tick();fill({...valid,modelId:'custom-chat-updated'});submit();await tick()
assert.match(doc.querySelector('.model-form-error').textContent,/已存在/)
fill({...valid,inputLimit:'-1'});submit();assert.match(doc.querySelector('.model-form-error').textContent,/正整数/)
click(w,doc.querySelector('[data-model-cancel]'));await tick()
click(w,doc.querySelector(`[data-model-connect="${added.uid}"]`));await tick();click(w,doc.querySelector('[data-model-check]'))
await tick();assert.match(doc.querySelector('[data-connection-status]').textContent,/连接成功/)
click(w,doc.querySelector('[data-model-close]'));await tick()
click(w,doc.querySelector(`[data-model-delete="${added.uid}"]`));await tick();click(w,doc.querySelector('.modal-foot [data-act="cancel"]'));await tick()
assert.ok(readState(storage).settings.customModels.some(m=>m.uid===added.uid))
// A real reload must preserve custom selection instead of migrating to presets.
const reloaded=await loadPage('/settings.html',{storage,freshCopy:true})
click(reloaded.w,reloaded.doc.querySelector('[data-settings="models"]'));await tick()
assert.equal(readState(storage).settings.model,'custom-chat-updated')
assert.ok(reloaded.doc.querySelector('[data-model="custom-chat-updated"]'))
click(reloaded.w,reloaded.doc.querySelector(`[data-model-edit="${added.uid}"]`));await tick()
assert.equal(reloaded.doc.querySelector('[name=apiKey]').value,'')
assert.equal(reloaded.doc.querySelector('[name=imageInput]').checked,true)
assert.equal(reloaded.doc.querySelector('[name=outputLimit]').value,'8192')
click(reloaded.w,reloaded.doc.querySelector('[data-model-cancel]'));await tick()
click(reloaded.w,reloaded.doc.querySelector(`[data-model-delete="${added.uid}"]`));await tick()
click(reloaded.w,reloaded.doc.querySelector('.modal-foot [data-act="ok"]'));await tick()
assert.ok(!readState(storage).settings.customModels.some(m=>m.uid===added.uid))
assert.notEqual(readState(storage).settings.model,'custom-chat-updated')
const other=reloaded.doc.querySelector('[data-settings="appearance"]');click(reloaded.w,other);await tick()
assert.ok(!reloaded.doc.querySelector('.settings-main').classList.contains('settings-models-main'))
assert.deepEqual(errors,[]);assert.deepEqual(reloaded.errors,[])
console.log('PASS custom models: validation, safe URLs/environment names, CRUD, cancel, XSS escaping, selection, reload, honest connection status, empty migration, isolated layout')

globalThis.fetch=nativeFetch
