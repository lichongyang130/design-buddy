// Do not silently substitute the legacy catalog for the missing authored collection.
const grid = document.querySelector('#tpl-grid');
const message = document.createElement('section');
message.setAttribute('role', 'alert');
message.style.cssText = 'grid-column:1/-1;padding:28px;border:1px solid #d5a574;background:#fff5e7;color:#653e21;border-radius:12px;line-height:1.9;max-width:850px';
message.innerHTML = '<h2 style="margin:0 0 12px;font-size:21px">模板恢复未完成，请勿将此页面视为最新版本</h2><p>上次交付的 MEASURE、CORNER LIBRARY、FOOTFALL、AFTER HOURS（各 32 页、16 张主插画）原文件尚未恢复到当前工作区。</p><p>这里不会用旧批量模板替代，也不会把缺失文件显示成已完成案例。请从原工作区快照或下载过的源码 ZIP 恢复，再运行完整性、交互和导出检查。</p><p>未清除个人作品或浏览器存储。其他模块仍可从左侧导航访问。</p>';
grid.replaceChildren(message);
document.querySelector('#tpl-empty').hidden = true;
for (const el of document.querySelectorAll('.tpl-toolbar input,.tpl-toolbar button,.filter-option input')) el.disabled = true;
