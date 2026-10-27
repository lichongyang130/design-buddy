// Public model identifiers only. Never put API credentials in this file.
// These are DeepSeek compatibility presets, NOT a successful connectivity test.
// Actual account availability is determined by authenticated discovery.
export const MODEL_BASE_URL = 'https://api.deepseek.com/v1'
export const MODEL_DISCOVERED_AT = null
export const CONFIGURED_MODELS = [
  {id:'deepseek-chat',verified:false,latencyMs:null},
  {id:'deepseek-reasoner',verified:false,latencyMs:null},
]
export const AVAILABLE_MODELS = []
export const SELECTABLE_MODELS = AVAILABLE_MODELS.length ? AVAILABLE_MODELS : CONFIGURED_MODELS
