/* ============================================================
   可用大模型写死配置
   ------------------------------------------------------------
   本文件由 scripts/discover-models.mjs 自动探测并覆写：
     LLM_API_KEY=sk-xxxx npm run discover-models
   脚本会 GET /v1/models 获取模型名，再逐个发起 chat/completions
   最小请求实测，仅把通过的模型写入下方 AVAILABLE_MODELS。
   API 密钥只用于探测，不会写入本文件。
   ============================================================ */

export const MODEL_BASE_URL = 'https://discovery-api.intern-ai.org.cn/v1'

// 最近一次成功探测的 ISO 时间；未探测过时为 null
export const MODEL_DISCOVERED_AT = null

// 实测可用的模型白名单：[{ id, latencyMs }]，设置 → 模型 直接消费
export const AVAILABLE_MODELS = []
