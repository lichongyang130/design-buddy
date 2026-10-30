// Optional real-browser regression. Same module overrides as the App case tests.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { _seedSessionForTests } from '../src/auth.js'
const { chromium } = await import(process.env.APP_PLAYWRIGHT_MODULE || 'playwright')
const provider = process.env.APP_CHROMIUM_MODULE ? (await import(process.env.APP_CHROMIUM_MODULE)).default : null
const browser = await chromium.launch({headless:true,...(provider?{executablePath:await provider.executablePath(),args:provider.args}:{})})
const base=process.env.APP_PREVIEW_URL||'http://127.0.0.1:5174'
const auth={};_seedSessionForTests({setItem:(k,v)=>auth[k]=v})
try {
 const page=await browser.newPage({viewport:{width:1052,height:800}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.addInitScript(data=>{for(const[k,v]of Object.entries(data))localStorage.setItem(k,v)},auth)
 await page.route('**/api/models/test',route=>route.fulfill({json:{ok:true,message:'连接成功（浏览器交互模拟响应）',latencyMs:10}}))
 await page.goto(base+'/settings.html');await page.locator('[data-settings="models"]').click()
 await page.locator('.custom-models-card').waitFor()
 assert.equal(await page.locator('.custom-model-actions button').count(),6)
 await fs.mkdir('../.artifacts/custom-models',{recursive:true})
 await page.screenshot({path:'../.artifacts/custom-models/desktop.png'})
 await page.locator('[data-model-add]').click()
 await page.locator('.model-editor-dialog').screenshot({path:'../.artifacts/custom-models/add-dialog.png'})
 await page.locator('[name=baseURL]').fill('https://api.example.com/v1/chat/completions')
 await page.locator('[name=apiKey]').fill('sk-browser-transient-not-persisted')
 await page.locator('[name=modelId]').fill('custom-browser-test')
 await page.locator('[type=submit][form="custom-model-form"]').click()
 assert.ok(!(await page.evaluate(()=>localStorage.getItem('design-buddy-state-v1'))).includes('sk-browser-transient-not-persisted'))
 const selected=page.locator('[data-model="custom-browser-test"]')
 await selected.waitFor();await selected.click()
 assert.equal(await selected.getAttribute('aria-pressed'),'true')
 await page.reload();await page.locator('[data-settings="models"]').click()
 assert.equal(await page.locator('[data-model="custom-browser-test"]').getAttribute('aria-pressed'),'true')
 const row=page.locator('[data-model-row]').filter({has:page.locator('[data-model="custom-browser-test"]')})
 await row.locator('[data-model-connect]').click();await page.locator('[data-model-check]').click()
 await page.locator('[data-connection-status]').filter({hasText:'连接成功'}).waitFor()
 await page.locator('[data-model-close]').click()
 const download=page.waitForEvent('download');await page.locator('[data-model-export]').click()
 const file=await download;assert.equal(file.suggestedFilename(),'models.json')
 const data=JSON.parse(await fs.readFile(await file.path(),'utf8'))
 assert.equal(data.models.at(-1).modelId,'custom-browser-test');assert.ok(data.models.every(m=>!('apiKey'in m)))
 for(const width of [390,360]) {
  await page.setViewportSize({width,height:844})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  assert.equal(await page.locator('[data-model-add]').isVisible(),true)
  await page.locator('[data-model-add]').click()
  const bounds=await page.locator('.modal-box').boundingBox()
  assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1)
  await page.keyboard.press('Escape')
 }
 await page.screenshot({path:'../.artifacts/custom-models/mobile.png'})
 assert.deepEqual(errors,[])
 console.log('PASS real Chromium: layout, add/select, refresh, honest check, JSON export, 360/390px, modal bounds, zero runtime errors')
} finally {await browser.close()}
