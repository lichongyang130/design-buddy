/* ============================================================
   首页两种状态（按截图）：
   · 默认态：头图 + 问候语 + 输入卡 + 六种类型 + 推荐模板
   · 工作台态（选中演示文稿）：返回 + 类型胶囊 + 示例指令 +
     浏览·上传模板 + 工作区 / 探索
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

/* ============ 默认态（第一张截图） ============ */

/* ---------- 1. 顶栏 ---------- */

check('topbar left keeps back then upgrade in order',
  [...doc.querySelectorAll('.topbar-left > *')].map((n) => n.className.includes('pill-back') ? 'back' : 'upgrade').join()
  === 'back,upgrade')
check('default state hides the back pill', $('#back-btn').hidden === true)
check('upgrade pill keeps its label', $('.pill-upgrade')?.textContent.includes('升级获得更多 AI 功能'))
check('topbar right no longer has blank-new and credit pill',
  [...doc.querySelectorAll('.topbar-right > *')].length === 0)
check('credits pill removed from topbar', !$('.credits strong'))

/* ---------- 2. 头图与问候语 ---------- */

check('hero uses the photo card', $('.hero-photo')?.getAttribute('src') === '/covers/hero.jpg')
check('hero photo file is shipped', fs.existsSync(path.join(DIST, 'covers/hero.jpg')))
check('hero greets the signed-in user', $('.hero-title')?.textContent === 'DesignBuddy 让您提前下班')
check('hero photo is the small tilted card from the screenshot',
  cssCompact.includes('.hero-photo{display:block;width:100px;height:64px')
  && cssCompact.includes('rotate(-7deg)'))

/* ---------- 3. 默认态的输入卡 ---------- */

check('default placeholder is the LinkedIn carousel brief',
  $('#prompt-input')?.placeholder.includes('LinkedIn 轮播图')
  && $('#prompt-input')?.placeholder.includes('行动号召'))
check('toolbar left is only + and type-menu in the default state (params button removed)',
  [...doc.querySelector('.toolbar-left').children].map((c) => c.hidden ? `${c.className.split(' ')[0]}:hidden` : c.className.split(' ')[0]).join(',')
  === 'add-menu-wrap,type-menu-wrap:hidden')
check('toolbar right ends with mic and round send',
  [...doc.querySelector('.toolbar-right').children].map((c) => c.id || c.className.split(' ')[0]).join(',')
  === 'img-menu-wrap,mode-menu-wrap,tool-btn,send-btn')
check('send arrow stays grey while the box is empty',
  $('#send-btn').disabled === true && !$('#send-btn').classList.contains('is-ready'))

/* ---------- 4. 默认态的六个类型胶囊 ---------- */

check('six creation types are offered under the input',
  [...doc.querySelectorAll('[data-quick-type]')].map((b) => b.dataset.quickType).join()
  === '演示文稿,文档,轮播图,图片,美化,导入')
check('each quick type carries an icon', [...doc.querySelectorAll('[data-quick-type]')].every((b) => !!b.querySelector('svg')))
check('quick type chips are visible by default', !$('#quick-types').hidden)
check('nothing is preselected', readState(storage).ui.type === null)

/* ---------- 5. 默认态的推荐模板 ---------- */

check('recommended template block is visible', !$('#rec-templates').hidden)
check('recommended block is labelled 推荐模板',
  $('#rec-templates .rec-label')?.textContent === '推荐模板')
check('recommended grid shows eight cards in two rows of four',
  doc.querySelectorAll('#rec-templates .rec-card').length === 8
  && cssCompact.includes('grid-template-columns:repeat(4,minmax(0,1fr))'))
check('recommended card is the Scintilla template',
  $('#rec-templates .rec-card')?.dataset.template === 'Scintilla'
  && $('#rec-templates .template-name')?.textContent === 'Scintilla')
check('recommended card ships a real cover', cssCompact.includes('.rec-cover') && cssCompact.includes('.rec-cover-a'))
check('view-all button exists', $('#view-all-templates')?.textContent.includes('查看所有模板'))

/* ---------- 6. 默认态收起工作台区块 ---------- */

check('examples are hidden until a type is picked', $('.examples').hidden === true)
check('browse/upload buttons are hidden until a type is picked', $('.template-cta').hidden === true)
check('work tabs are hidden until a type is picked', $('.work-tabs').hidden === true)
check('explore row is hidden until a type is picked', $('#template-row').hidden === true)

/* ============ 切到演示文稿（第二张截图） ============ */

click(w, [...doc.querySelectorAll('[data-quick-type]')].find((b) => b.dataset.quickType === '演示文稿'))
await tick()

check('picking 演示文稿 persists the type', readState(storage).ui.type === '演示文稿')
check('picking a type is announced', toasts().includes('演示文稿'))
check('back pill appears in the workbench', $('#back-btn').hidden === false)
check('quick type row steps aside', $('#quick-types').hidden === true)
check('recommended block steps aside', $('#rec-templates').hidden === true)

/* ---------- 7. 工作台输入卡 ---------- */

check('workbench placeholder is 描述您的演示主题',
  $('#prompt-input').placeholder === '描述您的演示主题')
check('type pill shows the chosen type',
  $('#type-pill-label')?.textContent === '演示文稿' && !$('#type-pill').classList.contains('is-off'))
check('type pill is visible in the toolbar', $('.type-menu-wrap').hidden === false)
check('type pill matches the screenshot styling',
  cssCompact.includes('.type-pill{display:inline-flex;align-items:center;height:34px')
  && cssCompact.includes('border:1pxsolid#c9d8f8'))
check('send arrow is blue even before typing',
  $('#send-btn').disabled === false && $('#send-btn').classList.contains('is-ready'))
check('the prompt card focus ring never blocks clicks inside the card',
  (cssCompact.match(/\.prompt-card:+before\{[^}]*\}/) ?? [''])[0].includes('pointer-events:none'))

/* ---------- 8. 类型胶囊下拉 / 切换 / 清除 ---------- */

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
click(w, [...doc.querySelectorAll('#type-chips [data-chip]')].find((c) => c.textContent.trim() === '演示文稿'))
await tick()

/* ---------- 9. 示例指令 ---------- */

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

/* ---------- 10. 浏览·上传模板 + 工作区 / 探索 ---------- */

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
check('covers are 16:9 like the screenshot',
  cssCompact.includes('.content.cover{aspect-ratio:16/9') && cssCompact.includes('.cover-label'))
check('template names are hidden like the screenshot',
  cssCompact.includes('.content.template-name{display:none'))
check('row shows exactly four columns with horizontal scroll',
  cssCompact.includes('grid-auto-columns:calc((100%-36px)/4)'))

click(w, doc.querySelector('[data-work-tab="workspace"]'))
await tick()
check('workspace tab hides the explore row', $('#template-row').hidden && !$('#work-grid').hidden)
check('empty workspace is honest', $('#work-grid').textContent.includes('工作区还没有内容'))

/* ---------- 11. 工作区里出现真实创作 ---------- */

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

/* ---------- 12. 上传模板：真实落库 ---------- */

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

/* ---------- 13. × 清空 / 返回：都回到默认态 ---------- */

click(w, $('#type-pill-x'))
await tick()
check('× clears the type', readState(storage).ui.type === null)
check('× brings the default home back',
  !$('#quick-types').hidden && !$('#rec-templates').hidden
  && $('.examples').hidden && $('.template-cta').hidden && $('#template-row').hidden)
check('× is announced', toasts().includes('已回到首页'))

click(w, [...doc.querySelectorAll('[data-quick-type]')].find((b) => b.dataset.quickType === '文档'))
await tick()
check('another type enters its own workbench',
  readState(storage).ui.type === '文档' && $('#type-pill-label').textContent === '文档'
  && $('#back-btn').hidden === false)
click(w, $('#back-btn'))
await tick()
check('back from the workbench returns to the default home',
  readState(storage).ui.type === null && !$('#quick-types').hidden && $('#back-btn').hidden === true)

/* ---------- 14. 与截图的整体一致性 ---------- */

check('content column is 592px wide like the screenshot',
  cssCompact.includes('.content>.prompt-card') && cssCompact.includes('width:min(592px,100%)'))
check('default home has no runtime errors', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} PRESENTATION HOME CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
