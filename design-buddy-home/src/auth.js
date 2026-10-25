/* ============================================================
   本地优先认证模块（零后端、零密钥、零第三方 SDK）
   - 邮箱账号：PBKDF2(SHA-256) + 每用户随机盐，绝不存明文密码
   - Google / GitHub：零后端无法持有 OAuth 客户端密钥，
     采用诚实的「本地演示身份」——真实创建本地账号与会话，
     账号带 provider 标记，弹窗中明示与生产 OAuth 的差异
   - 会话：记住我 → localStorage（30 天）；否则 sessionStorage（标签级）
   ============================================================ */

export const AUTH_KEY = 'design-buddy-auth-v1'
const SESSION_DAYS = 30
const ITERATIONS = 120000

const PROVIDER_META = {
  google: { email: 'google.demo@design-buddy.local', name: 'Google 演示用户', badge: 'Google' },
  github: { email: 'github.demo@design-buddy.local', name: 'GitHub 演示用户', badge: 'GitHub' },
}

/* ---------------- 存储 ---------------- */

function readStore(storage) {
  try {
    const raw = storage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : { users: [], session: null }
  } catch {
    return { users: [], session: null }
  }
}
function writeStore(storage, data) {
  storage.setItem(AUTH_KEY, JSON.stringify(data))
}
// 会话可能落在 localStorage 或 sessionStorage，分别读取
function readBoth() {
  return {
    persistent: readStore(localStorage),
    ephemeral: typeof sessionStorage !== 'undefined' ? readStore(sessionStorage) : { users: [], session: null },
  }
}
function allUsers() {
  const { persistent, ephemeral } = readBoth()
  // 以持久库为主，合并临时库里的独有用户
  const map = new Map(persistent.users.map((u) => [u.id, u]))
  for (const u of ephemeral.users) if (!map.has(u.id)) map.set(u.id, u)
  return [...map.values()]
}

/* ---------------- 加密 ---------------- */

function randomSalt() {
  const buf = new Uint8Array(16)
  crypto.getRandomValues(buf)
  return [...buf].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
// 兜底散列：极端环境无 WebCrypto 时使用（多轮混淆，仍远好于明文）
function fallbackHash(password, salt) {
  let h = 2166136261
  const str = `${salt}:${password}`
  for (let round = 0; round < 5000; round++) {
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i) + round
      h = Math.imul(h, 16777619)
    }
  }
  return `fb${(h >>> 0).toString(16).padStart(8, '0')}`
}
export async function hashPassword(password, salt) {
  if (!crypto?.subtle) return fallbackHash(password, salt)
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    key, 256,
  )
  return toHex(bits)
}

/* ---------------- 校验 ---------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export function validateRegistration({ name, email, password, confirm }) {
  const errors = {}
  if (!name || name.trim().length < 2) errors.name = '昵称至少 2 个字符'
  if (!email) errors.email = '请输入邮箱地址'
  else if (!EMAIL_RE.test(email.trim())) errors.email = '邮箱格式不正确'
  if (!password) errors.password = '请输入密码'
  else if (password.length < 8) errors.password = '密码至少 8 位'
  else if (!/[a-zA-Z]/.test(password)) errors.password = '密码需至少包含一个字母'
  if (confirm !== undefined && confirm !== password) errors.confirm = '两次输入的密码不一致'
  if (allUsers().some((u) => u.provider === 'email' && u.email.toLowerCase() === email?.trim().toLowerCase())) {
    errors.email = '该邮箱已注册，请直接登录'
  }
  return errors
}

/* ---------------- 会话 ---------------- */

function makeSession(user, remember) {
  const session = { userId: user.id, until: Date.now() + SESSION_DAYS * 86400000, remember: !!remember }
  const storage = remember ? localStorage : sessionStorage
  // 临时会话也要把用户带在同一份库里，刷新后仍能读到身份
  const store = readStore(storage)
  if (!store.users.some((u) => u.id === user.id)) store.users.push(stripSecret(user))
  store.session = session
  writeStore(storage, store)
  if (remember && typeof sessionStorage !== 'undefined') {
    const ep = readStore(sessionStorage)
    ep.session = null
    writeStore(sessionStorage, ep)
  }
  return session
}

function stripSecret(user) {
  const { salt, hash, ...rest } = user
  return rest
}

export function currentUser() {
  const { persistent, ephemeral } = readBoth()
  const sess = persistent.session || ephemeral.session
  if (!sess) return null
  if (sess.until && sess.until < Date.now()) {
    logout()
    return null
  }
  const users = persistent.session ? persistent.users : ephemeral.users
  return users.find((u) => u.id === sess.userId) || allUsers().find((u) => u.id === sess.userId) || null
}

export function logout() {
  for (const storage of [localStorage, typeof sessionStorage !== 'undefined' ? sessionStorage : null]) {
    if (!storage) continue
    const store = readStore(storage)
    store.session = null
    writeStore(storage, store)
  }
}

/* ---------------- 注册 / 登录 ---------------- */

const AVATAR_COLORS = ['av-lavender', 'av-blue', 'av-purple', 'av-orange', 'av-navy']

export async function registerWithEmail({ name, email, password, confirm, remember = true }) {
  const errors = validateRegistration({ name, email, password, confirm })
  if (Object.keys(errors).length) {
    const e = new Error(Object.values(errors)[0])
    e.fields = errors
    throw e
  }
  const salt = randomSalt()
  const user = {
    id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    provider: 'email',
    salt,
    hash: await hashPassword(password, salt),
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  }
  const store = readStore(localStorage)
  store.users.push(user) // 库内保留 salt+hash；对外返回时再 stripSecret
  writeStore(localStorage, store)
  makeSession(user, remember)
  return stripSecret(user)
}

export async function loginWithEmail({ email, password, remember = true }) {
  const errors = {}
  if (!email || !EMAIL_RE.test(email.trim())) errors.email = '邮箱格式不正确'
  if (!password) errors.password = '请输入密码'
  if (Object.keys(errors).length) {
    const e = new Error(Object.values(errors)[0])
    e.fields = errors
    throw e
  }
  // 邮箱账号只可能在持久库（注册即落 localStorage）
  const store = readStore(localStorage)
  const user = store.users.find(
    (u) => u.provider === 'email' && u.email === email.trim().toLowerCase(),
  )
  if (!user) {
    const e = new Error('该邮箱尚未注册')
    e.fields = { email: e.message }
    throw e
  }
  const candidate = await hashPassword(password, user.salt)
  if (candidate !== user.hash) {
    const e = new Error('邮箱或密码不正确')
    e.fields = { password: e.message }
    throw e
  }
  user.lastLoginAt = Date.now()
  writeStore(localStorage, store)
  makeSession(user, remember)
  return stripSecret(user)
}

// Google / GitHub：零后端的诚实本地演示身份，同一提供商重复登录复用同一账号
export function loginWithProvider(provider) {
  const meta = PROVIDER_META[provider]
  if (!meta) throw new Error('未知的登录提供商')
  const store = readStore(localStorage)
  let user = store.users.find((u) => u.provider === provider)
  if (!user) {
    user = {
      id: `u-${provider}-demo`,
      name: meta.name,
      email: meta.email,
      provider,
      color: provider === 'google' ? 'av-blue' : 'av-navy',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      demo: true,
    }
    store.users.push(user)
  }
  user.lastLoginAt = Date.now()
  writeStore(localStorage, store)
  makeSession(user, true)
  return user
}

// 游客模式：无需注册的真实本地会话，重复「直接进入」复用同一游客账号
export function loginAsGuest() {
  const store = readStore(localStorage)
  let user = store.users.find((u) => u.provider === 'guest')
  if (!user) {
    user = {
      id: 'u-guest',
      name: '游客',
      email: 'guest@design-buddy.local',
      provider: 'guest',
      color: 'av-lavender',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      demo: true,
      guest: true,
    }
    store.users.push(user)
  }
  user.lastLoginAt = Date.now()
  writeStore(localStorage, store)
  makeSession(user, true)
  return user
}

/* ---------------- 路由守卫 ---------------- */

export function requireAuth(redirect) {
  const user = currentUser()
  if (user) return true
  const loc = globalThis.location ?? { pathname: '/index.html', search: '', hash: '', replace() {} }
  const here = encodeURIComponent(`${loc.pathname.split('/').pop() || 'index.html'}${loc.search}${loc.hash}`)
  const go = redirect ?? ((u) => loc.replace(u))
  go(`auth.html?next=${here}`)
  return false
}

/* ---------------- 测试支持：生成有效会话（仅测试工具调用） ---------------- */

export function _seedSessionForTests(storageLike) {
  const user = {
    id: 'u-test', name: '测试用户', email: 'test@design-buddy.local',
    provider: 'email', color: 'av-blue', createdAt: Date.now(), lastLoginAt: Date.now(),
  }
  const data = {
    users: [user],
    session: { userId: user.id, until: Date.now() + 86400000, remember: true },
  }
  storageLike.setItem(AUTH_KEY, JSON.stringify(data))
  return user
}
