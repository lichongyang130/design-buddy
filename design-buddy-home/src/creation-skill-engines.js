// Offline inspection only. User HTML is parsed in an inert template: no scripts, requests or document insertion.
const parseHTML = input => {
  if (typeof document === 'undefined') throw Error('HTML 检查需要浏览器的静态解析器')
  const template = document.createElement('template')
  template.innerHTML = input
  return template.content
}
const headingIssues = headings => {
  const issues = [], seen = new Set()
  if (!headings.length) issues.push({ level: 'med', text: '没有识别到标题，请使用 Markdown 标题或 HTML h1–h6。' })
  let previous = 0
  for (const h of headings) {
    if (h.level > previous + 1) issues.push({ level: 'med', text: `标题层级跳跃：${h.text || '（空标题）'}` })
    if (!h.text) issues.push({ level: 'med', text: '存在空标题。' })
    const canonical = h.text.toLocaleLowerCase()
    if (canonical && seen.has(canonical)) issues.push({ level: 'med', text: `重复标题：${h.text}` })
    if (canonical) seen.add(canonical)
    previous = h.level
  }
  if (headings.filter(h => h.level === 1).length > 1) issues.push({ level: 'med', text: '存在多个一级标题，请确认它们是否代表不同文档。' })
  return issues
}
function report(kind, title, summary, stats, blocks, findings, data) {
  const issues = findings.length ? findings : [{ level: 'low', text: '未命中当前静态检查规则；这不等于完整验收通过。' }]
  return { kind, title, summary, stats, blocks, findings: issues, artifacts: [
    { name: `${kind}.json`, mime: 'application/json', content: JSON.stringify({ title, summary, ...data, findings: issues }, null, 2) },
    { name: `${kind}.md`, mime: 'text/markdown', content: `# ${title}\n\n${summary}\n\n${issues.map(f => '- ' + f.text).join('\n')}\n` },
  ] }
}
export function documentStructureEngine(ctx, input) {
  const text = String(input)
  const withoutCode = text.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, block => block.replace(/[^\n]/g, ''))
  const html = /^\s*</.test(withoutCode) && /<h[1-6][\s>]/i.test(withoutCode)
  const headings = html
    ? [...parseHTML(text).querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({ level: Number(h.tagName[1]), text: h.textContent.trim() }))
    : withoutCode.split('\n').flatMap((line, i) => { const m = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/); return m ? [{ level: m[1].length, text: m[2].trim(), line: i + 1 }] : [] })
  const findings = headingIssues(headings)
  const placeholders = [...withoutCode.matchAll(/\b(?:TODO|TBD|FIXME)\b|\{\{[^{}\n]+\}\}|待补充|待填写/gi)].map(m => m[0])
  if (placeholders.length) findings.push({ level: 'high', text: `识别到 ${placeholders.length} 个疑似待填项，请逐个核对。` })
  const paragraphs = html ? [...parseHTML(text).querySelectorAll('p')].map(p => p.textContent) : withoutCode.split(/\n\s*\n/)
  const longParagraphs = paragraphs.filter(p => p.trim().length > 500).length
  if (longParagraphs) findings.push({ level: 'med', text: `${longParagraphs} 个段落超过 500 字符，建议拆分。` })
  return report('document-structure', '文档结构检查', '检查粘贴内容的结构，不计算实际 Word/PDF 页数，不修改原文。', [
    { label: '标题', value: String(headings.length) }, { label: '待填项', value: String(placeholders.length) },
  ], [{ type: 'table', title: '标题目录', head: ['层级', '标题'], rows: headings.map(h => [String(h.level), h.text]) }], findings, { headings, placeholders, longParagraphs })
}
export function accessibilityEngine(ctx, input) {
  const root = parseHTML(String(input)), findings = []
  if (!root.querySelector('*')) return report('accessibility', '页面可访问性检查', '未执行 HTML 检查。', [], [], [{ level: 'high', text: '请粘贴 HTML 源码，不是自然语言需求。' }], { checked: [] })
  const ids = new Map([...root.querySelectorAll('[id]')].map(el => [el.id, el]))
  const nameOf = el => el.getAttribute('aria-label')?.trim()
    || (el.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => ids.get(id)?.textContent?.trim() || '').join(' ').trim()
    || el.textContent.trim() || el.querySelector('img[alt]')?.getAttribute('alt')?.trim() || el.getAttribute('title')?.trim()
  for (const img of root.querySelectorAll('img')) if (!img.hasAttribute('alt')) findings.push({ level: 'high', text: '图片缺少 alt 属性；装饰图可显式设置 alt=""。' })
  for (const el of root.querySelectorAll('button,a[href],[role="button"]')) {
    if (!nameOf(el)) findings.push({ level: 'high', text: `${el.tagName.toLowerCase()} 缺少可识别名称。` })
  }
  for (const el of root.querySelectorAll('input,select,textarea')) {
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(el.getAttribute('type')?.toLowerCase())) continue
    const label = el.id && [...root.querySelectorAll('label[for]')].some(l => l.htmlFor === el.id && l.textContent.trim())
    if (!label && !el.closest('label')?.textContent.trim() && !el.getAttribute('aria-label')?.trim()
      && !(el.getAttribute('aria-labelledby') || '').split(/\s+/).some(id => ids.get(id)?.textContent.trim()) && !el.getAttribute('title')?.trim()) findings.push({ level: 'high', text: '表单控件缺少标签；placeholder 不能代替标签。' })
  }
  const headings = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({ level: Number(h.tagName[1]), text: h.textContent.trim() }))
  findings.push(...headingIssues(headings))
  const allIds = [...root.querySelectorAll('[id]')].map(el => el.id).filter(Boolean)
  if (new Set(allIds).size !== allIds.length) findings.push({ level: 'high', text: '存在重复 id，可能影响标签与控件关联。' })
  return report('accessibility', '页面可访问性检查', '仅检查静态 HTML，不执行脚本、不测量颜色对比度、不检查键盘和读屏实际行为；不是 WCAG 合规认证。', [
    { label: '图片', value: String(root.querySelectorAll('img').length) }, { label: '控件', value: String(root.querySelectorAll('input,select,textarea,button').length) },
  ], [{ type: 'list', title: '仍需人工验证', items: ['键盘操作与焦点顺序', '读屏行为与动态状态播报', '实际配色对比度与缩放后的布局'] }], findings, { headings, checked: ['alt', 'control-label', 'accessible-name', 'heading-order', 'duplicate-id'] })
}
export function assetInventoryEngine(ctx, input) {
  const text = String(input), references = [], add = (type, raw) => {
    const value = String(raw || '').trim()
    if (!value || value.startsWith('#')) return
    // Do not expose huge inline files or pretend their presence is an independent authored illustration.
    references.push({ type, url: /^data:/i.test(value) ? '[inline data]' : value, scope: /^https?:\/\//i.test(value) || value.startsWith('//') ? 'external' : /^data:/i.test(value) ? 'inline' : /^[a-z][\w+.-]*:/i.test(value) ? 'scheme' : 'relative' })
  }
  if (/<[a-z][\s\S]*>/i.test(text)) {
    const root = parseHTML(text)
    for (const [selector, attr, type] of [['img[src]', 'src', 'image'], ['source[src]', 'src', 'media'], ['video[src]', 'src', 'media'], ['video[poster]', 'poster', 'image'], ['audio[src]', 'src', 'media'], ['script[src]', 'src', 'script'], ['link[href]', 'href', 'stylesheet/link'], ['a[href]', 'href', 'link']]) {
      for (const el of root.querySelectorAll(selector)) add(type, el.getAttribute(attr))
    }
    for (const el of root.querySelectorAll('[srcset]')) {
      const value = el.getAttribute('srcset')
      if (/^data:/i.test(value.trim())) add('image', value)
      else for (const item of value.split(',')) add('image', item.trim().split(/\s+/)[0])
    }
    for (const el of root.querySelectorAll('[style],style')) {
      const css = el.tagName === 'STYLE' ? el.textContent : el.getAttribute('style')
      for (const m of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/gi)) add('css-resource', m[1])
    }
  } else {
    for (const m of text.matchAll(/(!?)\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+"[^"]*")?\s*\)/g)) add(m[1] ? 'image' : 'link', m[2])
  }
  const unique = [...new Map(references.map(r => [r.type + '\0' + r.url, r])).values()]
  const findings = []
  if (unique.some(r => r.scope === 'external')) findings.push({ level: 'med', text: '包含外部资源；离线交付前需确认可用性、许可并按需本地化。' })
  if (unique.some(r => /^(?:javascript|vbscript):/i.test(r.url))) findings.push({ level: 'high', text: '发现脚本协议引用，请在发布前移除或人工审查。' })
  return report('asset-inventory', '素材引用清单', '按类型与原始路径去重，不下载资源，不判断版权、文件是否存在或引用是否有效。相对路径不自动解析，内联数据只标记存在。', [
    { label: '引用次数', value: String(references.length) }, { label: '去重引用', value: String(unique.length) },
  ], [{ type: 'table', title: '资源引用', head: ['类型', '路径', '范围'], rows: unique.map(r => [r.type, r.url, r.scope]) }], findings, { references: unique, occurrenceCount: references.length })
}
