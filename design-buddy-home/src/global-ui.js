import './ui-language-bootstrap.js'
/* ============================================================
   全局 UI：外观持久化应用、⌘K 命令面板、帮助 / 邀请 / 消息 /
   升级弹窗；专家 / 技能 / 连接器已升级为独立页面（experts / skills / connectors）。
   ============================================================ */

import './features.css'
import { store, openModal, confirmModal, toast, copyText, fmtDate, uid } from './core.js'
import { initSettingsEffects, speak } from './settings-effects.js'
import { currentUser, logout } from './auth.js'

/* ---------------- 外观设置全局生效 ---------------- */

const FONT_STACKS = {
  system: "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei'",
  song: "'Songti SC', 'SimSun', serif",
  hei: "'Heiti SC', 'Microsoft YaHei', sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  mono: "'SF Mono', 'Cascadia Code', Consolas, monospace",
}

// 标准主题色板：与 themes.css 的 18 套主题对应
export const THEME_COLORS = {
  'th-pearl': { accent: '#2f5bd6', heading: '#232b3d' },
  'th-vortex': { accent: '#7cc4ff', heading: '#f2f3f5' },
  'th-clementa': { accent: '#e07b2f', heading: '#5a3d22' },
  'th-stratos': { accent: '#6db3ff', heading: '#eef2ff' },
  'th-nova': { accent: '#3b6ef6', heading: '#41568f' },
  'th-twilight': { accent: '#d2604f', heading: '#4a4356' },
  'th-coral-glow': { accent: '#d6455f', heading: '#a03d52' },
  'th-mercury': { accent: '#5b7bb4', heading: '#5b6472' },
  'th-ashrose': { accent: '#8a7bb0', heading: '#6b6470' },
  'th-spectrum': { accent: '#8b5cf6', heading: '#3b6ef6' },
  'th-chisel': { accent: '#1f2430', heading: '#1f2430' },
  'th-stardust': { accent: '#ff9a3d', heading: '#f5f2ea' },
  'th-seafoam': { accent: '#1f9d7e', heading: '#17453c' },
  'th-nebulae': { accent: '#7cd8ff', heading: '#cbb8ff' },
  'th-creme': { accent: '#9a6f2e', heading: '#4a3820' },
  'th-lux': { accent: '#ef8a6b', heading: '#f0e2c0' },
  'th-consultant': { accent: '#2f5bd6', heading: '#233252' },
  'th-marine': { accent: '#a9c2ff', heading: '#f2f4fa' },
}

export function applyAppearance() {
  const s = store.state.settings
  const root = document.documentElement

  // 字体
  root.style.setProperty('--app-font', FONT_STACKS[s.fontFamily] ?? FONT_STACKS.system)
  root.dataset.appFont = s.fontFamily

  // 字号：现代浏览器用 zoom 整体缩放；同时写 CSS 变量供不支持 zoom 的环境回退
  document.body.style.zoom = String(s.fontScale)
  root.style.setProperty('--font-scale', String(s.fontScale))

  // 主题色
  const themeId = s.appearance.themeId || store.state.appliedTheme
  const custom = [...store.state.customThemes, ...store.state.archivedThemes].find((t) => t.id === themeId)
  let colors = null
  if (custom?.vars) colors = { accent: custom.vars.accent ?? custom.vars.link, heading: custom.vars.title }
  else if (custom?.cls) colors = THEME_COLORS[custom.cls]
  else colors = THEME_COLORS[themeId] ?? null
  if (colors) {
    root.dataset.appAccent = colors.accent
    root.style.setProperty('--app-accent', colors.accent)
    root.dataset.appHeading = colors.heading
    root.style.setProperty('--app-heading', colors.heading)
  } else {
    delete root.dataset.appAccent
    delete root.dataset.appHeading
    root.style.removeProperty('--app-accent')
    root.style.removeProperty('--app-heading')
  }

  // 减弱动效
  root.dataset.reduceMotion = s.appearance.reduceMotion ? 'true' : 'false'
}

/* ---------------- 升级 / 套餐 ---------------- */

export function openUpgrade() {
  const ws = store.state.workspaces.find((w) => w.id === store.state.activeWorkspaceId)
  const packs = [
    { credits: 100, price: '¥19' },
    { credits: 300, price: '¥49' },
    { credits: 800, price: '¥109' },
  ]
  const { close, bodyEl, footEl } = openModal({
    title: '升级获得更多 AI 功能',
    footer: '<button class="btn btn-ghost" data-close>稍后再说</button>',
  })
  bodyEl.innerHTML = `
    <p class="modal-copy">当前工作区：<strong translate="no">${ws.name}</strong>，套餐 <strong>${ws.plan === 'pro' ? 'Pro' : 'Free'}</strong>，剩余积分 <strong>${store.state.credits}</strong></p>
    <div class="plan-grid">
      <div class="plan-card ${ws.plan === 'free' ? 'is-picked' : ''}">
        <h4>Free</h4>
        <p>基础创作能力</p>
        <ul><li>236 起步积分</li><li>标准 / Lite 模式</li><li>单个工作区</li></ul>
        <button class="btn btn-ghost" data-plan="free">当前套餐</button>
      </div>
      <div class="plan-card pro ${ws.plan === 'pro' ? 'is-picked' : ''}">
        <h4>Pro <span class="pro-tag">推荐</span></h4>
        <p>解锁 Max 与智能媒体搜索</p>
        <ul><li>每月 2000 积分</li><li>Lite / 标准 / Max 全模式</li><li>Design Buddy 智能助手搜索</li></ul>
        <button class="btn btn-primary" data-plan="pro">${ws.plan === 'pro' ? '已开通' : '升级 Pro'}</button>
      </div>
    </div>
    <h4 class="pack-title">积分加油包</h4>
    <div class="pack-row">
      ${packs.map((p) => `<button class="pack" data-pack="${p.credits}"><strong>${p.credits}</strong> 积分<span>${p.price}</span></button>`).join('')}
    </div>`

  bodyEl.querySelector('[data-plan="pro"]')?.addEventListener('click', () => {
    ws.plan = 'pro'
    store.save()
    toast('已升级到 Pro，Max 模式已解锁')
    close()
  })
  bodyEl.querySelector('[data-plan="free"]')?.addEventListener('click', () => toast('当前已是 Free 套餐'))
  bodyEl.querySelectorAll('[data-pack]').forEach((b) => {
    b.addEventListener('click', () => {
      store.state.credits += Number(b.dataset.pack)
      store.save()
      toast(`已充值 ${b.dataset.pack} 积分，当前余额 ${store.state.credits}`)
      close()
    })
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
}

/* ---------------- 帮助 ---------------- */

export function openHelp() {
  openModal({
    title: '帮助与快捷键',
    body: `
      <div class="help-grid">
        <div><kbd>⌘ / Ctrl + K</kbd><span>全局搜索与快捷命令</span></div>
        <div><kbd>⌘ / Ctrl + Enter</kbd><span>发送提示词</span></div>
        <div><kbd>⌘ / Ctrl + N</kbd><span>从空白新建</span></div>
        <div><kbd>Esc</kbd><span>关闭弹窗 / 菜单</span></div>
      </div>
      <p class="modal-copy" style="margin-top:14px">所有数据保存在本浏览器本地（localStorage 与 IndexedDB），可在「设置 → 数据管理」中导出或清空。</p>`,
  })
}

/* ---------------- 邀请 / 消息 ---------------- */

export function openInvite() {
  const link = `${location.origin}/invite/${store.state.activeWorkspaceId}`
  const { close, bodyEl, footEl } = openModal({
    title: '邀请成员加入工作区',
    footer: '<button class="btn btn-ghost" data-close>关闭</button><button class="btn btn-primary" data-copy>复制邀请链接</button>',
  })
  bodyEl.innerHTML = `
    <p class="modal-copy">发送下面的链接邀请同事协作，加入后可查看工作区内共享的 Design Buddy。</p>
    <div class="invite-link">${link}</div>`
  footEl.querySelector('[data-copy]').addEventListener('click', () => copyText(link))
  footEl.querySelector('[data-close]').addEventListener('click', close)
}

export function openMessages() {
  const { bodyEl } = openModal({ title: '消息' })
  const assistantName = store.state.settings.assistant.name || 'Buddy'
  const render = () => {
    bodyEl.innerHTML = `
      <div class="modal-list">
        ${store.state.messages.map((m) => `
          <div class="modal-list-item">
            <div class="grow">
              <div class="primary">${m.from === 'Design Buddy' ? assistantName : m.from}</div>
              <div class="secondary" translate="no">${m.text}</div>
              <div class="secondary">${fmtDate(m.at)}</div>
            </div>
            <button class="icon-mini" data-speak="${uid('sp')}" title="朗读" aria-label="朗读">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>
            </button>
          </div>`).join('')}
      </div>
      <div class="msg-form">
        <input type="text" id="msg-input" placeholder="给 ${assistantName} 发消息…" />
        <button class="btn btn-primary" id="msg-send">发送</button>
      </div>`
    bodyEl.querySelectorAll('[data-speak]').forEach((btn, i) => {
      btn.addEventListener('click', () => speak(store.state.messages[i].text))
    })
    const input = bodyEl.querySelector('#msg-input')
    bodyEl.querySelector('#msg-send').addEventListener('click', () => {
      const text = input.value.trim()
      if (!text) return
      store.state.messages.push({ id: uid('m'), from: '我', text, at: Date.now() })
      store.save()
      render()
    })
  }
  render()
}

/* ---------------- 技能 / 专家 / 连接器 ---------------- */

/* 技能已升级为独立页面（skills.html，左侧沿用首页窄栏 rail）。
   窄栏「更多 → 技能」、首页菜单与专家页页签都走这里。 */
const SKILLS_PAGE = 'skills.html'

export function openSkills() {
  if (location.pathname.endsWith(SKILLS_PAGE)) return
  location.href = SKILLS_PAGE
}

/* 专家已升级为独立页面（experts.html，左侧沿用首页窄栏 rail）。
   所有「专家」入口统一走这里：首页的召唤更多专家、窄栏「更多」、技能页的专家页签。
   已在本页时不做任何事，避免无意义重载。 */
const EXPERTS_PAGE = 'experts.html'

export function openExperts() {
  if (location.pathname.endsWith(EXPERTS_PAGE)) return
  location.href = EXPERTS_PAGE
}

/* 连接器已升级为独立页面（connectors.html，左侧沿用首页窄栏 rail）。
   首页菜单、窄栏「更多」、专家页与技能页的页签都走这里。 */
const CONNECTORS_PAGE = 'connectors.html'

export function openConnectors() {
  if (location.pathname.endsWith(CONNECTORS_PAGE)) return
  location.href = CONNECTORS_PAGE
}

/* ---------------- ⌘K 命令面板 ---------------- */

const PAGE_ITEMS = [
  { label: '首页', icon: '🏠', href: 'index.html', tag: '页面' },
  { label: '模板', icon: '🧩', href: 'templates.html', tag: '页面' },
  { label: '主题', icon: '🎨', href: 'themes.html', tag: '页面' },
  { label: '媒体库', icon: '🖼️', href: 'media.html', tag: '页面' },
  { label: '设置', icon: '⚙️', href: 'settings.html', tag: '页面' },
]

export function openPalette() {
  if (document.querySelector('.palette-mask')) return
  const mask = document.createElement('div')
  mask.className = 'palette-mask'
  mask.innerHTML = `
    <div class="palette" role="dialog" aria-modal="true">
      <div class="palette-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="palette-input" placeholder="搜索页面、Design Buddy、主题或操作…" />
      </div>
      <div class="palette-results" id="palette-results"></div>
    </div>`
  document.body.append(mask)
  const input = mask.querySelector('#palette-input')
  const results = mask.querySelector('#palette-results')
  let active = 0

  const dataItems = [
    ...PAGE_ITEMS,
    ...store.state.gammas.filter((g) => !g.deleted).map((g) => ({ label: g.title, icon: '📄', href: 'index.html', tag: 'Design Buddy', personal: true })),
    ...store.state.media.map((m) => ({ label: m.name, icon: '🎬', href: 'media.html', tag: '媒体', personal: true })),
    { label: '升级套餐', icon: '✨', action: 'upgrade', tag: '操作' },
    { label: '帮助与快捷键', icon: '❓', action: 'help', tag: '操作' },
  ]

  const render = () => {
    const q = input.value.trim().toLowerCase()
    const list = dataItems.filter((it) => it.label.toLowerCase().includes(q))
    active = 0
    results.innerHTML = list.length
      ? list.map((it, i) => `
        <button class="palette-item ${i === 0 ? 'is-active' : ''}" data-i="${i}">
          <span>${it.icon}</span><span ${it.personal ? 'translate="no"' : ''}>${it.label}</span><span class="tag">${it.tag}</span>
        </button>`).join('')
      : '<div class="palette-empty">没有匹配的结果</div>'
    results._items = list
  }
  render()
  input.focus()

  input.addEventListener('input', render)
  input.addEventListener('keydown', (e) => {
    const items = results._items ?? []
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      active = (active + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % Math.max(items.length, 1)
      results.querySelectorAll('.palette-item').forEach((el, i) => el.classList.toggle('is-active', i === active))
    }
    if (e.key === 'Enter' && items[active]) run(items[active])
  })
  results.addEventListener('click', (e) => {
    const btn = e.target.closest('.palette-item')
    if (btn) run(results._items[Number(btn.dataset.i)])
  })
  mask.addEventListener('click', (e) => { if (e.target === mask) close() })
  const onKey = (e) => { if (e.key === 'Escape') close() }
  document.addEventListener('keydown', onKey)
  function close() { mask.remove(); document.removeEventListener('keydown', onKey) }
  function run(it) {
    close()
    if (it.action === 'upgrade') return openUpgrade()
    if (it.action === 'help') return openHelp()
    location.href = it.href
  }
}

/* ---------------- 初始化（每页调用一次） ---------------- */

/* ---------------- 账号弹窗（rail 底部头像） ---------------- */

const PROVIDER_LABEL = {
  email: '邮箱账号',
  google: 'Google · 本地演示身份',
  github: 'GitHub · 本地演示身份',
  guest: '游客模式 · 本地演示',
}

function nameInitials(name) {
  const n = (name || '').trim()
  if (!n) return '?'
  // 中文名取末两位以内字符，英文取首字母
  return /[\u4e00-\u9fa5]/.test(n) ? n.slice(0, 2) : n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export function openAccount() {
  const user = currentUser()
  if (!user) {
    location.replace('auth.html')
    return
  }
  const { close, bodyEl, footEl } = openModal({
    title: '账号',
    footer: '<button class="btn btn-ghost" data-close>关闭</button><button class="btn btn-danger" data-logout>退出登录</button>',
  })
  bodyEl.innerHTML = `
    <div class="account-head">
      <span class="avatar ${user.color} account-avatar">${nameInitials(user.name)}</span>
      <div class="account-meta">
        <div class="account-name">${user.name}</div>
        <div class="account-email">${user.email}</div>
        <span class="account-provider">${PROVIDER_LABEL[user.provider] ?? '邮箱账号'}</span>
      </div>
    </div>
    <p class="modal-copy">账号信息保存在本浏览器（localStorage），不会上传到任何服务器。</p>`
  footEl.querySelector('[data-close]').addEventListener('click', close)
  footEl.querySelector('[data-logout]').addEventListener('click', async () => {
    const ok = await confirmModal('退出登录', '退出后需要重新登录才能继续使用，确定退出吗？', '退出登录')
    if (!ok) return
    logout()
    location.replace('auth.html')
  })
}

export function initGlobalUI() {
  applyAppearance()
  store.subscribe(applyAppearance)
  initSettingsEffects()

  // rail 底部头像 → 账号弹窗（五页通用）
  document.addEventListener('click', (e) => {
    const avatar = e.target.closest('.rail-footer .avatar')
    if (avatar) {
      e.preventDefault()
      openAccount()
    }
  })

  // 快捷键统一由 settings-effects 调度；首页无搜索框时通过事件打开命令面板
  document.addEventListener('db:open-palette', openPalette)

  // 窄栏底部的邀请 / 消息（五页通用，data-demo 升级为真实弹窗）
  document.addEventListener('click', (e) => {
    const demo = e.target.closest('[data-demo]')
    if (!demo) return
    const map = { 邀请成员: openInvite, 消息: openMessages, 帮助: openHelp, '升级至 Plus': openUpgrade }
    const fn = map[demo.dataset.demo]
    if (fn) {
      e.preventDefault()
      fn()
    }
  })
}
