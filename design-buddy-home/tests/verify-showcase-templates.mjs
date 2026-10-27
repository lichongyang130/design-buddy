import assert from 'node:assert/strict'
import {loadPage,click} from './helpers.mjs'
const {w,doc,errors}=await loadPage('/templates.html')
try{
 for(const name of ['社交轮播卡片','网站复刻','图片','实时产物','WebGL']){
  click(w,doc.querySelector(`input[name=format][value="${name}"]`))
  for(let n=0;n<4;n++)click(w,doc.querySelector('#tpl-more'))
  assert.equal(doc.querySelectorAll('.tpl-card').length,100,name)
  assert.ok([...doc.querySelectorAll('.tpl-app-link')].every(a=>a.getAttribute('href').startsWith('/showcase-case.html?case=')))
  assert.ok([...doc.querySelectorAll('.qiye-app-cover-image')].every(img=>img.getAttribute('src').startsWith('/art/showcase/')))
  const link=doc.querySelector('.tpl-app-link');link.addEventListener('click',e=>e.preventDefault(),{once:true});click(w,link)
  assert.equal(doc.querySelector('.td-overlay'),null,'direct links should not open the old presentation detail renderer')
  console.log(`PASS format ${name}: 100 real-runtime links and dedicated thumbnails`)
 }
 assert.deepEqual(errors,[])
}finally{w.close()}
