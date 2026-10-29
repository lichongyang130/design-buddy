import assert from 'node:assert/strict'
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {APP_CASES,SCREEN_KINDS,appTemplateMeta} from '../src/app-catalog.js'
import {appArtSVG} from '../src/app-case-art.js'
import {freshAppState,readAppState,appStateKey,filterAppItems,toggleId,moveInList,timerSeconds,appProgress} from '../src/app-case-model.js'
assert.equal(APP_CASES.length,50)
assert.equal(new Set(APP_CASES.map(a=>a.id)).size,50)
assert.equal(APP_CASES.reduce((n,a)=>n+a.screens.length,0),1100)
assert.equal(new Set(APP_CASES.map(a=>a.framework.homeOrder.join('|'))).size,50)
assert.equal(new Set(APP_CASES.map(a=>a.framework.family)).size,10)
const hashes=new Set(),artHashes=new Set()
for(const app of APP_CASES){
 assert.equal(app.screens.length,app.pageCount);assert.ok(app.pageCount>=20&&app.pageCount<=30)
 assert.equal(new Set(app.screens.map(p=>p.id)).size,app.pageCount)
 for(const p of app.screens)assert.ok(SCREEN_KINDS.includes(p.id))
 assert.equal(app.items.length,5);assert.equal(appTemplateMeta(app).href,app.href)
 for(const file of [app.hero,app.cover])assert.ok(fs.existsSync(new URL('../public'+file,import.meta.url)))
 hashes.add(createHash('sha256').update(fs.readFileSync(new URL('../public'+app.cover,import.meta.url))).digest('hex'))
 for(const i of app.items){assert.equal(filterAppItems(app,i.title).length,1);assert.ok(i.steps.length>=4);artHashes.add(createHash('sha256').update(appArtSVG(app,i)).digest('hex'))}
 assert.equal(filterAppItems(app,'does-not-exist').length,0)
 assert.equal(filterAppItems(app,'','精选').length,1)
 const state=freshAppState();state.saved=toggleId(state.saved,'item-0');assert.deepEqual(state.saved,['item-0']);state.saved=toggleId(state.saved,'item-0');assert.deepEqual(state.saved,[])
 state.completed=['item-0'];state.plans=[{items:['item-0','item-1']}];assert.deepEqual(appProgress(app,state),{done:1,total:5,percent:20,planned:2})
 const arr=['a','b','c'];assert.equal(moveInList(arr,'b',-1),true);assert.deepEqual(arr,['b','a','c']);assert.equal(moveInList(arr,'b',-1),false)
 assert.equal(readAppState(app,{getItem:()=>'{broken'}).username,'体验者')
 const raw={...freshAppState(),saved:['item-0','item-0','bogus'],completed:['bogus'],timer:{remaining:-50,endAt:'bad'},username:'<script>no</script>'}
 const loaded=readAppState(app,{getItem:()=>JSON.stringify(raw)});assert.deepEqual(loaded.saved,['item-0']);assert.deepEqual(loaded.completed,[]);assert.deepEqual(loaded.timer,{remaining:0,endAt:null})
 assert.equal(readAppState(app,{getItem:()=>{throw Error('disabled')}}).saved.length,0)
}
assert.equal(hashes.size,50);assert.equal(artHashes.size,250)
assert.equal(new Set(APP_CASES.map(appStateKey)).size,50)
assert.equal(timerSeconds({endAt:12000,remaining:900},10000),2)
assert.equal(timerSeconds({endAt:9000,remaining:900},10000),0)
console.log('PASS: 50 cases / 1,100 registered pages / 50 distinct home structures / 50 real-screen covers / 250 labeled SVG compositions; model persistence, corrupt storage, search, filters, reorder, progress, timer')
