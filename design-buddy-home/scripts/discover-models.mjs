/* ============================================================
   大模型自动发现 + 可用性实测 + 写死配置
   ------------------------------------------------------------
   用法（在能访问 discovery-api 的网络环境运行）：
     LLM_API_KEY=sk-xxxx npm run discover-models
     node scripts/discover-models.mjs --key sk-xxxx
   可选参数：
     --base-url https://discovery-api.intern-ai.org.cn/v1
     --timeout 20000        单模型探测超时（毫秒）
     --out src/model-config.js
   流程：
     1. GET  {base}/models            自动获取全部模型 id
     2. POST {base}/chat/completions  每个模型发最小请求实测可用性
     3. 仅把实测通过的模型写死到 src/model-config.js（密钥绝不落盘）
   ============================================================ */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const args = process.argv.slice(2)
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : def
}

const BASE_URL = (arg('base-url') || 'https://discovery-api.intern-ai.org.cn/v1').replace(/\/+$/, '')
const API_KEY = arg('key') || process.env.LLM_API_KEY || ''
const TIMEOUT = Number(arg('timeout') || 20000)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, arg('out') || 'src/model-config.js')

if (!API_KEY) {
  console.error('✗ 缺少 API 密钥：请用 LLM_API_KEY=sk-xxx npm run discover-models 或传入 --key')
  process.exit(1)
}

const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

async function fetchJson(url, options = {}) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), TIMEOUT)
  try {
    const res = await fetch(url, { ...options, signal: ctl.signal })
    const text = await res.text()
    if (!res.ok) throw new Error(`HTTP ${res.status} ${text.slice(0, 200)}`)
    return JSON.parse(text)
  } finally {
    clearTimeout(timer)
  }
}

async function listModels() {
  console.log(`① 获取模型列表：GET ${BASE_URL}/models`)
  const data = await fetchJson(`${BASE_URL}/models`, { headers: HEADERS })
  const rows = Array.isArray(data) ? data : data.data ?? []
  const ids = rows
    .map((m) => (typeof m === 'string' ? m : m.id))
    .filter(Boolean)
  if (!ids.length) throw new Error('模型列表为空，或返回结构不是 OpenAI 风格 { data: [{ id }] }')
  console.log(`   共 ${ids.length} 个模型：${ids.join(', ')}`)
  return ids
}

async function probeModel(id) {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), TIMEOUT)
  const started = Date.now()
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        model: id,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
        stream: false,
      }),
      signal: ctl.signal,
    })
    const latencyMs = Date.now() - started
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 160).replace(/\s+/g, ' ')
      return { id, ok: false, latencyMs, error: `HTTP ${res.status} ${detail}` }
    }
    await res.json()
    return { id, ok: true, latencyMs }
  } catch (err) {
    return {
      id,
      ok: false,
      latencyMs: Date.now() - started,
      error: String(err?.message || err).slice(0, 160),
    }
  } finally {
    clearTimeout(timer)
  }
}

function writeConfig(available, testedAt) {
  const entries = available
    .map((m) => `  { id: ${JSON.stringify(m.id)}, latencyMs: ${m.latencyMs} },`)
    .join('\n')
  const body = `/* ============================================================
   可用大模型写死配置 —— 由 scripts/discover-models.mjs 自动生成
   生成时间：${testedAt}
   探测端点：${BASE_URL}
   说明：仅包含通过 chat/completions 实测的模型；API 密钥不在此落盘。
   重新探测：LLM_API_KEY=sk-xxx npm run discover-models
   ============================================================ */

export const MODEL_BASE_URL = ${JSON.stringify(BASE_URL)}

export const MODEL_DISCOVERED_AT = ${JSON.stringify(testedAt)}

// 实测可用的模型白名单（按探测延迟升序），设置 → 模型 直接消费此列表
export const AVAILABLE_MODELS = [
${entries}
]
`
  writeFileSync(OUT, body, 'utf8')
}

async function main() {
  const ids = await listModels()
  console.log(`② 逐个发起 chat/completions 最小请求实测（超时 ${TIMEOUT}ms/个）`)
  const results = []
  for (const id of ids) {
    const r = await probeModel(id)
    results.push(r)
    console.log(`   ${r.ok ? '✓' : '✗'} ${id}${r.ok ? ` (${r.latencyMs}ms)` : ` — ${r.error}`}`)
  }
  const available = results.filter((r) => r.ok).sort((a, b) => a.latencyMs - b.latencyMs)
  console.log(`③ 实测结果：${available.length}/${ids.length} 个可用`)
  if (!available.length) {
    console.error('✗ 没有任何模型通过实测，未写入配置。请检查密钥、网络或端点兼容性。')
    process.exit(2)
  }
  const testedAt = new Date().toISOString()
  writeConfig(available, testedAt)
  console.log(`✓ 已写死 ${available.length} 个可用模型 → ${OUT}`)
  console.log(`  ${available.map((m) => m.id).join(', ')}`)
}

main().catch((err) => {
  console.error('✗ 发现失败：', err?.message || err)
  process.exit(1)
})
