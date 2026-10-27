const num=(key,label,value,min=0,max=1e9)=>({key,label,type:'number',value,min,max})
const text=(key,label,value,type='text')=>({key,label,type,value})
const select=(key,label,value,options)=>({key,label,type:'select',value,options})
export const TOOLS=[
 {fields:[num('total','可分配预算',5000),num('a','必要支出比例 %',50,0,100),num('b','自由支出比例 %',30,0,100)],note:'剩余比例计入储备；两项比例之和不得超过 100%。'},
 {fields:[num('target','目标金额',20000,1),num('current','已有金额',3000),num('monthly','每月存入',1500,1)],note:'不计利息，按每月固定存入估算。'},
 {fields:[num('hours','预计工作小时',40,0.1),num('rate','每小时费率',180),num('cost','额外成本',800),num('buffer','风险预留 %',15,0,100)],note:'报价 = (工时 × 费率 + 成本) × (1 + 预留比例)。'},
 {fields:[num('fixed','固定成本',6000),num('price','单位售价',120,0.01),num('variable','单位变动成本',45)],note:'按恒定单价与成本估算，不含税费与资金时间价值。'},
 {fields:[num('hours','每日可用小时',4,0.1,24),num('tasks','任务总工时',18,0.1),num('buffer','预留比例 %',20,0,90)],note:'可用小时扣除预留比例；结果向上取整为所需天数。'},
 {fields:[text('start','起始日期','2026-10-27','date'),text('end','目标日期','2026-12-31','date')],note:'日历日期差，不含起始日；负数代表目标日在起始日之前。'},
 {fields:[num('value','数值',1,0),select('from','原单位','m',[['m','米'],['cm','厘米'],['km','千米'],['in','英寸'],['ft','英尺']]),select('to','目标单位','cm',[['m','米'],['cm','厘米'],['km','千米'],['in','英寸'],['ft','英尺']])],note:'仅支持长度单位；1 英寸 = 0.0254 米。'},
 {fields:[text('color','主题色','#839c70','color'),num('amount','向白色混合比例 %',25,0,100)],note:'按 sRGB 通道线性混合（非感知均匀色域），同时给出 HEX 与 RGB。'},
 {fields:[text('fg','前景色','#243b30','color'),text('bg','背景色','#f4f1e8','color')],note:'按 WCAG 相对亮度公式计算；普通文字 AA ≥ 4.5，AAA ≥ 7，大文字 AA ≥ 3。'},
 {fields:[num('width','容器宽度 px',1200,1,20000),num('cols','列数',12,1,100),num('gap','列间距 px',24,0,1000),num('margin','两侧边距 px',48,0,10000)],note:'列宽 = (容器宽 − 2×边距 − (列数−1)×间距) / 列数。'},
 {fields:[num('width','画布宽度 px',1200,1,20000),num('a','比例宽',4,0.01,100),num('b','比例高',5,0.01,100)],note:'按给定比例计算高度，像素结果四舍五入。'},
 {fields:[num('principal','本金',10000),num('rate','假设年利率 %',3,0,100),num('years','年数',5,0,100),num('monthly','每月存入',500)],note:'按月复利，月末存入；纯假设算例，不是收益承诺或投资建议。'},
 {fields:[num('price','原价',680),num('discount','保留售价比例 %',80,0,100),num('coupon','额外减免',30)],note:'最终价格 = max(0, 原价 × 保留比例 − 减免)。'},
 {fields:[num('amount','税前金额',1000),num('tax','假设税率 %',8,0,100),num('fee','附加费率 %',2,0,100)],note:'税费与附加费均以税前金额为基数；不是任何地区的税务申报建议。'},
 {fields:[num('base','原配方份数',2,0.1,10000),num('target','目标份数',5,0.1,10000),num('ingredient','原食材用量 g',180)],note:'仅按份数线性缩放，不构成烹饪时间、食品安全或营养建议。'},
 {fields:[num('pages','总页数',280,1,100000),num('done','已读页数',40,0,100000),num('daily','每天阅读页数',20,1,10000)],note:'按每天固定页数估算，天数向上取整。'},
 {fields:[num('people','人数',2,1,1000),num('days','天数',3,1,1000),num('stay','每人每晚住宿',180),num('food','每人每天餐饮',90),num('transport','每人交通总额',300)],note:'住宿按天数减一晚；不代表任何真实商户报价。'},
 {fields:[text('checks','已完成日期（逗号分隔 1–31）','1,2,3,5,8'),num('days','观察周期（天）',14,1,31)],note:'按不重复的有效日期计算完成率；不推断未输入的记录。'},
 {fields:[text('items','清单条目（每行一个）','明确目标\n准备材料\n完成一个小动作\n记录结果','textarea')],note:'将你的文本整理为可勾选清单，不调用外部 AI。'},
 {fields:[text('weights','评价权重（逗号分隔）','40,35,25'),text('matrix','候选方案：每行 名称,分数1,分数2,分数3','方案 A,8,6,9\n方案 B,7,9,6\n方案 C,6,8,8','textarea')],note:'分数必须在 0–10 内，按权重归一化求加权分，不代表客观最优选择。'},
]
export function toolDefaults(c){
 const v=c.variant||0,fields=Object.fromEntries(TOOLS[c.tool].fields.map(f=>[f.key,f.value]))
 const presets=[
 {total:[2500,5000,8000,12000,20000][v],a:45+v*5,b:25-v*2},
 {target:10000+v*8000,current:1000+v*1000,monthly:800+v*400},
 {hours:20+v*15,rate:120+v*40,cost:300+v*250,buffer:10+v*5},
 {fixed:3000+v*2000,price:100+v*25,variable:30+v*10},
 {hours:2+v,tasks:12+v*9,buffer:10+v*5},
 {end:new Date(Date.UTC(2026,10,15+v*20)).toISOString().slice(0,10)},
 {value:1+v*2,from:['m','cm','km','in','ft'][v],to:['cm','m','m','cm','m'][v]},
 {color:c.palette[2],amount:10+v*15},
 {fg:['#243b30','#263b6f','#753d45','#fff2db','#d5e8ff'][v],bg:['#f4f1e8','#ecf1ff','#f7ece4','#25261f','#202b40'][v]},
 {width:960+v*240,cols:4+v*2,gap:16+v*4,margin:24+v*8},
 {width:800+v*200,a:[1,3,4,9,16][v],b:[1,4,5,16,9][v]},
 {principal:5000+v*5000,rate:1+v,years:2+v*2,monthly:200+v*200},
 {price:200+v*250,discount:95-v*10,coupon:v*20},
 {amount:500+v*750,tax:5+v*2,fee:1+v},
 {base:2,target:3+v*2,ingredient:100+v*50},
 {pages:180+v*70,done:v*25,daily:10+v*5},
 {people:1+v,days:2+v,stay:120+v*60,food:60+v*25,transport:100+v*150},
 {checks:Array.from({length:3+v*2},(_,i)=>1+i).join(','),days:14+v*3},
 {items:[...c.topic.tips,...Array.from({length:v+1},(_,i)=>`${c.topic.items[i%3]}：记录第 ${i+1} 次尝试`)].join('\n')},
 {weights:`${30+v*5},${45-v*5},25`,matrix:`方案 A,${6+v%4},6,9\n方案 B,7,${6+v},6\n方案 C,${8-v},8,8`},
 ]
 return {...fields,...presets[c.tool]}
}
const rgb=hex=>{if(!/^#[0-9a-f]{6}$/i.test(hex))throw Error('请输入有效的六位颜色');return hex.slice(1).match(/../g).map(x=>parseInt(x,16))}
const hex=rgb=>'#'+rgb.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('')
const fmt=n=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(n)
export function calculateTool(type,input){
 const values={...input};for(const f of TOOLS[type].fields){if(f.type==='number'){const n=Number(input[f.key]);if(input[f.key]===''||!Number.isFinite(n)||n<f.min||n>f.max)throw Error(`${f.label}须在 ${f.min}–${f.max} 之间`);values[f.key]=n}if(f.type==='select'&&!f.options.some(o=>o[0]===input[f.key]))throw Error('请选择有效单位')}
 const v=values,rows=[];let value=0,unit='',detail='',chart=[]
 switch(type){
 case 0:if(v.a+v.b>100)throw Error('两项支出比例之和不能超过 100%');rows.push(['必要支出',v.total*v.a/100],['自由支出',v.total*v.b/100],['储备金额',v.total*(100-v.a-v.b)/100]);value=v.total;unit='预算总额';chart=rows.map(r=>r[1]);break
 case 1:value=Math.ceil(Math.max(0,v.target-v.current)/v.monthly);unit='个月';rows.push(['目标金额',v.target],['已有金额',v.current],['尚需储蓄',Math.max(0,v.target-v.current)]);break
 case 2:rows.push(['工时小计',v.hours*v.rate],['额外成本',v.cost],['风险预留',(v.hours*v.rate+v.cost)*v.buffer/100]);value=(v.hours*v.rate+v.cost)*(1+v.buffer/100);unit='估算报价';chart=rows.map(r=>r[1]);break
 case 3:if(v.price<=v.variable)throw Error('售价必须大于单位变动成本才有盈亏平衡点');value=Math.ceil(v.fixed/(v.price-v.variable));unit='个单位';rows.push(['单位贡献',v.price-v.variable],['平衡点收入',value*v.price],['平衡点总成本',v.fixed+value*v.variable]);break
 case 4:value=Math.ceil(v.tasks/(v.hours*(1-v.buffer/100)));unit='天';rows.push(['每日有效工时',v.hours*(1-v.buffer/100)],['总任务工时',v.tasks],['预留比例 %',v.buffer]);break
 case 5:{const parse=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('请填写完整日期');const d=new Date(s+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==s)throw Error('日期无效');return d.getTime()};value=(parse(v.end)-parse(v.start))/86400000;unit='天';rows.push(['起始日期',v.start],['目标日期',v.end]);break}
 case 6:{const factors={m:1,cm:.01,km:1000,in:.0254,ft:.3048};value=v.value*factors[v.from]/factors[v.to];unit=v.to;rows.push(['原始数值',`${v.value} ${v.from}`],['米制基准',`${fmt(v.value*factors[v.from])} m`]);break}
 case 7:{const original=rgb(v.color),mixed=original.map(n=>n+(255-n)*v.amount/100);value=hex(mixed);unit='混合色';rows.push(['原始色',v.color],['RGB',mixed.map(Math.round).join(', ')],['向白混合',`${v.amount}%`]);chart=[v.color,value];break}
 case 8:{const luminance=h=>rgb(h).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0);const a=luminance(v.fg),b=luminance(v.bg);value=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);unit=': 1';rows.push(['普通文字 AA',value>=4.5?'通过':'不通过'],['普通文字 AAA',value>=7?'通过':'不通过'],['大文字 AA',value>=3?'通过':'不通过']);break}
 case 9:if(!Number.isInteger(v.cols))throw Error('列数必须为整数');value=(v.width-2*v.margin-(v.cols-1)*v.gap)/v.cols;if(value<=0)throw Error('边距与间距超过可用宽度');unit='px / 列';rows.push(['容器宽',v.width],['总间距',(v.cols-1)*v.gap],['列数',v.cols]);chart=Array(v.cols).fill(value);break
 case 10:value=Math.round(v.width*v.b/v.a);unit='px 高';rows.push(['宽度',v.width],['高度',value],['宽高比',`${v.a} : ${v.b}`]);break
 case 11:{const n=Math.round(v.years*12),r=v.rate/1200;value=v.principal*(1+r)**n+(r?v.monthly*((1+r)**n-1)/r:v.monthly*n);rows.push(['累计本金',v.principal+v.monthly*n],['假设利息',value-v.principal-v.monthly*n],['月数',n]);chart=rows.slice(0,2).map(r=>r[1]);unit='假设终值';break}
 case 12:value=Math.max(0,v.price*v.discount/100-v.coupon);unit='应付金额';rows.push(['原价',v.price],['节省金额',v.price-value],['实际保留比例',v.price?`${fmt(value/v.price*100)}%`:'原价为零']);break
 case 13:value=v.amount*(1+(v.tax+v.fee)/100);unit='含假设税费总额';rows.push(['税前金额',v.amount],['税额',v.amount*v.tax/100],['附加费',v.amount*v.fee/100]);chart=rows.map(r=>r[1]);break
 case 14:value=v.ingredient*v.target/v.base;unit='g';rows.push(['缩放倍数',v.target/v.base],['原配方用量',v.ingredient],['目标份数',v.target]);break
 case 15:if(v.done>v.pages)throw Error('已读页数不能超过总页数');value=Math.ceil((v.pages-v.done)/v.daily);unit='天';rows.push(['剩余页数',v.pages-v.done],['每日页数',v.daily],['已读进度',`${fmt(v.done/v.pages*100)}%`]);break
 case 16:if(!Number.isInteger(v.people)||!Number.isInteger(v.days))throw Error('人数和天数必须是整数');rows.push(['住宿',v.people*(v.days-1)*v.stay],['餐饮',v.people*v.days*v.food],['交通',v.people*v.transport]);value=rows.reduce((s,r)=>s+r[1],0);unit='全员估算预算';chart=rows.map(r=>r[1]);break
 case 17:{if(!Number.isInteger(v.days))throw Error('周期须为整数');const days=[...new Set(String(v.checks).split(/[,，\s]+/).filter(Boolean).map(Number))];if(days.some(n=>!Number.isInteger(n)||n<1||n>v.days))throw Error('完成日期必须在观察周期内');value=days.length/v.days*100;unit='% 完成';rows.push(['完成天数',days.length],['观察天数',v.days],['未记录天数',v.days-days.length]);chart=Array.from({length:v.days},(_,i)=>days.includes(i+1)?1:0);break}
 case 18:{const items=[...new Set(String(v.items).split('\n').map(s=>s.trim()).filter(Boolean))];if(!items.length||items.length>100)throw Error('请输入 1–100 条清单');value=items.length;unit='项行动';rows.push(...items.map((s,i)=>[String(i+1).padStart(2,'0'),s]));break}
 case 19:{const weights=String(v.weights).split(/[,，]/).map(Number);if(!weights.length||weights.length>12||weights.some(n=>!Number.isFinite(n)||n<0)||weights.reduce((s,n)=>s+n,0)<=0)throw Error('请填写非负权重且总和大于零');const total=weights.reduce((s,n)=>s+n,0),candidates=String(v.matrix).trim().split('\n').filter(Boolean).map(line=>{const parts=line.split(/[,，]/),name=parts.shift().trim(),scores=parts.map(Number);if(!name||scores.length!==weights.length||scores.some(n=>!Number.isFinite(n)||n<0||n>10))throw Error('每行须有名称和与权重数量一致的 0–10 分数');return[name,scores.reduce((s,n,i)=>s+n*weights[i]/total,0)]}).sort((a,b)=>b[1]-a[1]);if(!candidates.length||candidates.length>30)throw Error('请输入 1–30 个方案');value=candidates[0][0];unit='当前最高加权分';rows.push(...candidates);chart=candidates.map(r=>r[1]);break}
 }
 if(typeof value==='number'&&!Number.isFinite(value))throw Error('结果超出可计算范围，请缩小输入')
 return {value,display:typeof value==='number'?fmt(value):value,unit,rows,chart,detail:detail||TOOLS[type].note}
}
