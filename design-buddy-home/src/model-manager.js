import { uiText } from './ui-language.js'
import { modelRequest } from './models-api.js'
// Model metadata only. Never collect or persist API secrets in the browser.
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  )
const paths = {
  spark: 'm12 2 3.3 6.7L22 12l-6.7 3.3L12 22l-3.3-6.7L2 12l6.7-3.3Z',
  edit: 'm15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15v5Zm0 0h15',
  link: 'm10 14 4-4m-6 6-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0',
  trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
}
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`
export function validateModel(values, models = [], editingId = null) {
  const name = String(values.name || '').trim(),
    modelId = String(values.modelId || '').trim(),
    keyEnv = String(values.keyEnv || '').trim()
  if (!name || name.length > 150) throw Error('请填写 1–150 字的模型名称')
  if (!modelId || modelId.length > 150 || /[\s<>]/.test(modelId))
    throw Error('请填写有效的模型 ID，不能包含空格或尖括号')
  if (/^sk-/i.test(modelId)) throw Error('模型 ID 不能填写 API 密钥')
  if (!/^[A-Z_][A-Z0-9_]{0,63}$/.test(keyEnv))
    throw Error('请填写密钥环境变量名，例如 DEEPSEEK_API_KEY，不要填写真实密钥')
  let url
  try {
    url = new URL(String(values.baseURL || '').trim())
  } catch {
    throw Error('请填写完整 API 地址，例如 https://api.deepseek.com/v1')
  }
  if (url.username || url.password || url.search || url.hash)
    throw Error('API 地址不能包含密钥、账号密码、查询参数或片段')
  if (
    url.protocol !== 'https:' &&
    !(
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    )
  )
    throw Error('API 地址须使用 HTTPS；本机服务可以使用 HTTP')
  if (models.some((m) => m.uid !== editingId && m.modelId === modelId))
    throw Error('该模型 ID 已存在，请编辑现有配置')
  const tokenLimit = (value) => {
    if (value === '' || value == null) return null
    const n = Number(value)
    if (!Number.isSafeInteger(n) || n < 1)
      throw Error('输入和输出上限必须是正整数，或留空使用提供商默认值')
    return n
  }
  return {
    name,
    modelId,
    baseURL: url.href.replace(/\/+$/, ''),
    keyEnv,
    provider: 'custom',
    toolCalling: values.toolCalling !== false,
    imageInput: values.imageInput === true,
    thinking: values.thinking === true,
    customProtocol: values.customProtocol === true,
    inputLimit: tokenLimit(values.inputLimit),
    outputLimit: tokenLimit(values.outputLimit),
  }
}
export function ensureCustomModels(settings, presets, baseURL) {
  if (!Array.isArray(settings.customModels))
    settings.customModels = presets.map((m, i) => ({
      uid: `preset-${i}`,
      name: m.id,
      modelId: m.id,
      baseURL,
      keyEnv: 'DEEPSEEK_API_KEY',
      source: 'preset',
      verified: m.verified === true,
    }))
  const seen = new Set()
  settings.customModels = settings.customModels
    .filter(
      (m) =>
        m && typeof m.uid === 'string' && !seen.has(m.uid) && seen.add(m.uid),
    )
    .slice(0, 100)
    .flatMap((m) => {
      try {
        return [
          {
            ...validateModel(m),
            uid: m.uid,
            source: m.source === 'preset' ? 'preset' : 'custom',
            verified: m.verified === true,
          },
        ]
      } catch {
        return []
      }
    })
  if (!settings.customModels.some((m) => m.modelId === settings.model))
    settings.model = settings.customModels[0]?.modelId || ''
  return settings.customModels
}
export function createModelManager({
  store,
  presets,
  baseURL,
  openModal,
  confirmModal,
  downloadFile,
  toast,
  uid,
  onChange,
  language,
  setupText,
}) {
  const en = () => language() === 'English',
    say = (zh, english) => (en() ? english : uiText(zh, language()))
  const models = () =>
    ensureCustomModels(store.state.settings, presets, baseURL)
  const save = () => {
    store.save()
    onChange()
  }
  function render() {
    const rows = models()
    return `<section class="custom-models-card" aria-labelledby="custom-models-heading"><header class="custom-models-header"><div><h2 id="custom-models-heading">${say('自定义模型', 'Custom models')}</h2><p>${say('模型添加后会自动保存在当前浏览器，可导出', 'Models are saved in this browser. Export')} <button class="model-export-link" data-model-export type="button">models.json</button> ${say('文件。', 'for a local copy.')}</p></div><button class="model-add-button" data-model-add type="button">${say('添加模型', 'Add model')}</button></header><div class="custom-models-list" role="list">${rows.map((m) => `<div class="custom-model-row" role="listitem" data-model-row="${escape(m.uid)}"><button class="custom-model-name" type="button" data-model="${escape(m.modelId)}" aria-pressed="${store.state.settings.model === m.modelId}" title="${escape(m.name)}${store.state.settings.model === m.modelId ? say(' · 当前模型', ' · Selected') : ''}">${icon('spark')}<span class="custom-model-label">${escape(m.name)}</span><span class="custom-model-tag">${m.source === 'preset' ? say(m.verified ? '预置' : '预置 · 未验证', m.verified ? 'Preset' : 'Preset · not verified') : say('自定义', 'Custom')}</span></button><div class="custom-model-actions"><button data-model-edit="${escape(m.uid)}" type="button" aria-label="${say('编辑', 'Edit')} ${escape(m.name)}" title="${say('编辑', 'Edit')}">${icon('edit')}</button><button data-model-connect="${escape(m.uid)}" type="button" aria-label="${say('连接设置', 'Connection settings')} ${escape(m.name)}" title="${say('连接设置', 'Connection settings')}">${icon('link')}</button><button data-model-delete="${escape(m.uid)}" type="button" aria-label="${say('删除', 'Delete')} ${escape(m.name)}" title="${say('删除', 'Delete')}">${icon('trash')}</button></div></div>`).join('') || `<div class="custom-model-empty">${say('还没有模型，点击右上角添加你的第一项配置。', 'No models yet. Add your first configuration above.')}</div>`}</div><span class="model-sr" data-model-setup>${escape(setupText())}</span></section>`
  }
  function editor(record = null) {
    const check = (name, zh, english, fallback = false) =>
      `<label class="model-capability"><input type="checkbox" name="${name}" ${(record?.[name] ?? fallback) ? 'checked' : ''}>${say(zh, english)}</label>`
    const { bodyEl, footEl, close, mask } = openModal({
      title: say(
        record ? '编辑模型' : '添加模型',
        record ? 'Edit model' : 'Add model',
      ),
      body: `<form id="custom-model-form" class="custom-model-form model-screenshot-form">
        <label class="model-provider-field">${say('供应商（仅支持 OpenAI 兼容协议 API）', 'Provider (OpenAI-compatible APIs only)')}<span class="model-provider-control">${icon('spark')}<select name="provider"><option value="custom">${say('自定义', 'Custom')}</option></select><svg class="model-provider-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m5 6 3 3 3-3"/></svg></span></label>
        <label>${say('接口地址', 'Endpoint URL')}<input name="baseURL" type="url" required value="${escape(record?.baseURL || '')}" placeholder="https://api.example.com/v1/chat/completions" autocomplete="off"></label>
        <div class="model-key-field"><label for="model-api-key">API Key</label><div class="model-key-row"><div class="model-key-control"><input id="model-api-key" name="apiKey" type="password" placeholder="${say('输入你的 API Key', 'Enter your API Key')}" autocomplete="new-password" spellcheck="false" autocapitalize="off"><button type="button" class="model-key-toggle" aria-label="${say('显示 API Key', 'Show API Key')}" aria-pressed="false"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"/><circle cx="10" cy="10" r="2"/></svg></button></div><button type="button" class="model-test-button" data-model-test>${say('测试连接', 'Test connection')}</button></div><p class="model-test-status" role="status" data-model-test-status hidden></p></div>
        <label>${say('模型名称', 'Model name')}<input name="modelId" required maxlength="150" value="${escape(record?.modelId || '')}" placeholder="${say('输入模型参数值，例如 gpt-4o 或 openai/gpt-4o', 'Enter model ID, e.g. gpt-4o or openai/gpt-4o')}" autocomplete="off"></label>
        <fieldset class="model-advanced"><legend>${say('高级配置', 'Advanced settings')}</legend><div class="model-capabilities">${check('toolCalling', '工具调用', 'Tool calling', true)}${check('imageInput', '图片输入', 'Image input')}${check('thinking', '思考模式', 'Thinking')}${check('customProtocol', '自定义协议', 'Custom protocol')}</div><div class="model-token-limits"><label>${say('输入', 'Input')}<input name="inputLimit" type="number" min="1" step="1" value="${escape(record?.inputLimit ?? '')}" placeholder="${say('使用提供商默认值', 'Use provider defaults')}"></label><label>${say('输出', 'Output')}<input name="outputLimit" type="number" min="1" step="1" value="${escape(record?.outputLimit ?? '')}" placeholder="${say('使用提供商默认值', 'Use provider defaults')}"></label></div></fieldset>
        <p class="model-secret-note">${say('API Key 不写入本地；测试成功后仅在服务器内存保留 30 分钟。', 'API Key is never stored locally. Successful tests keep it in server memory for 30 minutes.')}</p>
        <p class="model-form-error" role="alert"></p>
      </form>`,
      footer: `<button class="btn btn-ghost" type="button" data-model-cancel>${say('取消', 'Cancel')}</button><button class="btn btn-primary" type="submit" form="custom-model-form">${say('保存', 'Save')}</button>`,
    })
    const dialog = mask.querySelector('.modal-box')
    dialog.classList.add('model-editor-dialog')
    const title = mask.querySelector('.modal-head h3')
    title.id = 'model-editor-title'
    dialog.setAttribute('aria-labelledby', title.id)
    let testController = null
    const form = bodyEl.querySelector('form'),
      secret = form.elements.apiKey
    const dismiss = () => {
      testController?.abort()
      secret.value = ''
      close()
    }
    footEl.querySelector('[data-model-cancel]').onclick = dismiss
    mask.addEventListener('click', (event) => {
      if (event.target === mask || event.target.closest('.modal-close')) {
        secret.value = ''
        testController?.abort()
      }
    })
    bodyEl.querySelector('.model-key-toggle').onclick = (event) => {
      const button = event.currentTarget,
        visible = secret.type === 'password'
      secret.type = visible ? 'text' : 'password'
      button.setAttribute('aria-pressed', String(visible))
      button.setAttribute(
        'aria-label',
        say(
          visible ? '隐藏 API Key' : '显示 API Key',
          visible ? 'Hide API Key' : 'Show API Key',
        ),
      )
    }
    const values = () => ({
      name: form.elements.modelId.value,
      modelId: form.elements.modelId.value,
      baseURL: form.elements.baseURL.value,
      keyEnv: record?.keyEnv || 'MODEL_API_KEY',
      ...Object.fromEntries(
        ['toolCalling', 'imageInput', 'thinking', 'customProtocol'].map(
          (key) => [key, form.elements[key].checked],
        ),
      ),
      inputLimit: form.elements.inputLimit.value,
      outputLimit: form.elements.outputLimit.value,
    })
    bodyEl.querySelector('[data-model-test]').onclick = async (event) => {
      const status = bodyEl.querySelector('[data-model-test-status]'),
        button = event.currentTarget
      status.hidden = false
      button.disabled = true
      status.textContent = say('正在请求模型，请稍候…', 'Requesting model…')
      try {
        const config = validateModel(values())
        testController = new AbortController()
        const result = await modelRequest(
          'test',
          { config, apiKey: secret.value },
          testController.signal,
        )
        secret.value = ''
        status.textContent = say(
          result.message + ` 耗时 ${result.latencyMs} ms。`,
          'Connection successful. Temporary server session expires in 30 minutes.',
        )
      } catch (error) {
        status.textContent = error.message
      } finally {
        button.disabled = false
      }
    }
    form.onsubmit = (event) => {
      event.preventDefault()
      try {
        const rows = models()
        if (!record && rows.length >= 100)
          throw Error('最多保存 100 个模型配置')
        const entry = {
          ...validateModel(values(), rows, record?.uid),
          uid: record?.uid || uid('model'),
          source: record?.source || 'custom',
          verified: false,
        }
        const index = rows.findIndex((m) => m.uid === entry.uid)
        if (record && index < 0) throw Error('此模型已被删除，请重新添加')
        if (index < 0) rows.push(entry)
        else rows[index] = entry
        if (
          record?.modelId === store.state.settings.model ||
          !store.state.settings.model
        )
          store.state.settings.model = entry.modelId
        dismiss()
        save()
        toast(
          say(
            '模型配置已保存，API Key 不写入本地',
            'Model configuration saved; API Key was not saved',
          ),
        )
      } catch (error) {
        bodyEl.querySelector('[role=alert]').textContent = error.message
      }
    }
    form.elements.provider.focus()
    mask.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        secret.value = ''
        testController?.abort()
      }
      if (event.key !== 'Tab') return
      const nodes = [...mask.querySelectorAll('button,input,select')].filter(
          (el) => !el.disabled && el.getClientRects().length,
        ),
        last = nodes.at(-1)
      if (event.shiftKey && document.activeElement === nodes[0]) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        nodes[0].focus()
      }
    })
  }
  function connection(record) {
    const { bodyEl, footEl, close } = openModal({
      title: say('模型连接设置', 'Model connection settings'),
      body: `<div class="custom-model-connection"><dl><dt>${say('模型 ID', 'Model ID')}</dt><dd>${escape(record.modelId)}</dd><dt>${say('API 地址', 'API base URL')}</dt><dd>${escape(record.baseURL)}</dd><dt>${say('服务端环境变量', 'Server environment variable')}</dt><dd>${escape(record.keyEnv)}</dd></dl><p>${say('使用已测试的临时密钥或服务器环境变量。若提示缺少密钥，请编辑模型，填写 API Key 后测试连接。', 'Uses a temporary tested credential or server environment variable. Edit the model to enter a key if needed.')}</p><p role="status" data-connection-status>${say('尚未进行联网测试，连接是否可用需在后端验证。', 'No live connection test has been run. Verify access on the backend.')}</p></div>`,
      footer: `<button class="btn btn-ghost" data-model-close>${say('关闭', 'Close')}</button><button class="btn btn-primary" data-model-check>${say('测试连接', 'Test connection')}</button>`,
    })
    footEl.querySelector('[data-model-close]').onclick = close
    footEl.querySelector('[data-model-check]').onclick = async (event) => {
      const button = event.currentTarget,
        status = bodyEl.querySelector('[data-connection-status]')
      button.disabled = true
      status.textContent = say('正在请求模型，请稍候…', 'Requesting model…')
      try {
        const result = await modelRequest('test', {
          config: validateModel(record),
        })
        status.textContent = result.message + ` (${result.latencyMs} ms)`
      } catch (error) {
        status.textContent = error.message
      } finally {
        button.disabled = false
      }
    }
  }

  async function handle(event) {
    const b = event.target.closest(
      '[data-model-add],[data-model-edit],[data-model-delete],[data-model-connect],[data-model-export]',
    )
    if (!b) return false
    if (b.hasAttribute('data-model-add')) {
      editor()
      return true
    }
    if (b.hasAttribute('data-model-export')) {
      downloadFile(
        'models.json',
        JSON.stringify(
          {
            version: 1,
            selectedModel: store.state.settings.model,
            models: models().map(
              ({ uid, source, verified, ...metadata }) => metadata,
            ),
          },
          null,
          2,
        ),
      )
      return true
    }
    const id =
        b.dataset.modelEdit || b.dataset.modelDelete || b.dataset.modelConnect,
      record = models().find((m) => m.uid === id)
    if (!record) return true
    if (b.hasAttribute('data-model-edit')) editor(record)
    if (b.hasAttribute('data-model-connect')) connection(record)
    if (
      b.hasAttribute('data-model-delete') &&
      (await confirmModal(
        say('删除模型', 'Delete model'),
        say(
          `确定删除「${escape(record.name)}」的本地配置吗？不会删除服务端模型。`,
          `Delete the local configuration for “${escape(record.name)}”? This does not delete the server model.`,
        ),
        say('删除', 'Delete'),
      ))
    ) {
      store.state.settings.customModels = models().filter((m) => m.uid !== id)
      if (store.state.settings.model === record.modelId)
        store.state.settings.model =
          store.state.settings.customModels[0]?.modelId || ''
      save()
      toast(say('模型已删除', 'Model deleted'))
    }
    return true
  }
  return { render, handle }
}
