/* ============================================================
   Design Buddy 首页：真实创作流 + localStorage 持久化
   - gamma / 对话 / 文件夹 / 垃圾箱 / 工作区 全部落库
   - 语音输入（Web Speech API，不支持时降级提示）
   - 参数弹层、附件、专家、权限等菜单项均为真实交互
   ============================================================ */

import './rail-flyout.js'
import { requireAuth } from './auth.js'
requireAuth()
import { store, toast, openModal, confirmModal, uid, fmtDate, downloadFile } from './core.js'
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
import { expertAvatarByName } from './expert-avatars.js'
import { EXPERT_CATALOG } from './experts-catalog.js'
import { EXPERT_CAPS, runExpert, resultHTML } from './expert-runtime.js'
import { runSkill } from './skill-runtime.js'
import { initAddSubPanels } from './add-menu.js'
import { CONNECTOR_CATALOG, CONNECTOR_ICONS } from './connectors-catalog.js'
import { initPromptTriggers } from './prompt-triggers.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

/* 跨刷新保留的首页 UI 偏好（创作类型 / 模式 / 图片模式 / 专家）
   type 为空 = 默认态（第一张截图）；选中类型 = 工作台态（第二张截图） */
const ui = (store.state.ui ??= { type: null, mode: '标准', imgMode: '自动', expert: null })
ui.ratio ??= '1:1'
ui.count ??= 3
ui.beautifyStyle ??= null
const homeMode = () => !!ui.type

/* 由后面的参考图菜单赋值，避免早期调用踩到暂时性死区 */
let closeImgPopoverQuiet = () => {}

/* 默认态 / 工作台态：整页显隐的唯一来源。
   默认态 → 头图 + 问候语 + 输入卡 + 六种类型 + 推荐模板
   工作台态 → 返回 + 类型胶囊 + 示例指令 + 浏览·上传模板 + 工作区·探索 */
const DEFAULT_PLACEHOLDER = '从这份报告中找出五个最令人惊讶的发现，将它们制作成一个 6 张卡片的 LinkedIn 轮播图，第一张卡片要有吸引人的亮点，最后一张卡片要有行动号召。'
const TYPE_PLACEHOLDER = '描述您的演示主题'

/* 工作台里每种类型自己的标题与占位文案（截图里的图片工作台就是一例） */
const TYPE_COPY = {
  演示文稿: { placeholder: '描述您的演示主题' },
  图片: { title: '你的笔记，美得令人惊艳', placeholder: '描述您想要创建的图像' },
  文档: { placeholder: '描述您想要创建的文档' },
  轮播图: { placeholder: '描述您的轮播图主题' },
  美化: { placeholder: '描述您希望更改或改进的内容', hero: '/covers/hero-beautify.jpg' },
  导入: { placeholder: '添加要导入的文件，或从下方选择任务', hero: '/covers/hero-beautify.jpg' },
}
const greetingTitle = () => {
  const fullName = store.state.profile?.name || store.state.workspaces?.[0]?.name || 'ruoxuan'
  const firstName = String(fullName).replace(/'s\s+Workspace$/i, '').trim().split(/\s+/)[0] || 'ruoxuan'
  return `很高兴见到您，${firstName}`
}

function applySmartSuggest() {
  const mode = homeMode()
  const smart = store.state.settings.personalize.smartSuggest
  const row = $('.template-row')
  const isWork = row?.dataset.workView === 'workspace'

  document.body.classList.toggle('is-type-mode', mode)

  const back = $('#back-btn')
  if (back) back.hidden = !mode
  const pillWrap = $('.type-menu-wrap')
  if (pillWrap) pillWrap.hidden = !mode
  const quick = $('#quick-types')
  if (quick) quick.hidden = mode
  const rec = $('#rec-templates')
  if (rec) rec.hidden = mode

  const isImage = ui.type === '图片'
  const isBeautify = ui.type === '美化'
  const isImport = ui.type === '导入'
  document.body.classList.toggle('is-image-mode', isImage)
  document.body.classList.toggle('is-beautify-mode', isBeautify)
  document.body.classList.toggle('is-import-mode', isImport)

  const inputEl = $('#prompt-input')
  if (inputEl) inputEl.placeholder = mode ? (TYPE_COPY[ui.type]?.placeholder ?? TYPE_PLACEHOLDER) : DEFAULT_PLACEHOLDER

  const title = $('.hero-title')
  if (title) title.textContent = (mode && TYPE_COPY[ui.type]?.title) || greetingTitle()

  // 头图：美化态换成截图里的紫粉渐变山丘
  const heroImg = $('.hero-photo')
  if (heroImg) {
    const src = (mode && TYPE_COPY[ui.type]?.hero) || '/covers/hero.jpg'
    if (heroImg.getAttribute('src') !== src) heroImg.setAttribute('src', src)
  }

  const imgExtra = $('#img-extra')
  if (imgExtra) imgExtra.hidden = !isImage
  const also = $('#also-make')
  if (also) also.hidden = !isImage
  const beautifyDrop = $('#beautify-drop')
  if (beautifyDrop) beautifyDrop.hidden = !isBeautify
  const beautifyStyles = $('#beautify-styles')
  if (beautifyStyles) beautifyStyles.hidden = !isBeautify

  const importDrop = $('#import-drop')
  if (importDrop) importDrop.hidden = !isImport
  const importChoices = $('#import-choices')
  if (importChoices) importChoices.hidden = !isImport

  // 截图里美化 / 导入工作台右侧只有 标准 / 麦克风 / 发送，没有参考图入口
  const imgWrap = $('.img-menu-wrap')
  if (imgWrap) imgWrap.hidden = isBeautify || isImport
  if (isBeautify || isImport) closeImgPopoverQuiet()

  // 设置 → 个性化：关掉「智能推荐」时，工作台里的示例与探索区一并隐藏
  const bare = isBeautify || isImport
  ;['.examples', '.work-tabs'].forEach((sel) => {
    const el = $(sel)
    if (el) el.hidden = !mode || !smart || bare
  })
  if (row) row.hidden = !mode || !smart || isWork || bare
  const work = $('#work-grid')
  if (work) work.hidden = !mode || !isWork || bare
  const ctaEl = $('.template-cta')
  if (ctaEl) ctaEl.hidden = !mode || bare
}
applySmartSuggest()
applyAppChips()
store.subscribe(() => { applySmartSuggest(); applyAppChips() })

/* 开机自动启动（设置项）：从其他页面恢复时带 ?new=1 则自动新建 */
if (new URLSearchParams(location.search).get('new') === '1') {
  setTimeout(() => createBlankGamma(), 0)
}


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
  // 工作台态即使还没输入，箭头也是可用状态（截图 2）；默认态没有内容时是灰的（截图 1）
  sendBtn.disabled = !hasText && !homeMode()
  sendBtn.classList.toggle('is-ready', hasText || homeMode())
}

input.addEventListener('input', syncSendState)
input.addEventListener('input', () => {
  input.style.height = 'auto'
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`
})

/* 通过「/」调用的技能：只对这一次创作生效 */
let activeSkill = null
/* 被引用的模板（点探索里的模板 / 推荐模板）：以卡片形式挂在输入框里，发送时才真正创建 */
let activeTemplate = null

const SKILL_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/><path d="M18.5 15l.8 2.1 2.2.8-2.2.8-.8 2.1-.8-2.1-2.2-.8 2.2-.8.8-2.1z"/></svg>'

/* 引用卡片上的类型标签：文档 / 演示文稿 / 表格 / 图片 / PDF / 模板 */
const FILE_TAGS = {
  PDF: { label: 'PDF', key: 'pdf' },
  表格: { label: '表格', key: 'sheet' },
  文档: { label: '文档', key: 'doc' },
  图片: { label: '图片', key: 'image' },
  演示: { label: '演示文稿', key: 'deck' },
  代码: { label: '代码', key: 'code' },
  文件: { label: '文件', key: 'file' },
}

const fileKind = (name = '') => {
  const ext = String(name).split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'PDF'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '表格'
  if (['doc', 'docx', 'md', 'txt', 'rtf'].includes(ext)) return '文档'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return '图片'
  if (['ppt', 'pptx', 'key'].includes(ext)) return '演示'
  if (['js', 'ts', 'json', 'html', 'css', 'py'].includes(ext)) return '代码'
  return '文件'
}

const extOf = (name = '') => (String(name).split('.').pop() || 'FILE').toUpperCase().slice(0, 4)

const TAG_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>'
const TPL_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>'

const X_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>'

/* 引用卡片：缩略图 + 名称 + 类型标签（模板 / 文档 / 演示文稿…），与截图一致 */
function refCardHTML({ name, thumb, thumbText, tag, kind, removeAttr }) {
  return `
    <span class="attach-chip ref-card is-${kind}">
      <span class="ref-thumb"${thumb ? ` style="--img:url('${thumb}')"` : ''}>${thumb ? '' : `<em>${thumbText}</em>`}</span>
      <span class="ref-main">
        <span class="chip-name">${name}</span>
        <span class="ref-tag is-${kind}">${kind === 'template' ? TPL_ICON : TAG_ICON}<b>${tag}</b></span>
      </span>
      <button type="button" ${removeAttr} aria-label="移除 ${name}">${X_ICON}</button>
    </span>`
}

function renderChips() {
  let box = $('.attach-chips')
  if (!activeSkill && !activeTemplate && !attachments.length) {
    box?.remove()
    return
  }
  if (!box) {
    box = document.createElement('div')
    box.className = 'attach-chips'
    // 引用卡片放在输入框上方（截图里卡片在占位文案之上）
    input.parentElement.insertBefore(box, input)
  }
  const templateCard = activeTemplate
    ? refCardHTML({
      name: activeTemplate.name,
      thumb: activeTemplate.cover,
      thumbText: 'TPL',
      tag: '模板',
      kind: 'template',
      removeAttr: 'data-rm-template',
    })
    : ''
  const fileCards = attachments.map((a, i) => {
    const kind = a.kind || fileKind(a.name)
    const meta = FILE_TAGS[kind] ?? FILE_TAGS.文件
    return refCardHTML({
      name: a.name,
      thumb: a.type?.startsWith('image/') ? a.preview ?? '' : '',
      thumbText: extOf(a.name),
      tag: meta.label,
      kind: meta.key,
      removeAttr: `data-rm="${i}"`,
    })
  }).join('')

  box.innerHTML = `${activeSkill ? `
    <span class="skill-chip" data-skill-chip>
      ${SKILL_ICON}
      <span class="chip-name">技能 · ${activeSkill.name}</span>
      <button type="button" data-rm-skill aria-label="取消技能">${X_ICON}</button>
    </span>` : ''}${templateCard}${fileCards}`

  box.querySelectorAll('[data-rm]').forEach((b) =>
    b.addEventListener('click', () => {
      attachments.splice(Number(b.dataset.rm), 1)
      renderChips()
    }),
  )
  box.querySelector('[data-rm-template]')?.addEventListener('click', () => {
    const gone = activeTemplate?.name
    activeTemplate = null
    renderChips()
    if (gone) toast(`已取消引用模板「${gone}」`)
  })
  box.querySelector('[data-rm-skill]')?.addEventListener('click', () => {
    activeSkill = null
    renderChips()
    toast('已取消技能')
  })
}

/* 把一张模板卡片设为「引用」：进入它的格式工作台，并把卡片挂到输入框里 */
/* 首页这批示例模板的格式（自定义模板以 store 里存的 format 为准） */
const TEMPLATE_FORMATS = {
  Graha: '文档',
  'Jelly Canvas': '文档',
  Olympus: '文档',
  'Terrace Set': '演示文稿',
  Reliquary: '文档',
  Altitude: '演示文稿',
  Scintilla: '演示文稿',
}

function referenceTemplate(name, cover = '') {
  const tpl = (store.state.customTemplates ?? []).find((t) => t.name === name)
  const format = tpl?.format || TEMPLATE_FORMATS[name] || null
  activeTemplate = { name, cover: cover || (typeof tpl?.cover === 'string' && tpl.cover.startsWith('data:') ? tpl.cover : '') }
  const typeMap = { 演示文稿: '演示文稿', 文档: '文档', 社交轮播卡片: '轮播图' }
  const nextType = format ? typeMap[format] ?? ui.type : ui.type
  if (!ui.type && nextType) setType(nextType, { quiet: true })
  else if (!ui.type) setType('演示文稿', { quiet: true })
  renderChips()
  input.focus()
  toast(`已引用模板「${name}」，写一句你想做的东西就能开始`)
}

function addAttachment(name, meta = {}) {
  if (attachments.some((a) => a.name === name)) return
  attachments.push({ name, ...meta })
  renderChips()
}

/* 附件正文 → 生成时真正使用的上下文（引用对话中的文件也走这里） */
function attachmentContext() {
  if (!attachments.length) return ''
  const head = attachments.map((a) => {
    const size = a.size ? `，${(a.size / 1024).toFixed(0)} KB` : ''
    return `- ${a.name}（${a.from || '附件'}${size}${a.text ? '，正文已读取' : '，二进制仅随稿交付'}）`
  }).join('\n')
  const bodies = attachments
    .filter((a) => a.text)
    .map((a) => `【${a.name}】\n${a.text.slice(0, 1200)}`)
    .join('\n\n')
  return `附件清单：\n${head}${bodies ? `\n\n附件正文节选：\n${bodies}` : ''}`
}

/* ---------------- 输入框里的 @ 引用文件 / / 调用技能 ---------------- */

/** 可以被 @ 引用的文件：本次附件 + 历史创作附件 + 媒体库 */
function referenceFiles() {
  const out = []
  const seen = new Set()
  const push = (name, from) => {
    if (!name || seen.has(name)) return
    seen.add(name)
    out.push({ name, from })
  }
  attachments.forEach((a) => push(a.name, '本次提示词'))
  ;(store.state.gammas ?? []).forEach((g) => (g.attachments ?? []).forEach((a) => push(a.name, `创作「${g.title}」`)))
  ;(store.state.media ?? []).forEach((m) => push(m.name, m.source === 'ai' ? 'AI 生成' : '本地上传'))
  // 媒体库里的图片：引用后卡片上标「图片」而不是笼统的「文件」
  return out.map((f) => {
    const media = (store.state.media ?? []).find((m) => m.name === f.name)
    return media?.type === 'image' ? { ...f, kind: '图片' } : f
  })
}

const promptTriggers = initPromptTriggers({
  input,
  listFiles: referenceFiles,
  onPickFile: (file) => {
    if (attachments.some((a) => a.name === file.name)) {
      toast(`「${file.name}」已在附件里`)
      return
    }
    addAttachment(file.name, { from: file.from || '对话文件', kind: file.kind })
    toast(`已引用「${file.name}」，随提示词一起提交`)
  },
  listSkills: () => store.state.skills ?? [],
  onPickSkill: (skill) => {
    if (!skill.enabled) {
      toast(`「${skill.name}」还没启用，先去技能页开启`)
      return
    }
    activeSkill = { id: skill.id, name: skill.name }
    renderChips()
    toast(`已调用技能「${skill.name}」，发送后真实运行`)
  },
})

function submitPrompt() {
  promptTriggers.close()
  if (ui.type === '导入' && !attachments.length) {
    toast('先在上方添加要导入的文件（PPTX / DOCX / PDF）')
    return
  }
  const text = input.value.trim()
  if (!text) {
    input.focus()
    toast(homeMode() ? '先用一句话描述你想做的内容' : '先描述你想做的内容，或从推荐模板开始')
    return
  }
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
  const context = attachmentContext()
  const tpl = activeTemplate
  createGamma({
    prompt: text,
    origin: tpl ? 'template' : 'prompt',
    template: tpl?.name ?? null,
    appliedMemory: memCount + (hasInstruction ? 1 : 0),
    attachContext: context,
    attachNames: attachments.map((a) => a.name),
    skill: activeSkill?.name ?? null,
  })
  input.value = ''
  input.style.height = 'auto'
  attachments.length = 0
  activeSkill = null
  activeTemplate = null
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

function createGamma({ prompt, origin = 'prompt', template = null, silent = false, attachContext = '', attachNames = null, skill = null }) {
  const cost = silent ? 0 : MODE_COST[ui.mode] ?? 3
  store.state.credits -= cost
  const now = Date.now()
  // 设置 → 个性化 → 自动命名：关闭时空白创作使用时间戳占位名，交由用户后续重命名
  const autoTitle = store.state.settings.personalize.autoTitle
  const stamp = new Date(now).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  // 引用了模板又写了提示词时，标题优先用提示词；只有模板没有提示词才退回模板名
  const title = prompt
    ? (autoTitle ? (prompt.length > 18 ? `${prompt.slice(0, 18)}…` : prompt) : `未命名创作 ${stamp}`)
    : template
      ? `模板创作 · ${template}`
      : `未命名创作 ${stamp}`
  const gamma = {
    id: uid('g'),
    title,
    prompt,
    type: ui.type || '演示文稿',
    beautifyStyle: ui.type === '美化' ? ui.beautifyStyle : null,
    importSource: ui.type === '导入' ? ui.importSource ?? null : null,
    aspect: ui.type === '图片' ? ui.ratio : null,
    imageCount: ui.type === '图片' ? ui.count : null,
    mode: ui.mode,
    imgMode: ui.imgMode,
    refType: ui.refType,
    expert: ui.expert,
    skill,
    template,
    origin,
    attachments: [...attachments],
    attachContext,
    folderId: null,
    shared: false,
    deleted: false,
    createdAt: now,
    updatedAt: now,
  }
  store.state.gammas.unshift(gamma)
  store.state.conversations.unshift({ id: uid('c'), gammaId: gamma.id, title, at: now })
  // 真实任务：与这次创作同生共死，模式菜单的「任务」列表直接读它
  store.state.tasks.unshift({
    id: uid('t'), gammaId: gamma.id, name: title, prompt,
    mode: gamma.mode, type: gamma.type, skill: gamma.skill ?? null,
    status: silent ? '已完成' : '排队中',
    createdAt: now, finishedAt: silent ? now : null, artifact: null,
    files: attachNames ?? gamma.attachments.map((a) => a.name),
  })
  store.state.tasks = store.state.tasks.slice(0, 50)
  store.save()
  addSub.refresh()
  if (!silent) runGeneration(gamma)
  renderFolders()
  renderWork()
  return gamma
}

function taskOf(gamma) {
  return store.state.tasks.find((t) => t.gammaId === gamma.id)
}

function finishTask(gamma, artifact = null) {
  const task = taskOf(gamma)
  if (!task) return
  task.status = '已完成'
  task.finishedAt = Date.now()
  task.artifact = artifact
  store.save()
  addSub.refresh()
}

function runGeneration(gamma) {
  // 设置 → 模型：真实模型 id 来自 model-config.js 写死的可用白名单
  const model = store.state.settings.model || AVAILABLE_MODELS[0]?.id || '本地演示模型'
  const task = taskOf(gamma)
  if (task) {
    task.status = '进行中'
    task.startedAt = Date.now()
    store.save()
    addSub.refresh()
  }
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
  // 用「/」调用了技能：真实跑一遍技能引擎，结果与产物都来自本地实现
  if (gamma.skill) {
    const skillPrompt = [gamma.prompt, gamma.attachContext].filter(Boolean).join('\n\n')
    const result = runSkill(gamma.skill, skillPrompt)
    if (result) {
      finishTask(gamma, result.artifacts?.[0]?.name ?? null)
      const files = (gamma.attachments ?? []).map((a) => a.name)
      bodyEl.innerHTML = `<p class="modal-copy"><strong>${gamma.skill}</strong> 已运行：${result.title}（${gamma.mode} 模式）${
        files.length ? `<br />已参考 ${files.length} 个附件：${files.join('、')}` : ''
      }</p>${resultHTML(result)}`
      footEl.innerHTML = `
        <button class="btn btn-ghost" data-skill-again>改一句再来</button>
        ${result.artifacts?.length ? '<button class="btn btn-ghost" data-skill-download>下载产物</button>' : ''}
        <button class="btn btn-primary" data-done>完成</button>`
      footEl.querySelector('[data-done]').addEventListener('click', () => footEl.closest('.modal-mask').remove())
      footEl.querySelector('[data-skill-download]')?.addEventListener('click', () => {
        const art = result.artifacts[0]
        downloadFile(art.name, art.content, art.mime ?? 'text/plain')
        toast(`已下载 ${art.name}`)
      })
      footEl.querySelector('[data-skill-again]').addEventListener('click', () => {
        footEl.closest('.modal-mask').remove()
        input.value = gamma.prompt || ''
        activeSkill = gamma.skill ? { id: null, name: gamma.skill } : null
        renderChips()
        syncSendState()
        input.focus()
      })
      return
    }
  }

  // 选了带真实能力的专家：跑真实引擎，产出真实内容而不是固定五页
  const expertEntry = EXPERT_CATALOG.find((e) => e.name === gamma.expert)
  const cap = expertEntry ? EXPERT_CAPS[expertEntry.id] : null
  if (cap) {
    const enginePrompt = [gamma.prompt, gamma.attachContext].filter(Boolean).join('\n\n') || cap.sample
    const result = runExpert(expertEntry.id, enginePrompt)
    finishTask(gamma, result.artifacts?.[0]?.name ?? null)
    bodyEl.innerHTML = `<p class="modal-copy"><strong>${expertEntry.name}</strong> 已交付：${result.title}（${gamma.mode} 模式）${
      gamma.attachments?.length ? `<br />已参考 ${gamma.attachments.length} 个附件：${gamma.attachments.map((a) => a.name).join('、')}` : ''
    }</p>${resultHTML(result)}`
    footEl.innerHTML = `
      <button class="btn btn-ghost" data-again>改一句再来</button>
      ${result.artifacts?.length ? '<button class="btn btn-ghost" data-download>下载产物</button>' : ''}
      <button class="btn btn-primary" data-done>完成</button>`
    footEl.querySelector('[data-done]').addEventListener('click', () => footEl.closest('.modal-mask').remove())
    footEl.querySelector('[data-download]')?.addEventListener('click', () => {
      const art = result.artifacts[0]
      downloadFile(art.name, art.content, art.mime ?? 'text/plain')
      toast(`已下载 ${art.name}`)
    })
    footEl.querySelector('[data-again]').addEventListener('click', () => {
      footEl.closest('.modal-mask').remove()
      input.value = gamma.prompt || ''
      syncSendState()
      input.focus()
    })
    return
  }

  // 导入：给出一份真实的导入清单（文件、类型、来源），并可下载
  if (gamma.type === '导入') {
    const files = gamma.attachments ?? []
    const source = gamma.importSource
    const manifest = [
      '# 导入清单',
      '',
      `来源：${source || '本地文件'}`,
      `文件数：${files.length}`,
      '',
      ...files.map((f, i) => `${i + 1}. ${f.name} · ${kindOf(f.name)}${f.size ? ` · ${(f.size / 1024).toFixed(0)} KB` : ''}（${f.from || '导入文件'}）`),
      '',
      '## 后续可用动作',
      '- 在「模板」页把其中一份存成可复用模板',
      '- 把清单里的文件拖进「美化」工作台统一视觉',
      '- 用「演示文稿」把它转成一页结论',
    ].join('\n')
    const checks = [
      ['文件读取', `${files.length} 个文件已加入本次工作区${files.length ? '' : '（还没有文件）'}`],
      ['格式识别', files.length ? [...new Set(files.map((f) => kindOf(f.name)))].join('、') : '—'],
      ['来源', source ? `${source}${store.state.connectors.find((c) => c.name === source)?.connected ? ' · 已连接' : ''}` : '本地文件'],
      ['下一步', '选择「导入模板」把内容固化成模板，或直接开始创作'],
    ]
    finishTask(gamma, `${files.length} 个文件`)
    bodyEl.innerHTML = `
      <p class="modal-copy"><strong>${gamma.title}</strong> 已加入 ${files.length} 个文件（${gamma.mode} 模式，消耗 ${MODE_COST[gamma.mode] ?? 3} 积分）。${source ? `<br />导入来源：${source}` : ''}</p>
      <ul class="outline-list">
        ${checks.map(([k, v]) => `<li><strong>${k}</strong>${v}</li>`).join('')}
      </ul>`
    footEl.innerHTML = `
      <button class="btn btn-ghost" data-import-again>改一句再来</button>
      <button class="btn btn-ghost" data-import-download>下载导入清单</button>
      <button class="btn btn-primary" data-done>完成</button>`
    footEl.querySelector('[data-done]').addEventListener('click', () => footEl.closest('.modal-mask').remove())
    footEl.querySelector('[data-import-download]').addEventListener('click', () => {
      downloadFile('导入清单.md', manifest, 'text/markdown')
      toast('已下载 导入清单.md')
    })
    footEl.querySelector('[data-import-again]').addEventListener('click', () => {
      footEl.closest('.modal-mask').remove()
      input.value = gamma.prompt || ''
      syncSendState()
      input.focus()
    })
    return
  }

  // 美化：按选定的美化方式给出一份可执行的改版清单，并导出成文件
  if (gamma.type === '美化') {
    const styleKey = gamma.beautifyStyle || ui.beautifyStyle || 'restyle'
    const style = BEAUTIFY_STYLES[styleKey] ?? BEAUTIFY_STYLES.restyle
    const files = (gamma.attachments ?? []).map((a) => a.name)
    const changes = {
      restyle: [
        ['主题色', '把默认蓝灰换成一组主色 + 一枚强调色，全篇只保留两级强调'],
        ['字体', '标题用一套显示字体（加粗、字距收紧），正文统一为无衬线，行高 1.6'],
        ['配色', '背景降到低饱和，正文对比度提到 4.5:1 以上，图表色按同一色阶排布'],
        ['图片', '统一圆角与裁切比例，去掉描边与阴影叠加'],
      ],
      layout: [
        ['栅格', '从自由摆放改成 12 栏栅格，卡片左对齐到同一条基线'],
        ['层级', '每页只保留一个视觉主角，标题–要点–注释三级字号差拉开'],
        ['留白', '页边距统一 48px，同组元素间距按 8 的倍数取整'],
        ['对齐', '多列卡片改成等宽等高，图标与文字左对齐'],
      ],
      copy: [
        ['标题', '把长句压成 6–10 个字的名词短语，去掉「的」「我们」等虚词'],
        ['要点', '每条不超过两行，删掉重复的铺垫句'],
        ['数字', '把「大幅提升」改成具体数字与单位'],
        ['行动项', '每页结尾保留一句明确的下一步'],
      ],
    }[styleKey]
    const artifact = [
      `# 改版清单 · ${style.name}`,
      '',
      `原稿：${files.length ? files.join('、') : '未上传（按描述处理）'}`,
      `补充说明：${gamma.prompt || '无'}`,
      '',
      ...changes.map(([k, v], i) => `${i + 1}. **${k}**：${v}`),
    ].join('\n')
    finishTask(gamma, `${style.name}清单`)
    bodyEl.innerHTML = `
      <p class="modal-copy"><strong>${gamma.title}</strong> 已按「${style.name}」整理出 ${changes.length} 项改动（${gamma.mode} 模式，消耗 ${MODE_COST[gamma.mode] ?? 3} 积分）。${
        files.length ? `<br />原稿：${files.join('、')}` : '<br />还没有上传原稿，可先用 ＋ 添加 PPTX / DOCX / PDF'
      }</p>
      <ul class="outline-list">
        ${changes.map(([k, v]) => `<li><strong>${k}</strong>${v}</li>`).join('')}
      </ul>`
    footEl.innerHTML = `
      <button class="btn btn-ghost" data-beautify-again>改一句再来</button>
      <button class="btn btn-ghost" data-beautify-download>下载改版清单</button>
      <button class="btn btn-primary" data-done>完成</button>`
    footEl.querySelector('[data-done]').addEventListener('click', () => footEl.closest('.modal-mask').remove())
    footEl.querySelector('[data-beautify-download]').addEventListener('click', () => {
      downloadFile('改版清单.md', artifact, 'text/markdown')
      toast('已下载 改版清单.md')
    })
    footEl.querySelector('[data-beautify-again]').addEventListener('click', () => {
      footEl.closest('.modal-mask').remove()
      input.value = gamma.prompt || ''
      syncSendState()
      input.focus()
    })
    return
  }

  // 图片：按比例与数量给出可用的提示词变体（每条都由输入的提示词派生）
  if (gamma.type === '图片') {
    const ratio = gamma.aspect || ui.ratio
    const count = gamma.imageCount || ui.count
    const angles = ['主体居中、突出光线与质感', '拉远交代环境与氛围', '特写材质与细节', '留白构图、适合加文字']
    const variants = Array.from({ length: count }, (_, i) => `${gamma.prompt || '未命名图片'}，${angles[i % angles.length]}`)
    finishTask(gamma, `${count} 条图片提示词`)
    bodyEl.innerHTML = `
      <p class="modal-copy"><strong>${gamma.title}</strong> 已按 ${ratio} 准备 ${count} 张图（${gamma.mode} 模式，消耗 ${MODE_COST[gamma.mode] ?? 3} 积分）。${gamma.refType ? `<br />参考方式：${REF_TYPE_LABELS[gamma.refType] ?? gamma.refType}` : ''}</p>
      <ul class="outline-list">
        ${variants.map((v, i) => `<li><strong>变体 ${i + 1} · ${ratio}</strong>${v}</li>`).join('')}
      </ul>`
    footEl.innerHTML = `
      <button class="btn btn-ghost" data-again>改一句再来</button>
      <button class="btn btn-ghost" data-copy-prompts>复制全部提示词</button>
      <button class="btn btn-primary" data-done>完成</button>`
    footEl.querySelector('[data-done]').addEventListener('click', () => footEl.closest('.modal-mask').remove())
    footEl.querySelector('[data-copy-prompts]')?.addEventListener('click', () => {
      downloadFile(`${gamma.title}.txt`, variants.join('\n\n'), 'text/plain')
      toast(`已导出 ${count} 条提示词`)
    })
    footEl.querySelector('[data-again]').addEventListener('click', () => {
      footEl.closest('.modal-mask').remove()
      input.value = gamma.prompt || ''
      syncSendState()
      input.focus()
    })
    return
  }

  const pages = ['封面', '背景介绍', '核心内容', '数据与案例', '总结与行动项']
  finishTask(gamma, `${pages.length} 页大纲`)
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

/* ---------------- 创作类型：工具栏胶囊 + 下拉列表 ---------------- */

const typeWrap = $('#type-chips')
const typePill = $('#type-pill')
const typePillBtn = $('#type-pill-btn')
const typePillLabel = $('#type-pill-label')
const typePillX = $('#type-pill-x')

const typeChips = () => $$('[data-chip]')
const typeMenuOpen = () => !!typeWrap && !typeWrap.hidden

/* 胶囊图标：每种类型用与截图一致的线性图标 */
const TYPE_PILL_ICONS = {
  演示文稿: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  文档: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>',
  轮播图: '<rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="M7 4v16M17 4v16"/>',
  图片: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  美化: '<path d="M12 3l1.8 4.8L18.5 9.6 13.8 11.4 12 16.2 10.2 11.4 5.5 9.6l4.7-1.8L12 3z"/><path d="M18.5 15l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9z"/>',
  导入: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
}
const typePillIcon = $('#type-pill-icon')

function syncTypeUI() {
  typeChips().forEach((chip) => {
    chip.classList.toggle('chip-active', chip.textContent.trim() === ui.type)
  })
  if (typePillLabel) typePillLabel.textContent = ui.type || '类型'
  if (typePillIcon) typePillIcon.innerHTML = TYPE_PILL_ICONS[ui.type] ?? TYPE_PILL_ICONS.演示文稿
  typePill?.classList.toggle('is-off', !ui.type)
  typePillBtn?.setAttribute('aria-expanded', String(typeMenuOpen()))
  applySmartSuggest()
  syncSendState()
}

function setType(next, { quiet = false } = {}) {
  ui.type = next
  store.save()
  if (typeWrap) typeWrap.hidden = true
  syncTypeUI()
  renderExamples()
  placeToolbarItems()
  if (ui.type !== '图片') closeImgPopoverQuiet()
  if (!quiet && next) toast(`已进入「${next}」，可以开始创作了`)
}
syncTypeUI()

typePillBtn?.addEventListener('click', (event) => {
  event.stopPropagation()
  if (!typeWrap) return
  typeWrap.hidden = !typeWrap.hidden
  syncTypeUI()
})

// 胶囊上的 ×：清空类型（下一次创作不再限定格式）
typePillX?.addEventListener('click', (event) => {
  event.stopPropagation()
  setType(null, { quiet: true })
  toast('已回到首页，可重新选择创作类型')
})

typeChips().forEach((chip) => {
  chip.addEventListener('click', (event) => {
    event.stopPropagation()
    setType(chip.textContent.trim(), { quiet: true })
    toast(`创作类型：${ui.type}`)
  })
})

// 默认态下方的六个类型胶囊：点一下进入对应工作台
$$('[data-quick-type]').forEach((btn) => {
  btn.addEventListener('click', () => setType(btn.dataset.quickType))
})

document.addEventListener('click', (event) => {
  if (typeMenuOpen() && !event.target.closest('.type-menu-wrap')) {
    typeWrap.hidden = true
    syncTypeUI()
  }
})

/* ---------------- 顶栏返回 ---------------- */

$('#back-btn')?.addEventListener('click', () => {
  if (homeMode()) {
    setType(null, { quiet: true })
    toast('已回到首页')
    return
  }
  if (history.length > 1) history.back()
  else location.href = 'index.html'
})

/* ---------------- 示例指令：分类 + 四条可开工的提示 ---------------- */

const EXAMPLE_LIBRARY = {
  '设计与产品': [
    '产品设计师的演示讲故事技巧',
    '设计冲刺议程',
    '客户反馈主题',
    '数据驱动的设计最佳实践',
  ],
  '市场与增长': [
    '季度增长复盘：渠道与转化率拆解',
    '新品发布会的媒体沟通方案',
    '私域社群的月度运营计划',
    '一次投放测试的复盘模板',
  ],
  '教育与培训': [
    '给新员工的产品入门课大纲',
    '把一次内部培训做成可复用课件',
    '面向家长的课程介绍演示',
    '结课汇报的评分标准',
  ],
  '商业与融资': [
    'A 轮融资路演大纲（10 页）',
    '向客户提案的报价结构',
    '半年经营分析：收入与成本',
    '一人公司的商业模式九宫格',
  ],
}

/* 图片工作台用另一套示例（截图里是「给我个惊喜」） */
const IMAGE_EXAMPLES = {
  '给我个惊喜': [
    '90 年代风格的像素艺术村庄的夜景，闪烁的市集摊位，霓虹灯笼',
    '一张柠檬片落入气泡水的照片，溅起的水花被高速快门定格得清晰',
    '复古风格的喷绘插画描绘了一只镀铬天马掠过粉色云海',
    '水彩绘制的森林清晨，雾气里透出光柱，安静治愈',
  ],
  '摄影写实': [
    '清晨的海边木栈道，长曝光把海浪拍成雾气',
    '咖啡馆窗边的手冲特写，逆光下的水汽与光斑',
    '城市夜景航拍，车流被拉成金色光带',
    '模特半身肖像，柔和的窗光与浅景深',
  ],
  '插画风格': [
    '扁平插画的城市通勤场景，配色克制、几何感强',
    '手绘蜡笔质感的儿童绘本封面，暖黄色调',
    '日式浮世绘风格的海浪与灯塔，靛蓝与米白',
    '像素风游戏场景素材，16 位色板，落日小镇',
  ],
  '3D 渲染': [
    '磨砂玻璃材质的产品渲染图，柔和棚拍光',
    '等距视角的迷你城市岛屿，柔粉与薄荷绿',
    '毛绒质感的吉祥物渲染，圆润造型、软阴影',
    '金属与陶瓷材质对比的抽象雕塑，工作室布光',
  ],
}

const exampleState = { cat: '设计与产品' }
const exampleLibrary = () => (ui.type === '图片' ? IMAGE_EXAMPLES : EXAMPLE_LIBRARY)
const exampleGrid = $('#example-grid')
const exampleMenu = $('#example-cat-menu')
const exampleCatBtn = $('#example-cat-btn')
const exampleCatLabel = $('#example-cat-label')

const ARROW_ICON = '<svg class="icon example-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>'

function renderExamples() {
  if (!exampleGrid) return
  const lib = exampleLibrary()
  if (!lib[exampleState.cat]) exampleState.cat = Object.keys(lib)[0]
  exampleCatLabel.textContent = exampleState.cat
  exampleMenu.innerHTML = Object.keys(lib).map((name) => `
    <button class="example-cat-item${name === exampleState.cat ? ' is-active' : ''}" type="button" role="menuitem" data-example-cat="${name}">${name}</button>`).join('')
  exampleGrid.innerHTML = lib[exampleState.cat].map((text) => `
    <button class="example-card" type="button" data-example="${text}">
      <span class="example-card-text">${text}</span>
      ${ARROW_ICON}
    </button>`).join('')
}
renderExamples()

exampleCatBtn?.addEventListener('click', (event) => {
  event.stopPropagation()
  exampleMenu.hidden = !exampleMenu.hidden
  exampleCatBtn.setAttribute('aria-expanded', String(!exampleMenu.hidden))
})

exampleMenu?.addEventListener('click', (event) => {
  const item = event.target.closest('[data-example-cat]')
  if (!item) return
  exampleState.cat = item.dataset.exampleCat
  exampleMenu.hidden = true
  exampleCatBtn.setAttribute('aria-expanded', 'false')
  renderExamples()
})

exampleGrid?.addEventListener('click', (event) => {
  const card = event.target.closest('[data-example]')
  if (!card) return
  input.value = card.dataset.example
  input.style.height = 'auto'
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`
  syncSendState()
  input.focus()
  toast('示例指令已填入，可直接发送')
})

/* ---------------- 工作区 / 探索 ---------------- */

const workGrid = $('#work-grid')
const templateRow = $('#template-row')
let workTab = 'explore'

function renderWork() {
  if (!workGrid || !templateRow) return
  const isWork = workTab === 'workspace'
  templateRow.dataset.workView = workTab
  applySmartSuggest()
  $$('[data-work-tab]').forEach((tab) => {
    const on = tab.dataset.workTab === workTab
    tab.classList.toggle('is-active', on)
    tab.setAttribute('aria-selected', String(on))
  })
  if (!isWork) return
  const list = (store.state.gammas ?? []).filter((g) => !g.deleted).slice(0, 8)
  workGrid.innerHTML = list.length ? list.map((g, i) => `
    <button class="work-item" type="button" data-work-gamma="${g.id}">
      <span class="work-item-cover" style="background:linear-gradient(160deg, hsl(${(i * 47) % 360} 55% 82%), hsl(${(i * 47 + 40) % 360} 45% 66%))">
        <span>${(g.title || '未命名创作').slice(0, 28)}</span>
      </span>
      <span class="work-item-meta">${g.type || '演示文稿'} · ${g.mode || '标准'} · ${fmtDate(g.createdAt)}</span>
    </button>`).join('')
    : `<div class="work-empty">工作区还没有内容。在输入框写一句话发送，创作会出现在这里。</div>`
}

$$('[data-work-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    workTab = tab.dataset.workTab
    renderWork()
  })
})

store.subscribe(() => renderWork())

workGrid?.addEventListener('click', (event) => {
  const item = event.target.closest('[data-work-gamma]')
  if (!item) return
  const g = store.state.gammas.find((x) => x.id === item.dataset.workGamma)
  if (!g) return
  if (g.prompt) {
    input.value = g.prompt
    syncSendState()
    input.focus()
    toast('已把这条创作的提示词填回输入框')
  } else {
    toast('这条创作没有保留提示词')
  }
})

/* ---------------- 上传模板：真实读取图片作为封面 ---------------- */

const tplInput = document.createElement('input')
tplInput.type = 'file'
tplInput.accept = 'image/*'
tplInput.hidden = true
document.body.append(tplInput)

tplInput.addEventListener('change', () => {
  const file = tplInput.files?.[0]
  tplInput.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) { toast('请选择图片文件'); return }
  const finish = (cover) => {
    const name = file.name.replace(/\.[^.]+$/, '') || '我的模板'
    store.state.customTemplates = store.state.customTemplates ?? []
    store.state.customTemplates.unshift({
      id: uid('tpl'), name, cls: null, a: name, b: '',
      format: ui.type || '演示文稿',
      cats: ['由您上传'], cover, archived: false, createdAt: Date.now(),
    })
    store.save()
    toast(`模板「${name}」已上传，可在模板页的「由您创建」里使用`)
  }
  if (file.size > 1.6 * 1024 * 1024) {
    finish('#3b6ef6')
    toast('图片较大，已只保留模板信息')
    return
  }
  try {
    const reader = new FileReader()
    reader.onload = () => finish(String(reader.result))
    reader.onerror = () => finish('#3b6ef6')
    reader.readAsDataURL(file)
  } catch {
    finish('#3b6ef6')
  }
})

$('#upload-template-btn')?.addEventListener('click', () => tplInput.click())

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

/* ---------------- 输入框左侧第三个位置：当前专家（头像 + 名称） ---------------- */

const EXPERT_X_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'

/* 工具栏排布：无专家时 [＋][参数][类型]；有专家时 [＋][参数][专家]，类型胶囊挪到右侧 */
function placeToolbarItems() {
  const left = $('.toolbar-left')
  const right = $('.toolbar-right')
  const typeWrapEl = $('.type-menu-wrap')
  const imgExtraEl = $('#img-extra')
  const imgWrapEl = $('.img-menu-wrap')
  const chip = $('#prompt-expert')
  if (!left || !right || !typeWrapEl) return
  if (chip) {
    if (typeWrapEl.parentElement !== right) right.insertBefore(typeWrapEl, right.firstChild)
  } else if (typeWrapEl.parentElement !== left) {
    left.appendChild(typeWrapEl)
  }
  // 图片工作台：「参考图」排在比例 / 数量之后，其余类型留在右侧（截图 1 的纯图标位）
  if (imgWrapEl && imgExtraEl) {
    if (ui.type === '图片') {
      if (imgWrapEl.parentElement !== imgExtraEl) imgExtraEl.appendChild(imgWrapEl)
    } else if (imgWrapEl.parentElement !== right) {
      right.insertBefore(imgWrapEl, right.firstChild)
    }
  }
  // 比例 / 数量整组只在图片工作台挂在左侧工具条里，其它时候挪出去（保持左侧只有三项）
  const toolbarEl = $('.prompt-toolbar')
  if (imgExtraEl && toolbarEl) {
    if (ui.type === '图片') {
      if (imgExtraEl.parentElement !== left) left.appendChild(imgExtraEl)
    } else if (imgExtraEl.parentElement !== toolbarEl) {
      toolbarEl.insertBefore(imgExtraEl, right)
    }
  }
}

function renderPromptExpert() {
  const left = $('.toolbar-left')
  if (!left) return
  const name = ui.expert
  let chip = $('#prompt-expert')
  if (!name) {
    chip?.remove()
    return
  }
  const entry = store.state.experts.find((e) => e.name === name)
  const src = expertAvatarByName(name)
  if (!chip) {
    chip = document.createElement('button')
    chip.id = 'prompt-expert'
    chip.className = 'prompt-expert'
    chip.type = 'button'
    chip.addEventListener('click', () => {
      const gone = ui.expert
      ui.expert = null
      store.save()
      renderExperts()
      renderPromptExpert()
      placeToolbarItems()
      toast(`已取消召唤「${gone}」`)
    })
    // 加在「+」和参数按钮之后，即工具栏左侧第三项
    left.appendChild(chip)
  }
  placeToolbarItems()
  chip.title = `当前专家：${name}，点击取消`
  chip.setAttribute('aria-label', `当前专家 ${name}，点击取消`)
  chip.innerHTML = `
    ${src
      ? `<img class="prompt-expert-avatar" src="${src}" alt="" loading="lazy" decoding="async" />`
      : `<span class="prompt-expert-avatar is-initial ${entry?.color ?? 'av-blue'}">${name[0]}</span>`}
    <span class="prompt-expert-name">${name}</span>
    <span class="prompt-expert-x">${EXPERT_X_ICON}</span>`
}

// 首页子菜单里的专家头像：仍是「首字 + 渐变底」时保持原样，有肖像则换 <img>
const avatarByName = (name, color) => {
  const src = expertAvatarByName(name)
  return src
    ? `<span class="expert-avatar has-photo ${color}"><img src="${src}" alt="" loading="lazy" decoding="async" /></span>`
    : `<span class="expert-avatar ${color}">${name[0]}</span>`
}

function renderExperts() {
  expertList.innerHTML = store.state.experts.map((ex) => `
    <button class="expert-item" type="button" role="menuitem" data-expert="${ex.name}">
      ${avatarByName(ex.name, ex.color)}
      <span class="expert-name">${ex.name}${ui.expert === ex.name ? ' ✓' : ''}</span>
    </button>`).join('')
}
renderExperts()
renderPromptExpert()

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
      renderPromptExpert()
      $('#prompt-expert')?.classList.add('is-arriving')
      setTimeout(() => $('#prompt-expert')?.classList.remove('is-arriving'), 1500)
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

/* 二级面板：鼠标指向主菜单某一行，右侧就显示该行的内容 */
const addSub = initAddSubPanels({
  attachments,
  addAttachment,
  pickFiles: () => fileInput.click(),
  openRefPicker: () => openReferencePicker(),
  onAttachmentsChange: () => renderChips(),
  closeMenu: () => closePopover(),
  fillPrompt: (text, files = []) => {
    input.value = text
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`
    files.forEach((f) => addAttachment(f.name, { size: f.size, from: f.from }))
    syncSendState()
    input.focus()
  },
})

/**
 * 按住「＋」的位置把菜单摆稳：
 * · 默认向上展开，高度上限 = 按钮上方的真实可用空间（不会顶穿顶栏 / 跑出屏幕）
 * · 上方实在放不下、下方更宽裕时才翻到下方
 * 菜单本身按底边对齐（见 styles.css），所以右侧面板换内容时主菜单不会再往上跑。
 */
function positionAddPopover() {
  if (!popover || !addBtn) return
  const rect = addBtn.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight || 800
  // 量不到真实位置（例如按钮暂时不可见）时不要瞎翻方向：保持默认的向上展开
  if (!rect.width && !rect.height && !rect.top) {
    popover.classList.remove('is-below')
    popover.style.setProperty('--pop-max', '620px')
    return
  }
  const margin = 16
  const above = rect.top - margin
  const below = vh - rect.bottom - margin
  const flip = above < 300 && below > above
  popover.classList.toggle('is-below', flip)
  const max = Math.max(200, Math.min(flip ? below : above, 620))
  popover.style.setProperty('--pop-max', `${Math.round(max)}px`)
}

function openPopover() {
  if (imgPopover && !imgPopover.hidden) closeImgPopover()
  if (effortIsOpen()) closeEffort()
  positionAddPopover()
  popover.hidden = false
  addBtn.setAttribute('aria-expanded', 'true')
  // 只要不指向某一行，右侧不显示任何下拉列表
  addSub.hide()
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
  addSub.show('experts')
  expertSub.hidden = false
  expertRow.classList.add('is-open')
  expertRow.setAttribute('aria-expanded', 'true')
}
function closeExpertSub() {
  addSub.hide()
  expertSub.hidden = true
  expertRow.classList.remove('is-open')
  expertRow.setAttribute('aria-expanded', 'false')
}

addBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  popoverIsOpen() ? closePopover() : openPopover()
})

// 窗口变化或页面滚动时重新贴着按钮摆（菜单开着才处理）
window.addEventListener('resize', () => { if (popoverIsOpen()) positionAddPopover() })
window.addEventListener('scroll', () => { if (popoverIsOpen()) positionAddPopover() }, { passive: true })
expertRow.addEventListener('mouseenter', openExpertSub)
expertRow.addEventListener('click', (event) => {
  event.stopPropagation()
  // 点击与鼠标指向一致：始终展开专家面板（收起由关闭整个菜单负责）
  openExpertSub()
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
fileInput.id = 'add-file-input'
fileInput.multiple = true
fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.json,.html,.css,.js,.ts,.png,.jpg,.jpeg,.webp,.gif,.svg'
fileInput.hidden = true
document.body.append(fileInput)

const TEXT_LIKE = /\.(txt|md|markdown|csv|tsv|json|html?|css|js|mjs|ts|tsx|jsx|ya?ml|xml|sql|py|sh|log|srt)$/i
const isTextFile = (f) => (f.type || '').startsWith('text/') || /json|javascript|xml|yaml|csv/i.test(f.type || '') || TEXT_LIKE.test(f.name || '')

// 文本类文件真读内容（截断到 6000 字），供引擎在生成时使用；二进制只记录元信息
function readFileIntoAttachment(file) {
  return new Promise((resolve) => {
    const meta = { size: file.size, type: file.type, from: '本地上传' }
    if (!isTextFile(file) || typeof FileReader === 'undefined') {
      addAttachment(file.name, meta)
      resolve()
      return
    }
    try {
      const reader = new FileReader()
      reader.onload = () => {
        addAttachment(file.name, { ...meta, text: String(reader.result ?? '').slice(0, 6000) })
        resolve()
      }
      reader.onerror = () => { addAttachment(file.name, meta); resolve() }
      reader.readAsText(file)
    } catch {
      addAttachment(file.name, meta)
      resolve()
    }
  })
}

fileInput.addEventListener('change', async () => {
  const files = [...fileInput.files]
  for (const f of files) await readFileIntoAttachment(f)
  fileInput.value = ''
  if (files.length) {
    const withText = attachments.filter((a) => a.text).length
    toast(`已附加 ${files.length} 个文件${withText ? `，其中 ${withText} 个已读取正文` : ''}`)
  }
  addSub.refresh()
})

function openReferencePicker() {
  const attachedNames = () => new Set(attachments.map((a) => a.name))
  // 对话里的文件：历史创作附件 + 媒体库，按最近优先
  const fromConversations = []
  store.state.gammas.forEach((g) => (g.attachments ?? []).forEach((a) => {
    if (!fromConversations.some((x) => x.name === a.name)) fromConversations.push({ name: a.name, from: `创作「${g.title}」` })
  }))
  const { bodyEl } = openModal({
    title: '引用对话中的文件（媒体库）',
    wide: true,
  })
  const render = () => {
    const done = attachedNames()
    bodyEl.innerHTML = `
      ${fromConversations.length ? `<p class="modal-copy">来自历史对话的附件</p>
      <div class="modal-list">${fromConversations.map((f) => `
        <button class="modal-list-item${done.has(f.name) ? ' is-on' : ''}" data-ref-name="${f.name}">
          <span class="gamma-thumb m-desk"></span>
          <span class="grow"><span class="primary">${f.name}</span>
          <span class="secondary">${f.from} · 对话文件</span></span>
          <span class="add-item-pill${done.has(f.name) ? ' is-on' : ''}">${done.has(f.name) ? '已引用' : '引用'}</span>
        </button>`).join('')}</div>` : ''}
      <p class="modal-copy">媒体库</p>
      <div class="modal-list">${store.state.media.map((m) => `
        <button class="modal-list-item${done.has(m.name) ? ' is-on' : ''}" data-ref="${m.id}">
          <span class="gamma-thumb ${m.cls}"></span>
          <span class="grow"><span class="primary">${m.name}</span>
          <span class="secondary">${m.source === 'ai' ? 'AI 生成' : '本地上传'} · ${m.gen}</span></span>
          <span class="add-item-pill${done.has(m.name) ? ' is-on' : ''}">${done.has(m.name) ? '已引用' : '引用'}</span>
        </button>`).join('')}</div>`
    const pick = (name) => {
      addAttachment(name, { from: '媒体库' })
      bodyEl.closest('.modal-mask').remove()
      addSub.refresh()
      toast(`已引用「${name}」`)
    }
    bodyEl.querySelectorAll('[data-ref]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const m = store.state.media.find((x) => x.id === btn.dataset.ref)
        if (!m) return
        pick(m.name)
      })
    })
    bodyEl.querySelectorAll('[data-ref-name]').forEach((btn) => {
      btn.addEventListener('click', () => pick(btn.dataset.refName))
    })
  }
  render()
}

popover.addEventListener('click', (event) => {
  const actionRow = event.target.closest('[data-action]')
  if (actionRow) {
    event.stopPropagation()
    const action = actionRow.dataset.action
    switch (action) {
      // 这六项都在右侧展开真实内容，不跳页也不只是弹提示
      case '添加文件': addSub.show('files'); fileInput.click(); break
      case '引用对话中的文件': addSub.show('refs'); openReferencePicker(); break
      case '模式': addSub.show('mode'); break
      case '技能': addSub.show('skills'); break
      case '连接器': addSub.show('connectors'); break
      case '新建': closePopover(); createBlankGamma(); break
      case '召唤更多专家': closePopover(); openExperts(); break
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
    renderPromptExpert()
    toast(`已选择专家：${ui.expert}`)
    closePopover()
  }
})

document.addEventListener('click', (event) => {
  // 点击的是菜单自己重绘掉的元素（例如技能开关、引用文件）时不要误判为「点到了外面」
  if (!event.target.isConnected) return
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
  closeMiniMenus?.()
  imgPopover.hidden = false
  imgBtn.setAttribute('aria-expanded', 'true')
}
function closeImgPopover() {
  imgPopover.hidden = true
  imgBtn.setAttribute('aria-expanded', 'false')
}
closeImgPopoverQuiet = () => { if (imgPopoverIsOpen()) closeImgPopover() }
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
  files.forEach((f) => addAttachment(f.name, { size: f.size, type: f.type, from: '参考图' }))
  addSub.refresh()
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

/* ---------------- 图片工作台：画面比例 / 生成数量 ---------------- */

const ratioBtn = $('#ratio-btn')
const ratioPop = $('#ratio-pop')
const ratioLabel = $('#ratio-label')
const countBtn = $('#count-btn')
const countPop = $('#count-pop')
const countLabel = $('#count-label')

function syncImageParams() {
  if (ratioLabel) ratioLabel.textContent = ui.ratio
  if (countLabel) countLabel.textContent = String(ui.count)
  $$('[data-ratio]').forEach((b) => {
    const on = b.dataset.ratio === ui.ratio
    b.classList.toggle('is-active', on)
    b.setAttribute('aria-checked', String(on))
  })
  $$('[data-count]').forEach((b) => {
    const on = Number(b.dataset.count) === ui.count
    b.classList.toggle('is-active', on)
    b.setAttribute('aria-checked', String(on))
  })
}
syncImageParams()

const miniOpen = (pop) => !!pop && !pop.hidden
function closeMiniMenus(except = null) {
  ;[[ratioPop, ratioBtn], [countPop, countBtn]].forEach(([pop, btn]) => {
    if (!pop || pop === except) return
    pop.hidden = true
    btn?.setAttribute('aria-expanded', 'false')
  })
}
function openMiniMenu(pop, btn) {
  if (popoverIsOpen()) closePopover()
  if (imgPopoverIsOpen()) closeImgPopover()
  if (effortIsOpen()) closeEffort()
  closeMiniMenus(pop)
  pop.hidden = false
  btn.setAttribute('aria-expanded', 'true')
}

ratioBtn?.addEventListener('click', (event) => {
  event.stopPropagation()
  miniOpen(ratioPop) ? closeMiniMenus() : openMiniMenu(ratioPop, ratioBtn)
})
countBtn?.addEventListener('click', (event) => {
  event.stopPropagation()
  miniOpen(countPop) ? closeMiniMenus() : openMiniMenu(countPop, countBtn)
})

$$('[data-ratio]').forEach((b) => {
  b.addEventListener('click', (event) => {
    event.stopPropagation()
    ui.ratio = b.dataset.ratio
    store.save()
    syncImageParams()
    closeMiniMenus()
    toast(`画面比例：${ui.ratio}`)
  })
})
$$('[data-count]').forEach((b) => {
  b.addEventListener('click', (event) => {
    event.stopPropagation()
    ui.count = Number(b.dataset.count)
    store.save()
    syncImageParams()
    closeMiniMenus()
    toast(`每次生成 ${ui.count} 张图片`)
  })
})

document.addEventListener('click', (event) => {
  if (!miniOpen(ratioPop) && !miniOpen(countPop)) return
  if (event.target.closest('.mini-menu-wrap')) return
  closeMiniMenus()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && (miniOpen(ratioPop) || miniOpen(countPop))) closeMiniMenus()
})

/* ---------------- 图片工作台：您还可以制作 ---------------- */

$$('[data-make]').forEach((card) => {
  card.addEventListener('click', () => {
    const name = card.dataset.make
    const desc = card.querySelector('em')?.textContent?.trim() ?? ''
    $$('[data-make]').forEach((c) => c.classList.toggle('is-active', c === card))
    input.value = `做一张${name}${desc ? `，内容方向：${desc}` : ''}。`
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`
    syncSendState()
    input.focus()
    toast(`已把「${name}」的起手句填进输入框`)
  })
})

/* ---------------- 美化工作台：上传原稿 + 美化方式 ---------------- */

const BEAUTIFY_STYLES = {
  restyle: { name: '更换视觉风格', desc: '全新的主题、字体和配色', ask: '更换视觉风格：换成全新的主题、字体和配色' },
  layout: { name: '重新设计布局', desc: '用更强大的布局重构卡片', ask: '重新设计布局：用更强大的布局重构卡片' },
  copy: { name: '精简文字', desc: '标题更清晰，文案更简洁', ask: '精简文字：让标题更清晰、文案更简洁' },
}

const beautifyDrop = $('#beautify-drop')
const beautifyInput = $('#beautify-file-input')

function syncBeautifyStyles() {
  $$('[data-beautify-style]').forEach((card) => {
    const on = card.dataset.beautifyStyle === ui.beautifyStyle
    card.classList.toggle('is-active', on)
    card.setAttribute('aria-pressed', String(on))
  })
}
syncBeautifyStyles()

beautifyDrop?.addEventListener('click', (event) => {
  if (event.target.closest('[data-beautify-pick]')) beautifyInput?.click()
})

beautifyInput?.addEventListener('change', () => {
  const files = [...beautifyInput.files]
  if (!files.length) return
  files.forEach((f) => addAttachment(f.name, { size: f.size, type: f.type, from: '美化原稿' }))
  addSub.refresh()
  toast(`已添加 ${files.length} 份原稿：${files.map((f) => f.name).join('、')}`)
  beautifyInput.value = ''
})

$$('[data-beautify-style]').forEach((card) => {
  card.addEventListener('click', () => {
    const key = card.dataset.beautifyStyle
    const style = BEAUTIFY_STYLES[key]
    if (!style) return
    ui.beautifyStyle = ui.beautifyStyle === key ? null : key
    store.save()
    syncBeautifyStyles()
    if (ui.beautifyStyle && !input.value.trim()) {
      input.value = style.ask
      input.style.height = 'auto'
      input.style.height = `${Math.min(input.scrollHeight, 160)}px`
      syncSendState()
    }
    toast(ui.beautifyStyle ? `美化方式：${style.name}` : `已取消「${style.name}」`)
  })
})

/* ---------------- 导入工作台：上传文件 / 导入模板 / 连接器来源 ---------------- */

const IMPORT_SOURCES = 5
const importDrop = $('#import-drop')
const importInput = $('#import-file-input')

const kindOf = (name = '') => {
  const ext = String(name).split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'PDF'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '表格'
  if (['doc', 'docx', 'md', 'txt', 'rtf'].includes(ext)) return '文档'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return '图片'
  if (['ppt', 'pptx', 'key'].includes(ext)) return '演示文稿'
  if (['js', 'ts', 'json', 'html', 'css', 'py'].includes(ext)) return '代码'
  return '文件'
}

importDrop?.addEventListener('click', (event) => {
  if (event.target.closest('[data-import-pick]')) importInput?.click()
})

importInput?.addEventListener('change', () => {
  const files = [...importInput.files]
  if (!files.length) return
  files.forEach((f) => addAttachment(f.name, { size: f.size, type: f.type, from: '导入文件' }))
  addSub.refresh()
  toast(`已加入 ${files.length} 个文件：${files.map((f) => f.name).join('、')}`)
  importInput.value = ''
})

/* 导入模板：真的在工作区里建一个可复用模板 */
function openImportTemplateModal() {
  const { close, bodyEl, footEl } = openModal({
    title: '导入模板',
    body: `
      <p class="modal-copy">把这次导入的内容存成可复用的工作区模板，之后在「模板」页可以一键套用。</p>
      <div class="field"><label>模板名称</label><input type="text" id="it-name" placeholder="例如：季度经营分析" /></div>
      <div class="field"><label>格式</label>
        <select id="it-format"><option>演示文稿</option><option>文档</option><option>社交轮播卡片</option></select>
      </div>
      <div class="field"><label>分类（逗号分隔）</label><input type="text" id="it-cats" placeholder="报告, 商业规划" /></div>`,
    footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>保存模板</button>',
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
  footEl.querySelector('[data-ok]').addEventListener('click', () => {
    const name = bodyEl.querySelector('#it-name').value.trim()
    if (!name) { toast('请先填写模板名称'); return }
    store.state.customTemplates.unshift({
      id: uid('tpl'),
      name,
      cls: null,
      a: name,
      b: '',
      format: bodyEl.querySelector('#it-format').value,
      cats: bodyEl.querySelector('#it-cats').value.split(/[,，]/).map((x) => x.trim()).filter(Boolean),
      cover: '#3b6ef6',
      archived: false,
      createdAt: Date.now(),
    })
    store.save()
    close()
    toast(`模板「${name}」已保存，可在模板页套用`)
  })
}

$('[data-import-template]')?.addEventListener('click', openImportTemplateModal)

/* 连接器来源：当前已连接的服务 + 目录补齐，点一下就设为导入来源 */
ui.importSource ??= null

function importSourceList() {
  const list = (store.state.connectors ?? []).map((c) => ({
    name: c.name, color: c.color || '#5b6ef5', shape: c.shape || 'cloud', connected: !!c.connected,
  }))
  // 优先补办公/知识类工具，避免把行情类连接器塞进「从您喜爱的工具导入」提示里
  const PREFERRED = ['腾讯文档', '飞书', 'QQ邮箱', '腾讯会议', '乐享知识库']
  const extras = [
    ...PREFERRED.map((name) => CONNECTOR_CATALOG.find((c) => c.name === name)).filter(Boolean),
    ...CONNECTOR_CATALOG,
  ]
  for (const c of extras) {
    if (list.length >= IMPORT_SOURCES) break
    if (!list.some((x) => x.name === c.name)) list.push({ name: c.name, color: c.color, shape: c.shape, connected: false })
  }
  return list.slice(0, IMPORT_SOURCES)
}

function renderImportSources() {
  const box = $('#import-sources')
  if (!box) return
  box.innerHTML = importSourceList().map((c) => `
    <button class="is-logo${ui.importSource === c.name ? ' is-active' : ''}" type="button"
      data-import-connector="${c.name}" style="--c:${c.color}"
      title="${c.name}${c.connected ? ' · 已连接' : ' · 未连接'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${CONNECTOR_ICONS[c.shape] ?? CONNECTOR_ICONS.cloud}</svg>
    </button>`).join('')
}
renderImportSources()

$('#import-sources')?.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-import-connector]')
  if (!btn) return
  const name = btn.dataset.importConnector
  let entry = store.state.connectors.find((c) => c.name === name)
  let newly = false
  if (!entry) {
    const cat = CONNECTOR_CATALOG.find((c) => c.name === name)
    entry = {
      id: `cn-${Date.now().toString(36)}`, name, connected: true,
      desc: cat?.desc, color: cat?.color, shape: cat?.shape, category: cat?.category,
    }
    store.state.connectors.push(entry)
    newly = true
  } else if (!entry.connected) {
    entry.connected = true
    newly = true
  }
  ui.importSource = name
  store.save()
  renderImportSources()
  toast(`${newly ? `已连接「${name}」，` : ''}导入来源：${name}`)
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

/* 点模板：不再直接生成，而是把它作为「引用」卡片放进输入框（截图效果） */
function coverOfCard(card) {
  const styleAttr = card.querySelector('.cover, .rec-cover')?.getAttribute('style') ?? ''
  const fromCss = /url\(['"]?([^'")]+)['"]?\)/.exec(styleAttr)?.[1]
  if (fromCss) return fromCss
  const tpl = (store.state.customTemplates ?? []).find((t) => t.name === card.dataset.template)
  return typeof tpl?.cover === 'string' && tpl.cover.startsWith('data:') ? tpl.cover : ''
}

$$('[data-template]').forEach((card) => {
  card.addEventListener('click', () => referenceTemplate(card.dataset.template, coverOfCard(card)))
})

function createBlankGamma() {
  const g = createGamma({ prompt: '', origin: 'blank', silent: true })
  toast(`已新建空白 Design Buddy「${g.title}」，可在「最近的 Design Buddy」中找到`)
}

$('.pill-outline').addEventListener('click', () => { location.href = 'templates.html' })
$('#view-all-templates')?.addEventListener('click', () => { location.href = 'templates.html' })
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
renderWork()
syncChrome()
syncSendState()
renderExamples()
placeToolbarItems()
applySmartSuggest()
// 连接器状态变化时刷新「导入」提示里的品牌小标（写在这里，避免早期订阅踩到 TDZ）
store.subscribe(() => renderImportSources())
