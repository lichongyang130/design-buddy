import {downloadFile,confirmModal,store} from './core.js'
import {uiText} from './ui-language.js'
import './file-skills.css'
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const KINDS={'Excel 表格处理':'xlsx','Word 文档处理':'docx','PDF 文档处理':'pdf','页面可访问性检查':'audit','插件包管理':'plugins','文员工作台':'office'}
const TITLES={xlsx:'Excel 文件编辑（.xlsx）',docx:'Markdown 转 Word（.docx）',pdf:'PDF 文本与页面解析',audit:'浏览器无障碍检查',plugins:'技能插件包',office:'文员工作台'}
const active=new WeakMap()
export function disposeFileSkill(host) { active.get(host)?.(); active.delete(host) }
export async function mountFileSkill(host,name){
  active.get(host)?.()
  const kind=KINDS[name];if(!kind)return false
  let dead=false,busy=false,cleanup=()=>{},close=()=>{dead=true;cleanup();host.replaceChildren();host.hidden=true}
  active.set(host,close);host.hidden=false
  host.innerHTML=`<section class="fs-workbench"><header><h3>${TITLES[kind]}</h3><button data-fs-close aria-label="关闭">×</button></header><p class="fs-privacy">文件只在当前浏览器处理，不上传服务器。插件单独保存在此浏览器。</p><div id="fs-body"></div><p id="fs-status" role="status" aria-live="polite"></p></section>`
  host.querySelector('[data-fs-close]').onclick=close
  const body=host.querySelector('#fs-body'),status=host.querySelector('#fs-status')
  let statusText=''
  const setStatus=text=>{statusText=text;if(!dead)status.textContent=text}
  const guard=fn=>async()=>{if(busy||dead)return;busy=true;setStatus('正在处理…');try{await fn();if(!dead&&statusText==='正在处理…')setStatus('处理完成')}catch(e){setStatus('处理失败：'+e.message)}finally{busy=false}}
  const $=s=>body.querySelector(s),button=(s,fn)=>{$(s).onclick=guard(fn)}
  const download=(name,data,mime)=>downloadFile(name,data,mime)
  if(kind==='office'){const {mountOfficeWorkbench}=await import('./office-workbench.js');await mountOfficeWorkbench(body,{download,setStatus,guard,confirmModal});cleanup=()=>host.replaceChildren();return true}
  if(kind==='docx'){
    body.innerHTML='<p>生成原生 Office Open XML 文档，支持标题、段落、加粗、斜体、列表、表格和链接。图片引用保留为文字，不自动下载或嵌入外链图片。</p><label>Markdown 文件<input id="fs-file" type="file" accept=".md,.markdown,.txt,text/plain"></label><label>Markdown 内容<textarea id="fs-text" rows="10"></textarea></label><button id="fs-export">导出 DOCX</button>'
    $('#fs-text').value='# 项目方案\n\n## 目标\n\n**可编辑的原生 Word 文档**。\n\n- 第一项\n- 第二项\n\n| 项目 | 负责人 |\n| --- | --- |\n| 设计 | 团队 |'
    $('#fs-file').onchange=guard(async()=>{const file=$('#fs-file').files[0];if(!file)return;if(file.size>300000)throw Error('Markdown limit: 300 KB');$('#fs-text').value=await file.text()})
    button('#fs-export',async()=>{const {markdownDocx,MIME_DOCX}=await import('./office-file-engines.js');const bytes=await markdownDocx($('#fs-text').value);if(!dead)download('document.docx',bytes,MIME_DOCX)})
  }
  if(kind==='xlsx'){
    body.innerHTML='<p>支持 .xlsx 单元格和工作表编辑。公式不在浏览器计算，导出后由 Excel 重算。不支持宏、外部链接、图表编辑；复杂工作簿可能丢失部分特性，请保留原件。</p><label>Excel 文件<input id="fs-file" type="file" accept=".xlsx"></label><div id="fs-sheet-tools" hidden><label>工作表<select id="fs-sheet" translate="no"></select></label><p id="fs-dimensions"></p><div class="fs-grid" id="fs-grid" translate="no"></div><div class="fs-actions"><button id="fs-prev">上一页</button><button id="fs-next">下一页</button></div><div class="fs-actions"><label>单元格<input id="fs-address" value="A1" maxlength="10"></label><label>类型<select id="fs-type"><option value="text">文本</option><option value="number">数值</option><option value="formula">公式</option></select></label><label>新值<input id="fs-value" maxlength="5000"></label><button id="fs-save-cell">保存单元格</button><button id="fs-export">导出 XLSX</button></div></div>'
    const worker=new Worker(new URL('./workbook.worker.js',import.meta.url),{type:'module'});let sequence=0,view,pending=new Map()
    const fail=message=>{worker.terminate();for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(message))}pending.clear()}
    cleanup=()=>fail('Workbook closed')
    worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;clearTimeout(p.timer);pending.delete(data.id);data.error?p.reject(Error(data.error)):p.resolve(data.result)}
    worker.onerror=()=>fail('Workbook worker failed; reopen this tool')
    const rpc=(op,payload)=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>fail('Workbook timed out; reopen this tool'),30000);pending.set(id,{resolve,reject,timer});worker.postMessage({id,op,payload})})
    function render(v){if(dead)return;view=v;$('#fs-sheet-tools').hidden=false;$('#fs-sheet').innerHTML=v.sheets.map(s=>`<option value="${s.id}" ${s.id===v.sheet?'selected':''}>${esc(s.name)}</option>`).join('');$('#fs-dimensions').textContent=`${v.rowCount} × ${v.columnCount} · ${v.offset+1}–${Math.min(v.offset+40,v.rowCount)} · preview: 30 columns`;$('#fs-grid').innerHTML='<table><tbody>'+v.rows.map(row=>'<tr>'+row.map(c=>`<td><button data-cell="${esc(c.address)}" title="${esc(c.address)}">${esc(c.text)}</button></td>`).join('')+'</tr>').join('')+'</tbody></table>'}
    $('#fs-file').onchange=guard(async()=>{const f=$('#fs-file').files[0];if(!f)return;if(!/\.xlsx$/i.test(f.name)||f.size>15*1024*1024)throw Error('Upload .xlsx up to 15 MB');$('#fs-sheet-tools').hidden=true;render(await rpc('load',await f.arrayBuffer()))})
    $('#fs-sheet').onchange=guard(async()=>render(await rpc('view',{sheet:$('#fs-sheet').value,offset:0})))
    button('#fs-prev',async()=>render(await rpc('view',{sheet:view.sheet,offset:Math.max(0,view.offset-40)})))
    button('#fs-next',async()=>render(await rpc('view',{sheet:view.sheet,offset:Math.min(Math.max(0,view.rowCount-40),view.offset+40)})))
    $('#fs-grid').onclick=e=>{const el=e.target.closest('[data-cell]');if(!el)return;const c=view.rows.flat().find(c=>c.address===el.dataset.cell);$('#fs-address').value=c.address;$('#fs-value').value=c.text;$('#fs-type').value=c.text.startsWith('=')?'formula':typeof c.value==='number'?'number':'text'}
    button('#fs-save-cell',async()=>render(await rpc('patch',{sheet:view.sheet,offset:view.offset,address:$('#fs-address').value.trim().toUpperCase(),value:$('#fs-value').value,type:$('#fs-type').value})))
    button('#fs-export',async()=>{const bytes=await rpc('export');if(!dead)download('edited-workbook.xlsx',bytes,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')})
  }
  if(kind==='pdf'){
    body.innerHTML='<p>解析真实 PDF 的文字层、页码和目录，可预览页面。扫描件不会伪造文字：没有文字层的页面会提示需要 OCR。暂不支持 OCR、PDF 内容编辑或签名。</p><label>PDF 文件<input id="fs-file" type="file" accept=".pdf,application/pdf"></label><label>PDF 密码（可选）<input id="fs-password" type="password" autocomplete="off"></label><button id="fs-read">解析 PDF</button><div id="fs-pdf-tools" hidden><label>页码<input id="fs-page" type="number" min="1" value="1"></label><button id="fs-render">预览页面</button><canvas id="fs-canvas"></canvas><label>提取结果<textarea id="fs-text" rows="10" readonly></textarea></label><button id="fs-export">导出解析报告</button></div>'
    let pdf,result,renderTask
    cleanup=()=>{renderTask?.cancel();pdf?.destroy()}
    button('#fs-read',async()=>{const f=$('#fs-file').files[0];if(!f)throw Error('Select a PDF first');if(f.size>20*1024*1024)throw Error('PDF limit: 20 MB');renderTask?.cancel();await pdf?.destroy();pdf=null;result=null;$('#fs-pdf-tools').hidden=true;const password=$('#fs-password').value||undefined;$('#fs-password').value='';const {openPdf,extractPdf}=await import('./pdf-file-engine.js');pdf=await openPdf(new Uint8Array(await f.arrayBuffer()),password);result=await extractPdf(pdf);if(dead){await pdf.destroy();return}$('#fs-pdf-tools').hidden=false;$('#fs-page').max=pdf.numPages;$('#fs-text').value=result.pages.map(p=>`--- PAGE ${p.page}${p.needsOCR?' · OCR REQUIRED':''} ---\n${p.text}`).join('\n\n');setStatus(`${result.pageCount} pages; OCR required: ${result.ocrPages.join(', ')||'0'}`)})
    button('#fs-render',async()=>{if(!pdf)throw Error('Parse a PDF first');const n=Number($('#fs-page').value);if(!Number.isInteger(n)||n<1||n>pdf.numPages)throw Error('Invalid page');const page=await pdf.getPage(n),original=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(1.5,1200/Math.max(original.width,original.height))}),canvas=$('#fs-canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport});await renderTask.promise})
    button('#fs-export',async()=>{if(!result)throw Error('Parse a PDF first');download('pdf-report.json',JSON.stringify(result,null,2),'application/json')})
  }
  if(kind==='audit'){
    body.innerHTML='<p>在隔离浏览器预览中运行 axe-core，检查 WCAG 2.1 A/AA 相关自动规则。脚本、外部资源、表单提交被禁用；结果仅覆盖此受限预览，不等于完整 WCAG 认证。</p><label>HTML 内容<textarea id="fs-text" rows="7"></textarea></label><button id="fs-audit">运行浏览器检查</button><button id="fs-keyboard" hidden>开始键盘测试</button><div id="fs-audit-preview"></div><pre id="fs-audit-results" translate="no"></pre><p id="fs-keyboard-log"></p><label>人工键盘结论<select id="fs-verdict"><option value="untested">未测试</option><option value="pass">通过（人工确认）</option><option value="fail">存在问题</option></select></label><button id="fs-export" hidden>导出检查报告</button>'
    $('#fs-text').value='<!doctype html><html lang="zh-CN"><head><title>示例页面</title></head><body><h1>产品介绍</h1><img src="missing.jpg"><input placeholder="邮箱"><button></button><a href="#details">了解详情</a></body></html>'
    let session,report,keyboard=[];cleanup=()=>session?.destroy()
    button('#fs-audit',async()=>{session?.destroy();keyboard=[];report=null;$('#fs-keyboard').hidden=true;$('#fs-export').hidden=true;const {browserAccessibility}=await import('./browser-accessibility.js');session=browserAccessibility($('#fs-audit-preview'),$('#fs-text').value,event=>{keyboard.push(event);if(keyboard.length>500)keyboard.shift();$('#fs-keyboard-log').textContent=`Tab events: ${keyboard.length} · ${event.tag} ${event.name}`});const automatic=await session.promise;if(dead)return;report={scope:'Sanitized HTML in opaque sandbox; no scripts or external assets. Not a certification.',automatic};$('#fs-audit-results').textContent=JSON.stringify(automatic,null,2);$('#fs-keyboard').hidden=false;$('#fs-export').hidden=false})
    button('#fs-keyboard',async()=>{session?.frame.focus();setStatus('请在预览中实际按 Tab / Shift+Tab，检查焦点和顺序；Esc 退出。')})
    button('#fs-export',async()=>{if(!report)throw Error('Run the audit first');const verdict=$('#fs-verdict').value;if(verdict!=='untested'&&keyboard.length<2)throw Error('Record at least two real Tab events before a manual verdict');download('accessibility-report.json',JSON.stringify({...report,keyboard:{events:keyboard,manualVerdict:verdict}},null,2),'application/json')})
  }
  if(kind==='plugins'){
    body.innerHTML='<p>导入受限声明式插件包，安装实际程序、版本、依赖和权限凭证。只支持 db-text-v1 引擎，不支持任意 JavaScript、npm、网络或系统文件访问。SHA-256 用于完整性检查，不证明作者可信。</p><button id="fs-sample">下载示例插件包</button><label>插件包<input id="fs-file" type="file" accept=".json,.dbskill"></label><button id="fs-install">审核并安装插件</button><div id="fs-plugins"></div><label>插件输入<textarea id="fs-text" rows="5"></textarea></label><label>运行结果<textarea id="fs-plugin-output" rows="6" readonly></textarea></label><button id="fs-export">下载运行结果</button>'
    let output=''
    async function refresh(){const {listPlugins}=await import('./skill-plugin-packages.js');const plugins=await listPlugins();if(dead)return;$('#fs-plugins').innerHTML=plugins.map(r=>`<article><strong translate="no">${esc(r.package.manifest.name)} · ${esc(r.package.manifest.version)}</strong><p translate="no">db-text@1.0.0 · SHA-256 ${esc(r.digest)}</p><button data-plugin-run="${esc(r.id)}">运行插件</button><button data-plugin-uninstall="${esc(r.id)}">卸载插件</button></article>`).join('')||'<p>尚未安装插件包</p>'}
    button('#fs-sample',async()=>{const {EXAMPLE_PLUGIN}=await import('./skill-plugin-packages.js');download('example.dbskill.json',JSON.stringify(EXAMPLE_PLUGIN,null,2),'application/json')})
    button('#fs-install',async()=>{const file=$('#fs-file').files[0];if(!file||file.size>512000)throw Error('Select a plugin package up to 512 KB');const {validatePlugin,pluginDigest,installPlugin,listPlugins}=await import('./skill-plugin-packages.js'),p=validatePlugin(await file.text()),digest=await pluginDigest(p),old=(await listPlugins()).find(r=>r.id===p.manifest.id);const confirmed=await confirmModal('插件安装权限确认',esc(`${p.manifest.name} · ${old?old.package.manifest.version+' → ':''}${p.manifest.version}\nEngine: db-text-v1 · Dependency: db-text@1.0.0\nPermissions: input:read, output:write\nSHA-256: ${digest}\n${uiText('仅处理你提交给插件的文字，不授予账号、网络或系统权限。', store.state.settings.language)}`),'确认安装');if(!confirmed||dead){setStatus('已取消安装');return}await installPlugin(p,digest);await refresh()})
    $('#fs-plugins').addEventListener('click',e=>{const run=e.target.closest('[data-plugin-run]'),remove=e.target.closest('[data-plugin-uninstall]');if(!run&&!remove)return;guard(async()=>{const api=await import('./skill-plugin-packages.js');if(run){output=await api.executeInstalledPlugin(run.dataset.pluginRun,$('#fs-text').value);if(!dead)$('#fs-plugin-output').value=output}else if(await confirmModal('卸载插件','删除此插件包及安装记录？','确认卸载')){await api.uninstallPlugin(remove.dataset.pluginUninstall);await refresh()}})()})
    button('#fs-export',async()=>download('plugin-output.txt',output,'text/plain'))
    guard(refresh)()
  }
  return true
}
