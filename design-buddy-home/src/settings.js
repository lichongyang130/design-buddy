/* ============================================================
   设置页：14 个设置组全部为真实表单并持久化到 localStorage
   通用视图保留原截图结构；其余 13 组动态渲染、双向绑定。
   ============================================================ */

import './rail-flyout.js'
import { store, toast, confirmModal, downloadFile, uid } from './core.js'
import { initGlobalUI, applyAppearance, openUpgrade } from './global-ui.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
const s = () => store.state.settings

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

function selectHtml(path, options) {
  const cur = getPath(path)
  return `<select data-bind="${path}">
    ${options.map(([v, label]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${label}</option>`).join('')}
  </select>`
}

function textHtml(path, placeholder = '') {
  return `<input type="text" data-bind="${path}" value="${esc(getPath(path))}" placeholder="${placeholder}" />`
}

function card(inner, label) {
  return `<p class="settings-section-label">${label}</p><section class="settings-card">${inner}</section>`
}

/* ---------------- 通用视图（原 HTML 结构）绑定 ---------------- */

const GENERAL_SELECTS = [
  ['settings.language', '语言'],
  ['settings.linkOpen', '链接打开方式'],
  ['settings.lockScreen', '允许锁屏运行'],
  ['settings.proxy', '网络代理'],
]
const GENERAL_SWITCHES = [
  'settings.keepAwake',
  'settings.autoStart',
  'settings.trustedSkills',
  'settings.skillAutoUpdate',
]
const ZOOM_LEVELS = [0.85, 0.925, 1, 1.08, 1.17]
const FONT_LEVELS = ['很小', '小', '默认', '大', '很大']

function bindGeneral() {
  $$('[data-select]').forEach((wrap, i) => {
    const [path] = GENERAL_SELECTS[i]
    $('.select-value', wrap).textContent = getPath(path)
    wrap.addEventListener('click', (event) => {
      const opt = event.target.closest('.select-option')
      if (!opt) return
      setPath(path, opt.textContent.trim())
      $('.select-value', wrap).textContent = opt.textContent.trim()
      $$('.select-option', wrap).forEach((o) => {
        const on = o === opt
        o.classList.toggle('is-selected', on)
        o.setAttribute('aria-selected', String(on))
      })
      toast(`已保存：${GENERAL_SELECTS[i][1]} → ${opt.textContent.trim()}`)
    })
  })

  $$('[data-switch]').forEach((sw, i) => {
    const path = GENERAL_SWITCHES[i]
    sw.addEventListener('click', () => {
      const on = !getPath(path)
      setPath(path, on)
      sw.classList.toggle('is-on', on)
      sw.setAttribute('aria-checked', String(on))
      toast(`${sw.dataset.label}：${on ? '开启' : '关闭'}`)
    })
  })

  const slider = $('#font-slider')
  slider.value = ZOOM_LEVELS.indexOf(s().fontScale) >= 0 ? ZOOM_LEVELS.indexOf(s().fontScale) : 2
  const paint = () => {
    const pct = (Number(slider.value) / Number(slider.max)) * 100
    slider.style.background = `linear-gradient(90deg, var(--navy) ${pct}%, #d7dce5 ${pct}%)`
  }
  slider.addEventListener('input', () => {
    s().fontScale = ZOOM_LEVELS[Number(slider.value)]
    store.save()
    applyAppearance()
    paint()
    toast(`字体大小：${FONT_LEVELS[Number(slider.value)]}`)
  })
  paint()
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
  const customs = store.state.customThemes.map((t) => [t.id, `自定义 · ${t.name}`])
  return [['', '跟随系统默认'], ...standard, ...customs]
}

const SECTION_BUILDERS = {
  profile: () => card(`
    ${row('显示名称', '侧栏与头像旁展示的名字', textHtml('settings.profile.name'))}
    ${row('头像缩写', '两字符以内', textHtml('settings.profile.initials'))}
    ${row('个人简介', '', '<textarea data-bind="settings.profile.bio" rows="3">' + esc(s().profile.bio) + '</textarea>')}
  `, '个人主页'),

  billing: () => {
    const ws = store.state.workspaces.find((w) => w.id === store.state.activeWorkspaceId)
    return card(`
      ${row('当前套餐', ws.plan === 'pro' ? 'Pro 已解锁全部模式' : 'Free 计划，可随时升级',
        `<strong>${ws.plan === 'pro' ? 'Pro' : 'Free'}</strong>`)}
      ${row('剩余积分', '每次创作按模式消耗 1 / 3 / 8 积分', `<strong>${store.state.credits}</strong>`)}
      ${row('已创建 gamma', `共 ${store.state.gammas.filter((g) => !g.deleted).length} 个，垃圾箱 ${store.state.gammas.filter((g) => g.deleted).length} 个`,
        '<button class="btn btn-primary" data-act="upgrade">升级 / 充值</button>')}
    `, '套餐与积分')
  },

  appearance: () => card(`
    ${row('主题', '与主题页的应用操作实时同步', selectHtml('settings.appearance.themeId', standardThemeOptions()))}
    ${row('界面密度', '', selectHtml('settings.appearance.density', [['comfortable', '舒适'], ['compact', '紧凑']]))}
    ${row('字体', '', selectHtml('settings.fontFamily', [
      ['system', '系统默认'], ['song', '宋体'], ['hei', '黑体'], ['georgia', 'Georgia 衬线'], ['mono', '等宽字体'],
    ]))}
    ${row('减弱动效', '降低弹窗与过渡动画强度', switchHtml('settings.appearance.reduceMotion'))}
  `, '外观'),

  shortcuts: () => card(
    Object.entries(s().shortcuts).map(([key, val]) => row(
      { search: '全局搜索', newGamma: '新建 gamma', send: '发送提示词', upload: '上传媒体' }[key] ?? key,
      '点击右侧按钮后按下新的组合键',
      `<button class="btn btn-ghost" data-shortcut="${key}">${esc(val)}</button>`,
    )).join(''),
    '快捷键',
  ),

  personalize: () => card(`
    ${row('智能建议', '根据上下文主动给出创作建议', switchHtml('settings.personalize.smartSuggest'))}
    ${row('自动命名', '为新 gamma 自动生成标题', switchHtml('settings.personalize.autoTitle'))}
    ${row('每周报告', '每周一汇总创作数据', switchHtml('settings.personalize.weeklyReport'))}
  `, '个性化'),

  memory: () => card(`
    <div class="setting-row"><div class="setting-info">
      <h3>记忆条目</h3><p>Buddy 在每次创作中遵循的长期偏好，可随时增删。</p>
      <div class="memory-list" id="memory-list">
        ${s().memories.map((m, i) => `<span class="mem-chip">${esc(m)}<button type="button" data-mem-del="${i}" aria-label="删除">×</button></span>`).join('')}
      </div>
      <div class="msg-form" style="margin-top:10px">
        <input type="text" id="mem-input" placeholder="添加一条记忆，例如：输出避免使用 emoji" />
        <button class="btn btn-primary" id="mem-add" type="button">添加</button>
      </div>
    </div></div>
    <div class="setting-row"><div class="setting-info" style="flex:1">
      <h3>自定义指令</h3>
      <textarea data-bind="instructions" rows="3" style="width:100%;margin-top:8px">${esc(store.state.instructions)}</textarea>
    </div></div>
  `, '记忆与进化'),

  agents: () => card(`
    ${s().agents.map((ag) => row(ag.name, '可在创作菜单中召唤的智能体',
      `<button class="switch ${ag.on ? 'is-on' : ''}" data-agent-toggle="${ag.id}"><span class="switch-knob"></span></button>
       <button class="icon-mini" data-agent-del="${ag.id}" title="删除"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`
    )).join('')}
    <div class="setting-row"><button class="btn btn-ghost" data-act="add-agent" type="button">＋ 添加智能体</button></div>
  `, '智能体'),

  models: () => card(
    [
      ['标准模型', '均衡的速度与质量，日常创作首选'],
      ['高级模型', '更强的推理与长文能力，消耗更多积分'],
      ['极速模型', '最快响应，适合简单任务'],
    ].map(([v, desc]) => row(v, desc, `
      <button class="switch ${s().model === v ? 'is-on' : ''}" data-model="${v}"><span class="switch-knob"></span></button>`)).join(''),
    '模型',
  ),

  assistant: () => card(`
    ${row('助理名称', '', textHtml('settings.assistant.name'))}
    ${row('语音', '用于语音播报与朗读', selectHtml('settings.assistant.voice', [
      ['温暖女声', '温暖女声'], ['沉稳男声', '沉稳男声'], ['清亮女声', '清亮女声'], ['中性合成音', '中性合成音'],
    ]))}
  `, '助理'),

  devices: () => card(`
    ${s().devices.map((d) => row(d.name, d.current ? '当前设备' : '最近登录设备',
      d.current ? '<span class="count-pill">本机</span>' : `<button class="btn btn-ghost" data-device-del="${d.id}">移除</button>`)).join('')}
  `, '设备连接'),

  data: () => card(`
    ${row('导出数据', '把全部工作区、gamma、主题与设置下载为 JSON 文件',
      '<button class="btn btn-primary" data-act="export" type="button">导出 JSON</button>')}
    ${row('导入数据', '从之前导出的 JSON 恢复，将覆盖当前本地数据',
      '<button class="btn btn-ghost" data-act="import" type="button">选择文件导入</button>')}
    ${row('重置应用', '清空本地全部数据并恢复初始演示状态',
      '<button class="btn btn-danger" data-act="reset" type="button">重置</button>')}
  `, '数据管理'),

  apps: () => card(`
    ${s().apps.map((ap) => row(ap.name, '在创作类型中显示该应用',
      `<button class="switch ${ap.on ? 'is-on' : ''}" data-app-toggle="${ap.id}"><span class="switch-knob"></span></button>`)).join('')}
    <div class="setting-row"><button class="btn btn-ghost" data-act="add-app" type="button">＋ 添加应用</button></div>
  `, '应用管理'),

  security: () => card(`
    ${row('两步验证', '登录新设备时要求额外验证码', switchHtml('settings.security.twoFA'))}
    ${row('会话超时', '无操作多久后自动锁定', selectHtml('settings.security.sessionTimeout', [
      ['15 分钟', '15 分钟'], ['30 分钟', '30 分钟'], ['1 小时', '1 小时'], ['永不', '永不'],
    ]))}
  `, '安全中心'),
}

function renderSection(key, label) {
  $$('[data-settings]').forEach((item) => item.classList.toggle('nav-item-active', item.dataset.settings === key))
  if (key === 'general') {
    viewGeneral.hidden = false
    viewPlaceholder.hidden = true
    return
  }
  viewGeneral.hidden = true
  viewPlaceholder.hidden = false
  viewPlaceholder.innerHTML = SECTION_BUILDERS[key]?.() ?? card(`<p class="modal-copy">「${label}」暂无可配置项。</p>`, label)
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
  toast('设置已保存')
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
    toast(`已切换到${s().model}`)
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
    const ok = await confirmModal('删除智能体', '确定删除该智能体吗？', '删除')
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
    toast('设备已移除')
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
    if (!val) return toast('请输入记忆内容')
    s().memories.push(val)
    store.save()
    renderSection('memory', '记忆与进化')
    return
  }

  if (e.target.closest('[data-shortcut]')) {
    const btn = e.target.closest('[data-shortcut]')
    const key = btn.dataset.shortcut
    btn.textContent = '请按下组合键…'
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
        toast('快捷键已更新')
      }
    }
    document.addEventListener('keydown', capture, true)
    return
  }

  const act = e.target.closest('[data-act]')
  if (!act) return
  if (act.dataset.act === 'upgrade') openUpgrade()
  if (act.dataset.act === 'add-agent' || act.dataset.act === 'add-app') {
    const name = prompt(act.dataset.act === 'add-agent' ? '智能体名称' : '应用名称')
    if (!name?.trim()) return
    if (act.dataset.act === 'add-agent') s().agents.push({ id: uid('ag'), name: name.trim(), on: true })
    else s().apps.push({ id: uid('ap'), name: name.trim(), on: true })
    store.save()
    renderSection(act.dataset.act === 'add-agent' ? 'agents' : 'apps', act.dataset.act === 'add-agent' ? '智能体' : '应用管理')
    toast('已添加')
  }
  if (act.dataset.act === 'export') {
    downloadFile(`design-buddy-${new Date().toISOString().slice(0, 10)}.json`, store.exportJson())
    toast('数据已导出')
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
          toast('导入成功，本地数据已恢复')
        } catch {
          toast('导入失败：文件格式不正确')
        }
      }
      reader.readAsText(file.files[0])
    })
    file.click()
  }
  if (act.dataset.act === 'reset') {
    confirmModal('重置应用', '将清空全部本地数据并恢复初始状态，确定继续吗？', '全部重置').then((ok) => {
      if (!ok) return
      store.reset()
      location.reload()
    })
  }
})

/* 帮助 FAB（data-demo="帮助"）由 global-ui 委托统一处理 */

/* ---------------- 启动 ---------------- */

bindGeneral()
