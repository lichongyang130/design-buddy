import { modelRequest } from './models-api.js'
import './question-chat.css'
export const escapeQuestionText = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (s) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        s
      ],
  )
export { isStandaloneQuestion } from './question-routing.js'
const escape = escapeQuestionText
const icons = {
  plus: 'M12 5v14M5 12h14',
  mic: 'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-4 0h8',
  arrow: 'm5 12 7-7 7 7M12 5v14',
}
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name]}"/></svg>`
export function initQuestionChat({ store, toast }) {
  const host = window
  let screen = null,
    current = null,
    timer = null,
    recognition = null,
    returnFocus = null,
    request = null
  const files = []
  const list = () => store.state.conversations
  const save = () => {
    store.save()
  }
  const pending = () => current?.messages.at(-1)?.role === 'pending'
  function settle(stopped = false) {
    request?.abort()
    request = null
    host.clearTimeout(timer)
    timer = null
    if (!pending()) return
    current.messages.at(-1).role = 'notice'
    current.messages.at(-1).text = '已停止本次回答。'
    save()
    render()
  }
  function release() {
    request?.abort()
    request = null
    host.clearTimeout(timer)
    timer = null
    recognition?.stop()
    recognition = null
  }
  function close() {
    if (pending()) settle(true)
    release()
    store.state.ui.questionChatId = null
    save()
    screen?.remove()
    screen = null
    document.body.classList.remove('question-chat-open')
    document.querySelector('.app')?.removeAttribute('inert')
    if (returnFocus && !returnFocus.disabled) returnFocus.focus()
    else document.querySelector('#prompt-input')?.focus()
  }
  function render() {
    if (!screen) return
    const draft = screen.querySelector('#qa-input')?.value || ''
    screen.innerHTML = `<button class="qa-home" data-qa-home aria-label="返回首页">← 首页</button><div class="qa-scroll"><div class="qa-messages" role="log" aria-label="问答记录" aria-live="polite">${current.messages.map((m) => (m.role === 'user' ? `<div class="qa-user-turn">${m.template ? `<div class="qa-template">${typeof m.template.cover === 'string' && /^\/[^/]/.test(m.template.cover) ? `<img src="${escape(m.template.cover)}" alt="">` : '<span class="qa-template-art" aria-hidden="true">Aa<br>Design</span>'}<div><b>${escape(m.template.name)}</b><small>模板</small></div></div>` : ''}${m.files?.length ? `<div class="qa-file-list">${m.files.map((name) => `<span>${escape(name)}</span>`).join('')}</div>` : ''}<div class="qa-user-bubble">${escape(m.text)}</div></div>` : m.role === 'pending' ? `<div class="qa-thinking" role="status"><svg viewBox="0 0 24 20" aria-hidden="true"><path d="M2 12V5a3 3 0 0 1 6 0v9a3 3 0 0 0 6 0V5a3 3 0 0 1 6 0v7"/></svg><span>正在决定下一步行动...</span></div>` : `<div class="qa-notice"><p>${escape(m.text)}</p>${m === current.messages.at(-1) ? '<button data-qa-retry>重新尝试</button>' : ''}</div>`)).join('')}</div></div><div class="qa-compose-wrap"><form class="qa-composer"><label class="qa-sr" for="qa-input">给智能体发消息</label><textarea id="qa-input" placeholder="给智能体发消息..." rows="2" maxlength="12000">${escape(draft)}</textarea><div class="qa-compose-tools"><button type="button" class="qa-round qa-add" data-qa-add aria-label="添加附件">${icon('plus')}</button><span id="qa-file-status">${files.length ? `${files.length} 个附件（仅文件名）` : ''}</span><input id="qa-file" type="file" multiple hidden><div><button type="button" class="qa-round" data-qa-mic aria-label="语音输入">${icon('mic')}</button><button type="${pending() ? 'button' : 'submit'}" class="qa-send" ${pending() ? 'data-qa-stop aria-label="停止回答"' : 'aria-label="发送消息"'}>${pending() ? '<span class="qa-stop"></span>' : icon('arrow')}</button></div></div></form></div>`
    screen.querySelector('[data-qa-home]').onclick = close
    screen
      .querySelector('[data-qa-stop]')
      ?.addEventListener('click', () => settle(true))
    screen.querySelector('[data-qa-retry]')?.addEventListener('click', () => {
      if (current.messages.at(-1)?.role === 'assistant') current.messages.pop()
      current.messages.push({ role: 'pending' })
      save()
      render()
      timer = host.setTimeout(answer, 0)
    })
    screen.querySelector('[data-qa-add]').onclick = () =>
      screen.querySelector('#qa-file').click()
    screen.querySelector('#qa-file').onchange = (e) => {
      files.splice(
        0,
        files.length,
        ...[...e.target.files].slice(0, 8).map((f) => f.name),
      )
      screen.querySelector('#qa-file-status').textContent = files.length
        ? `${files.length} 个附件（仅文件名）`
        : ''
    }
    screen.querySelector('form').onsubmit = (e) => {
      e.preventDefault()
      if (pending()) return
      const text = screen.querySelector('#qa-input').value.trim()
      if (!text) return
      send(text, { files })
    }
    screen.querySelector('#qa-input').onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault()
        if (!pending()) screen.querySelector('form').requestSubmit()
      }
    }
    screen.querySelector('[data-qa-mic]').onclick = () => {
      const Speech = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!Speech) return toast('当前浏览器不支持语音输入，请使用键盘')
      recognition?.stop()
      recognition = new Speech()
      recognition.lang = 'zh-CN'
      recognition.onresult = (e) => {
        if (screen)
          screen.querySelector('#qa-input').value += e.results[0][0].transcript
      }
      recognition.onerror = () => toast('未能使用麦克风，请检查权限或使用键盘')
      recognition.start()
    }
    const scroller = screen.querySelector('.qa-scroll')
    scroller.scrollTop = scroller.scrollHeight
  }
  async function answer() {
    if (!pending()) return
    const conversation = current,
      message = current.messages.at(-1),
      controller = new AbortController()
    request = controller
    const selected = store.state.settings.customModels?.find(
      (m) => m.modelId === store.state.settings.model,
    )
    const config = selected || {
      modelId: store.state.settings.model || 'deepseek-chat',
      baseURL: 'https://api.deepseek.com/v1',
    }
    const messages = conversation.messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-40)
      .map((m) => ({ role: m.role, content: m.text }))
    try {
      const result = await modelRequest(
        'chat',
        { config, messages },
        controller.signal,
      )
      if (controller.signal.aborted || message.role !== 'pending') return
      message.role = 'assistant'
      message.text = result.text
    } catch (error) {
      if (controller.signal.aborted || message.role !== 'pending') return
      message.role = 'notice'
      message.text = error.message
    } finally {
      if (request === controller) request = null
    }
    save()
    if (current === conversation) render()
  }
  function mount() {
    if (!screen) {
      returnFocus = document.activeElement
      screen = document.createElement('section')
      screen.id = 'question-chat'
      screen.setAttribute('aria-label', '独立问答')
      document.body.append(screen)
      document.body.classList.add('question-chat-open')
      document.querySelector('.app')?.setAttribute('inert', '')
    }
    store.state.ui.questionChatId = current.id
    save()
    render()
  }
  function send(
    text,
    { files: incomingFiles = [], template = null, context = '' } = {},
  ) {
    if (!current) return
    const names = incomingFiles.map(String)
    files.length = 0
    if (screen?.querySelector('#qa-input'))
      screen.querySelector('#qa-input').value = ''
    recognition?.stop()
    current.messages.push(
      {
        role: 'user',
        text: text.slice(0, 12000),
        files: names,
        template: template
          ? { name: String(template.name), cover: template.cover || '' }
          : null,
        context: String(context).slice(0, 10000),
      },
      { role: 'pending' },
    )
    current.at = Date.now()
    save()
    render()
    screen.querySelector('#qa-input').focus()
    timer = host.setTimeout(answer, 0)
  }
  function open(id) {
    const c = list().find((c) => c.id === id && c.kind === 'question')
    if (!c) return
    release()
    current = c
    if (!Array.isArray(current.messages)) current.messages = []
    if (pending()) {
      current.messages[current.messages.length - 1] = {
        role: 'notice',
        text: '上次回答已中断，问题已保存。',
      }
      save()
    }
    mount()
  }
  host.addEventListener('pagehide', release)
  return {
    start(text, options) {
      release()
      current = {
        id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        kind: 'question',
        title: text.slice(0, 40),
        at: Date.now(),
        messages: [],
      }
      list().unshift(current)
      mount()
      send(text, options)
    },
    open,
    restore() {
      if (store.state.ui.questionChatId) open(store.state.ui.questionChatId)
    },
  }
}
