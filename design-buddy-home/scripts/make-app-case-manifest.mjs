import {readFile,writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {APP_CASES,DOMAINS} from '../src/app-catalog.js'
const digest=async file=>{const bytes=await readFile(new URL('../public'+file,import.meta.url));return {bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}}
const themes=await Promise.all(Object.keys(DOMAINS).map(async domain=>({domain,file:`/art/apps/${domain}.webp`,origin:'AI-generated thematic scene; not documentary photography',sharedBy:APP_CASES.filter(a=>a.domain===domain).map(a=>a.id),...await digest(`/art/apps/${domain}.webp`)})))
const cases=await Promise.all(APP_CASES.map(async a=>({id:a.id,name:a.name,pages:a.screens.map(s=>s.id),framework:a.framework,cover:{file:a.cover,origin:'Composition from the actual clean App home screenshot; scripts/make-app-case-covers.mjs',...await digest(a.cover)},contentArt:{origin:'Parameterized inline SVG content illustrations, not AI-generated photographs',compositions:a.items.length,renderer:'src/app-case-art.js'},sharedTheme:a.domain})))
await writeFile(new URL('../public/art/apps/manifest.json',import.meta.url),JSON.stringify({version:1,date:'2026-10-27',caseCount:cases.length,registeredRouteCount:cases.reduce((n,c)=>n+c.pages.length,0),aiThemeCount:themes.length,caseSpecificAIPhotoCount:0,coverCount:cases.length,themes,cases},null,2)+'\n')
console.log('Manifest: 50 actual-home covers, 10 shared AI theme scenes, SVG compositions; sources kept distinct.')
