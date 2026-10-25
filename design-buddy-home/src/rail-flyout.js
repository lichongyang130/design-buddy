/* 窄栏「更多」向右弹出菜单：技能 / 专家 / 连接器。五个页面共享本模块。
   点击后打开对应的真实管理弹窗（见 global-ui.js）。 */

import { openSkills, openExperts, openConnectors } from './global-ui.js'

const ACTIONS = {
  技能: openSkills,
  专家: openExperts,
  连接器: openConnectors,
}

document.querySelectorAll('.more-wrap').forEach((wrap) => {
  const btn = wrap.querySelector('.rail-item')
  const flyout = wrap.querySelector('.more-flyout')
  if (!btn || !flyout) return

  let closeTimer

  const open = () => {
    clearTimeout(closeTimer)
    flyout.hidden = false
    btn.setAttribute('aria-expanded', 'true')
    btn.classList.add('is-open')
  }

  const close = () => {
    flyout.hidden = true
    btn.setAttribute('aria-expanded', 'false')
    btn.classList.remove('is-open')
  }

  const isOpen = () => !flyout.hidden

  // 桌面端：悬停即出；鼠标在按钮与浮层之间移动时不会误关（浮层在 wrap 内）
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

  flyout.addEventListener('click', (event) => {
    const row = event.target.closest('[data-more]')
    if (!row) return
    event.stopPropagation()
    close()
    ACTIONS[row.dataset.more]?.()
  })

  document.addEventListener('click', (event) => {
    if (isOpen() && !wrap.contains(event.target)) close()
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) close()
  })
})
