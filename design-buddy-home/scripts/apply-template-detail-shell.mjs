// Apply only the shared online viewer chrome; never rewrite case content or distribution archives.
import fs from'node:fs/promises';
const root=new URL('../',import.meta.url),catalog=JSON.parse(await fs.readFile(new URL('public/atelier/catalog.json',root),'utf8'));
for(const id of catalog.cases){if(!/^[a-z][a-z-]+$/.test(id))throw Error('Unsafe case ID');const path=new URL(`public/atelier/${id}/index.html`,root);let html=await fs.readFile(path,'utf8');if(html.includes('data-template-detail-shell'))continue;html=html.replace('</head>','<link data-template-detail-shell rel="stylesheet" href="../detail-shell/style.css?v=20261030-detail-1"><link rel="stylesheet" href="../../art/apps/fonts.css"></head>').replace('</body>','<script type="module" src="../detail-shell/app.js?v=20261030-detail-1"></script></body>');await fs.writeFile(path,html)}
console.log('Shared detail-page chrome applied to '+catalog.cases.length+' existing online viewers; content and originals unchanged.');
