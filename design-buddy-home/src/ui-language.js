// Local, deterministic UI translations. No network, generated/user content, input values or stored IDs are translated.
import { DICT, LANG_HTML } from './i18n.js'
import extra from './ui-language-generated.js'
const entries = [...Object.values(DICT), ...extra]
const index = new Map()
for (const entry of entries) for (const text of Object.values(entry)) if (!index.has(text)) index.set(text, entry)
const key = language => LANG_HTML[language] === 'zh-CN' ? 'zh' : (LANG_HTML[language] || 'zh')
export const sourceText = text => index.get(text)?.zh ?? text
const patterns = entries.filter(entry => entry.zh?.includes('{')).map(entry => {
  const names = [], escaped = entry.zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = escaped.replace(/\\\{(\w+)\\\}/g, (_, name) => { names.push(name); return '(.+?)' })
  return { entry, names, regex: new RegExp('^' + pattern + '$') }
})
export function uiText(text, language = '简体中文', depth = 0) {
  const entry = index.get(text)
  if (entry) return entry[key(language)] ?? entry.zh ?? text
  if (depth > 3) return text
  for (const { entry, names, regex } of patterns) {
    const match = text.match(regex)
    if (!match) continue
    const values = Object.fromEntries(names.map((name, i) => [name, match[i + 1]]))
    return (entry[key(language)] ?? entry.zh).replace(/\{(\w+)\}/g, (_, name) => {
      const value = values[name]
      const translateValue = ['category', 'format', 'status', 'names'].includes(name) || /所属专家|的核心能力/.test(entry.zh)
      if (!translateValue) return value
      return value.split('、').map(part => uiText(part, language, depth + 1)).join(key(language) === 'en' ? ', ' : '、')
    })
  }
  return text
}
// Content is deliberately out of scope: these are authored documents, identities or editable/user-provided data.
const excluded = 'script,style,pre,code,[contenteditable],#canvas,[data-no-i18n],[translate="no"],[data-select-kind="language"],.gamma-title,.workspace-name,.ws-head-name,.detail-title,.custom-model-label,.avatar,.question-chat,.chat-messages,.ex-card-desc-user,[data-conv] .primary,.ws-name,.ws-item-name,.user-name,.profile-name,.theme-name,.lb-name,.ws-switch-row .primary,.rebuild-card h3,.account-name,.account-email'
const records = new WeakMap()
export function localizeUI(root = document, language = '简体中文') {
  const doc = root.ownerDocument || root
  if (doc.documentElement) doc.documentElement.lang = LANG_HTML[language] || 'zh-CN'
  function protectedElement(el) { return !el || el.closest(excluded) }
  function translate(value) {
    const trimmed = value.trim(), translated = uiText(trimmed, language)
    return value.replace(trimmed, translated)
  }
  function updateText(node) {
    if (protectedElement(node.parentElement) || node.parentElement.tagName === 'TEXTAREA') return
    const current = node.nodeValue, previous = records.get(node)
    const source = previous?.last === current ? previous.source : current
    let next = translate(source)
    if (node.parentElement.closest('.sk-logo') && key(language) !== 'zh') {
      const title = node.parentElement.closest('.sk-card-top')?.querySelector('.sk-card-title')?.firstChild?.textContent?.trim()
      if (title) next = Array.from(uiText(title, language))[0]
    }
    // Native options without explicit values must keep their original canonical value.
    if (node.parentElement.tagName === 'OPTION' && !node.parentElement.hasAttribute('value')) node.parentElement.value = node.parentElement.textContent
    if (current !== next) node.nodeValue = next
    records.set(node, { source, last: next })
  }
  if (root.nodeType === 3) return updateText(root)
  const walker = doc.createTreeWalker(root, 4)
  let node
  while ((node = walker.nextNode())) updateText(node)
  const elements = root.querySelectorAll('[placeholder],[title],[aria-label]')
  for (const el of elements) {
    if (protectedElement(el)) continue
    let attributes = records.get(el)
    if (!attributes) records.set(el, attributes = {})
    for (const name of ['placeholder', 'title', 'aria-label']) {
      if (!el.hasAttribute(name) || (name === 'title' && el.hasAttribute('data-model'))) continue
      const current = el.getAttribute(name), previous = attributes[name]
      const source = previous?.last === current ? previous.source : current, next = translate(source)
      if (next !== current) el.setAttribute(name, next)
      attributes[name] = { source, last: next }
    }
  }
}
export function watchUILanguage(getLanguage, root = document) {
  const win = (root.ownerDocument || root).defaultView
  let queued = false, stopped = false
  const observer = new win.MutationObserver(schedule)
  const config = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] }
  function refresh() {
    queued = false
    if (stopped) return
    observer.disconnect()
    try { localizeUI(root, getLanguage()) } finally { observer.observe(root, config) }
  }
  function schedule() {
    if (queued || stopped) return
    queued = true
    queueMicrotask(refresh)
  }
  refresh()
  return { refresh, stop() { stopped = true; observer.disconnect() } }
}
