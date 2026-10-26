/* ============================================================
   共享内核：持久化存储、IndexedDB 媒体库、弹窗、下载、工具函数
   五个页面统一引用，所有演示数据改为真实状态并跨刷新保留。
   注意：core 保持零导入（避免与共享分包形成循环依赖）；
   模型白名单的消费与迁移在 settings.js / main.js 完成。
   ============================================================ */

const LS_KEY = 'design-buddy-state-v1'
const DB_NAME = 'design-buddy-media'
const STORE = 'blobs'

/* ---------------- 默认状态（含原 mock 种子数据） ---------------- */

export function defaultState() {
  return {
    workspaces: [{ id: 'ws-default', name: "ruoxuan li's Workspace", plan: 'free' }],
    activeWorkspaceId: 'ws-default',
    credits: 236,
    gammas: [],
    conversations: [],
    // 真实任务队列：每次创作写入一条，随生成进度更新状态
    tasks: [],
    folders: [],
    customThemes: [],
    archivedThemes: [],
    customTemplates: [],
    appliedTheme: null,
    defaultTheme: null,
    media: seedMedia(),
    experts: [
      { id: 'ex-ppt', name: 'PPT 专家', color: 'av-purple', desc: '大纲规划、故事线、页面布局、图表与演讲备注', pinned: false },
      { id: 'ex-web-prototype', name: '网页原型工程师', color: 'av-green', desc: '可运行的 HTML 原型', pinned: false },
      { id: 'ex-manager', name: 'Manager Agent', color: 'av-navy', desc: '拆解任务、调度专家、验收交付', pinned: false },
      { id: 'ex-office-admin', name: '行政办公专家', color: 'av-green', desc: '收文件、汇总表格、写纪要与通知', pinned: false },
      { id: 'ex-automation', name: '自动化流程专家', color: 'av-slate', desc: '批量处理、定时汇总、自动交付', pinned: false },
      { id: 'ex-research', name: '研究分析专家', color: 'av-indigo', desc: '检索资料、对比多文件、核查来源', pinned: false },
      { id: 'ex-doc', name: '文档专家', color: 'av-navy', desc: '方案撰写、报告生成、公文格式', pinned: false },
      { id: 'ex-content', name: '内容优化专家', color: 'av-teal', desc: '润色、改写、翻译、摘要、受众适配', pinned: false },
      { id: 'ex-visual', name: '视觉设计专家', color: 'av-amber', desc: '栅格布局、字体层级、视觉一致性', pinned: false },
      { id: 'ex-ai-image', name: 'AI 图片专家', color: 'av-rose', desc: '文生图、图片编辑、风格统一', pinned: false },
      { id: 'ex-brand', name: '模板与品牌专家', color: 'av-orange', desc: '模板检索、品牌规范、设计系统', pinned: false },
      { id: 'ex-qa', name: '质量审核专家', color: 'av-blue', desc: '事实核验、数字校验、导出验收', pinned: false },
    ],
    skills: [
      { id: 'sk-1', name: 'PPT 大纲生成', desc: '根据主题自动生成演示大纲', enabled: true, version: '1.0.0' },
      { id: 'sk-2', name: '文案润色', desc: '优化表达与语气', enabled: true, version: '1.0.0' },
      { id: 'sk-3', name: '数据图表化', desc: '把数字转成图表建议', enabled: false, version: '1.0.0' },
      { id: 'sk-4', name: '中英互译', desc: '专业级双语翻译', enabled: true, version: '1.0.0' },
    ],
    connectors: [
      { id: 'cn-1', name: 'Google Drive', desc: '搜索、上传与管理云端硬盘中的文件', color: '#1a8f4c', shape: 'cloud', connected: true },
      { id: 'cn-2', name: 'Slack', desc: '读取频道消息并发送通知', color: '#611f69', shape: 'chat', connected: false },
      { id: 'cn-3', name: 'Notion', desc: '创建、搜索和管理 Notion 工作区页面', color: '#111827', shape: 'doc', connected: false },
      { id: 'cn-4', name: 'GitHub', desc: '在 GitHub 上克隆、推送代码与管理 Issue', color: '#24292f', shape: 'code', connected: true },
    ],
    settings: defaultSettings(),
    instructions: '',
    messages: [
      { id: 'm-1', from: 'Design Buddy', text: '欢迎回来，今天想创作点什么？', at: Date.now() - 3600_000 },
    ],
  }
}

function seedMedia() {
  const defs = [
    ['bd1', '生日卡·奶油柠檬', 'm-bd1', 'cake', true],
    ['bd2', '生日卡·湖蓝橙彩', 'm-bd2', 'cake', false],
    ['bd3', '生日卡·樱粉', 'm-bd3', 'cake', false],
    ['room', '紫光会议室', 'm-room', 'plain', false],
    ['code', '霓虹代码屏', 'm-code', 'plain', false],
    ['keys', '键盘特写', 'm-keys', 'plain', false],
    ['laptop', '紫光笔记本', 'm-laptop', 'plain', true],
    ['desk', '桌面工作角', 'm-desk', 'plain', false],
    ['paint', '国风厅堂', 'm-paint', 'plain', false],
  ]
  const images = defs.map(([id, name, cls, kind, fav], i) => ({
    id, name, cls, kind, fav,
    source: kind === 'cake' ? 'ai' : 'upload',
    type: 'image',
    gen: kind === 'cake' ? 'card' : i === 8 ? 'illustration' : 'photo',
    createdAt: Date.now() - (defs.length - i) * 86_400_000,
  }))
  const graphics = [
    ['gr-1', '圆角矩形', '▭'], ['gr-2', '星形徽章', '★'],
    ['gr-3', '对话气泡', '💬'], ['gr-4', '箭头流程', '➜'],
    ['gr-5', '数据图表', '📊'], ['gr-6', '闪电标识', '⚡'],
  ].map(([id, name, glyph], i) => ({
    id, name, cls: '', kind: 'graphic', glyph, fav: false,
    source: 'ai', type: 'graphic', gen: 'shape',
    createdAt: Date.now() - (i + 2) * 43_200_000,
  }))
  return [...images, ...graphics]
}

export function defaultSettings() {
  return {
    profile: { name: 'ruoxuan li', initials: 'RW', bio: '' },
    language: '简体中文',
    linkOpen: '智能打开',
    fontScale: 1,
    fontFamily: 'system',
    lockScreen: '关闭',
    keepAwake: true,
    autoStart: false,
    proxy: '直接连接',
    proxyUrl: '',
    trustedSkills: false,
    skillAutoUpdate: true,
    appearance: { theme: 'light', density: 'comfortable', reduceMotion: false },
    shortcuts: { search: '⌘K', newGamma: '⌘N', send: '⌘Enter', upload: '⌘U' },
    personalize: { smartSuggest: true, autoTitle: true, weeklyReport: false },
    memories: ['偏好中文回答', '演示文稿默认 16:9'],
    // 真实可用模型由 discover-models 脚本探测后写死到 model-config.js；
    // 空串由 settings.js 启动迁移补齐为白名单首个模型
    model: '',
    agents: [{ id: 'ag-1', name: '写作助手', on: true }, { id: 'ag-2', name: '代码审查员', on: true }],
    assistant: { name: 'Buddy', voice: '温暖女声' },
    devices: [{ id: 'dv-1', name: 'MacBook Pro', current: true }],
    apps: [{ id: 'ap-1', name: '演示文稿', on: true }, { id: 'ap-2', name: '文档', on: true }, { id: 'ap-3', name: '轮播图', on: false }],
    security: { twoFA: false, sessionTimeout: '30 分钟' },
    permission: 'ask',
    params: { creativity: 2, length: '均衡', language: '中文' },
  }
}

/* ---------------- localStorage 存储 ---------------- */

let state
try {
  const raw = localStorage.getItem(LS_KEY)
  state = raw ? migrate(JSON.parse(raw)) : defaultState()
} catch {
  state = defaultState()
}

// 旧版本存储向前兼容：补齐新增字段，合并嵌套设置
function migrate(saved) {
  const d = defaultState()
  const next = { ...d, ...saved }
  for (const key of Object.keys(d)) {
    if (next[key] === undefined) next[key] = d[key]
  }
  // 旧存储中的技能没有版本号：补 1.0.0 基线，使「技能自动更新」可检测升级
  if (Array.isArray(next.skills)) {
    next.skills = next.skills.map((sk) => (sk.version ? sk : { ...sk, version: '1.0.0' }))
  }
  const ds = d.settings
  const ss = saved.settings ?? {}
  next.settings = {
    ...ds, ...ss,
    profile: { ...ds.profile, ...(ss.profile ?? {}) },
    appearance: { ...ds.appearance, ...(ss.appearance ?? {}) },
    shortcuts: { ...ds.shortcuts, ...(ss.shortcuts ?? {}) },
    personalize: { ...ds.personalize, ...(ss.personalize ?? {}) },
    security: { ...ds.security, ...(ss.security ?? {}) },
    assistant: { ...ds.assistant, ...(ss.assistant ?? {}) },
    params: { ...ds.params, ...(ss.params ?? {}) },
  }
  return next
}

const listeners = new Set()

export const store = {
  get state() {
    return state
  },
  save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state))
    } catch (err) {
      console.warn('持久化失败（可能容量超限）', err)
    }
    listeners.forEach((fn) => fn(state))
  },
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  reset() {
    state = defaultState()
    this.save()
  },
  exportJson() {
    return JSON.stringify(state, null, 2)
  },
  importJson(json) {
    state = { ...defaultState(), ...JSON.parse(json) }
    this.save()
  },
}

export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const activeWorkspace = () =>
  state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? state.workspaces[0]

/* ---------------- IndexedDB：媒体二进制 ---------------- */

let dbPromise

function openDb() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

export async function saveBlob(key, blob) {
  const db = await openDb()
  await new Promise((ok, fail) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, key)
    tx.oncomplete = ok
    tx.onerror = () => fail(tx.error)
  })
}

export async function getBlob(key) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteBlob(key) {
  const db = await openDb()
  await new Promise((ok) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = ok
    tx.onerror = ok
  })
}

/* ---------------- Toast ---------------- */

let toastTimer
export function toast(message) {
  const el = document.querySelector('#toast')
  if (!el) return
  el.textContent = message
  el.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400)
}

/* ---------------- 通用弹窗 ---------------- */

export function openModal({ title, body, footer, wide = false }) {
  const mask = document.createElement('div')
  mask.className = 'modal-mask'
  mask.innerHTML = `
    <div class="modal-box ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head">
        <h3>${title}</h3>
        <button class="modal-close" aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body"></div>
      ${footer ? '<div class="modal-foot"></div>' : ''}
    </div>`
  const bodyEl = mask.querySelector('.modal-body')
  if (typeof body === 'string') bodyEl.innerHTML = body
  else if (body instanceof Node) bodyEl.append(body)
  if (footer) {
    const footEl = mask.querySelector('.modal-foot')
    if (typeof footer === 'string') footEl.innerHTML = footer
    else if (footer instanceof Node) footEl.append(footer)
  }
  const close = () => mask.remove()
  mask.addEventListener('click', (e) => {
    if (e.target === mask || e.target.closest('.modal-close')) close()
  })
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape' && document.body.contains(mask)) {
      close()
      document.removeEventListener('keydown', onEsc)
    }
  })
  document.body.append(mask)
  return { mask, close, bodyEl, footEl: mask.querySelector('.modal-foot') }
}

export function confirmModal(title, message, dangerText = '确认') {
  return new Promise((resolve) => {
    const { close, footEl } = openModal({
      title,
      body: `<p class="modal-copy">${message}</p>`,
      footer: `
        <button class="btn btn-ghost" data-act="cancel">取消</button>
        <button class="btn btn-danger" data-act="ok">${dangerText}</button>`,
    })
    footEl.addEventListener('click', (e) => {
      const act = e.target.dataset.act
      if (!act) return
      close()
      resolve(act === 'ok')
    })
  })
}

/* ---------------- 下载 / 剪贴板 / 日期 ---------------- */

export function downloadFile(filename, content, mime = 'application/json') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    toast('已复制到剪贴板')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.append(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
    toast('已复制到剪贴板')
  }
}

export function fmtDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function monthLabel(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}
