import assert from 'node:assert/strict'
import {CASES,FORMATS,slidesFor,showcaseMeta} from '../src/showcase/data.js'
import {TOOLS,toolDefaults,calculateTool} from '../src/showcase/tools.js'
import {artworkSVG} from '../src/showcase/art.js'
import {createHash} from 'node:crypto'
import fs from 'node:fs'
assert.equal(CASES.length,500);assert.equal(new Set(CASES.map(c=>c.id)).size,500)
for(const f of FORMATS)assert.equal(CASES.filter(c=>c.format===f.id).length,100)
for(const c of CASES){assert.equal(showcaseMeta(c).format,c.formatName);assert.ok(c.palette.every(color=>/^#[0-9a-f]{6}$/i.test(color)));assert.ok(fs.existsSync(new URL('../public'+c.topic.photo,import.meta.url)));if(c.format==='social'){const slides=slidesFor(c);assert.equal(slides.length,10);assert.ok(slides.every(s=>s.title&&s.body))}if(c.format==='live'){const r=calculateTool(c.tool,toolDefaults(c));assert.ok(r.display);assert.ok(r.rows.length);assert.ok(r.rows.every(row=>row.every(value=>typeof value!=='number'||Number.isFinite(value))))}}
for(let i=0;i<20;i++){const presets=CASES.filter(c=>c.format==='live'&&c.tool===i).map(c=>JSON.stringify(toolDefaults(c)));assert.equal(new Set(presets).size,5,'five real presets for tool '+i)}
assert.equal(TOOLS.length,20)
const calc=(type,patch)=>calculateTool(type,{...toolDefaults(CASES.find(c=>c.format==='live'&&c.tool===type)),...patch})
assert.equal(calc(0,{total:1000,a:50,b:30}).rows[2][1],200)
assert.throws(()=>calc(0,{a:90,b:30}),/100/)
assert.equal(calc(1,{target:1000,current:1000,monthly:100}).value,0)
assert.equal(calc(2,{hours:10,rate:100,cost:100,buffer:10}).value,1210)
assert.throws(()=>calc(3,{price:20,variable:30}),/售价/)
assert.equal(calc(5,{start:'2024-02-28',end:'2024-03-01'}).value,2)
assert.throws(()=>calc(5,{start:'2026-02-30'}),/日期/)
assert.equal(calc(6,{value:1,from:'in',to:'cm'}).value,2.54)
assert.equal(calc(7,{color:'#000000',amount:100}).value,'#ffffff')
assert.equal(calc(8,{fg:'#000000',bg:'#ffffff'}).value,21)
assert.equal(calc(8,{fg:'#777777',bg:'#777777'}).value,1)
assert.throws(()=>calc(9,{width:100,margin:90}),/超过/)
assert.equal(calc(9,{cols:4,width:1000,margin:20,gap:20}).value,225)
assert.equal(calc(10,{width:1200,a:4,b:5}).value,1500)
assert.equal(calc(11,{principal:1000,rate:0,years:1,monthly:100}).value,2200)
assert.equal(calc(12,{price:100,discount:80,coupon:200}).value,0)
assert.equal(calc(13,{amount:100,tax:8,fee:2}).value,110.00000000000001)
assert.equal(calc(14,{base:2,target:5,ingredient:100}).value,250)
assert.throws(()=>calc(15,{pages:100,done:120}),/超过/)
assert.equal(calc(16,{people:2,days:3,stay:100,food:50,transport:100}).value,900)
assert.equal(calc(17,{checks:'1,1,2',days:10}).value,20)
assert.throws(()=>calc(17,{checks:'32',days:14}),/周期/)
assert.equal(calc(18,{items:'A\nA\nB'}).value,2)
assert.equal(calc(19,{weights:'50,50',matrix:'A,10,0\nB,6,6'}).value,'B')
assert.throws(()=>calc(19,{weights:'0,0',matrix:'A,3,4'}),/权重/)
assert.throws(()=>calc(19,{matrix:'A,7,invalid,2'}),/分数/)
for(let i=0;i<20;i++){const c=CASES.find(c=>c.format==='live'&&c.tool===i);for(const field of TOOLS[i].fields.filter(f=>f.type==='number'))assert.throws(()=>calculateTool(i,{...toolDefaults(c),[field.key]:'not-a-number'}))}
const bad=artworkSVG(CASES[0],{title:'<img src=x onerror=alert(1)>',body:'"<&'});assert.ok(!bad.includes('<img'));assert.ok(bad.includes('&lt;img'));assert.ok(bad.includes('&amp;'))
if(process.env.SHOWCASE_REQUIRE_COVERS==='1'){const manifest=JSON.parse(fs.readFileSync(new URL('../public/art/showcase/manifest.json',import.meta.url)));assert.equal(manifest.total,500);assert.ok(Object.values(manifest.counts).every(n=>n===100));const hashes=new Set();for(const c of CASES){const bytes=fs.readFileSync(new URL('../public'+c.cover,import.meta.url));assert.ok(bytes.length>1500);const hash=createHash('sha256').update(bytes).digest('hex');hashes.add(hash);assert.equal(manifest.cases.find(row=>row.id===c.id).sha256,hash)}assert.equal(hashes.size,500)}
console.log('PASS: 500 cases / 100 per format; 1,000 carousel slides; 20 tool formulas, 100 genuinely different presets, boundaries, invalid inputs and SVG escaping')
