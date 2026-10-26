/* ============================================================
   输入框里的 @ 引用文件 / / 调用技能
   —— 弹层、筛选、键盘、真实附件、真实技能运行
   ============================================================ */

import { loadPage, click, tick, readState } from './helpers.mjs'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const { doc, w, errors, storage } = await loadPage('/index.html', { freshCopy: true })
const $ = (s) => doc.querySelector(s)
const input = $('#prompt-input')
const toasts = () => [...doc.querySelectorAll('.toast')].map((t) => t.textContent).join(' | ')
const mentionOpen = () => !$('#mention-pop').hidden
const skillOpen = () => !$('#skill-pop').hidden

/** 模拟真实键入：写入值 + 光标放到末尾 + 派发 input */
const type = (text) => {
  input.focus()
  input.value = text
  input.setSelectionRange(text.length, text.length)
  input.dispatchEvent(new w.Event('input', { bubbles: true }))
}
const press = (key) => input.dispatchEvent(new w.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
const names = (listSel) => [...doc.querySelectorAll(`${listSel} .pt-name`)].map((n) => n.textContent)

check('home loads without errors', errors.length === 0, errors)

/* ---------- 1. @ 引用文件 ---------- */

type('把 @')
await tick()
check('typing @ opens the file picker', mentionOpen() && !skillOpen())
check('file picker lists files from the media library',
  doc.querySelectorAll('#mention-list .pt-item').length >= 10)
check('file rows show where the file comes from',
  [...doc.querySelectorAll('#mention-list .pt-sub')].every((n) => n.textContent.trim().length > 0))
check('file picker hints at the trigger key', $('#mention-pop .pt-head em')?.textContent === '@')

type('把 @奶油')
await tick()
check('typing after @ filters the list',
  names('#mention-list').length >= 1 && names('#mention-list').every((n) => n.includes('奶油')))

type('把 @zzz')
await tick()
check('no match shows an honest empty state',
  doc.querySelectorAll('#mention-list .pt-item').length === 0
  && $('#mention-list').textContent.includes('没有匹配的文件'))

type('把 @奶油')
await tick()
const pickedName = names('#mention-list')[0]
click(w, doc.querySelector('#mention-list .pt-item'))
await tick()
check('picking a file inserts @name into the prompt',
  input.value === `把 @${pickedName} `)
check('picking a file adds a real attachment chip',
  [...doc.querySelectorAll('.attach-chip .chip-name')].map((n) => n.textContent).join() === pickedName)
check('the picker closes after picking', !mentionOpen() && !skillOpen())
check('picking a file is announced', toasts().includes('已引用'))

type('再看 @奶油')
await tick()
click(w, doc.querySelector('#mention-list .pt-item'))
await tick()
check('picking the same file twice does not duplicate the attachment',
  doc.querySelectorAll('.attach-chip').length === 1 && toasts().includes('已在附件里'))

type('随便写 @')
await tick()
press('Escape')
await tick()
check('Escape closes the picker', !mentionOpen())

type('邮箱 foo@bar.com')
await tick()
check('@ inside a word does not open the picker', !mentionOpen())

/* ---------- 2. / 调用技能 ---------- */

type('帮我做一份 /')
await tick()
check('typing / opens the skill picker', skillOpen() && !mentionOpen())
check('skill picker lists the installed skills',
  doc.querySelectorAll('#skill-list .pt-item').length === readState(storage).skills.length)
check('skill picker hints at the trigger key', $('#skill-pop .pt-head em')?.textContent === '/')

type('帮我做一份 /翻译')
await tick()
check('typing after / filters the skills',
  names('#skill-list').join() === '中英互译')

type('帮我做一份 /数据')
await tick()
const offSkill = doc.querySelector('#skill-list .pt-item')
check('disabled skills are marked', offSkill?.classList.contains('is-off')
  && offSkill.textContent.includes('未启用'))
click(w, offSkill)
await tick()
check('picking a disabled skill does not arm it',
  !$('.skill-chip') && toasts().includes('还没启用'))

type('帮我做一份 /')
await tick()
click(w, [...doc.querySelectorAll('#skill-list .pt-item')].find((b) => b.textContent.includes('PPT 大纲生成')))
await tick()
check('picking a skill removes the slash query from the box', input.value === '帮我做一份 ')
check('picking a skill shows the skill chip',
  $('.skill-chip')?.textContent.includes('技能 · PPT 大纲生成'))
check('picking a skill is announced', toasts().includes('已调用技能「PPT 大纲生成」'))

click(w, $('.skill-chip [data-rm-skill]'))
await tick()
check('the skill chip can be removed', !$('.skill-chip') && toasts().includes('已取消技能'))

type('30/60 的排版')
await tick()
check('/ between digits does not open the picker', !skillOpen())

/* ---------- 3. 键盘操作 ---------- */

type('写一份 /')
await tick()
press('ArrowDown')
await tick()
check('ArrowDown moves the highlight',
  doc.querySelectorAll('#skill-list .pt-item.is-active').length === 1
  && doc.querySelectorAll('#skill-list .pt-item')[1].classList.contains('is-active'))
press('Enter')
await tick()
check('Enter picks the highlighted row',
  $('.skill-chip')?.textContent.includes('文案润色') && input.value === '写一份 ')

/* ---------- 4. 发送时真实运行技能 ---------- */

input.value = '给制造业客户做数字化方案，30 分钟，重点讲降本 20%'
input.dispatchEvent(new w.Event('input', { bubbles: true }))
click(w, $('#send-btn'))
await tick(3200)
const body = $('.modal-body')
const gamma = readState(storage).gammas[0]
check('skill choice is stored on the creation', gamma?.skill === '文案润色')
check('the result modal runs the real skill engine',
  body?.querySelector('.modal-copy')?.textContent.includes('文案润色')
  && !!body?.querySelector('.xr-result'))
check('skill output is structured, not a placeholder',
  body.querySelectorAll('.xr-table tbody tr').length >= 3
  || body.querySelectorAll('.xr-list li').length >= 3)
check('skill result offers a downloadable artifact',
  [...doc.querySelectorAll('.modal-foot button')].some((b) => b.textContent.includes('下载产物')))
check('the skill chip is cleared after sending', !$('.skill-chip'))

click(w, $('.modal-foot [data-done]'))
await tick()

/* ---------- 5. 历史附件也能被 @ 引用 ---------- */

type('继续 @')
await tick()
check('files attached to past creations show up in the picker',
  [...doc.querySelectorAll('#mention-list .pt-sub')].some((n) => n.textContent.includes('创作「')))
check('the trigger flow stays error-free', errors.length === 0, errors)

console.log(`\n${fails.length ? `${fails.length} FAILED: ${fails.join('; ')}` : `ALL ${passed} PROMPT TRIGGER CHECKS PASSED`}`)
if (fails.length) process.exitCode = 1
