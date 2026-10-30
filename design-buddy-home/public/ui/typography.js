/* Shared UI-only font preferences. No authored text, work data or canvas styles are changed. */
(() => {
  if (window.__dbTypography) return
  window.__dbTypography = true
  const root = document.documentElement
  const pages = new Set(['', 'index.html', 'auth.html', 'templates.html', 'settings.html', 'themes.html', 'media.html', 'experts.html', 'skills.html', 'connectors.html', 'apps.html', 'art-library.html', 'art-review.html', 'showcase.html'])
  const families = {
    song: "'Songti SC', SimSun, var(--db-default-font)",
    hei: "'Heiti SC', 'Microsoft YaHei', var(--db-default-font)",
    georgia: "Georgia, 'Times New Roman', var(--db-cjk-font), serif",
    mono: "'SF Mono', 'Cascadia Code', Consolas, var(--db-cjk-font), monospace",
  }
  function read() { try { return JSON.parse(localStorage.getItem('design-buddy-state-v1'))?.settings || {} } catch { return {} } }
  function apply(settings = read()) {
    const n = Number(settings.fontScale)
    root.style.setProperty('--font-scale', Number.isFinite(n) && n >= .85 && n <= 1.3 ? String(n) : '1')
    root.style.setProperty('--db-ui-font', families[settings.fontFamily] || 'var(--db-default-font)')
    root.dataset.dbFont = Object.hasOwn(families, settings.fontFamily) ? settings.fontFamily : 'system'
  }
  function markChrome() {
    if (!document.body) return
    if (pages.has(location.pathname.slice(1))) document.body.setAttribute('data-db-ui', '')
    document.querySelectorAll('.detail-chrome,.case-detail .transport,.sc-header,.sc-controls,.sc-page-footer,#sc-dialog,#showcase-toast').forEach(el => {
      if (!el.hasAttribute('data-db-chrome')) el.setAttribute('data-db-chrome', '')
    })
  }
  let queued = false
  function queue() { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; markChrome() }) }
  apply()
  window.addEventListener('db:typography-change', event => apply(event.detail || read()))
  window.addEventListener('storage', event => { if (event.key === 'design-buddy-state-v1' || event.key === null) apply() })
  const start = () => { markChrome(); new MutationObserver(queue).observe(document.body, { childList: true, subtree: true }); root.dataset.dbTypeReady = 'true' }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true})
  else start()
})()
