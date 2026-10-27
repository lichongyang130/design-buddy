import assert from 'node:assert/strict'
import { PRESENTATION_TEMPLATES, renderPresentationSlide } from '../src/presentation-templates.js'
import { GENERATED_DOCUMENT_TEMPLATES } from '../src/document-generator.js'
import { coverDesign, renderExhibitionCover } from '../src/exhibition-cover.js'

const templates = [...PRESENTATION_TEMPLATES, ...GENERATED_DOCUMENT_TEMPLATES]
const designs = new Set()
const families = new Set()
for (const tpl of templates) {
  const cover = renderExhibitionCover(tpl)
  assert.equal(cover, renderExhibitionCover(tpl), `${tpl.id}: deterministic cover`)
  assert.ok(renderPresentationSlide(tpl, 0).includes(cover), `${tpl.id}: actual first page matches thumbnail`)
  assert.ok(!cover.includes('tc-cartoon'), `${tpl.id}: no generic cartoon overlay`)
  assert.ok(cover.includes('<img'), `${tpl.id}: cover retains image`)
  if (tpl.docMode) assert.ok(cover.includes('ex-document'), `${tpl.id}: portrait composition`)
  const { family, seed } = coverDesign(tpl)
  families.add(family)
  designs.add(`${family}-${seed}`)
}
assert.equal(designs.size, templates.length, 'unique deterministic design identities')
assert.equal(families.size, 12, 'all twelve composition families used')
const unsafe = renderExhibitionCover({ id: 'unsafe', name: '<script>', a: '<script>', b: '"<&' })
assert.ok(!unsafe.includes('<script>'), 'cover text is escaped')
console.log(`PASS: ${templates.length} covers; shared first-page markup, portrait documents, escaped text, 12 design families. Identity uniqueness is not a visual-quality assertion.`)
