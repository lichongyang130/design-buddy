/* ============================================================
   任务二十六：注册/登录体系
   - 模块级：邮箱注册（盐值散列）、登录校验、会话、退出、
     Google/GitHub 本地演示身份、路由守卫
   - 页面级：auth.html 双语 / tab / 校验 / 提供商弹窗 / 完整注册流
   ============================================================ */

import { loadPage, click, input, tick } from './helpers.mjs'
import {
  registerWithEmail, loginWithEmail, loginWithProvider, loginAsGuest, currentUser,
  logout, requireAuth, validateRegistration, hashPassword, AUTH_KEY,
} from '../src/auth.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

/* ---------------- 内存存储 stub（模块级测试用） ---------------- */

function memStorage() {
  const m = new Map()
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
    _dump: () => (m.has(AUTH_KEY) ? JSON.parse(m.get(AUTH_KEY)) : null),
  }
}

const mem = memStorage()
globalThis.localStorage = mem
globalThis.sessionStorage = memStorage()

/* ---------------- 模块级：注册 / 登录 / 会话 ---------------- */
{
  // 表单校验
  check('validate: catches all bad fields at once', Object.keys(validateRegistration({
    name: 'A', email: 'bad', password: 'short', confirm: 'x',
  })).length >= 4)

  const user = await registerWithEmail({
    name: '林小满', email: 'maya@example.com', password: 'Passw0rd!', confirm: 'Passw0rd!',
  })
  check('register: returns public user without secret', !('hash' in user) && !('salt' in user) && user.email === 'maya@example.com')
  const saved = mem._dump()
  check('register: user persisted with provider=email', saved.users[0].provider === 'email')
  check('register: password never stored in plaintext',
    JSON.stringify(saved).includes('hash') && !JSON.stringify(saved).includes('Passw0rd!'))
  check('register: salt is random hex', /^[0-9a-f]{32}$/.test(saved.users[0].salt))
  check('register: hash is 64-char sha256 hex', /^[0-9a-f]{64}$/.test(saved.users[0].hash))
  check('register: auto session created', !!currentUser() && currentUser().email === 'maya@example.com')

  // 重复邮箱
  let dupCaught = false
  try {
    await registerWithEmail({ name: '重复', email: 'MAYA@example.com', password: 'Passw0rd!', confirm: 'Passw0rd!' })
  } catch (e) { dupCaught = !!e.fields?.email }
  check('register: duplicate email rejected case-insensitively', dupCaught)

  // 错误密码 / 未注册邮箱
  let wrongPw = false
  try { await loginWithEmail({ email: 'maya@example.com', password: 'nope-nope' }) } catch (e) { wrongPw = true }
  // 登录失败不影响既有会话（当前仍是注册时自动建立的 maya 会话）
  check('login: wrong password rejected, existing session untouched',
    wrongPw && currentUser()?.email === 'maya@example.com')
  let unknown = false
  try { await loginWithEmail({ email: 'ghost@example.com', password: 'Passw0rd!' }) } catch (e) { unknown = true }
  check('login: unregistered email rejected', unknown)

  // 正确登录
  logout()
  check('logout: clears session', currentUser() === null)
  const back = await loginWithEmail({ email: 'maya@example.com', password: 'Passw0rd!', remember: false })
  check('login: correct credentials restore user', back.name === '林小满')
  check('login: ephemeral session lands in sessionStorage',
    globalThis.sessionStorage.getItem(AUTH_KEY) !== null && globalThis.localStorage.getItem(AUTH_KEY).includes('"session":null'))
  logout()

  // 提供商演示身份
  const g = loginWithProvider('google')
  check('provider: google account flagged and demo', g.provider === 'google' && g.demo === true)
  check('provider: session active', currentUser()?.provider === 'google')
  const g2 = loginWithProvider('google')
  check('provider: repeat sign-in reuses one account', g2.id === g.id)
  const gh = loginWithProvider('github')
  check('provider: github creates separate account', gh.provider === 'github' && gh.id !== g.id)
  logout()
  check('provider: logout ends session', currentUser() === null)

  // 游客模式：一键直接进入
  const guest = loginAsGuest()
  check('guest: creates flagged local guest with active session',
    guest.provider === 'guest' && guest.guest === true && currentUser()?.id === 'u-guest')
  check('guest: no password secrets on the account',
    !('hash' in guest) && !('salt' in guest) && mem._dump().users.find((u) => u.id === 'u-guest').hash === undefined)
  const guest2 = loginAsGuest()
  check('guest: repeat entry reuses the same account', guest2.id === guest.id)
  logout()
  check('guest: logout ends session', currentUser() === null)

  // 路由守卫
  const calls = []
  check('guard: redirects anonymous users to auth.html',
    requireAuth((u) => calls.push(u)) === false && calls[0]?.startsWith('auth.html?next='))
  loginWithProvider('github')
  check('guard: passes authenticated users', requireAuth(() => { throw new Error('should not redirect') }) === true)
  logout()

  // 过期会话视为未登录
  const stale = mem._dump()
  stale.session = { userId: stale.users[0].id, until: Date.now() - 1000, remember: true }
  mem.setItem(AUTH_KEY, JSON.stringify(stale))
  check('guard: expired session treated as anonymous', requireAuth(() => {}) === false)

  // 散列确定性
  const h1 = await hashPassword('abc12345', 'fixed-salt')
  const h2 = await hashPassword('abc12345', 'fixed-salt')
  const h3 = await hashPassword('abc12345', 'other-salt')
  check('hash: deterministic for same salt', h1 === h2 && h1 !== h3)
}

/* ---------------- 页面级：auth.html 完整交互 ---------------- */
{
  const { doc, w, errors, storage } = await loadPage('/auth.html')
  check('auth page: loads without errors', errors.length === 0, JSON.stringify(errors))
  // helpers 预置了会话 → 页面应标记重定向（jsdom 不真实跳转）
  check('auth page: existing session triggers redirect marker', doc.documentElement.dataset.authOk === '1')
  storage.removeItem(AUTH_KEY)

  const tabLogin = doc.querySelector('[data-tab="login"]')
  const tabRegister = doc.querySelector('[data-tab="register"]')
  check('auth page: login tab default active', tabLogin.classList.contains('is-active'))
  check('auth page: register-only fields hidden initially',
    doc.querySelector('[data-field="name"]').hidden && doc.querySelector('[data-field="confirm"]').hidden)

  // 双语切换
  click(w, doc.querySelector('[data-auth-lang="en"]'))
  await tick()
  check('auth page: english toggle localizes cta',
    doc.querySelector('#auth-submit span').textContent === 'Sign in')
  click(w, doc.querySelector('[data-auth-lang="zh"]'))
  await tick()

  // 切到注册
  click(w, tabRegister)
  await tick()
  check('auth page: register reveals name/confirm',
    !doc.querySelector('[data-field="name"]').hidden && !doc.querySelector('[data-field="confirm"]').hidden)

  // 空提交校验
  click(w, doc.querySelector('#auth-submit'))
  await tick()
  check('auth page: empty register shows inline errors',
    doc.querySelector('[data-err="email"]').textContent !== '' && doc.querySelector('#form-alert').hidden === false)

  // 密码不一致
  input(w, doc.querySelector('#f-name'), '王设计')
  input(w, doc.querySelector('#f-email'), 'wang@example.com')
  input(w, doc.querySelector('#f-password'), 'Passw0rd!')
  input(w, doc.querySelector('#f-confirm'), 'Passw0rd?')
  click(w, doc.querySelector('#auth-submit'))
  await tick()
  check('auth page: password mismatch reported',
    doc.querySelector('[data-err="confirm"]').textContent.includes('不一致'))

  // 密码显隐
  click(w, doc.querySelector('#pw-toggle'))
  await tick()
  check('auth page: password visibility toggle works', doc.querySelector('#f-password').type === 'text')
  click(w, doc.querySelector('#pw-toggle'))

  // 成功注册
  input(w, doc.querySelector('#f-confirm'), 'Passw0rd!')
  click(w, doc.querySelector('#auth-submit'))
  await tick(200)
  const after = JSON.parse(storage.getItem(AUTH_KEY))
  check('auth page: register flow creates account + session',
    after.users.some((u) => u.email === 'wang@example.com') && after.session !== null)
  check('auth page: success marks entry ready', doc.documentElement.dataset.authOk === '1')

  // 提供商弹窗（诚实本地演示）
  storage.removeItem(AUTH_KEY)
  click(w, doc.querySelector('[data-provider="google"]'))
  await tick()
  const modal = doc.querySelector('#provider-modal')
  check('provider: honest modal explains local demo',
    !modal.hidden && modal.textContent.includes('本地演示') && modal.textContent.includes('OAuth'))
  click(w, doc.querySelector('#provider-ok'))
  await tick(200)
  const gState = JSON.parse(storage.getItem(AUTH_KEY))
  check('provider: modal continue creates google session',
    gState.session !== null && gState.users.some((u) => u.provider === 'google'))
  check('provider: custom display name persisted',
    gState.users.find((u) => u.provider === 'google').name.includes('Google'))

  // GitHub
  storage.removeItem(AUTH_KEY)
  click(w, doc.querySelector('[data-provider="github"]'))
  await tick()
  click(w, doc.querySelector('#provider-ok'))
  await tick(200)
  check('provider: github flow works',
    JSON.parse(storage.getItem(AUTH_KEY)).users.some((u) => u.provider === 'github'))

  // 忘记密码诚实说明
  storage.removeItem(AUTH_KEY)
  click(w, doc.querySelector('#forgot-btn'))
  await tick()
  check('forgot: honest limitation modal shown',
    !doc.querySelector('#provider-modal').hidden && doc.querySelector('#provider-modal').textContent.includes('零后端'))
  click(w, doc.querySelector('#provider-modal [data-close]'))
  await tick()

  // 登录模式：未注册邮箱先报错
  click(w, tabLogin)
  await tick()
  input(w, doc.querySelector('#f-email'), 'nobody@example.com')
  input(w, doc.querySelector('#f-password'), 'Passw0rd!')
  click(w, doc.querySelector('#auth-submit'))
  await tick()
  check('auth page: login error surfaced', doc.querySelector('#form-alert').hidden === false)

  // 注册一个账号（前序步骤清空过存储）
  click(w, tabRegister)
  await tick()
  input(w, doc.querySelector('#f-name'), '陈登录')
  input(w, doc.querySelector('#f-email'), 'chen@example.com')
  input(w, doc.querySelector('#f-password'), 'Passw0rd!')
  input(w, doc.querySelector('#f-confirm'), 'Passw0rd!')
  storage.removeItem(AUTH_KEY) // 模拟注册前的干净未登录态
  click(w, doc.querySelector('#auth-submit'))
  await tick(200)
  const registered = JSON.parse(storage.getItem(AUTH_KEY))
  check('auth page: fresh register creates session', registered?.session !== null)

  // 仅清除会话、保留账号 → 用纯登录表单重新进入
  registered.session = null
  storage.setItem(AUTH_KEY, JSON.stringify(registered))
  click(w, tabLogin)
  await tick()
  input(w, doc.querySelector('#f-email'), 'chen@example.com')
  input(w, doc.querySelector('#f-password'), 'Passw0rd!')
  click(w, doc.querySelector('#auth-submit'))
  await tick(200)
  check('auth page: valid login starts session',
    JSON.parse(storage.getItem(AUTH_KEY)).session !== null)

  // 游客直接进入：干净态下一键创建游客会话
  storage.removeItem(AUTH_KEY)
  const guestBtn = doc.querySelector('#guest-entry')
  check('auth page: guest entry button rendered', !!guestBtn && guestBtn.textContent.includes('直接进入'))
  click(w, doc.querySelector('[data-auth-lang="en"]'))
  await tick()
  check('auth page: guest cta localized to english', guestBtn.textContent === 'Continue as guest →')
  click(w, doc.querySelector('[data-auth-lang="zh"]'))
  await tick()
  click(w, guestBtn)
  await tick(200)
  const guestState = JSON.parse(storage.getItem(AUTH_KEY))
  check('auth page: guest entry creates guest account + session',
    guestState?.session !== null && guestState.users.some((u) => u.provider === 'guest'))
  check('auth page: guest entry marks entry ready', doc.documentElement.dataset.authOk === '1')
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} AUTH CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
