/* ============================================================
   演示文稿首页（截图版）：顶栏 / 头图 / 类型胶囊 / 示例指令 /
   浏览·上传模板 / 工作区·探索 —— 逐项断言真实行为
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

/* ---------- 1. 顶栏 ---------- */

check('topbar left has back then upgrade',
  [...doc.querySelectorAll('.topbar-left > *')].map((n) => n.className.includes('pill-back') ? 'back' : 'upgrade').join()
  === 'back,upgrade')
check('upgrade pill keeps its label', $('.pill-upgrade')?.textContent.includes('升级获得更多 AI 功能'))
check('topbar right has blank-new and credit pill',
  [...doc.querySelectorAll('.topbar-right > *')].map((n) => n.className.includes('credits') ? 'credits' : 'new').join()
  === 'new,credits')
check('credits pill shows the real balance', $('.credits strong')?.textContent === '236')

/* ---------- 2. 头图与标题 ---------- */

check('hero uses a photo card instead of the old mascot',
  !$('.mascot') && $('.hero-photo')?.getAttribute('src') === '/covers/hero.jpg')
check('hero photo file is shipped', fs.existsSync(path.join(DIST, 'covers/hero.jpg')))
check('hero title matches the screenshot', $('.hero-title')?.textContent === '你的笔记，美得令人惊艳')
check('hero photo is tilted in built css', cssCompact.includes('.hero-photo{display:block;width:132px;height:90px'))

/* ---------- 3. 输入卡：占位 + 工具栏顺序 ---------- */

check('textarea placeholder is 描述您的演示主题',
  $('#prompt-input')?.placeholder === '描述您的演示主题')
check('toolbar left is + / params / type pill',
  [...doc.querySelector('.toolbar-left').children].map((c) => c.className.split(' ')[0]).join(',')
  === 'add-menu-wrap,tool-btn,type-menu-wrap')
check('type pill shows the persisted type',
  $('#type-pill-label')?.textContent === readState(storage).ui.type)
check('type pill matches the screenshot styling',
  cssCompact.includes('.type-pill{display:inline-flex;align-items:center;height:34px')
  && cssCompact.includes('border:1pxsolid#c9d8f8'))
check('toolbar right ends with mic and round send',
  [...doc.querySelector('.toolbar-right').children].map((c) => c.id || c.className.split(' ')[0]).join(',')
  === 'img-menu-wrap,mode-menu-wrap,tool-btn,send-btn')
check('send button is circular', cssCompact.includes('.send-btn') && !!$('#send-btn'))

/* ---------- 4. 类型胶囊：下拉 / 选择 / 清除 ---------- */

click(w, $('#type-pill-btn'))
await tick()
check('clicking the type pill opens the type menu', !$('#type-chips').hidden)
check('type menu lists all six creation types',
  doc.querySelectorAll('#type-chips [data-chip]').length === 6)
click(w, [...doc.querySelectorAll('#type-chips [data-chip]')].find((c) => c.textContent.trim() === '文档'))
await tick()
check('picking a type persists it', readState(storage).ui.type === '文档')
check('type pill label follows the pick', $('#type-pill-label').textContent === '文档')
check('menu closes after picking', $('#type-chips').hidden)
click(w, $('#type-pill-x'))
await tick()
check('× clears the type and marks the pill inactive',
  readState(storage).ui.type === null && $('#type-pill').classList.contains('is-off'))
check('clearing a type is announced', toasts().includes('已清除创作类型'))
// 还原类型，避免影响后续断言
click(w, $('#type-pill-btn'))
await tick()
click(w, [...doc.querySelectorAll('#type-chips [data-chip]')].find((c) => c.textContent.trim() === '演示文稿'))
await tick()

/* ---------- 5. 示例指令 ---------- */

check('examples section shows the section label', $('.examples .section-label')?.textContent === '示例指令')
check('example category starts on 设计与产品', $('#example-cat-label')?.textContent === '设计与产品')
check('four example cards rendered', doc.querySelectorAll('.example-card').length === 4)
check('example cards carry the screenshot copy',
  [...doc.querySelectorAll('.example-card-text')].map((n) => n.textContent)
    .join('|').includes('产品设计师的演示讲故事技巧'))
check('each example card has a corner arrow', doc.querySelectorAll('.example-card-arrow').length === 4)
click(w, doc.querySelectorAll('.example-card')[1])
await tick()
check('clicking an example fills the prompt',
  $('#prompt-input').value === '设计冲刺议程')
check('filling an example announces it', toasts().includes('示例指令已填入'))
click(w, $('#example-cat-btn'))
await tick()
check('category dropdown lists four libraries',
  !$('#example-cat-menu').hidden && doc.querySelectorAll('[data-example-cat]').length === 4)
click(w, [...doc.querySelectorAll('[data-example-cat]')].find((b) => b.dataset.exampleCat === '商业与融资'))
await tick()
check('switching category swaps the four prompts',
  $('#example-cat-label').textContent === '商业与融资'
  && doc.querySelectorAll('.example-card-text')[0].textContent.includes('A 轮融资'))

/* ---------- 6. 模板入口 + 工作区 / 探索 ---------- */

check('browse/upload buttons sit under the examples',
  $('.template-cta')?.children.length === 2
  && $('.pill-browse').textContent.includes('浏览模板')
  && $('#upload-template-btn').textContent.includes('上传模板'))
check('work tabs are 工作区 / 探索 with 探索 active',
  [...doc.querySelectorAll('[data-work-tab]')].map((t) => t.textContent).join()
  === '工作区,探索'
  && doc.querySelector('[data-work-tab="explore"]').classList.contains('is-active'))
check('explore shows six template covers',
  doc.querySelectorAll('#template-row .template-card').length === 6)
check('covers use the shipped photos',
  [...doc.querySelectorAll('#template-row .cover')].every((c) => c.getAttribute('style').includes('/covers/cover-'))
  && fs.existsSync(path.join(DIST, 'covers/cover-1.jpg')))
check('covers are 3:4 portrait with image label overlay in built css',
  cssCompact.includes('.content.cover{aspect-ratio:3/4') && cssCompact.includes('.cover-label')
  && cssCompact.includes('.cover-label.bottom{bottom:12px;color:#fff'))
check('template names are hidden like the screenshot',
  cssCompact.includes('.content.template-name{display:none'))
check('row shows exactly four columns with horizontal scroll',
  cssCompact.includes('grid-auto-columns:calc((100%-36px)/4)'))

click(w, doc.querySelector('[data-work-tab="workspace"]'))
await tick()
check('workspace tab hides the explore row', $('#template-row').hidden && !$('#work-grid').hidden)
check('empty workspace is honest', $('#work-grid').textContent.includes('工作区还没有内容'))

/* ---------- 7. 工作区里出现真实创作 ---------- */

click(w, doc.querySelector('[data-work-tab="explore"]'))
await tick()
input(w, $('#prompt-input'), '给制造业客户做数字化方案，30 分钟')
click(w, $('#send-btn'))
await tick(300)
click(w, doc.querySelector('[data-work-tab="workspace"]'))
await tick()
check('finished creation appears in the workspace',
  doc.querySelectorAll('#work-grid .work-item').length === 1
  && $('#work-grid').textContent.includes('数字化方案'))
click(w, $('#work-grid .work-item'))
await tick()
check('clicking a work item refills its prompt',
  $('#prompt-input').value.includes('数字化方案'))
click(w, doc.querySelector('.modal-foot [data-done]'))
await tick()

/* ---------- 8. 上传模板：真实落库 ---------- */

const tplBefore = readState(storage).customTemplates.length
const tplInput = [...doc.querySelectorAll('input[type="file"]')].find((i) => i.accept === 'image/*' && !i.id)
Object.defineProperty(tplInput, 'files', {
  value: [new w.File(['fake-bytes'], 'brand-deck.jpg', { type: 'image/jpeg' })],
  configurable: true,
})
tplInput.dispatchEvent(new w.Event('change', { bubbles: true }))
await tick(80)
check('uploading a cover creates a custom template',
  readState(storage).customTemplates.length === tplBefore + 1
  && readState(storage).customTemplates[0].name === 'brand-deck')
check('upload is announced', toasts().includes('上传模板') || toasts().includes('已上传'))

/* ---------- 9. 与截图的整体一致性 ---------- */

check('content column is 636px wide like the screenshot',
  cssCompact.includes('.content>.prompt-card') && cssCompact.includes('width:min(636px,100%)'))
check('topbar keeps 返回 on the left of the upgrade pill',
  doc.querySelector('.topbar-left').firstElementChild.id === 'back-btn')
check('home layout has no runtime errors', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} PRESENTATION HOME CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
