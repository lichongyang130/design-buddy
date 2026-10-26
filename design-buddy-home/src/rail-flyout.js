/* 窄栏「更多」悬浮层：左侧最近任务面板 + 右侧技能/专家/连接器菜单。
   浮层用 position:fixed 逃逸 rail-top 的 overflow 裁剪，五个页面共享本模块。
   点击菜单项后打开对应的真实管理弹窗（见 global-ui.js）。 */

import { openSkills, openExperts, openConnectors } from './global-ui.js'
import { store, fmtDate } from './core.js'
import { t } from './i18n.js'

const ACTIONS = {
  技能: openSkills,
  专家: openExperts,
  连接器: openConnectors,
}

const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
}[c]))

document.querySelectorAll('.more-wrap').forEach((wrap) => {
  const btn = wrap.querySelector('.rail-item')
  const pop = wrap.querySelector('.more-pop')
  const taskBody = wrap.querySelector('#more-tasks')
  if (!btn || !pop) return

  let closeTimer

  const isOpen = () => !pop.hidden

  // 依据按钮视口坐标定位（rail 为 sticky，滚动时坐标基本稳定；滚动/缩放另做重定位）
  const position = () => {
    const rect = btn.getBoundingClientRect()
    const popWidth = pop.offsetWidth || 514
    const popHeight = pop.offsetHeight || 300
    let left = rect.right + 14
    // 窄视口下防止浮层溢出右/下边缘
    if (left + popWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popWidth - 12)
    }
    const top = Math.min(rect.top, Math.max(12, window.innerHeight - popHeight - 12))
    pop.style.left = `${left}px`
    pop.style.top = `${top}px`
  }

  // 最近任务读真实创作数据；无任务时显示与截图一致的诚实空态
  const renderTasks = () => {
    const lang = store.state.settings.language || '简体中文'
    const tasks = store.state.gammas.filter((g) => !g.deleted).slice(0, 5)
    if (!tasks.length) {
      taskBody.innerHTML = `
        <div class="more-empty">
          <p class="more-empty-title">${t('more.emptyTasks', lang)}</p>
          <p class="more-empty-hint">${t('more.emptyHint', lang)}</p>
        </div>`
      return
    }
    taskBody.innerHTML = tasks.map((g) => `
      <button class="more-task" type="button" data-task="${esc(g.id)}">
        <span class="more-task-ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
        </span>
        <span class="more-task-text">
          <span class="more-task-name">${esc(g.title)}</span>
          <span class="more-task-meta">${esc(g.type || '')} · ${esc(fmtDate(g.updatedAt || g.createdAt))}</span>
        </span>
      </button>`).join('')
  }

  const open = () => {
    clearTimeout(closeTimer)
    if (isOpen()) return
    position()
    renderTasks()
    pop.hidden = false
    btn.setAttribute('aria-expanded', 'true')
    btn.classList.add('is-open')
  }

  const close = () => {
    pop.hidden = true
    btn.setAttribute('aria-expanded', 'false')
    btn.classList.remove('is-open')
  }

  // 桌面端：悬停即出；pop 是 wrap 的 DOM 子节点，鼠标在按钮与浮层间移动不会误关
  wrap.addEventListener('mouseenter', open)
  wrap.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(close, 120)
  })

  // 触屏 / 键盘：点击切换
  btn.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    isOpen() ? close() : open()
  })

  pop.addEventListener('click', (event) => {
    const row = event.target.closest('[data-more]')
    if (row) {
      event.stopPropagation()
      close()
      ACTIONS[row.dataset.more]?.()
      return
    }
    // 灵感：跳转到模板库寻找创作灵感（已在模板页则仅关闭浮层）
    if (event.target.closest('[data-inspire]')) {
      event.stopPropagation()
      close()
      if (!location.pathname.endsWith('templates.html')) location.href = 'templates.html'
      return
    }
    // 最近任务：回到首页继续该创作
    const task = event.target.closest('[data-task]')
    if (task) {
      event.stopPropagation()
      close()
      if (!location.pathname.endsWith('index.html')) location.href = 'index.html'
    }
  })

  document.addEventListener('click', (event) => {
    if (isOpen() && !wrap.contains(event.target)) close()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) close()
  })

  // 滚动或视口变化时保持浮层贴住按钮
  window.addEventListener('scroll', () => {
    if (isOpen()) position()
  }, true)
  window.addEventListener('resize', () => {
    if (isOpen()) position()
  })
})
