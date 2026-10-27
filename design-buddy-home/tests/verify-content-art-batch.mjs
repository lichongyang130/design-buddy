import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { artJobs, artCoverage, ART_CASES } from '../src/content-art-catalog.js'
import { CONTENT_SCENES } from '../src/content-art-scenes.js'
import { renderExhibitionCover } from '../src/exhibition-cover.js'
import { sourceSnapshot } from '../src/content-art-source.js'
import { loadPage, click, input } from './helpers.mjs'
const root=fileURLToPath(new URL('..',import.meta.url))
const cli=(...args)=>spawnSync(process.execPath,['scripts/content-art-batch.mjs',...args],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024})
const coverage=artCoverage(),cases=artJobs(),pages=artJobs({scope:'page'})
assert.equal(cases.length,712)
assert.equal(new Set(cases.map(j=>j.templateId)).size,ART_CASES.length,'one planned case illustration for every case')
assert.equal(coverage.casesWithAI,new Set(CONTENT_SCENES.map(scene=>scene.templateId)).size)
assert.ok(coverage.casesWithAI>=24,'previously completed case illustrations remain available')
assert.equal(coverage.casesWithAI+coverage.casesPending,712)
assert.equal(coverage.scenePagesWithAI+coverage.scenePagesPending,pages.length)
assert.ok(cases.every(j=>j.brief.length>100&&j.sourceSnapshot&&j.key),'all jobs have source and usable briefs')
assert.equal(sourceSnapshot({title:'A',body:'B',img:4}),sourceSnapshot({img:7,body:'B',title:'A'}),'order and obsolete stock index do not affect source matching')
assert.notEqual(sourceSnapshot({body0:'A',body1:'B'}),sourceSnapshot({body0:'A',body1:'C'}))
for(const scene of CONTENT_SCENES){
 const tpl=ART_CASES.find(t=>t.id===scene.templateId)
 assert.ok(renderExhibitionCover(tpl).includes(scene.src),'case artwork also appears on its actual cover and gallery thumbnail')
}
const plan=cli('plan','--scope=case')
assert.equal(plan.status,0,plan.stderr)
assert.equal(JSON.parse(plan.stdout).jobs.length,coverage.casesPending)
const audit=cli('audit')
assert.equal(audit.status,0,audit.stderr)
const job=cases.find(j=>j.status==='pending')
const before=readFileSync(new URL('../src/content-art-batch.json',import.meta.url),'utf8')
const file=fileURLToPath(new URL(`../public${CONTENT_SCENES[0].src}`,import.meta.url))
const base=['import',`--job=${job.key}`,`--file=${file}`,'--brief=Attempt to reuse an existing image should be rejected']
const stale=cli(...base,'--snapshot={"title":"stale"}')
assert.notEqual(stale.status,0)
assert.match(stale.stderr,/stale --snapshot/)
const duplicate=cli(...base,`--snapshot=${job.sourceSnapshot}`)
assert.notEqual(duplicate.status,0)
assert.match(duplicate.stderr,/Duplicate image/)
assert.equal(readFileSync(new URL('../src/content-art-batch.json',import.meta.url),'utf8'),before,'failed imports never alter registry')
console.log(`PASS: all ${cases.length} cases planned, ${coverage.scenePages} scene pages planned, audit, stale-source guard, duplicate-file guard`)
const page=await loadPage('/art-library.html')
try{
 const {w,doc}=page
 assert.equal(doc.querySelectorAll('#library-grid article').length,36)
 click(w,doc.querySelector('#library-more'))
 assert.equal(doc.querySelectorAll('#library-grid article').length,72)
 const status=doc.querySelector('#art-status')
 status.value='generated';status.dispatchEvent(new w.Event('change',{bubbles:true}))
 assert.equal(doc.querySelectorAll('#library-grid article').length,Math.min(36,coverage.casesWithAI))
 assert.ok([...doc.querySelectorAll('#library-grid article')].every(el=>el.dataset.status==='generated'))
 input(w,doc.querySelector('#art-search'),'Brand Heritage Story')
 assert.equal(doc.querySelectorAll('#library-grid article').length,1)
 assert.equal(doc.querySelector('#library-grid article').dataset.case,'brand-story')
 assert.ok(doc.querySelector('.art-download').href.endsWith('.webp'))
 input(w,doc.querySelector('#art-search'),'')
 status.value='pending';status.dispatchEvent(new w.Event('change',{bubbles:true}))
 assert.equal(doc.querySelectorAll('#library-grid article').length,36)
 assert.equal(doc.querySelectorAll('#library-grid .art-download').length,0,'pending images never advertised as AI generation complete')
 assert.equal(page.errors.length,0,page.errors.join('\n'))
 console.log('PASS: full catalogue progress page, pagination, ready/pending filters, search and real download links')
}finally{page.w.close()}
