/* ============================================================
   输入框里的两个快捷调用（真实数据，不是装饰）：
   · 输入 @ → 引用对话里的文件（本次附件 / 历史创作附件 / 媒体库）
   · 输入 / → 调用技能（已安装技能，启用后才会真正运行）
   @ 选中的文件会加进本次附件；/ 选中的技能会挂到这一次创作上。
   ============================================================ */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const kindOf = (name = '') => {
  const ext = String(name).split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'PDF'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '表格'
  if (['doc', 'docx', 'md', 'txt', 'rtf'].includes(ext)) return '文档'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return '图片'
  if (['ppt', 'pptx', 'key'].includes(ext)) return '演示'
  if (['js', 'ts', 'json', 'html', 'css', 'py'].includes(ext)) return '代码'
  return '文件'
}

/**
 * @param {object} opts
 * @param {HTMLTextAreaElement} opts.input
 * @param {()=>Array<{name:string, from?:string}>} opts.listFiles
 * @param {(file:object)=>void} opts.onPickFile
 * @param {()=>Array<{name:string, desc?:string, enabled?:boolean}>} opts.listSkills
 * @param {(skill:object)=>void} opts.onPickSkill
 */
export function initPromptTriggers({ input, listFiles, onPickFile, listSkills, onPickSkill }) {
  const mentionPop = document.querySelector('#mention-pop')
  const mentionList = document.querySelector('#mention-list')
  const skillPop = document.querySelector('#skill-pop')
  const skillList = document.querySelector('#skill-list')
  if (!input || !mentionPop || !skillPop) {
    return { close() {}, isOpen: () => false, mode: () => null }
  }

  let mode = null // 'file' | 'skill'
  let start = -1
  let query = ''
  let items = []
  let cursor = 0

  const popOf = (m) => (m === 'skill' ? skillPop : mentionPop)
  const listOf = (m) => (m === 'skill' ? skillList : mentionList)

  const close = () => {
    mode = null
    start = -1
    query = ''
    items = []
    cursor = 0
    mentionPop.hidden = true
    skillPop.hidden = true
    input.setAttribute('aria-expanded', 'false')
  }

  /* 光标前是否是 `@查询` / `/查询`（触发符必须在行首或空白/括号之后） */
  const detect = () => {
    const pos = input.selectionStart ?? input.value.length
    if (input.selectionEnd !== pos) return null
    const before = input.value.slice(0, pos)
    const m = /(^|[\s（(，,。])([@/])([^\s@/]{0,24})$/.exec(before)
    if (!m) return null
    return { mode: m[2] === '@' ? 'file' : 'skill', start: pos - m[3].length - 1, query: m[3] }
  }

  const render = () => {
    const list = listOf(mode)
    if (!list) return
    const q = query.trim().toLowerCase()

    if (mode === 'file') {
      const all = listFiles?.() ?? []
      items = all.filter((f) => !q || `${f.name} ${f.from ?? ''}`.toLowerCase().includes(q)).slice(0, 12)
      list.innerHTML = items.length
        ? items.map((f, i) => `
          <button class="pt-item${i === cursor ? ' is-active' : ''}" type="button" role="option"
            aria-selected="${i === cursor}" data-pt="${i}" title="引用 ${esc(f.name)}">
            <span class="pt-badge">${esc(kindOf(f.name))}</span>
            <span class="pt-main">
              <span class="pt-name">${esc(f.name)}</span>
              <span class="pt-sub">${esc(f.from || '对话文件')}</span>
            </span>
            <span class="pt-tag">引用</span>
          </button>`).join('')
        : `<p class="pt-empty">${all.length
          ? '没有匹配的文件，换个关键词试试。'
          : '对话里还没有文件。用 ＋ 上传，或从媒体库引用一次后就会出现在这里。'}</p>`
    } else {
      const all = listSkills?.() ?? []
      items = all.filter((s) => !q || `${s.name} ${s.desc ?? ''}`.toLowerCase().includes(q)).slice(0, 12)
      list.innerHTML = items.length
        ? items.map((s, i) => `
          <button class="pt-item${i === cursor ? ' is-active' : ''}${s.enabled ? '' : ' is-off'}" type="button"
            role="option" aria-selected="${i === cursor}" data-pt="${i}"
            title="${s.enabled ? `调用 ${esc(s.name)}` : `${esc(s.name)} 未启用`}">
            <span class="pt-badge is-skill">${esc((s.name || '技')[0])}</span>
            <span class="pt-main">
              <span class="pt-name">${esc(s.name)}</span>
              <span class="pt-sub">${esc(s.desc || '本地技能')}</span>
            </span>
            <span class="pt-tag${s.enabled ? '' : ' is-off'}">${s.enabled ? '调用' : '未启用'}</span>
          </button>`).join('')
        : `<p class="pt-empty">${all.length
          ? '没有匹配的技能。'
          : '还没有安装技能，先去技能页挑一个。'}</p>`
    }

    popOf(mode).hidden = false
    popOf(mode === 'skill' ? 'file' : 'skill').hidden = true
    input.setAttribute('aria-expanded', 'true')
    list.scrollTop = 0
  }

  const refresh = () => {
    const hit = detect()
    if (!hit) { close(); return }
    const changed = hit.mode !== mode || hit.start !== start
    mode = hit.mode
    start = hit.start
    query = hit.query
    if (changed) cursor = 0
    render()
  }

  const commit = (replacement) => {
    const pos = input.selectionStart ?? input.value.length
    const value = input.value
    input.value = value.slice(0, start) + replacement + value.slice(pos)
    const caret = start + replacement.length
    input.setSelectionRange(caret, caret)
  }

  const pick = (index) => {
    const item = items[index]
    if (!item || !mode) return
    const kind = mode
    commit(kind === 'file' ? `@${item.name} ` : '')
    close()
    if (kind === 'file') onPickFile?.(item, { query })
    else onPickSkill?.(item, { query })
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()
  }

  input.addEventListener('input', refresh)
  input.addEventListener('click', refresh)

  input.addEventListener('keydown', (event) => {
    if (!mode) return
    if (event.key === 'Escape') { event.preventDefault(); close(); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!items.length) return
      event.preventDefault()
      cursor = (cursor + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length
      render()
      return
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      if (!items.length) return
      event.preventDefault()
      event.stopPropagation()
      pick(cursor)
    }
  })

  ;[mentionList, skillList].forEach((list) => {
    if (!list) return
    // 保住输入框焦点，点击列表项不会先触发 blur
    list.addEventListener('mousedown', (event) => event.preventDefault())
    list.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-pt]')
      if (!btn) return
      pick(Number(btn.dataset.pt))
    })
    list.addEventListener('mousemove', (event) => {
      const btn = event.target.closest('[data-pt]')
      if (!btn) return
      const idx = Number(btn.dataset.pt)
      if (idx === cursor) return
      cursor = idx
      list.querySelectorAll('[data-pt]').forEach((el) => {
        const on = Number(el.dataset.pt) === cursor
        el.classList.toggle('is-active', on)
        el.setAttribute('aria-selected', String(on))
      })
    })
  })

  document.addEventListener('click', (event) => {
    if (!mode) return
    if (popOf(mode).contains(event.target) || event.target === input) return
    close()
  })

  return { close, isOpen: () => !!mode, mode: () => mode }
}
