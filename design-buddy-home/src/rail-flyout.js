/* 窄栏「更多」悬浮层：鼠标指向「更多」时只弹出一张菜单卡片（技能 / 专家 / 连接器）。
   浮层用 position:fixed 并挂到 body：既逃逸 rail-top 的 overflow 裁剪，也逃逸
   .rail 因 sticky 而形成的层叠上下文（详见 styles.css 里的说明）。
   三项都进入各自的独立页面 experts / skills / connectors（见 global-ui.js）。 */

import { openSkills, openExperts, openConnectors } from './global-ui.js'

const ACTIONS = {
  技能: openSkills,
  专家: openExperts,
  连接器: openConnectors,
}

document.querySelectorAll('.more-wrap').forEach((wrap) => {
  const btn = wrap.querySelector('.rail-item')
  const pop = wrap.querySelector('.more-pop')
  if (!btn || !pop) return

  // 浮层必须挂到 body：.rail 是 position: sticky，而 sticky 元素一定会生成层叠上下文，
  // 留在 rail 内部时 fixed + z-index 只在这个上下文里生效，后出现的 .sidebar / .main
  // （同样是定位元素，绘制顺序在后）会把浮层整块盖住。挂到 body 后 z-index 落在根上下文，
  // 才能压住页面内容，同时仍低于 .modal-mask(100) 等真正的弹窗层。
  document.body.append(pop)

  let closeTimer

  const isOpen = () => !pop.hidden

  // 依据按钮视口坐标定位（rail 为 sticky，滚动时坐标基本稳定；滚动/缩放另做重定位）
  const position = () => {
    const rect = btn.getBoundingClientRect()
    // 隐藏时量不到尺寸，退回卡片的设计宽度/高度（236px 宽、约 190px 高的三行菜单）
    const popWidth = pop.offsetWidth || 236
    const popHeight = pop.offsetHeight || 190
    let left = rect.right + 14
    // 窄视口下防止浮层溢出右/下边缘
    if (left + popWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - popWidth - 12)
    }
    const top = Math.min(rect.top, Math.max(12, window.innerHeight - popHeight - 12))
    pop.style.left = `${left}px`
    pop.style.top = `${top}px`
  }

  const open = () => {
    clearTimeout(closeTimer)
    if (isOpen()) return
    position()
    pop.hidden = false
    btn.setAttribute('aria-expanded', 'true')
    btn.classList.add('is-open')
  }

  const close = () => {
    pop.hidden = true
    btn.setAttribute('aria-expanded', 'false')
    btn.classList.remove('is-open')
  }

  // 桌面端：悬停即出。浮层已挂到 body，不再是 wrap 的 DOM 子节点，
  // 所以按钮与浮层各自维护进出场，中间 14px 间隙由悬停桥 + 120ms 关闭延迟兜住。
  const keepOpen = () => clearTimeout(closeTimer)
  const scheduleClose = () => {
    closeTimer = setTimeout(close, 120)
  }
  wrap.addEventListener('mouseenter', open)
  wrap.addEventListener('mouseleave', scheduleClose)
  pop.addEventListener('mouseenter', keepOpen)
  pop.addEventListener('mouseleave', scheduleClose)

  // 触屏 / 键盘：点击切换
  btn.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    isOpen() ? close() : open()
  })

  pop.addEventListener('click', (event) => {
    const row = event.target.closest('[data-more]')
    if (!row) return
    event.stopPropagation()
    close()
    ACTIONS[row.dataset.more]?.()
  })

  document.addEventListener('click', (event) => {
    // 浮层在 body 上，判断外点时要单独排除浮层内部的点击
    if (isOpen() && !wrap.contains(event.target) && !pop.contains(event.target)) close()
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
