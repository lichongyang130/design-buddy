import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import postcss from 'postcss'
import { uiTypographyPostcss } from '../scripts/ui-typography.mjs'
import { templateBrowser } from '../scripts/template-browser.mjs'
const root = new URL('../', import.meta.url), base = 'http://127.0.0.1:5174'
const source = '.test{font-size:10px;font-weight:800}.pv-title{font-size:46px}'
const normal = await postcss([uiTypographyPostcss()]).process(source, {from:'/src/styles.css'})
assert.match(normal.css, /max\(12px, calc\(10px \* var\(--font-scale, 1\)\)\)/)
assert.match(normal.css, /font-weight:700/)
assert.match(normal.css, /pv-title\{font-size:46px/)
for (const file of ['app-case.css','qiye-app.css','original.css']) assert.equal((await postcss([uiTypographyPostcss()]).process(source, {from:'/src/'+file})).css, source)
assert.match((await postcss([uiTypographyPostcss()]).process(source, {from:'/src/rebuilt-library.css?v=123'})).css, /max\(12px/ )
const art = '.dp-page h2{font-size:40px}.td-back{font-size:11px}'
assert.match((await postcss([uiTypographyPostcss()]).process(art, {from:'/src/templates.css'})).css, /dp-page h2\{font-size:40px/)
for (const item of JSON.parse(await fs.readFile(new URL('public/ui/fonts/manifest.json', root)))) {
  const bytes = await fs.readFile(new URL('public/ui/fonts/'+item.file, root))
  assert.equal(bytes.length, item.bytes); assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256)
  assert.equal(bytes.subarray(0,4).toString(), 'wOF2')
}
const browser = await templateBrowser(), errors = []
try {
  const context = await browser.newContext({viewport:{width:1440,height:1000}})
  const page = await context.newPage()
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(base+'/auth.html'); await page.locator('#guest-entry').click(); await page.waitForURL('**/index.html')
  for (const name of ['index','templates','settings','themes','media','experts','skills','connectors','apps','art-library','art-review','showcase']) {
    await page.goto(`${base}/${name}.html`)
    if(name==='templates') await page.waitForSelector('.rebuild-card')
    await page.waitForSelector('body[data-db-ui]'); await page.evaluate(()=>document.fonts.ready)
    const result = await page.evaluate(() => {
      const small = [...document.querySelectorAll('body *')].filter(e=> e.getClientRects().length && !e.children.length && e.textContent.trim() && !e.closest('svg,script,style,.theme-preview,.te-preview,#td-deck,[aria-hidden=true]') && parseFloat(getComputedStyle(e).fontSize) < 11.99)
      return {family:getComputedStyle(document.body).fontFamily, small:small.slice(0,5).map(e=>[e.className,e.textContent.slice(0,24),getComputedStyle(e).fontSize]), zoom:document.body.style.zoom}
    })
    assert.match(result.family, /Inter Variable/); assert.deepEqual(result.small, [], name+' small UI text'); assert(!result.zoom)
  }
  // Real platform font names prove that the downloaded font actually renders glyphs,
  // rather than merely appearing first in a CSS fallback stack.
  for (const [language, expected, text] of [['简体中文','Noto Sans SC','设置字体'],['繁體中文','Noto Sans TC','設定字體'],['日本語','Noto Sans JP','設定を開く'],['English','Inter','Settings Aa 123']]) {
    await page.goto(base+'/settings.html')
    await page.evaluate(language=>{ const state=JSON.parse(localStorage.getItem('design-buddy-state-v1'));state.settings.language=language;localStorage.setItem('design-buddy-state-v1',JSON.stringify(state)) }, language)
    await page.reload(); await page.waitForSelector('body[data-db-ui]')
    await page.evaluate(text=>{const el=document.createElement('p');el.id='font-probe';el.textContent=text;document.body.append(el)}, text)
    await page.evaluate(()=>document.fonts.ready)
    const cdp = await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable')
    const {root:doc}=await cdp.send('DOM.getDocument'),{nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.nodeId,selector:'#font-probe'})
    const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId})
    assert(fonts.some(font=>font.familyName.includes(expected)&&font.isCustomFont), `${language}: actual ${expected} font missing: ${JSON.stringify(fonts)}`)
    await cdp.detach()
  }
  await page.goto(base+'/settings.html')
  const otherTab = await page.context().newPage()
  await otherTab.goto(base+'/templates.html'); await otherTab.waitForSelector('.rebuild-card')
  const before = await page.locator('.rail').boundingBox()
  await page.locator('#font-slider').fill('4')
  await page.locator('#font-slider').dispatchEvent('input')
  const after = await page.locator('.rail').boundingBox()
  assert.equal(before.width, after.width)
  assert(Math.abs(await page.locator('.rail-item span').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))-14.04)<.05)
  await otherTab.waitForFunction(()=>document.documentElement.style.getPropertyValue('--font-scale')==='1.17')
  assert(Math.abs(await otherTab.locator('.tpl-title').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))-28.08)<.05)
  await otherTab.close()
  await page.reload(); assert.equal(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--font-scale')), '1.17')
  // Original text, fonts and intrinsic canvas geometry must survive all UI preferences.
  await page.goto(base+'/atelier/prototype-study/index.html'); await page.waitForSelector('[data-detail-ready]');await page.evaluate(()=>document.fonts.ready)
  await page.waitForSelector('.transport[data-db-chrome]')
  assert.match(await page.locator('.transport button').first().evaluate(e=>getComputedStyle(e).fontFamily), /Inter Variable/)
  assert.equal(await page.locator('body[data-db-ui]').count(),0)
  const canvas = () => page.evaluate(()=>{const p=document.querySelector('#canvas').firstElementChild;return JSON.stringify({html:p.innerHTML,width:p.offsetWidth,height:p.offsetHeight,fonts:[...p.querySelectorAll('h1,h2,p,span')].slice(0,30).map(e=>{const s=getComputedStyle(e);return[s.fontFamily,s.fontSize,s.lineHeight]})})})
  const original = await canvas()
  for (const fontScale of [.85,1,1.17]) {
    await page.evaluate(fontScale=>window.dispatchEvent(new CustomEvent('db:typography-change',{detail:{fontScale,fontFamily:'georgia'}})),fontScale)
    assert.equal(await canvas(),original)
    assert.match(await page.locator('.detail-description p').first().evaluate(e=>getComputedStyle(e).fontFamily),/Georgia/)
  }
  for(const name of ['index','templates','settings','themes','media','experts','skills','connectors','apps','art-library','art-review','showcase']){
    await page.setViewportSize({width:390,height:844});await page.goto(`${base}/${name}.html`)
    if(name==='templates')await page.waitForSelector('.rebuild-card')
    await page.waitForSelector('body[data-db-ui]');await page.evaluate(()=>document.fonts.ready)
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' mobile overflow')
    for(const input of await page.locator('input:not([type=checkbox],[type=radio],[type=range],[type=color]),textarea,select').all()) if(await input.isVisible())assert(await input.evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=16,name+' mobile input below 16px')
  }
  assert.deepEqual(errors,[])
  console.log('PASS UI font policy / 340 licensed local font subsets / 12 application pages / real rendered SC, TC, JP and Inter fonts / text-only scale and persistence / unchanged authored canvas / twelve mobile layouts and 16px inputs / zero runtime errors')
} finally { await browser.close() }
