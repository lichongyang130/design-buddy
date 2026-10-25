/* ============================================================
   真实配图素材管线（构建期运行，浏览器包内零密钥）
   用法：
     node scripts/asset-pipeline.mjs --dry-run            # 只打印计划，不发请求
     node scripts/asset-pipeline.mjs --provider openverse # 免密钥 CC 素材
     PIXABAY_KEY=... PEXELS_KEY=... node scripts/asset-pipeline.mjs
     node scripts/asset-pipeline.mjs --only edu.bee       # 只补单个概念
     node scripts/asset-pipeline.mjs --mode photo         # 只补真实照片
   产出：public/art/{illustration,photo,portrait}/* + public/art/manifest.json
   ============================================================ */

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ART_CONCEPTS, CONCEPT_POOLS } from '../src/art-concepts.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ART_DIR = join(ROOT, 'public', 'art')
const MANIFEST_PATH = join(ART_DIR, 'manifest.json')

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.replace(/^--/, '').split('=')
  return [k, v ?? true]
}))
const DRY = !!args['dry-run']
const ONLY = typeof args.only === 'string' ? args.only : null
const MODES = args.mode === 'photo' ? ['photo'] : args.mode === 'illustration' ? ['illustration'] : ['illustration', 'photo']
const PROVIDER = typeof args.provider === 'string' ? args.provider : null

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...a) => console.log('[asset-pipeline]', ...a)

async function loadManifest() {
  if (!existsSync(MANIFEST_PATH)) return { version: 1, generatedAt: null, concepts: {} }
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  } catch {
    return { version: 1, generatedAt: null, concepts: {} }
  }
}

/* ---------------- 提供者：均为免费可商用来源 ---------------- */

// Openverse：WordPress 旗下 CC 素材聚合，免密钥；extension=svg 取插画，jpg 取照片
async function searchOpenverse(query, mode) {
  const ext = mode === 'illustration' ? '&extension=svg' : '&extension=jpg'
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}${ext}&page_size=10&mature=false`
  const res = await fetch(url, { headers: { 'User-Agent': 'design-buddy-asset-pipeline/1.0' } })
  if (!res.ok) throw new Error(`openverse ${res.status}`)
  const json = await res.json()
  const hit = json.results?.find((r) => r.url && r.license)
  if (!hit) return null
  return {
    url: hit.url,
    author: hit.creator || 'unknown',
    license: `${hit.license}${hit.license_version ? ` ${hit.license_version}` : ''}`,
    sourceUrl: hit.foreign_landing_url || hit.url,
    provider: 'openverse',
  }
}

// Pixabay：免费 key，image_type=vector 插画 / photo 照片
async function searchPixabay(query, mode) {
  const key = process.env.PIXABAY_KEY
  if (!key) return null
  const type = mode === 'illustration' ? 'vector' : 'photo'
  const url = `https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(query)}&image_type=${type}&per_page=10&safesearch=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`pixabay ${res.status}`)
  const json = await res.json()
  const hit = json.hits?.[0]
  if (!hit) return null
  return {
    url: mode === 'illustration' ? hit.largeImageURL || hit.webformatURL : hit.webformatURL,
    author: hit.user || 'pixabay',
    license: 'Pixabay Content License',
    sourceUrl: hit.pageURL,
    provider: 'pixabay',
  }
}

// Pexels：免费 key，仅照片
async function searchPexels(query) {
  const key = process.env.PEXELS_KEY
  if (!key) return null
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10`
  const res = await fetch(url, { headers: { Authorization: key } })
  if (!res.ok) throw new Error(`pexels ${res.status}`)
  const json = await res.json()
  const hit = json.photos?.[0]
  if (!hit) return null
  return {
    url: hit.src.large || hit.src.medium,
    author: hit.photographer || 'pexels',
    license: 'Pexels License',
    sourceUrl: hit.url,
    provider: 'pexels',
  }
}

// 人物肖像：Open Peeps CC0（GitHub 托管，按槽位轮换）
const PEEP_BASE = 'https://raw.githubusercontent.com/CeamKrier/open-peeps/master/library'
async function searchPortrait(key) {
  const n = Number(key.split('.').pop()) || 1
  return {
    url: `${PEEP_BASE}/peep-${String(n).padStart(3, '0')}.svg`,
    author: 'Pablo Stanley',
    license: 'CC0 1.0',
    sourceUrl: 'https://www.openpeeps.com/',
    provider: 'openpeeps',
  }
}

async function findAsset(conceptKey, mode) {
  const { q } = ART_CONCEPTS[conceptKey]
  const providers = []
  if (conceptKey.startsWith('shared.portrait.')) {
    providers.push(() => searchPortrait(conceptKey))
  } else if (PROVIDER) {
    providers.push({ openverse: searchOpenverse, pixabay: searchPixabay, pexels: mode === 'photo' ? searchPexels : null }[PROVIDER]
      ? (mode === 'photo' && PROVIDER === 'pexels' ? () => searchPexels(q) : PROVIDER === 'openverse' ? () => searchOpenverse(q, mode) : () => searchPixabay(q, mode))
      : (() => null))
  } else {
    providers.push(() => searchOpenverse(q, mode))
    providers.push(() => searchPixabay(q, mode))
    if (mode === 'photo') providers.push(() => searchPexels(q))
  }
  for (const fn of providers) {
    try {
      const hit = await fn()
      if (hit?.url) return hit
    } catch (err) {
      log(`  provider failed (${conceptKey}/${mode}):`, err.message)
    }
  }
  return null
}

async function download(hit, conceptKey, mode) {
  const ext = (hit.url.split('?')[0].split('.').pop() || 'bin').toLowerCase().replace('jpeg', 'jpg')
  const folder = conceptKey.startsWith('shared.portrait.') ? 'portrait' : mode
  const dir = join(ART_DIR, folder)
  const file = `${conceptKey}.${ext}`
  const rel = `/art/${folder}/${file}`
  if (!DRY) {
    await mkdir(dir, { recursive: true })
    const res = await fetch(hit.url)
    if (!res.ok) throw new Error(`download ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await writeFile(join(dir, file), buf)
  }
  return { src: rel, ...hit }
}

async function main() {
  const manifest = await loadManifest()
  manifest.concepts ||= {}
  const allKeys = [...new Set([...Object.keys(ART_CONCEPTS), ...Object.values(CONCEPT_POOLS).flat()])]
  const keys = ONLY ? [ONLY] : allKeys
  if (ONLY && !ART_CONCEPTS[ONLY]) throw new Error(`未知概念 key: ${ONLY}`)

  let filled = 0
  let missing = 0
  for (const key of keys) {
    manifest.concepts[key] ||= {}
    for (const mode of MODES) {
      if (manifest.concepts[key][mode] && !ONLY) continue
      if (DRY) {
        const { q } = ART_CONCEPTS[key]
        log(`dry-run ✓ ${key}/${mode} 查询词="${q}"`)
        filled++
        continue
      }
      const hit = await findAsset(key, mode)
      if (!hit) {
        log(`✗ ${key}/${mode} 无可用素材（引擎将回退 SVG）`)
        missing++
        continue
      }
      if (DRY) {
        log(`dry-run ✓ ${key}/${mode} <- ${hit.provider} ${hit.url}`)
      } else {
        const entry = await download(hit, key, mode)
        manifest.concepts[key][mode] = entry
        log(`✓ ${key}/${mode} <- ${entry.src} (${entry.license})`)
        await sleep(250) // 礼貌限速
      }
      filled++
    }
  }

  manifest.generatedAt = new Date().toISOString()
  if (!DRY) {
    await mkdir(ART_DIR, { recursive: true })
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2))
    log(`manifest 已更新：${MANIFEST_PATH}`)
  }
  log(`完成：${filled} 个素材${DRY ? '（dry-run，未写入）' : ''}，${missing} 个缺口待补`)
}

main().catch((err) => {
  console.error('[asset-pipeline] 失败：', err)
  process.exit(1)
})
