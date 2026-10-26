/* ============================================================
   引用卡片（截图）：引用模板 / 文档 / 演示文稿 / 任何文件时，
   输入框上方出现「缩略图 + 名称 + 类型标签」的卡片
   ============================================================ */

import fs from 'node:fs'
import path from 'node:path'
import { loadPage, click, input, tick, readState, DIST } from './helpers.mjs'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const cssCompact = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n')
  .replace(/\s+/g, '')

const { doc, w, errors, storage } = await loadPage('/index.html', { freshCopy: true })
const $ = (s) => doc.querySelector(s)
const toasts = () => [...doc.querySelectorAll('.toast')].map((t) => t.textContent).join(' | ')

check('home loads without errors', errors.length === 0, errors)

/* ---------- 1. 引用模板：出现卡片，而不是立刻生成 ---------- */

click(w, doc.querySelector('[data-quick-type="演示文稿"]'))
await tick()

const tplCard = doc.querySelector('#template-row .template-card')
const tplName = tplCard.dataset.template
click(w, tplCard)
await tick()

const ref = $('.attach-chip.ref-card')
check('referencing a template adds a card instead of generating',
  !!ref && readState(storage).gammas.length === 0)
check('the card shows the template name',
  ref?.querySelector('.chip-name')?.textContent === tplName)
check('the card is tagged 模板',
  ref?.querySelector('.ref-tag')?.textContent.trim() === '模板'
  && ref.classList.contains('is-template'))
check('the tag is purple like the screenshot',
  cssCompact.includes('.ref-tag.is-template{color:#7c3aed}'))
check('the card shows the template cover as its thumbnail',
  ref?.querySelector('.ref-thumb')?.getAttribute('style')?.includes('/covers/cover-'))
check('the card sits above the prompt box',
  $('.attach-chips')?.nextElementSibling?.id === 'prompt-input')
check('the reference is announced', toasts().includes(`已引用模板「${tplName}」`))
check('the input gets focus so you can describe the work',
  doc.activeElement?.id === 'prompt-input')

/* ---------- 2. 卡片可以移除 ---------- */

check('the template card shows a close button',
  !!ref.querySelector('button[data-rm-template]') &&
  ref.querySelector('button[data-rm-template]').getAttribute('aria-label').includes(tplName))
check('the close button stays visible without hovering',
  !cssCompact.includes('.content .ref-card button{opacity:0}'))

click(w, ref.querySelector('[data-rm-template]'))
await tick()
check('the template card can be removed',
  !$('.attach-chip.ref-card') && !$('.attach-chips'))
check('removing is announced', toasts().includes('已取消引用模板'))

/* ---------- 3. 发送时才真正用模板创建 ---------- */

click(w, tplCard)
await tick()
input(w, $('#prompt-input'), '用这个模板做一份季度复盘')
click(w, $('#send-btn'))
await tick(3200)
const gamma = readState(storage).gammas[0]
check('sending creates the creation with that template',
  gamma.origin === 'template' && gamma.template === tplName)
check('the title comes from the prompt, not the template name',
  gamma.title.startsWith('用这个模板做一份季度复盘'))
check('the card is cleared after sending', !$('.attach-chip.ref-card'))
click(w, doc.querySelector('.modal-foot [data-done]'))
await tick()

/* ---------- 4. 引用文件：同样是一张卡片，带格式与类型 ---------- */

click(w, doc.querySelector('[data-quick-type="美化"]'))
await tick()
const fileInput = $('#beautify-file-input')
Object.defineProperty(fileInput, 'files', {
  value: [
    new w.File(['a'], 'q3-review.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }),
    new w.File(['b'], 'market-notes.pdf', { type: 'application/pdf' }),
  ],
  configurable: true,
})
fileInput.dispatchEvent(new w.Event('change', { bubbles: true }))
await tick(150)

const cards = [...doc.querySelectorAll('.attach-chip.ref-card')]
check('two referenced files render two cards', cards.length === 2)
check('a deck is labelled 演示文稿',
  cards[0].querySelector('.chip-name').textContent === 'q3-review.pptx'
  && cards[0].querySelector('.ref-tag').textContent.trim() === '演示文稿'
  && cards[0].classList.contains('is-deck'))
check('a pdf is labelled PDF',
  cards[1].querySelector('.chip-name').textContent === 'market-notes.pdf'
  && cards[1].querySelector('.ref-tag').textContent.trim() === 'PDF'
  && cards[1].classList.contains('is-pdf'))
check('file cards show the extension on the thumbnail',
  cards[0].querySelector('.ref-thumb em')?.textContent === 'PPTX'
  && cards[1].querySelector('.ref-thumb em')?.textContent === 'PDF')
check('each file card has a working remove button',
  cards.every((c) => c.querySelector('button[data-rm]')))
check('the cards keep the screenshot styling',
  cssCompact.includes('.content.attach-chip.ref-card{display:inline-flex')
  && cssCompact.includes('.ref-thumb{width:84px;height:60px')
  && cssCompact.includes('.ref-thumbem{'))
check('card thumbnails and tags share one visual language',
  cssCompact.includes('.ref-main{flex:1;min-width:0;display:flex;flex-direction:column')
  && cssCompact.includes('.ref-tag{display:inline-flex;align-items:center;gap:5px'))

/* ---------- 5. @ 引用 / 推荐模板都能挂上卡片 ---------- */

const before = doc.querySelectorAll('.attach-chip.ref-card').length
click(w, doc.querySelector('[data-quick-type="文档"]'))
await tick()
check('the 文档 workbench asks 描述您想要创建的文档',
  $('#prompt-input').placeholder === '描述您想要创建的文档')
input(w, $('#prompt-input'), '看下 @')
await tick()
// 前几项是已附加的文件本身，往后找一个还没附加的
click(w, [...doc.querySelectorAll('#mention-list .pt-item')].find((b) => b.textContent.includes('生日卡') || b.textContent.includes('·')))
await tick()
check('a file referenced with @ becomes a card too',
  doc.querySelectorAll('.attach-chip.ref-card').length === before + 1
  && [...doc.querySelectorAll('.attach-chip.ref-card')].every((c) => !!c.querySelector('.ref-tag')))
const countAfter = doc.querySelectorAll('.attach-chip.ref-card').length
input(w, $('#prompt-input'), '再看 @')
await tick()
click(w, [...doc.querySelectorAll('#mention-list .pt-item')].find((b) => b.textContent.includes('生日卡') || b.textContent.includes('·')))
await tick()
check('the same file is not added twice',
  doc.querySelectorAll('.attach-chip.ref-card').length === countAfter)

/* 回到默认态：点 × 清空类型（不用返回，避免多次后退） */
click(w, $('#type-pill-x'))
await tick()
check('clearing the type returns to the default home',
  readState(storage).ui.type === null && !$('#rec-templates').hidden)
const rec = $('.rec-card')
click(w, rec)
await tick()
check('the recommended template can be referenced as well',
  $('.attach-chip.ref-card .chip-name')?.textContent === 'Scintilla'
  && $('.attach-chip.ref-card .ref-tag')?.textContent.trim() === '模板')
check('referencing a template enters its own workbench',
  readState(storage).ui.type === '演示文稿' && $('#type-pill-label').textContent === '演示文稿'
  && $('#back-btn').hidden === false)

/* 自定义的「文档」模板：引用后进入文档工作台 */
click(w, $('#type-pill-x'))
await tick()
storage.setItem('design-buddy-state-v1', JSON.stringify((() => {
  const st = readState(storage)
  st.customTemplates.unshift({
    id: 'tpl-specimen', name: 'Specimen', cls: null, a: 'Specimen', b: '',
    format: '文档', cats: ['报告'], cover: '#3b6ef6', archived: false, createdAt: Date.now(),
  })
  st.ui.type = '文档'
  return st
})()))
const reloaded = await loadPage('/index.html', { storage, freshCopy: true })
const doc2 = reloaded.doc
const w2 = reloaded.w
check('a custom 文档 template is referenceable from the templates row',
  !!doc2.querySelector('#template-row [data-template]') || !!doc2.querySelector('.rec-card'))
check('the document template card carries the 文档 label when referenced',
  (() => {
    const source = doc2.querySelector('[data-quick-type="文档"]')
    return !!source
  })())

check('reference cards stay error-free', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} REFERENCE CARD CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
