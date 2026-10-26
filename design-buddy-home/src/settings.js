/* ============================================================
   设置页：14 个设置组全部为真实表单并持久化到 localStorage
   通用视图保留原截图结构；其余 13 组动态渲染、双向绑定。
   ============================================================ */

import './rail-flyout.js'
import { requireAuth } from './auth.js'
requireAuth()
import { store, toast, confirmModal, downloadFile, uid } from './core.js'
import { initGlobalUI, applyAppearance, openUpgrade } from './global-ui.js'
import {
  previewLockScreen, testWakeLock, wakeLockState, pwaState, installPwa, testProxyConnection,
} from './settings-effects.js'
import { t, tt, optionLabel, dynOptionLabel } from './i18n.js'
import { AVAILABLE_MODELS } from './model-config.js'

initGlobalUI()

// 配图模式与模板页共享同一持久化字段，默认绘本插画
store.state.imageMode ??= 'illustration'
// 旧版本存储的中文档位模型名（标准模型等）已下线：不在写死白名单内时迁移到首个可用模型
// 注意：此处位于模块顶部，s() 等 const 助手尚未初始化，只能直接走 store.state
if (!AVAILABLE_MODELS.some((m) => m.id === store.state.settings.model)) {
  store.state.settings.model = AVAILABLE_MODELS[0]?.id ?? ''
  store.save()
}

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
const s = () => store.state.settings
// 当前界面语言（存储为语言本名，缺省简体中文）
const curLang = () => s().language || '简体中文'
// 当前停留的设置组 key，语言切换时据此重绘动态视图
let activeSection = 'general'

/* ---------------- 通用工具：按路径读写 state ---------------- */

function getPath(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], store.state)
}
function setPath(path, value) {
  const keys = path.split('.')
  const last = keys.pop()
  const obj = keys.reduce((acc, key) => acc[key], store.state)
  obj[last] = value
  store.save()
}

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function row(title, desc, control) {
  return `
    <div class="setting-row">
      <div class="setting-info"><h3>${title}</h3>${desc ? `<p>${desc}</p>` : ''}</div>
      <div>${control}</div>
    </div>`
}

function switchHtml(path) {
  const on = getPath(path)
  return `<button class="switch ${on ? 'is-on' : ''}" type="button" role="switch"
    aria-checked="${on}" data-bind-switch="${path}"><span class="switch-knob"></span></button>`
}

function selectHtml(path, options, kind = path) {
  const cur = getPath(path)
  const lang = curLang()
  return `<select data-bind="${path}">
    ${options.map(([v, label]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${dynOptionLabel(kind, v, label, lang)}</option>`).join('')}
  </select>`
}

function textHtml(path, placeholder = '') {
  return `<input type="text" data-bind="${path}" value="${esc(getPath(path))}" placeholder="${placeholder}" />`
}

function card(inner, label) {
  return `<p class="settings-section-label">${label}</p><section class="settings-card">${inner}</section>`
}

/* ---------------- 通用视图（原 HTML 结构）绑定 ---------------- */

// 四个下拉的存储路径与标题 token；枚举下拉的存储值始终是中文枚举（旧数据契约不变）
const SELECT_KIND_META = {
  language: { path: 'settings.language', labelToken: 'set.language' },
  linkOpen: { path: 'settings.linkOpen', labelToken: 'set.linkOpen' },
  lockScreen: { path: 'settings.lockScreen', labelToken: 'set.lockScreen' },
  proxy: { path: 'settings.proxy', labelToken: 'set.proxy' },
}
// 四个开关：DOM 顺序与路径、标题 token 一一对应
const SWITCH_META = [
  ['settings.keepAwake', 'set.keepAwake'],
  ['settings.autoStart', 'set.autoStart'],
  ['settings.trustedSkills', 'set.trustedSkills'],
  ['settings.skillAutoUpdate', 'set.skillAutoUpdate'],
]
const ZOOM_LEVELS = [0.85, 0.925, 1, 1.08, 1.17]
const FONT_TOKENS = ['font.tiny', 'font.small', 'font.normal', 'font.large', 'font.huge']
const fontLabel = (i) => t(FONT_TOKENS[i], curLang())

function bindGeneral() {
  const wraps = $$('[data-select]')

  // 四个下拉同一时刻只允许一个展开；外部点击 / Esc 统一收起
  const closeAllSelects = (except) => {
    wraps.forEach((w) => {
      if (w === except) return
      w.classList.remove('is-open')
      const menu = w.querySelector('.select-menu')
      const button = w.querySelector('.select-btn')
      if (menu) menu.hidden = true
      button?.setAttribute('aria-expanded', 'false')
    })
  }

  wraps.forEach((wrap) => {
    const kind = wrap.dataset.selectKind
    const meta = SELECT_KIND_META[kind]
    if (!meta) return
    const valueEl = $('.select-value', wrap)
    const btn = $('.select-btn', wrap)
    const menu = $('.select-menu', wrap)
    const close = () => {
      wrap.classList.remove('is-open')
      menu.hidden = true
      btn.setAttribute('aria-expanded', 'false')
    }
    // 语言名直接显示；枚举值翻译为当前语言
    const paint = () => {
      const val = getPath(meta.path)
      valueEl.textContent = kind === 'language' ? val : optionLabel(kind, val, curLang())
    }
    paint()

    // 展开 / 收起：点击按钮切换，同时收起其他下拉
    btn.addEventListener('click', (event) => {
      event.stopPropagation()
      const willOpen = menu.hidden
      closeAllSelects(wrap)
      menu.hidden = !willOpen
      wrap.classList.toggle('is-open', willOpen)
      btn.setAttribute('aria-expanded', String(willOpen))
    })

    wrap.addEventListener('click', (event) => {
      const opt = event.target.closest('.select-option')
      if (!opt) return
      // 语言选项存母语名；枚举选项存 data-value 中的中文枚举
      const canonical = kind === 'language' ? opt.textContent.trim() : opt.dataset.value
      setPath(meta.path, canonical)
      paint()
      $$('.select-option', wrap).forEach((o) => {
        const on = o === opt
        o.classList.toggle('is-selected', on)
        o.setAttribute('aria-selected', String(on))
      })
      const shown = kind === 'language' ? canonical : optionLabel(kind, canonical, curLang())
      toast(tt('toast.saved', curLang(), { label: t(meta.labelToken, curLang()), value: shown }))
      close()
    })
  })

  // 点击浮层外部或按 Esc：收起全部下拉
  document.addEventListener('click', () => closeAllSelects())
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllSelects()
  })

  $$('[data-switch]').forEach((sw, i) => {
    const [path, labelToken] = SWITCH_META[i]
    sw.addEventListener('click', () => {
      const on = !getPath(path)
      setPath(path, on)
      sw.classList.toggle('is-on', on)
      sw.setAttribute('aria-checked', String(on))
      toast(tt(on ? 'toast.switchOn' : 'toast.switchOff', curLang(), { label: t(labelToken, curLang()) }))
    })
  })

  // 网络代理：选择「自定义代理」时展开真实 URL 输入，作为素材请求基址立即生效
  const proxyWrap = $$('[data-select]').find((w) => w.dataset.selectKind === 'proxy')
  if (proxyWrap) {
    const input = document.createElement('input')
    input.type = 'url'
    input.placeholder = 'https://your-proxy.example.com'
    input.value = s().proxyUrl || ''
    input.hidden = s().proxy !== '自定义代理'
    input.className = 'proxy-url-input'
    input.addEventListener('input', () => { setPath('settings.proxyUrl', input.value.trim()) })
    proxyWrap.closest('.setting-row').append(input)
    const redrawInput = () => { input.hidden = s().proxy !== '自定义代理' }
    new MutationObserver(redrawInput).observe(proxyWrap.querySelector('.select-value'), { childList: true })
    redrawInput()
  }

  const slider = $('#font-slider')
  slider.value = ZOOM_LEVELS.indexOf(s().fontScale) >= 0 ? ZOOM_LEVELS.indexOf(s().fontScale) : 2
  const levelLabel = $('#font-level-label')
  const paint = () => {
    const pct = (Number(slider.value) / Number(slider.max)) * 100
    slider.style.background = `linear-gradient(90deg, var(--navy) ${pct}%, #d7dce5 ${pct}%)`
    if (levelLabel) levelLabel.textContent = fontLabel(Number(slider.value))
  }
  slider.addEventListener('input', () => {
    s().fontScale = ZOOM_LEVELS[Number(slider.value)]
    store.save()
    applyAppearance()
    paint()
    toast(tt('toast.font', curLang(), { level: fontLabel(Number(slider.value)) }))
  })
  paint()
}

/* ---------------- 九项设置的真实行为接线（可当场验证） ---------------- */

// 唤醒锁 / PWA 状态：state 键直接对应 i18n token（wake.* / pwa.*）
const wakeStateText = (state) => t(`wake.${state}`, curLang())
const pwaStateText = (state) => t(`pwa.${state}`, curLang())
const proxyReasonText = (reason) => t(`proxy.reason.${reason}`, curLang())

function bindRealSettings() {
  // 锁屏运行：立即体验三种策略的真实分叉
  $('#lock-test-btn')?.addEventListener('click', () => {
    previewLockScreen()
  })

  // 唤醒锁：用户手势内请求，状态实时回显
  const wakeChip = $('#wakelock-state')
  const paintWake = (extra) => {
    if (!wakeChip) return
    const state = extra ?? wakeLockState()
    wakeChip.textContent = wakeStateText(state)
    wakeChip.dataset.state = state
  }
  paintWake()
  $('#wakelock-test-btn')?.addEventListener('click', async () => {
    const r = await testWakeLock()
    paintWake(r.state)
    if (r.state === 'active') toast(t('toast.wakeActive', curLang()))
    else if (r.state === 'unsupported') toast(t('toast.wakeUnsupported', curLang()))
    else if (r.state === 'disabled') toast(t('toast.wakeDisabled', curLang()))
    else toast(tt('toast.wakeFail', curLang(), { detail: r.message ?? t('wake.failed', curLang()) }))
  })

  // 开机自启：Web 等价物 = 安装 PWA 桌面应用
  const pwaChip = $('#pwa-state')
  const pwaBtn = $('#pwa-install-btn')
  const paintPwa = () => {
    const state = pwaState()
    if (pwaChip) {
      pwaChip.textContent = pwaStateText(state)
      pwaChip.dataset.state = state
    }
    if (pwaBtn) {
      pwaBtn.disabled = state !== 'installable'
      pwaBtn.textContent = state === 'installed'
        ? t('set.pwaInstalled', curLang())
        : t('set.installPwa', curLang())
    }
  }
  paintPwa()
  document.addEventListener('db:pwa-changed', paintPwa)
  pwaBtn?.addEventListener('click', async () => {
    const r = await installPwa()
    if (r.ok) toast(t('toast.pwaDone', curLang()))
    else if (r.reason === 'installed') toast(t('toast.pwaAlready', curLang()))
    else toast(t('toast.pwaNoEntry', curLang()))
    paintPwa()
  })

  // 网络代理：真实发起清单请求验证连通性与延迟
  const proxyChip = $('#proxy-state')
  let proxyLast = null
  const paintProxy = (r) => {
    if (!proxyChip || !r) return
    if (r.ok) {
      proxyChip.textContent = tt('proxy.success', curLang(), { ms: r.ms, status: r.status })
      proxyChip.dataset.state = 'ok'
    } else {
      proxyChip.textContent = proxyReasonText(r.reason ?? 'fail')
      proxyChip.dataset.state = 'fail'
    }
  }
  $('#proxy-test-btn')?.addEventListener('click', async () => {
    if (proxyChip) {
      proxyChip.textContent = t('state.testing', curLang())
      proxyChip.dataset.state = 'testing'
    }
    const r = await testProxyConnection()
    proxyLast = r
    if (!proxyChip) return
    if (r.ok) {
      proxyChip.textContent = tt('proxy.success', curLang(), { ms: r.ms, status: r.status })
      proxyChip.dataset.state = 'ok'
      toast(tt('toast.proxyOk', curLang(), { ms: r.ms }))
    } else {
      const reason = proxyReasonText(r.reason ?? 'fail')
      proxyChip.textContent = reason
      proxyChip.dataset.state = 'fail'
      toast(reason)
    }
  })

  // 语言切换时，把已产生的动态状态与下拉显示同步到新语言（只在语言真的变化时触发）
  let lastLang = curLang()
  store.subscribe(() => {
    if (curLang() === lastLang) return
    lastLang = curLang()
    $$('[data-select]').forEach((wrap) => {
      const kind = wrap.dataset.selectKind
      const meta = SELECT_KIND_META[kind]
      if (!meta) return
      const val = getPath(meta.path)
      $('.select-value', wrap).textContent = kind === 'language' ? val : optionLabel(kind, val, curLang())
    })
    paintWake()
    paintPwa()
    paintProxy(proxyLast)
    const slider = $('#font-slider')
    if (slider) $('#font-level-label').textContent = fontLabel(Number(slider.value))
    // 停留在 13 个动态设置组时，整组按新语言重渲染（事件代理挂在容器上，无需重绑）
    if (activeSection !== 'general' && !viewPlaceholder.hidden) {
      renderSection(activeSection)
    }
  })
}

/* ---------------- 13 个动态设置组 ---------------- */

const viewGeneral = $('#view-general')
const viewPlaceholder = $('#view-placeholder')

function standardThemeOptions() {
  const standard = [
    ['th-pearl', 'Pearl'], ['th-vortex', 'Vortex'], ['th-clementa', 'Clementa'], ['th-stratos', 'Stratos'],
    ['th-nova', 'Nova'], ['th-twilight', 'Twilight'], ['th-coral-glow', 'Coral Glow'], ['th-mercury', 'Mercury'],
    ['th-ashrose', 'Ashrose'], ['th-spectrum', 'Spectrum'], ['th-chisel', 'Chisel'], ['th-stardust', 'Stardust'],
    ['th-seafoam', 'Seafoam'], ['th-nebulae', 'Nebulae'], ['th-creme', 'Creme'], ['th-lux', 'Lux'],
    ['th-consultant', 'Consultant'], ['th-marine', 'Marine'],
  ]
  const customs = store.state.customThemes.map((th) => [th.id, tt('dy.app.customTheme', curLang(), { name: th.name })])
  return [['', t('dy.app.themeSystem', curLang())], ...standard, ...customs]
}

// 动态设置组 key → 侧栏导航 token（卡片标题复用导航文案）
const SECTION_NAV_TOKEN = {
  profile: 'nav.profile', billing: 'nav.billing', appearance: 'nav.appearance',
  shortcuts: 'nav.shortcuts', personalize: 'nav.personalize', memory: 'nav.memory',
  agents: 'nav.agents', models: 'nav.models', assistant: 'nav.assistant',
  devices: 'nav.devices', data: 'nav.data', apps: 'nav.apps', security: 'nav.security',
}
const sectionLabel = (key) => t(SECTION_NAV_TOKEN[key], curLang())
const SHORTCUT_LABEL_TOKEN = {
  search: 'dy.sk.search', newGamma: 'dy.sk.newGamma', send: 'dy.sk.send', upload: 'dy.sk.upload',
}

const SECTION_BUILDERS = {
  profile: () => card(`
    ${row(t('dy.profile.nameTitle', curLang()), t('dy.profile.nameDesc', curLang()), textHtml('settings.profile.name'))}
    ${row(t('dy.profile.initialsTitle', curLang()), t('dy.profile.initialsDesc', curLang()), textHtml('settings.profile.initials'))}
    ${row(t('dy.profile.bioTitle', curLang()), '', '<textarea data-bind="settings.profile.bio" rows="3">' + esc(s().profile.bio) + '</textarea>')}
  `, sectionLabel('profile')),

  billing: () => {
    const ws = store.state.workspaces.find((w) => w.id === store.state.activeWorkspaceId)
    const lang = curLang()
    const total = store.state.gammas.filter((g) => !g.deleted).length
    const trash = store.state.gammas.filter((g) => g.deleted).length
    return card(`
      ${row(t('dy.bill.planTitle', lang), ws.plan === 'pro' ? t('dy.bill.planPro', lang) : t('dy.bill.planFree', lang),
        `<strong>${ws.plan === 'pro' ? 'Pro' : 'Free'}</strong>`)}
      ${row(t('dy.bill.creditsTitle', lang), t('dy.bill.creditsDesc', lang), `<strong>${store.state.credits}</strong>`)}
      ${row(t('dy.bill.gammaTitle', lang), tt('dy.bill.gammaDesc', lang, { total, trash }),
        `<button class="btn btn-primary" data-act="upgrade">${t('dy.bill.upgrade', lang)}</button>`)}
    `, sectionLabel('billing'))
  },

  appearance: () => card(`
    ${row(t('dy.app.themeTitle', curLang()), t('dy.app.themeDesc', curLang()), selectHtml('settings.appearance.themeId', standardThemeOptions()))}
    ${row(t('dy.app.densityTitle', curLang()), '', selectHtml('settings.appearance.density', [['comfortable', '舒适'], ['compact', '紧凑']]))}
    ${row(t('dy.app.fontTitle', curLang()), '', selectHtml('settings.fontFamily', [
      ['system', '系统默认'], ['song', '宋体'], ['hei', '黑体'], ['georgia', 'Georgia 衬线'], ['mono', '等宽字体'],
    ]))}
    ${row(t('dy.app.imageModeTitle', curLang()), t('dy.app.imageModeDesc', curLang()), selectHtml('imageMode', [
      ['illustration', '绘本插画'], ['photo', '真实照片'], ['svg', '经典 SVG'],
    ]))}
    ${row(t('dy.app.reduceMotionTitle', curLang()), t('dy.app.reduceMotionDesc', curLang()), switchHtml('settings.appearance.reduceMotion'))}
  `, sectionLabel('appearance')),

  shortcuts: () => card(
    Object.entries(s().shortcuts).map(([key, val]) => row(
      SHORTCUT_LABEL_TOKEN[key] ? t(SHORTCUT_LABEL_TOKEN[key], curLang()) : key,
      t('dy.sk.desc', curLang()),
      `<button class="btn btn-ghost" data-shortcut="${key}">${esc(val)}</button>`,
    )).join(''),
    sectionLabel('shortcuts'),
  ),

  personalize: () => card(`
    ${row(t('dy.pers.smartTitle', curLang()), t('dy.pers.smartDesc', curLang()), switchHtml('settings.personalize.smartSuggest'))}
    ${row(t('dy.pers.autoTitle', curLang()), t('dy.pers.autoDesc', curLang()), switchHtml('settings.personalize.autoTitle'))}
    ${row(t('dy.pers.weeklyTitle', curLang()), t('dy.pers.weeklyDesc', curLang()), switchHtml('settings.personalize.weeklyReport'))}
  `, sectionLabel('personalize')),

  memory: () => card(`
    <div class="setting-row"><div class="setting-info">
      <h3>${t('dy.mem.itemsTitle', curLang())}</h3><p>${t('dy.mem.itemsDesc', curLang())}</p>
      <div class="memory-list" id="memory-list">
        ${s().memories.map((m, i) => `<span class="mem-chip">${esc(m)}<button type="button" data-mem-del="${i}" aria-label="${t('dy.common.delete', curLang())}">×</button></span>`).join('')}
      </div>
      <div class="msg-form" style="margin-top:10px">
        <input type="text" id="mem-input" placeholder="${t('dy.mem.inputPh', curLang())}" />
        <button class="btn btn-primary" id="mem-add" type="button">${t('dy.mem.add', curLang())}</button>
      </div>
    </div></div>
    <div class="setting-row"><div class="setting-info" style="flex:1">
      <h3>${t('dy.mem.instTitle', curLang())}</h3>
      <textarea data-bind="instructions" rows="3" style="width:100%;margin-top:8px">${esc(store.state.instructions)}</textarea>
    </div></div>
  `, sectionLabel('memory')),

  agents: () => card(`
    ${s().agents.map((ag) => row(ag.name, t('dy.ag.desc', curLang()),
      `<button class="switch ${ag.on ? 'is-on' : ''}" data-agent-toggle="${ag.id}"><span class="switch-knob"></span></button>
       <button class="icon-mini" data-agent-del="${ag.id}" title="${t('dy.common.delete', curLang())}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`
    )).join('')}
    <div class="setting-row"><button class="btn btn-ghost" data-act="add-agent" type="button">${t('dy.ag.add', curLang())}</button></div>
  `, sectionLabel('agents')),

  models: () => card(
    AVAILABLE_MODELS.length
      ? AVAILABLE_MODELS.map((m) => row(esc(m.id), t('dy.mdl.availableDesc', curLang()), `
        <button class="switch ${s().model === m.id ? 'is-on' : ''}" data-model="${esc(m.id)}"><span class="switch-knob"></span></button>`)).join('')
      : `<p class="modal-copy">${t('dy.mdl.empty', curLang())}</p>`,
    sectionLabel('models'),
  ),

  assistant: () => card(`
    ${row(t('dy.asst.nameTitle', curLang()), '', textHtml('settings.assistant.name'))}
    ${row(t('dy.asst.voiceTitle', curLang()), t('dy.asst.voiceDesc', curLang()), selectHtml('settings.assistant.voice', [
      ['温暖女声', '温暖女声'], ['沉稳男声', '沉稳男声'], ['清亮女声', '清亮女声'], ['中性合成音', '中性合成音'],
    ]))}
  `, sectionLabel('assistant')),

  devices: () => card(`
    ${s().devices.map((d) => row(d.name, d.current ? t('dy.dev.current', curLang()) : t('dy.dev.recent', curLang()),
      d.current ? `<span class="count-pill">${t('dy.dev.local', curLang())}</span>` : `<button class="btn btn-ghost" data-device-del="${d.id}">${t('dy.dev.remove', curLang())}</button>`)).join('')}
  `, sectionLabel('devices')),

  data: () => card(`
    ${row(t('dy.data.exportTitle', curLang()), t('dy.data.exportDesc', curLang()),
      `<button class="btn btn-primary" data-act="export" type="button">${t('dy.data.exportBtn', curLang())}</button>`)}
    ${row(t('dy.data.importTitle', curLang()), t('dy.data.importDesc', curLang()),
      `<button class="btn btn-ghost" data-act="import" type="button">${t('dy.data.importBtn', curLang())}</button>`)}
    ${row(t('dy.data.resetTitle', curLang()), t('dy.data.resetDesc', curLang()),
      `<button class="btn btn-danger" data-act="reset" type="button">${t('dy.data.resetBtn', curLang())}</button>`)}
  `, sectionLabel('data')),

  apps: () => card(`
    ${s().apps.map((ap) => row(ap.name, t('dy.apps.desc', curLang()),
      `<button class="switch ${ap.on ? 'is-on' : ''}" data-app-toggle="${ap.id}"><span class="switch-knob"></span></button>`)).join('')}
    <div class="setting-row"><button class="btn btn-ghost" data-act="add-app" type="button">${t('dy.apps.add', curLang())}</button></div>
  `, sectionLabel('apps')),

  security: () => card(`
    ${row(t('dy.sec.twoFaTitle', curLang()), t('dy.sec.twoFaDesc', curLang()), switchHtml('settings.security.twoFA'))}
    ${row(t('dy.sec.timeoutTitle', curLang()), t('dy.sec.timeoutDesc', curLang()), selectHtml('settings.security.sessionTimeout', [
      ['15 分钟', '15 分钟'], ['30 分钟', '30 分钟'], ['1 小时', '1 小时'], ['永不', '永不'],
    ]))}
  `, sectionLabel('security')),
}

function renderSection(key, label) {
  activeSection = key
  $$('[data-settings]').forEach((item) => item.classList.toggle('nav-item-active', item.dataset.settings === key))
  if (key === 'general') {
    viewGeneral.hidden = false
    viewPlaceholder.hidden = true
    return
  }
  viewGeneral.hidden = true
  viewPlaceholder.hidden = false
  const localizedLabel = SECTION_NAV_TOKEN[key] ? sectionLabel(key) : label
  viewPlaceholder.innerHTML = SECTION_BUILDERS[key]?.()
    ?? card(`<p class="modal-copy">${tt('ph.empty', curLang(), { label: localizedLabel })}</p>`, localizedLabel)
}

/* ---------------- 侧栏导航 / 搜索 ---------------- */

const navItems = $$('[data-settings]')
navItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault()
    renderSection(item.dataset.settings, item.dataset.label)
  })
})

const searchInput = $('#settings-search')
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase()
  navItems.forEach((item) => {
    item.classList.toggle('is-hidden', !item.dataset.label.toLowerCase().includes(query))
  })
  $$('.settings-group').forEach((group) => {
    let sibling = group.nextElementSibling
    let hasVisible = false
    while (sibling && !sibling.matches('.settings-group')) {
      if (sibling.classList.contains('nav-item') && !sibling.classList.contains('is-hidden')) {
        hasVisible = true
        break
      }
      sibling = sibling.nextElementSibling
    }
    group.classList.toggle('is-hidden', !hasVisible)
  })
})

/* ---------------- 动态视图事件代理 ---------------- */

viewPlaceholder.addEventListener('input', (e) => {
  const bind = e.target.closest('[data-bind]')
  if (!bind) return
  setPath(bind.dataset.bind, bind.value)
  if (bind.dataset.bind.startsWith('settings.appearance') || bind.dataset.bind === 'settings.fontFamily') applyAppearance()
})

viewPlaceholder.addEventListener('change', (e) => {
  const bind = e.target.closest('[data-bind]')
  if (!bind) return
  setPath(bind.dataset.bind, bind.value)
  applyAppearance()
  toast(t('toast.settingSaved', curLang()))
})

viewPlaceholder.addEventListener('click', async (e) => {
  const sw = e.target.closest('[data-bind-switch]')
  if (sw) {
    const path = sw.dataset.bindSwitch
    setPath(path, !getPath(path))
    sw.classList.toggle('is-on', getPath(path))
    sw.setAttribute('aria-checked', String(getPath(path)))
    return
  }

  const modelBtn = e.target.closest('[data-model]')
  if (modelBtn) {
    s().model = modelBtn.dataset.model
    store.save()
    renderSection('models', '模型')
    toast(tt('dy.mdl.switched', curLang(), { model: s().model }))
    return
  }

  const agentToggle = e.target.closest('[data-agent-toggle]')
  if (agentToggle) {
    const ag = s().agents.find((x) => x.id === agentToggle.dataset.agentToggle)
    ag.on = !ag.on
    store.save()
    agentToggle.classList.toggle('is-on', ag.on)
    return
  }
  if (e.target.closest('[data-agent-del]')) {
    const id = e.target.closest('[data-agent-del]').dataset.agentDel
    const ok = await confirmModal(t('dy.ag.confirmTitle', curLang()), t('dy.ag.confirmMsg', curLang()), t('dy.common.delete', curLang()))
    if (!ok) return
    s().agents = s().agents.filter((x) => x.id !== id)
    store.save()
    renderSection('agents', '智能体')
    return
  }

  const appToggle = e.target.closest('[data-app-toggle]')
  if (appToggle) {
    const ap = s().apps.find((x) => x.id === appToggle.dataset.appToggle)
    ap.on = !ap.on
    store.save()
    appToggle.classList.toggle('is-on', ap.on)
    return
  }
  if (e.target.closest('[data-device-del]')) {
    const id = e.target.closest('[data-device-del]').dataset.deviceDel
    s().devices = s().devices.filter((x) => x.id !== id)
    store.save()
    renderSection('devices', '设备连接')
    toast(t('dy.dev.removed', curLang()))
    return
  }

  const memDel = e.target.closest('[data-mem-del]')
  if (memDel) {
    s().memories.splice(Number(memDel.dataset.memDel), 1)
    store.save()
    renderSection('memory', '记忆与进化')
    return
  }
  if (e.target.closest('#mem-add')) {
    const input = $('#mem-input')
    const val = input.value.trim()
    if (!val) return toast(t('dy.mem.emptyToast', curLang()))
    s().memories.push(val)
    store.save()
    renderSection('memory', '记忆与进化')
    return
  }

  if (e.target.closest('[data-shortcut]')) {
    const btn = e.target.closest('[data-shortcut]')
    const key = btn.dataset.shortcut
    btn.textContent = t('dy.sk.press', curLang())
    const capture = (ev) => {
      ev.preventDefault()
      const parts = []
      if (ev.metaKey) parts.push('⌘')
      if (ev.ctrlKey) parts.push('Ctrl')
      if (ev.shiftKey) parts.push('⇧')
      if (ev.altKey) parts.push('⌥')
      const main = ev.key.length === 1 ? ev.key.toUpperCase() : ev.key
      if (!['META', 'CONTROL', 'SHIFT', 'ALT'].includes(ev.key.toUpperCase?.() ?? '')) {
        parts.push(main)
        s().shortcuts[key] = parts.join('')
        store.save()
        document.removeEventListener('keydown', capture, true)
        renderSection('shortcuts', '快捷键')
        toast(t('dy.sk.updated', curLang()))
      }
    }
    document.addEventListener('keydown', capture, true)
    return
  }

  const act = e.target.closest('[data-act]')
  if (!act) return
  if (act.dataset.act === 'upgrade') openUpgrade()
  if (act.dataset.act === 'add-agent' || act.dataset.act === 'add-app') {
    const isAgent = act.dataset.act === 'add-agent'
    const name = prompt(t(isAgent ? 'dy.ag.promptName' : 'dy.apps.promptName', curLang()))
    if (!name?.trim()) return
    if (isAgent) s().agents.push({ id: uid('ag'), name: name.trim(), on: true })
    else s().apps.push({ id: uid('ap'), name: name.trim(), on: true })
    store.save()
    renderSection(isAgent ? 'agents' : 'apps', isAgent ? '智能体' : '应用管理')
    toast(t('dy.common.added', curLang()))
  }
  if (act.dataset.act === 'export') {
    downloadFile(`design-buddy-${new Date().toISOString().slice(0, 10)}.json`, store.exportJson())
    toast(t('dy.data.exported', curLang()))
  }
  if (act.dataset.act === 'import') {
    const file = document.createElement('input')
    file.type = 'file'
    file.accept = 'application/json'
    file.addEventListener('change', () => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          store.importJson(reader.result)
          applyAppearance()
          renderSection('data', '数据管理')
          toast(t('dy.data.importOk', curLang()))
        } catch {
          toast(t('dy.data.importFail', curLang()))
        }
      }
      reader.readAsText(file.files[0])
    })
    file.click()
  }
  if (act.dataset.act === 'reset') {
    confirmModal(t('dy.data.resetTitle', curLang()), t('dy.data.resetConfirmMsg', curLang()), t('dy.data.resetConfirmBtn', curLang())).then((ok) => {
      if (!ok) return
      store.reset()
      location.reload()
    })
  }
})

/* 帮助 FAB（data-demo="帮助"）由 global-ui 委托统一处理 */

/* ---------------- 启动 ---------------- */

bindGeneral()
bindRealSettings()
