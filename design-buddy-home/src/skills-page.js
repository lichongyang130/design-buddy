/* ============================================================
   技能页：把截图式发现区做成真实页面（左侧沿用首页窄栏 rail）
   - 顶部 专家 / 技能 / 连接器：三者都是独立页面
   - 精选技能 5 张 + 换一批；推荐 / SkillHub / 套件；分类 chips；搜索
   - 安装走真实持久化 + 信任门控（高风险始终手动确认）
   - 「已安装」视图接管原先左侧管理栏：启停开关、版本、检查更新、手动更新
   ============================================================ */

import './rail-flyout.js'
import { requireAuth } from './auth.js'
requireAuth()
import './skills.css'
import { store, toast, uid, confirmModal, downloadFile } from './core.js'
import { initGlobalUI, openExperts } from './global-ui.js'
import { SKILL_REGISTRY, hasUpdate, registryEntry, SEED_SKILL_VERSION } from './skill-registry.js'
import {
  FEATURED_SKILLS, FEATURED_SIZE, SKILL_FILTERS, PAGE_SKILLS, DISCOVERY_SKILLS, SKILL_META, formatCount,
} from './skills-catalog.js'
import { resultHTML } from './expert-runtime.js'
import { skillCap, runSkill } from './skill-runtime.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const ui = { q: '', source: 'recommend', chip: '全部', installedOnly: false, featuredOffset: 0 }

const installedNames = () => new Set(store.state.skills.map((s) => s.name))

const applyUpdate = (sk) => {
  const reg = registryEntry(sk.name)
  if (!reg || !hasUpdate(sk)) return false
  sk.version = reg.version
  return true
}

/* ---------- 安装：注册表 / 精选 / 自定义统一入口 ---------- */

const installSkill = async (entry) => {
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

/* ---------- 悬浮信息卡（截图里是「本地电脑 / 所属空间 / 更新于」三行） ---------- */

const ICON = {
  device: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>',
}

const popoverHtml = (name, category, space, updatedAt) => `
  <span class="sk-pop" role="tooltip">
    <span class="sk-pop-title">${name}</span>
    <span class="sk-pop-row">${ICON.device}<span class="sk-pop-text">本地电脑</span><span class="sk-pop-tag">${category}</span></span>
    <span class="sk-pop-row">${ICON.folder}<span class="sk-pop-text">所属空间：${space}</span></span>
    <span class="sk-pop-row">${ICON.clock}<span class="sk-pop-text">更新于 ${updatedAt}</span></span>
  </span>`

/* ---------- 卡片 ---------- */

const STATS = (usage, downloads) => `
  <span class="sk-stats">
    <span class="sk-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/></svg>${formatCount(usage)}</span>
    <span class="sk-stat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>${formatCount(downloads)}</span>
  </span>`

const plusButton = (name, attr, id, installed) => installed
  ? '<span class="sk-plus is-installed" title="已安装">✓</span>'
  : `<button class="sk-plus" type="button" ${attr}="${id}" aria-label="安装">+</button>`

const headHtml = (s, { installed, attr }) => `
  <div class="sk-card-top">
    <span class="sk-logo ${s.color}">${s.glyph}</span>
    <span class="sk-card-text">
      <span class="sk-card-title">${s.name}${s.risk === 'review' ? '<b class="ex-badge">高风险</b>' : ''}</span>
      <span class="sk-card-desc">${s.paid ? '<b class="sk-paid">付费</b>' : ''}${s.desc}</span>
    </span>
    ${plusButton(s.name, attr, s.id, installed)}
  </div>`

/* ---------- 精选技能 ---------- */

const featuredSlice = () => Array.from(
  { length: FEATURED_SIZE },
  (_, i) => FEATURED_SKILLS[(ui.featuredOffset + i) % FEATURED_SKILLS.length],
)

const renderFeatured = () => {
  const names = installedNames()
  $('#sk-feature-track').innerHTML = featuredSlice().map((f) => `
    <div class="sk-feature-card" data-feature-card="${f.id}" data-sk-name="${f.name}" tabindex="0">
      ${popoverHtml(f.name, f.category, f.space, f.updatedAt)}
      ${headHtml(f, { installed: names.has(f.name), attr: 'data-featured-install' })}
      ${STATS(f.usage, f.downloads)}
    </div>`).join('')
}

/* ---------- 已安装视图：启停 / 版本 / 更新 ---------- */

const installedCard = (sk) => {
  const reg = SKILL_REGISTRY.find((r) => r.name === sk.name)
  const meta = reg ? SKILL_META[reg.id] : null
  const featured = FEATURED_SKILLS.find((f) => f.name === sk.name)
  const fallback = { color: 'av-blue', glyph: sk.name[0] || '技', category: '自定义技能', usage: 0, downloads: 0, space: '本地', updatedAt: '—' }
  return {
    id: reg?.id || sk.id, name: sk.name, desc: sk.desc, risk: reg?.risk,
    ...(meta || featured || fallback), installed: true, record: sk,
    updatable: hasUpdate(sk), regVersion: reg?.version,
  }
}

const renderInstalledGrid = () => {
  const list = store.state.skills.map(installedCard)
  const trusted = store.state.settings.trustedSkills
  const autoUpdate = store.state.settings.skillAutoUpdate
  // 自动更新被关掉时给一条明确提示（原先在弹窗左侧栏顶部）
  const paused = autoUpdate ? '' : '<p class="sk-paused">技能自动更新已暂停，可在设置中恢复，或使用「检查更新」手动升级。</p>'
  const tip = '<p class="sk-run-tip">点卡片即可运行真实算法，结果与产物都能下载。</p>'
  $('#sk-grid').innerHTML = tip + paused + (list.length ? list.map((s) => `
    <div class="sk-card is-installed" data-skill-card="${s.id}" data-sk-name="${s.name}" tabindex="0">
      ${popoverHtml(s.name, s.category, s.space, s.updatedAt)}
      ${headHtml(s, { installed: true, attr: 'data-install' })}
      <div class="sk-card-manage">
        ${trusted ? '' : '<span class="count-pill">未信任</span>'}
        ${s.updatable
          ? `<span class="count-pill update-pill">可更新 v${s.regVersion}</span>
             ${autoUpdate ? '' : `<button class="btn btn-ghost sk-update-btn" type="button" data-update-sk="${s.record.id}">更新</button>`}`
          : `<span class="version-tag">v${s.record.version || SEED_SKILL_VERSION}</span>`}
        <button class="btn btn-ghost sk-run-card-btn" type="button" data-sk-open="${s.record.id}" data-sk-name="${s.name}">运行</button>
        <span class="mini-switch ${s.record.enabled ? 'is-on' : ''}" data-sk="${s.record.id}" role="switch"
          aria-checked="${s.record.enabled}" tabindex="0" aria-label="启用 ${s.name}"></span>
      </div>
      ${STATS(s.usage, s.downloads)}
    </div>`).join('')
    : '<p class="ex-empty">还没有安装技能，回到「推荐」挑一个试试。</p>')
}

/* ---------- 发现网格 ---------- */

const computeGrid = () => {
  let list = ui.source === 'recommend'
    ? PAGE_SKILLS
    : PAGE_SKILLS.filter((s) => s.source === ui.source)
  if (ui.chip !== '全部') list = list.filter((s) => s.category === ui.chip)
  const q = ui.q.trim().toLowerCase()
  if (q) list = list.filter((s) => [s.name, s.desc, ...s.tags].join(' ').toLowerCase().includes(q))
  const names = installedNames()
  return list.map((s) => ({ ...s, installed: names.has(s.name) }))
}

const renderGrid = () => {
  if (ui.installedOnly) return renderInstalledGrid()
  const list = computeGrid()
  $('#sk-grid').innerHTML = list.length ? list.map((s) => `
    <div class="sk-card${s.installed ? ' is-installed' : ''}" data-skill-card="${s.id}" data-sk-name="${s.name}" tabindex="0">
      ${popoverHtml(s.name, s.category, s.space, s.updatedAt)}
      ${headHtml(s, { installed: s.installed, attr: 'data-install' })}
      ${STATS(s.usage, s.downloads)}
    </div>`).join('')
    : '<p class="ex-empty">没有匹配的技能，换个关键词或筛选条件试试。</p>'
}

/* ---------- 顶栏与会话标题 ---------- */

const renderTopbar = () => {
  $('#sk-installed-count').textContent = `已安装(${store.state.skills.length})`
  $('[data-installed-toggle]').classList.toggle('is-active', ui.installedOnly)
}

const renderSectionHead = () => {
  const head = $('#sk-section-head')
  head.innerHTML = ui.installedOnly
    ? `<h4 class="sk-section-title">已安装技能（${store.state.skills.length}）</h4>
       <button class="sk-shuffle" type="button" data-check-update>
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
         检查更新</button>`
    : `<h4 class="sk-section-title">精选技能</h4>
       <button class="sk-shuffle" type="button" data-shuffle>
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
         换一批</button>`
}

const renderChips = () => {
  $('#sk-chip-track').innerHTML = SKILL_FILTERS.map((f) => `
    <button class="ex-chip${ui.chip === f ? ' is-active' : ''}" type="button" data-sk-chip="${f}">${f}</button>`).join('')
}

const renderAll = () => {
  renderTopbar()
  renderSectionHead()
  renderFeatured()
  renderChips()
  renderGrid()
}

// 自动更新：打开页面即视为空闲时刻，自动消费所有可用升级
const checkUpdates = (silent = false) => {
  const updated = store.state.skills.filter((sk) => applyUpdate(sk))
  if (updated.length) {
    store.save()
    toast(`已更新 ${updated.length} 个技能：${updated.map((x) => x.name).join('、')}`)
    renderAll()
  } else if (!silent) {
    toast('所有技能均为最新版本')
  }
  return updated.length
}

/* ---------- 直接开工：技能运行面板（真实算法 + 可下载产物） ---------- */

const panel = $('#sk-run-panel')
let runName = ''
let runArtifacts = []
let runText = ''

const capLine = (cap) => (cap
  ? '本地引擎真实执行：解析输入、算数、生成文件，不联网也不编数据。'
  : '这个技能没有专属引擎，运行会按句做结构化整理并导出 Markdown。')

const renderPanel = (keep = '') => {
  const cap = skillCap(runName)
  const installed = installedNames().has(runName)
  panel.hidden = false
  panel.innerHTML = `
    <div class="sk-run-head">
      <span class="sk-run-logo">${runName.slice(0, 1)}</span>
      <div class="sk-run-ident">
        <h4>${runName}<span class="sk-run-tag">${cap ? '本地引擎' : '结构化'}</span></h4>
        <p>${capLine(cap)}</p>
      </div>
      <button class="sk-run-close" type="button" data-sk-run-close aria-label="收起运行面板">×</button>
    </div>
    <div class="sk-run-tools">
      ${cap ? `<button class="sk-run-sample" type="button" data-sk-sample>填入示例</button>` : ''}
      <span class="sk-run-hint">${installed ? '已安装，可在首页直接调用' : '运行不需要安装；安装后可在首页调用'}</span>
    </div>
    <textarea class="sk-run-input" id="sk-run-input" rows="3" placeholder="${cap ? cap.sample : '把要整理的内容贴进来…'}"></textarea>
    <div class="sk-run-actions">
      <button class="sk-run-btn" type="button" data-sk-run>运行</button>
      <button class="sk-run-install" type="button" data-sk-install-inline ${installed ? 'hidden' : ''}>安装技能</button>
      <span class="sk-run-hint">真实运行 · 产物可下载</span>
    </div>
    <div class="sk-run-out" id="sk-run-out" hidden></div>`
  const input = panel.querySelector('#sk-run-input')
  if (input) {
    input.value = keep
    input.focus?.()
  }
}

const openRunPanel = (name, keep = '') => {
  runName = name
  runArtifacts = []
  runText = ''
  renderPanel(keep)
  panel.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' })
}

const runCurrent = () => {
  const input = panel.querySelector('#sk-run-input')
  const out = panel.querySelector('#sk-run-out')
  if (!out) return
  const raw = input?.value.trim() ?? ''
  out.hidden = false
  out.innerHTML = '<div class="xr-running"><span></span>正在运行…</div>'
  setTimeout(() => {
    const result = runSkill(runName, raw)
    if (!result) {
      out.innerHTML = '<p class="sk-run-empty">先输入要处理的内容，再运行。</p>'
      return
    }
    runArtifacts = result.artifacts ?? []
    runText = `${result.title}\n\n${result.summary}\n\n${runArtifacts.map((a) => `--- ${a.name} ---\n${a.content}`).join('\n\n')}`
    out.innerHTML = `${resultHTML(result)}
      <div class="sk-run-out-actions">
        ${runArtifacts.map((a, i) => `<button class="xr-act" type="button" data-sk-download="${i}">下载 ${a.name}</button>`).join('')}
        <button class="xr-act" type="button" data-sk-copy>复制结果</button>
        <button class="xr-act ghost" type="button" data-sk-clear>收起</button>
      </div>`
  }, 180)
}

panel.addEventListener('click', async (ev) => {
  const el = ev.target
  if (el.closest('[data-sk-run-close]')) {
    panel.hidden = true
    panel.innerHTML = ''
    runName = ''
    return
  }
  if (el.closest('[data-sk-sample]')) {
    const input = panel.querySelector('#sk-run-input')
    const cap = skillCap(runName)
    if (input && cap) {
      input.value = cap.sample
      input.focus?.()
    }
    return
  }
  if (el.closest('[data-sk-run]')) {
    runCurrent()
    return
  }
  if (el.closest('[data-sk-install-inline]')) {
    const entry = PAGE_SKILLS.find((x) => x.name === runName) || SKILL_REGISTRY.find((x) => x.name === runName)
    if (entry && await installSkill(entry)) {
      const keep = panel.querySelector('#sk-run-input')?.value ?? ''
      renderPanel(keep)
      renderAll()
      toast(`技能「${runName}」已安装，现在可以在首页直接调用`)
    }
    return
  }
  const dl = el.closest('[data-sk-download]')
  if (dl) {
    const art = runArtifacts[Number(dl.dataset.skDownload)]
    if (art) {
      downloadFile(art.name, art.content, art.mime ?? 'text/plain')
      toast(`已下载 ${art.name}`)
    }
    return
  }
  if (el.closest('[data-sk-copy]')) {
    navigator.clipboard?.writeText(runText).then(
      () => toast('结果已复制'),
      () => toast('复制失败，请手动选中'),
    )
    return
  }
  if (el.closest('[data-sk-clear]')) {
    const out = panel.querySelector('#sk-run-out')
    if (out) {
      out.hidden = true
      out.innerHTML = ''
    }
  }
})

/* ---------- 事件 ---------- */

$('.ex-top-actions').addEventListener('click', async (ev) => {
  const el = ev.target.closest('button')
  if (!el) return

  if (el.dataset.installedToggle !== undefined) {
    ui.installedOnly = !ui.installedOnly
    renderAll()
    return
  }
  if (el.dataset.addSkill !== undefined) {
    const name = typeof globalThis.prompt === 'function' ? globalThis.prompt('技能名称') : null
    if (!name?.trim()) return
    if (await installSkill({ name: name.trim(), desc: '自定义本地技能', risk: 'trusted', version: SEED_SKILL_VERSION })) renderAll()
  }
})

$('#sk-search-input').addEventListener('input', (ev) => {
  ui.q = ev.target.value
  renderGrid()
})

$('#sk-section-head').addEventListener('click', (ev) => {
  if (ev.target.closest('[data-shuffle]')) {
    ui.featuredOffset = (ui.featuredOffset + FEATURED_SIZE) % FEATURED_SKILLS.length
    renderFeatured()
    return
  }
  if (ev.target.closest('[data-check-update]')) checkUpdates(false)
})

$('.sk-source-tabs').addEventListener('click', (ev) => {
  const tab = ev.target.closest('[data-source]')
  if (!tab) return
  ui.source = tab.dataset.source
  ui.installedOnly = false
  $$('[data-source]').forEach((t) => t.classList.toggle('is-active', t === tab))
  renderAll()
})

$('#sk-chip-track').addEventListener('click', (ev) => {
  const chip = ev.target.closest('[data-sk-chip]')
  if (!chip) return
  ui.chip = chip.dataset.skChip
  $$('[data-sk-chip]').forEach((c) => c.classList.toggle('is-active', c === chip))
  renderGrid()
})

$('[data-sk-chip-scroll]').addEventListener('click', () => {
  $('#sk-chip-track').scrollBy?.({ left: 220, behavior: 'smooth' })
})

$('#sk-grid').addEventListener('click', async (ev) => {
  // 卡片主体（不是安装 / 启停 / 更新 / 运行按钮）→ 直接打开运行面板
  const card = ev.target.closest('[data-skill-card]')
  if (card && !ev.target.closest('[data-install], [data-sk], [data-update-sk], [data-sk-open]')) {
    openRunPanel(card.dataset.skName)
    return
  }

  const el = ev.target.closest('button, [data-sk]')
  if (!el) return

  if (el.dataset.skOpen) {
    openRunPanel(el.dataset.skName)
    return
  }

  if (el.dataset.install) {
    const reg = SKILL_REGISTRY.find((r) => r.id === el.dataset.install)
    const extra = PAGE_SKILLS.find((r) => r.id === el.dataset.install)
    const entry = reg || extra
    if (entry && await installSkill(entry)) renderAll()
    return
  }

  // 启停：信任门控保留
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
  }
})

$('#sk-feature-track').addEventListener('click', async (ev) => {
  const btn = ev.target.closest('[data-featured-install]')
  if (!btn) {
    const card = ev.target.closest('[data-feature-card]')
    if (card) openRunPanel(card.dataset.skName)
    return
  }
  const f = FEATURED_SKILLS.find((x) => x.id === btn.dataset.featuredInstall)
  if (f && await installSkill({ ...f, risk: 'trusted' })) renderAll()
})

// 键盘：卡片上按 Enter / 空格直接开工（与鼠标点击等价）
const cardKeydown = (ev) => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return
  // 焦点在卡片里的按钮 / 开关上时，交给它们自己的行为
  if (ev.target.closest('button, [data-sk], [data-sk-open], [data-install], [data-update-sk]')) return
  const card = ev.target.closest('[data-skill-card], [data-feature-card]')
  if (!card) return
  ev.preventDefault()
  openRunPanel(card.dataset.skName)
}
$('#sk-grid').addEventListener('keydown', cardKeydown)
$('#sk-feature-track').addEventListener('keydown', cardKeydown)

/* ---------- 首屏 ---------- */

renderAll()
if (store.state.settings.skillAutoUpdate) checkUpdates(true)
