/* ============================================================
   首页选择「图片」后的工作台（按截图）
   · 标题 / 占位文案 / 工具条：图片胶囊 + 1:1 + 3 + 参考图
   · 示例指令换成「给我个惊喜」等图片提示
   · 您还可以制作：信息图 / 海报 / 社交媒体帖子 / 图表
   · 比例、数量、参考方式都真实写回 store 并随创作落库
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

/* ---------- 1. 进入图片工作台 ---------- */

click(w, doc.querySelector('[data-quick-type="图片"]'))
await tick()

check('picking 图片 persists the type', readState(storage).ui.type === '图片')
check('image workbench changes the headline',
  $('.hero-title').textContent === '你的笔记，美得令人惊艳')
check('image workbench asks for an image',
  $('#prompt-input').placeholder === '描述您想要创建的图像')
check('image workbench keeps the back pill', $('#back-btn').hidden === false)
check('quick type row steps aside', $('#quick-types').hidden === true)
check('recommended templates step aside', $('#rec-templates').hidden === true)

/* ---------- 2. 工具条顺序（截图） ---------- */

const left = [...doc.querySelector('.toolbar-left').children].map((c) => c.className.split(' ')[0])
check('left toolbar is + / params / 图片 pill / ratio / count / 参考图',
  left.join() === 'add-menu-wrap,tool-btn,type-menu-wrap,img-extra')
check('ratio and count live in the image extras',
  [...$('#img-extra').children].map((c) => c.className.split(' ')[0]).join()
  === 'mini-menu-wrap,mini-menu-wrap,img-menu-wrap')
check('the 参考图 button moved into the image group and shows its label',
  $('.img-menu-wrap').parentElement.id === 'img-extra'
  && $('#img-mode-label')?.textContent === '参考图')
check('right toolbar keeps 标准 / mic / send',
  [...doc.querySelector('.toolbar-right').children].map((c) => c.id || c.className.split(' ')[0]).join()
  === 'mode-menu-wrap,tool-btn,send-btn')
check('ratio defaults to 1:1 and count to 3',
  $('#ratio-label').textContent === '1:1' && $('#count-label').textContent === '3'
  && readState(storage).ui.ratio === '1:1' && readState(storage).ui.count === 3)
check('image extras match the screenshot styling',
  cssCompact.includes('.img-extra{display:inline-flex')
  && cssCompact.includes('.is-image-mode.content.img-mode-btn[aria-expanded=true]')
  && cssCompact.includes('.mini-pill{display:inline-flex'))

/* ---------- 3. 比例 ---------- */

click(w, $('#ratio-btn'))
await tick()
check('ratio button opens its menu', !$('#ratio-pop').hidden)
check('ratio menu offers four shapes', doc.querySelectorAll('[data-ratio]').length === 4)
click(w, [...doc.querySelectorAll('[data-ratio]')].find((b) => b.dataset.ratio === '16:9'))
await tick()
check('picking a ratio persists it', readState(storage).ui.ratio === '16:9')
check('ratio label follows the pick', $('#ratio-label').textContent === '16:9')
check('ratio menu closes after picking', $('#ratio-pop').hidden)
check('ratio change is announced', toasts().includes('画面比例：16:9'))

/* ---------- 4. 数量 ---------- */

click(w, $('#count-btn'))
await tick()
check('count button opens its menu', !$('#count-pop').hidden)
click(w, [...doc.querySelectorAll('[data-count]')].find((b) => b.dataset.count === '5'))
await tick()
check('picking a count persists it', readState(storage).ui.count === 5)
check('count label follows the pick', $('#count-label').textContent === '5')
check('count change is announced', toasts().includes('5 张'))

/* ---------- 5. 参考图（截图里的下拉） ---------- */

click(w, $('#img-menu-btn'))
await tick()
check('reference button opens the reference menu', !$('#img-popover').hidden)
check('reference menu lists upload + three reference kinds',
  !!$('#img-popover [data-ref-upload]') && doc.querySelectorAll('#img-popover .ref-option').length === 3)
check('reference kinds carry the screenshot copy',
  ['风格参考', '角色参考', '内容参考'].every((t) => $('#img-popover').textContent.includes(t))
  && $('#img-popover').textContent.includes('使用图片的风格')
  && $('#img-popover').textContent.includes('使用图像中的元素'))
check('the open reference button is highlighted',
  $('#img-menu-btn').getAttribute('aria-expanded') === 'true')
click(w, [...doc.querySelectorAll('.ref-option')].find((o) => o.dataset.refType === 'content'))
await tick()
check('picking a reference kind persists it', readState(storage).ui.refType === 'content')
check('reference menu closes after picking', $('#img-popover').hidden)

/* ---------- 6. 示例指令换成图片提示 ---------- */

check('image examples use the surprise library',
  $('#example-cat-label')?.textContent === '给我个惊喜')
check('image examples carry image prompts',
  doc.querySelectorAll('.example-card').length === 4
  && $('#example-grid').textContent.includes('像素艺术')
  && $('#example-grid').textContent.includes('柠檬片'))
click(w, $('#example-cat-btn'))
await tick()
check('image library keeps four categories',
  doc.querySelectorAll('[data-example-cat]').length === 4)
click(w, [...doc.querySelectorAll('[data-example-cat]')].find((b) => b.dataset.exampleCat === '3D 渲染'))
await tick()
check('switching to another image category swaps the prompts',
  $('#example-cat-label').textContent === '3D 渲染'
  && $('#example-grid').textContent.includes('磨砂玻璃'))

/* ---------- 7. 您还可以制作 ---------- */

check('scroll-down section is visible only for images', $('#also-make').hidden === false)
check('section is titled 您还可以制作',
  $('#also-make .section-label')?.textContent === '您还可以制作')
check('four sub formats are offered',
  [...doc.querySelectorAll('[data-make]')].map((b) => b.dataset.make).join()
  === '信息图,海报,社交媒体帖子,图表')
check('each sub format explains itself',
  [...doc.querySelectorAll('[data-make] em')].map((e) => e.textContent.trim()).join('|')
  === '流程、时间线、对比|活动、促销、公告|公告、促销活动、语录卡片|流程图、循环图、思维导图')
check('each sub format has an icon tile',
  [...doc.querySelectorAll('[data-make]')].every((b) => !!b.querySelector('.also-ic .icon')))
click(w, doc.querySelector('[data-make="信息图"]'))
await tick()
check('clicking a sub format fills a real starter prompt',
  $('#prompt-input').value === '做一张信息图，内容方向：流程、时间线、对比。')
check('the clicked sub format is marked active',
  doc.querySelector('[data-make="信息图"]').classList.contains('is-active'))
check('filling a starter is announced', toasts().includes('信息图'))

/* ---------- 8. 发送：比例与数量真的跟着创作走 ---------- */

input(w, $('#prompt-input'), '一张柠檬片落入气泡水的照片，溅起的水花被高速快门定格')
click(w, $('#send-btn'))
await tick(3200)
const gamma = readState(storage).gammas[0]
check('creation stores the chosen aspect and count',
  gamma.type === '图片' && gamma.aspect === '16:9' && gamma.imageCount === 5)
check('creation stores the reference kind', gamma.refType === 'content')
const body = $('.modal-body')
check('result modal states the aspect and count',
  body?.querySelector('.modal-copy')?.textContent.includes('16:9')
  && body.querySelector('.modal-copy').textContent.includes('5 张'))
check('result lists one prompt variant per image',
  body.querySelectorAll('.outline-list li').length === 5)
check('variants are derived from the prompt',
  body.querySelectorAll('.outline-list li')[0].textContent.includes('柠檬片'))
check('variants can be exported', [...doc.querySelectorAll('.modal-foot button')].some((b) => b.textContent.includes('复制全部提示词')))
click(w, $('.modal-foot [data-done]'))
await tick()

/* ---------- 9. 回到默认态：图片专属的东西都收起 ---------- */

click(w, $('#back-btn'))
await tick()
check('back leaves image mode', readState(storage).ui.type === null)
check('image extras step out of the toolbar',
  $('#img-extra').hidden === true && !$('.toolbar-left').contains($('#img-extra')))
check('reference button returns to the right toolbar',
  $('.img-menu-wrap').parentElement.className.includes('toolbar-right'))
check('headline and placeholder go back to the default home',
  $('.hero-title').textContent.startsWith('很高兴见到您')
  && $('#prompt-input').placeholder.includes('LinkedIn 轮播图'))
check('您还可以制作 disappears outside image mode', $('#also-make').hidden === true)
check('default examples come back', $('#example-cat-label').textContent === '设计与产品')

/* ---------- 10. 其它类型不受影响 ---------- */

click(w, doc.querySelector('[data-quick-type="演示文稿"]'))
await tick()
check('演示文稿 keeps its own placeholder with no image extras',
  $('#prompt-input').placeholder === '描述您的演示主题'
  && $('#img-extra').hidden === true && $('#also-make').hidden === true)
check('演示文稿 keeps the right-hand image icon',
  $('.img-menu-wrap').parentElement.className.includes('toolbar-right'))
check('image flow stays error-free', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} IMAGE MODE CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
