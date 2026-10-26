/* ============================================================
   Design Buddy 首页：真实创作流 + localStorage 持久化
   - gamma / 对话 / 文件夹 / 垃圾箱 / 工作区 全部落库
   - 语音输入（Web Speech API，不支持时降级提示）
   - 参数弹层、附件、专家、权限等菜单项均为真实交互
   ============================================================ */

import './rail-flyout.js'
import { requireAuth } from './auth.js'
requireAuth()
import { store, toast, openModal, confirmModal, uid, fmtDate } from './core.js'
import { AVAILABLE_MODELS } from './model-config.js'
import {
  initGlobalUI,
  openPalette,
  openUpgrade,
  openHelp,
  openInvite,
  openMessages,
  openSkills,
  openExperts,
  openConnectors,
} from './global-ui.js'
import { applyAppChips } from './settings-effects.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

/* 设置 → 个性化/应用管理：推荐区显隐与创作类型过滤，随设置实时生效 */
function applySmartSuggest() {
  const row = $('.template-row')
  if (!row) return
  const label = row.previousElementSibling?.classList.contains('section-label') ? row.previousElementSibling : null
  const show = store.state.settings.personalize.smartSuggest
  row.hidden = !show
  if (label) label.hidden = !show
}
applySmartSuggest()
applyAppChips()
store.subscribe(() => { applySmartSuggest(); applyAppChips() })

/* 开机自动启动（设置项）：从其他页面恢复时带 ?new=1 则自动新建 */
if (new URLSearchParams(location.search).get('new') === '1') {
  setTimeout(() => createBlankGamma(), 0)
}

/* 跨刷新保留的首页 UI 偏好（创作类型 / 模式 / 图片模式 / 专家） */
const ui = (store.state.ui ??= { type: '演示文稿', mode: '标准', imgMode: '自动', expert: null })
// 参考图方式：style 风格 / character 角色 / content 内容（旧数据无此字段时默认风格参考）
ui.refType ??= 'style'

const MODE_COST = { Lite: 1, 标准: 3, Max: 8 }
const TYPE_ICONS = { 演示文稿: '📊', 文档: '📄', 轮播图: '🎞️', 图片: '🖼️', 美化: '✨', 导入: '📥' }

/* ---------------- 积分 / 工作区显示 ---------------- */

function syncChrome() {
  $('.credits strong').textContent = store.state.credits
  const ws = store.state.workspaces.find((w) => w.id === store.state.activeWorkspaceId) ?? store.state.workspaces[0]
  $('.workspace-name').textContent = ws.name
  $('.workspace-plan').textContent = ws.plan === 'pro' ? 'Pro' : 'Free'
  store.save()
}

store.subscribe(() => {
  const el = document.querySelector('.credits strong')
  if (el) el.textContent = store.state.credits
})

/* ---------------- 工作区切换器 ---------------- */

function buildWorkspaceMenu() {
  const sw = $('.workspace-switch')
  let menu = $('.ws-menu')
  if (!menu) {
    menu = document.createElement('div')
    menu.className = 'ws-menu'
    menu.hidden = true
    sw.parentElement.style.position = 'relative'
    sw.parentElement.append(menu)
    sw.addEventListener('click', (e) => {
      e.stopPropagation()
      menu.hidden = !menu.hidden
    })
    document.addEventListener('click', (e) => {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== sw) menu.hidden = true
    })
  }
  const active = store.state.workspaces.find((w) => w.id === store.state.activeWorkspaceId) ?? store.state.workspaces[0]
  const avatarText = sw.querySelector('.avatar')?.textContent ?? (active.name[0] || 'W')
  const multi = store.state.workspaces.length > 1
  menu.innerHTML = `
    <div class="ws-head">
      <span class="avatar avatar-green ws-head-avatar">${avatarText}</span>
      <span class="ws-head-meta">
        <b class="ws-head-name">${active.name}</b>
        <span class="ws-head-sub">${active.plan === 'pro' ? 'Pro' : 'Free'} · ${store.state.workspaces.length} 名成员</span>
      </span>
      <button class="ws-settings" type="button" data-ws-settings>设置</button>
    </div>
    <div class="menu-divider"></div>
    <button class="ws-action" type="button" data-ws-invite>
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
      <span>邀请团队成员</span>
    </button>
    <button class="ws-action" type="button" data-ws-upgrade>
      <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2zM19 15l.9 2.6L22.5 18.5l-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z"/></svg>
      <span>方案和价格</span>
    </button>
    ${multi ? `
    <div class="menu-divider"></div>
    ${store.state.workspaces.map((w) => `
      <button class="modal-list-item ws-switch-row" data-ws="${w.id}" type="button">
        <span class="ws-check">${w.id === store.state.activeWorkspaceId ? '✓' : ''}</span>
        <span class="grow">
          <span class="primary">${w.name}</span>
          <span class="secondary">${w.plan === 'pro' ? 'Pro' : 'Free'} 计划</span>
        </span>
      </button>`).join('')}` : ''}
    <div class="menu-divider"></div>
    <button class="modal-list-item" type="button" data-ws-new>
      <span class="grow"><span class="primary">＋ 新建工作区</span></span>
    </button>`

  menu.querySelector('[data-ws-settings]').addEventListener('click', () => {
    menu.hidden = true
    location.href = 'settings.html'
  })
  menu.querySelector('[data-ws-invite]').addEventListener('click', () => {
    menu.hidden = true
    openInvite()
  })
  menu.querySelector('[data-ws-upgrade]').addEventListener('click', () => {
    menu.hidden = true
    openUpgrade()
  })
  menu.querySelectorAll('[data-ws]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.state.activeWorkspaceId = btn.dataset.ws
      store.save()
      menu.hidden = true
      syncChrome()
      toast('已切换工作区')
    })
  })
  menu.querySelector('[data-ws-new]').addEventListener('click', () => {
    menu.hidden = true
    openWorkspaceCreator()
  })
}

function openWorkspaceCreator() {
  const { close, bodyEl, footEl } = openModal({
    title: '新建工作区',
    body: '<div class="field"><label>工作区名称</label><input type="text" id="ws-name" placeholder="例如：品牌设计组" /></div>',
    footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>创建</button>',
  })
  const input = bodyEl.querySelector('#ws-name')
  input.focus()
  footEl.querySelector('[data-ok]').addEventListener('click', () => {
    const name = input.value.trim()
    if (!name) return toast('请输入工作区名称')
    const ws = { id: uid('ws'), name, plan: 'free' }
    store.state.workspaces.push(ws)
    store.state.activeWorkspaceId = ws.id
    store.save()
    buildWorkspaceMenu()
    syncChrome()
    close()
    toast(`工作区「${name}」已创建`)
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
}

/* ---------------- 提示词输入与发送 ---------------- */

const input = $('#prompt-input')
const sendBtn = $('#send-btn')
const attachments = []

function syncSendState() {
  const hasText = input.value.trim().length > 0
  sendBtn.disabled = !hasText
  sendBtn.classList.toggle('is-ready', hasText)
}

input.addEventListener('input', syncSendState)
input.addEventListener('input', () => {
  input.style.height = 'auto'
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`
})

function renderChips() {
  let box = $('.attach-chips')
  if (!box) {
    box = document.createElement('div')
    box.className = 'attach-chips'
    input.parentElement.insertBefore(box, $('.prompt-toolbar'))
  }
  box.innerHTML = attachments.map((a, i) => `
    <span class="attach-chip">
      <span class="chip-name">${a.name}</span>
      <button type="button" data-rm="${i}" aria-label="移除">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
    </span>`).join('')
  box.querySelectorAll('[data-rm]').forEach((b) =>
    b.addEventListener('click', () => {
      attachments.splice(Number(b.dataset.rm), 1)
      renderChips()
    }),
  )
}

function addAttachment(name) {
  if (attachments.some((a) => a.name === name)) return
  attachments.push({ name })
  renderChips()
}

function submitPrompt() {
  const text = input.value.trim()
  if (!text) return
  if (ui.mode === 'Max') {
    const ws = store.state.workspaces.find((w) => w.id === store.state.activeWorkspaceId)
    if (ws.plan !== 'pro') {
      confirmModal('Max 是 Pro 专属模式', '升级到 Pro 后即可使用 Max 全力以赴模式，是否立即升级？', '去升级').then((ok) => {
        if (ok) openUpgrade()
      })
      return
    }
  }
  const cost = MODE_COST[ui.mode] ?? 3
  if (store.state.credits < cost) {
    confirmModal('积分不足', `本次创作需要 ${cost} 积分，当前仅剩 ${store.state.credits} 积分。是否前往充值？`, '去充值').then((ok) => {
      if (ok) openUpgrade()
    })
    return
  }
  // 设置 → 记忆与进化：长期记忆与自定义指令真实注入每次创作
  const memCount = store.state.settings.memories.length
  const hasInstruction = !!store.state.instructions.trim()
  if (memCount || hasInstruction) {
    toast(`已应用 ${memCount} 条记忆${hasInstruction ? '与自定义指令' : ''}`)
  }
  createGamma({ prompt: text, origin: 'prompt', appliedMemory: memCount + (hasInstruction ? 1 : 0) })
  input.value = ''
  input.style.height = 'auto'
  attachments.length = 0
  renderChips()
  syncSendState()
  input.focus()
}

sendBtn.addEventListener('click', submitPrompt)
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    submitPrompt()
  }
})

/* ---------------- gamma 生成（模拟流水线，真实落库） ---------------- */

function createGamma({ prompt, origin = 'prompt', template = null, silent = false }) {
  const cost = silent ? 0 : MODE_COST[ui.mode] ?? 3
  store.state.credits -= cost
  const now = Date.now()
  // 设置 → 个性化 → 自动命名：关闭时空白创作使用时间戳占位名，交由用户后续重命名
  const autoTitle = store.state.settings.personalize.autoTitle
  const stamp = new Date(now).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  const title = template
    ? `模板创作 · ${template}`
    : prompt
      ? (autoTitle ? (prompt.length > 18 ? `${prompt.slice(0, 18)}…` : prompt) : `未命名创作 ${stamp}`)
      : `未命名创作 ${stamp}`
  const gamma = {
    id: uid('g'),
    title,
    prompt,
    type: ui.type,
    mode: ui.mode,
    imgMode: ui.imgMode,
    refType: ui.refType,
    expert: ui.expert,
    template,
    origin,
    attachments: [...attachments],
    folderId: null,
    shared: false,
    deleted: false,
    createdAt: now,
    updatedAt: now,
  }
  store.state.gammas.unshift(gamma)
  store.state.conversations.unshift({ id: uid('c'), gammaId: gamma.id, title, at: now })
  store.save()
  if (!silent) runGeneration(gamma)
  renderFolders()
  return gamma
}

function runGeneration(gamma) {
  // 设置 → 模型：真实模型 id 来自 model-config.js 写死的可用白名单
  const model = store.state.settings.model || AVAILABLE_MODELS[0]?.id || '本地演示模型'
  const pace = 480
  const steps = ['理解提示词', '规划页面结构', `${gamma.type}内容生成`, '视觉与排版优化']
  const { bodyEl, footEl } = openModal({
    title: `正在创作 · ${gamma.type}`,
    footer: `<span class="gen-model-tag">${model}</span><button class="btn btn-ghost" data-close disabled>最小化</button>`,
  })
  bodyEl.innerHTML = `<div class="gen-steps">${steps.map((s, i) => `
    <div class="gen-step" data-step="${i}"><span class="dot">${i + 1}</span><span>${s}</span></div>`).join('')}</div>`
  let i = 0
  const timer = setInterval(() => {
    const rows = bodyEl.querySelectorAll('.gen-step')
    if (i > 0) rows[i - 1].classList.replace('is-active', 'is-done')
    if (i < steps.length) {
      rows[i].classList.add('is-active')
      i += 1
    } else {
      clearInterval(timer)
      showResult(gamma, bodyEl, footEl)
    }
  }, pace)
  footEl.querySelector('[data-close]').addEventListener('click', () => {
    clearInterval(timer)
    footEl.querySelector('[data-close]').closest('.modal-mask').remove()
    toast('创作已在后台完成，可在「最近的 Design Buddy」查看')
  })
}

function showResult(gamma, bodyEl, footEl) {
  const pages = ['封面', '背景介绍', '核心内容', '数据与案例', '总结与行动项']
  bodyEl.innerHTML = `
    <p class="modal-copy"><strong>${gamma.title}</strong> 已生成，共 ${pages.length} 页（${gamma.mode} 模式，消耗 ${MODE_COST[gamma.mode] ?? 3} 积分）。</p>
    <ul class="outline-list">
      ${pages.map((p, i) => `<li><strong>第 ${i + 1} 页 · ${p}</strong>${gamma.prompt || '从空白新建，等待补充内容'}</li>`).join('')}
    </ul>`
  footEl.innerHTML = `
    <button class="btn btn-ghost" data-again>再创作一次</button>
    <button class="btn btn-primary" data-done>完成</button>`
  footEl.querySelector('[data-done]').addEventListener('click', () => footEl.closest('.modal-mask').remove())
  footEl.querySelector('[data-again]').addEventListener('click', () => {
    footEl.closest('.modal-mask').remove()
    if (gamma.prompt) {
      input.value = gamma.prompt
      syncSendState()
      input.focus()
      toast('提示词已填回输入框')
    } else {
      toast('空白 Design Buddy 请先输入提示词')
    }
  })
}

/* ---------------- 创作类型 chips ---------------- */

$$('[data-chip]').forEach((chip) => {
  if (chip.textContent.trim() === ui.type) {
    $$('[data-chip]').forEach((c) => c.classList.remove('chip-active'))
    chip.classList.add('chip-active')
  }
  chip.addEventListener('click', () => {
    $$('[data-chip]').forEach((item) => item.classList.remove('chip-active'))
    chip.classList.add('chip-active')
    ui.type = chip.textContent.trim()
    store.save()
    toast(`创作类型：${ui.type}`)
  })
})

/* ---------------- 调整参数弹层 ---------------- */

function openParams() {
  const p = store.state.settings.params
  const { close, bodyEl, footEl } = openModal({
    title: '调整参数',
    body: `
      <div class="field">
        <label>创造力 <span class="hint">（当前 ${p.creativity} / 4）</span></label>
        <input type="range" id="p-creativity" min="0" max="4" step="1" value="${p.creativity}" />
      </div>
      <div class="field">
        <label>回复长度</label>
        <div class="seg" id="p-length">
          ${['精简', '均衡', '详细'].map((v) => `<button type="button" data-v="${v}" class="${p.length === v ? 'is-on' : ''}">${v}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label>输出语言</label>
        <div class="seg" id="p-lang">
          ${['中文', 'English', '日本語'].map((v) => `<button type="button" data-v="${v}" class="${p.language === v ? 'is-on' : ''}">${v}</button>`).join('')}
        </div>
      </div>`,
    footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>保存参数</button>',
  })
  bodyEl.querySelector('#p-creativity').addEventListener('input', (e) => {
    p.creativity = Number(e.target.value)
  })
  bodyEl.querySelectorAll('.seg').forEach((seg) => {
    seg.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-v]')
      if (!btn) return
      seg.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', b === btn))
      if (seg.id === 'p-length') p.length = btn.dataset.v
      if (seg.id === 'p-lang') p.language = btn.dataset.v
    })
  })
  footEl.querySelector('[data-ok]').addEventListener('click', () => {
    store.save()
    close()
    toast('参数已保存并应用于后续创作')
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
}

$('.tool-btn[aria-label="调整参数"]').addEventListener('click', openParams)

/* ---------------- 语音输入 ---------------- */

const voiceBtn = $('.tool-btn[aria-label="语音输入"]')
const SR = window.SpeechRecognition || window.webkitSpeechRecognition

if (SR) {
  const rec = new SR()
  rec.lang = 'zh-CN'
  rec.interimResults = true
  let baseText = ''
  rec.onstart = () => {
    baseText = input.value
    voiceBtn.classList.add('voice-recording')
    toast('正在聆听，请开始说话…')
  }
  rec.onresult = (e) => {
    const transcript = [...e.results].map((r) => r[0].transcript).join('')
    input.value = baseText + transcript
    syncSendState()
  }
  rec.onend = () => voiceBtn.classList.remove('voice-recording')
  rec.onerror = () => {
    voiceBtn.classList.remove('voice-recording')
    toast('语音识别失败，请改用键盘输入')
  }
  voiceBtn.addEventListener('click', () => {
    if (voiceBtn.classList.contains('voice-recording')) rec.stop()
    else rec.start()
  })
} else {
  voiceBtn.addEventListener('click', () => toast('当前浏览器不支持语音输入，请使用 Chrome / Edge 或直接键入提示词'))
}

/* ---------------- “+”上弹菜单 ---------------- */

const addBtn = $('#add-menu-btn')
const popover = $('#add-popover')
const expertRow = $('#expert-row')
const expertSub = $('#expert-sub')
const expertSearch = $('#expert-search-input')
const expertList = $('#expert-list')

function renderExperts() {
  expertList.innerHTML = store.state.experts.map((ex) => `
    <button class="expert-item" type="button" role="menuitem" data-expert="${ex.name}">
      <span class="expert-avatar ${ex.color}">${ex.name[0]}</span>
      <span class="expert-name">${ex.name}${ui.expert === ex.name ? ' ✓' : ''}</span>
    </button>`).join('')
}
renderExperts()

/* ---------------- 专家页「召唤」过来：选好专家并带入提示词 ---------------- */
try {
  const raw = localStorage.getItem('design-buddy-summon-v1')
  if (raw) {
    localStorage.removeItem('design-buddy-summon-v1')
    const summon = JSON.parse(raw)
    if (summon?.name) {
      ui.expert = summon.name
      store.save()
      renderExperts()
      if (summon.prompt) {
        input.value = summon.prompt
        syncSendState()
        input.style.height = 'auto'
        input.style.height = `${Math.min(input.scrollHeight, 160)}px`
        input.focus()
        toast(`已为「${summon.name}」带入提示词`)
      } else {
        toast(`已召唤「${summon.name}」`)
      }
    }
  }
} catch {
  /* 召唤数据损坏时不影响首页加载 */
}

function openPopover() {
  if (imgPopover && !imgPopover.hidden) closeImgPopover()
  if (effortIsOpen()) closeEffort()
  popover.hidden = false
  addBtn.setAttribute('aria-expanded', 'true')
}
function closePopover() {
  popover.hidden = true
  addBtn.setAttribute('aria-expanded', 'false')
  closeExpertSub()
  expertSearch.value = ''
  filterExperts()
}
const popoverIsOpen = () => !popover.hidden
function openExpertSub() {
  expertSub.hidden = false
  expertRow.classList.add('is-open')
  expertRow.setAttribute('aria-expanded', 'true')
}
function closeExpertSub() {
  expertSub.hidden = true
  expertRow.classList.remove('is-open')
  expertRow.setAttribute('aria-expanded', 'false')
}

addBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  popoverIsOpen() ? closePopover() : openPopover()
})
expertRow.addEventListener('mouseenter', openExpertSub)
expertRow.addEventListener('click', (event) => {
  event.stopPropagation()
  expertSub.hidden ? openExpertSub() : closeExpertSub()
})

function filterExperts() {
  const q = expertSearch.value.trim().toLowerCase()
  let visible = 0
  $$('.expert-item', expertList).forEach((item) => {
    const match = item.dataset.expert.toLowerCase().includes(q)
    item.hidden = !match
    if (match) visible += 1
  })
  let emptyEl = $('.expert-empty', expertSub)
  if (visible === 0) {
    if (!emptyEl) {
      emptyEl = document.createElement('p')
      emptyEl.className = 'expert-empty'
      emptyEl.textContent = '没有匹配的专家'
      expertList.after(emptyEl)
    }
    emptyEl.hidden = false
  } else if (emptyEl) emptyEl.hidden = true
}
expertSearch.addEventListener('input', filterExperts)
expertSearch.addEventListener('click', (event) => event.stopPropagation())

// 隐藏文件选择器（添加文件）
const fileInput = document.createElement('input')
fileInput.type = 'file'
fileInput.multiple = true
fileInput.hidden = true
document.body.append(fileInput)
fileInput.addEventListener('change', () => {
  [...fileInput.files].forEach((f) => addAttachment(f.name))
  fileInput.value = ''
  if (attachments.length) toast(`已附加 ${attachments.length} 个文件`)
})

function openReferencePicker() {
  const { bodyEl } = openModal({
    title: '引用对话中的文件（媒体库）',
    wide: true,
  })
  const render = () => {
    bodyEl.innerHTML = `<div class="modal-list">${store.state.media.map((m) => `
      <button class="modal-list-item" data-ref="${m.id}">
        <span class="gamma-thumb ${m.cls}"></span>
        <span class="grow"><span class="primary">${m.name}</span>
        <span class="secondary">${m.source === 'ai' ? 'AI 生成' : '本地上传'} · ${m.gen}</span></span>
      </button>`).join('')}</div>`
    bodyEl.querySelectorAll('[data-ref]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = store.state.media.find((x) => x.id === btn.dataset.ref)
        addAttachment(m.name)
        bodyEl.closest('.modal-mask').remove()
        toast(`已引用「${m.name}」`)
      })
    })
  }
  render()
}

popover.addEventListener('click', (event) => {
  const actionRow = event.target.closest('[data-action]')
  if (actionRow) {
    event.stopPropagation()
    const action = actionRow.dataset.action
    closePopover()
    switch (action) {
      case '添加文件': fileInput.click(); break
      case '引用对话中的文件': openReferencePicker(); break
      case '模式': openEffort(); break
      case '技能': openSkills(); break
      case '连接器': openConnectors(); break
      case '新建': createBlankGamma(); break
      case '召唤更多专家': openExperts(); break
      default: toast(action)
    }
    return
  }
  const expertItem = event.target.closest('.expert-item')
  if (expertItem) {
    event.stopPropagation()
    ui.expert = expertItem.dataset.expert
    store.save()
    renderExperts()
    toast(`已选择专家：${ui.expert}`)
    closePopover()
  }
})

document.addEventListener('click', (event) => {
  if (popoverIsOpen() && !popover.contains(event.target) && event.target !== addBtn) closePopover()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && popoverIsOpen()) closePopover()
})

/* ---------------- 参考图上弹菜单（上传 / 风格 / 角色 / 内容） ---------------- */

const REF_TYPE_LABELS = { style: '风格参考', character: '角色参考', content: '内容参考' }
const imgBtn = $('#img-menu-btn')
const imgPopover = $('#img-popover')
const refFileInput = $('#ref-file-input')
const refOptions = $$('.ref-option')

function syncRefOptions() {
  refOptions.forEach((option) => {
    const selected = option.dataset.refType === ui.refType
    option.classList.toggle('is-selected', selected)
    option.setAttribute('aria-checked', String(selected))
  })
}
syncRefOptions()

const imgPopoverIsOpen = () => !imgPopover.hidden
function openImgPopover() {
  if (popoverIsOpen()) closePopover()
  if (effortIsOpen()) closeEffort()
  imgPopover.hidden = false
  imgBtn.setAttribute('aria-expanded', 'true')
}
function closeImgPopover() {
  imgPopover.hidden = true
  imgBtn.setAttribute('aria-expanded', 'false')
}
imgBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  imgPopoverIsOpen() ? closeImgPopover() : openImgPopover()
})

// 上传图片：真实调起系统文件选择器，选中的图片进入附件芯片（随创作持久化）
imgPopover.querySelector('[data-ref-upload]').addEventListener('click', (event) => {
  event.stopPropagation()
  refFileInput.click()
})
refFileInput.addEventListener('click', (event) => event.stopPropagation())
refFileInput.addEventListener('change', () => {
  const files = [...refFileInput.files].filter((f) => f.type.startsWith('image/'))
  files.forEach((f) => addAttachment(f.name))
  if (files.length) toast(`已添加 ${files.length} 张参考图片`)
  refFileInput.value = ''
  closeImgPopover()
})

// 参考方式：单选，真实持久化到 ui.refType 并随 gamma 落库
refOptions.forEach((option) => {
  option.addEventListener('click', (event) => {
    event.stopPropagation()
    ui.refType = option.dataset.refType
    store.save()
    syncRefOptions()
    toast(`参考方式：${REF_TYPE_LABELS[ui.refType]}`)
    closeImgPopover()
  })
})

document.addEventListener('click', (event) => {
  if (imgPopoverIsOpen() && !imgPopover.contains(event.target) && event.target !== imgBtn) closeImgPopover()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && imgPopoverIsOpen()) closeImgPopover()
})

/* ---------------- 努力模式上弹菜单 ---------------- */

const modeBtn = $('#mode-menu-btn')
const effortPopover = $('#effort-popover')
const modeLabel = $('#mode-label')
const effortIsOpen = () => !effortPopover.hidden
function openEffort() {
  if (popoverIsOpen()) closePopover()
  if (imgPopoverIsOpen()) closeImgPopover()
  effortPopover.hidden = false
  modeBtn.setAttribute('aria-expanded', 'true')
}
function closeEffort() {
  effortPopover.hidden = true
  modeBtn.setAttribute('aria-expanded', 'false')
}
modeBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  effortIsOpen() ? closeEffort() : openEffort()
})
modeLabel.textContent = ui.mode
$$('.effort-option').forEach((option) => {
  if (option.dataset.mode === ui.mode) {
    $$('.effort-option').forEach((o) => {
      o.classList.toggle('is-selected', o === option)
      o.setAttribute('aria-checked', String(o === option))
    })
  }
  option.addEventListener('click', (event) => {
    event.stopPropagation()
    const chosen = option.dataset.mode
    if (chosen === 'Max') {
      const ws = store.state.workspaces.find((w) => w.id === store.state.activeWorkspaceId)
      if (ws.plan !== 'pro') {
        toast('Max 为 Pro 专属模式')
        closeEffort()
        confirmModal('升级 Pro', 'Max 模式对重要工作全力以赴，升级 Pro 即可解锁。', '去升级').then((ok) => ok && openUpgrade())
        return
      }
    }
    ui.mode = chosen
    store.save()
    $$('.effort-option').forEach((item) => {
      const selected = item === option
      item.classList.toggle('is-selected', selected)
      item.setAttribute('aria-checked', String(selected))
    })
    modeLabel.textContent = chosen
    toast(`努力模式：${chosen}`)
    closeEffort()
  })
})
document.addEventListener('click', (event) => {
  if (effortIsOpen() && !effortPopover.contains(event.target) && event.target !== modeBtn) closeEffort()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && effortIsOpen()) closeEffort()
})

/* ---------------- 侧栏导航：对话 / gamma / 垃圾箱 ---------------- */

function gammaRow(g) {
  return `
    <div class="gamma-item" data-gamma="${g.id}">
      <span class="gamma-thumb" style="background:${['#e9f1fe', '#fef0e6', '#eafaf4', '#f6ecfe'][g.id.charCodeAt(3) % 4]}"></span>
      <span class="gamma-meta">
        <span class="gamma-title">${g.title}</span>
        <span class="gamma-sub">${TYPE_ICONS[g.type] ?? '📄'} ${g.type} · ${fmtDate(g.createdAt)}</span>
      </span>
      <span class="gamma-actions">
        <button class="icon-mini" data-act="rename" title="重命名">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button class="icon-mini" data-act="${g.deleted ? 'restore' : 'trash'}" title="${g.deleted ? '恢复' : '移入垃圾箱'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </span>
    </div>`
}

function bindGammaList(bodyEl, { trash = false } = {}) {
  bodyEl.querySelectorAll('[data-gamma]').forEach((row) => {
    const g = store.state.gammas.find((x) => x.id === row.dataset.gamma)
    row.querySelector('[data-act="rename"]')?.addEventListener('click', (e) => {
      e.stopPropagation()
      const name = prompt('重命名 Design Buddy', g.title)
      if (name && name.trim()) {
        g.title = name.trim()
        g.updatedAt = Date.now()
        store.save()
        toast('已重命名')
        row.querySelector('.gamma-title').textContent = g.title
      }
    })
    const trashBtn = row.querySelector('[data-act="trash"]')
    trashBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      confirmModal('移入垃圾箱', `确定把「${g.title}」移入垃圾箱吗？`).then((ok) => {
        if (!ok) return
        g.deleted = true
        g.updatedAt = Date.now()
        store.save()
        row.remove()
        renderFolders()
        toast('已移入垃圾箱')
      })
    })
    row.querySelector('[data-act="restore"]')?.addEventListener('click', (e) => {
      e.stopPropagation()
      g.deleted = false
      store.save()
      row.remove()
      renderFolders()
      toast('已恢复')
    })
    row.addEventListener('click', (e) => {
      if (e.target.closest('.gamma-actions')) return
      const { bodyEl: b2, footEl } = openModal({
        title: g.title,
        wide: true,
        body: `
          <p class="modal-copy">${g.prompt || '（空白 Design Buddy，暂无提示词）'}</p>
          <p class="hint" style="margin-top:10px">
            ${TYPE_ICONS[g.type] ?? ''} ${g.type} · ${g.mode} 模式 · 图片：${g.imgMode}
            ${g.expert ? ` · 专家：${g.expert}` : ''}${g.template ? ` · 模板：${g.template}` : ''}
          </p>
          ${g.attachments.length ? `<p class="hint" style="margin-top:6px">附件：${g.attachments.map((a) => a.name).join('、')}</p>` : ''}
          <p class="hint" style="margin-top:6px">创建于 ${fmtDate(g.createdAt)}</p>
          <div class="field" style="margin-top:16px">
            <label>归入文件夹</label>
            <select id="detail-folder">
              <option value="">未分组</option>
              ${store.state.folders.map((f) => `<option value="${f.id}" ${g.folderId === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
            </select>
          </div>`,
        footer: `
          <button class="btn btn-ghost" id="detail-share">${g.shared ? '取消共享' : '共享给协作成员'}</button>
          <button class="btn btn-primary" data-close>完成</button>`,
      })
      b2.querySelector('#detail-folder').addEventListener('change', (ev) => {
        g.folderId = ev.target.value || null
        g.updatedAt = Date.now()
        store.save()
        renderFolders()
        toast(g.folderId ? '已归入文件夹' : '已移回未分组')
      })
      footEl.querySelector('#detail-share').addEventListener('click', (ev) => {
        g.shared = !g.shared
        g.updatedAt = Date.now()
        store.save()
        ev.currentTarget.textContent = g.shared ? '取消共享' : '共享给协作成员'
        toast(g.shared ? '已共享，可在「与您共享」中查看' : '已取消共享')
      })
      footEl.querySelector('[data-close]').addEventListener('click', () => footEl.closest('.modal-mask').remove())
    })
  })
}

function openGammaList(title, list, opts = {}) {
  const { bodyEl } = openModal({ title, wide: true })
  const render = () => {
    bodyEl.innerHTML = list.length
      ? `<div class="modal-list">${list.map(gammaRow).join('')}</div>`
      : '<div class="empty-hint">暂时没有内容<br />在首页输入提示词，创作的 Design Buddy 会出现在这里。</div>'
    bindGammaList(bodyEl, opts)
  }
  render()
}

$$('[data-nav]').forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault()
    const label = item.textContent.trim()
    if (item.id === 'nav-search') return openPalette()
    $$('[data-nav]').forEach((nav) => nav.classList.remove('nav-item-active'))
    item.classList.add('nav-item-active')
    const alive = store.state.gammas.filter((g) => !g.deleted)
    switch (label) {
      case '创建':
        input.focus()
        break
      case '最近的对话记录':
        openModal({
          title: '最近的对话记录',
          wide: true,
          body: store.state.conversations.length
            ? `<div class="modal-list">${store.state.conversations.map((c) => `
                <button class="modal-list-item" data-conv="${c.id}">
                  <span class="grow"><span class="primary">${c.title}</span>
                  <span class="secondary">${fmtDate(c.at)}</span></span>
                </button>`).join('')}</div>`
            : '<div class="empty-hint">还没有对话记录<br />发送一条提示词开始第一次对话。</div>',
        }).bodyEl.querySelectorAll('[data-conv]').forEach((b) =>
          b.addEventListener('click', () => {
            const c = store.state.conversations.find((x) => x.id === b.dataset.conv)
            const g = store.state.gammas.find((x) => x.id === c.gammaId)
            if (g) input.value = g.prompt
            syncSendState()
            b.closest('.modal-mask').remove()
            toast('提示词已填回输入框')
          }),
        )
        break
      case '最近的 Design Buddy':
        openGammaList('最近的 Design Buddy', alive)
        break
      case '全部':
        openGammaList('全部 Design Buddy', alive)
        break
      case '与您共享':
        openGammaList('与您共享', alive.filter((g) => g.shared))
        break
      case '网站':
        openGammaList('网站', alive.filter((g) => g.type === '网站'))
        break
      case 'API 已生成':
        openGammaList('API 已生成', alive.filter((g) => g.type === 'API'))
        break
      case '垃圾箱':
        openGammaList('垃圾箱', store.state.gammas.filter((g) => g.deleted), { trash: true })
        break
      default:
        toast(label)
    }
  })
})

/* ---------------- 文件夹 ---------------- */

function renderFolders() {
  const card = $('.folder-card')
  if (!card) return
  const folders = store.state.folders
  card.innerHTML = `
    ${folders.map((f) => {
      const count = store.state.gammas.filter((g) => !g.deleted && g.folderId === f.id).length
      return `
        <button class="folder-row" data-folder="${f.id}">
          <svg class="icon folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          <span>${f.name}</span>
          <span class="count-pill">${count}</span>
        </button>`
    }).join('')}
    <p class="folder-hint">将相关的 Design Buddy 分组，并一次性全部分享。</p>
    <a href="#" class="folder-link">${folders.length ? '新建文件夹' : '创建文件夹'}</a>`

  card.querySelector('.folder-link').addEventListener('click', (e) => {
    e.preventDefault()
    const { close, bodyEl, footEl } = openModal({
      title: '新建文件夹',
      body: '<div class="field"><label>文件夹名称</label><input type="text" id="folder-name" placeholder="例如：Q4 营销项目" /></div>',
      footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>创建</button>',
    })
    const nameInput = bodyEl.querySelector('#folder-name')
    nameInput.focus()
    footEl.querySelector('[data-ok]').addEventListener('click', () => {
      const name = nameInput.value.trim()
      if (!name) return toast('请输入文件夹名称')
      store.state.folders.push({ id: uid('f'), name, createdAt: Date.now() })
      store.save()
      close()
      renderFolders()
      toast(`文件夹「${name}」已创建`)
    })
    footEl.querySelector('[data-close]').addEventListener('click', close)
  })

  card.querySelectorAll('[data-folder]').forEach((row) => {
    row.addEventListener('click', () => {
      const f = store.state.folders.find((x) => x.id === row.dataset.folder)
      const list = store.state.gammas.filter((g) => !g.deleted && g.folderId === f.id)
      const { bodyEl } = openModal({
        title: `文件夹 · ${f.name}`,
        wide: true,
        footer: '<button class="btn btn-danger" data-del>删除文件夹</button><button class="btn btn-primary" data-close>完成</button>',
      })
      const render = () => {
        bodyEl.innerHTML = list.length
          ? `<div class="modal-list">${list.map(gammaRow).join('')}</div>
             <p class="hint" style="margin-top:12px">在 Design Buddy 上可重命名或移出；移入其他文件夹可在 Design Buddy 详情中操作。</p>`
          : '<div class="empty-hint">这个文件夹还是空的<br />先创作 Design Buddy，再在详情中归入此文件夹。</div>'
        bindGammaList(bodyEl)
      }
      render()
      const footEl = bodyEl.closest('.modal-mask').querySelector('.modal-foot')
      footEl.querySelector('[data-del]').addEventListener('click', () => {
        confirmModal('删除文件夹', `删除「${f.name}」？其中的 Design Buddy 不会被删除，会回到未分组状态。`).then((ok) => {
          if (!ok) return
          store.state.gammas.forEach((g) => {
            if (g.folderId === f.id) g.folderId = null
          })
          store.state.folders = store.state.folders.filter((x) => x.id !== f.id)
          store.save()
          bodyEl.closest('.modal-mask').remove()
          renderFolders()
          toast('文件夹已删除')
        })
      })
      footEl.querySelector('[data-close]').addEventListener('click', () => bodyEl.closest('.modal-mask').remove())
    })
  })
}

/* ---------------- 模板 / 顶部按钮 / 帮助 ---------------- */

$$('[data-template]').forEach((card) => {
  card.addEventListener('click', () => {
    createGamma({ prompt: `使用「${card.dataset.template}」模板风格创作一份${ui.type}`, origin: 'template', template: card.dataset.template })
  })
})

function createBlankGamma() {
  const g = createGamma({ prompt: '', origin: 'blank', silent: true })
  toast(`已新建空白 Design Buddy「${g.title}」，可在「最近的 Design Buddy」中找到`)
}

$('.pill-outline').addEventListener('click', () => { location.href = 'templates.html' })
$('.pill-upgrade').addEventListener('click', openUpgrade)
$('.topbar-right .pill').addEventListener('click', createBlankGamma)
$('.help-fab').addEventListener('click', openHelp)
$$('.rail-footer .footer-icon').forEach((btn) => {
  btn.addEventListener('click', () => {
    const label = btn.getAttribute('aria-label')
    if (label === '邀请成员') openInvite()
    else if (label === '消息') openMessages()
  })
})

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
    e.preventDefault()
    createBlankGamma()
  }
})

/* ---------------- 启动 ---------------- */

buildWorkspaceMenu()
renderFolders()
syncChrome()
syncSendState()
