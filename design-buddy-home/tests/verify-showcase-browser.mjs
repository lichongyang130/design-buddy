import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {CASES,FORMATS} from '../src/showcase/data.js'
const {chromium}=await import(process.env.APP_PLAYWRIGHT_MODULE||'playwright'),provider=process.env.APP_CHROMIUM_MODULE?(await import(process.env.APP_CHROMIUM_MODULE)).default:null
const browser=await chromium.launch({headless:true,...(provider?{executablePath:await provider.executablePath(),args:provider.args}:{})}),base=process.env.APP_PREVIEW_URL||'http://127.0.0.1:5174'
const errors=[],httpErrors=[],only=process.env.SHOWCASE_TEST_FORMAT
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)httpErrors.push(r.status()+' '+r.url())})
 for(const c of CASES.filter(c=>!only||c.format===only)){
  await page.goto(base+c.href);await page.locator('.sc-workspace').waitFor()
  await page.evaluate(async config=>{
   const q=s=>document.querySelector(s),tap=s=>{const e=q(s);if(!e)throw Error(config.id+' missing '+s);e.click()},check=(v,s)=>{if(!v)throw Error(config.id+' '+s)},fill=(s,v)=>{const e=q(s);e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))},read=()=>JSON.parse(localStorage.getItem('design-buddy-showcase-v1:'+config.id))
   check(q('.sc-case-strip h1').textContent===config.name,'identity');check(document.documentElement.scrollWidth<=innerWidth,'desktop overflow')
   if(config.format==='social'){
    check(document.querySelectorAll('[data-slide]').length===10,'slide count');for(let i=0;i<10;i++){tap('[data-slide="'+i+'"]');check(q('[data-slide="'+i+'"]').getAttribute('aria-current')==='page','slide nav '+i);check(q('#sc-art svg title').textContent.length>0,'slide content')}
    fill('[data-edit-slide=title]','自己的第十页 '+config.id);fill('[data-edit-slide=body]','<script>不可执行</script>');check(read().slides[9].title==='自己的第十页 '+config.id,'slide persistence');check(!q('#sc-art script'),'SVG text injection');tap('[data-slide-step="1"]');check(q('[data-slide="0"]').getAttribute('aria-current')==='page','wrap navigation')
   }
   if(config.format==='image'){
    fill('[data-field=title]','自己的海报 '+config.id);fill('[data-field=body]','可编辑与导出的内容');fill('[data-field=accent]','#dd6644');fill('[data-field=layout]','7');fill('[data-field=ratio]','1:1');check(read().title==='自己的海报 '+config.id,'editor save');check(q('#sc-art svg').getAttribute('viewBox')==='0 0 1200 1200','ratio');check(q('#sc-art svg title').textContent.includes(config.id),'live edit')
   }
   if(config.format==='live'){
    check(!q('[role=alert]'),'default formula');const number=q('[data-tool-field][type=number]');if(number){fill('[data-tool-field="'+number.dataset.toolField+'"]','');check(!!q('[role=alert]'),'invalid inputs');fill('[data-tool-field="'+number.dataset.toolField+'"]',config.numberDefault);check(!q('[role=alert]'),'valid recovery')}
    check(q('.sc-result-banner b').textContent.trim().length>0,'actual output');if(config.tool===18){tap('[data-check="0"]');check(read().checks.includes(0),'generated checklist')}
   }
   if(config.format==='website'){
    check(document.querySelectorAll('[data-site-module]').length===5,'home modules');tap('.sc-site-nav [data-site-page=collection]');check(document.querySelectorAll('.sc-site-card').length===6,'collection page');fill('#sc-site-search',config.item);check(document.querySelectorAll('.sc-site-card').length===2,'site search');fill('#sc-site-search','');tap('[data-site-favorite="0"]');check(read().favorites.includes(0),'favorite');tap('[data-cart="0"]');check(read().cart.includes(0),'selection');tap('[data-cart-open]');check(q('#sc-dialog').open,'selection dialog');q('#sc-dialog').close();tap('.sc-site-nav [data-site-page=journal]');tap('details summary');check(q('details').open,'journal details');tap('.sc-site-nav [data-site-page=contact]');q('[name=name]').value='体验者';q('[name=email]').value='reader@example.com';q('[name=body]').value='一份只存本地的意向';tap('#sc-contact-form button[type=submit]');check(read().contacts.length===1,'local contact');check(q('#sc-contact-status').textContent.includes('没有向外部发送'),'submission disclosure')
   }
   if(config.format==='webgl'){
    check(q('#showcase-root').dataset.glAvailable==='true','actual WebGL initialization');tap('[data-gl-pause]');check(q('[data-gl-pause]').textContent==='继续动画','pause');fill('[data-gl=scale]','1.35');fill('[data-gl=intensity]','1.25');check(read().gl.scale===1.35,'GPU input persistence');const canvas=q('#sc-gl-canvas'),gl=canvas.getContext('webgl');check(gl.getError()===gl.NO_ERROR,'GPU draw error');const pixels=new Uint8Array(64*64*4);gl.readPixels(Math.floor(canvas.width/2-32),Math.floor(canvas.height/2-32),64,64,gl.RGBA,gl.UNSIGNED_BYTE,pixels);check(pixels.some((v,i)=>i%4!==3&&v>8),'nonempty actual pixels');tap('[data-gl-pause]');check(q('[data-gl-pause]').textContent==='暂停动画','resume');tap('[data-gl-pause]')
   }
  },{id:c.id,name:c.name,format:c.format,item:c.topic.items[0],tool:c.tool,numberDefault:c.format==='live'&&(await page.locator('[data-tool-field][type=number]').count())?await page.locator('[data-tool-field][type=number]').first().inputValue():null})
  // Every case refreshes with its own saved changes; website URL keeps page.
  await page.reload();await page.locator('.sc-workspace').waitFor()
  if(c.format==='image')assert.equal(await page.locator('[data-field=title]').inputValue(),'自己的海报 '+c.id)
  if(c.format==='social'){await page.locator('[data-slide="9"]').click();assert.equal(await page.locator('[data-edit-slide=title]').inputValue(),'自己的第十页 '+c.id)}
  if(c.format==='website'){assert.equal(await page.locator('#sc-web-body').getAttribute('data-site-view'),'contact');assert.match(await page.locator('.sc-local-count').innerText(),/1/)}
  if(c.format==='webgl'){assert.equal(await page.locator('[data-gl=scale]').inputValue(),'1.35');await page.locator('[data-gl-pause]').click()}
  if((c.index+1)%10===0)console.log(`PASS ${c.format} ${c.index+1}/100: real runtime, interactions, isolated storage, refresh`)
 }
 if(!only){
  // Real exported files, including embedded source photos/fonts and PNG size.
  for(const id of ['image-001','social-001']){
   await page.goto(base+'/showcase-case.html?case='+id);await page.locator('#sc-art svg').waitFor()
   for(const format of ['svg','png']){const wait=page.waitForEvent('download');await page.locator('[data-export="'+format+'"]').click();const file=await wait;assert.equal(await file.failure(),null);const bytes=await fs.readFile(await file.path());assert.ok(bytes.length>1500);if(format==='svg'){const svg=bytes.toString();assert.ok(svg.includes('data:font/woff2;base64'));assert.ok(!svg.includes('href="/art/'),'portable export')}
    else{assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),1200)}
   }
  }
  await page.goto(base+'/showcase-case.html?case=live-001');for(const format of ['json','csv']){const wait=page.waitForEvent('download');await page.locator('[data-result-export="'+format+'"]').click();const download=await wait;const text=await fs.readFile(await download.path(),'utf8');if(format==='json')assert.equal(JSON.parse(text).case,'live-001');else assert.ok(text.includes('必要支出'))}
  // Mobile checks across all five structural variants in each format.
  for(const width of [360,390,768]){await page.setViewportSize({width,height:844});for(const format of FORMATS){for(const n of [1,2,3,4,5]){await page.goto(`${base}/showcase-case.html?case=${format.id}-${String(n).padStart(3,'0')}`);await page.locator('.sc-workspace').waitFor();if(format.id==='webgl')await page.locator('[data-gl-pause]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,format.id+' overflow '+width+' variant '+n)}}}
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/showcase.html');await page.locator('.apps-card').first().waitFor();for(const f of FORMATS){await page.locator('[data-format="'+f.id+'"]').click();assert.match(await page.locator('#lab-count').innerText(),/^100 个案例/);for(let n=0;n<4;n++)await page.locator('#lab-load').click();assert.equal(await page.locator('.apps-card').count(),100)}
  await page.locator('[data-format=image]').click();await page.locator('#lab-search').fill('山野来信');assert.equal(await page.locator('.apps-card').count(),5)
  await fs.mkdir('../.artifacts/showcase',{recursive:true});await page.locator('#lab-search').fill('');await page.locator('[data-format=all]').click();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'../.artifacts/showcase/final-catalog.png'})
 }
 assert.deepEqual(errors,[]);assert.deepEqual(httpErrors,[])
 console.log('PASS: '+(only||'500 cases + exports + responsive/catalog')+'; zero JS/HTTP errors')
}finally{await browser.close()}
