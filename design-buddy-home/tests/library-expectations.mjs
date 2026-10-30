import fs from'node:fs/promises';import{pathToFileURL}from'node:url';
const root=new URL('../',import.meta.url),catalog=JSON.parse(await fs.readFile(new URL('public/atelier/catalog.json',root),'utf8'));const works=await Promise.all(catalog.cases.map(async id=>(await import(new URL('public/atelier/'+id+'/content.js',root))).work));
export const totalCases=works.length,publishedCases=works.filter(w=>w.status==='published').length,documentCases=works.filter(w=>w.format==='文档').length,progressPattern=new RegExp(publishedCases+' / '+catalog.targetCases);
