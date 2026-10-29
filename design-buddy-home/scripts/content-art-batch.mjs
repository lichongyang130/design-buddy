// Local resumable planning/import pipeline. Never calls a paid provider implicitly.
// plan --scope=case|page --out=FILE; import --job=KEY --file=FILE --brief=TEXT
// audit verifies file signatures, sha256 uniqueness and source matching.
import { readFile, writeFile, mkdir, copyFile, rename } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { artJobs, artCoverage, ART_CASES } from '../src/content-art-catalog.js'
import { CONTENT_SCENES, contentSceneFor } from '../src/content-art-scenes.js'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const manifest=join(root,'src/content-art-batch.json')
const [command='status',...raw]=process.argv.slice(2)
const args=Object.fromEntries(raw.map(arg=>{ const i=arg.indexOf('=');return [arg.slice(2,i<0?undefined:i),i<0?true:arg.slice(i+1)] }))
const digest=buffer=>createHash('sha256').update(buffer).digest('hex')
const jobs=artJobs({scope:args.scope||'case'})
if(command==='status') console.log(JSON.stringify(artCoverage(),null,2))
else if(command==='plan') {
  let pending=jobs.filter(job=>job.status==='pending')
  if(args.category)pending=pending.filter(job=>job.category===args.category)
  if(args.limit) { if(!/^\d+$/.test(args.limit)||Number(args.limit)<1)throw Error('limit must be positive'); pending=pending.slice(0,Number(args.limit)) }
  const result={version:1,coverage:artCoverage(),scope:args.scope||'case',jobs:pending}
  if(args.out){const out=resolve(root,args.out);await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify(result,null,2)+'\n');console.log(`Wrote ${pending.length} pending jobs to ${out}`)}
  else console.log(JSON.stringify(result,null,2))
} else if(command==='import') {
  const job=artJobs({scope:'page'}).find(job=>job.key===args.job)
  if(!job)throw Error('Unknown current job; run plan first')
  if(typeof args.snapshot!=='string'||args.snapshot!==job.sourceSnapshot)throw Error('Missing or stale --snapshot; copy sourceSnapshot from the planned job before generating')
  if(job.status==='generated')throw Error('Job already has an image; refusing silent replacement')
  if(!args.file||typeof args.brief!=='string'||args.brief.trim().length<20)throw Error('Provide --file and the actual --brief (at least 20 characters)')
  const file=resolve(args.file)
  const bytes=await readFile(file)
  if(bytes.length>8*1024*1024)throw Error('Compress images below 8 MB before import')
  let extension
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))extension='png'
  else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')extension='webp'
  else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)extension='jpg'
  else throw Error('Unsupported image signature; expected PNG, WebP or JPEG, not a URL or SVG placeholder')
  const sha256=digest(bytes)
  for(const scene of CONTENT_SCENES){const other=await readFile(join(root,'public',scene.src));if(digest(other)===sha256)throw Error(`Duplicate image already assigned to ${scene.templateId}; refusing reuse`)}
  const entries=JSON.parse(await readFile(manifest,'utf8'))
  const filename=`${job.templateId}-p${job.pageIndex+1}-${sha256.slice(0,12)}.${extension}`
  const src=`/art/content/${filename}`
  await mkdir(join(root,'public/art/content'),{recursive:true})
  await copyFile(file,join(root,'public',src))
  entries.push({templateId:job.templateId,title:job.title,sourceSnapshot:job.sourceSnapshot,src,file:filename,brief:args.brief.trim(),medium:'ai-illustration',status:'generated',sha256,source:'AI-generated conceptual illustration, not documentary photography'})
  entries.sort((a,b)=>a.templateId.localeCompare(b.templateId)||a.sourceSnapshot.localeCompare(b.sourceSnapshot))
  await writeFile(`${manifest}.tmp`,JSON.stringify(entries,null,2)+'\n');await rename(`${manifest}.tmp`,manifest)
  console.log(`Imported ${job.key} -> ${src}`)
} else if(command==='audit') {
  const hashes=new Map()
  for(const scene of CONTENT_SCENES){
    if(!/^\/art\/content\/[a-zA-Z0-9_.-]+$/.test(scene.src))throw Error('Unsafe asset path')
    const sha=digest(await readFile(join(root,'public',scene.src)))
    if(scene.sha256&&scene.sha256!==sha)throw Error(`Asset changed: ${scene.src}`)
    if(hashes.has(sha))throw Error(`Duplicate: ${scene.src}`)
    hashes.set(sha,scene.src)
    const tpl=ART_CASES.find(t=>t.id===scene.templateId)
    if(!tpl||!tpl.pages.some((_,i)=>contentSceneFor(tpl,i)===scene))throw Error(`Stale or orphan scene: ${scene.src}`)
  }
  console.log(`PASS: ${hashes.size} distinct files; checksums, current content matches, no cross-case byte duplicates`)
  console.log(JSON.stringify(artCoverage(),null,2))
} else throw Error('Commands: status, plan, import, audit')
