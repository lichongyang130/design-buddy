// Normalize application chrome only. Never process authored slides, themes or App cases.
const uiFiles = new Set(['styles.css','features.css','settings.css','auth.css','connectors.css','experts.css','skills.css','media.css','rebuilt-library.css','apps.css','art-library.css','art-review.css','file-skills.css','question-chat.css','themes.css','templates.css'])
const artwork = /(?:theme-preview|te-preview|pv-|td-slide|td-style-slide|deck-page)/
export const scaledSize = value => value.replace(/(?<![\w.-])(\d+(?:\.\d+)?)px/g, (_, n) => `max(12px, calc(${n}px * var(--font-scale, 1)))`)
export function uiTypographyPostcss() {
  return { postcssPlugin: 'design-buddy-ui-typography', Declaration(decl) {
    const file = decl.source?.input?.file?.split('?')[0].split('/').at(-1)
    if (!uiFiles.has(file) || artwork.test(decl.parent?.selector || '') || decl.value.includes('--font-scale')) return
    if (file === 'themes.css' && /(?:\.th-title|\.th-body)/.test(decl.parent?.selector || '')) return
    if (file === 'templates.css' && (!/\.(?:side-|filter-|cat-|tpl-(?:title|subtitle|search|name|fmt|empty)|sort-|td-|tdp-|art-pick|block-|api-)/.test(decl.parent?.selector || '') || /(?:dp-|db-doc|doc-)/.test(decl.parent?.selector || ''))) return
    if (decl.prop === 'font-size' || decl.prop === 'font') decl.value = scaledSize(decl.value)
    if (decl.prop === 'font-weight' && /^(650|800|900)$/.test(decl.value)) decl.value = decl.value === '650' ? '600' : '700'
  }}
}
export function uiTypographyHtml() {
  return {name: 'design-buddy-ui-type-shell', transformIndexHtml() {return [
    {tag:'link',attrs:{rel:'stylesheet',href:'/ui/typography.css?v=1'},injectTo:'head'},
    {tag:'script',attrs:{src:'/ui/typography.js?v=1',defer:true},injectTo:'head'},
  ]}}
}
