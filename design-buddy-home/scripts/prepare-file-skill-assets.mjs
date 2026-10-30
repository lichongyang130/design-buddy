import fs from 'node:fs/promises'
const root=new URL('../',import.meta.url)
for(const directory of ['cmaps','standard_fonts','wasm'])await fs.cp(new URL('node_modules/pdfjs-dist/'+directory,root),new URL('public/vendor/pdfjs/'+directory,root),{recursive:true})
for(const file of ['LICENSE','cmaps/LICENSE','standard_fonts/LICENSE_LIBERATION','wasm/LICENSE_OPENJPEG','wasm/LICENSE_QCMS']){const source=new URL('node_modules/pdfjs-dist/'+file,root),target=new URL('public/vendor/pdfjs/'+file,root);try{const text=await fs.readFile(source,'utf8');await fs.writeFile(target,text.split(/\r?\n/).map(line=>line.trimEnd()).join('\n').trimEnd()+'\n')}catch{}}
console.log('Prepared local PDF.js CMaps, fonts and WASM assets')
