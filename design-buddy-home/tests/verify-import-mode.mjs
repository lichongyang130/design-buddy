/* ============================================================
   首页选择「导入」后的工作台（按截图）
   · 头图换成紫粉渐变山丘，标题保持问候语
   · 输入卡顶部虚线投放区：添加文件 PPTX DOCX PDF（真实读文件）
   · 占位文案「添加要导入的文件，或从下方选择任务」
   · 工具条：＋ / 参数 / 导入 × ｜ 标准 / 麦克风 / 蓝色发送
   · 更多选择：导入模板（真实新建可复用模板）
   · 提示：使用连接器从您喜爱的工具中导入 + 品牌小标（点选设为来源）
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

/* ---------- 1. 进入导入工作台 ---------- */

click(w, doc.querySelector('[data-quick-type="导入"]'))
await tick()

check('picking 导入 persists the type', readState(storage).ui.type === '导入')
check('import workbench keeps the greeting headline',
  $('.hero-title').textContent.startsWith('很高兴见到您'))
check('import workbench uses the same artwork as the screenshot',
  $('.hero-photo').getAttribute('src') === '/covers/hero-beautify.jpg')
check('import placeholder matches the screenshot',
  $('#prompt-input').placeholder === '添加要导入的文件，或从下方选择任务')
check('quick types and recommended templates step aside',
  $('#quick-types').hidden === true && $('#rec-templates').hidden === true)

/* ---------- 2. 虚线投放区 ---------- */

check('dashed upload zone is shown', $('#import-drop').hidden === false)
check('upload zone offers 添加文件 plus three formats',
  $('#import-drop .bd-label')?.textContent === '添加文件'
  && [...$('#import-drop').querySelectorAll('.bd-fmt')].map((e) => e.textContent).join() === 'PPTX,DOCX,PDF')
check('upload zone accepts the three formats plus office files',
  ['.pptx', '.docx', '.pdf'].every((ext) => $('#import-file-input').accept.includes(ext)))

const fileInput = $('#import-file-input')
Object.defineProperty(fileInput, 'files', {
  value: [
    new w.File(['deck'], 'q3-review.pptx', { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }),
    new w.File(['pdf'], 'market-report.pdf', { type: 'application/pdf' }),
  ],
  configurable: true,
})
fileInput.dispatchEvent(new w.Event('change', { bubbles: true }))
await tick(120)
check('picked files really become attachments',
  [...doc.querySelectorAll('.attach-chip .chip-name')].map((n) => n.textContent).join() === 'q3-review.pptx,market-report.pdf')
check('the import upload is announced',
  toasts().includes('2 个文件') && toasts().includes('q3-review.pptx'))

/* ---------- 3. 工具条（截图） ---------- */

check('left toolbar is + / params / 导入 pill',
  [...doc.querySelector('.toolbar-left').children].map((c) => c.className.split(' ')[0]).join()
  === 'add-menu-wrap,tool-btn,type-menu-wrap')
check('the type pill reads 导入 with a download icon',
  $('#type-pill-label').textContent === '导入'
  && $('#type-pill-icon').innerHTML.includes('12" y1="15" x2="12" y2="3"'))
check('right toolbar keeps 标准 / mic / send but hides the image icon',
  $('.img-menu-wrap').hidden === true
  && [...doc.querySelector('.toolbar-right').children].map((c) => c.className.split(' ')[0]).join()
  === 'img-menu-wrap,mode-menu-wrap,tool-btn,send-btn')
check('send arrow is blue in the workbench', $('#send-btn').classList.contains('is-ready'))
check('import mode hides examples / templates / tabs',
  $('.examples').hidden === true && $('.template-cta').hidden === true
  && $('.work-tabs').hidden === true && $('#template-row').hidden === true)

/* ---------- 4. 更多选择 ---------- */

check('more-choices section is visible', $('#import-choices').hidden === false)
check('section is titled 更多选择',
  $('#import-choices .section-label')?.textContent === '更多选择')
check('the only card is 导入模板 / 创建可复用的工作区模板',
  $('#import-choices [data-import-template] b')?.textContent === '导入模板'
  && $('#import-choices [data-import-template] em')?.textContent === '创建可复用的工作区模板')
check('the card has an icon tile', !!$('[data-import-template] .ic-ic .icon'))
check('more-choices keeps the screenshot two-column grid',
  cssCompact.includes('.ic-grid{display:grid') && cssCompact.includes('.ic-card{display:flex'))

/* ---------- 5. 连接器提示 ---------- */

check('hint line matches the screenshot',
  $('.import-hint span')?.textContent === '提示：使用连接器从您喜爱的工具中导入。')
check('hint shows five brand marks',
  doc.querySelectorAll('#import-sources .is-logo').length === 5)
check('brand marks are real connectors from the store/catalog',
  [...doc.querySelectorAll('#import-sources .is-logo')].every((b) => {
    const name = b.dataset.importConnector
    return !!name && b.querySelector('svg')
  }))
check('brand marks use their brand colour',
  doc.querySelector('#import-sources .is-logo').getAttribute('style')?.includes('--c:'))

const firstLogo = doc.querySelector('#import-sources .is-logo')
const firstName = firstLogo.dataset.importConnector
click(w, firstLogo)
await tick()
check('clicking a brand mark sets the import source',
  readState(storage).ui.importSource === firstName)
check('the picked mark turns active',
  doc.querySelector('#import-sources .is-logo.is-active')?.dataset.importConnector === firstName)
check('choosing a source is announced', toasts().includes(`导入来源：${firstName}`))

/* ---------- 6. 导入模板：真的建一个模板 ---------- */

const before = readState(storage).customTemplates.length
click(w, $('[data-import-template]'))
await tick()
check('the template card opens a real dialog',
  doc.querySelector('.modal-head h3')?.textContent === '导入模板')
doc.querySelector('#it-name').value = '季度经营分析'
doc.querySelector('#it-cats').value = '报告, 商业规划'
click(w, doc.querySelector('.modal-foot [data-ok]'))
await tick()
const templates = readState(storage).customTemplates
check('saving really adds a reusable template',
  templates.length === before + 1 && templates[0].name === '季度经营分析')
check('the saved template keeps its categories',
  templates[0].cats.join() === '报告,商业规划')
check('saving is announced', toasts().includes('季度经营分析'))

/* ---------- 7. 没文件时不许假装导入 ---------- */

while (doc.querySelector('.attach-chip button')) {
  click(w, doc.querySelector('.attach-chip button'))
  await tick()
}
check('attachments can be cleared before the next try',
  doc.querySelectorAll('.attach-chip').length === 0)
input(w, $('#prompt-input'), '帮我把这批材料整理进工作区')
click(w, $('#send-btn'))
await tick()
check('empty import is refused honestly',
  toasts().includes('先在上方添加要导入的文件')
  && doc.querySelectorAll('.modal-mask').length === 0)

/* ---------- 8. 真实生成导入清单 ---------- */

Object.defineProperty(fileInput, 'files', {
  value: [new w.File(['pdf'], 'market-report.pdf', { type: 'application/pdf' })],
  configurable: true,
})
fileInput.dispatchEvent(new w.Event('change', { bubbles: true }))
await tick(120)
input(w, $('#prompt-input'), '帮我把这批材料整理进工作区')
click(w, $('#send-btn'))
await tick(3200)

const gamma = readState(storage).gammas[0]
check('creation stores the import source and files',
  gamma.type === '导入' && gamma.importSource === firstName
  && gamma.attachments.map((a) => a.name).join() === 'market-report.pdf')
const body = $('.modal-body')
check('result names the source and the file count',
  body?.querySelector('.modal-copy')?.textContent.includes(firstName)
  && body.querySelector('.modal-copy').textContent.includes('1 个文件'))
check('result lists real checks',
  body.querySelectorAll('.outline-list li').length === 4
  && body.textContent.includes('文件读取') && body.textContent.includes('PDF'))
check('the manifest can be downloaded',
  [...doc.querySelectorAll('.modal-foot button')].some((b) => b.textContent.includes('下载导入清单')))
click(w, $('.modal-foot [data-done]'))
await tick()

/* ---------- 9. 离开导入态 ---------- */

click(w, $('#back-btn'))
await tick()
check('back leaves import mode', readState(storage).ui.type === null)
check('import blocks disappear',
  $('#import-drop').hidden === true && $('#import-choices').hidden === true)
check('the image icon returns and the hero resets',
  $('.img-menu-wrap').hidden === false
  && $('.hero-photo').getAttribute('src') === '/covers/hero.jpg')
check('default placeholder is restored',
  $('#prompt-input').placeholder.includes('LinkedIn 轮播图'))

/* ---------- 10. 与其它工作台互不串味 ---------- */

click(w, doc.querySelector('[data-quick-type="美化"]'))
await tick()
check('美化 does not show the import blocks',
  $('#import-drop').hidden === true && $('#import-choices').hidden === true
  && $('#beautify-drop').hidden === false)
click(w, doc.querySelector('[data-quick-type="图片"]'))
await tick()
check('图片 keeps its own extras only',
  $('#import-drop').hidden === true && $('#img-extra').hidden === false
  && $('#also-make').hidden === false)
check('import flow stays error-free', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} IMPORT MODE CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
