// Keep explicit creation workbenches and skill/expert workflows unchanged.
// Only untyped conversational questions enter the standalone chat surface.
export function isStandaloneQuestion({text='',type,skill,expert}){
 if(type||skill||expert)return false
 const prompt=String(text).trim()
 if(/^(?:请问[，,：:\s]*)?(?:如何|怎么|为什么|什么是|怎样|能否解释|解释一下|介绍一下)/.test(prompt))return true
 return !/(?:生成|制作|创建|新建|撰写|写一|做一|帮我做|帮我写|给我|输出|画一|美化|导入|设计)[\s\S]{0,160}(?:演示文稿|PPT|幻灯片|文档|报告|轮播图|轮播卡|海报|图片|图像|网站|WebGL)/i.test(prompt)
}
