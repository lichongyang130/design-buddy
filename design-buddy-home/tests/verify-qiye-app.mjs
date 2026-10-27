import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'
import {
  destinations,
  QIYE_KEY,
  readQiyeState,
  initialQiyeState,
  filteredDestinations,
  addToTrip,
  moveTripItem,
} from '../src/qiye-data.js'
import { loadPage, click, input } from './helpers.mjs'
const model = initialQiyeState()
assert.equal(readQiyeState({ getItem: () => '{bad' }).trips.length, 0)
assert.equal(
  readQiyeState({
    getItem: () => {
      throw Error('blocked')
    },
  }).saved.length,
  0,
)
const cleaned = readQiyeState({
  getItem: () =>
    JSON.stringify({
      version: 1,
      saved: ['mountain', 'mountain', 'unknown'],
      trips: [
        {
          id: 'a',
          name: 'test',
          days: 2.5,
          items: [
            { id: 'mountain', day: 99 },
            { id: 'mountain', day: 1 },
            { id: 'unknown', day: 1 },
          ],
        },
      ],
    }),
})
assert.deepEqual(cleaned.saved, ['mountain'])
assert.equal(cleaned.trips[0].days, 2)
assert.deepEqual(cleaned.trips[0].items, [{ id: 'mountain', day: 2 }])
assert.equal(filteredDestinations({ tag: '山野露营' }).length, 1)
assert.equal(filteredDestinations({ duration: '1' }).length, 2)
assert.equal(filteredDestinations({ query: '没有此地' }).length, 0)
const trip = { days: 2, items: [] }
assert.ok(addToTrip(trip, 'mountain'))
assert.ok(!addToTrip(trip, 'mountain'))
assert.ok(!addToTrip(trip, 'unknown'))
addToTrip(trip, 'coast')
assert.ok(moveTripItem(trip, 'coast', -1))
assert.equal(trip.items[0].id, 'coast')
assert.ok(!moveTripItem(trip, 'coast', -1))
assert.equal(destinations.length, 5)
const manifest = JSON.parse(
  fs.readFileSync(new URL('../public/art/qiye/manifest.json', import.meta.url)),
)
assert.equal(manifest.files.length, 5)
assert.equal(new Set(manifest.files.map((f) => f.sha256)).size, 5)
for (const file of manifest.files) {
  assert.equal(
    createHash('sha256')
      .update(fs.readFileSync(new URL(`../public${file.src}`, import.meta.url)))
      .digest('hex'),
    file.sha256,
  )
}
for (const d of destinations)
  assert.ok(fs.existsSync(new URL(`../public/art/qiye/${d.image}.webp`, import.meta.url)))
console.log(
  'PASS: Qiye data, invalid storage recovery, search/filter, duplicate guards and day-local reordering',
)
const page = await loadPage('/qiye-app.html')
const { w, doc } = page
w.scrollTo = () => {}
const select = (selector, value) => {
  const el = doc.querySelector(selector)
  assert.ok(el, selector)
  el.value = value
  el.dispatchEvent(new w.Event('change', { bubbles: true }))
}
const press = (selector) => {
  const el = doc.querySelector(selector)
  assert.ok(el, selector)
  click(w, el)
}
const submit = (selector) => {
  const el = doc.querySelector(selector)
  assert.ok(el, selector)
  el.dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }))
}
try {
  assert.equal(doc.querySelectorAll('.q-bottom-nav a').length, 5)
  assert.equal(doc.querySelector('.q-sidebar'), null, 'no desktop website sidebar')
  assert.ok(doc.querySelector('.q-phone[data-screen=home]'))
  assert.ok(doc.querySelector('.q-home-search'))
  assert.ok(doc.querySelector('.q-hero'))
  doc.querySelector('#q-main').scrollTop = 120
  press('.q-bottom-nav [data-go="#discover"]')
  press('.q-bottom-nav [data-go="#home"]')
  assert.equal(doc.querySelector('#q-main').scrollTop, 120, 'each tab retains its content position')
  press('.q-hero [data-go]')
  assert.ok(doc.querySelector('.q-detail-gallery'))
  assert.ok(
    doc.querySelector('.q-detail-action [data-add]'),
    'detail action pinned outside scroll area',
  )
  assert.equal(
    doc.querySelector('.q-bottom-nav'),
    null,
    'detail is a child screen, not a top-level tab',
  )
  assert.match(doc.querySelector('h1').textContent, /青岚山谷/)
  press('[data-gallery="1"]')
  assert.equal(
    doc.querySelector('.q-detail-gallery>img').getAttribute('src'),
    '/art/qiye/forest.webp',
  )
  press('[data-save="mountain"]')
  assert.ok(JSON.parse(w.localStorage.getItem(QIYE_KEY)).saved.includes('mountain'))
  press('[data-add="mountain"]')
  assert.ok(doc.querySelector('#q-new-trip'))
  assert.equal(doc.activeElement.name, 'name')
  input(w, doc.querySelector('#q-new-trip [name="name"]'), '山野小出走')
  submit('#q-new-trip')
  assert.ok(doc.querySelector('[data-trip-item="mountain"]'))
  assert.match(doc.querySelector('.q-trip-head').textContent, /山野小出走/)
  press('.q-bottom-nav [data-go="#discover"]')
  input(w, doc.querySelector('#q-discover-search'), '海岸')
  assert.equal(doc.querySelectorAll('.q-card').length, 1)
  press('[data-clear-filters]')
  assert.equal(doc.querySelectorAll('.q-card').length, 5)
  press('[data-tag="湖畔放空"]')
  assert.equal(doc.querySelectorAll('.q-card').length, 1)
  select('#q-duration', '2')
  assert.ok(doc.querySelector('.q-empty'))
  press('[data-clear-filters]')
  press('.q-card-title[data-go="#destination/coast"]')
  press('[data-add="coast"]')
  submit('#q-add-trip')
  assert.equal(doc.querySelectorAll('[data-trip-item]').length, 2)
  press('[data-move="coast"][data-direction="-1"]')
  assert.equal(doc.querySelector('[data-trip-item]').dataset.tripItem, 'coast')
  select('[data-item-day="coast"]', '2')
  assert.equal(
    JSON.parse(w.localStorage.getItem(QIYE_KEY)).trips[0].items.find((i) => i.id === 'coast').day,
    2,
  )
  press('.q-bottom-nav [data-go="#saved"]')
  assert.equal(doc.querySelectorAll('.q-card').length, 1)
  press('.q-bottom-nav [data-go="#profile"]')
  press('[data-edit-name]')
  input(w, doc.querySelector('#q-name-form [name="name"]'), '<img src=x onerror=alert(1)>')
  submit('#q-name-form')
  assert.equal(doc.querySelector('.q-profile-card img'), null, 'nickname escapes markup')
  press('[data-preference="轻徒步"]')
  assert.ok(JSON.parse(w.localStorage.getItem(QIYE_KEY)).preferences.includes('轻徒步'))
  const compact = doc.querySelector('#q-compact')
  compact.checked = true
  compact.dispatchEvent(new w.Event('change', { bubbles: true }))
  assert.ok(doc.body.classList.contains('q-compact'))
  assert.equal(page.errors.length, 0, page.errors.join('\n'))
  const savedStorage = w.localStorage
  const reloaded = await loadPage('/qiye-app.html', { storage: savedStorage })
  reloaded.w.scrollTo = () => {}
  try {
    assert.ok(reloaded.doc.body.classList.contains('q-compact'))
    click(reloaded.w, reloaded.doc.querySelector('.q-bottom-nav [data-go="#trips"]'))
    assert.equal(
      reloaded.doc.querySelectorAll('[data-trip-item]').length,
      2,
      'trip persists across reload',
    )
    click(reloaded.w, reloaded.doc.querySelector('[data-remove="coast"]'))
    assert.equal(reloaded.doc.querySelectorAll('[data-trip-item]').length, 1)
    click(reloaded.w, reloaded.doc.querySelector('[data-delete-trip]'))
    assert.ok(reloaded.doc.querySelector('[role="dialog"]'))
    click(reloaded.w, reloaded.doc.querySelector('[data-confirm-delete]'))
    assert.ok(reloaded.doc.querySelector('.q-empty'))
    click(reloaded.w, reloaded.doc.querySelector('.q-bottom-nav [data-go="#profile"]'))
    click(reloaded.w, reloaded.doc.querySelector('[data-reset]'))
    click(reloaded.w, reloaded.doc.querySelector('[data-confirm-reset]'))
    assert.deepEqual(JSON.parse(savedStorage.getItem(QIYE_KEY)), model)
    assert.equal(reloaded.errors.length, 0)
  } finally {
    reloaded.w.close()
  }
  console.log(
    'PASS: all six screens, gallery, search, filters, favorites, new/add/remove/reorder/day assignment, profile, reload persistence, reset and XSS guards',
  )
} finally {
  w.close()
}
const gallery = await loadPage('/templates.html')
try {
  click(gallery.w, gallery.doc.querySelector('input[name="format"][value="App"]'))
  assert.equal(gallery.doc.querySelectorAll('.tpl-card').length, 1)
  assert.equal(gallery.doc.querySelector('.tpl-app-link').getAttribute('href'), '/qiye-app.html')
  assert.equal(
    gallery.doc.querySelector('.qiye-app-cover iframe').getAttribute('src'),
    '/qiye-app.html?embed=1',
  )
  assert.equal(gallery.errors.length, 0)
  console.log('PASS: App filter contains one live interactive case with actual homepage thumbnail')
} finally {
  gallery.w.close()
}
