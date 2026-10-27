/* ============================================================
   引用卡片（截图）：引用文件时，
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

/* ---------- 1. 引用文件：出现卡片，带格式与类型 ---------- */

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

/* ---------- 2. @ 引用文件也能挂上卡片 ---------- */

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

/* ---------- 3. 卡片可以移除 ---------- */

const firstCard = doc.querySelector('.attach-chip.ref-card')
click(w, firstCard.querySelector('[data-rm]'))
await tick()
check('a file card can be removed',
  doc.querySelectorAll('.attach-chip.ref-card').length === countAfter - 1)
check('the cards sit above the prompt box',
  $('.attach-chips')?.nextElementSibling?.id === 'prompt-input')

/* ---------- 4. 回到默认态 ---------- */

click(w, $('#type-pill-x'))
await tick()
check('clearing the type returns to the default home',
  readState(storage).ui.type === null && $('#quick-types').hidden === false)

check('reference cards stay error-free', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} REFERENCE CARD CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
