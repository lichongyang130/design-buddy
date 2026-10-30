/* ============================================================
   首页「＋」菜单的二级面板
   鼠标指向主菜单某一行，右侧立刻显示对应内容：
   · 添加文件        → 真实文件选择器 + 本次已附文件（可移除）
   · 引用对话中的文件 → 本次附件 / 历史创作附件 / 媒体库，点一下即引用
   · 模式            → 计划（每次提交的提示词）+ 任务（真实生成进度）
   · 专家 / 技能 / 连接器 → 列表 + 真实开关
   不是静态列表：技能启停、连接器连接状态、文件引用都写回 store。
   ============================================================ */

import { store, toast } from './core.js'
import { CONNECTOR_CATALOG } from './connectors-catalog.js'

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const fmtSize = (n) => {
  if (!Number.isFinite(n) || n <= 0) return ''
  if (n >= 1024 * 1024) return `${(n / 1048576).toFixed(1)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${n} B`
}

const kindOf = (name = '') => {
  const ext = String(name).split('.').pop().toLowerCase()
  if (['pdf'].includes(ext)) return 'PDF'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '表格'
  if (['doc', 'docx', 'md', 'txt', 'rtf'].includes(ext)) return '文档'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return '图片'
  if (['ppt', 'pptx', 'key'].includes(ext)) return '演示'
  if (['js', 'ts', 'json', 'html', 'css', 'py'].includes(ext)) return '代码'
  return '文件'
}

const timeAgo = (ts) => {
  if (!ts) return '—'
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return `${Math.floor(diff / 86_400_000)} 天前`
}

const STATUS_CLASS = { 排队中: 'is-queued', 进行中: 'is-running', 已完成: 'is-done', 失败: 'is-failed' }

/**
 * 初始化二级面板
 * @param {object} opts
 * @param {Array} opts.attachments 当前提示词的附件数组（与 main.js 共享同一引用）
 * @param {(name:string, meta?:object)=>void} opts.addAttachment
 * @param {()=>void} opts.pickFiles 调起系统文件选择器
 * @param {()=>void} opts.openRefPicker 打开完整媒体库弹窗
 * @param {(text:string, files?:Array)=>void} opts.fillPrompt 把计划/任务写回输入框
 * @param {(skill:object)=>void} opts.onPickSkill 点击技能行调用技能
 * @param {()=>{name:string}|null} opts.currentSkill 当前已调用的技能
 * @returns {{ show:(name:string)=>void, hide:()=>void, current:()=>string, refresh:()=>void }}
 */
export function initAddSubPanels({ attachments, addAttachment, pickFiles, openRefPicker, fillPrompt, onAttachmentsChange, closeMenu, onPickSkill, currentSkill }) {
  const popover = $('#add-popover')
  const wrap = $('#add-sub')
  if (!popover || !wrap) return { show() {}, hide() {}, current: () => '', refresh() {} }

  const rows = $$('[data-sub]', popover)
  const panels = $$('[data-sub-panel]', wrap)
  let current = ''

  /* ---------------- 技能 ---------------- */

  const renderSkills = () => {
    const list = $('#add-skill-list')
    const count = $('#add-skill-count')
    if (!list) return
    const skills = store.state.skills ?? []
    const on = skills.filter((s) => s.enabled).length
    if (count) count.textContent = `${on} 个已启用 / 共 ${skills.length} 个`
    const active = currentSkill?.() ?? null
    list.innerHTML = skills.length ? skills.map((s) => `
      <button class="add-item${s.enabled ? ' is-on' : ''}${s.name === active?.name ? ' is-called' : ''}" type="button" role="menuitemcheckbox"
        aria-checked="${!!s.enabled}" data-toggle-skill="${esc(s.id)}" title="${s.enabled ? '点击调用' : '未启用'}">
        <span class="add-item-ic">${esc((s.name || '技')[0])}</span>
        <span class="add-item-main">
          <span class="add-item-name">${esc(s.name)}</span>
          <span class="add-item-meta">v${esc(s.version || '1.0.0')} · ${s.name === active?.name ? '本次已调用' : (s.enabled ? '已启用' : '已停用')}</span>
        </span>
        ${s.name === active?.name ? '<span class="add-item-pill is-on">已调用</span>' : ''}
        <span class="mini-switch ${s.enabled ? 'is-on' : ''}" aria-hidden="true"></span>
      </button>`).join('')
      : '<p class="add-sub-empty">还没有安装技能，去技能页挑一个。</p>'
  }

  /* ---------------- 连接器 ---------------- */

  const renderConnectors = () => {
    const list = $('#add-cn-list'), count = $('#add-cn-count')
    if (!list) return
    const search = ($('#add-cn-search')?.value ?? '').trim().toLowerCase()
    if (count) count.textContent = '六个核心连接入口，前往连接器页验证'
    const cards = CONNECTOR_CATALOG.filter(c => !search || `${c.name} ${c.desc}`.toLowerCase().includes(search))
    list.innerHTML = cards.map(c => `<button class="add-item" type="button" data-toggle-connector="${esc(c.name)}"><span class="add-dot" style="--c:${esc(c.color)}"></span><span class="add-item-main"><span class="add-item-name">${esc(c.name)}</span><span class="add-item-meta">${esc(c.desc)}</span></span><span class="add-item-pill">管理连接</span></button>`).join('') || '<p class="add-sub-empty">没有匹配的连接器。</p>'
  }

  /* ---------------- 模式：计划 + 任务 ---------------- */

  const renderPlans = () => {
    const list = $('#add-plan-list')
    const count = $('#add-plan-count')
    if (!list) return
    const plans = (store.state.gammas ?? [])
      .filter((g) => !g.deleted && g.prompt)
      .slice(0, 6)
    if (count) count.textContent = plans.length ? `${plans.length} 条最近计划` : ''
    list.innerHTML = plans.length ? plans.map((g) => `
      <button class="add-item" type="button" data-plan="${esc(g.id)}" title="把这条计划的提示词填回输入框">
        <span class="add-item-main">
          <span class="add-item-name">${esc(g.title || g.prompt.slice(0, 18))}</span>
          <span class="add-item-meta">${esc(g.mode || '标准')} 模式 · ${timeAgo(g.createdAt)}${g.attachments?.length ? ` · ${g.attachments.length} 个附件` : ''}</span>
        </span>
        <span class="add-item-pill">载入</span>
      </button>`).join('')
      : `<div class="add-sub-empty">
           <p>还没有计划。写下第一句话并发送，就会在这里留下可复用的计划。</p>
           <button class="add-sub-action is-small" type="button" data-plan-sample>用示例提示词开始</button>
         </div>`
  }

  const renderTasks = () => {
    const list = $('#add-task-list')
    if (!list) return
    const tasks = (store.state.tasks ?? []).slice(0, 6)
    list.innerHTML = tasks.length ? tasks.map((t) => `
      <button class="add-item${t.status === '已完成' ? ' is-done' : ''}" type="button" data-task="${esc(t.id)}"
        title="${t.prompt ? '点击把提示词填回输入框' : '没有提示词可回填'}">
        <span class="add-dot ${STATUS_CLASS[t.status] ?? 'is-queued'}"></span>
        <span class="add-item-main">
          <span class="add-item-name">${esc(t.name)}</span>
          <span class="add-item-meta">${esc(t.status)} · ${timeAgo(t.finishedAt || t.createdAt)}${t.artifact ? ` · ${esc(t.artifact)}` : ''}</span>
        </span>
        <span class="add-item-pill${t.status === '已完成' ? ' is-on' : ''}">${esc(t.status)}</span>
      </button>`).join('')
      : '<p class="add-sub-empty">暂无任务。发送一次创作后，这里会显示真实生成进度。</p>'
  }

  /* ---------------- 添加文件 ---------------- */

  const renderFiles = () => {
    const list = $('#add-file-list')
    const count = $('#add-file-count')
    if (!list) return
    if (count) count.textContent = attachments.length ? `${attachments.length} 个已附加` : ''
    list.innerHTML = attachments.length ? attachments.map((a, i) => `
      <div class="add-item is-static">
        <span class="add-item-ic is-file">${kindOf(a.name)}</span>
        <span class="add-item-main">
          <span class="add-item-name">${esc(a.name)}</span>
          <span class="add-item-meta">${kindOf(a.name)}${a.size ? ` · ${fmtSize(a.size)}` : ''} · 随提示词提交</span>
        </span>
        <button class="add-item-x" type="button" data-remove-file="${i}" aria-label="移除 ${esc(a.name)}">移除</button>
      </div>`).join('')
      : '<p class="add-sub-empty">还没有附加文件。选择后会以附件芯片出现在输入框上方。</p>'
  }

  /* ---------------- 引用对话中的文件 ---------------- */

  const conversationFiles = () => {
    const out = []
    const seen = new Set()
    const push = (name, from, at) => {
      if (!name || seen.has(name)) return
      seen.add(name)
      out.push({ name, from, at })
    }
    attachments.forEach((a) => push(a.name, '本次提示词', null))
    ;(store.state.gammas ?? []).forEach((g) => (g.attachments ?? []).forEach((a) => push(a.name, `创作「${g.title}」`, g.createdAt)))
    ;(store.state.media ?? []).forEach((m) => push(m.name, m.source === 'ai' ? 'AI 生成' : '本地上传', m.createdAt))
    return out
  }

  const renderRefs = () => {
    const list = $('#add-ref-list')
    const count = $('#add-ref-count')
    if (!list) return
    const files = conversationFiles()
    const attached = new Set(attachments.map((a) => a.name))
    if (count) count.textContent = files.length ? `${files.length} 个可选文件` : ''
    list.innerHTML = files.length ? files.slice(0, 12).map((f) => `
      <button class="add-item${attached.has(f.name) ? ' is-done' : ''}" type="button" data-ref-file="${esc(f.name)}"
        title="${attached.has(f.name) ? '已在附件里' : '点击引用到当前提示词'}">
        <span class="add-item-ic is-file">${kindOf(f.name)}</span>
        <span class="add-item-main">
          <span class="add-item-name">${esc(f.name)}</span>
          <span class="add-item-meta">${esc(f.from)}${f.at ? ` · ${timeAgo(f.at)}` : ''}</span>
        </span>
        <span class="add-item-pill${attached.has(f.name) ? ' is-on' : ''}">${attached.has(f.name) ? '已引用' : '引用'}</span>
      </button>`).join('')
      : '<p class="add-sub-empty">对话里还没有文件。上传或生成一次后就会出现在这里。</p>'
  }

  /* ---------------- 面板切换 ---------------- */

  const RENDERERS = {
    skills: renderSkills,
    connectors: renderConnectors,
    mode: () => { renderPlans(); renderTasks() },
    files: renderFiles,
    refs: renderRefs,
    experts: () => {
      // 专家列表由 main.js 渲染（含头像与选中态），这里只补一次当前选中标记
      $$('#expert-list .expert-item').forEach((item) => {
        const on = item.dataset.expert === $('#prompt-expert .prompt-expert-name')?.textContent
        item.classList.toggle('is-current', on)
      })
    },
  }

  // 带子菜单的父行（专家）只保留一个展开态，避免两行同时高亮
  const syncParentRows = (name) => {
    rows.filter((r) => r.classList.contains('menu-row-parent')).forEach((r) => {
      const on = r.dataset.sub === name
      r.classList.toggle('is-open', on)
      r.setAttribute('aria-expanded', String(on))
    })
  }

  const show = (name) => {
    if (!panels.some((p) => p.dataset.subPanel === name)) return
    current = name
    wrap.hidden = false
    panels.forEach((p) => { p.hidden = p.dataset.subPanel !== name })
    rows.forEach((r) => r.classList.toggle('is-sub-active', r.dataset.sub === name))
    syncParentRows(name)
    RENDERERS[name]?.()
  }

  const hide = () => {
    current = ''
    wrap.hidden = true
    panels.forEach((p) => { p.hidden = true })
    rows.forEach((r) => r.classList.remove('is-sub-active'))
    syncParentRows('')
  }

  // 选中一条计划/任务后整个菜单收起
  const shutMenu = () => { (closeMenu ?? hide)() }

  const refresh = () => { if (current) RENDERERS[current]?.() }

  // 鼠标指向即展开；键盘 Tab 到该行也展开
  rows.forEach((row) => {
    row.addEventListener('mouseenter', () => show(row.dataset.sub))
    row.addEventListener('focus', () => show(row.dataset.sub))
  })
  wrap.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide()
  })

  // 文件选择（面板内按钮）
  wrap.addEventListener('click', (event) => {
    const el = event.target

    const pick = el.closest('[data-pick-files]')
    if (pick) { pickFiles(); return }

    // 文件面板里通往「引用对话中的文件」的入口
    if (el.closest('[data-open-refs]')) { show('refs'); return }

    const refPicker = el.closest('[data-open-ref-picker]')
    if (refPicker) { openRefPicker(); return }

    const rm = el.closest('[data-remove-file]')
    if (rm) {
      const [gone] = attachments.splice(Number(rm.dataset.removeFile), 1)
      renderFiles()
      onAttachmentsChange?.()
      if (gone) toast(`已移除附件 ${gone.name}`)
      return
    }

    const skill = el.closest('[data-toggle-skill]')
    if (skill) {
      const sk = store.state.skills.find((s) => s.id === skill.dataset.toggleSkill)
      if (!sk) return
      // 开关：切换启用 / 停用
      if (el.closest('.mini-switch')) {
        if (!sk.enabled && !store.state.settings.trustedSkills) {
          toast('请先在「设置 → 通用」中开启信任技能，再启用技能')
          return
        }
        sk.enabled = !sk.enabled
        store.save()
        renderSkills()
        toast(`${sk.name} 已${sk.enabled ? '启用' : '停用'}`)
        return
      }
      // 行点击：调用技能（与输入框里输入 / 的效果一致）
      onPickSkill?.(sk)
      renderSkills()
      return
    }

    const cn = el.closest('[data-toggle-connector]')
    if (cn) {
      const provider = CONNECTOR_CATALOG.find(c => c.name === cn.dataset.toggleConnector)
      location.href = 'connectors.html?provider=' + encodeURIComponent(provider?.id || '')
      return
    }

    const plan = el.closest('[data-plan]')
    if (plan) {
      const g = store.state.gammas.find((x) => x.id === plan.dataset.plan)
      if (!g) return
      fillPrompt(g.prompt, g.attachments ?? [])
      shutMenu()
      toast('计划已载入输入框')
      return
    }

    if (el.closest('[data-plan-sample]')) {
      fillPrompt('给制造业客户做一份数字化方案提案，30 分钟，重点讲降本 20%')
      shutMenu()
      return
    }

    const task = el.closest('[data-task]')
    if (task) {
      const t = store.state.tasks.find((x) => x.id === task.dataset.task)
      if (!t) return
      if (!t.prompt) { toast('这条任务没有保留提示词'); return }
      fillPrompt(t.prompt, [])
      shutMenu()
      toast('任务提示词已填回输入框')
      return
    }

    if (el.closest('[data-clear-done]')) {
      const before = store.state.tasks.length
      store.state.tasks = store.state.tasks.filter((t) => t.status !== '已完成')
      const removed = before - store.state.tasks.length
      store.save()
      renderTasks()
      toast(removed ? `已清除 ${removed} 条已完成任务` : '没有已完成的任务')
      return
    }

    const ref = el.closest('[data-ref-file]')
    if (ref) {
      const name = ref.dataset.refFile
      if (attachments.some((a) => a.name === name)) {
        toast(`「${name}」已在附件里`)
        return
      }
      addAttachment(name, { from: '对话文件' })
      onAttachmentsChange?.()
      renderRefs()
      toast(`已引用「${name}」`)
    }
  })

  // 搜索连接器
  wrap.addEventListener('input', (event) => {
    if (event.target.id === 'add-cn-search') renderConnectors()
  })

  popover.addEventListener('mouseleave', () => hide())

  return {
    show,
    hide,
    current: () => current,
    refresh,
    isOpen: () => !wrap.hidden,
  }
}
