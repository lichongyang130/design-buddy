// Capture all 500 actual runtime compositions. No invented AI screenshots.
import {mkdir,writeFile,stat} from 'node:fs/promises'
import {CASES,FORMATS} from '../src/showcase/data.js'
const {chromium}=await import(process.env.APP_PLAYWRIGHT_MODULE||'playwright')
const provider=process.env.APP_CHROMIUM_MODULE?(await import(process.env.APP_CHROMIUM_MODULE)).default:null
const browser=await chromium.launch({headless:true,...(provider?{executablePath:await provider.executablePath(),args:provider.args}:{})})
const base=process.env.APP_PREVIEW_URL||'http://127.0.0.1:5174',out=new URL('../public/art/showcase/',import.meta.url)
await mkdir(out,{recursive:true})
const only=process.env.SHOWCASE_FORMAT
const context=await browser.newContext({viewport:{width:1200,height:714},deviceScaleFactor:1})
try{await Promise.all(FORMATS.filter(f=>!only||only.split(',').includes(f.id)).map(async format=>{
 const page=await context.newPage();const converter=await context.newPage();let errors=[];page.on('pageerror',error=>errors.push(error.message))
 for(const c of CASES.filter(c=>c.format===format.id)){
  if(process.env.SHOWCASE_RESUME==='1'){try{if((await stat(new URL(c.id+'.webp',out))).size>1500)continue}catch{}}
  await page.goto(base+c.href+'&capture=1');await page.locator('.sc-workspace').waitFor()
  if(c.format==='webgl'){await page.waitForFunction(()=>document.querySelector('#showcase-root').dataset.glAvailable!==undefined);if(await page.locator('#showcase-root').getAttribute('data-gl-available')!=='true')throw Error(c.id+': actual WebGL required for cover');await page.evaluate(()=>document.querySelector('[data-gl-pause]').click())}
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))})
  const png=(await page.screenshot()).toString('base64')
  const webp=await converter.evaluate(async data=>{const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=714;canvas.getContext('2d').drawImage(img,0,0);return canvas.toDataURL('image/webp',.87).split(',')[1]},png)
  await writeFile(new URL(c.id+'.webp',out),Buffer.from(webp,'base64'));if((c.index+1)%10===0)console.log(`${format.id} ${c.index+1}/100`)
  if(errors.length)throw Error(c.id+': '+errors.join(';'))
 }
 await page.close();await converter.close()
}))}finally{await browser.close()}
console.log('DONE: actual-runtime cover capture complete')
