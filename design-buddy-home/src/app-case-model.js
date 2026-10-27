export const appStateKey=app=>`design-buddy-appcase-v1:${app.id}`
export const freshAppState=()=>({version:1,saved:[],collections:[],plans:[],notes:[],logs:[],read:[],replies:[],completed:[],ratings:{},username:'体验者',compact:false,quiet:false,timer:{remaining:900,endAt:null}})
export function readAppState(app,storage){
 try{
  const raw=JSON.parse(storage.getItem(appStateKey(app)));if(!raw||raw.version!==1)return freshAppState()
  const valid=id=>app.items.some(item=>item.id===id)
  const text=(value,max=2000)=>typeof value==='string'?value.slice(0,max):''
  const distinct=rows=>Array.isArray(rows)?[...new Set(rows.filter(valid))]:[]
  const entries=(rows,convert)=>{const seen=new Set();return(Array.isArray(rows)?rows:[]).filter(row=>row&&typeof row.id==='string'&&!seen.has(row.id)&&seen.add(row.id)).slice(0,150).map(convert)}
  return {...freshAppState(),saved:distinct(raw.saved),completed:distinct(raw.completed),username:text(raw.username,24)||'体验者',compact:raw.compact===true,quiet:raw.quiet===true,
   collections:entries(raw.collections,row=>({id:row.id,name:text(row.name,50)||'未命名',items:distinct(row.items)})),
   plans:entries(raw.plans,row=>({id:row.id,name:text(row.name,50)||'未命名',items:distinct(row.items),checked:(Array.isArray(row.checked)?row.checked:[]).filter(x=>typeof x==='string'),date:text(row.date,10)})),
   notes:entries(raw.notes,row=>({id:row.id,title:text(row.title,80),body:text(row.body),item:valid(row.item)?row.item:null})),
   logs:(Array.isArray(raw.logs)?raw.logs:[]).filter(x=>x&&typeof x.text==='string').slice(0,100).map(x=>({text:text(x.text,150),at:typeof x.at==='number'?x.at:0})),
   read:(Array.isArray(raw.read)?raw.read:[]).filter(x=>typeof x==='string').slice(0,20),
   replies:(Array.isArray(raw.replies)?raw.replies:[]).filter(x=>x&&typeof x.body==='string').slice(0,100).map(x=>({body:text(x.body,500),message:text(x.message,40)})),
   ratings:Object.fromEntries(Object.entries(raw.ratings&&typeof raw.ratings==='object'&&!Array.isArray(raw.ratings)?raw.ratings:{}).filter(([id,n])=>valid(id)&&Number.isInteger(n)&&n>=1&&n<=5)),
   timer:{remaining:Number.isFinite(raw.timer?.remaining)?Math.max(0,Math.min(3600,raw.timer.remaining)):900,endAt:Number.isFinite(raw.timer?.endAt)?raw.timer.endAt:null}}
 }catch{return freshAppState()}
}
export function filterAppItems(app,query='',category='全部'){return app.items.filter(item=>(category==='全部'||item.category===category)&&`${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase()))}
export function toggleId(list,id){return list.includes(id)?list.filter(x=>x!==id):[...list,id]}
export function moveInList(items,id,direction){const i=items.indexOf(id),next=i+direction;if(i<0||next<0||next>=items.length)return false;[items[i],items[next]]=[items[next],items[i]];return true}
export function timerSeconds(timer,now=Date.now()){return timer.endAt?Math.max(0,Math.ceil((timer.endAt-now)/1000)):timer.remaining}
export function appProgress(app,state){return {done:state.completed.length,total:app.items.length,percent:Math.round(state.completed.length/app.items.length*100),planned:new Set(state.plans.flatMap(plan=>plan.items)).size}}
