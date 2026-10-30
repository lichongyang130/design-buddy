import assert from 'node:assert/strict'
import {loadPage,click,input,tick,readState} from './helpers.mjs'
import {isStandaloneQuestion} from '../src/question-routing.js'
for(const text of ['做一个苹果手机','解释一下什么是大模型','如何制作演示文稿','演示文稿和文档有什么区别','这份报告有什么问题'])assert.equal(isStandaloneQuestion({text}),true,text)
for(const text of ['写一份季度经营分析演示文稿','生成一份年度总结文档','帮我做一组社交轮播卡','给我一张海报','制作一个关于未来十年消费趋势与行业演进以及各个地区发展差异的PPT'])assert.equal(isStandaloneQuestion({text}),false,text)
for(const type of ['演示文稿','文档','图片','轮播图','美化','导入'])assert.equal(isStandaloneQuestion({text:'你好',type}),false)
assert.equal(isStandaloneQuestion({text:'你好',skill:'结构化写作'}),false)
const page=await loadPage('/index.html',{freshCopy:true}),{w,doc,storage}=page
try{
 const before=readState(storage),credits=before.credits,gammas=before.gammas.length,tasks=before.tasks.length
 input(w,doc.querySelector('#prompt-input'),'做一个苹果手机');click(w,doc.querySelector('#send-btn'))
 assert.ok(doc.querySelector('#question-chat'));assert.equal(doc.querySelector('.qa-user-bubble').textContent,'做一个苹果手机');assert.ok(doc.querySelector('.qa-thinking'));assert.ok(doc.querySelector('[data-qa-stop]'));assert.equal(doc.querySelector('.app').hasAttribute('inert'),true)
 let state=readState(storage);assert.equal(state.credits,credits);assert.equal(state.gammas.length,gammas);assert.equal(state.tasks.length,tasks);assert.equal(state.conversations[0].kind,'question')
 input(w,doc.querySelector('#qa-input'),'保留下一条草稿');click(w,doc.querySelector('[data-qa-stop]'));assert.equal(doc.querySelector('.qa-thinking'),null);assert.equal(doc.querySelector('#qa-input').value,'保留下一条草稿');assert.match(doc.querySelector('.qa-notice').textContent,/停止/)
 input(w,doc.querySelector('#qa-input'),'<img src=x onerror=alert(1)>');doc.querySelector('.qa-composer').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(doc.querySelectorAll('.qa-user-bubble').length,2);assert.equal(doc.querySelector('.qa-user-bubble img'),null);assert.ok(doc.querySelector('.qa-thinking'))
 click(w,doc.querySelector('[data-qa-stop]'));click(w,doc.querySelector('[data-qa-retry]'));assert.ok(doc.querySelector('.qa-thinking'));await tick(2600);assert.match([...doc.querySelectorAll('.qa-notice')].at(-1).textContent,/尚未连接问答模型/);assert.equal(doc.querySelector('[data-qa-stop]'),null)
 const savedId=readState(storage).ui.questionChatId
 click(w,doc.querySelector('[data-qa-home]'));assert.equal(doc.querySelector('#question-chat'),null);assert.equal(doc.querySelector('.app').hasAttribute('inert'),false)
 const recent=[...doc.querySelectorAll('[data-nav]')].find(el=>el.textContent.trim()==='最近的对话记录');click(w,recent);click(w,doc.querySelector(`[data-conv="${savedId}"]`));assert.ok(doc.querySelector('#question-chat'));assert.equal(doc.querySelectorAll('.qa-user-bubble').length,2);click(w,doc.querySelector('[data-qa-home]'))
 click(w,doc.querySelector('[data-quick-type="文档"]'));input(w,doc.querySelector('#prompt-input'),'写一个产品介绍');click(w,doc.querySelector('#send-btn'));assert.equal(doc.querySelector('#question-chat'),null);state=readState(storage);assert.equal(state.gammas.length,gammas+1);assert.equal(state.gammas[0].type,'文档')
 assert.deepEqual(page.errors,[])
 console.log('PASS: screenshot-style standalone QA; stop/retry/draft/escape/history; no artifact/task/credit changes; explicit document generation preserved')
}finally{w.close()}
