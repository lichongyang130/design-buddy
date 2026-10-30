import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import ExcelJS from 'exceljs'
import {unzipSync} from 'fflate'
import {markdownDocx,loadWorkbook,workbookView,patchWorkbook,exportWorkbook} from '../src/office-file-engines.js'
import {validatePlugin,runPlugin,EXAMPLE_PLUGIN,compareVersions} from '../src/skill-plugin-packages.js'
import {templateBrowser} from '../scripts/template-browser.mjs'
const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'db-file-skills-'))
function pdfFixture(){
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R 6 0 R] /Count 2 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length 44 >>\nstream\nBT /F1 20 Tf 30 200 Td (Hello PDF) Tj ET\nendstream','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Contents 7 0 R >>','<< /Length 0 >>\nstream\n\nendstream']
 let s='%PDF-1.4\n',offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(s));s+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`}const x=Buffer.byteLength(s);s+=`xref\n0 8\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;return Buffer.from(s)
}
let browser
try {
 const original=new ExcelJS.Workbook(),sheet=original.addWorksheet('Data');sheet.addRows([['Name','Amount'],['Alpha',12],['Beta',7]]);sheet.getCell('B2').numFmt='0.00';sheet.getCell('B4').value={formula:'SUM(B2:B3)',result:19};original.addWorksheet('Notes').getCell('A1').value='Untouched';const input=new Uint8Array(await original.xlsx.writeBuffer())
 const book=await loadWorkbook(input);patchWorkbook(book,{sheet:1,address:'B2',type:'number',value:'25'});const exported=await exportWorkbook(book),reloaded=await loadWorkbook(exported)
 assert.equal(reloaded.getWorksheet(1).getCell('B2').value,25);assert.equal(reloaded.getWorksheet(1).getCell('B2').numFmt,'0.00');assert.equal(reloaded.getWorksheet(2).getCell('A1').value,'Untouched');assert.equal(reloaded.getWorksheet(1).getCell('B4').formula,'SUM(B2:B3)');assert.throws(()=>patchWorkbook(book,{sheet:1,address:'A1',type:'formula',value:'WEBSERVICE("https://bad.invalid")'}))
 const doc=await markdownDocx('# Plan\n\n**Bold** and *italic* [link](https://example.com).\n\n- One\n- Two\n\n| Item | Value |\n| --- | --- |\n| A | 10 |'),zip=unzipSync(doc),xml=new TextDecoder().decode(zip['word/document.xml'])
 for(const text of ['Plan','Bold','<w:tbl>','<w:b/>','Heading1'])assert(xml.includes(text),text)
 assert(zip['[Content_Types].xml']);assert.equal(runPlugin(EXAMPLE_PLUGIN,'  TODO first\nsecond  '),'1. ACTION first\n2. second')
 assert.throws(()=>validatePlugin(JSON.stringify({...EXAMPLE_PLUGIN,manifest:{...EXAMPLE_PLUGIN.manifest,permissions:['network']}})))
 assert.throws(()=>validatePlugin(JSON.stringify({...EXAMPLE_PLUGIN,program:[{op:'eval',text:'alert(1)'}]})))
 assert.throws(()=>validatePlugin(JSON.stringify({...EXAMPLE_PLUGIN,manifest:{...EXAMPLE_PLUGIN.manifest,dependencies:{npm:'latest'}}})))
 assert.equal(compareVersions('1.0.10','1.0.2'),1)
 await fs.writeFile(path.join(tmp,'input.xlsx'),input);await fs.writeFile(path.join(tmp,'input.pdf'),pdfFixture());await fs.writeFile(path.join(tmp,'example.json'),JSON.stringify({...EXAMPLE_PLUGIN,manifest:{...EXAMPLE_PLUGIN.manifest,name:'<img src=x onerror=window.__pluginXss=1>'}}))
 browser=await templateBrowser();const context=await browser.newContext({acceptDownloads:true,viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let externalRequests=0;await context.route('https://bad.invalid/**',route=>{externalRequests++;return route.abort()})
 await page.goto('http://127.0.0.1:5174/auth.html');await page.locator('#guest-entry').click();await page.waitForURL('**/index.html')
 async function open(name){await page.goto('http://127.0.0.1:5174/skills.html?tool='+encodeURIComponent(name));await page.waitForSelector('.fs-workbench')}
 async function ready(){await page.waitForFunction(()=>!document.querySelector('#fs-status')?.textContent.includes('正在处理'));const status=await page.locator('#fs-status').innerText();assert(!status.includes('处理失败'),status)}
 async function download(selector){const event=page.waitForEvent('download');await page.locator(selector).click();const d=await event;return fs.readFile(await d.path())}
 await open('Excel 表格处理');await page.locator('#fs-file').setInputFiles(path.join(tmp,'input.xlsx'));await page.waitForSelector('#fs-grid td');await ready();await page.locator('#fs-address').fill('B2');await page.locator('#fs-type').selectOption('number');await page.locator('#fs-value').fill('42');await page.locator('#fs-save-cell').click();await ready();const actualXlsx=await download('#fs-export'),edited=await loadWorkbook(new Uint8Array(actualXlsx));assert.equal(edited.getWorksheet('Data').getCell('B2').value,42);assert.equal(edited.getWorksheet('Notes').getCell('A1').value,'Untouched')
 await open('Word 文档处理');await page.locator('#fs-text').fill('# Actual DOCX\n\n**Editable** text\n\n| A | B |\n| --- | --- |\n| 1 | 2 |');const actualDocx=unzipSync(new Uint8Array(await download('#fs-export')));assert(new TextDecoder().decode(actualDocx['word/document.xml']).includes('Actual DOCX'))
 await open('PDF 文档处理');await page.locator('#fs-file').setInputFiles(path.join(tmp,'input.pdf'));await page.locator('#fs-read').click();await page.waitForSelector('#fs-pdf-tools:not([hidden])');await ready();assert.match(await page.locator('#fs-text').inputValue(),/Hello PDF/);const report=JSON.parse(await download('#fs-export'));assert.equal(report.pageCount,2);assert.deepEqual(report.ocrPages,[2]);await page.locator('#fs-render').click();await ready();assert(await page.locator('#fs-canvas').evaluate(c=>c.width>0&&c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4!==3&&v<200)))
 await open('页面可访问性检查');await page.locator('#fs-text').fill('<!doctype html><html lang="en"><head><title>Audit fixture</title></head><body><h1>Audit</h1><img src="https://bad.invalid/pixel"><button></button><input><a href="#x">Next</a><script>parent.__auditEscape=true</script></body></html>');await page.locator('#fs-audit').click();await page.waitForSelector('#fs-audit-results:not(:empty)',{timeout:30000});await ready();const automatic=JSON.parse(await page.locator('#fs-audit-results').innerText());for(const id of ['image-alt','button-name','label'])assert(automatic.violations.some(v=>v.id===id),id);assert.equal(await page.evaluate(()=>window.__auditEscape),undefined);await page.frameLocator('.fs-audit-frame').locator('button').focus();await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.waitForFunction(()=>document.querySelector('#fs-keyboard-log').textContent.includes('Tab events: 2'));const auditReport=JSON.parse(await download('#fs-export'));assert.equal(auditReport.keyboard.events.length,2);assert.equal(auditReport.keyboard.manualVerdict,'untested')
 await open('插件包管理');await page.locator('#fs-file').setInputFiles(path.join(tmp,'example.json'));await page.locator('#fs-install').click();await page.waitForSelector('.modal-mask');assert.equal(await page.locator('.modal-mask img').count(),0);await page.locator('.modal-mask .modal-close').click();await ready();assert.equal(await page.locator('[data-plugin-run]').count(),0);await page.locator('#fs-install').click();await page.waitForSelector('.modal-mask');await page.locator('.modal-mask [data-act=ok]').click();await page.waitForSelector('[data-plugin-run]');await ready();await page.reload();await page.waitForSelector('[data-plugin-run]');await page.locator('#fs-text').fill(' TODO actual plugin ');await page.locator('[data-plugin-run]').click();await ready();assert.equal(await page.locator('#fs-plugin-output').inputValue(),'1. ACTION actual plugin')
 const upgraded={...EXAMPLE_PLUGIN,manifest:{...EXAMPLE_PLUGIN.manifest,version:'1.1.0'},program:[...EXAMPLE_PLUGIN.program,{op:'suffix',text:' verified'}]};await fs.writeFile(path.join(tmp,'upgraded.json'),JSON.stringify(upgraded));await page.locator('#fs-file').setInputFiles(path.join(tmp,'upgraded.json'));await page.locator('#fs-install').click();await page.waitForSelector('.modal-mask');await page.locator('.modal-mask [data-act=ok]').click();await ready();await page.locator('[data-plugin-run]').click();await ready();assert.equal(await page.locator('#fs-plugin-output').inputValue(),'1. ACTION actual plugin verified');await page.locator('#fs-file').setInputFiles(path.join(tmp,'example.json'));await page.locator('#fs-install').click();await page.waitForSelector('.modal-mask');await page.locator('.modal-mask [data-act=ok]').click();await page.waitForFunction(()=>document.querySelector('#fs-status').textContent.includes('Downgrades'));assert.match(await page.locator('#fs-plugins').innerText(),/1.1.0/);assert.equal(await page.evaluate(()=>window.__pluginXss),undefined)
 await page.locator('[data-plugin-uninstall]').click();await page.waitForSelector('.modal-mask');await page.locator('.modal-mask [data-act=ok]').click();await page.waitForFunction(()=>!document.querySelector('[data-plugin-run]'));await page.reload();await page.waitForSelector('#fs-plugins');assert.equal(await page.locator('[data-plugin-run]').count(),0)

 for(const language of ['English','日本語','繁體中文','简体中文']) {
  await page.evaluate(language=>{const state=JSON.parse(localStorage.getItem('design-buddy-state-v1'));state.settings.language=language;localStorage.setItem('design-buddy-state-v1',JSON.stringify(state))},language)
  for(const name of ['Excel 表格处理','Word 文档处理','PDF 文档处理','页面可访问性检查','插件包管理']) {
   await open(name)
   if(name==='插件包管理')await page.waitForFunction(()=>document.querySelector('#fs-plugins')?.textContent.trim())
   if(language==='English') {
    await page.waitForFunction(()=>!document.querySelector('.fs-workbench h3').textContent.match(/[\u3400-\u9fff]/))
    const residual=await page.locator('.fs-workbench').evaluate(root=>[...root.querySelectorAll('*')].filter(e=>!e.children.length&&!e.closest('textarea,pre,[translate=no]')&&/[\u3400-\u9fff]/.test(e.textContent)).map(e=>e.textContent))
    assert.deepEqual(residual,[],name+' translated file UI')
   }
  }
 }
 assert.equal(externalRequests,0);assert.deepEqual(errors,[])
 console.log('PASS actual XLSX load/edit/export/reopen and sheets/styles/formulas / native DOCX ZIP/XML/download / real two-page PDF text and OCR-needed detection, rendering and JSON / sandboxed axe violations and real Tab events / plugin validation, consent, installed program execution, reload and uninstall / zero runtime errors')
}finally{await browser?.close();await fs.rm(tmp,{recursive:true,force:true})}
