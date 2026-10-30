// Fifty mobile product cases. Each has its own content, route vocabulary and
// structural recipe; shared primitives do not imply fifty separate native apps.
export const DOMAINS = {
  travel: {name:'旅行出行',noun:'目的地',plan:'出走计划',board:'旅行清单',note:'旅行手记',unit:'站',action:'加入行程',steps:['了解路线','准备随身物品','确认时间','记录这次出发'],hint:'距离、路线和预算均为演示，不提供真实导航或预订。'},
  food: {name:'饮食烹饪',noun:'食谱',plan:'备餐计划',board:'食谱夹',note:'厨房笔记',unit:'道',action:'加入备餐',steps:['准备食材','清洗与切配','按步骤烹饪','记录口味调整'],hint:'食谱仅为内容原型，不提供营养、过敏或食品安全建议。'},
  fitness: {name:'运动身心',noun:'练习',plan:'练习计划',board:'训练清单',note:'练习日志',unit:'项',action:'安排练习',steps:['检查身体状态','准备练习环境','完成自主练习','记录主观感受'],hint:'示例练习不构成医疗或运动处方，请根据自身情况安排。'},
  books: {name:'阅读记录',noun:'读物',plan:'阅读计划',board:'主题书架',note:'阅读笔记',unit:'篇',action:'加入书单',steps:['浏览内容简介','设定阅读时间','完成本次阅读','写下一个收获'],hint:'书名和内容为演示设定，不提供整本版权读物或真实音频。'},
  plants: {name:'植物园艺',noun:'植物档案',plan:'养护计划',board:'我的花园',note:'养护观察',unit:'项',action:'安排养护',steps:['观察环境','检查土壤状态','安排适宜养护','记录生长变化'],hint:'养护信息为演示，请结合植物品种和实际环境判断。'},
  pets: {name:'宠物生活',noun:'照护事项',plan:'照护计划',board:'宠物清单',note:'陪伴日记',unit:'项',action:'安排照护',steps:['检查所需用品','了解宠物状态','完成日常陪伴','记录异常与变化'],hint:'不提供领养交易、真实预约或兽医诊断服务。'},
  culture: {name:'艺术文化',noun:'灵感主题',plan:'体验计划',board:'灵感集',note:'创作手记',unit:'项',action:'加入计划',steps:['了解主题背景','准备体验材料','完成一次探索','整理自己的作品'],hint:'展览、地点与活动均为演示，不生成有效门票或预约。'},
  work: {name:'效率工作',noun:'工作专题',plan:'项目计划',board:'项目资料夹',note:'工作笔记',unit:'项',action:'加入项目',steps:['明确具体目标','拆解下一步动作','完成一个工作单元','复盘与归档'],hint:'仅保存本地演示项目，不连接企业系统或协作平台。'},
  learning: {name:'学习成长',noun:'学习单元',plan:'学习计划',board:'学习资料夹',note:'学习笔记',unit:'课',action:'安排学习',steps:['浏览学习目标','准备练习材料','完成一次练习','写下理解与疑问'],hint:'内容为演示课程，不提供真实证书或第三方教学资源。'},
  home: {name:'居家生活',noun:'生活方案',plan:'生活计划',board:'生活灵感集',note:'生活记录',unit:'项',action:'加入安排',steps:['观察自己的需求','准备已有物品','尝试一个小改变','记录使用感受'],hint:'材料、空间与商品均为示例，不接入采购、支付或家装服务。'},
}
const seeds = [
 ['qiye','栖野','把周末还给山野','travel','青岚山谷|白沙海岸|南溪古镇|隐竹小屋|栖霞湖畔'],
 ['ridge','山径','找到自己的徒步节奏','travel','竹影小径|云脊步道|山谷环线|落日坡地|溪边缓行'],
 ['islet','岛屿来信','给自己一段海边时光','travel','潮汐灯塔|白礁海湾|渔村晨光|海盐书店|沿海慢行'],
 ['laneway','巷游','用脚步重新认识城市','travel','街角咖啡|旧城骑楼|河岸艺廊|夜间市集|社区小店'],
 ['campday','营日','一晚营地一整段自然','travel','林间天幕|湖岸营位|星空草场|山脚野餐|溪畔木台'],
 ['lightplate','轻厨','认真吃好每一顿','food','烤蔬菜碗|番茄炖豆|香草意面|南瓜浓汤|菌菇杂粮饭'],
 ['breadnote','面包日记','记录揉面到出炉的过程','food','乡村酸面包|橄榄佛卡夏|肉桂小卷|全麦餐包|香草司康'],
 ['seasonal','食时','跟着季节安排餐桌','food','春笋拌菜|夏日冷面|秋梨沙拉|冬日炖锅|时蔬拼盘'],
 ['bentobox','便当盒','给明天留一盒期待','food','彩蔬便当|菌菇饭盒|豆腐时蔬|海苔饭团|周末备餐'],
 ['brewlog','煮意','一杯饮品的一点讲究','food','晨间手冲|冰滴记录|柑橘茶饮|燕麦拿铁|可可热饮'],
 ['stride','跑迹','记录每一次轻松出发','fitness','晨间慢跑|河岸轻行|节奏练习|恢复散步|周末跑伴'],
 ['stretch','舒展','让身体慢慢松下来','fitness','肩颈放松|晨起伸展|睡前舒缓|办公室间歇|柔和流动'],
 ['pedal','踏频','骑到风经过的地方','fitness','城市骑行|绿道绕行|周末短途|雨日整理|骑后放松'],
 ['breathe','息间','为自己留一段安静','fitness','晨间呼吸|午后暂停|安静坐一会|睡前放空|户外觉察'],
 ['strength','力序','一步步建立练习秩序','fitness','基础热身|自重练习|上肢专注|下肢专注|放松整理'],
 ['paperroom','纸间','让每次阅读留下痕迹','books','山居片段|城市切面|时间的纹理|窗边随笔|自然小记'],
 ['margin','页边','读到喜欢的地方就写下','books','留白的艺术|远方来信|日常观察|小岛诗集|慢行札记'],
 ['nightread','夜读','睡前留给一本书','books','月光手札|冬夜散文|旧街故事|林间书简|清晨片语'],
 ['booktrail','书径','沿着主题发现阅读','books','建筑与人|植物之书|餐桌文化|行走地图|手艺故事'],
 ['smallpress','小刊','收集独立出版的声音','books','街区一号|手作档案|生活提案|影像季刊|一人编辑室'],
 ['sprout','芽生','观察一片叶子的变化','plants','龟背竹观察|蕨类角落|绿萝整理|窗台薄荷|小叶榕档案'],
 ['balcony','阳台农场','从一个花盆开始','plants','番茄育苗|罗勒盆栽|生菜记录|小葱日常|辣椒观察'],
 ['moss','苔间','照顾一个小小世界','plants','苔藓微景|玻璃花房|蕨类小盆|雨林角落|枯木造景'],
 ['floraday','花期','把季节带回房间','plants','白色花束|枝条插花|野花小瓶|花材整理|干花记录'],
 ['leaflog','叶记','给每株植物一份档案','plants','光照记录|换盆准备|新叶观察|土壤检查|养护复盘'],
 ['pawpal','宠邻','让陪伴成为日常','pets','晨间遛狗|饮水检查|毛发梳理|玩具整理|外出准备'],
 ['catnest','猫窝','记录小猫的生活片段','pets','猫砂整理|喂食准备|逗猫时间|休息角落|日常观察'],
 ['dogwalk','遛弯','和它一起走慢一点','pets','公园慢行|社区绕行|雨天准备|牵引检查|散步日记'],
 ['petmemo','爪印','把成长留下来','pets','第一次出门|喜欢的玩具|陪伴片段|用品清单|生活记录'],
 ['softcare','柔伴','温柔照顾每个小习惯','pets','每日观察|安静陪伴|环境整理|用品补充|照护复盘'],
 ['galleryday','展间','把看展变成自己的旅程','culture','形与留白|光线实验|日常陶器|城市档案|纸上空间'],
 ['claytime','陶时','从一块泥开始创作','culture','手捏小碗|杯形观察|陶土纹理|釉色灵感|作品整理'],
 ['frameline','取景','练习看见日常的光','culture','窗边光影|街角构图|静物练习|树影记录|色彩收集'],
 ['handmade','手物','为日常做一件小东西','culture','皮革书签|布料小袋|木质托盘|纸艺灯罩|修补练习'],
 ['museumwalk','馆游','和一件作品认真相处','culture','器物观察|建筑细部|纹样收集|工艺档案|展厅手记'],
 ['focusroom','专注室','一次只做好一件事','work','今天最重要的事|深度工作单元|资料归档|周复盘|明日准备'],
 ['boardly','板间','把想法整理成下一步','work','概念收集|结构草稿|设计评审|交付清单|项目复盘'],
 ['solodesk','一人桌','一个人的工作也有秩序','work','客户需求|本周任务|资料整理|交付准备|工时回顾'],
 ['makerlog','造作','记录从草图到成品','work','原型探索|材料测试|细节打磨|成品拍摄|项目归档'],
 ['teamnote','共页','把讨论变成清楚的行动','work','议题准备|会议摘要|行动清单|进展检查|协作复盘'],
 ['lingua','词屿','每天靠近一种新表达','learning','生活问候|咖啡点单|出行表达|兴趣介绍|复习单元'],
 ['practice','练习册','小步练习也能看见变化','learning','线条练习|构图观察|明暗研究|配色尝试|作品复盘'],
 ['chord','弦外','为喜欢的旋律留时间','learning','持琴准备|节奏认识|和弦练习|旋律片段|练后记录'],
 ['codenote','码间','把理解写成自己的作品','learning','变量练习|条件判断|列表处理|函数拆分|小项目复盘'],
 ['curiosity','知趣','跟着好奇心学一点','learning','观察提问|资料查找|概念整理|动手实验|总结表达'],
 ['roomtone','屋调','让房间更像自己','home','窗边阅读角|玄关整理|餐桌灯光|客厅留白|床边小物'],
 ['wardrobe','衣序','看见已有衣物的新可能','home','日常通勤|周末轻装|换季整理|配饰收集|衣物养护'],
 ['ritual','小仪式','把普通日子过得具体','home','晨间泡茶|午后阅读|周末清洁|餐桌准备|睡前整理'],
 ['tidyhome','归处','给每件物品一个位置','home','厨房分区|书桌整理|衣柜分类|玄关收纳|物品复盘'],
 ['tablelife','桌上生活','从一张桌子开始布置','home','两人早餐|一人午餐|朋友小聚|桌花练习|餐具整理'],
]
export const SCREEN_KINDS = ['home','discover','categories','detail','gallery','saved','collections','collection','planner','plan','create','checklist','activity','notes','note','inbox','message','search','profile','settings','progress','timer','guide','review']
const families=['editorial','athletic','minimal','paper','organic','playful','gallery','utility','studio','zen']
const palettes=[['#edf2e8','#234e36','#819d52'],['#161d25','#f3f5ee','#c6ef65'],['#f3f6fb','#234968','#57a5c4'],['#f4eddd','#4d3e2d','#b46d42'],['#eff2e6','#3c5734','#a0ad65'],['#f3ecfa','#533c71','#a17fc7'],['#181918','#f1efdf','#d4aa79'],['#f2f3f2','#323d3b','#6b9990'],['#eff0fc','#233c9c','#e68e59'],['#f3ece4','#69503f','#b9926b']]
function permutations(values){if(!values.length)return [[]];return values.flatMap((value,i)=>permutations(values.filter((_,j)=>j!==i)).map(tail=>[value,...tail]))}
const orders=permutations(['feature','shelf','quick','agenda','insight'])
const baseLabels=(d)=>({home:'首页',discover:`发现${d.noun}`,categories:'主题分类',detail:`${d.noun}详情`,gallery:'场景与图集',saved:`收藏${d.noun}`,collections:d.board,collection:`${d.board}详情`,planner:d.plan,plan:`${d.plan}详情`,create:`新建${d.plan}`,checklist:'行动清单',activity:'动态记录',notes:d.note,note:`编辑${d.note}`,inbox:'演示消息',message:'消息详情',search:'搜索',profile:'我的',settings:'偏好设置',progress:'完成进度',timer:'专注计时',guide:'使用指引',review:'体验反馈'})
export const APP_CASES=seeds.map(([id,name,tagline,domain,itemText],index)=>{
 const d=DOMAINS[domain],familyIndex=(index*7+Math.floor(index/5)*3)%10
 const family=families[familyIndex],pageCount=20+index%5,labels=baseLabels(d)
 const screenOrder=[...SCREEN_KINDS.slice(0,20),...SCREEN_KINDS.slice(20,pageCount)]
 // Actual structural recipe: fifty unique module orders, with different feature,
 // list, navigation and header shapes. Page-route order is separately permuted.
 const homeOrder=orders[(index*37)%orders.length]
 const secondary=screenOrder.slice(1);const shift=(index*7)%secondary.length
 const screens=['home',...secondary.slice(shift),...secondary.slice(0,shift)].map((kind,i)=>({id:kind,title:labels[kind],layout:`${family}-${kind}-${(index+i)%5}`}))
 const itemNames=itemText.split('|')
 const items=itemNames.map((title,i)=>({id:`item-${i}`,title,category:['入门','日常','精选'][i%3],subtitle:`${name} · ${d.name}`,description:`${title}是「${name}」中的一份${d.noun}示例。从了解背景开始，按照自己的节奏安排，再把体验记录在${d.note}中。`,steps:d.steps.map((step,j)=>`${step} · ${title}${j===0?'的准备':''}`),duration:[15,25,40,20,30][i],imageIndex:i}))
 return {id,name,tagline,domain,domainLabel:d.name,d,index,items,pageCount,screens,palette:palettes[familyIndex],framework:{id:`app-fw-${index+1}`,family,homeOrder,feature:['immersive','split','poster','banner','collage'][index%5],cards:['rail','tiles','list','index','stack'][Math.floor(index/5)%5],navigation:['tabs','dock','labels','center','pills'][index%5],header:['brand','center','stack'][index%3]},tabs:[['home','discover','planner','saved','profile'],['home','saved','discover','planner','profile'],['home','planner','discover','saved','profile'],['home','discover','saved','planner','profile'],['home','planner','saved','discover','profile']][index%5],hero:`/art/apps/${domain}.webp`,cover:`/art/apps/covers/${id}.webp`,href:`/app-case.html?app=${id}`}
})
const templateCategory={travel:'旅游',food:'餐饮',fitness:'培训',books:'文化',plants:'教育',pets:'教育',culture:'文化',work:'商业规划',learning:'教育',home:'品牌设计'}
export function appTemplateMeta(app){return {id:`app-${app.id}`,name:`${app.name} · ${app.domainLabel} App`,a:app.tagline,b:app.framework.id,cats:[templateCategory[app.domain]],format:'App',app:true,href:app.href,cover:app.cover,pageCount:app.pageCount,imgCount:6}}
