// Real UI exercise; responses below are explicit mocked upstream fixtures, not DeepSeek verification.
import assert from 'node:assert/strict'
import { _seedSessionForTests } from '../src/auth.js'
const {chromium}=await import(process.env.APP_PLAYWRIGHT_MODULE||'playwright')
const provider=process.env.APP_CHROMIUM_MODULE?(await import(process.env.APP_CHROMIUM_MODULE)).default:null
const browser=await chromium.launch({headless:true,...(provider?{executablePath:await provider.executablePath(),args:provider.args}:{})})
const auth={};_seedSessionForTests({setItem:(k,v)=>auth[k]=v})
try{
 const page=await browser.newPage(),errors=[],requests=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.addInitScript(data=>{for(const[k,v]of Object.entries(data))localStorage.setItem(k,v)},auth)
 let mode='success'
 await page.route('**/api/models/chat',async route=>{
  requests.push(route.request().postDataJSON())
  if(mode==='delay')await new Promise(r=>setTimeout(r,800))
  if(mode==='error')return route.fulfill({status:400,json:{ok:false,error:'认证失败：请检查 API Key'}})
  try{await route.fulfill({json:{ok:true,text:'浏览器集成模拟回答 <img src=x onerror=alert(1)>'}})}catch{/* Client aborted intentionally. */}
 })
 await page.goto((process.env.APP_PREVIEW_URL||'http://127.0.0.1:5174')+'/index.html')
 const before=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('design-buddy-state-v1'));return {gammas:s.gammas.length,tasks:s.tasks.length,credits:s.credits}})
 await page.locator('#prompt-input').fill('解释一下什么是大模型');await page.locator('#send-btn').click()
 await page.locator('.qa-notice').filter({hasText:'浏览器集成模拟回答'}).waitFor()
 assert.equal(await page.locator('.qa-notice img').count(),0)
 assert.equal(requests[0].messages[0].role,'user');assert.ok(requests[0].config.modelId)
 await page.locator('[data-qa-retry]').click();await page.locator('.qa-notice').filter({hasText:'浏览器集成模拟回答'}).last().waitFor()
 mode='error';await page.locator('#qa-input').fill('继续解释');await page.locator('.qa-composer').evaluate(form=>form.requestSubmit())
 await page.locator('.qa-notice').filter({hasText:'认证失败'}).waitFor()
 mode='delay';await page.locator('#qa-input').fill('测试停止')
 const pending=page.waitForRequest('**/api/models/chat');await page.locator('.qa-composer').evaluate(form=>form.requestSubmit());await pending
 await page.locator('[data-qa-stop]').click();await page.locator('.qa-notice').filter({hasText:'已停止'}).waitFor()
 await page.waitForTimeout(1000);assert.match(await page.locator('.qa-notice').last().innerText(),/已停止/)
 const after=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('design-buddy-state-v1'));return {gammas:s.gammas.length,tasks:s.tasks.length,credits:s.credits}})
 assert.deepEqual(after,before);assert.deepEqual(errors,[])
 assert.equal(requests[1].messages.filter(m=>m.role==='assistant').length,0,'retry should not feed the previous answer back as a new prompt')
 console.log('PASS real Chromium QA with mocked upstream: selected model, actual API client path, answer/escaping, retry, provider errors, abort/late-response guard, no artifact/task/credit changes')
}finally{await browser.close()}
