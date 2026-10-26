/* ============================================================
   首页选择「美化」后的工作台（按截图）
   · 头图换成紫粉渐变山丘、标题为问候语
   · 输入卡顶部虚线投放区：添加文件 PPTX DOCX PDF（真实读文件）
   · 占位文案「描述您希望更改或改进的内容」
   · 工具条：＋ / 参数 / ✨美化 × ｜ 标准 / 麦克风 / 蓝色发送
   · 输入卡下方「美化方式」三张卡，选中后真实参与生成
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

/* ---------- 1. 进入美化工作台 ---------- */

click(w, doc.querySelector('[data-quick-type="美化"]'))
await tick()

check('picking 美化 persists the type', readState(storage).ui.type === '美化')
check('beautify workbench keeps the greeting headline',
  $('.hero-title').textContent.startsWith('很高兴见到您'))
check('beautify workbench swaps the hero artwork',
  $('.hero-photo').getAttribute('src') === '/covers/hero-beautify.jpg'
  && fs.existsSync(path.join(DIST, 'covers/hero-beautify.jpg')))
check('beautify placeholder asks what to improve',
  $('#prompt-input').placeholder === '描述您希望更改或改进的内容')
check('beautify workbench keeps the back pill', $('#back-btn').hidden === false)
check('quick type row and recommended templates step aside',
  $('#quick-types').hidden === true && $('#rec-templates').hidden === true)

/* ---------- 2. 虚线投放区 ---------- */

check('dashed upload zone shows up in beautify mode', $('#beautify-drop').hidden === false)
check('upload zone offers 添加文件 plus three formats',
  [...$('#beautify-drop').querySelectorAll('.bd-fmt')].map((e) => e.textContent).join() === 'PPTX,DOCX,PDF'
  && $('#beautify-drop .bd-label')?.textContent === '添加文件')
check('upload zone accepts real deck/document files',
  ($('#beautify-file-input')?.getAttribute('accept') ?? '').includes('.pptx')
  && $('#beautify-file-input').accept.includes('.pdf'))
check('upload zone matches the screenshot styling',
  cssCompact.includes('.bd-inner{display:inline-flex')
  && cssCompact.includes('border:1pxdashed#cfd6e4')
  && cssCompact.includes('.bd-fmt{'))

const deckInput = $('#beautify-file-input')
Object.defineProperty(deckInput, 'files', {
  value: [new w.File(['pptx-bytes'], 'q3-deck.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })],
  configurable: true,
})
deckInput.dispatchEvent(new w.Event('change', { bubbles: true }))
await tick(120)
check('picking a deck really attaches it',
  [...doc.querySelectorAll('.attach-chip .chip-name')].map((n) => n.textContent).join() === 'q3-deck.pptx')
check('the attachment is announced', toasts().includes('原稿') && toasts().includes('q3-deck.pptx'))

/* ---------- 3. 工具条（截图） ---------- */

check('left toolbar is + / 美化 pill',
  [...doc.querySelector('.toolbar-left').children].map((c) => c.className.split(' ')[0]).join()
  === 'add-menu-wrap,type-menu-wrap')
check('the type pill reads 美化',
  $('#type-pill-label').textContent === '美化' && !$('#type-pill').classList.contains('is-off'))
check('right toolbar is 标准 / mic / send without the image icon',
  [...doc.querySelector('.toolbar-right').children].map((c) => c.id || c.className.split(' ')[0]).join()
  === 'img-menu-wrap,mode-menu-wrap,tool-btn,send-btn'
  && $('.img-menu-wrap').hidden === true)
check('send arrow is blue in a workbench', $('#send-btn').classList.contains('is-ready'))
check('beautify mode has no ratio / count / also-make blocks',
  $('#img-extra').hidden === true && $('#also-make').hidden === true)

/* ---------- 4. 美化方式 ---------- */

check('beautify section shows up', $('#beautify-styles').hidden === false)
check('section is titled 美化方式',
  $('#beautify-styles .section-label')?.textContent === '美化方式')
check('three beautify cards are offered',
  [...doc.querySelectorAll('[data-beautify-style]')].map((b) => b.dataset.beautifyStyle).join()
  === 'restyle,layout,copy')
check('cards carry the screenshot copy',
  [...doc.querySelectorAll('.bs-main b')].map((b) => b.textContent).join('|')
  === '更换视觉风格|重新设计布局|精简文字'
  && [...doc.querySelectorAll('.bs-main em')].map((b) => b.textContent).join('|')
  === '全新的主题、字体和配色|用更强大的布局重构卡片|标题更清晰，文案更简洁')
check('each card has an icon tile',
  [...doc.querySelectorAll('[data-beautify-style]')].every((b) => !!b.querySelector('.bs-ic .icon')))
check('cards use a two-column grid like the screenshot',
  cssCompact.includes('.bs-grid{display:grid') && cssCompact.includes('grid-template-columns:repeat(2,minmax(0,1fr))'))

click(w, doc.querySelector('[data-beautify-style="restyle"]'))
await tick()
check('picking a beautify style persists it', readState(storage).ui.beautifyStyle === 'restyle')
check('the picked card turns active',
  doc.querySelector('[data-beautify-style="restyle"]').classList.contains('is-active')
  && doc.querySelector('[data-beautify-style="restyle"]').getAttribute('aria-pressed') === 'true')
check('an empty prompt is filled with the style instruction',
  $('#prompt-input').value === '更换视觉风格：换成全新的主题、字体和配色')
check('the style pick is announced', toasts().includes('更换视觉风格'))

click(w, doc.querySelector('[data-beautify-style="restyle"]'))
await tick()
check('clicking the active card clears the style',
  readState(storage).ui.beautifyStyle === null
  && !doc.querySelector('[data-beautify-style="restyle"]').classList.contains('is-active'))

click(w, doc.querySelector('[data-beautify-style="layout"]'))
await tick()
check('switching style moves the active state',
  readState(storage).ui.beautifyStyle === 'layout'
  && doc.querySelectorAll('.bs-card.is-active').length === 1)

/* ---------- 5. 生成：真实改版清单 ---------- */

input(w, $('#prompt-input'), '把这页的版式做得更有层次')
click(w, $('#send-btn'))
await tick(3200)
const gamma = readState(storage).gammas[0]
check('creation stores the beautify style and source deck',
  gamma.type === '美化' && gamma.beautifyStyle === 'layout'
  && gamma.attachments.map((a) => a.name).join() === 'q3-deck.pptx')
const body = $('.modal-body')
check('result names the chosen style and the deck',
  body?.querySelector('.modal-copy')?.textContent.includes('重新设计布局')
  && body.querySelector('.modal-copy').textContent.includes('q3-deck.pptx'))
check('result lists concrete layout changes',
  body.querySelectorAll('.outline-list li').length === 4
  && body.textContent.includes('栅格') && body.textContent.includes('留白'))
check('each change has a bold label',
  [...body.querySelectorAll('.outline-list li strong')].map((n) => n.textContent).join('|')
  === '栅格|层级|留白|对齐')
check('the plan can be downloaded',
  [...doc.querySelectorAll('.modal-foot button')].some((b) => b.textContent.includes('下载改版清单')))
click(w, $('.modal-foot [data-done]'))
await tick()

/* ---------- 6. 换成「精简文字」是另一套真实清单 ---------- */

click(w, doc.querySelector('[data-beautify-style="copy"]'))
await tick()
input(w, $('#prompt-input'), '把这页文案压短一点')
click(w, $('#send-btn'))
await tick(3200)
const body2 = $('.modal-body')
check('a different style yields a different checklist',
  body2?.querySelector('.modal-copy')?.textContent.includes('精简文字')
  && body2.textContent.includes('每条不超过两行')
  && !body2.textContent.includes('12 栏栅格'))
click(w, $('.modal-foot [data-done]'))
await tick()

/* ---------- 7. 离开美化态 ---------- */

click(w, $('#back-btn'))
await tick()
check('back leaves beautify mode', readState(storage).ui.type === null)
check('the hero artwork goes back to the default photo',
  $('.hero-photo').getAttribute('src') === '/covers/hero.jpg')
check('the upload zone and style cards disappear',
  $('#beautify-drop').hidden === true && $('#beautify-styles').hidden === true)
check('the image icon comes back on the right',
  $('.img-menu-wrap').hidden === false)
check('default placeholder is restored',
  $('#prompt-input').placeholder.includes('LinkedIn 轮播图'))

/* ---------- 8. 不影响其它类型 ---------- */

click(w, doc.querySelector('[data-quick-type="图片"]'))
await tick()
check('图片 still has its own hero and blocks',
  $('.hero-photo').getAttribute('src') === '/covers/hero.jpg'
  && $('#img-extra').hidden === false
  && $('#beautify-drop').hidden === true && $('#beautify-styles').hidden === true)
check('beautify flow stays error-free', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} BEAUTIFY MODE CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
