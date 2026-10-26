/* ============================================================
   全局 UI：外观持久化应用、⌘K 命令面板、帮助 / 邀请 / 消息 /
   升级 / 技能 / 连接器弹窗。所有页面统一初始化。
   ============================================================ */

import './features.css'
import { store, openModal, confirmModal, toast, copyText, fmtDate, uid } from './core.js'
import { initSettingsEffects, speak, activeAgents } from './settings-effects.js'
import { currentUser, logout } from './auth.js'
import { EXPERT_CATALOG, EXPERT_CATEGORIES, EXPERT_FILTERS, formatUsage } from './experts-catalog.js'
import {
  DISCOVERY_SKILLS, FEATURED_SKILLS, FEATURED_SIZE, SKILL_FILTERS, SKILL_META, formatCount,
} from './skills-catalog.js'

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
    <p class="modal-copy">当前工作区：<strong>${ws.name}</strong>，套餐 <strong>${ws.plan === 'pro' ? 'Pro' : 'Free'}</strong>，剩余积分 <strong>${store.state.credits}</strong></p>
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
              <div class="secondary">${m.text}</div>
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

/* ---------------- 技能 / 连接器 / 专家库 ---------------- */

import {
  SKILL_REGISTRY, hasUpdate, registryEntry, SEED_SKILL_VERSION,
} from './skill-registry.js'

export function openSkills() {
  const { mask, bodyEl } = openModal({ title: '技能' })
  mask.querySelector('.modal-box').classList.add('modal-skills')

  // 右侧发现区交互状态（仅本弹窗生命周期内）
  const ui = { q: '', source: 'recommend', chip: '全部', installedOnly: false, featuredOffset: 0 }
  const installedNames = () => new Set(store.state.skills.map((s) => s.name))

  const applyUpdate = (sk) => {
    const reg = registryEntry(sk.name)
    if (!reg || !hasUpdate(sk)) return false
    sk.version = reg.version
    return true
  }

  // 统一安装入口：注册表技能与精选/自定义技能都走真实持久化 + 信任门控
  const installSkill = async (entry, { fromRegistry = false } = {}) => {
    if (installedNames().has(entry.name)) return false
    const canAuto = store.state.settings.trustedSkills && entry.risk !== 'review'
    if (!canAuto) {
      const ok = await confirmModal(
        entry.risk === 'review' ? '安装高风险技能' : '安装技能',
        entry.risk === 'review'
          ? `「${entry.name}」涉及外部数据访问或代为执行操作，高风险技能始终需要手动确认。确认安装吗？`
          : `自动安装可信技能未开启，确认手动安装「${entry.name}」吗？`,
        '确认安装',
      )
      if (!ok) return false
    }
    store.state.skills.push({
      id: uid('sk'), name: entry.name, desc: entry.desc, enabled: true,
      version: entry.version || SEED_SKILL_VERSION,
    })
    store.save()
    toast(canAuto ? `可信技能「${entry.name}」已自动安装` : `技能「${entry.name}」已安装`)
    return true
  }

  const popoverHtml = (name, tags, space, updatedAt) => `
    <span class="sk-pop" role="tooltip">
      <span class="sk-pop-title">${name}</span>
      <span class="sk-pop-tags">${tags.map((t) => `<span class="sk-pop-tag">${t}</span>`).join('')}</span>
      <span class="sk-pop-meta"><span>所属空间：${space}</span><span>更新于 ${updatedAt}</span></span>
    </span>`

  /* ---------- 左侧：已安装管理（信任门控 / 版本 / 更新契约原样保留） ---------- */
  const sideHtml = () => {
    const trusted = store.state.settings.trustedSkills
    const autoUpdate = store.state.settings.skillAutoUpdate
    const installed = store.state.skills
    return `<aside class="experts-side sk-side" id="skills-root">
      ${autoUpdate ? '' : '<p class="modal-copy" style="margin:0 4px 10px">技能自动更新已暂停，可在设置中恢复，或使用「检查更新」手动升级。</p>'}
      <div class="sk-side-head">
        <p class="experts-side-label">已安装（${installed.length}）</p>
        <button class="sk-check-btn" data-check-update type="button">检查更新</button>
      </div>
      <div class="modal-list">${installed.map((sk) => {
        const updatable = hasUpdate(sk)
        const reg = registryEntry(sk.name)
        return `
      <div class="modal-list-item">
        <div class="grow">
          <div class="primary">${sk.name}${trusted ? '' : ' <span class="count-pill">未信任</span>'}
            ${updatable ? `<span class="count-pill update-pill" data-update-pill="${sk.id}">可更新 v${reg.version}</span>` : `<span class="version-tag">v${sk.version || SEED_SKILL_VERSION}</span>`}</div>
          <div class="secondary">${sk.desc}</div>
        </div>
        <div class="skill-actions">
          ${updatable && !autoUpdate ? `<button class="btn btn-ghost skill-update-btn" data-update-sk="${sk.id}" type="button">更新</button>` : ''}
          <span class="mini-switch ${sk.enabled ? 'is-on' : ''}" data-sk="${sk.id}"></span>
        </div>
      </div>`
      }).join('')}</div>
    </aside>`
  }

  /* ---------- 右侧：截图式发现区 ---------- */
  const featuredSlice = () => {
    const pool = FEATURED_SKILLS
    const n = FEATURED_SIZE
    return Array.from({ length: n }, (_, i) => pool[(ui.featuredOffset + i) % pool.length])
  }

  const plusButton = (name, installAttr, id, installed) => installed
    ? '<span class="sk-plus is-installed" title="已安装">✓</span>'
    : `<button class="sk-plus" type="button" ${installAttr}="${id}" aria-label="安装">+</button>`

  const mainHtml = () => {
    const names = installedNames()
    const featured = featuredSlice()
    return `<section class="experts-main">
    <div class="ex-topbar">
      <div class="ex-top-tabs" role="tablist">
        <button class="ex-top-tab" type="button" data-open="experts">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          专家</button>
        <button class="ex-top-tab is-active" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          技能</button>
        <button class="ex-top-tab" type="button" data-open="connectors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          连接器</button>
      </div>
      <div class="ex-top-actions">
        <label class="ex-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="sk-search-input" type="search" placeholder="搜索技能" value="${ui.q.replace(/"/g, '&quot;')}" />
        </label>
        <button class="sk-installed-btn ${ui.installedOnly ? 'is-active' : ''}" type="button" data-installed-toggle>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
          已安装(${store.state.skills.length})</button>
        <button class="sk-black-btn" type="button" data-add-skill>＋ 添加技能</button>
      </div>
    </div>

    <div class="sk-section-head">
      <h4 class="sk-section-title">精选技能</h4>
      <button class="sk-shuffle" type="button" data-shuffle>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
        换一批</button>
    </div>
    <div class="sk-feature-track">${featured.map((f) => `
      <div class="sk-feature-card" data-feature-card="${f.id}">
        ${popoverHtml(f.name, f.tags, f.space, f.updatedAt)}
        <div class="sk-card-top">
          <span class="sk-logo ${f.color}">${f.glyph}</span>
          <span class="sk-card-title">${f.name}</span>
          ${plusButton(f.name, 'data-featured-install', f.id, names.has(f.name))}
        </div>
        <p class="sk-card-desc">${f.desc}</p>
        <div class="sk-stats">
          <span class="sk-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>${formatCount(f.usage)}</span>
          <span class="sk-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>${formatCount(f.downloads)}</span>
        </div>
      </div>`).join('')}</div>

    <div class="ex-sub-row">
      <div class="sk-source-tabs">
        ${[['recommend', '推荐'], ['skillhub', 'SkillHub'], ['suite', '套件']].map(([v, label]) => `
          <button class="sk-source-tab ${ui.source === v ? 'is-active' : ''}" type="button" data-source="${v}">${label}</button>`).join('')}
      </div>
      <span class="sk-grid-meta" id="sk-grid-meta"></span>
    </div>

    <div class="ex-chip-wrap">
      <div class="ex-chip-track">${SKILL_FILTERS.map((f) => `
        <button class="ex-chip ${ui.chip === f ? 'is-active' : ''}" type="button" data-sk-chip="${f}">${f}</button>`).join('')}</div>
      <button class="ex-chip-next" type="button" data-sk-chip-scroll aria-label="向右滚动">›</button>
    </div>

    <div class="sk-grid" id="sk-grid"></div>
  </section>`
  }

  // 已安装技能的发现卡（注册表外的自定义/精选技能用兜底元数据）
  const installedCard = (sk) => {
    const reg = SKILL_REGISTRY.find((r) => r.name === sk.name)
    const meta = reg ? SKILL_META[reg.id] : null
    const featured = FEATURED_SKILLS.find((f) => f.name === sk.name)
    const m = meta || featured || { color: 'av-blue', glyph: sk.name[0] || '技', tags: ['自定义技能'], usage: 0, downloads: 0, space: '本地', updatedAt: '—' }
    return {
      id: reg?.id || sk.id, name: sk.name, desc: sk.desc, risk: reg?.risk,
      color: m.color, glyph: m.glyph, tags: m.tags, usage: m.usage, downloads: m.downloads,
      space: m.space, updatedAt: m.updatedAt, installed: true,
    }
  }

  const computeGrid = () => {
    if (ui.installedOnly) {
      return store.state.skills.map(installedCard)
    }
    // 「推荐」为默认全量视图（注册表 9 条全部在此，安装契约不被来源切分破坏）；
    // SkillHub / 套件 才按来源过滤
    let list = ui.source === 'recommend'
      ? DISCOVERY_SKILLS
      : DISCOVERY_SKILLS.filter((s) => s.source === ui.source)
    if (ui.chip !== '全部') list = list.filter((s) => s.category === ui.chip)
    const q = ui.q.trim().toLowerCase()
    if (q) {
      list = list.filter((s) => [s.name, s.desc, ...s.tags].join(' ').toLowerCase().includes(q))
    }
    const names = installedNames()
    return list.map((s) => ({ ...s, installed: names.has(s.name) }))
  }

  const renderGrid = () => {
    const grid = bodyEl.querySelector('#sk-grid')
    if (!grid) return
    const list = computeGrid()
    const names = installedNames()
    bodyEl.querySelector('#sk-grid-meta').textContent = ui.installedOnly
      ? `已安装（${list.length}）`
      : `可安装（${list.filter((s) => !s.installed).length}）`
    grid.innerHTML = list.length ? list.map((s) => `
      <div class="sk-card ${s.installed ? 'is-installed' : ''}" data-skill-card="${s.id}">
        ${popoverHtml(s.name, s.tags, s.space, s.updatedAt)}
        <div class="sk-card-top">
          <span class="sk-logo ${s.color}">${s.glyph}</span>
          <span class="sk-card-title">${s.name}${s.risk === 'review' ? '<b class="ex-badge">高风险</b>' : ''}</span>
          ${s.installed
            ? '<span class="sk-plus is-installed" title="已安装">✓</span>'
            : `<button class="sk-plus" type="button" data-install="${s.id}" aria-label="安装">+</button>`}
        </div>
        <p class="sk-card-desc">${s.desc}</p>
        <div class="sk-stats">
          <span class="sk-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>${formatCount(s.usage)}</span>
          <span class="sk-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>${formatCount(s.downloads)}</span>
        </div>
      </div>`).join('')
      : '<p class="ex-empty">没有匹配的技能，换个关键词或筛选条件试试。</p>'
    // 精选行的已安装态也实时刷新（按当前状态整体替换 + 按钮）
    bodyEl.querySelectorAll('[data-feature-card]').forEach((card) => {
      const f = FEATURED_SKILLS.find((x) => x.id === card.dataset.featureCard)
      const holder = card.querySelector('.sk-card-top')
      holder.querySelector('.sk-plus')?.remove()
      holder.insertAdjacentHTML('beforeend', plusButton(f.name, 'data-featured-install', f.id, names.has(f.name)))
    })
  }

  const renderAll = () => {
    bodyEl.innerHTML = `<div class="experts-layout">${sideHtml()}${mainHtml()}</div>`
    renderGrid()
  }

  // 手动检查更新（自动更新关闭时的主路径；开启时也可重复执行）
  const checkUpdates = (silent = false) => {
    const updated = []
    for (const sk of store.state.skills) {
      if (applyUpdate(sk)) updated.push(sk)
    }
    if (updated.length) {
      store.save()
      toast(`已更新 ${updated.length} 个技能：${updated.map((x) => x.name).join('、')}`)
      renderAll()
    } else if (!silent) {
      toast('所有技能均为最新版本')
    }
    return updated.length
  }

  bodyEl.addEventListener('click', async (ev) => {
    // mini-switch 是 span 不是 button，委托选择器需同时覆盖 [data-sk]
    const el = ev.target.closest('button, [data-sk]')
    if (!el || !bodyEl.contains(el)) return

    if (el.dataset.open === 'experts') { mask.remove(); return openExperts() }
    if (el.dataset.open === 'connectors') { mask.remove(); return openConnectors() }

    if (el.dataset.checkUpdate !== undefined) { checkUpdates(false); return }

    // 启用/停用：信任门控保留
    if (el.dataset.sk) {
      const sk = store.state.skills.find((x) => x.id === el.dataset.sk)
      if (!sk) return
      if (!store.state.settings.trustedSkills) {
        toast('请先在「设置 → 通用」中开启信任技能，再启用技能')
        return
      }
      sk.enabled = !sk.enabled
      store.save()
      toast(`${sk.name} 已${sk.enabled ? '启用' : '关闭'}`)
      renderAll()
      return
    }
    // 手动更新单个技能
    if (el.dataset.updateSk) {
      const sk = store.state.skills.find((x) => x.id === el.dataset.updateSk)
      if (sk && applyUpdate(sk)) {
        store.save()
        toast(`${sk.name} 已更新到 v${sk.version}`)
        renderAll()
      }
      return
    }
    // 注册表技能安装（data-install 契约：数量与顺序跟随 SKILL_REGISTRY）
    if (el.dataset.install) {
      const reg = SKILL_REGISTRY.find((r) => r.id === el.dataset.install)
      if (reg && await installSkill(reg, { fromRegistry: true })) renderAll()
      return
    }
    // 精选技能安装
    if (el.dataset.featuredInstall) {
      const f = FEATURED_SKILLS.find((x) => x.id === el.dataset.featuredInstall)
      if (f && await installSkill({ ...f, risk: 'trusted', version: '1.0.0' })) renderAll()
      return
    }
    if (el.dataset.shuffle !== undefined) {
      ui.featuredOffset = (ui.featuredOffset + FEATURED_SIZE) % FEATURED_SKILLS.length
      renderAll()
      return
    }
    if (el.dataset.installedToggle !== undefined) {
      ui.installedOnly = !ui.installedOnly
      renderAll()
      return
    }
    if (el.dataset.addSkill !== undefined) {
      // jsdom 未实现 window.prompt，防御式调用；真实浏览器走原生 prompt
      const name = typeof globalThis.prompt === 'function' ? globalThis.prompt('技能名称') : null
      if (!name?.trim()) return
      const entry = { name: name.trim(), desc: '自定义本地技能', risk: 'trusted', version: '1.0.0' }
      if (await installSkill(entry)) renderAll()
      return
    }
    if (el.dataset.source) {
      ui.source = el.dataset.source
      ui.chip = '全部'
      renderAll()
      return
    }
    if (el.dataset.skChip) {
      ui.chip = el.dataset.skChip
      bodyEl.querySelectorAll('[data-sk-chip]').forEach((c) => c.classList.toggle('is-active', c === el))
      renderGrid()
      return
    }
    if (el.dataset.skChipScroll !== undefined) {
      bodyEl.querySelector('.ex-chip-track')?.scrollBy?.({ left: 220, behavior: 'smooth' })
    }
  })

  bodyEl.addEventListener('input', (ev) => {
    if (ev.target.id !== 'sk-search-input') return
    ui.q = ev.target.value
    renderGrid()
  })

  renderAll()
  // 自动更新：打开弹窗即视为空闲时刻，自动消费所有可用升级
  if (store.state.settings.skillAutoUpdate) checkUpdates(true)
}

export function openExperts() {
  const { mask, bodyEl } = openModal({ title: '专家' })
  mask.querySelector('.modal-box').classList.add('modal-experts')

  // 右侧发现区的交互状态（仅本弹窗生命周期内）
  const ui = { q: '', kind: 'expert', sort: '综合', chip: '全部', mineOnly: false }
  const pinnedNames = () => new Set(store.state.experts.filter((e) => e.pinned).map((e) => e.name))

  // 目录专家固定/取消固定：与 store.state.experts（首页专家子菜单同源）真实联动并持久化
  const toggleCatalogPin = (entry) => {
    const existing = store.state.experts.find((e) => e.name === entry.name)
    if (existing) {
      existing.pinned = !existing.pinned
      toast(existing.pinned ? `已固定「${entry.name}」` : `已取消固定「${entry.name}」`)
    } else {
      store.state.experts.push({ id: uid('ex'), name: entry.name, color: entry.color, desc: entry.desc, pinned: true })
      toast(`已固定「${entry.name}」`)
    }
    store.save()
  }

  /* ---------- 左侧：固定管理 + 启用中的智能体（结构沿用旧弹窗） ---------- */
  const sideHtml = () => {
    const agents = activeAgents()
    const pinnedCount = store.state.experts.filter((e) => e.pinned).length
    return `<aside class="experts-side">
      <p class="experts-side-label">固定的专家（${pinnedCount}）</p>
      <div class="modal-list">${store.state.experts.map((ex) => `
        <div class="modal-list-item">
          <div class="grow"><div class="primary">${ex.name}${ex.pinned ? ' <span class="count-pill">已固定</span>' : ''}</div>
          <div class="secondary">${ex.desc}</div></div>
          <button class="btn ${ex.pinned ? 'btn-ghost' : 'btn-primary'}" data-ex="${ex.id}" type="button">
            ${ex.pinned ? '取消固定' : '固定到专家菜单'}</button>
        </div>`).join('')}</div>
      ${agents.length ? `<p class="settings-section-label">已启用的智能体（设置中管理）</p>
      <div class="modal-list">${agents.map((ag) => `
      <div class="modal-list-item">
        <div class="grow"><div class="primary">${ag.name}</div>
        <div class="secondary">来自设置 → 智能体</div></div>
        <span class="count-pill">启用中</span>
      </div>`).join('')}</div>`
        : '<p class="modal-copy" style="margin-top:12px">没有启用的智能体，可在「设置 → 智能体」中开启。</p>'}
    </aside>`
  }

  /* ---------- 右侧：截图式发现区骨架 ---------- */
  const mainHtml = () => `<section class="experts-main">
    <div class="ex-topbar">
      <div class="ex-top-tabs" role="tablist">
        <button class="ex-top-tab is-active" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          专家</button>
        <button class="ex-top-tab" type="button" data-open="skills">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
          技能</button>
        <button class="ex-top-tab" type="button" data-open="connectors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          连接器</button>
      </div>
      <div class="ex-top-actions">
        <label class="ex-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="ex-search-input" type="search" placeholder="搜索专家" value="${ui.q.replace(/"/g, '&quot;')}" />
        </label>
        <button class="ex-mine-btn ${ui.mineOnly ? 'is-active' : ''}" type="button" data-mine>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/></svg>
          我的专家</button>
      </div>
    </div>

    <div class="ex-cat-wrap">
      <button class="ex-scroll-btn" type="button" data-cat-scroll="-1" aria-label="向左滚动">‹</button>
      <div class="ex-cat-track" id="ex-cat-track">${EXPERT_CATEGORIES.map((c) => `
        <div class="ex-cat" role="button" tabindex="0" data-cat="${c.filter}">
          <span class="ex-cat-banner" style="--g:${c.gradient}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${c.icon}"/></svg>
            <span class="ex-cat-name">${c.name}</span>
          </span>
          <span class="ex-cat-subs">${c.subs.map((s) => `
            <span class="ex-cat-sub">${s}<i>›</i></span>`).join('')}</span>
        </div>`).join('')}</div>
      <button class="ex-scroll-btn" type="button" data-cat-scroll="1" aria-label="向右滚动">›</button>
    </div>

    <div class="ex-sub-row">
      <div class="ex-kind-tabs">
        <button class="ex-kind-tab ${ui.kind === 'expert' ? 'is-active' : ''}" type="button" data-kind="expert">专家</button>
        <button class="ex-kind-tab ${ui.kind === 'team' ? 'is-active' : ''}" type="button" data-kind="team">专家团</button>
      </div>
      <div class="ex-sort">
        ${['综合', '最热', '最新'].map((s) => `<button class="ex-sort-btn ${ui.sort === s ? 'is-active' : ''}" type="button" data-sort="${s}">${s}</button>`).join('')}
      </div>
    </div>

    <div class="ex-chip-wrap">
      <div class="ex-chip-track" id="ex-chip-track">${EXPERT_FILTERS.map((f) => `
        <button class="ex-chip ${ui.chip === f ? 'is-active' : ''}" type="button" data-chip="${f}">${f}</button>`).join('')}</div>
      <button class="ex-chip-next" type="button" data-chip-scroll aria-label="向右滚动">›</button>
    </div>

    <div class="ex-grid" id="ex-grid"></div>
  </section>`

  /* ---------- 网格：搜索 / 分类 / 排序 / 我的专家 全部真实过滤 ---------- */
  const computeList = () => {
    let list = EXPERT_CATALOG.filter((e) => e.kind === ui.kind)
    if (ui.chip !== '全部') list = list.filter((e) => e.category === ui.chip)
    if (ui.mineOnly) {
      const pinned = pinnedNames()
      list = list.filter((e) => pinned.has(e.name))
    }
    const q = ui.q.trim().toLowerCase()
    if (q) {
      list = list.filter((e) => [e.name, e.desc, ...e.tags].join(' ').toLowerCase().includes(q))
    }
    if (ui.sort === '最热') list = [...list].sort((a, b) => b.usage - a.usage)
    else if (ui.sort === '最新') list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return list
  }

  const renderGrid = () => {
    const grid = bodyEl.querySelector('#ex-grid')
    if (!grid) return
    const list = computeList()
    const pinned = pinnedNames()
    grid.innerHTML = list.length ? list.map((e) => `
      <button class="ex-card ${pinned.has(e.name) ? 'is-pinned' : ''}" type="button" data-pin="${e.id}">
        <span class="ex-card-head">
          <span class="expert-avatar ${e.color}">${e.name[0]}</span>
          <span class="ex-card-title">
            <span class="ex-card-name">${e.name}${e.badge ? `<b class="ex-badge">${e.badge}</b>` : ''}</span>
            <span class="ex-card-desc">${e.desc}</span>
          </span>
        </span>
        <span class="ex-card-tags">${e.tags.map((t) => `<span class="ex-tag">${t}</span>`).join('')}</span>
        <span class="ex-card-foot">
          <span class="ex-usage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>
            ${formatUsage(e.usage)}</span>
          ${pinned.has(e.name) ? '<span class="ex-pin-pill">已固定</span>' : ''}
        </span>
      </button>`).join('')
      : '<p class="ex-empty">没有匹配的专家，换个关键词或筛选条件试试。</p>'
  }

  const renderAll = () => {
    bodyEl.innerHTML = `<div class="experts-layout">${sideHtml()}${mainHtml()}</div>`
    renderGrid()
  }

  // 事件代理挂在容器上，重渲染后依然有效
  bodyEl.addEventListener('click', (ev) => {
    const el = ev.target.closest('button, .ex-cat')
    if (!el || !bodyEl.contains(el)) return

    if (el.dataset.open === 'skills') { mask.remove(); return openSkills() }
    if (el.dataset.open === 'connectors') { mask.remove(); return openConnectors() }

    if (el.dataset.mine !== undefined) {
      ui.mineOnly = !ui.mineOnly
      el.classList.toggle('is-active', ui.mineOnly)
      renderGrid()
      return
    }
    if (el.dataset.cat) {
      ui.chip = el.dataset.cat
      bodyEl.querySelectorAll('[data-chip]').forEach((c) => c.classList.toggle('is-active', c.dataset.chip === ui.chip))
      // jsdom 未实现 scrollIntoView，真实浏览器才滚动；可选调用保证后续逻辑不中断
      bodyEl.querySelector(`[data-chip="${ui.chip}"]`)?.scrollIntoView?.({ inline: 'nearest', block: 'nearest' })
      renderGrid()
      return
    }
    if (el.dataset.catScroll) {
      bodyEl.querySelector('#ex-cat-track')?.scrollBy?.({ left: Number(el.dataset.catScroll) * 246, behavior: 'smooth' })
      return
    }
    if (el.dataset.chipScroll !== undefined) {
      bodyEl.querySelector('#ex-chip-track')?.scrollBy?.({ left: 220, behavior: 'smooth' })
      return
    }
    if (el.dataset.kind) {
      ui.kind = el.dataset.kind
      bodyEl.querySelectorAll('[data-kind]').forEach((b) => b.classList.toggle('is-active', b === el))
      renderGrid()
      return
    }
    if (el.dataset.sort) {
      ui.sort = el.dataset.sort
      bodyEl.querySelectorAll('[data-sort]').forEach((b) => b.classList.toggle('is-active', b === el))
      renderGrid()
      return
    }
    if (el.dataset.chip) {
      ui.chip = el.dataset.chip
      bodyEl.querySelectorAll('[data-chip]').forEach((c) => c.classList.toggle('is-active', c === el))
      renderGrid()
      return
    }
    if (el.dataset.pin) {
      const entry = EXPERT_CATALOG.find((e) => e.id === el.dataset.pin)
      if (!entry) return
      toggleCatalogPin(entry)
      renderAll()
      // 重渲染后恢复搜索词焦点
      const input = bodyEl.querySelector('#ex-search-input')
      if (input && document.activeElement?.tagName === 'INPUT') input.focus()
      return
    }
    // 左侧固定管理（旧契约 data-ex，逻辑保持不变）
    if (el.dataset.ex) {
      const ex = store.state.experts.find((x) => x.id === el.dataset.ex)
      if (!ex) return
      ex.pinned = !ex.pinned
      store.save()
      toast(ex.pinned ? `已固定「${ex.name}」` : `已取消固定「${ex.name}」`)
      renderAll()
    }
  })

  // 搜索：只刷新网格，输入焦点不丢失
  bodyEl.addEventListener('input', (ev) => {
    if (ev.target.id !== 'ex-search-input') return
    ui.q = ev.target.value
    renderGrid()
  })

  // 键盘可达：场景卡片 Enter/Space 等同点击
  bodyEl.addEventListener('keydown', (ev) => {
    const cat = ev.target.closest?.('.ex-cat')
    if (cat && (ev.key === 'Enter' || ev.key === ' ')) {
      ev.preventDefault()
      cat.click()
    }
  })

  renderAll()
}

export function openConnectors() {
  const { bodyEl } = openModal({ title: '连接器' })
  const render = () => {
    bodyEl.innerHTML = `<div class="modal-list">${store.state.connectors.map((cn) => `
      <div class="modal-list-item">
        <div class="grow"><div class="primary">${cn.name}</div>
        <div class="secondary">${cn.connected ? '已连接' : '未连接'}</div></div>
        <button class="btn ${cn.connected ? 'btn-ghost' : 'btn-primary'}" data-cn="${cn.id}">
          ${cn.connected ? '断开' : '连接'}</button>
      </div>`).join('')}</div>`
    bodyEl.querySelectorAll('[data-cn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cn = store.state.connectors.find((x) => x.id === btn.dataset.cn)
        cn.connected = !cn.connected
        store.save()
        toast(`${cn.name} 已${cn.connected ? '连接' : '断开'}`)
        render()
      })
    })
  }
  render()
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
    ...store.state.gammas.filter((g) => !g.deleted).map((g) => ({ label: g.title, icon: '📄', href: 'index.html', tag: 'Design Buddy' })),
    ...store.state.media.map((m) => ({ label: m.name, icon: '🎬', href: 'media.html', tag: '媒体' })),
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
          <span>${it.icon}</span><span>${it.label}</span><span class="tag">${it.tag}</span>
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
