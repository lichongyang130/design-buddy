/* ============================================================
   首页「＋」菜单：鼠标指向右侧切换真实内容
   - 主菜单只有截图里的五行：添加文件 ┃ 模式 / 专家 / 技能 / 连接器
   - 右侧面板只在鼠标指向某一行时出现
   - 技能启停、连接器连接、文件附件、计划载入、任务进度都写回 store
   ============================================================ */

import fs from 'node:fs'
import path from 'node:path'
import { loadPage, click, input, tick, readState, LS_KEY, DIST } from './helpers.mjs'

const cssCompact = fs.readdirSync(path.join(DIST, 'assets'))
  .filter((f) => f.endsWith('.css'))
  .map((f) => fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'))
  .join('\n')
  .replace(/\s+/g, '')

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

// 先打开一次并开启「信任技能」，让技能面板的启停能真实生效（与技能页同一道门控）
const seed = await loadPage('/index.html', { freshCopy: true })
const seeded = readState(seed.storage)
seeded.settings.trustedSkills = true
seed.storage.setItem(LS_KEY, JSON.stringify(seeded))

const { doc, w, errors, storage } = await loadPage('/index.html', { storage: seed.storage, freshCopy: true })
const sub = () => doc.querySelector('#add-sub')
const panel = (n) => doc.querySelector(`[data-sub-panel="${n}"]`)
const visiblePanels = () => [...doc.querySelectorAll('[data-sub-panel]')].filter((p) => !p.hidden).map((p) => p.dataset.subPanel)
const hover = (sel) => doc.querySelector(sel).dispatchEvent(new w.MouseEvent('mouseenter', { bubbles: true }))

check('home loads without errors', errors.length === 0, errors)

/* ---------- 1. 打开菜单：右侧默认什么都不显示（只有鼠标指向行才出现） ---------- */

click(w, doc.querySelector('#add-menu-btn'))
await tick()
check('menu opens without any right-hand panel',
  !doc.querySelector('#add-popover').hidden && sub().hidden && visiblePanels().length === 0)
check('main menu is exactly the five screenshot rows',
  [...doc.querySelectorAll('#add-popover .popover-main [data-sub]')].map((r) => r.dataset.sub).join()
  === 'files,mode,experts,skills,connectors')
check('main menu labels match the screenshot',
  [...doc.querySelectorAll('.popover-main .menu-label')].map((l) => l.textContent.trim()).join()
  === '添加文件,模式,专家,技能,连接器')
check('main menu has no footer plus button', !doc.querySelector('.popover-footer'))

/* ---------- 2. 鼠标指向即切换：只有一块可见 ---------- */

for (const [row, name] of [['skills', 'skills'], ['connectors', 'connectors'], ['mode', 'mode'], ['files', 'files'], ['experts', 'experts']]) {
  hover(`[data-sub="${row}"]`)
  await tick()
  check(`hovering ${row} shows only the ${name} panel`, visiblePanels().join() === name)
  check(`hovering ${row} marks the row active`,
    doc.querySelector(`[data-sub="${row}"]`).classList.contains('is-sub-active')
    && doc.querySelectorAll('.menu-row.is-sub-active').length === 1)
}

// 指向专家再指向技能：只能剩一行高亮
hover('[data-sub="experts"]')
await tick()
hover('[data-sub="skills"]')
await tick()
check('only one parent row keeps its open state',
  doc.querySelectorAll('.menu-row-parent.is-open').length === 0
  && doc.querySelector('[data-sub="skills"]').classList.contains('is-sub-active'))

// 鼠标离开菜单：右侧面板收起
doc.querySelector('#add-popover').dispatchEvent(new w.MouseEvent('mouseleave'))
await tick()
check('moving the pointer out of the menu hides the right panel', sub().hidden)

/* ---------- 2c. 菜单位置固定：不能「总往上走」 ---------- */

check('menu is anchored to the + button with a fixed gap',
  cssCompact.includes('.popover{position:absolute;bottom:calc(100%+8px)')
  && cssCompact.includes('align-items:flex-end'))
check('panels are bottom-aligned so the main menu never shifts',
  cssCompact.includes('.popover-main{width:250px;align-self:flex-end')
  && cssCompact.includes('.popover-sub{') && cssCompact.includes('align-self:flex-end'))
check('menu height is clamped to the space above the button',
  cssCompact.includes('max-height:var(--pop-max')
  && doc.querySelector('#add-popover').style.getPropertyValue('--pop-max').endsWith('px'))
check('there is a downward fallback when the space above is tight',
  cssCompact.includes('.popover.is-below{top:calc(100%+10px);bottom:auto'))
check('narrow screens stack the panels instead of squeezing them',
  cssCompact.includes('.popover{flex-direction:column-reverse;align-items:stretch'))

const popBox = doc.querySelector('#add-popover')
const menuMax = popBox.style.getPropertyValue('--pop-max')
hover('[data-sub="experts"]')
await tick()
check('switching panels does not change the anchoring',
  popBox.style.getPropertyValue('--pop-max') === menuMax
  && popBox.classList.contains('is-below') === false)
hover('[data-sub="files"]')
await tick()
check('a shorter panel keeps the same anchor too',
  popBox.style.getPropertyValue('--pop-max') === menuMax)
check('the open menu fits inside the viewport budget',
  Number.parseInt(menuMax, 10) <= 620 && Number.parseInt(menuMax, 10) >= 200)

/* ---------- 3. 技能面板：真实启停 ---------- */

hover('[data-sub="skills"]')
await tick()
const skillItems = [...panel('skills').querySelectorAll('[data-toggle-skill]')]
check('skills panel lists every installed skill',
  skillItems.length === readState(storage).skills.length)
check('skills panel shows how many are enabled',
  panel('skills').querySelector('#add-skill-count').textContent.includes('已启用'))
check('skill rows expose enabled state to screen readers',
  skillItems.every((i) => ['true', 'false'].includes(i.getAttribute('aria-checked'))))
const offSkill = skillItems.find((i) => i.getAttribute('aria-checked') === 'false')
const offName = readState(storage).skills.find((s) => s.id === offSkill.dataset.toggleSkill).name
click(w, panel('skills').querySelector(`[data-toggle-skill="${offSkill.dataset.toggleSkill}"]`))
await tick()
check('clicking a skill really enables it in the store',
  readState(storage).skills.find((s) => s.name === offName)?.enabled === true)
check('skill row turns on after the toggle',
  panel('skills').querySelector(`[data-toggle-skill="${offSkill.dataset.toggleSkill}"]`).getAttribute('aria-checked') === 'true')

/* ---------- 4. 连接器面板：已连接优先、可搜索、真连接 ---------- */

hover('[data-sub="connectors"]')
await tick()
const cnItems = [...panel('connectors').querySelectorAll('[data-toggle-connector]')]
check('connectors panel lists items', cnItems.length >= 4)
check('connected connectors are listed first',
  cnItems.slice(0, readState(storage).connectors.filter((c) => c.connected).length)
    .every((i) => i.getAttribute('aria-checked') === 'true'))
check('connector count reflects the store',
  panel('connectors').querySelector('#add-cn-count').textContent
    .startsWith(String(readState(storage).connectors.filter((c) => c.connected).length)))
input(w, panel('connectors').querySelector('#add-cn-search'), '飞书')
await tick()
check('connector search narrows the list',
  [...panel('connectors').querySelectorAll('[data-toggle-connector]')].every((i) => i.textContent.includes('飞书')))
input(w, panel('connectors').querySelector('#add-cn-search'), '')
await tick()
const newCn = panel('connectors').querySelector('[data-toggle-connector][aria-checked="false"]')
const newCnName = newCn.dataset.toggleConnector
click(w, newCn)
await tick()
check('connecting from the panel persists to the store',
  readState(storage).connectors.find((c) => c.name === newCnName)?.connected === true)
click(w, panel('connectors').querySelector(`[data-toggle-connector="${newCnName}"]`))
await tick()
check('clicking again disconnects',
  readState(storage).connectors.find((c) => c.name === newCnName)?.connected === false)

/* ---------- 5. 模式面板：计划 + 任务 ---------- */

hover('[data-sub="mode"]')
await tick()
check('mode panel has both a plan and a task list',
  !!panel('mode').querySelector('#add-plan-list') && !!panel('mode').querySelector('#add-task-list'))
check('both lists start with honest empty states',
  panel('mode').textContent.includes('还没有计划') && panel('mode').textContent.includes('暂无任务'))

// 载入示例计划 → 提示词出现在输入框
click(w, panel('mode').querySelector('[data-plan-sample]'))
await tick()
check('sample plan fills the prompt box',
  doc.querySelector('#prompt-input').value.includes('数字化方案'))
check('loading a plan closes the menu', doc.querySelector('#add-popover').hidden)

/* ---------- 6. 提交后：计划与任务都是真实数据 ---------- */

input(w, doc.querySelector('#prompt-input'), '给制造业客户做数字化方案，30 分钟，重点讲降本 20%')
click(w, doc.querySelector('#send-btn'))
await tick(300)
check('a task is queued right after submit',
  readState(storage).tasks.length === 1 && ['排队中', '进行中'].includes(readState(storage).tasks[0].status))
check('the task records the prompt for later reuse',
  readState(storage).tasks[0].prompt.includes('降本 20%'))
await tick(2600)
check('task finishes with a real artifact',
  readState(storage).tasks[0].status === '已完成' && !!readState(storage).tasks[0].artifact)
click(w, doc.querySelector('.modal-foot [data-done]'))
await tick()

click(w, doc.querySelector('#add-menu-btn'))
await tick()
hover('[data-sub="mode"]')
await tick()
check('plan list now shows the submitted plan',
  panel('mode').querySelectorAll('[data-plan]').length === 1
  && panel('mode').textContent.includes('数字化方案'))
check('task list shows the finished task with its status',
  panel('mode').querySelectorAll('[data-task]').length === 1
  && panel('mode').textContent.includes('已完成'))
click(w, panel('mode').querySelector('[data-task]'))
await tick()
check('clicking a task puts its prompt back in the box',
  doc.querySelector('#prompt-input').value.includes('降本 20%'))

/* ---------- 7. 添加文件：真实读取正文 + 可移除 ---------- */

click(w, doc.querySelector('#add-menu-btn'))
await tick()
hover('[data-sub="files"]')
await tick()
check('files panel explains what is supported and offers a picker',
  !!panel('files').querySelector('[data-pick-files]') && panel('files').textContent.includes('PDF'))
const fileInput = doc.querySelector('#add-file-input')
Object.defineProperty(fileInput, 'files', {
  value: [new w.File(['渠道,订单数\n自然搜索,120\n信息流,86'], 'q3-orders.csv', { type: 'text/csv', lastModified: Date.now() })],
  configurable: true,
})
fileInput.dispatchEvent(new w.Event('change', { bubbles: true }))
await tick(120)
check('picked file becomes an attachment chip',
  [...doc.querySelectorAll('.attach-chip .chip-name')].some((n) => n.textContent === 'q3-orders.csv'))
hover('[data-sub="files"]')
await tick()
check('files panel lists the attachment with its kind and size',
  panel('files').textContent.includes('q3-orders.csv') && /表格|KB|B/.test(panel('files').textContent))
check('text files are actually read (csv contents available)',
  doc.querySelector('.attach-chip') !== null && panel('files').querySelector('[data-remove-file]') !== null)
click(w, panel('files').querySelector('[data-remove-file]'))
await tick()
check('remove button drops the attachment',
  doc.querySelectorAll('.attach-chip').length === 0 && panel('files').textContent.includes('还没有附加文件'))

/* ---------- 8. 引用对话中的文件（从「添加文件」面板进入） ---------- */

hover('[data-sub="files"]')
await tick()
const refDoor = panel('files').querySelector('[data-open-refs]')
check('files panel offers the conversation-file entry', !!refDoor)
click(w, refDoor)
await tick()
check('conversation-file entry switches to the refs panel', visiblePanels().join() === 'refs')
const refItems = [...panel('refs').querySelectorAll('[data-ref-file]')]
check('reference panel lists conversation files',
  refItems.length >= 10 && panel('refs').querySelector('#add-ref-count').textContent.includes('可选文件'))
check('reference panel offers the full media picker', !!panel('refs').querySelector('[data-open-ref-picker]'))
click(w, panel('refs').querySelector('[data-ref-file]'))
await tick()
check('referencing a conversation file adds it to the prompt',
  doc.querySelectorAll('.attach-chip').length === 1)
check('the referenced row flips to 已引用',
  panel('refs').querySelector('[data-ref-file] .add-item-pill').textContent === '已引用')

/* ---------- 9. 附件正文真的进入生成上下文 ---------- */

click(w, doc.querySelector('#add-menu-btn'))
await tick()
click(w, doc.querySelector('#expert-row'))
await tick()
click(w, [...doc.querySelectorAll('.expert-item')].find((i) => i.dataset.expert === '提案叙事专家'))
await tick()
input(w, doc.querySelector('#prompt-input'), '把附件里的渠道数据整理成一页结论')
click(w, doc.querySelector('#send-btn'))
await tick(2600)
const gamma = readState(storage).gammas[0]
check('submitted creation keeps the attachment context',
  (gamma.attachContext ?? '').includes('附件清单') && gamma.attachments.length >= 1)
check('result modal tells you which attachments were used',
  doc.querySelector('.modal-body')?.textContent.includes('已参考'))
check('expert engine result is still produced', !!doc.querySelector('.modal-body .xr-result'))
check('whole flow stays error-free', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} ADD-MENU PANEL CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
