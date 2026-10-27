// A shared cover composition: gallery thumbnails and the actual first page
// deliberately use the same markup, rather than an unrelated card decoration.
import { IMG } from './presentation-generator.js'

const families = ['editorial', 'cinema', 'swiss', 'botanical', 'blueprint', 'folio', 'archive', 'diptych', 'signal', 'monograph', 'collage', 'orbit']
const pools = {
  '技术文档': [4, 8, 2, 6], '融资演讲稿': [2, 8, 1, 11],
  '报告': [0, 6, 9, 4], '商业规划': [7, 0, 2, 9],
  '教育': [5, 10, 3, 0], '培训': [8, 5, 2, 10],
  '营销材料': [10, 7, 1, 8], '活动': [8, 10, 1, 2],
}
function hash(value) {
  let n = 2166136261
  for (const c of value) n = Math.imul(n ^ c.charCodeAt(0), 16777619)
  return n >>> 0
}
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const tones = [
  ['#f2eadb', '#252c24', '#b64d30'], ['#e6e8e4', '#162a46', '#e66027'],
  ['#eedfbb', '#283b32', '#ab432f'], ['#e9e0ec', '#38284b', '#e55c28'],
  ['#e9edf0', '#183b4e', '#b8d548'], ['#f3eddc', '#4b2725', '#bd382d'],
  ['#e3e6d8', '#183d37', '#d6a936'], ['#f3e8dd', '#292b50', '#f15d50'],
]
export function coverDesign(tpl) {
  const seed = hash(`${tpl.id || tpl.name}:${tpl.cat}`)
  const pool = pools[tpl.cat] || families.map((_, i) => i)
  return { seed, family: families[pool[seed % pool.length]], tone: tones[(seed >>> 5) % tones.length] }
}
export function renderExhibitionCover(tpl, { title, subtitle } = {}) {
  const { seed, family, tone } = coverDesign(tpl)
  const page = tpl.pages?.[0] || {}
  const image = Object.values(IMG)[page.img ?? seed % Object.keys(IMG).length] || Object.values(IMG)[0]
  const heading = title || page.title || tpl.a || tpl.name
  const sub = subtitle || page.sub || tpl.b || ''
  const issue = String((seed % 89) + 11)
  return `<div class="ex-cover ex-${family} ${tpl.docMode ? 'ex-document' : ''} ex-density-${heading.length > 38 ? 'long' : 'short'}" data-cover-design="${family}-${seed}" style="--ex-paper:${tone[0]};--ex-ink:${tone[1]};--ex-accent:${tone[2]};--ex-focus:${25 + seed % 50}%">
    <div class="ex-photo"><img src="${esc(image)}" alt="" loading="lazy"></div>
    <div class="ex-shape" aria-hidden="true"></div>
    <div class="ex-masthead"><span>${esc(page.eyebrow || tpl.cat || 'DESIGN BUDDY')}</span><span>EDITION / ${issue}</span></div>
    <div class="ex-heading"><h2>${esc(heading)}</h2><p>${esc(sub)}</p></div>
    <div class="ex-diagram" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="ex-index" aria-hidden="true">${issue}</div>
    <div class="ex-footer"><span>${esc(tpl.name)}</span><span>${tpl.docMode ? 'RESEARCH / DOCUMENT' : 'IDEAS / PERSPECTIVES'}</span></div>
  </div>`
}
