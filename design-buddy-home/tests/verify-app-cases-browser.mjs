// Real Chromium integration; optional external Playwright/Chromium modules.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {APP_CASES} from '../src/app-catalog.js'
const {chromium}=await import(process.env.APP_PLAYWRIGHT_MODULE||'playwright')
const provider=process.env.APP_CHROMIUM_MODULE?(await import(process.env.APP_CHROMIUM_MODULE)).default:null
const browser=await chromium.launch({headless:true,...(provider?{executablePath:await provider.executablePath(),args:provider.args}:{})})
const base=process.env.APP_PREVIEW_URL||'http://127.0.0.1:5174',errors=[],failed=[]
let routeCount=0
try{
 const page=await browser.newPage({viewport:{width:390,height:844}})
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url()+' '+r.status())})
 for(const app of APP_CASES){
  await page.goto(base+app.href);await page.locator('.app-device').waitFor()
  const result=await page.evaluate(async config=>{
   const check=(value,message)=>{if(!value)throw Error(config.id+': '+message)},q=s=>document.querySelector(s)
   const visit=async(kind,id='')=>{const hash='#'+kind+(id?'/'+id:'');if(location.hash===hash)return;await new Promise(resolve=>{addEventListener('hashchange',resolve,{once:true});location.hash=hash})}
   const tap=selector=>{const el=q(selector);check(!!el,'missing control '+selector);el.click()}
   const submit=selector=>tap(selector+' button[type=submit]')
   const fill=(selector,value)=>{const el=q(selector);check(!!el,'missing field '+selector);el.value=value}
   const read=()=>JSON.parse(localStorage.getItem('design-buddy-appcase-v1:'+config.id))
   check(q('[data-case]').dataset.case===config.id,'case identity')
   check([...document.querySelectorAll('[data-home-module]')].map(e=>e.dataset.homeModule).join('|')===config.homeOrder.join('|'),'rendered home structure')
   check(!read()?.saved.length,'state leaks between cases')
   for(const kind of config.screens){await visit(kind);check(q('[data-page]').dataset.page===kind,'route '+kind);check(q('#ac-content').innerText.trim().length>20,'empty page '+kind);check(!!q('#ac-content .ac-visual, #ac-content img'),'missing content image '+kind);check(q('#ac-content').scrollWidth<=q('#ac-content').clientWidth+1,'horizontal page overflow '+kind)}
   await visit('search');fill('#ac-search',config.itemTitle);q('#ac-search').dispatchEvent(new Event('input',{bubbles:true}));check(document.querySelectorAll('.ac-item').length===1,'live search');tap('[data-clear-search]');check(document.querySelectorAll('.ac-item').length===5,'clear search')
   tap('[data-category="精选"]');check(document.querySelectorAll('.ac-item').length===1,'category filter')
   await visit('detail','item-0');tap('[data-save="item-0"]');check(read().saved.includes('item-0'),'save')
   tap('[data-add-plan="item-0"]');submit('[data-form="add-plan"]');check(read().plans[0].items[0]==='item-0','add to plan')
   await visit('detail','item-1');tap('[data-add-plan="item-1"]');submit('[data-form="add-plan"]');check(read().plans[0].items.length===2,'second plan item');tap('[data-move="item-1"][data-direction="-1"]');check(read().plans[0].items[0]==='item-1','reorder')
   tap('[data-plan-tools]');fill('[data-form="rename-plan"] input[name=name]','测试计划 '+config.id);submit('[data-form="rename-plan"]');check(read().plans[0].name==='测试计划 '+config.id,'rename plan')
   await visit('checklist');tap('[data-check="item-1:0"]');check(read().plans[0].checked.includes('item-1:0'),'checklist')
   await visit('detail','item-0');tap('[data-add-collection="item-0"]');submit('[data-form="add-collection"]');check(read().collections[0].items[0]==='item-0','content folder')
   await visit('note','new-item-0');fill('[name=title]','自己的记录 '+config.id);fill('[name=body]','这是本地测试正文 <img src=x onerror=alert(1)>');submit('[data-form="note"]');check(read().notes.length===1,'save note');check(q('.ac-note-row').innerText.includes('<img'),'escape user text');check(!q('.ac-note-row img'),'injected note image')
   tap('.ac-note-row');fill('[name=body]','修改后的正文');submit('[data-form="note"]');check(read().notes[0].body==='修改后的正文','edit note')
   await visit('inbox');tap('[data-open-message="welcome"]');fill('[name=body]','仅本地回复');submit('[data-form="reply"]');check(read().read.includes('welcome')&&read().replies.length===1,'read / reply')
   await visit('detail','item-0');tap('[data-complete="item-0"]');check(read().completed.includes('item-0'),'mark complete')
   await visit('profile');tap('[data-edit-profile]');fill('[data-form="profile"] input[name=name]','体验 '+config.id);submit('[data-form="profile"]');check(read().username==='体验 '+config.id,'profile')
   await visit('settings');tap('[data-setting="compact"]');check(read().compact,'local setting')
   return config.screens.length
  },{id:app.id,screens:app.screens.map(s=>s.id),homeOrder:app.framework.homeOrder,itemTitle:app.items[0].title})
  routeCount+=result
  await page.reload();assert.ok(await page.locator('[data-setting="compact"]').isChecked(),app.id+' refresh persistence')
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('design-buddy-appcase-v1:'+new URLSearchParams(location.search).get('app'))).saved.length),1)
  console.log(`PASS ${app.index+1}/50 ${app.id}: ${result} routes + search/filter/save/plan/reorder/checklist/folder/note/message/profile/settings/reload`)
 }
 // Additional pages on the 24-screen case, and deletion / timer state machine.
 await page.goto(base+'/app-case.html?app=tablelife#review');await page.locator('.ac-rating').waitFor();await page.locator('[data-rating="4"]').click();assert.equal(await page.locator('[data-rating="4"]').getAttribute('aria-pressed'),'true')
 await page.goto(base+'/app-case.html?app=tablelife#timer');await page.locator('[data-timer-minutes="5"]').click();await page.locator('[data-timer-toggle]').click();await page.waitForTimeout(1100);assert.notEqual(await page.locator('#ac-timer-display').innerText(),'05:00');await page.locator('[data-timer-toggle]').click();await page.reload();assert.match(await page.locator('#ac-timer-display').innerText(),/^04:/)
 await page.locator('[data-timer-reset]').click();assert.equal(await page.locator('#ac-timer-display').innerText(),'15:00')
 await page.goto(base+'/app-case.html?app=tablelife#progress');assert.equal(await page.locator('.ac-progress-ring b').innerText(),'20%')
 await page.goto(base+'/app-case.html?app=tablelife#notes');await page.locator('.ac-note-row').click();await page.locator('[data-delete="note"]').click();await page.locator('[data-confirm-delete="note"]').click();assert.equal(await page.locator('.ac-note-row').count(),0)
 await page.goto(base+'/app-case.html?app=tablelife#collections');await page.locator('[data-go="collection"]').first().click();await page.locator('[data-remove-collection-item]').click();assert.equal(await page.locator('.ac-collection-item').count(),0);await page.locator('[data-delete="collection"]').click();await page.locator('[data-confirm-delete="collection"]').click()
 await page.goto(base+'/app-case.html?app=tablelife#planner');await page.locator('[data-go="plan"]').first().click();await page.locator('[data-plan-tools]').click();await page.locator('[data-delete="plan"]').click();await page.locator('[data-confirm-delete="plan"]').click();assert.equal(await page.locator('.ac-folder-row').count(),0)
 // Four device sizes, every art-direction family; no body or main overflow.
 for(const size of [{width:360,height:740},{width:390,height:844},{width:768,height:900},{width:1440,height:1000}]){
  await page.setViewportSize(size)
  for(const app of APP_CASES.filter((a,i,all)=>all.findIndex(x=>x.framework.family===a.framework.family)===i)){
   await page.goto(base+app.href+'#home');await page.locator('.app-device').waitFor()
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,app.id+' body overflow '+size.width)
   assert.equal(await page.evaluate(()=>document.querySelector('#ac-content').scrollWidth>document.querySelector('#ac-content').clientWidth),false,app.id+' main overflow '+size.width)
   await page.locator('[data-directory]').click();assert.ok(await page.locator('[role=dialog]').isVisible());assert.equal(await page.locator('.ac-page-directory button').count(),app.pageCount);await page.keyboard.press('Escape');assert.equal(await page.locator('[role=dialog]').count(),0)
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/apps.html');assert.equal(await page.locator('.apps-card').count(),50);await page.locator('[data-domain="food"]').click();assert.equal(await page.locator('.apps-card').count(),5);await page.locator('#apps-search').fill('面包');assert.equal(await page.locator('.apps-card').count(),1)
 await fs.mkdir('../.artifacts/app-cases',{recursive:true});await page.locator('#apps-search').fill('');await page.locator('[data-domain="all"]').click();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'../.artifacts/app-cases/collection-desktop.png',fullPage:false})
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/app-case.html?app=qiye#home');await page.evaluate(()=>{localStorage.removeItem('design-buddy-appcase-v1:qiye')});await page.reload();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'../.artifacts/app-cases/final-mobile.png'})
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.equal(routeCount,1100)
 console.log('PASS: all 1,100 routes have content art; 50 case workflows + reload; timer, rating, deletion; 40 responsive family/device checks; hub search/filter; no JS or HTTP errors')
}finally{await browser.close()}
