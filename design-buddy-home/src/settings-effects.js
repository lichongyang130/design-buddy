/* ============================================================
   设置真实生效层：把 settings 页的每一项接到可感知的实际行为上
   - 纯前端可行范围内全部真实消费，无后端依赖
   - initSettingsEffects() 由 global-ui 在每个页面调用一次
   - store.subscribe 驱动，设置改动后即时生效
   ============================================================ */

import { store, toast, openModal } from './core.js'
import { configureArt } from './template-engine.js'
import { applyI18n, LANG_HTML } from './i18n.js'
import { currentUser } from './auth.js'

const s = () => store.state.settings
let inited = false
let wakeLock = null
let lockTimer = null
let lockMask = null

/* ---------------- 个人主页：头像缩写 / 工作区名 ---------------- */

function userInitials(name) {
  const n = String(name || '').trim()
  if (!n) return ''
  // 中文取前两个字符，英文取各单词首字母
  return /[\u4e00-\u9fa5]/.test(n)
    ? n.slice(0, 2)
    : n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function applyIdentity() {
  // 登录用户缩写优先；未登录回退到设置 → 个人主页的自定义缩写
  const user = currentUser()
  const initials = String(user ? userInitials(user.name) : s().profile.initials || 'DB').slice(0, 2)
  document.querySelectorAll('.avatar').forEach((el) => { el.textContent = initials })
}

/* ---------------- 界面密度：真实改变疏密 ---------------- */

function applyDensity() {
  document.documentElement.dataset.density = s().appearance.density === 'compact' ? 'compact' : 'comfortable'
}

/* ---------------- 快捷键：全局真实注册 ---------------- */

function parseShortcut(str) {
  // 兼容 '⌘K'（无分隔符）与 'Ctrl+Shift+K' 两种写法
  const parts = String(str).replace(/⌘|⇧|⌥/g, (m) => `+${m}+`).split('+').map((p) => p.trim()).filter(Boolean)
  return {
    mod: parts.some((p) => p === '⌘' || p.toLowerCase() === 'ctrl' || p.toLowerCase() === 'meta'),
    shift: parts.some((p) => p === '⇧' || p.toLowerCase() === 'shift'),
    alt: parts.some((p) => p === '⌥' || p.toLowerCase() === 'alt'),
    key: parts.filter((p) => !['⌘', '⇧', '⌥', 'Ctrl', 'Meta', 'Shift', 'Alt'].includes(p)).pop()?.toLowerCase() ?? '',
  }
}

function matchShortcut(e, spec) {
  const want = parseShortcut(spec)
  return want.mod === (e.metaKey || e.ctrlKey) && want.shift === e.shiftKey && want.alt === e.altKey
    && e.key.toLowerCase() === want.key
}

function shortcutHandler(e) {
  const sc = s().shortcuts
  const hit = Object.entries(sc).find(([, spec]) => matchShortcut(e, spec))
  if (!hit) return
  const [action] = hit
  e.preventDefault()
  e.stopImmediatePropagation()
  if (action === 'search') {
    const visible = (el) => !el.hidden && !el.closest('[hidden]')
    const box = [...document.querySelectorAll('#settings-search, #tpl-search-input')].find(visible)
      || [...document.querySelectorAll('input[type="search"]')].find(visible)
    if (box) box.focus()
    else document.dispatchEvent(new CustomEvent('db:open-palette')) // 首页无可见搜索框 → 命令面板
  } else if (action === 'newGamma') {
    if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')) {
      document.querySelector('.topbar-right .pill')?.click()
    } else location.href = 'index.html?new=1'
  } else if (action === 'send') {
    document.querySelector('#send-btn')?.click()
  } else if (action === 'upload') {
    location.href = 'media.html'
  }
}

function applyShortcuts() {
  document.removeEventListener('keydown', shortcutHandler, true)
  document.addEventListener('keydown', shortcutHandler, true)
}

/* ---------------- 防止休眠：Screen Wake Lock API ---------------- */

async function applyWakeLock() {
  if (!('wakeLock' in navigator)) return
  try {
    if (s().keepAwake) {
      wakeLock = await navigator.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => { wakeLock = null })
    } else if (wakeLock) {
      await wakeLock.release()
      wakeLock = null
    }
  } catch { /* 页面不可见或权限拒绝时静默，下次可见再试 */ }
}

/* ---------------- 开机自动启动（web 等价：恢复上次页面） ---------------- */

const PAGE_WHITELIST = ['index.html', 'templates.html', 'themes.html', 'media.html', 'settings.html']

function applyAutoStart() {
  const page = location.pathname.split('/').pop() || 'index.html'
  store.state.lastPage = PAGE_WHITELIST.includes(page) ? page : 'index.html'
  store.save()
  if (!s().autoStart) return
  const restored = sessionStorage.getItem('db-page-restored')
  const last = store.state.lastPage
  if (!restored && page === 'index.html' && last && last !== 'index.html') {
    sessionStorage.setItem('db-page-restored', '1')
    location.replace(last)
  }
}

/* ---------------- 链接打开方式：全局外链委托（三态策略） ---------------- */

// 纯策略函数：返回 'blank'（新标签）或 'self'（当前标签），便于单测与复用
export function resolveLinkTarget(rawUrl, policy = s()?.linkOpen ?? '智能打开') {
  const url = String(rawUrl || '')
  const external = /^https?:\/\//.test(url)
  if (!external) return 'self' // 应用内相对链接永远留在当前标签
  if (policy === '始终在浏览器打开') return 'blank'
  if (policy === '始终在应用内打开') return 'self'
  // 智能打开：外链新标签（带 noopener 安全护栏），内链当前标签
  return 'blank'
}

function bindLinkPolicy() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]')
    if (!a) return
    const url = a.getAttribute('href') || ''
    if (!/^https?:\/\//.test(url)) return
    if (resolveLinkTarget(url, s().linkOpen) === 'blank') {
      e.preventDefault()
      window.open(url, '_blank', 'noopener')
    } else {
      e.preventDefault()
      location.href = url
    }
  }, true)
}

/* ---------------- 自动锁定：会话超时 + 两步验证（本地演示） ---------------- */

const TIMEOUT_MIN = { '15 分钟': 15, '30 分钟': 30, '1 小时': 60, '永不': 0 }

function demoCode() {
  const seed = String(s().profile.initials || 'DB')
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return String(100000 + (h % 900000))
}

function showLockMask() {
  if (lockMask) return
  lockMask = document.createElement('div')
  lockMask.className = 'app-lock'
  const twoFA = s().security.twoFA
  lockMask.innerHTML = `
    <div class="app-lock-card">
      <span class="app-lock-ico">🔒</span>
      <h3>${twoFA ? '两步验证' : '会话已锁定'}</h3>
      <p>${twoFA ? '输入 6 位演示验证码解锁（本地演示环境，验证码显示在下方）' : '点击下方按钮继续工作'}</p>
      ${twoFA ? `<input type="text" inputmode="numeric" maxlength="6" class="app-lock-input" placeholder="6 位验证码">
        <p class="app-lock-hint">演示验证码：<b>${demoCode()}</b></p>` : ''}
      <button type="button" class="btn btn-primary app-lock-unlock">${twoFA ? '验证并解锁' : '解锁'}</button>
    </div>`
  document.body.append(lockMask)
  const unlock = () => {
    if (twoFA) {
      const val = lockMask.querySelector('.app-lock-input').value.trim()
      if (val !== demoCode()) { toast('验证码不正确'); return }
    }
    lockMask.remove()
    lockMask = null
    armLockTimer()
  }
  lockMask.querySelector('.app-lock-unlock').addEventListener('click', unlock)
  lockMask.querySelector('.app-lock-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') unlock() })
}

function armLockTimer() {
  if (lockTimer) clearTimeout(lockTimer)
  const minutes = TIMEOUT_MIN[s().security.sessionTimeout] ?? 0
  if (!minutes) return
  lockTimer = setTimeout(async () => {
    // 锁屏运行方式：始终允许 → 不锁定；仅充电 → 充电中不锁定
    if (s().lockScreen === '始终允许') { armLockTimer(); return }
    if (s().lockScreen === '仅充电时允许' && navigator.getBattery) {
      const bat = await navigator.getBattery()
      if (bat.charging) { armLockTimer(); return }
    }
    showLockMask()
  }, minutes * 60 * 1000)
  // Node/jsdom 测试环境下不阻止进程退出；浏览器无 unref 方法则忽略
  lockTimer.unref?.()
}

function bindAutoLock() {
  ['click', 'keydown', 'scroll', 'mousemove'].forEach((evt) =>
    document.addEventListener(evt, () => { if (!lockMask) armLockTimer() }, { passive: true }))
  armLockTimer()
}

/* ---------------- 界面语言：真实 i18n，五页共享导航与设置页全量文案 ---------------- */

function applyLanguage() {
  const lang = s().language || '简体中文'
  applyI18n(lang)
}


/* ---------------- 网络代理：真实作为素材请求基址 ---------------- */

function applyProxy() {
  const mode = s().proxy
  if (mode === '自定义代理' && s().proxyUrl) {
    configureArt({ base: String(s().proxyUrl).replace(/\/$/, '') })
  } else {
    configureArt({ base: '' }) // 直接连接 / 系统代理（由浏览器接管）均用相对路径
  }
}

/* ---------------- 开机自启的 Web 等价：PWA 安装 ---------------- */

let deferredPrompt = null
let pwaInstalled = false
if (typeof window !== 'undefined') {
  try {
    pwaInstalled = !!(window.matchMedia?.('(display-mode: standalone)').matches
      || window.navigator?.standalone === true)
  } catch { pwaInstalled = false }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    pwaInstalled = true
    document.dispatchEvent(new CustomEvent('db:pwa-changed'))
  })
}

export function pwaState() {
  if (pwaInstalled) return 'installed'
  if (deferredPrompt) return 'installable'
  return 'unsupported'
}

export async function installPwa() {
  if (pwaInstalled) return { ok: false, reason: 'installed' }
  if (!deferredPrompt) return { ok: false, reason: 'unsupported' }
  deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  if (choice.outcome === 'accepted') deferredPrompt = null
  document.dispatchEvent(new CustomEvent('db:pwa-changed'))
  return { ok: choice.outcome === 'accepted', reason: choice.outcome }
}

/* ---------------- 唤醒锁：手动测试 + 状态查询 ---------------- */

export function wakeLockState() {
  if (!('wakeLock' in navigator)) return 'unsupported'
  if (!s().keepAwake) return 'disabled'
  return wakeLock ? 'active' : 'idle'
}

export async function testWakeLock() {
  if (!('wakeLock' in navigator)) return { state: 'unsupported' }
  if (!s().keepAwake) return { state: 'disabled' }
  try {
    const wl = await navigator.wakeLock.request('screen')
    wakeLock = wl
    wl.addEventListener('release', () => { if (wakeLock === wl) wakeLock = null })
    return { state: 'active' }
  } catch (err) {
    return { state: 'failed', message: String(err?.message || err) }
  }
}

/* ---------------- 锁屏运行：立即体验，三种策略真实分叉 ---------------- */

export function previewLockScreen() {
  const mode = s().lockScreen
  if (mode === '始终允许') {
    toast('锁屏后远程控制与后台 Agent 任务继续运行，不会中断')
    return 'allowed'
  }
  if (mode === '仅充电时允许') {
    if (!navigator.getBattery) {
      // 浏览器不暴露电池状态时采取保守策略：锁定，与「关闭」行为一致
      showLockMask()
      return 'locked'
    }
    navigator.getBattery().then((bat) => {
      if (bat.charging) toast('充电中：锁屏后任务继续运行')
      else showLockMask()
    })
    return 'battery-check'
  }
  showLockMask()
  return 'locked'
}

/* ---------------- 网络代理：真实连通性测试 ---------------- */

export async function testProxyConnection() {
  const mode = s().proxy
  let base = ''
  if (mode === '自定义代理') {
    const url = String(s().proxyUrl || '').trim()
    if (!url) return { ok: false, reason: 'empty' }
    try { new URL(url) } catch { return { ok: false, reason: 'bad-url' } }
    base = url.replace(/\/$/, '')
  }
  // Node/旧环境 fetch 不接受相对 URL，统一用 origin 补全为绝对地址
  const target = new URL(`${base}/art/manifest.json`, location.origin).href
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 6000)
  const t0 = performance.now()
  try {
    const res = await fetch(target, { signal: ctl.signal })
    clearTimeout(timer)
    return { ok: res.ok, status: res.status, ms: Math.round(performance.now() - t0), target, mode }
  } catch (err) {
    clearTimeout(timer)
    return { ok: false, reason: err?.name === 'AbortError' ? 'timeout' : 'network', target, mode }
  }
}

/* ---------------- Service Worker：支撑 PWA 安装与离线外壳 ---------------- */

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  if (location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(location.hostname)) return
  navigator.serviceWorker.register('sw.js').catch(() => { /* 测试环境或权限受限时静默 */ })
}

/* ---------------- 每周报告：真实数据统计弹窗 ---------------- */

function weeklyReportCheck() {
  if (!s().personalize.weeklyReport) return
  const WEEK = 7 * 86400000
  if (store.state.lastReportAt && Date.now() - store.state.lastReportAt < WEEK) return
  const now = Date.now()
  const made = store.state.gammas.filter((g) => !g.deleted && now - g.createdAt < WEEK)
  const mediaN = store.state.media.length
  const editN = Object.keys(store.state.templateEdits ?? {}).length
  store.state.lastReportAt = now
  store.save()
  openModal({
    title: '本周创作报告',
    body: `<div class="report-grid">
      <div class="report-cell"><b>${made.length}</b><span>本周新建创作</span></div>
      <div class="report-cell"><b>${store.state.gammas.filter((g) => !g.deleted).length}</b><span>累计创作</span></div>
      <div class="report-cell"><b>${mediaN}</b><span>媒体素材</span></div>
      <div class="report-cell"><b>${editN}</b><span>编辑过的模板</span></div>
    </div>`,
  })
}

/* ---------------- 语音朗读：Web Speech API，真实发声 ---------------- */

const VOICE_MAP = {
  温暖女声: { lang: 'zh-CN', pitch: 1.15, rate: 0.95 },
  清亮女声: { lang: 'zh-CN', pitch: 1.35, rate: 1.05 },
  沉稳男声: { lang: 'zh-CN', pitch: 0.8, rate: 0.92 },
  中性合成音: { lang: 'zh-CN', pitch: 1.0, rate: 1.0 },
}

export function speak(text) {
  if (!('speechSynthesis' in window)) { toast('当前浏览器不支持语音朗读'); return }
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const cfg = VOICE_MAP[s().assistant.voice] ?? VOICE_MAP['温暖女声']
  u.lang = cfg.lang
  u.pitch = cfg.pitch
  u.rate = cfg.rate
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith(cfg.lang.slice(0, 2)))
  if (voices.length) u.voice = voices[0]
  window.speechSynthesis.speak(u)
}

/* ---------------- 供其他模块复用的过滤辅助 ---------------- */

// 应用开关 → 首页创作类型 chips 显隐（只约束名单内的创作类型，工具类 chip 不受影响）
export function applyAppChips() {
  const apps = s().apps
  const managed = new Set(apps.map((a) => a.name))
  const onNames = new Set(apps.filter((a) => a.on).map((a) => a.name))
  document.querySelectorAll('[data-chip]').forEach((chip) => {
    const name = chip.textContent.trim()
    if (managed.has(name)) chip.hidden = !onNames.has(name)
  })
}

// 智能体开关 → 专家菜单只展示启用项
export function activeAgents() {
  return s().agents.filter((a) => a.on)
}

/* ---------------- 初始化 ---------------- */

export function initSettingsEffects() {
  if (inited) return
  inited = true
  const sync = () => {
    applyIdentity()
    applyDensity()
    applyShortcuts()
    applyWakeLock()
    applyLanguage()
    applyProxy()
    applyAppChips()
  }
  sync()
  store.subscribe(sync)
  bindLinkPolicy()
  bindAutoLock()
  applyAutoStart()
  registerServiceWorker()
  weeklyReportCheck()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && s().keepAwake) applyWakeLock()
  })
  if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => {}
}
