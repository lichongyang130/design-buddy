import { store } from './core.js'
import { watchUILanguage } from './ui-language.js'
if (typeof document !== 'undefined') {
  const start = () => {
    const runtime = watchUILanguage(() => store.state.settings.language)
    store.subscribe(() => runtime.refresh())
    window.addEventListener('storage', event => {
      if (event.key !== 'design-buddy-state-v1') return
      try {
        const language = JSON.parse(event.newValue)?.settings?.language
        if (language) { store.state.settings.language = language; runtime.refresh() }
      } catch { /* Ignore malformed external storage. */ }
    })
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true })
  else queueMicrotask(start)
}
