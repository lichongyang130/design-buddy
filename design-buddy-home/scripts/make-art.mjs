/* ============================================================
   离线原创绘本插画生成器（零依赖、零网络、确定性）
   为 src/art-concepts.js 的全部概念生成统一扁平绘本风 SVG：
   node scripts/make-art.mjs
   产出 public/art/illustration/*.svg 并重写 manifest.json 的 illustration 条目
   许可：Design Buddy 原创，CC0 1.0
   ============================================================ */

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ART_CONCEPTS } from '../src/art-concepts.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'art', 'illustration')
const MANIFEST = join(ROOT, 'public', 'art', 'manifest.json')
const W = 800, H = 600

/* ---------------- 调色板（统一绘本风） ---------------- */
const INK = '#2f3a44'
const PAPERS = ['#fbf4e9', '#eef5f1', '#f3eef8', '#eaf1fb', '#fdf0ec', '#f1f6ea']
const ACCENTS = ['#2a9d8f', '#ef6f6c', '#f4a261', '#3d5a80', '#8ab17d', '#9b8ede', '#e78bb0', '#6cb4d8']
// 肤色：靠前为偏白皙的欧美常见肤色，整体仍覆盖多种族
const SKIN = ['#f7dcc4', '#f2c9a0', '#ecc39b', '#e0ac7e', '#c68863', '#a96f4e', '#8d5a3b', '#5f3d28']
// 发色：加入金/亚麻/草莓金/红棕/银灰等西式常见发色
const HAIR = ['#e6c36e', '#d9b45c', '#c98a5b', '#b05a43', '#8a4b32', '#7a5a3e', '#6b4423', '#3b2a20', '#1f1c1a', '#c9cdd2', '#7a5c8e']
// 瞳色：蓝/绿/榛/棕/灰，欧美插画常见
const EYES = ['#4a7fb5', '#5f8f5e', '#8a7a4a', '#6b4a34', '#6d7b85', '#2f3a44']
const SHIRTS = ['#2a9d8f', '#ef6f6c', '#f4a261', '#3d5a80', '#9b8ede', '#e78bb0']
const PANTS = ['#3d5a80', '#5b5166', '#41644a', '#7a4a3b']
const FASHION = ['#5b7fa6', '#7d6b9e', '#c26a5f', '#4f8a7f', '#d99a5b', '#8a94a6']

const ST = `stroke="${INK}" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"`
const ST6 = `stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"`

function hash(s) {
  let h = 2166136261
  for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function rng(seed) {
  let a = seed >>> 0
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length)]

const el = (tag, attrs = {}, inner = '') => {
  const a = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
  return `<${tag}${a ? ' ' + a : ''}>${inner}</${tag}>`
}
// extra 中已显式给出的属性优先，避免重复属性（严格 SVG 解析器会报错）
const withFill = (extra, fill) => (extra.includes('fill=') ? extra : `fill="${fill}" ${extra}`)
const withStroke = (extra) => (/stroke(-width|-\w+)?=/.test(extra) ? extra : `${ST} ${extra}`)
const circ = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" ${withFill(extra, fill)}/>`
const rr = (x, y, w, h, rx, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${withFill(extra, fill)}/>`
const ln = (x1, y1, x2, y2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${withStroke(extra)}/>`
const path = (d, fill, extra = '') => `<path d="${d}" ${withFill(extra, fill)}/>`
const poly = (pts, fill, extra = '') => `<polygon points="${pts}" ${withFill(extra, fill)}/>`
const g = (tr, inner) => `<g transform="${tr}">${inner}</g>`

/* ---------------- 场景底板 ---------------- */
function backdrop(seed) {
  const r = rng(seed)
  const paper = pick(r, PAPERS)
  const c1 = pick(r, ACCENTS), c2 = pick(r, ACCENTS.filter((c) => c !== c1))
  return rr(0, 0, W, H, 0, paper)
    + circ(120, 110, 150, c1, 'opacity="0.13"')
    + circ(690, 470, 180, c2, 'opacity="0.13"')
    + circ(660, 90, 60, c1, 'opacity="0.18"')
    + `<ellipse cx="400" cy="508" rx="250" ry="30" fill="${INK}" opacity="0.08"/>`
}
function svgDoc(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${inner}</svg>`
}

/* ---------------- 西式五官（眉/彩色瞳仁/鼻梁/雀斑/胡须），头心 (cx,cy)、半径 r ---------------- */
function face(cx, cy, r, o = {}) {
  const k = r / 56
  const dx = 18 * k, ey = -3 * k, eyeR = 5.6 * k
  const skinDeep = o.skinDeep || INK
  let s = ''
  // 耳朵
  s += circ(cx - r * 0.97, cy + 3 * k, 8 * k, o.skin, ST6) + circ(cx + r * 0.97, cy + 3 * k, 8 * k, o.skin, ST6)
  if (o.earrings) {
    s += circ(cx - r * 0.97, cy + 14 * k, 3.4 * k, '#e0a94b', ST6)
    s += circ(cx + r * 0.97, cy + 14 * k, 3.4 * k, '#e0a94b', ST6)
  }
  // 胡须：先画在下颌，五官叠在其上
  if (o.beard === 'full') {
    s += path(`M ${cx - r * 0.84} ${cy + 4 * k} Q ${cx - r * 0.9} ${cy + r * 0.95} ${cx} ${cy + r * 1.04}
      Q ${cx + r * 0.9} ${cy + r * 0.95} ${cx + r * 0.84} ${cy + 4 * k}
      Q ${cx + r * 0.66} ${cy + r * 0.6} ${cx} ${cy + r * 0.64}
      Q ${cx - r * 0.66} ${cy + r * 0.6} ${cx - r * 0.84} ${cy + 4 * k} Z`, o.beardColor || HAIR[2], ST6)
  } else if (o.beard === 'stubble') {
    s += path(`M ${cx - r * 0.78} ${cy + 7 * k} Q ${cx} ${cy + r * 0.95} ${cx + r * 0.78} ${cy + 7 * k}
      Q ${cx} ${cy + r * 0.46} ${cx - r * 0.78} ${cy + 7 * k} Z`, o.beardColor || INK, 'opacity="0.26"')
  }
  // 眉毛（西式更明显的眉弓）
  const brow = `fill="none" stroke="${o.hairColor || HAIR[0]}" stroke-width="${4.6 * k}" stroke-linecap="round"`
  const by = cy + ey - 10 * k
  s += `<path d="M ${cx - dx - 8 * k} ${by} Q ${cx - dx} ${by - 4 * k} ${cx - dx + 8 * k} ${by}" ${brow}/>`
  s += `<path d="M ${cx + dx - 8 * k} ${by} Q ${cx + dx} ${by - 4 * k} ${cx + dx + 8 * k} ${by}" ${brow}/>`
  // 彩色瞳仁 + 瞳孔 + 高光
  const eye = (ex) => circ(ex, cy + ey, eyeR, o.eyeColor || EYES[0], ST6)
    + circ(ex, cy + ey, eyeR * 0.44, INK)
    + circ(ex - eyeR * 0.3, cy + ey - eyeR * 0.32, eyeR * 0.2, '#fff')
  s += eye(cx - dx) + eye(cx + dx)
  if (o.glasses) {
    s += circ(cx - dx, cy + ey, eyeR + 5 * k, 'none', ST6) + circ(cx + dx, cy + ey, eyeR + 5 * k, 'none', ST6)
    s += `<line x1="${cx - dx + eyeR + 5 * k}" y1="${cy + ey}" x2="${cx + dx - eyeR - 5 * k}" y2="${cy + ey}" ${ST6}/>`
  }
  // 鼻梁（比点状鼻更立体）
  s += `<path d="M ${cx} ${cy + 7 * k} q ${3.6 * k} ${7.5 * k} ${-2.6 * k} ${10.5 * k}" fill="none" stroke="${skinDeep}" stroke-width="${3.4 * k}" stroke-linecap="round" opacity="0.55"/>`
  // 雀斑
  if (o.freckles) {
    const f = (fx, fy) => circ(cx + fx * k, cy + fy * k, 1.7 * k, INK, 'opacity="0.45"')
    s += f(-12, 12) + f(-7, 16) + f(-16, 17) + f(12, 12) + f(7, 16) + f(16, 17) + f(-3, 15) + f(3, 15)
  }
  // 嘴：微笑或开口笑
  if (o.smile === 'open') {
    s += path(`M ${cx - 13 * k} ${cy + 20 * k} Q ${cx} ${cy + 31 * k} ${cx + 13 * k} ${cy + 20 * k}
      Q ${cx} ${cy + 25 * k} ${cx - 13 * k} ${cy + 20 * k} Z`, '#c9635f', ST6)
  } else {
    s += `<path d="M ${cx - 12.5 * k} ${cy + 20 * k} Q ${cx} ${cy + 28.5 * k} ${cx + 12.5 * k} ${cy + 20 * k}" fill="none" ${ST6}/>`
  }
  if (o.beard === 'mustache') {
    s += path(`M ${cx - 2 * k} ${cy + 16.5 * k} q ${-11 * k} ${-6 * k} ${-17 * k} ${1 * k} q ${9 * k} ${6.5 * k} ${17 * k} ${1.5 * k} Z`, o.beardColor || HAIR[2], ST6)
    s += path(`M ${cx + 2 * k} ${cy + 16.5 * k} q ${11 * k} ${-6 * k} ${17 * k} ${1 * k} q ${-9 * k} ${6.5 * k} ${-17 * k} ${1.5 * k} Z`, o.beardColor || HAIR[2], ST6)
  }
  // 腮红
  s += circ(cx - 25 * k, cy + 11 * k, 5.5 * k, '#ef6f6c', 'opacity="0.32"')
  s += circ(cx + 25 * k, cy + 11 * k, 5.5 * k, '#ef6f6c', 'opacity="0.32"')
  return s
}

/* ---------------- 人物（全身，脚在原点，高约 260） ---------------- */
function person(o = {}) {
  const skin = o.skin || SKIN[0], shirt = o.shirt || SHIRTS[0], pantsC = o.pants || PANTS[0]
  const hair = o.hair || 'short', hairC = o.hairColor || HAIR[0]
  const pose = o.pose || 'stand'
  let s = ''
  // 腿与鞋
  s += rr(-34, -92, 24, 92, 11, pantsC, ST) + rr(10, -92, 24, 92, 11, pantsC, ST)
  s += `<ellipse cx="-22" cy="-6" rx="22" ry="11" fill="${INK}"/>` + `<ellipse cx="22" cy="-6" rx="22" ry="11" fill="${INK}"/>`
  // 身体
  s += rr(-54, -202, 108, 118, 36, shirt, ST)
  // 手臂
  if (pose === 'wave') {
    s += ln(-46, -180, -78, -120) + ln(-78, -120, -70, -78)
    s += g('rotate(-38 -30 -182)', ln(0, 0, 0, 96))
    s += circ(-74, -72, 12, skin)
  } else if (pose === 'point') {
    s += ln(-46, -180, -78, -120) + ln(-78, -120, -70, -84)
    s += ln(46, -178, 104, -168) + circ(110, -167, 12, skin)
  } else if (pose === 'hold') {
    s += ln(-46, -178, -20, -132) + ln(46, -178, 20, -132)
    s += rr(-30, -138, 60, 22, 10, skin, ST6)
  } else {
    s += ln(-46, -180, -58, -104) + ln(46, -180, 58, -104)
    s += circ(-58, -98, 11, skin) + circ(58, -98, 11, skin)
  }
  // 脖子与头
  s += rr(-13, -222, 26, 26, 8, skin, ST6)
  s += circ(0, -248, 44, skin, ST)
  // 发型（含西式大背头/波浪/马尾/光头）
  if (hair === 'short') s += path('M -42 -258 A 44 44 0 0 1 42 -258 L 42 -272 A 44 44 0 0 0 -42 -272 Z', hairC)
  if (hair === 'wavy') s += path('M -44 -256 Q -30 -278 -8 -270 Q 12 -282 30 -268 Q 42 -262 44 -254 L 44 -268 A 44 44 0 0 0 -44 -268 Z', hairC, ST6)
  if (hair === 'slick') s += path('M -42 -260 A 44 44 0 0 1 42 -260 L 40 -274 Q 20 -282 0 -278 Q -22 -282 -40 -274 Z', hairC, ST6)
  if (hair === 'cap') s += path('M -46 -258 A 46 40 0 0 1 46 -258 L 40 -272 L -40 -272 Z', '#3d5a80', ST6) + rr(-52, -266, 104, 14, 7, '#3d5a80', ST6)
  if (hair === 'bob') s += path('M -46 -252 A 46 46 0 0 1 46 -252 L 48 -214 Q 44 -206 36 -210 L -36 -210 Q -44 -206 -48 -214 Z', hairC, ST6)
  if (hair === 'bun') s += path('M -44 -254 A 44 44 0 0 1 44 -254 L 40 -216 L -40 -216 Z', hairC, ST6) + circ(0, -296, 16, hairC, ST6)
  if (hair === 'curly') s += [-40, -20, 0, 20, 40].map((x) => circ(x, -280, 18, hairC, ST6)).join('') + circ(-44, -258, 14, hairC, ST6) + circ(44, -258, 14, hairC, ST6)
  if (hair === 'long') s += path('M -46 -252 A 46 46 0 0 1 46 -252 L 52 -196 Q 40 -190 36 -200 L -36 -200 Q -40 -190 -52 -196 Z', hairC, ST6)
  if (hair === 'ponytail') s += path('M -42 -258 A 44 44 0 0 1 42 -258 L 40 -270 A 44 44 0 0 0 -40 -270 Z', hairC, ST6) + path('M 34 -262 Q 66 -252 58 -214 Q 52 -206 46 -212 Q 48 -240 30 -252 Z', hairC, ST6)
  if (hair === 'bald') s += path('M -40 -262 A 40 40 0 0 1 40 -262 L 38 -270 A 40 40 0 0 0 -38 -270 Z', hairC, ST6)
  // 西式五官
  s += face(0, -248, 44, {
    skin, skinDeep: SKIN[Math.max(0, SKIN.indexOf(skin) - 1)],
    hairColor: hairC, eyeColor: o.eyeColor, glasses: o.glasses,
    freckles: o.freckles, beard: o.beard, beardColor: hairC,
    smile: o.smile, earrings: o.earrings,
  })
  return s
}

/* 半身肖像（供 shared.portrait.*，偏西方人物特征）
   按概念序号轮转特征，保证 16 人阵容覆盖全部西式发型/瞳色/发色/服装，而非随机扎堆 */
const BUST_HAIRS = ['wavy', 'long', 'slick', 'bob', 'curly', 'bun', 'ponytail', 'braid', 'short', 'bald',
  'wavy', 'long', 'slick', 'bob', 'curly', 'bald']
const BUST_BEARDS = ['none', 'none', 'stubble', 'none', 'none', 'mustache', 'none', 'none', 'full', 'stubble',
  'full', 'none', 'mustache', 'none', 'none', 'stubble']
function bust(seed, key = '') {
  const r = rng(seed)
  const n = Math.max(0, Number(key.slice(-2)) - 1)
  const skin = SKIN[(n * 3 + (r() > 0.5 ? 1 : 0)) % SKIN.length]
  const skinDeep = SKIN[Math.max(0, SKIN.indexOf(skin) - 1)]
  const hairC = HAIR[n % HAIR.length]
  const eyeColor = EYES[n % EYES.length]
  const hair = BUST_HAIRS[n]
  const beard = BUST_BEARDS[n]
  const freckles = n % 3 === 1
  const glasses = n % 4 === 3
  const earrings = n % 5 === 2
  const smile = n % 2 === 0 ? 'open' : 'smile'
  const outfit = ['tee', 'hoodie', 'blazer', 'collar'][n % 4]
  const cloth = FASHION[n % FASHION.length]
  const bgC = pick(r, ACCENTS)
  const CX = 400, CY = 226, RR = 56
  let s = circ(400, 300, 240, bgC, 'opacity="0.22"')

  /* 服装（translate(400 470) scale(1.15) 局部坐标） */
  let outfitSvg = rr(-16, -176, 32, 30, 10, skin, ST6)
  if (outfit === 'tee') {
    outfitSvg = rr(-96, -150, 192, 160, 60, cloth, ST)
      + path('M -22 -152 Q 0 -132 22 -152 L 16 -168 L -16 -168 Z', skin, ST6)
      + outfitSvg
  } else if (outfit === 'hoodie') {
    outfitSvg = rr(-96, -150, 192, 160, 60, cloth, ST)
      + path('M -34 -156 Q 0 -118 34 -156 L 26 -172 Q 0 -150 -26 -172 Z', skinDeep, ST6)
      + rr(-44, -70, 88, 34, 12, 'none', ST6)
      + rr(-16, -176, 32, 30, 10, skin, ST6)
  } else if (outfit === 'blazer') {
    outfitSvg = rr(-96, -150, 192, 160, 60, '#f4f1ec', ST6)
      + path('M -96 -146 L -26 -150 L -8 -92 L -40 -60 Z', cloth, ST)
      + path('M 96 -146 L 26 -150 L 8 -92 L 40 -60 Z', cloth, ST)
      + path('M -20 -150 L 0 -122 L 20 -150 Z', '#fff', ST6)
      + rr(-5, -124, 10, 70, 4, cloth)
      + rr(-16, -176, 32, 30, 10, skin, ST6)
  } else {
    outfitSvg = rr(-96, -150, 192, 160, 60, cloth, ST)
      + path('M -24 -150 L 0 -128 L 24 -150 L 16 -166 L 0 -154 L -16 -166 Z', '#fff', ST6)
      + circ(0, -104, 4, '#fff', ST6) + circ(0, -84, 4, '#fff', ST6)
      + rr(-16, -176, 32, 30, 10, skin, ST6)
  }
  s += g('translate(400 470) scale(1.15)', outfitSvg)

  /* 后层长发/马尾/辫子先于头部 */
  if (hair === 'long') s += path('M 342 218 A 58 58 0 0 1 458 218 L 466 286 Q 450 294 444 280 L 356 280 Q 350 294 334 286 Z', hairC, ST6)
  if (hair === 'ponytail') s += path('M 438 196 Q 492 188 496 240 Q 498 276 470 282 Q 462 252 444 240 Z', hairC, ST6)
  if (hair === 'braid') s += [0, 1, 2, 3].map((i) => circ(400, 268 + i * 22, 15 - i * 1.6, hairC, ST6)).join('') + path('M 384 176 Q 400 162 416 176 L 412 200 L 388 200 Z', hairC, ST6)
  // 脖子与头
  s += rr(384, 268, 32, 30, 10, skin, ST6)
  s += circ(CX, CY, RR, skin, ST)

  /* 发型（肖像绝对坐标，头心 400,226 r56） */
  if (hair === 'short') s += path('M 346 214 A 56 56 0 0 1 454 214 L 454 196 A 56 56 0 0 0 346 196 Z', hairC)
  if (hair === 'wavy') s += path('M 344 216 Q 358 176 386 184 Q 408 168 430 184 Q 448 178 456 200 L 456 192 A 56 56 0 0 0 344 192 Z', hairC, ST6)
  if (hair === 'slick') s += path('M 346 212 A 56 56 0 0 1 454 212 L 450 188 Q 420 170 400 176 Q 376 170 350 188 Z', hairC, ST6)
    + path('M 366 196 Q 386 184 404 190', 'none', `stroke="${skinDeep}" stroke-width="3" fill="none" opacity="0.7"`)
  if (hair === 'bob') s += path('M 342 218 A 58 58 0 0 1 458 218 L 462 268 Q 456 278 446 270 L 354 270 Q 344 278 338 268 Z', hairC, ST6)
  if (hair === 'bun') s += path('M 344 216 A 56 56 0 0 1 456 216 L 450 266 L 350 266 Z', hairC, ST6) + circ(400, 152, 20, hairC, ST6)
  if (hair === 'curly') s += [356, 378, 400, 422, 444].map((x) => circ(x, 178, 22, hairC, ST6)).join('') + circ(346, 210, 16, hairC, ST6) + circ(454, 210, 16, hairC, ST6)
  if (hair === 'bald') s += path('M 348 206 A 54 54 0 0 1 452 206 L 448 196 A 54 54 0 0 0 352 196 Z', hairC, ST6)
  // long / ponytail / braid 的顶发
  if (hair === 'long' || hair === 'ponytail' || hair === 'braid') {
    s += path('M 346 214 A 56 56 0 0 1 454 214 L 452 194 A 56 56 0 0 0 348 194 Z', hairC, ST6)
  }

  /* 西式五官 */
  s += face(CX, CY, RR, {
    skin, skinDeep, hairColor: hairC, eyeColor, glasses, freckles, beard, beardColor: hairC, smile, earrings,
  })
  return s
}

/* ---------------- 语义道具库（cx,cy 为中心，s 缩放，c 主色） ---------------- */
const P = {
  book: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -110 -70 Q 0 -92 110 -70 L 110 70 Q 0 48 -110 70 Z', '#fff', ST)
    + path('M 110 -70 Q 0 -92 -110 -70 L -110 70 Q 0 48 110 70 Z', 'none')
    + ln(0, -84, 0, 60) + ln(-80, -40, -20, -52) + ln(-80, -10, -20, -22) + ln(20, -52, 80, -40) + ln(20, -22, 80, -10)),
  bulb: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(0, -30, 56, '#ffd972', ST) + rr(-20, 18, 40, 22, 8, '#9aa7b1', ST6) + rr(-26, 38, 52, 12, 6, '#9aa7b1', ST6)
    + ln(0, -110, 0, -92) + ln(-78, -92, -64, -78) + ln(78, -92, 64, -78) + ln(-96, -30, -78, -30) + ln(96, -30, 78, -30)),
  laptop: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-90, -70, 180, 118, 12, '#3d5a80', ST) + rr(-76, -56, 152, 90, 6, '#dfeaf2')
    + path('M -120 62 L 120 62 L 100 42 L -100 42 Z', c, ST)),
  board: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-120, -90, 240, 140, 14, '#fff', ST) + ln(-120, 60, -140, 100) + ln(120, 60, 140, 100)
    + ln(-86, -46, 86, -46, 'stroke="#2a9d8f"') + ln(-86, -10, 40, -10) + ln(-86, 26, 70, 26)),
  notebook: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-78, -100, 156, 200, 14, c, ST) + rr(-58, -84, 116, 168, 8, '#fff')
    + [-60, -20, 20, 60].map((yy) => circ(-70, yy, 6, INK)).join('')
    + ln(-34, -40, 40, -40) + ln(-34, 0, 40, 0) + ln(-34, 40, 40, 40)),
  gradcap: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    poly('0 -80 120 -30 0 20 -120 -30', c, ST) + rr(-34, 12, 68, 46, 8, '#fff', ST6)
    + ln(100, -22, 100, 40) + circ(100, 52, 12, '#f4a261', ST6)),
  quiz: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, -80, 220, 130, 26, c, ST) + poly('-40 48 -10 48 -34 78', c)
    + circ(-30, -20, 8, '#fff') + circ(0, -20, 8, '#fff') + circ(30, -20, 8, '#fff')),
  gear: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    [0, 45, 90, 135, 180, 225, 270, 315].map((a) => g(`rotate(${a})`, rr(-12, -92, 24, 30, 6, c, ST6))).join('')
    + circ(0, 0, 66, c, ST) + circ(0, 0, 24, '#fff', ST6)),
  video: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, -72, 220, 144, 22, c, ST) + poly('-28 -34 -28 34 40 0', '#fff')),
  handshake: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-120, -24, 70, 48, 14, '#3d5a80', ST6) + rr(50, -24, 70, 48, 14, '#ef6f6c', ST6)
    + path('M -50 -18 Q 0 -44 50 -18 L 40 22 Q 0 44 -40 22 Z', '#f2c9a0', ST6)),
  blueprint: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-96, -120, 192, 240, 10, '#dfeaf2', ST) + path('M 60 -120 L 96 -84 L 96 -120 Z', '#b9cdda', ST6)
    + [ -70, -30, 10, 50 ].map((xx) => ln(xx, -96, xx, 96, 'stroke="#9fb6c9" stroke-width="4"')).join('')
    + [ -70, -30, 10, 50 ].map((yy) => ln(-76, yy, 76, yy, 'stroke="#9fb6c9" stroke-width="4"')).join('')
    + poly('-40 40 -10 -20 30 10 66 -50', 'none', `stroke="${c}" stroke-width="8" fill="none"`)),
  target: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(0, 0, 92, '#fff', ST) + circ(0, 0, 62, c, ST6) + circ(0, 0, 32, '#fff', ST6) + circ(0, 0, 12, c)
    + ln(-96, -84, -30, -30, 'stroke="#ef6f6c"')),
  doc: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-84, -110, 168, 220, 12, '#fff', ST) + path('M 48 -110 L 84 -74 L 84 -110 Z', '#dfeaf2', ST6)
    + ln(-52, -50, 52, -50) + ln(-52, -14, 52, -14) + ln(-52, 22, 30, 22) + ln(-52, 58, 52, 58)),
  signdoc: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-90, -104, 160, 208, 12, '#fff', ST) + ln(-56, -50, 40, -50) + ln(-56, -16, 56, -16)
    + path('M -40 56 Q 0 20 56 44', 'none', `stroke="${c}" stroke-width="9" fill="none"`)
    + g('rotate(28 78 30)', rr(60, -40, 22, 96, 8, '#f4a261', ST6))),
  meeting: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    [-90, 0, 90].map((xx, i) => g(`translate(${xx} -30)`, circ(0, 0, 30, SKIN[i % SKIN.length], ST6) + rr(-34, 30, 68, 56, 22, SHIRTS[i % SHIRTS.length], ST6))).join('')
    + `<ellipse cx="0" cy="96" rx="180" ry="30" fill="${c}" ${ST}/>`),
  stratboard: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-120, -96, 240, 160, 12, '#fff', ST)
    + rr(-92, -66, 64, 56, 8, '#ffd972', ST6) + rr(-14, -66, 64, 56, 8, '#9bd3c8', ST6) + rr(64, -66, 40, 56, 8, '#f5b0ad', ST6)
    + ln(-92, 30, 104, 30)),
  compass: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(0, 0, 92, '#fff', ST) + poly('0 -60 18 0 0 60 -18 0', c, ST6) + circ(0, 0, 8, INK)),
  checklist: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-80, -104, 160, 208, 12, '#fff', ST) + rr(-30, -120, 60, 26, 8, c, ST6)
    + [-56, -8, 40].map((yy) => g('', circ(-48, yy, 12, 'none', ST6) + path(`M -54 ${yy} l 5 6 l 11 -13`, 'none', `stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"`) + ln(-22, yy, 52, yy))).join('')),
  bars: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(-100, 90, 100, 90) + ln(-100, 90, -100, -90)
    + rr(-70, 10, 36, 80, 8, c, ST6) + rr(-14, -30, 36, 120, 8, '#f4a261', ST6) + rr(42, -64, 36, 154, 8, '#8ab17d', ST6)),
  clipboard: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-84, -96, 168, 192, 12, '#8ab17d', ST) + rr(-64, -72, 128, 148, 8, '#fff')
    + rr(-28, -112, 56, 28, 8, INK, ST6) + ln(-44, -30, 44, -30) + ln(-44, 6, 44, 6) + ln(-44, 42, 20, 42)),
  analytics: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-104, -84, 208, 150, 12, '#3d5a80', ST) + rr(-88, -68, 176, 118, 6, '#eef3f8')
    + poly('-76 30 -30 -16 8 6 60 -48', 'none', `stroke="${c}" stroke-width="8" fill="none"`)
    + [-60, -16, 28].map((xx) => circ(xx, [20, -12, -34][[ -60, -16, 28 ].indexOf(xx)], 7, c)).join('')),
  magnifier: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(-20, -24, 62, 'rgba(255,255,255,0.85)', ST) + g('rotate(-42 30 30)', rr(22, 18, 20, 92, 9, c, ST))),
  dashboard: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, -78, 220, 156, 16, '#fff', ST)
    + [-58, 0, 58].map((xx, i) => g('', circ(xx, -8, 34, ['#dfeaf2', '#ffe8c2', '#d8f0e6'][i], ST6)
      + path(`M ${xx - 18} 2 A 26 26 0 0 1 ${xx + 22} -16`, 'none', `stroke="${[c, '#f4a261', '#2a9d8f'][i]}" stroke-width="7" fill="none" stroke-linecap="round"`))).join('')
    + ln(-80, 52, 80, 52)),
  rocket: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M 0 -110 C 46 -70 46 20 30 60 L -30 60 C -46 20 -46 -70 0 -110 Z', '#fff', ST)
    + circ(0, -34, 20, c, ST6) + poly('-30 20 -70 66 -30 56', '#ef6f6c', ST6) + poly('30 20 70 66 30 56', '#ef6f6c', ST6)
    + path('M -16 60 L 0 108 L 16 60 Z', '#ffd972', ST6)),
  piggy: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-86, -44, 156, 96, 46, c, ST) + poly('30 -36 66 -64 70 -22 Z', c, ST6)
    + rr(62, -10, 30, 28, 12, c, ST6) + circ(76, 2, 5, INK) + circ(-40, -12, 6, INK)
    + rr(-14, -58, 28, 12, 5, INK) + path('M -70 24 L -92 48', 'none', ST6) + path('M 70 24 L 92 48', 'none', ST6)),
  trend: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(-100, 80, 100, 80) + ln(-100, 80, -100, -80)
    + poly('-76 40 -28 -6 12 18 72 -52', 'none', `stroke="${c}" stroke-width="10" fill="none"`)
    + poly('44 -52 78 -56 72 -22', c)),
  coins: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    [0, 1, 2].map((k) => g(`translate(0 ${k * 34})`, `<ellipse cx="0" cy="0" rx="78" ry="26" fill="${c}" ${ST6}/>` + ln(-78, 0, -78, 22) + ln(78, 0, 78, 22))).join('')
    + `<ellipse cx="0" cy="102" rx="78" ry="26" fill="${c}" ${ST}/>`),
  megaphone: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    poly('-90 -40 40 -70 40 70 -90 40', c, ST) + rr(-112, -26, 30, 52, 10, '#3d5a80', ST6)
    + ln(44, 40, 78, 86) + rr(20, 30, 22, 56, 8, INK, ST6)
    + ln(76, -52, 100, -66) + ln(84, -20, 112, -20) + ln(76, 12, 100, 26)),
  phone: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-56, -104, 112, 208, 20, INK, ST) + rr(-44, -84, 88, 168, 8, '#eef3f8')
    + rr(-26, -62, 52, 34, 8, c, ST6) + circ(0, 72, 7, '#fff')),
  coupon: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -120 -52 H 120 A 20 20 0 0 1 120 -12 V 12 A 20 20 0 0 1 120 52 H -120 A 20 20 0 0 1 -120 12 V -12 A 20 20 0 0 1 -120 -52 Z', c, ST)
    + ln(-30, -40, -30, 40, 'stroke="#fff" stroke-dasharray="10 10"') + circ(40, -14, 10, '#fff') + circ(72, -14, 10, '#fff') + circ(56, 18, 10, '#fff')),
  chat: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-104, -70, 170, 100, 22, c, ST) + poly('-50 26 -50 56 -16 26', c, ST)
    + rr(-30, -20, 130, 90, 20, '#fff', ST6) + circ(0, 10, 7, c) + circ(34, 10, 7, c) + circ(68, 10, 7, c)),
  bag: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -86 -30 H 86 L 70 96 H -70 Z', c, ST) + path('M -40 -30 Q -40 -84 0 -84 Q 40 -84 40 -30', 'none', ST6)),
  flag: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(-80, 100, -80, -96) + path('M -80 -96 H 60 L 30 -60 L 60 -24 H -80 Z', c, ST)),
  mentor: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    g('translate(-52 60) scale(0.85)', person({ pose: 'point', shirt: c }))
    + g('translate(78 92) scale(0.62)', person({ shirt: '#f4a261', hair: 'bob' }))),
  pathmap: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, -80, 220, 160, 14, '#fff', ST)
    + path('M -80 50 Q -30 -40 20 10 T 84 -46', 'none', `stroke="${c}" stroke-width="8" stroke-dasharray="14 12" fill="none"`)
    + circ(-80, 50, 12, '#ef6f6c', ST6) + poly('84 -70 100 -40 84 -40 68 -40 Z', c, ST6)),
  certificate: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, -84, 220, 168, 12, '#fff', ST) + ln(-70, -36, 70, -36) + ln(-70, 0, 40, 0)
    + circ(66, 40, 26, c, ST6) + poly('58 40 l 6 7 l 12 -15', 'none', 'stroke="#fff" stroke-width="5" fill="none"')
    + ln(-96, -84, -96, -110) + ln(96, -84, 96, -110)),
  chess: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-86, 80, 172, 18, 9, INK) + rr(-52, 40, 104, 40, 10, c, ST6)
    + path('M -30 40 L -30 -30 L -46 -46 L -16 -66 L 0 -46 L 16 -66 L 46 -46 L 30 -30 L 30 40 Z', '#fff', ST6) + circ(0, -84, 12, c, ST6)),
  signpost: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(0, 100, 0, -96)
    + path('M -84 -84 H 56 L 80 -60 L 56 -36 H -84 Z', c, ST)
    + path('M -56 -18 H 76 L 96 4 L 76 26 H -56 Z', '#f4a261', ST6)),
  orgchart: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-34, -96, 68, 44, 10, c, ST) + ln(0, -52, 0, -20) + ln(-80, -20, 80, -20) + ln(-80, -20, -80, 4) + ln(80, -20, 80, 4)
    + rr(-114, 4, 68, 44, 10, '#fff', ST6) + rr(-34, 4, 68, 44, 10, '#fff', ST6) + rr(46, 4, 68, 44, 10, '#fff', ST6)),
  calendar: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-96, -84, 192, 168, 14, '#fff', ST) + rr(-96, -84, 192, 44, 14, c)
    + ln(-44, -96, -44, -120) + ln(44, -96, 44, -120)
    + [-48, 0, 48].map((xx) => [0, 44].map((yy) => rr(xx - 14, yy - 10, 28, 24, 5, '#dfeaf2'))).join('')),
  briefcase: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-100, -44, 200, 130, 16, c, ST) + path('M -36 -44 Q -36 -88 0 -88 Q 36 -88 36 -44', 'none', ST6)
    + ln(-100, 4, 100, 4) + circ(-14, 34, 6, INK) + circ(14, 34, 6, INK)),
  stage: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-130, -100, 260, 26, 12, c, ST) + path('M -130 -86 Q -104 -20 -118 86 L -60 86 Q -48 -20 -66 -86 Z', '#7a5c8e', ST6)
    + path('M 130 -86 Q 104 -20 118 86 L 60 86 Q 48 -20 66 -86 Z', '#7a5c8e', ST6) + rr(-140, 86, 280, 22, 10, INK)),
  confetti: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    [[-80, -60, c], [-20, -84, '#f4a261'], [50, -64, '#8ab17d'], [90, -10, '#9b8ede'], [-60, 10, '#ef6f6c'], [10, 20, c], [66, 44, '#f4a261'], [-96, 56, '#6cb4d8']]
      .map(([xx, yy, cc], i) => g(`rotate(${i * 24} ${xx} ${yy})`, rr(xx - 8, yy - 12, 16, 24, 4, cc, ST6))).join('')
    + circ(0, 0, 40, c, ST)),
  ticket: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -120 -56 H 120 V 56 H -120 Z', c, ST) + circ(20, -56, 14, PAPERS[0]) + circ(20, 56, 14, PAPERS[0])
    + ln(20, -40, 20, 40, 'stroke="#fff" stroke-dasharray="10 10"') + ln(-84, -14, -12, -14, 'stroke="#fff"') + ln(-84, 16, -40, 16, 'stroke="#fff"')),
  balloon: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(-44, -36, 48, c, ST) + circ(48, -52, 40, '#f4a261', ST)
    + path('M -44 12 Q -30 40 -52 84', 'none', ST6) + path('M 48 -12 Q 62 30 40 78', 'none', ST6)),
  venue: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, -40, 220, 120, 10, '#fff', ST) + path('M -126 -40 L 0 -100 L 126 -40 Z', c, ST)
    + rr(-26, 12, 52, 68, 8, c, ST6) + rr(-84, 0, 34, 34, 6, '#dfeaf2', ST6) + rr(50, 0, 34, 34, 6, '#dfeaf2', ST6)
    + rr(-56, -124, 112, 22, 8, '#ef6f6c', ST6)),
  palette: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M 0 -96 C -84 -96 -110 -30 -84 18 C -60 62 -14 44 -10 70 C -6 96 -34 104 -52 92 C 6 116 104 80 104 4 C 104 -52 60 -96 0 -96 Z', c, ST)
    + [ [-52, -40, '#ef6f6c'], [0, -56, '#ffd972'], [52, -34, '#8ab17d'], [40, 24, '#6cb4d8'] ].map(([xx, yy, cc]) => circ(xx, yy, 14, cc, ST6)).join('')),
  camera: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-96, -52, 192, 124, 18, c, ST) + path('M -40 -52 L -24 -80 H 24 L 40 -52 Z', c, ST)
    + circ(0, 8, 40, INK, ST6) + circ(0, 8, 24, '#dfeaf2', ST6) + circ(58, -22, 8, '#ffd972')),
  grid4: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-100, -80, 88, 64, 10, c, ST6) + rr(12, -80, 88, 64, 10, '#f4a261', ST6)
    + rr(-100, 16, 88, 64, 10, '#8ab17d', ST6) + rr(12, 16, 88, 64, 10, '#9b8ede', ST6)),
  desk: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-120, 20, 240, 20, 9, INK) + ln(-100, 40, -100, 96) + ln(100, 40, 100, 96)
    + g('translate(-60 -30)', P.lamp(0, 0, 0.7, c)) + rr(30, -26, 44, 46, 8, '#fff', ST6) + path('M 36 -12 Q 52 -22 66 -10', 'none', ST6)
    + rr(84, -14, 26, 34, 6, c, ST6)),
  lamp: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(0, 60, 0, -30) + path('M -34 -30 H 34 L 20 -64 H -20 Z', c, ST6) + rr(-26, 60, 52, 12, 6, INK)),
  frame: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-100, -84, 200, 168, 12, c, ST) + rr(-78, -62, 156, 124, 6, '#eef3f8')
    + poly('-60 40 -10 -20 30 16 66 -30', 'none', `stroke="${'#8ab17d'}" stroke-width="8" fill="none"`) + circ(52, -40, 12, '#ffd972')),
  hexmark: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    poly('0 -86 74 -43 74 43 0 86 -74 43 -74 -43', c, ST) + poly('0 -44 38 -22 38 22 0 44 -38 22 -38 -22', '#fff')),
  guidebook: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    P.book(0, 0, 0.9, c) + [ -40, 0, 40 ].map((xx) => circ(xx, 78, 14, [c, '#f4a261', '#8ab17d'][ [ -40, 0, 40 ].indexOf(xx)], ST6)).join('')),
  swatches: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    g('rotate(-12)', rr(-96, -70, 60, 150, 10, c, ST6)) + g('rotate(0)', rr(-30, -80, 60, 160, 10, '#f4a261', ST6)) + g('rotate(12)', rr(36, -70, 60, 150, 10, '#8ab17d', ST6))),
  typeA: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    `<text x="0" y="40" font-family="Georgia, serif" font-size="180" font-weight="bold" fill="${c}" ${ST} text-anchor="middle">A</text>`
    + ln(-80, 80, 80, 80, 'stroke-width="6"')),
  package: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    poly('0 -90 90 -45 0 0 -90 -45', c, ST) + poly('0 0 90 -45 90 48 0 96', '#f4a261', ST) + poly('0 0 -90 -45 -90 48 0 96', '#e08a3c', ST)
    + ln(0, 0, 0, 96)),
  bee: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    `<ellipse cx="-14" cy="-52" rx="34" ry="22" fill="#ffffff" opacity="0.85" ${ST6}/><ellipse cx="14" cy="-52" rx="34" ry="22" fill="#ffffff" opacity="0.85" ${ST6}/>`
    + circ(-52, -8, 26, '#2f3a44', ST6) + `<ellipse cx="14" cy="0" rx="66" ry="42" fill="#ffd972" ${ST}/>`
    + g('rotate(-8 14 0)', rr(-16, -38, 14, 76, 4, INK) + rr(14, -38, 14, 76, 4, INK))
    + poly('78 0 98 -8 84 12', INK) + ln(-58, -30, -70, -48) + ln(-46, -32, -50, -52) + circ(-60, -6, 4, '#fff')),
  butterfly: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    `<ellipse cx="-44" cy="-26" rx="42" ry="34" fill="${c}" ${ST6}/><ellipse cx="44" cy="-26" rx="42" ry="34" fill="${c}" ${ST6}/>`
    + `<ellipse cx="-38" cy="26" rx="30" ry="26" fill="#f4a261" ${ST6}/><ellipse cx="38" cy="26" rx="30" ry="26" fill="#f4a261" ${ST6}/>`
    + rr(-7, -52, 14, 104, 7, INK) + ln(-6, -52, -20, -78) + ln(6, -52, 20, -78)),
  flower: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(0, 30, 0, 100) + path('M 0 78 Q -40 62 -46 26', 'none', ST6) + path('M 0 66 Q 40 52 46 20', 'none', ST6)
    + [0, 72, 144, 216, 288].map((a) => g(`rotate(${a})`, circ(0, -44, 30, c, ST6))).join('') + circ(0, 0, 22, '#ffd972', ST6)),
  hive: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -52 -96 Q 0 -120 52 -96 L 66 70 Q 0 98 -66 70 Z', c, ST)
    + [ -48, 0, 48 ].map((yy) => [ -26, 26 ].map((xx) => g(`translate(${xx} ${yy})`, `<path d="M -16 0 A 16 18 0 1 1 16 0 Z" fill="#fff" opacity="0.85" ${ST6}/>`))).join('')
    + ln(0, -120, 0, -96)),
  microscope: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-90, 76, 130, 18, 9, INK) + g('rotate(-30 20 0)', rr(8, -70, 22, 110, 10, c, ST6)) + rr(-30, -84, 56, 20, 8, INK)
    + ln(-40, 80, 10, -10) + rr(-58, 30, 44, 16, 8, '#dfeaf2', ST6)),
  globe: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(0, -16, 84, '#d8eef7', ST) + `<ellipse cx="0" cy="-16" rx="38" ry="84" fill="none" ${ST6}/>` + ln(-84, -16, 84, -16)
    + path('M -30 -60 Q -10 -40 -34 -16 Q -14 4 -28 30', 'none', `stroke="${'#8ab17d'}" stroke-width="10"`)
    + ln(-30, 68, 30, 68) + ln(0, 68, 0, 92)),
  apple: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M 0 -40 C -60 -84 -96 -12 -70 38 C -48 82 -18 76 0 60 C 18 76 48 82 70 38 C 96 -12 60 -84 0 -40 Z', '#ef6f6c', ST)
    + ln(0, -44, 6, -78) + path('M 10 -70 Q 40 -84 44 -58 Q 24 -52 10 -70 Z', '#8ab17d', ST6)),
  pencil: (x, y, s, c) => g(`translate(${x} ${y}) rotate(-35) scale(${s})`,
    poly('0 -96 20 -96 20 60 0 96 -20 60 -20 -96', '#ffd972', ST) + poly('0 96 20 60 -20 60', '#f2c9a0', ST6) + rr(-20, -96, 40, 26, 6, c, ST6)),
  atom: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    [0, 60, 120].map((a) => g(`rotate(${a})`, `<ellipse cx="0" cy="0" rx="92" ry="34" fill="none" ${ST6}/>`)).join('') + circ(0, 0, 16, c, ST)),
  dna: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    [0, 1, 2, 3, 4].map((k) => { const yy = -80 + k * 40; const off = k % 2 ? 26 : -26
      return path(`M ${-off} ${yy - 20} Q 0 ${yy} ${off} ${yy + 20}`, 'none', `stroke="${c}" stroke-width="8" fill="none"`)
        + path(`M ${off} ${yy - 20} Q 0 ${yy} ${-off} ${yy + 20}`, 'none', `stroke="#f4a261" stroke-width="8" fill="none"`) }).join('')),
  telescope: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    g('rotate(-28)', rr(-18, -96, 36, 110, 12, c, ST) + rr(-26, -110, 52, 22, 8, INK))
    + ln(-40, 60, 40, 60) + ln(-22, 20, -40, 60) + ln(22, 20, 40, 60)),
  sprout: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(0, 80, 0, -20) + path('M 0 0 Q -52 -10 -58 -56 Q -10 -52 0 0 Z', '#8ab17d', ST6) + path('M 0 -24 Q 48 -34 54 -78 Q 8 -72 0 -24 Z', c, ST6)
    + rr(-30, 80, 60, 20, 8, INK)),
  robot: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-64, -64, 128, 100, 18, c, ST) + circ(-24, -20, 10, INK) + circ(24, -20, 10, INK) + rr(-26, 8, 52, 10, 5, INK)
    + ln(-40, -64, -40, -92) + circ(-40, -98, 8, '#ffd972', ST6) + ln(-64, -10, -92, 14) + ln(64, -10, 92, 14)
    + rr(-40, 36, 24, 44, 8, INK) + rr(16, 36, 24, 44, 8, INK)),
  circuit: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-100, -80, 200, 160, 12, '#16324a', ST)
    + [ [-60, -40], [20, -40], [-20, 20], [50, 30] ].map(([xx, yy], i) => ln(xx, yy, [ -10, 70, 30, 80 ][i], yy, 'stroke="#6cb4d8" stroke-width="6"') + circ(xx, yy, 8, c)).join('')
    + rr(-72, -60, 26, 26, 4, c) + rr(40, 8, 26, 26, 4, '#f4a261')),
  chip: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    [-70, -35, 0, 35, 70].map((xx) => rr(xx - 6, -104, 12, 28, 4, INK) + rr(xx - 6, 76, 12, 28, 4, INK)).join('')
    + [-70, -35, 0, 35, 70].map((yy) => rr(-104, yy - 6, 28, 12, 4, INK) + rr(76, yy - 6, 28, 12, 4, INK)).join('')
    + rr(-66, -66, 132, 132, 16, c, ST) + circ(0, 0, 24, '#fff', ST6)),
  clouddata: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    P.cloud(-20, -40, 0.9, c) + rr(-36, 12, 72, 72, 12, '#3d5a80', ST6) + ln(-36, 36, 36, 36) + ln(-36, 60, 36, 60)),
  cloud: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(-44, 12, 34, '#fff', ST) + circ(0, -8, 46, '#fff', ST) + circ(46, 12, 32, '#fff', ST) + rr(-76, 10, 152, 40, 20, '#fff', ST)),
  satellite: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-34, -34, 68, 68, 12, c, ST) + rr(-104, -22, 60, 44, 6, '#3d5a80', ST6) + rr(44, -22, 60, 44, 6, '#3d5a80', ST6)
    + ln(0, 34, 0, 72) + poly('-14 78 0 100 14 78', '#ef6f6c', ST6) + ln(-34, -34, -52, -52) + circ(-58, -58, 7, '#ffd972')),
  vr: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-96, -48, 192, 96, 30, c, ST) + rr(-70, -30, 56, 60, 18, '#eef3f8', ST6) + rr(14, -30, 56, 60, 18, '#eef3f8', ST6)
    + ln(-96, -20, -120, -34) + ln(96, -20, 120, -34)),
  code: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-104, -76, 208, 152, 14, '#16324a', ST) + rr(-104, -76, 208, 30, 14, '#3d5a80') + circ(-80, -61, 7, '#ef6f6c') + circ(-56, -61, 7, '#ffd972') + circ(-32, -61, 7, '#8ab17d')
    + poly('-46 -8 -20 18 -46 44', 'none', 'stroke="#6cb4d8" stroke-width="8" fill="none"') + poly('46 -8 20 18 46 44', 'none', 'stroke="#6cb4d8" stroke-width="8" fill="none"') + ln(-8, 44, 8, -8, 'stroke="#f4a261" stroke-width="8"')),
  stethoscope: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(-40, -84, -40, -30) + ln(40, -84, 40, -30) + path('M -40 -30 Q -40 40 0 40 Q 40 40 40 -30', 'none', ST)
    + circ(0, 66, 24, c, ST6) + ln(0, 40, 0, 44) + circ(-40, -88, 8, c, ST6) + circ(40, -88, 8, c, ST6)),
  heart: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M 0 78 C -80 24 -84 -40 -40 -56 C -16 -64 0 -46 0 -30 C 0 -46 16 -64 40 -56 C 84 -40 80 24 0 78 Z', c, ST)
    + poly('-40 4 -16 30 48 -34', 'none', 'stroke="#fff" stroke-width="9" fill="none"')),
  bottle: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-22, -96, 44, 28, 8, INK) + rr(-34, -68, 68, 30, 10, c, ST6) + path('M -44 -38 L -44 76 Q -44 96 -24 96 H 24 Q 44 96 44 76 L 44 -38 Z', '#fff', ST)
    + rr(-14, -8, 28, 36, 6, c, ST6)),
  hospital: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-96, -70, 192, 160, 12, '#fff', ST) + rr(-20, -100, 40, 32, 8, c, ST6)
    + rr(-8, -58, 16, 40, 4, c) + rr(-20, -46, 40, 16, 4, c)
    + rr(-70, 24, 30, 30, 6, '#dfeaf2', ST6) + rr(40, 24, 30, 30, 6, '#dfeaf2', ST6)),
  shield: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M 0 -92 L 80 -60 V 8 Q 80 60 0 96 Q -80 60 -80 8 V -60 Z', c, ST)
    + rr(-10, -52, 20, 56, 6, '#fff') + rr(-28, -34, 56, 20, 6, '#fff')),
  tooth: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -64 -56 Q -70 -92 -28 -88 Q 0 -84 28 -88 Q 70 -92 64 -56 Q 56 0 44 44 Q 32 84 18 50 Q 0 18 -18 50 Q -32 84 -44 44 Q -56 0 -64 -56 Z', '#fff', ST)),
  flask: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-18, -96, 36, 30, 8, INK) + path('M -30 -66 H 30 L 30 -40 L 70 60 Q 80 92 46 92 H -46 Q -80 92 -70 60 L -30 -40 Z', '#fff', ST)
    + path('M -58 30 L 58 30 L 70 60 Q 80 92 46 92 H -46 Q -80 92 -70 60 Z', c)),
  brush: (x, y, s, c) => g(`translate(${x} ${y}) rotate(-30) scale(${s})`,
    rr(-14, -90, 28, 96, 8, c, ST6) + rr(-22, 6, 44, 26, 8, '#9aa7b1', ST6) + path('M -22 32 L 22 32 L 12 86 L -12 86 Z', '#8d5a3b', ST6)),
  sculpture: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-60, 60, 120, 26, 8, INK) + rr(-44, 10, 88, 52, 10, c, ST6) + circ(0, -34, 34, c, ST6) + rr(-12, -76, 24, 26, 8, c, ST6)),
  gallery: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-120, -78, 240, 156, 12, '#fff', ST)
    + rr(-96, -54, 64, 70, 6, c, ST6) + rr(-14, -54, 64, 70, 6, '#f4a261', ST6) + rr(68, -54, 36, 70, 6, '#8ab17d', ST6)),
  note: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    `<ellipse cx="-26" cy="62" rx="30" ry="22" fill="${c}" ${ST}/>` + rr(0, -70, 12, 132, 6, INK)
    + path('M 12 -70 Q 66 -66 66 -26 L 12 -30 Z', c, ST)),
  masks: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    g('translate(-52 0)', circ(0, 0, 52, c, ST6) + circ(-16, -10, 5, INK) + circ(16, -10, 5, INK) + path('M -16 18 Q 0 30 16 18', 'none', ST6))
    + g('translate(56 6)', circ(0, 0, 46, '#f4a261', ST6) + circ(-14, -8, 5, INK) + circ(14, -8, 5, INK) + path('M -14 22 Q 0 10 14 22', 'none', ST6))),
  vase: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -26 -84 H 26 L 20 -40 Q 64 10 44 72 Q 34 96 0 96 Q -34 96 -44 72 Q -64 10 -20 -40 Z', c, ST)
    + ln(-26, -56, 26, -56) + circ(0, 20, 14, '#fff', 'opacity="0.5"')),
  lantern: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    ln(0, -100, 0, -84) + rr(-26, -84, 52, 14, 6, INK) + rr(-46, -70, 92, 110, 34, c, ST) + rr(-26, 40, 52, 14, 6, INK)
    + ln(0, 54, 0, 84) + poly('-10 84 10 84 0 104', '#f4a261', ST6) + ln(-30, -40, 30, -40, 'stroke="#fff"') + ln(-30, 0, 30, 0, 'stroke="#fff"')),
  temple: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    poly('0 -100 96 -56 -96 -56', c, ST) + poly('0 -64 80 -28 -80 -28', c, ST6)
    + [-56, 0, 56].map((xx) => rr(xx - 12, -28, 24, 92, 6, '#fff', ST6)).join('') + rr(-84, 64, 168, 18, 8, INK)),
  scroll: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-70, -84, 140, 168, 10, '#fff', ST) + circ(-70, 0, 18, c, ST6) + circ(70, 0, 18, c, ST6)
    + ln(-40, -40, 40, -40) + ln(-40, -8, 40, -8) + ln(-40, 24, 20, 24)),
  teacup: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -64 -34 H 44 L 34 56 Q 28 80 0 80 H -20 Q -48 80 -54 56 Z', '#fff', ST)
    + path('M 44 -20 Q 84 -20 80 18 Q 76 46 42 44', 'none', ST6)
    + ln(-30, -70, -30, -46) + ln(0, -78, 0, -50) + rr(-80, 82, 160, 14, 7, c)),
  dance: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    g('translate(-8 30) scale(0.8)', person({ pose: 'wave', shirt: c, hair: 'long' }))
    + path('M 40 -70 Q 96 -40 60 10 Q 36 44 84 58', 'none', `stroke="${'#ef6f6c'}" stroke-width="8" fill="none"`)),
  museum: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    poly('0 -100 110 -52 -110 -52', c, ST) + [-66, -22, 22, 66].map((xx) => rr(xx - 14, -52, 28, 108, 6, '#fff', ST6)).join('')
    + rr(-100, 56, 200, 22, 8, INK) + rr(-116, 78, 232, 16, 8, '#3d5a80')),
  airplane: (x, y, s, c) => g(`translate(${x} ${y}) rotate(-18) scale(${s})`,
    path('M 0 -96 L 18 -10 L 90 30 L 90 48 L 18 34 L 12 84 L 34 100 L 34 112 L 0 104 L -34 112 L -34 100 L -12 84 L -18 34 L -90 48 L -90 30 L -18 -10 Z', c, ST)),
  suitcase: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-86, -44, 172, 128, 16, c, ST) + path('M -30 -44 Q -30 -80 0 -80 Q 30 -80 30 -44', 'none', ST6)
    + ln(-86, 10, 86, 10) + circ(-46, 92, 10, INK) + circ(46, 92, 10, INK)),
  passport: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-80, -100, 160, 200, 14, c, ST) + circ(0, -26, 38, '#ffd972', ST6) + `<ellipse cx="0" cy="-26" rx="17" ry="38" fill="none" ${ST6}/>`
    + ln(-44, 40, 44, 40) + ln(-44, 62, 24, 62)),
  beach: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(-56, -60, 30, '#ffd972', ST6) + rr(-120, 30, 240, 26, 0, '#6cb4d8') + rr(-120, 56, 240, 44, 0, '#f4d8a8')
    + ln(64, 60, 64, -30) + path('M 64 -30 Q 20 -52 14 -84 Q 52 -72 64 -30 Z', '#8ab17d', ST6) + path('M 64 -30 Q 104 -48 108 -80 Q 78 -70 64 -30 Z', '#8ab17d', ST6)),
  mountain: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(56, -66, 26, '#ffd972') + poly('-110 70 -30 -48 30 20 70 -24 116 70', c, ST)
    + poly('-30 -48 -6 -16 -44 -10', '#fff') + rr(-120, 70, 240, 18, 8, INK)),
  pin: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M 0 -96 C 48 -96 76 -60 76 -20 C 76 24 20 70 0 96 C -20 70 -76 24 -76 -20 C -76 -60 -48 -96 0 -96 Z', c, ST)
    + circ(0, -24, 24, '#fff', ST6)),
  chefhat: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(-40, -28, 34, '#fff', ST) + circ(0, -48, 42, '#fff', ST) + circ(42, -26, 34, '#fff', ST) + rr(-72, -20, 144, 40, 14, '#fff', ST)
    + rr(-66, 20, 132, 30, 8, c, ST6)),
  plate: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    `<ellipse cx="0" cy="34" rx="104" ry="26" fill="#fff" ${ST}/>` + circ(0, 10, 52, c, ST6) + circ(0, 2, 20, '#fff', 'opacity="0.6"')
    + ln(-120, -20, -120, 60) + g('translate(118 20)', P.fork(0, 0, 0.8))),
  fork: (x, y, s) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-4, -40, 8, 84, 4, INK) + [-12, -4, 4, 12].map((xx) => rr(xx - 3, -66, 6, 30, 3, INK)).join('')),
  coffee: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -58 -20 H 40 L 30 60 Q 24 80 0 80 H -18 Q -42 80 -48 60 Z', c, ST)
    + path('M 40 -8 Q 74 -8 70 24 Q 66 48 36 46', 'none', ST6)
    + ln(-26, -56, -26 -32) + ln(2, -62, 2, -36) + rr(-72, 82, 140, 14, 7, INK)),
  restaurant: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, 10, 220, 18, 9, INK) + ln(-84, 28, -84, 88) + ln(84, 28, 84, 88)
    + g('translate(-40 -28)', P.plate(0, 0, 0.55, c)) + rr(36, -34, 30, 44, 8, '#fff', ST6) + ln(40, -48, 68, -20)),
  ingredients: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(-52, 8, 40, '#ef6f6c', ST) + g('translate(24 -8) scale(0.8)', P.sprout(0, 0, 1, c)) + circ(58, 34, 26, '#ffd972', ST6)),
  cupcake: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -56 0 L 56 0 L 38 84 H -38 Z', '#9aa7b1', ST) + path('M -64 0 Q -64 -56 -20 -50 Q -8 -84 16 -58 Q 56 -66 64 -22 Q 66 0 56 0 Z', c, ST) + circ(0, -66, 12, '#ef6f6c', ST6)),
  storefront: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-100, -30, 200, 110, 10, '#fff', ST) + path('M -112 -30 L 0 -92 L 112 -30 Z', c, ST)
    + [-72, -24, 24, 72].map((xx) => g('', rr(xx - 4, -56, 24, 30, 6, ['#fff', '#f4a261', '#fff', '#f4a261'][ [ -72, -24, 24, 72 ].indexOf(xx)], ST6))).join('')
    + rr(-18, 14, 36, 66, 6, c, ST6) + rr(44, 4, 36, 34, 6, '#dfeaf2', ST6)),
  cart: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    path('M -84 -76 H -52 L -30 30 H 64 L 84 -44 H -40', 'none', ST) + circ(-20, 66, 16, INK) + circ(60, 66, 16, INK)
    + rr(-66, -58, 30, 26, 6, c, ST6) + rr(-24, -58, 30, 26, 6, '#f4a261', ST6)),
  gift: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-78, -40, 156, 110, 10, c, ST) + rr(-12, -40, 24, 110, 4, '#ffd972') + rr(-78, -14, 156, 20, 4, '#ffd972')
    + path('M -12 -40 Q -48 -88 -24 -92 Q -4 -90 -12 -40', 'none', ST6) + path('M 12 -40 Q 48 -88 24 -92 Q 4 -90 12 -40', 'none', ST6)),
  tag: (x, y, s, c) => g(`translate(${x} ${y}) rotate(-12) scale(${s})`,
    poly('-80 -60 30 -60 86 0 30 60 -80 60', c, ST) + circ(-40, 0, 12, '#fff', ST6)),
  mannequin: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    circ(0, -78, 22, '#fff', ST6) + path('M 0 -56 L 0 20', 'none', ST6) + path('M -52 -30 Q 0 -12 52 -30 L 34 56 H -34 Z', c, ST6) + ln(0, 56, 0, 92)),
  parcel: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    poly('0 -84 84 -42 0 0 -84 -42', c, ST) + poly('0 0 84 -42 84 44 0 88', '#f4a261', ST) + poly('0 0 -84 -42 -84 44 0 88', '#e08a3c', ST)
    + rr(-8, -84, 16, 172, 4, INK)),
  building: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-70, -96, 140, 180, 10, c, ST) + poly('-70 -96 0 -128 70 -96', '#3d5a80', ST6)
    + [-40, 0, 40].map((xx) => [-56, -10, 36].map((yy) => rr(xx - 12, yy, 24, 26, 4, '#ffd972'))).join('') + rr(-16, 50, 32, 34, 6, INK)),
  crane: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-10, -20, 20, 110, 6, INK) + ln(0, -20, 100, -60) + ln(0, -20, -70, -2)
    + [20, 50, 80].map((xx) => ln(xx, [-28, -40, -52][ [20, 50, 80].indexOf(xx)], xx, -12)).join('')
    + ln(100, -60, 100, -10) + poly('88 -10 112 -10 100 14', c, ST6)),
  skyline: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, -20, 44, 100, 6, c, ST6) + rr(-52, -60, 44, 140, 6, '#3d5a80', ST6) + rr(6, -34, 44, 114, 6, '#f4a261', ST6) + rr(60, -6, 44, 86, 6, '#8ab17d', ST6)
    + rr(-120, 80, 240, 14, 6, INK)),
  interior: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-110, -84, 90, 90, 8, '#dfeaf2', ST6) + poly('-110 -84 -65 -110 -20 -84', '#6cb4d8', ST6)
    + rr(-10, 30, 120, 44, 14, c, ST) + rr(6, 38, 30, 22, 6, '#fff', ST6) + rr(46, 38, 30, 22, 6, '#fff', ST6)
    + g('translate(96 24)', P.sprout(0, 0, 0.55, '#8ab17d'))),
  bridge: (x, y, s, c) => g(`translate(${x} ${y}) scale(${s})`,
    rr(-120, 40, 240, 18, 8, INK) + rr(-86, -60, 22, 100, 6, c, ST6) + rr(64, -60, 22, 100, 6, c, ST6)
    + path('M -76 -56 Q 0 -110 76 -56', 'none', ST6)
    + [-50, -25, 0, 25, 50].map((xx) => ln(xx, [-76, -94, -100, -94, -76][ [ -50, -25, 0, 25, 50 ].indexOf(xx)], xx, 40, 'stroke-width="5"')).join('')),
}

/* ---------------- 场景：道具 + 人物组合 ---------------- */
function withPerson(key, propName, opts = {}) {
  const seed = hash(key)
  const r = rng(seed)
  const c = pick(r, ACCENTS)
  const left = opts.flip === false
  const propX = left ? 520 : 280
  const personX = left ? 280 : 520
  return g(`translate(${personX} 470) scale(0.95)`, person({
    skin: pick(r, SKIN), shirt: pick(r, SHIRTS), pants: pick(r, PANTS),
    hair: pick(r, ['short', 'wavy', 'slick', 'cap', 'bob', 'bun', 'curly', 'long', 'ponytail', 'bald']),
    hairColor: pick(r, HAIR), eyeColor: pick(r, EYES),
    pose: opts.pose || 'stand', glasses: r() > 0.7, freckles: r() > 0.75,
    beard: r() > 0.7 ? pick(r, ['stubble', 'full', 'mustache']) : 'none',
    smile: r() > 0.5 ? 'open' : 'smile',
  })) + P[propName](propX, 330, 1, c)
}
function propOnly(key, propName, scale = 1) {
  const r = rng(hash(key))
  return P[propName](400, 320, scale, pick(r, ACCENTS))
}

const SCENES = {
  'course.book': (k) => propOnly(k, 'book', 1.25),
  'course.lightbulb': (k) => propOnly(k, 'bulb', 1.25),
  'course.classroom': (k) => withPerson(k, 'board'),
  'course.online': (k) => propOnly(k, 'laptop', 1.3),
  'course.board': (k) => propOnly(k, 'board', 1.2),
  'course.notebook': (k) => propOnly(k, 'notebook', 1.2),
  'course.cap': (k) => propOnly(k, 'gradcap', 1.3),
  'course.quiz': (k) => propOnly(k, 'quiz', 1.25),
  'course.workshop': (k) => withPerson(k, 'gear', { pose: 'hold' }),
  'course.video': (k) => propOnly(k, 'video', 1.3),
  'proposal.handshake': (k) => propOnly(k, 'handshake', 1.3),
  'proposal.blueprint': (k) => propOnly(k, 'blueprint', 1.15),
  'proposal.target': (k) => propOnly(k, 'target', 1.2),
  'proposal.sign': (k) => propOnly(k, 'signdoc', 1.15),
  'proposal.meeting': (k) => propOnly(k, 'meeting', 1.15),
  'proposal.strategy': (k) => propOnly(k, 'stratboard', 1.15),
  'proposal.compass': (k) => propOnly(k, 'compass', 1.25),
  'proposal.checklist': (k) => propOnly(k, 'checklist', 1.2),
  'report.chart': (k) => propOnly(k, 'bars', 1.25),
  'report.clipboard': (k) => propOnly(k, 'clipboard', 1.2),
  'report.analytics': (k) => propOnly(k, 'analytics', 1.15),
  'report.document': (k) => propOnly(k, 'doc', 1.2),
  'report.magnifier': (k) => propOnly(k, 'magnifier', 1.25),
  'report.dashboard': (k) => propOnly(k, 'dashboard', 1.1),
  'funding.rocket': (k) => propOnly(k, 'rocket', 1.2),
  'funding.growth': (k) => propOnly(k, 'trend', 1.25),
  'funding.piggy': (k) => propOnly(k, 'piggy', 1.25),
  'funding.investor': (k) => withPerson(k, 'trend'),
  'funding.trend': (k) => propOnly(k, 'trend', 1.25),
  'funding.coins': (k) => propOnly(k, 'coins', 1.2),
  'marketing.megaphone': (k) => propOnly(k, 'megaphone', 1.25),
  'marketing.mobile': (k) => propOnly(k, 'phone', 1.25),
  'marketing.coupon': (k) => propOnly(k, 'coupon', 1.2),
  'marketing.social': (k) => propOnly(k, 'chat', 1.25),
  'marketing.bag': (k) => propOnly(k, 'bag', 1.25),
  'marketing.campaign': (k) => propOnly(k, 'flag', 1.25),
  'training.mentor': (k) => propOnly(k, 'mentor', 1.05),
  'training.gears': (k) => propOnly(k, 'gear', 1.25),
  'training.path': (k) => propOnly(k, 'pathmap', 1.15),
  'training.certificate': (k) => propOnly(k, 'certificate', 1.15),
  'training.elearning': (k) => propOnly(k, 'laptop', 1.2),
  'training.practice': (k) => withPerson(k, 'target', { pose: 'point' }),
  'planning.chess': (k) => propOnly(k, 'chess', 1.2),
  'planning.roadmap': (k) => propOnly(k, 'signpost', 1.2),
  'planning.orgchart': (k) => propOnly(k, 'orgchart', 1.15),
  'planning.calendar': (k) => propOnly(k, 'calendar', 1.2),
  'planning.briefcase': (k) => propOnly(k, 'briefcase', 1.2),
  'event.stage': (k) => propOnly(k, 'stage', 1.1),
  'event.confetti': (k) => propOnly(k, 'confetti', 1.2),
  'event.ticket': (k) => propOnly(k, 'ticket', 1.2),
  'event.calendar': (k) => propOnly(k, 'calendar', 1.2),
  'event.balloon': (k) => propOnly(k, 'balloon', 1.25),
  'event.venue': (k) => propOnly(k, 'venue', 1.15),
  'portfolio.palette': (k) => propOnly(k, 'palette', 1.25),
  'portfolio.camera': (k) => propOnly(k, 'camera', 1.2),
  'portfolio.grid': (k) => propOnly(k, 'grid4', 1.2),
  'portfolio.desk': (k) => propOnly(k, 'desk', 1.1),
  'portfolio.frame': (k) => propOnly(k, 'frame', 1.2),
  'brand.mark': (k) => propOnly(k, 'hexmark', 1.25),
  'brand.guide': (k) => propOnly(k, 'guidebook', 1.15),
  'brand.swatches': (k) => propOnly(k, 'swatches', 1.2),
  'brand.type': (k) => propOnly(k, 'typeA', 1.1),
  'brand.packaging': (k) => propOnly(k, 'package', 1.2),
  'edu.bee': (k) => propOnly(k, 'bee', 1.35),
  'edu.butterfly': (k) => propOnly(k, 'butterfly', 1.3),
  'edu.flower': (k) => propOnly(k, 'flower', 1.25),
  'edu.hive': (k) => propOnly(k, 'hive', 1.25),
  'edu.microscope': (k) => propOnly(k, 'microscope', 1.2),
  'edu.globe': (k) => propOnly(k, 'globe', 1.2),
  'edu.apple': (k) => propOnly(k, 'apple', 1.25),
  'edu.pencil': (k) => propOnly(k, 'pencil', 1.25),
  'edu.atom': (k) => propOnly(k, 'atom', 1.25),
  'edu.dna': (k) => propOnly(k, 'dna', 1.25),
  'edu.telescope': (k) => propOnly(k, 'telescope', 1.2),
  'edu.sprout': (k) => propOnly(k, 'sprout', 1.3),
  'tech.robot': (k) => propOnly(k, 'robot', 1.25),
  'tech.circuit': (k) => propOnly(k, 'circuit', 1.2),
  'tech.chip': (k) => propOnly(k, 'chip', 1.2),
  'tech.cloud': (k) => propOnly(k, 'clouddata', 1.2),
  'tech.phone': (k) => propOnly(k, 'phone', 1.25),
  'tech.satellite': (k) => propOnly(k, 'satellite', 1.25),
  'tech.vr': (k) => propOnly(k, 'vr', 1.25),
  'tech.code': (k) => propOnly(k, 'code', 1.2),
  'health.stethoscope': (k) => propOnly(k, 'stethoscope', 1.25),
  'health.heart': (k) => propOnly(k, 'heart', 1.25),
  'health.doctor': (k) => withPerson(k, 'bottle'),
  'health.medicine': (k) => propOnly(k, 'bottle', 1.25),
  'health.hospital': (k) => propOnly(k, 'hospital', 1.2),
  'health.shield': (k) => propOnly(k, 'shield', 1.25),
  'health.tooth': (k) => propOnly(k, 'tooth', 1.25),
  'health.flask': (k) => propOnly(k, 'flask', 1.25),
  'art.brush': (k) => propOnly(k, 'brush', 1.3),
  'art.sculpture': (k) => propOnly(k, 'sculpture', 1.2),
  'art.gallery': (k) => propOnly(k, 'gallery', 1.15),
  'art.music': (k) => propOnly(k, 'note', 1.3),
  'art.masks': (k) => propOnly(k, 'masks', 1.25),
  'art.pottery': (k) => propOnly(k, 'vase', 1.25),
  'culture.lantern': (k) => propOnly(k, 'lantern', 1.25),
  'culture.temple': (k) => propOnly(k, 'temple', 1.2),
  'culture.scroll': (k) => propOnly(k, 'scroll', 1.2),
  'culture.tea': (k) => propOnly(k, 'teacup', 1.25),
  'culture.dance': (k) => propOnly(k, 'dance', 1.1),
  'culture.museum': (k) => propOnly(k, 'museum', 1.15),
  'travel.airplane': (k) => propOnly(k, 'airplane', 1.25),
  'travel.suitcase': (k) => propOnly(k, 'suitcase', 1.25),
  'travel.passport': (k) => propOnly(k, 'passport', 1.2),
  'travel.beach': (k) => propOnly(k, 'beach', 1.15),
  'travel.mountain': (k) => propOnly(k, 'mountain', 1.2),
  'travel.camera': (k) => propOnly(k, 'camera', 1.2),
  'travel.pin': (k) => propOnly(k, 'pin', 1.3),
  'food.chef': (k) => propOnly(k, 'chefhat', 1.3),
  'food.plate': (k) => propOnly(k, 'plate', 1.2),
  'food.coffee': (k) => propOnly(k, 'coffee', 1.25),
  'food.table': (k) => propOnly(k, 'restaurant', 1.1),
  'food.ingredients': (k) => propOnly(k, 'ingredients', 1.2),
  'food.dessert': (k) => propOnly(k, 'cupcake', 1.25),
  'retail.storefront': (k) => propOnly(k, 'storefront', 1.15),
  'retail.cart': (k) => propOnly(k, 'cart', 1.2),
  'retail.gift': (k) => propOnly(k, 'gift', 1.25),
  'retail.tag': (k) => propOnly(k, 'tag', 1.3),
  'retail.boutique': (k) => propOnly(k, 'mannequin', 1.2),
  'retail.parcel': (k) => propOnly(k, 'parcel', 1.25),
  'arch.building': (k) => propOnly(k, 'building', 1.2),
  'arch.blueprint': (k) => propOnly(k, 'blueprint', 1.15),
  'arch.crane': (k) => propOnly(k, 'crane', 1.2),
  'arch.skyline': (k) => propOnly(k, 'skyline', 1.15),
  'arch.interior': (k) => propOnly(k, 'interior', 1.1),
  'arch.bridge': (k) => propOnly(k, 'bridge', 1.15),
  'shared.teamwork': (k) => withPerson(k, 'gear', { pose: 'hold' }),
  'shared.growth': (k) => propOnly(k, 'sprout', 1.3),
}

/* ---------------- 专属：手绘地图 / 标志墙 ---------------- */
function mapScene(seed) {
  const r = rng(seed)
  const c = pick(r, ACCENTS)
  let s = rr(70, 60, 660, 470, 26, '#f7e9c9', ST)
  // 折角
  s += path('M 660 60 L 730 130 L 660 130 Z', '#e6d3a8', ST6)
  // 虚线路径
  s += path('M 150 440 Q 260 300 240 200 Q 230 120 380 140 Q 520 156 560 280 Q 590 380 660 360', 'none', `stroke="${c}" stroke-width="10" stroke-dasharray="18 14" fill="none"`)
  // 地标
  s += g('translate(240 200)', P.pin(0, 0, 0.7, '#ef6f6c'))
  s += g('translate(560 280)', P.pin(0, 0, 0.7, c))
  // 山川与树
  s += poly('420 380 470 300 520 380', '#8ab17d', ST6) + poly('470 300 488 326 456 322', '#fff')
  s += g('translate(180 160)', P.sprout(0, 0, 0.5, '#8ab17d')) + g('translate(620 200)', P.sprout(0, 0, 0.45, '#8ab17d'))
  // 罗盘
  s += circ(660, 460, 40, '#fff', ST6) + poly('660 430 672 462 660 454 648 462', c, ST6)
  // 波浪
  s += [120, 180, 240].map((xx) => path(`M ${xx} 492 q 14 -12 28 0`, 'none', `stroke="${'#6cb4d8'}" stroke-width="6" fill="none"`)).join('')
  return s
}
function logoWallScene(seed) {
  const r = rng(seed)
  const cells = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 170 + col * 154, y = 200 + row * 130
      const c = ACCENTS[(row * 4 + col) % ACCENTS.length]
      cells.push(circ(x, y, 46, '#ffffff', ST6))
      const variant = (row * 4 + col) % 4
      if (variant === 0) cells.push(poly(`${x} ${y - 20} ${x + 18} ${y + 14} ${x - 18} ${y + 14}`, c))
      if (variant === 1) cells.push(circ(x, y, 16, c))
      if (variant === 2) cells.push(rr(x - 16, y - 16, 32, 32, 8, c))
      if (variant === 3) cells.push(path(`M ${x - 16} ${y + 12} L ${x} ${y - 16} L ${x + 16} ${y + 12} Z`, c))
    }
  }
  return cells.join('')
}

/* ---------------- 生成 ---------------- */
async function main() {
  await mkdir(OUT, { recursive: true })
  const keys = Object.keys(ART_CONCEPTS)
  const missing = []
  for (const key of keys) {
    const seed = hash(key)
    let inner
    if (key.startsWith('shared.portrait.')) inner = bust(seed, key)
    else if (key === 'shared.map') inner = mapScene(seed)
    else if (key === 'shared.logowall') inner = logoWallScene(seed)
    else {
      const fn = SCENES[key]
      if (!fn) { missing.push(key); continue }
      inner = fn(key)
    }
    await writeFile(join(OUT, `${key}.svg`), svgDoc(backdrop(seed) + inner))
  }
  if (missing.length) throw new Error(`场景未覆盖：${missing.join(', ')}`)

  let manifest
  try { manifest = JSON.parse(await readFile(MANIFEST, 'utf8')) } catch { manifest = { version: 1, concepts: {} } }
  manifest.version = 2
  manifest.generatedAt = new Date().toISOString()
  manifest.concepts ||= {}
  for (const key of keys) {
    manifest.concepts[key] ||= {}
    manifest.concepts[key].illustration = {
      src: `/art/illustration/${key}.svg`,
      author: 'Design Buddy',
      license: 'CC0 1.0',
      provider: 'inline-svg',
      sourceUrl: '',
    }
  }
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2))
  console.log(`[make-art] 生成 ${keys.length} 张原创绘本插画 → ${OUT}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
