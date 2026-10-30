import { PRESENTATION_TEMPLATES } from './presentation-templates.js'
import { GENERATED_DOCUMENT_TEMPLATES } from './document-generator.js'
import { planContentArt } from './content-art.js'
import { contentSceneFor } from './content-art-scenes.js'
import { sourceSnapshot } from './content-art-source.js'

export const ART_CASES = [...PRESENTATION_TEMPLATES, ...GENERATED_DOCUMENT_TEMPLATES]
const sceneLayouts = new Set(['cover','hero','split','divider','quote','closing'])
export function artJobs({ scope = 'case' } = {}) {
  if (!['case','page'].includes(scope)) throw new Error('scope must be case or page')
  return ART_CASES.flatMap(tpl => {
    let indices = tpl.pages.map((p,i) => sceneLayouts.has(p.layout) ? i : -1).filter(i=>i>=0)
    if (scope === 'case') {
      // Existing approved source match wins; otherwise prioritize the first
      // substantive introduction, never a generic contents or divider page.
      const existing = tpl.pages.findIndex((_,i)=>contentSceneFor(tpl,i))
      const hero = tpl.pages.findIndex((p,i)=>i>0&&p.layout==='hero')
      const split = tpl.pages.findIndex((p,i)=>i>0&&p.layout==='split')
      indices = [existing>=0 ? existing : hero>=0 ? hero : split>=0 ? split : 0]
    }
    return indices.map(index => {
      const plan = planContentArt(tpl,index)
      const page = tpl.pages[index]
      const scene = contentSceneFor(tpl,index)
      const context = [tpl.a,tpl.b,...tpl.pages.filter(p=>p.layout==='cover'||p.layout==='hero'||p.layout==='split').slice(0,4).map(p=>[p.title,p.sub,p.body,p.body0,p.body1].filter(Boolean).join(' '))].filter(Boolean).join('\n')
      return {
        key: `${tpl.id}:page:${index+1}`, templateId:tpl.id, name:tpl.name,
        category:tpl.cat, format:tpl.docMode?'文档':'演示文稿', pageIndex:index,
        title:page.title||page.quote||tpl.name, sourceSnapshot:sourceSnapshot(page),
        status:scene?'generated':'pending', src:scene?.src||null,
        brief:scene?.brief || `One standalone premium editorial scene illustration, landscape 4:3. Case: ${tpl.name}. Category: ${tpl.cat}. Case context: ${context}. Page title: ${page.title||''}. Exact page content: ${sourceSnapshot(page)}. Depict the specific objects, people, setting and action described here, not generic floating icons. Case color palette: ${plan.palette.join(', ')}. Use a coherent tactile ink-and-gouache or architectural miniature style. Make this composition specific to this case and this page. Do not invent data, real people, vendor products or factual system architecture. No typography, digits, charts, logos, grids, collages or watermarks.`,
      }
    })
  })
}
export function artCoverage() {
  let casesWithAI=0,scenePages=0,scenePagesWithAI=0,totalPages=0
  for(const tpl of ART_CASES){
    let hasAI=false
    tpl.pages.forEach((page,index)=>{
      totalPages++
      const ready=Boolean(contentSceneFor(tpl,index))
      hasAI ||= ready
      if(sceneLayouts.has(page.layout)){scenePages++;if(ready)scenePagesWithAI++}
    })
    if(hasAI)casesWithAI++
  }
  return {cases:ART_CASES.length,casesWithAI,casesPending:ART_CASES.length-casesWithAI,scenePages,scenePagesWithAI,scenePagesPending:scenePages-scenePagesWithAI,totalPages}
}
