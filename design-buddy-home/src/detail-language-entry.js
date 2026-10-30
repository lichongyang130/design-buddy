import { watchUILanguage } from './ui-language.js'
const language = () => {
  try { return JSON.parse(localStorage.getItem('design-buddy-state-v1'))?.settings?.language || '简体中文' } catch { return '简体中文' }
}
const runtime = watchUILanguage(language)
window.addEventListener('storage', event => { if (event.key === 'design-buddy-state-v1') runtime.refresh() })
