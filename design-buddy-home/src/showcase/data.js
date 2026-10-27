export const FORMATS=[{id:'social',name:'社交轮播卡片',short:'CAROUSEL',description:'有叙事、有节奏的十页内容，逐页编辑与导出。'},{id:'website',name:'网站复刻',short:'WEB STUDIES',description:'原创虚构品牌的网站设计研究，可浏览、筛选和提交本地表单。'},{id:'image',name:'图片',short:'VISUAL EDITIONS',description:'可编辑的主题海报与视觉设计，支持 SVG / PNG 导出。'},{id:'live',name:'实时产物',short:'LIVE TOOLS',description:'输入真实参数，即时计算与生成可带走的结果。'},{id:'webgl',name:'WebGL',short:'SHADER GARDEN',description:'真实 GPU 着色器，调节参数、交互与导出画面。'}]
export const THEMES=[
 ['山野来信','travel','把周末还给山野','避开拥挤路线|确认返程时间|保留天气备选','山谷步道|林间小屋|湖畔慢行'],
 ['一日厨房','food','认真对待每一餐','从已有食材开始|为准备留出时间|记录自己的口味','时蔬餐盘|厨房手记|周末备餐'],
 ['呼吸之间','fitness','慢下来也是向前','根据自身状态安排|从轻松动作开始|给休息留出位置','晨间伸展|午后暂停|安静呼吸'],
 ['纸上时光','books','让阅读成为日常','先选一个小主题|带着问题去阅读|用自己的语言记录','页边笔记|主题书架|阅读片段'],
 ['绿色房间','plants','观察一片叶子的变化','先观察实际光线|检查土壤再安排养护|定期记录生长状态','窗台薄荷|蕨类角落|新叶观察'],
 ['小小陪伴','pets','把温柔留给每一天','尊重它的生活习惯|保持环境整洁|记录细微变化','日常陪伴|用品清单|散步记录'],
 ['光线档案','culture','看见日常里的艺术','选择一个观察对象|留意光线和材质|记录自己的感受','光影习作|器物观察|色彩收集'],
 ['造物之间','work','把想法变成下一步','先写下具体目标|拆出最小行动|完成后及时复盘','概念草稿|材料探索|项目手记'],
 ['好奇心学校','learning','每天理解一点新东西','从一个问题出发|把概念解释给自己|用小练习检验理解','观察提问|概念地图|练习日志'],
 ['屋里的风','home','把房间过成喜欢的样子','先观察真实需求|优先使用已有物品|尝试后再决定取舍','阅读角落|桌面秩序|窗边日常'],
 ['岛屿电台','travel','听见远方的风','预留自由探索时间|了解当地规则|尊重自然与社区','灯塔漫步|海岸来信|小岛地图'],
 ['咖啡练习','food','一杯饮品的小讲究','记录器具与用量|一次只调整一个变量|留下主观风味笔记','晨间手冲|烘焙笔记|一杯热饮'],
 ['步行俱乐部','fitness','跟着自己的节奏出发','安排熟悉的路线|准备饮水与装备|按身体感受调整','社区慢行|河岸片段|周末轻行'],
 ['独立书房','books','为独立的声音留一页','先了解创作背景|收集喜欢的片段|整理自己的阅读路径','独立小刊|城市札记|手工书页'],
 ['花与器','plants','把季节带回家','观察花材的形态|选择合适的容器|记录摆放后的变化','枝条插花|桌边小瓶|花器搭配'],
 ['日常博物馆','culture','和一件作品认真相处','先看细节再看整体|区分观察与猜测|为自己的理解留白','器物档案|纹样研究|空间观察'],
 ['单人工作室','work','小团队也有清楚的秩序','明确本次交付范围|保留工作过程记录|给反馈留出时间','需求整理|交付清单|周末复盘'],
 ['慢学计划','learning','小步练习持续发生','设定可执行的频率|难点拆开逐个解决|回看前一次的记录','微型练习|知识卡片|复习单元'],
 ['桌上生活','home','从一张桌子开始','先确认使用人数|从简洁布局开始|兼顾好看与好用','早餐时刻|一人餐桌|朋友小聚'],
 ['城市切片','culture','重新认识熟悉的街区','带着主题去观察|不打扰他人的生活|把片段整理成故事','街角构图|社区地图|建筑细部'],
].map(([name,domain,tagline,tips,items],i)=>({name,domain,tagline,tips:tips.split('|'),items:items.split('|'),i,photo:`/art/apps/${domain}.webp`}))
export const PALETTES=[['#eeeae0','#252e27','#ca6849'],['#181e25','#edf1e6','#c8e88d'],['#edf0f7','#253b6e','#e59975'],['#f3e7db','#624734','#bf754f'],['#e9efe2','#304c3e','#94ad67'],['#f0e8f0','#533b5b','#ae81a3'],['#e7eeed','#293f42','#78a8ab'],['#242622','#f0ead8','#c7ac7a'],['#efe8dc','#514632','#a19362'],['#e7eafa','#303b71','#929ccc']]
const GL_PALETTES=[['#080e0b','#d9edc7','#8eae68'],['#170b10','#ffd1ba','#ee796d'],['#07121c','#d7f0ff','#71b9ed'],['#170f08','#ffe9ae','#c89d51'],['#120c22','#e3ccff','#a581d1'],['#101315','#f0f3f0','#a8b5bf'],['#17120e','#f1dfc0','#c8ae89'],['#061713','#c8f0e4','#65b8a2'],['#050818','#a6c2ff','#526eb9'],['#1c1110','#ffe9cd','#e9ac82']]
const angleNames=['入门指南','观察手记','行动清单','灵感提案','实践复盘']
const webNames=['品牌主页','作品档案','主题商店','编辑刊物','体验预约']
const imageNames=['主题海报','展览邀请','编辑封面','视觉宣言','活动长图']
const glNames=['流光球体','极光织幕','液态波纹','无限隧道','数字山脊','融合光场','晶格细胞','拓扑网格','星尘轨迹','极坐标花园']
const glStyleNames=['苔绿','珊瑚','冰蓝','暮金','紫雾','银灰','暖沙','青瓷','极夜','晨光']
export const TOOL_NAMES=['预算分配','目标储蓄','项目报价','盈亏平衡','时间排程','日期倒数','单位换算','色彩工作台','配色对比度','网格计算','版式比例','复利试算','折扣试算','税费估算','食材缩放','阅读排程','行程预算','习惯追踪','清单生成','决策矩阵']
export const CASES=FORMATS.flatMap((format,fi)=>Array.from({length:100},(_,i)=>{
 const topic=THEMES[Math.floor(i/5)],variant=i%5,id=`${format.id}-${String(i+1).padStart(3,'0')}`
 const name=format.id==='webgl'?`${glNames[Math.floor(i/10)]} / ${glStyleNames[i%10]}`:format.id==='live'?`${TOOL_NAMES[Math.floor(i/5)]} · ${['轻量版','周末版','工作版','进阶版','自定义版'][variant]}`:`${topic.name} · ${{social:angleNames,website:webNames,image:imageNames}[format.id][variant]}`
 return {id,index:i,format:format.id,formatName:format.name,name,topic,variant,layout:i%25,seed:fi*1000+i+17,palette:format.id==='webgl'?GL_PALETTES[i%10]:PALETTES[(Math.floor(i/5)+variant*3+fi)%10],href:`/showcase-case.html?case=${id}`,cover:`/art/showcase/${id}.webp`,cat:{travel:'旅游',food:'餐饮',fitness:'培训',books:'文化',plants:'教育',pets:'教育',culture:'文化',work:'商业规划',learning:'教育',home:'品牌设计'}[topic.domain],tagline:format.id==='live'?'让输入变成清楚、可验证的结果':format.id==='webgl'?'数学、光与交互的实时实验':topic.tagline,tool:Math.floor(i/5),mode:Math.floor(i/10),geometry:i%10}
}))
export function showcaseMeta(c){return {id:c.id,name:c.name,a:c.tagline,b:c.id,cats:[c.cat],format:c.formatName,showcase:true,href:c.href,cover:c.cover}}
export function slidesFor(c){return [{title:c.topic.name,body:c.topic.tagline,kicker:'从这里开始'}, {title:'先选一个小切口',body:`这一期关注${c.topic.items[c.variant%3]}。不追求面面俱到，先让一个具体问题变清楚。`,kicker:'01 / 观察'},...c.topic.tips.map((tip,i)=>({title:tip,body:[`从${c.topic.items[0]}开始，把现状和预期分别写下来，避免凭印象做决定。`,`为${c.topic.items[1]}留一段可用时间。选择一个今天能完成的小动作。`,`回到${c.topic.items[2]}，记录哪些适合自己，哪些需要继续调整。`][i],kicker:`0${i+2} / 方法`})),{title:'做一次小实验',body:`围绕「${c.topic.items[c.variant%3]}」，只改变一个条件，留下对照记录。`,kicker:'05 / 行动'},{title:'把过程写下来',body:'记录起点、做过的动作、观察到的变化。区分自己的感受与可核实的信息。',kicker:'06 / 记录'},{title:'给不确定留位置',body:'一次体验不能代表所有情况。把疑问留下，在下一次实践中继续验证。',kicker:'07 / 提醒'},{title:'你的下一步',body:c.topic.tips.join(' → '),kicker:'08 / 清单'},{title:'回到自己的节奏',body:`收藏这份${angleNames[c.variant]}，下次从一个具体行动继续。`,kicker:'09 / 收尾'}]}
