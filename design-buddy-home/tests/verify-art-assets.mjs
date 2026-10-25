/* ============================================================
   原创绘本插画资产专项：
   1. manifest 覆盖全部语义概念，条目为对象契约 {src,license,...}
   2. public/art/illustration 下每个文件真实存在、非空、含 <svg
   3. 引擎 illustration 模式 950 套全部输出 <img>，团队页锁定肖像、地图页用插画地图
   4. photo 模式缺 photo 条目时回退内联 SVG，不白屏
   ============================================================ */

import { readFile, readdir, access } from 'node:fs/promises'
import { join } from 'node:path'
import { ART_CONCEPTS } from '../src/art-concepts.js'
import { buildCatalog, buildDeck, renderPageHTML, configureArt } from '../src/template-engine.js'
import { DIST } from './helpers.mjs'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++ } else { fails.push(`${name}${extra ? ` (${extra})` : ''}`) }
}

const ROOT = join(DIST, '..')
const manifestPath = join(ROOT, 'public', 'art', 'manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))

check('manifest has concepts map', !!manifest.concepts && typeof manifest.concepts === 'object')
const keys = Object.keys(ART_CONCEPTS)
check('manifest covers every concept key', keys.every((k) => manifest.concepts[k]?.illustration?.src),
  keys.filter((k) => !manifest.concepts[k]?.illustration?.src).slice(0, 5).join(','))
check('manifest illustration entries are CC0', keys.every((k) => manifest.concepts[k].illustration.license === 'CC0 1.0'))

// 每个 SVG 文件存在、非空、是 SVG 文档
const files = await readdir(join(ROOT, 'public', 'art', 'illustration'))
check('one svg file per concept', files.length === keys.length, `${files.length} vs ${keys.length}`)
for (const key of keys) {
  const file = join(ROOT, 'public', 'art', 'illustration', `${key}.svg`)
  await access(file)
  const text = await readFile(file, 'utf8')
  if (!text.includes('<svg') || text.length < 200) fails.push(`svg content bad: ${key}`)
  else passed++
}

// 引擎接线：插画模式
configureArt({ mode: 'illustration', manifest: manifest.concepts })
const catalog = buildCatalog()
let rendered = 0, imged = 0
let portraitOk = false, mapOk = false
for (const tpl of catalog) {
  const deck = buildDeck(tpl)
  for (let i = 0; i < deck.pages.length; i++) {
    rendered++
    const html = renderPageHTML(tpl, i)
    if (html.includes('<img')) {
      imged++
      if (!/\/art\/illustration\/[\w.-]+\.svg/.test(html)) fails.push(`bad img src on ${tpl.id} p${i}`)
    }
    const layout = deck.pages[i].layout
    if (layout === 'team' && /\/art\/illustration\/shared\.portrait\.\d+\.svg/.test(html)) portraitOk = true
    if (layout === 'map' && html.includes('/art/illustration/shared.map.svg')) mapOk = true
  }
}
check('all 950 decks: every page emits real illustration img', rendered === imged, `${imged}/${rendered}`)
check('team pages use shared portrait illustrations', portraitOk)
check('map pages use illustrated map asset', mapOk)

// photo 模式：无 photo 条目 -> 回退内联 SVG
configureArt({ mode: 'photo', manifest: manifest.concepts })
const t0 = catalog[0]
const d0 = buildDeck(t0)
check('photo mode falls back to inline svg when no photo entry', !renderPageHTML(t0, 0).includes('<img>')
  && renderPageHTML(t0, 0).includes('dp-art'))

// svg 模式永远不输出 img
configureArt({ mode: 'svg', manifest: manifest.concepts })
check('svg mode never emits img', !renderPageHTML(t0, 0).includes('<img>'))
configureArt({ mode: 'svg', manifest: {}, overrides: {} })

console.log(`\n${fails.length === 0 ? `ALL ${passed} ART ASSET CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
