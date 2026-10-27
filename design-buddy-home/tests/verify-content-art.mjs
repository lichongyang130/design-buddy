import assert from 'node:assert/strict'
import fs from 'node:fs'
import { JSDOM } from 'jsdom'
import { PRESENTATION_TEMPLATES, renderPresentationSlide } from '../src/presentation-templates.js'
import { GENERATED_DOCUMENT_TEMPLATES } from '../src/document-generator.js'
import { planContentArt, renderContentArtSVG, renderContentArt, contentArtURL } from '../src/content-art.js'
import { CONTENT_SCENES, contentSceneFor } from '../src/content-art-scenes.js'
import { loadPage, click } from './helpers.mjs'

const fixture = page => ({ id: 'test-case', name: 'Cloud Architecture', cat: '技术文档', pages: [page] })
const flow = fixture({ title: 'Release', steps: ['Build', 'Test', 'Deploy'] })
assert.equal(planContentArt(flow,0).kind,'flow')
const xml = new JSDOM(renderContentArtSVG(flow,0), { contentType:'image/svg+xml' })
assert.match(xml.window.document.documentElement.textContent, /Build/)
assert.match(xml.window.document.documentElement.textContent, /Deploy/)
assert.equal(xml.window.document.querySelector('parsererror'),null)
const mixed = fixture({ title:'Metrics', stats:[{ val:'$12B', lab:'Size' },{ val:'32%', lab:'Growth' }] })
assert.equal(planContentArt(mixed,0).comparable,false,'mixed units never compared as bars')
assert.equal(planContentArt(fixture({ title:'Years', stats:[{ val:'2015', lab:'Baseline Year' },{ val:'2025',lab:'Current Year' }] }),0).comparable,false)
assert.equal(planContentArt(fixture({ title:'Revenue',stats:[{val:'$2M',lab:'A'},{val:'$4M',lab:'B'}] }),0).comparable,true)
assert.equal(planContentArt(fixture({ title:'Margin',stats:[{val:'-2%',lab:'A'},{val:'4%',lab:'B'}] }),0).comparable,false)
assert.equal(planContentArt(fixture({ title:'Access permissions',body:'Authentication and security boundaries' }),0).domain,'security')
assert.equal(planContentArt(fixture({ title:'Soil sensors',body:'Agricultural irrigation practice' }),0).domain,'ecology')
const changed = fixture({ title:'Release', steps:['Draft','Review','Publish'] })
assert.notEqual(renderContentArtSVG(flow,0),renderContentArtSVG(changed,0),'step content changes the visual')
const unsafe = fixture({ title:'<script>alert(1)</script>',body:'<img src=x onerror=alert(1)>' })
const unsafeDoc = new JSDOM(renderContentArtSVG(unsafe,0),{contentType:'image/svg+xml'})
assert.equal(unsafeDoc.window.document.querySelector('script,img'),null)
assert.equal(unsafeDoc.window.document.querySelector('parsererror'),null)

let pages = 0, scenes = 0
const templates = [...PRESENTATION_TEMPLATES,...GENERATED_DOCUMENT_TEMPLATES]
for (const tpl of templates) {
  const palettes = new Set()
  for (let i=0;i<tpl.pages.length;i++) {
    const plan = planContentArt(tpl,i)
    palettes.add(JSON.stringify(plan.palette))
    const rendered = renderPresentationSlide(tpl,i)
    assert.ok(rendered.includes('<svg') || rendered.includes('<img'), `${tpl.id} ${i}: visual present`)
    assert.ok(!/src="\/covers\/cover-/.test(rendered), `${tpl.id} ${i}: no rotating stock pool`)
    assert.equal(renderContentArt(tpl,i),renderContentArt(tpl,i),'deterministic')
    if (plan.scene) scenes++
    pages++
  }
  assert.equal(palettes.size,1,'case-level SVG palette remains consistent')
}
assert.equal(scenes,6,'exactly six dedicated AI pilot illustrations')
for (const scene of CONTENT_SCENES) {
  assert.ok(fs.existsSync(new URL(`../public${scene.src}`,import.meta.url)))
  const tpl = templates.find(t=>t.id===scene.templateId)
  const index=tpl.pages.findIndex(p=>p.title===scene.title)
  assert.equal(contentArtURL(tpl,index),scene.src)
  const edited={...tpl,pages:tpl.pages.map((p,i)=>i===index?{...p,body:'Different subject'}:p)}
  assert.equal(contentSceneFor(edited,index),null,'stale image cannot attach to changed content')
  assert.ok(contentArtURL(edited,index).startsWith('data:image/svg+xml'),'explicit content-derived fallback, not unrelated photo')
}
console.log(`PASS: ${templates.length} cases / ${pages} pages; content artwork present, no rotating stock images, 6 matched AI scenes, source escaping and data guards`)

const page = await loadPage('/art-review.html')
try {
  assert.equal(page.doc.querySelectorAll('#review-grid article').length,30)
  assert.equal(page.doc.querySelectorAll('.art-preview>img').length,6)
  for (const cat of ['技术文档','报告','融资演讲稿','营销材料','教育','商业规划']) {
    click(page.w, page.doc.querySelector(`[data-cat="${cat}"]`))
    assert.equal(page.doc.querySelectorAll('#review-grid article').length,5)
    assert.equal(page.doc.querySelector('[aria-pressed="true"]').dataset.cat,cat)
  }
  click(page.w, page.doc.querySelector('[data-cat="全部"]'))
  assert.equal(page.doc.querySelectorAll('#review-grid article').length,30)
  assert.equal(page.errors.length,0)
  console.log('PASS: review page renders 30 samples, six AI illustrations, six working category filters')
} finally { page.w.close() }

const templatesPage = await loadPage('/templates.html')
try {
  const {w,doc} = templatesPage
  click(w,doc.querySelector('.tpl-card'))
  click(w,doc.querySelector('.tdp-tab[data-tab="images"]'))
  const artwork = doc.querySelectorAll('[data-content-art]')
  assert.ok(artwork.length >= 20,'presentation images tab lists actual page artwork')
  const svgButton = [...artwork].find(button=>button.textContent.includes('SVG'))
  click(w,svgButton)
  assert.ok(doc.querySelector('.content-art-inspector svg'),'source inspector opens actual SVG')
  assert.ok(doc.querySelector('.content-art-inspector pre').textContent.includes('Page content:'),'source brief is inspectable')
  assert.ok(doc.querySelector('[data-download-art]'),'artwork export available')
  assert.equal(templatesPage.errors.length,0)
  console.log('PASS: template image panel lists generated artwork and opens source/export inspector')
} finally { templatesPage.w.close() }
