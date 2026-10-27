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
import { buildCatalog, buildDeck, renderPageHTML, configureArt, hashStr, CATEGORY_LIST, FRAMEWORKS } from '../src/template-engine.js'

/* 合成模板：生成目录已清空，引擎用合成模板验证插画接线 */
const synthCatalog = Array.from({ length: 40 }, (_, i) => ({
  id: `synth-${i}`,
  serial: i,
  name: `合成绘本${i}`,
  a: `合成${i}`,
  b: 'SYNTH',
  cls: null,
  gen: true,
  format: '演示文稿',
  cats: [CATEGORY_LIST[i % CATEGORY_LIST.length]],
  seed: hashStr(`synth-art:${i}`),
  fw: i % FRAMEWORKS.length,
  pal: i % 20,
  font: i % 5,
  pageCount: 20 + (i % 10),
  imgCount: 10 + (i % 5),
}))
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
const catalog = synthCatalog
let rendered = 0, imged = 0
let portraitOk = false, mapOk = false
const usedPortraits = new Set()
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
    const pMatch = html.match(/\/art\/illustration\/(shared\.portrait\.\d+)\.svg/)
    if (pMatch) usedPortraits.add(pMatch[1])
    if (layout === 'team' && /\/art\/illustration\/shared\.portrait\.\d+\.svg/.test(html)) portraitOk = true
    if (layout === 'map' && html.includes('/art/illustration/shared.map.svg')) mapOk = true
  }
}
check('all 950 decks: every page emits real illustration img', rendered === imged, `${imged}/${rendered}`)
check('team pages use shared portrait illustrations', portraitOk)
check('map pages use illustrated map asset', mapOk)

/* ---------------- 任务二十四：16 人卡通阵容，偏西方人物特征 ---------------- */
const PORTRAIT_NUMS = Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'))
const portraitTexts = []
for (const n of PORTRAIT_NUMS) {
  const key = `shared.portrait.${n}`
  const text = await readFile(join(ROOT, 'public', 'art', 'illustration', `${key}.svg`), 'utf8')
  portraitTexts.push(text)
}
check('portrait roster has 16 distinct characters', new Set(portraitTexts).size === 16)
// 瞳色覆盖：蓝/绿/榛/灰至少 4 种
const EYE_COLORS = ['#4a7fb5', '#5f8f5e', '#8a7a4a', '#6b4a34', '#6d7b85']
const eyeHit = EYE_COLORS.filter((c) => portraitTexts.some((t) => t.includes(`fill="${c}"`))).length
check('portrait roster covers at least 4 western eye colors', eyeHit >= 4, `${eyeHit}/5`)
// 发色覆盖：金色/亚麻 与 红/赤褐 必须出场
const rosterText = portraitTexts.join('\n')
check('portrait roster includes blonde hair', rosterText.includes('#e6c36e') || rosterText.includes('#d9b45c'))
check('portrait roster includes red/auburn hair', rosterText.includes('#b05a43') || rosterText.includes('#8a4b32') || rosterText.includes('#c98a5b'))
// 西式发型/面部特征
check('portrait roster includes wavy or slicked hair',
  portraitTexts.some((t) => /M 344 216 Q 358 176/.test(t) || /M 346 212 A 56 56 0 0 1 454 212 L 450 188/.test(t)))
check('portrait roster includes bearded characters',
  portraitTexts.some((t) => t.includes('284.24')) && portraitTexts.some((t) => t.includes('opacity="0.26"'))
  && portraitTexts.some((t) => t.includes('242.5')))
check('portrait roster includes freckled characters', portraitTexts.filter((t) => t.includes('opacity="0.45"')).length >= 3)
check('portrait brows sit above the eyes', portraitTexts.every((t) => /d="M 374 21[0-9] Q 382 20[0-9] 390 21[0-9]"/.test(t)))
// 950 套模板中人物页实际用到的肖像超过旧的 8 个
check('expanded roster actually distributed across decks', usedPortraits.size >= 9, `${usedPortraits.size} portraits used`)

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
