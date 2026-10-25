/* ============================================================
   登录 / 注册页交互：tab 切换、双语、邮箱注册登录、
   Google/GitHub 诚实本地演示身份、忘记密码说明
   ============================================================ */

import {
  registerWithEmail, loginWithEmail, loginWithProvider, currentUser,
} from './auth.js'

const DICT = {
  zh: {
    'hero.title': '把灵感变成演示、文档与主题',
    'hero.sub': '950 套原创模板、本地优先的创作工作台。登录后同步你的工作区、模板编辑与媒体库。',
    'hero.p1': '账号与作品仅保存在本浏览器，零后端、零追踪',
    'hero.p2': '离线可用，登录状态本地保持 30 天',
    'hero.p3': '支持 Google、GitHub 与邮箱三种方式',
    'tab.login': '登录', 'tab.register': '注册',
    'provider.google': '使用 Google 继续',
    'provider.github': '使用 GitHub 继续',
    divider: '或使用邮箱',
    'field.name': '昵称', 'field.email': '邮箱', 'field.password': '密码',
    'field.confirm': '确认密码', 'field.remember': '30 天内自动登录',
    'field.forgot': '忘记密码？',
    terms: '继续即代表同意本地演示条款：数据仅存储在当前浏览器，清除浏览器数据将同时清除账号。',
    'common.cancel': '取消',
    'ph.name': '例如：林小满',
    'ph.email': 'you@example.com',
    'ph.password.login': '请输入密码',
    'ph.password.register': '至少 8 位，含字母',
    'ph.confirm': '再次输入密码',
    'alert.registering': '正在创建账号…',
    'alert.logging': '正在登录…',
    'alert.success.register': '注册成功，正在进入工作台…',
    'alert.success.login': '登录成功，正在进入工作台…',
    'forgot.title': '忘记密码',
    'forgot.copy': 'Design Buddy 是零后端本地应用，密码以加盐散列保存在本浏览器中，无法通过邮件找回。<br><br>你可以：<br>1. 仔细回忆后重新输入；<br>2. 使用另一个邮箱注册新账号；<br>3. 若确认放弃旧账号，可在「设置 → 数据管理 → 重置应用」清空本地全部数据后重新开始（该操作会同时删除本地作品）。',
    'provider.title.google': 'Google 登录（本地演示）',
    'provider.title.github': 'GitHub 登录（本地演示）',
    'provider.copy': '本应用为<b>零后端、零密钥</b>的本地演示环境，未配置 OAuth 客户端 ID，无法跳转真实 Google/GitHub 授权页。<br><br>点击「继续本地演示登录」将在本机创建一个带 <b>{badge}</b> 提供商标记的真实本地账号与登录会话，功能与邮箱账号完全一致；部署到生产环境时接入 OAuth Client ID 即可无缝替换为真实授权。',
    'provider.nameLabel': '显示昵称',
    'provider.ok': '继续本地演示登录',
  },
  en: {
    'hero.title': 'Turn ideas into decks, docs and themes',
    'hero.sub': '950 original templates in a local-first creative workspace. Sign in to keep your workspace, template edits and media library in sync on this device.',
    'hero.p1': 'Accounts and work stay in this browser — no backend, no tracking',
    'hero.p2': 'Works offline; the local session lasts 30 days',
    'hero.p3': 'Google, GitHub and email sign-in supported',
    'tab.login': 'Sign in', 'tab.register': 'Sign up',
    'provider.google': 'Continue with Google',
    'provider.github': 'Continue with GitHub',
    divider: 'or with email',
    'field.name': 'Display name', 'field.email': 'Email', 'field.password': 'Password',
    'field.confirm': 'Confirm password', 'field.remember': 'Keep me signed in for 30 days',
    'field.forgot': 'Forgot password?',
    terms: 'By continuing you accept the local demo terms: data lives only in this browser, and clearing browser data removes the account too.',
    'common.cancel': 'Cancel',
    'ph.name': 'e.g. Maya Lin',
    'ph.email': 'you@example.com',
    'ph.password.login': 'Enter your password',
    'ph.password.register': 'At least 8 characters with a letter',
    'ph.confirm': 'Re-enter your password',
    'alert.registering': 'Creating your account…',
    'alert.logging': 'Signing you in…',
    'alert.success.register': 'Account created — entering workspace…',
    'alert.success.login': 'Signed in — entering workspace…',
    'forgot.title': 'Forgot password',
    'forgot.copy': 'Design Buddy is a zero-backend local app. Passwords are salted and hashed inside this browser and cannot be recovered by email.<br><br>Options:<br>1. Try signing in again carefully;<br>2. Register a new account with another email;<br>3. To abandon the old account, use Settings → Data → Reset app (this also erases local work).',
    'provider.title.google': 'Google sign-in (local demo)',
    'provider.title.github': 'GitHub sign-in (local demo)',
    'provider.copy': 'This is a <b>zero-backend, zero-secret</b> local demo without an OAuth client ID, so the real Google/GitHub consent page cannot open.<br><br>Clicking continue creates a real local account and session tagged with <b>{badge}</b>, with the same features as an email account. In production, wiring an OAuth Client ID replaces this with the real flow.',
    'provider.nameLabel': 'Display name',
    'provider.ok': 'Continue with local demo sign-in',
  },
}

let lang = localStorage.getItem('db-auth-lang') || 'zh'
let mode = 'login'

const $ = (sel) => document.querySelector(sel)
const dict = () => DICT[lang]
const t = (key) => dict()[key] ?? DICT.zh[key] ?? key

function applyLang() {
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
  localStorage.setItem('db-auth-lang', lang)
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n) })
  document.querySelectorAll('.auth-lang-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.authLang === lang))
  // 动态占位与按钮文案
  $('#f-name').placeholder = t('ph.name')
  $('#f-email').placeholder = t('ph.email')
  $('#f-confirm').placeholder = t('ph.confirm')
  $('#f-password').placeholder = t(mode === 'register' ? 'ph.password.register' : 'ph.password.login')
  $('#auth-submit span').textContent = t(mode === 'register' ? 'tab.register' : 'tab.login')
  $('#f-password').autocomplete = mode === 'register' ? 'new-password' : 'current-password'
}

function setMode(next) {
  mode = next
  document.querySelectorAll('.auth-tab').forEach((b) => b.classList.toggle('is-active', b.dataset.tab === mode))
  document.querySelector('[data-field="name"]').hidden = mode !== 'register'
  document.querySelector('[data-field="confirm"]').hidden = mode !== 'register'
  clearErrors()
  applyLang()
}

function clearErrors() {
  document.querySelectorAll('[data-err]').forEach((p) => { p.textContent = '' })
  document.querySelectorAll('.auth-form input').forEach((i) => i.classList.remove('has-error'))
  const alert = $('#form-alert')
  alert.hidden = true
  alert.className = 'form-alert'
  alert.textContent = ''
}
function showFieldError(field, msg) {
  const p = document.querySelector(`[data-err="${field}"]`)
  if (p) p.textContent = msg
  const input = $(`#f-${field === 'confirm' ? 'confirm' : field}`)
  input?.classList.add('has-error')
}
function showAlert(msg, ok = false) {
  const alert = $('#form-alert')
  alert.hidden = false
  alert.className = `form-alert${ok ? ' is-ok' : ''}`
  alert.textContent = msg
}

function nextUrl() {
  const n = new URLSearchParams(location.search).get('next')
  return n && /^[\w.-]+\.html/.test(n) ? n : 'index.html'
}
function enterApp() {
  document.documentElement.dataset.authOk = '1'
  // 极短延迟让成功提示可被感知，也给测试留断言窗口
  setTimeout(() => location.replace(nextUrl()), 120)
}

/* ---------------- 初始化 ---------------- */

// 已登录则直接跳走
if (currentUser()) {
  document.documentElement.dataset.authOk = '1'
  location.replace(nextUrl())
}

document.querySelectorAll('.auth-lang-btn').forEach((b) =>
  b.addEventListener('click', () => { lang = b.dataset.authLang; applyLang() }))
document.querySelectorAll('.auth-tab').forEach((b) =>
  b.addEventListener('click', () => setMode(b.dataset.tab)))

// 密码显隐
$('#pw-toggle').addEventListener('click', () => {
  const input = $('#f-password')
  const show = input.type === 'password'
  input.type = show ? 'text' : 'password'
  $('#pw-toggle').textContent = show ? (lang === 'en' ? 'Hide' : '隐藏') : (lang === 'en' ? 'Show' : '显示')
})

// 输入即清错
document.querySelectorAll('.auth-form input').forEach((input) =>
  input.addEventListener('input', () => {
    input.classList.remove('has-error')
    const field = input.id.replace('f-', '')
    const p = document.querySelector(`[data-err="${field}"]`)
    if (p) p.textContent = ''
  }))

// 忘记密码：诚实说明本地限制
$('#forgot-btn').addEventListener('click', () => {
  const modal = $('#provider-modal')
  $('#provider-title').textContent = t('forgot.title')
  $('#provider-copy').innerHTML = t('forgot.copy')
  $('#provider-name').closest('.field').hidden = true
  $('#provider-ok').textContent = t('common.cancel')
  modal.hidden = false
  $('#provider-ok').onclick = () => { modal.hidden = true; resetProviderModal() }
})

// Google / GitHub：诚实本地演示身份
document.querySelectorAll('[data-provider]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const provider = btn.dataset.provider
    const meta = loginWithProvider // 仅引用保持模块依赖显式
    void meta
    const modal = $('#provider-modal')
    $('#provider-title').textContent = t(`provider.title.${provider}`)
    $('#provider-copy').innerHTML = t('provider.copy').replace('{badge}', provider === 'google' ? 'Google' : 'GitHub')
    const nameField = $('#provider-name').closest('.field')
    nameField.hidden = false
    $('#provider-name-label').textContent = t('provider.nameLabel')
    $('#provider-name').value = provider === 'google'
      ? (lang === 'en' ? 'Google demo user' : 'Google 演示用户')
      : (lang === 'en' ? 'GitHub demo user' : 'GitHub 演示用户')
    $('#provider-ok').textContent = t('provider.ok')
    modal.hidden = false
    $('#provider-ok').onclick = () => {
      const user = loginWithProvider(provider)
      // 允许用户修改显示昵称（同样持久化在本地账号上）
      const customName = $('#provider-name').value.trim()
      if (customName) {
        const raw = JSON.parse(localStorage.getItem('design-buddy-auth-v1'))
        const target = raw.users.find((u) => u.id === user.id)
        if (target) { target.name = customName; localStorage.setItem('design-buddy-auth-v1', JSON.stringify(raw)) }
      }
      modal.hidden = true
      enterApp()
    }
  })
})

function resetProviderModal() {
  $('#provider-modal').hidden = true
  $('#provider-name').closest('.field').hidden = false
}
document.querySelector('#provider-modal [data-close]').addEventListener('click', resetProviderModal)
$('#provider-modal').addEventListener('click', (e) => {
  if (e.target.id === 'provider-modal') resetProviderModal()
})

// 邮箱注册 / 登录
$('#auth-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  clearErrors()
  const email = $('#f-email').value.trim()
  const password = $('#f-password').value
  const remember = $('#f-remember').checked
  try {
    if (mode === 'register') {
      showAlert(t('alert.registering'))
      await registerWithEmail({
        name: $('#f-name').value.trim(),
        email,
        password,
        confirm: $('#f-confirm').value,
        remember,
      })
      showAlert(t('alert.success.register'), true)
    } else {
      showAlert(t('alert.logging'))
      await loginWithEmail({ email, password, remember })
      showAlert(t('alert.success.login'), true)
    }
    enterApp()
  } catch (err) {
    const alert = $('#form-alert')
    alert.hidden = false
    alert.className = 'form-alert'
    if (err.fields) {
      Object.entries(err.fields).forEach(([field, msg]) => showFieldError(field, msg))
      alert.textContent = Object.values(err.fields)[0]
    } else {
      alert.textContent = err.message
    }
  }
})

applyLang()
setMode('login')
