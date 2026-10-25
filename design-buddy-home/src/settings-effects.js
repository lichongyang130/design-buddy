/* ============================================================
   设置真实生效层：把 settings 页的每一项接到可感知的实际行为上
   - 纯前端可行范围内全部真实消费，无后端依赖
   - initSettingsEffects() 由 global-ui 在每个页面调用一次
   - store.subscribe 驱动，设置改动后即时生效
   ============================================================ */

import { store, toast, openModal } from './core.js'
import { configureArt } from './template-engine.js'

const s = () => store.state.settings
let inited = false
let wakeLock = null
let lockTimer = null
let lockMask = null

/* ---------------- 个人主页：头像缩写 / 工作区名 ---------------- */

function applyIdentity() {
  // 头像缩写五页实时同步；显示名称在消息弹窗的助理身份中消费
  const initials = String(s().profile.initials || 'DB').slice(0, 2)
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

/* ---------------- 链接打开方式：全局外链委托 ---------------- */

function bindLinkPolicy() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]')
    if (!a) return
    const url = a.getAttribute('href') || ''
    if (!/^https?:\/\//.test(url)) return
    const policy = s().linkOpen
    if (policy === '始终在浏览器打开') {
      e.preventDefault()
      window.open(url, '_blank', 'noopener')
    } else if (policy === '始终在应用内打开') {
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

/* ---------------- 界面语言：设置页即时双语（含繁/日字典） ---------------- */

const I18N_DICT = {
  '简体中文': {
    'nav.general': '通用', 'nav.profile': '个人主页', 'nav.billing': '套餐与积分', 'nav.appearance': '外观',
    'nav.shortcuts': '快捷键', 'nav.personalize': '个性化', 'nav.memory': '记忆与进化', 'nav.agents': '智能体',
    'nav.models': '模型', 'nav.assistant': '助理', 'nav.devices': '设备连接', 'nav.data': '数据管理',
    'nav.apps': '应用管理', 'nav.security': '安全中心',
  },
  '繁體中文': {
    'nav.general': '通用', 'nav.profile': '個人主頁', 'nav.billing': '套餐與積分', 'nav.appearance': '外觀',
    'nav.shortcuts': '快捷鍵', 'nav.personalize': '個人化', 'nav.memory': '記憶與進化', 'nav.agents': '智能體',
    'nav.models': '模型', 'nav.assistant': '助理', 'nav.devices': '裝置連接', 'nav.data': '資料管理',
    'nav.apps': '應用管理', 'nav.security': '安全中心',
  },
  English: {
    'nav.general': 'General', 'nav.profile': 'Profile', 'nav.billing': 'Plan & credits', 'nav.appearance': 'Appearance',
    'nav.shortcuts': 'Shortcuts', 'nav.personalize': 'Personalization', 'nav.memory': 'Memory', 'nav.agents': 'Agents',
    'nav.models': 'Models', 'nav.assistant': 'Assistant', 'nav.devices': 'Devices', 'nav.data': 'Data',
    'nav.apps': 'Apps', 'nav.security': 'Security',
  },
  '日本語': {
    'nav.general': '一般', 'nav.profile': 'プロフィール', 'nav.billing': 'プラン', 'nav.appearance': '外観',
    'nav.shortcuts': 'ショートカット', 'nav.personalize': '個人設定', 'nav.memory': 'メモリー', 'nav.agents': 'エージェント',
    'nav.models': 'モデル', 'nav.assistant': 'アシスタント', 'nav.devices': 'デバイス', 'nav.data': 'データ',
    'nav.apps': 'アプリ', 'nav.security': 'セキュリティ',
  },
}
const NAV_KEY_BY_LABEL = {
  通用: 'nav.general', 个人主页: 'nav.profile', 套餐与积分: 'nav.billing', 外观: 'nav.appearance',
  快捷键: 'nav.shortcuts', 个性化: 'nav.personalize', 记忆与进化: 'nav.memory', 智能体: 'nav.agents',
  模型: 'nav.models', 助理: 'nav.assistant', 设备连接: 'nav.devices', 数据管理: 'nav.data',
  应用管理: 'nav.apps', 安全中心: 'nav.security',
}

function applyLanguage() {
  const lang = s().language || '简体中文'
  document.documentElement.lang = lang === 'English' ? 'en' : lang === '日本語' ? 'ja' : 'zh'
  const dict = I18N_DICT[lang] ?? I18N_DICT['简体中文']
  document.querySelectorAll('[data-settings]').forEach((item) => {
    const key = NAV_KEY_BY_LABEL[item.dataset.label] || item.dataset.i18n
    if (key && dict[key]) item.textContent = dict[key]
  })
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
  weeklyReportCheck()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && s().keepAwake) applyWakeLock()
  })
  if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => {}
}
