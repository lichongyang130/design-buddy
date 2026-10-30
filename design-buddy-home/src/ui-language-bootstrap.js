import { store } from './core.js'
import { watchUILanguage } from './ui-language.js'
if (typeof document !== 'undefined') {
  const start = () => {
    const runtime = watchUILanguage(() => store.state.settings.language)
    store.subscribe(() => {
      runtime.refresh()
      window.dispatchEvent(new CustomEvent('db:typography-change', { detail: store.state.settings }))
    })
    window.addEventListener('storage', event => {
      if (event.key !== 'design-buddy-state-v1') return
      try {
        const settings = JSON.parse(event.newValue)?.settings
        if (!settings) return
        if (settings.language) { store.state.settings.language = settings.language; runtime.refresh() }
        if (['system', 'song', 'hei', 'georgia', 'mono'].includes(settings.fontFamily)) store.state.settings.fontFamily = settings.fontFamily
        const scale = Number(settings.fontScale)
        if (Number.isFinite(scale) && scale >= .85 && scale <= 1.3) store.state.settings.fontScale = scale
        window.dispatchEvent(new CustomEvent('db:typography-change', { detail: store.state.settings }))
      } catch { /* Ignore malformed external storage. */ }
    })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else queueMicrotask(start)
}
