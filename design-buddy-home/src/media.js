/* ============================================================
   媒体库页：store + IndexedDB 持久化
   - 上传真实进网格（IDB 存二进制，不支持时降级 dataURL）
   - 收藏星 / 选择模式 / 批量收藏与删除 / 灯箱预览
   - 新建 AI：本地生成 SVG 作品并落库；图形视图独立切换
   ============================================================ */

import './rail-flyout.js'
import { store, toast, openModal, confirmModal, uid, monthLabel, saveBlob, getBlob, deleteBlob, downloadFile } from './core.js'
import { initGlobalUI } from './global-ui.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const IMAGE_GLYPH = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
const CHECK_GLYPH = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
const STAR_GLYPH = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
const CAKE_HTML = `
  <span class="confetti"></span>
  <span class="cake">
    <span class="flame"></span>
    <span class="candle"></span>
    <span class="tier tier-top"><span class="cream"></span></span>
    <span class="tier tier-bottom"><span class="cream"></span></span>
    <span class="plate"></span>
  </span>`

/* ---------------- 视图状态（不持久化的临时筛选态） ---------------- */

const view = {
  tab: 'all', // all | fav
  source: 'all',
  type: 'all',
  gen: 'all',
  asc: false,
  picking: false,
  selected: new Set(),
  library: 'media', // media | graphic
}

const section = $('.media-section')
const urlCache = new Map()

function items() {
  let list = store.state.media.filter((m) =>
    view.library === 'graphic' ? m.type === 'graphic' : m.type === 'image',
  )
  list = list.filter((item) => {
    if (view.tab === 'fav' && !item.fav) return false
    if (view.source !== 'all' && item.source !== view.source) return false
    if (view.gen !== 'all' && item.gen !== view.gen) return false
    return true
  })
  list.sort((a, b) => view.asc ? a.createdAt - b.createdAt : b.createdAt - a.createdAt)
  return list
}

/* ---------------- 渲染 ---------------- */

function cardHtml(item) {
  const picked = view.selected.has(item.id)
  const inner = item.kind === 'cake' ? CAKE_HTML : ''
  const img = item.dataUrl
    ? `<img src="${item.dataUrl}" alt="${item.name}" />`
    : ''
  return `
    <article class="media-item ${item.cls} ${picked ? 'is-selected' : ''}"
             data-id="${item.id}" data-name="${item.name}" tabindex="0">
      ${inner}${img}
      <span class="fav-star ${item.fav ? 'is-on' : ''}" data-fav="${item.id}" title="收藏">${STAR_GLYPH}</span>
      <span class="pick-check">${CHECK_GLYPH}</span>
      <span class="media-badge">${IMAGE_GLYPH}</span>
    </article>`
}

function graphicHtml(item) {
  return `
    <button class="graphic-cell ${view.selected.has(item.id) ? 'is-selected' : ''}" data-id="${item.id}" data-name="${item.name}">
      ${item.glyph ?? '◆'}
      <span class="fav-star ${item.fav ? 'is-on' : ''}" data-fav="${item.id}">${STAR_GLYPH}</span>
    </button>`
}

async function hydrateBlobs(cards) {
  for (const card of cards) {
    const item = store.state.media.find((m) => m.id === card.dataset.id)
    if (!item || item.dataUrl || !item.blobKey) continue
    if (urlCache.has(item.id)) {
      injectImg(card, urlCache.get(item.id))
      continue
    }
    try {
      const blob = await getBlob(item.blobKey)
      if (!blob) continue
      const url = URL.createObjectURL(blob)
      urlCache.set(item.id, url)
      injectImg(card, url)
    } catch {
      /* IndexedDB 不可用且无降级数据时跳过 */
    }
  }
}

function injectImg(card, url) {
  if (card.querySelector('img')) return
  const img = document.createElement('img')
  img.src = url
  img.alt = card.dataset.name
  card.prepend(img)
}

function renderGrid() {
  const list = items()
  section.querySelector('#media-grid')?.classList.toggle('is-picking', view.picking)

  if (view.library === 'graphic') {
    section.innerHTML = `
      <h2 class="month-label">图形</h2>
      <div class="graphic-grid">${list.map(graphicHtml).join('')}</div>
      <div class="media-empty" id="media-empty" ${list.length ? 'hidden' : ''}>
        <div class="media-empty-ic">${IMAGE_GLYPH}</div>
        <p id="media-empty-text">还没有图形，点击「新建 → AI 生成图形」创作。</p>
      </div>`
    bindStarClicks()
    bindCardClicks()
    renderBatchBar()
    return
  }

  // 按月份分组
  const groups = new Map()
  list.forEach((m) => {
    const key = monthLabel(m.createdAt)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(m)
  })

  section.innerHTML = list.length
    ? [...groups.entries()].map(([month, arr]) => `
        <h2 class="month-label">${month}</h2>
        <div class="media-grid" id="media-grid">${arr.map(cardHtml).join('')}</div>`).join('')
    : `<div class="media-empty" id="media-empty">
         <div class="media-empty-ic">${IMAGE_GLYPH}</div>
         <p id="media-empty-text">${view.tab === 'fav' ? '收藏夹还是空的，悬停媒体并点亮星标即可收藏' : '当前筛选条件下没有媒体'}</p>
       </div>`

  bindStarClicks()
  bindCardClicks()
  hydrateBlobs($$('.media-item'))
  renderBatchBar()
}

function bindStarClicks() {
  section.querySelectorAll('[data-fav]').forEach((star) => {
    star.addEventListener('click', (e) => {
      e.stopPropagation()
      const item = store.state.media.find((m) => m.id === star.dataset.fav)
      item.fav = !item.fav
      store.save()
      toast(item.fav ? `已收藏「${item.name}」` : `已取消收藏「${item.name}」`)
      renderGrid()
    })
  })
}

function bindCardClicks() {
  section.querySelectorAll('.media-item, .graphic-cell').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-fav]')) return
      const item = store.state.media.find((m) => m.id === card.dataset.id)
      if (view.picking) {
        toggleSelect(item.id)
      } else {
        openLightbox(item)
      }
    })
  })
}

/* ---------------- 选择 / 批量工具条 ---------------- */

function toggleSelect(id) {
  if (view.selected.has(id)) view.selected.delete(id)
  else view.selected.add(id)
  renderGrid()
}

function renderBatchBar() {
  $('.batch-bar')?.remove()
  if (!view.picking || view.selected.size === 0) return
  const bar = document.createElement('div')
  bar.className = 'batch-bar'
  bar.innerHTML = `
    <span class="count">已选择 ${view.selected.size} 项</span>
    <button type="button" data-batch="fav"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>收藏</button>
    <button type="button" data-batch="unfav">取消收藏</button>
    <button type="button" class="danger" data-batch="delete">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      删除</button>
    <button type="button" data-batch="cancel">取消</button>`
  document.body.append(bar)

  bar.querySelector('[data-batch="fav"]').addEventListener('click', () => batchFav(true))
  bar.querySelector('[data-batch="unfav"]').addEventListener('click', () => batchFav(false))
  bar.querySelector('[data-batch="delete"]').addEventListener('click', batchDelete)
  bar.querySelector('[data-batch="cancel"]').addEventListener('click', exitPicking)
}

function batchFav(on) {
  view.selected.forEach((id) => {
    const item = store.state.media.find((m) => m.id === id)
    if (item) item.fav = on
  })
  store.save()
  toast(`已${on ? '收藏' : '取消收藏'} ${view.selected.size} 项媒体`)
  view.selected.clear()
  renderGrid()
}

async function batchDelete() {
  const ok = await confirmModal('删除媒体', `确定删除选中的 ${view.selected.size} 项媒体吗？此操作不可撤销。`, '删除')
  if (!ok) return
  for (const id of view.selected) {
    const item = store.state.media.find((m) => m.id === id)
    if (item?.blobKey) {
      try { await deleteBlob(item.blobKey) } catch { /* ignore */ }
    }
  }
  store.state.media = store.state.media.filter((m) => !view.selected.has(m.id))
  store.save()
  view.selected.clear()
  renderGrid()
  toast('选中媒体已删除')
}

function exitPicking() {
  view.picking = false
  view.selected.clear()
  pickBtn.classList.remove('is-picking')
  pickBtn.setAttribute('aria-pressed', 'false')
  renderGrid()
}

/* ---------------- 灯箱 ---------------- */

async function openLightbox(item) {
  const mask = document.createElement('div')
  mask.className = 'lightbox-mask'
  mask.innerHTML = `
    <div class="lightbox-card">
      <div class="lightbox-stage" id="lb-stage">
        <button class="lb-close" aria-label="关闭">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>
      </div>
      <div class="lightbox-foot">
        <span class="lb-name">${item.name}</span>
        <button class="lb-btn" data-lb="fav">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${item.fav ? '取消收藏' : '收藏'}</button>
        <button class="lb-btn" data-lb="download">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          下载</button>
        <button class="lb-btn" data-lb="delete">删除</button>
      </div>
    </div>`
  document.body.append(mask)
  const stage = mask.querySelector('#lb-stage')

  if (item.kind === 'graphic') {
    const cell = document.createElement('div')
    cell.className = 'graphic-cell css-art'
    cell.style.fontSize = '120px'
    cell.textContent = item.glyph ?? '◆'
    stage.append(cell)
  } else if (item.dataUrl) {
    stage.innerHTML += `<img src="${item.dataUrl}" alt="${item.name}" />`
  } else if (item.blobKey) {
    try {
      const blob = await getBlob(item.blobKey)
      if (blob) stage.innerHTML += `<img src="${URL.createObjectURL(blob)}" alt="${item.name}" />`
    } catch { /* ignore */ }
  }
  if (!stage.querySelector('img, .css-art') && item.cls) {
    const art = document.createElement('div')
    art.className = `media-item ${item.cls} css-art`
    if (item.kind === 'cake') art.innerHTML = CAKE_HTML
    stage.append(art)
  }

  const close = () => mask.remove()
  mask.addEventListener('click', (e) => { if (e.target === mask || e.target.closest('.lb-close')) close() })
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape' && document.body.contains(mask)) { close(); document.removeEventListener('keydown', onEsc) }
  })
  mask.querySelector('[data-lb="fav"]').addEventListener('click', (e) => {
    item.fav = !item.fav
    store.save()
    e.currentTarget.innerHTML = `${STAR_GLYPH}${item.fav ? '取消收藏' : '收藏'}`
    renderGrid()
  })
  mask.querySelector('[data-lb="download"]').addEventListener('click', async () => {
    if (item.dataUrl) {
      const a = document.createElement('a')
      a.href = item.dataUrl
      a.download = `${item.name}.svg`
      a.click()
    } else if (item.blobKey) {
      try {
        const blob = await getBlob(item.blobKey)
        if (blob) downloadFile(item.name, blob, blob.type)
      } catch { toast('下载失败：本地数据库不可用') }
    } else {
      toast('内置示例素材暂不支持下载')
    }
  })
  mask.querySelector('[data-lb="delete"]').addEventListener('click', async () => {
    const ok = await confirmModal('删除媒体', `确定删除「${item.name}」吗？`, '删除')
    if (!ok) return
    if (item.blobKey) { try { await deleteBlob(item.blobKey) } catch { /* ignore */ } }
    store.state.media = store.state.media.filter((m) => m.id !== item.id)
    store.save()
    close()
    renderGrid()
    toast('已删除')
  })
}

/* ---------------- 选项卡 / 筛选 / 排序 / 选择模式 ---------------- */

$$('.media-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    view.tab = tab.dataset.tab
    $$('.media-tab').forEach((item) => {
      const active = item === tab
      item.classList.toggle('is-active', active)
      item.setAttribute('aria-selected', String(active))
    })
    view.selected.clear()
    renderGrid()
  })
})

const FILTER_KEYS = { source: 'source', type: 'type', gen: 'gen' }

function closeAllMenus() {
  $$('.m-select').forEach((wrap) => {
    wrap.classList.remove('is-open')
    $('.m-select-menu', wrap).hidden = true
    $('.m-select-btn', wrap).setAttribute('aria-expanded', 'false')
  })
  $('#create-ai-menu').hidden = true
  $('#create-ai-btn').setAttribute('aria-expanded', 'false')
}

$$('.m-select').forEach((wrap) => {
  const key = wrap.dataset.filter
  const btn = $('.m-select-btn', wrap)
  const menu = $('.m-select-menu', wrap)
  btn.addEventListener('click', (event) => {
    event.stopPropagation()
    const willOpen = menu.hidden
    closeAllMenus()
    menu.hidden = !willOpen
    wrap.classList.toggle('is-open', willOpen)
    btn.setAttribute('aria-expanded', String(willOpen))
  })
  menu.addEventListener('click', (event) => {
    const option = event.target.closest('button')
    if (!option) return
    event.stopPropagation()
    $$('button', menu).forEach((b) => {
      const selected = b === option
      b.classList.toggle('is-selected', selected)
      b.setAttribute('aria-selected', String(selected))
    })
    $('.m-select-value', btn).textContent = option.textContent
    const value = option.dataset.value
    if (key === 'type' && value === 'graphic') {
      switchLibrary('graphic')
    } else {
      if (view.library === 'graphic') switchLibrary('media')
      view[FILTER_KEYS[key]] = value
    }
    menu.hidden = true
    wrap.classList.remove('is-open')
    btn.setAttribute('aria-expanded', 'false')
    renderGrid()
  })
})

document.addEventListener('click', closeAllMenus)
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAllMenus() })

const sortBtn = $('#sort-btn')
sortBtn.addEventListener('click', () => {
  view.asc = !view.asc
  sortBtn.classList.toggle('is-desc', view.asc)
  renderGrid()
  toast(view.asc ? '排序：最旧优先' : '排序：最新优先')
})

const pickBtn = $('#pick-btn')
pickBtn.addEventListener('click', () => {
  view.picking = !view.picking
  pickBtn.classList.toggle('is-picking', view.picking)
  pickBtn.setAttribute('aria-pressed', String(view.picking))
  if (!view.picking) view.selected.clear()
  renderGrid()
  toast(view.picking ? '已进入选择模式，点选媒体进行多选' : '已退出选择模式')
})

/* ---------------- 图形 / 媒体 视图切换 ---------------- */

const graphicNav = $('.media-sidebar [data-tip="图形"]')
const mediaNav = $('.media-sidebar .nav-item[aria-current="page"]')

function switchLibrary(lib) {
  view.library = lib
  view.selected.clear()
  graphicNav?.classList.toggle('is-viewing', lib === 'graphic')
  mediaNav?.classList.toggle('is-viewing', lib === 'graphic')
  renderGrid()
}

graphicNav?.addEventListener('click', (e) => {
  e.preventDefault()
  switchLibrary('graphic')
})
mediaNav?.addEventListener('click', (e) => {
  if (view.library === 'media') return
  e.preventDefault()
  switchLibrary('media')
})

/* ---------------- 上传（IndexedDB + dataURL 降级） ---------------- */

const uploadBtn = $('#upload-btn')
const uploadInput = $('#upload-input')

uploadBtn.addEventListener('click', () => uploadInput.click())

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

uploadInput.addEventListener('change', async () => {
  const files = [...uploadInput.files]
  if (!files.length) return
  for (const file of files) {
    const item = {
      id: uid('m'),
      name: file.name.replace(/\.[^.]+$/, ''),
      cls: '',
      kind: 'plain',
      fav: false,
      source: 'upload',
      type: 'image',
      gen: file.type.includes('png') ? 'illustration' : 'photo',
      createdAt: Date.now(),
      blobKey: null,
      dataUrl: null,
    }
    try {
      await saveBlob(item.id, file)
      item.blobKey = item.id
    } catch {
      item.dataUrl = await readAsDataURL(file)
    }
    store.state.media.unshift(item)
  }
  store.save()
  uploadInput.value = ''
  switchLibrary('media')
  renderGrid()
  toast(`已上传 ${files.length} 个文件并加入媒体库`)
})

/* ---------------- 新建 AI（本地生成 SVG 作品） ---------------- */

const createBtn = $('#create-ai-btn')
const createMenu = $('#create-ai-menu')

createBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  const willOpen = createMenu.hidden
  closeAllMenus()
  createMenu.hidden = !willOpen
  createBtn.setAttribute('aria-expanded', String(willOpen))
})

function hashHue(text) {
  let h = 0
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 360
  return h
}

function makeAiArt(prompt) {
  const hue = hashHue(prompt || 'design')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},82%,66%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 64) % 360},78%,42%)"/>
    </linearGradient></defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <circle cx="${120 + (hue % 400)}" cy="130" r="70" fill="rgba(255,255,255,0.22)"/>
    <circle cx="${560 - (hue % 200)}" cy="440" r="120" fill="rgba(255,255,255,0.14)"/>
    <text x="60" y="520" font-family="PingFang SC, sans-serif" font-size="34" font-weight="700" fill="#fff">${(prompt || 'AI 作品').replace(/[<>&]/g, '').slice(0, 18)}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function aiCreator(kind) {
  const isGraphic = kind.includes('图形')
  const { close, bodyEl, footEl } = openModal({
    title: kind,
    body: `
      <div class="field">
        <label>描述你想要的作品</label>
        <textarea id="ai-prompt" placeholder="例如：适合科技发布会的蓝色主视觉"></textarea>
      </div>
      <p class="hint">本地演示环境：将根据描述生成一幅 SVG 作品并保存到媒体库。</p>`,
    footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>生成</button>',
  })
  const ta = bodyEl.querySelector('#ai-prompt')
  ta.focus()
  footEl.querySelector('[data-ok]').addEventListener('click', () => {
    const prompt = ta.value.trim() || '未命名 AI 作品'
    if (kind === 'AI 智能修图') {
      const source = store.state.media.find((m) => m.type === 'image')
      if (!source) return toast('媒体库中没有可修的图片，请先上传')
      const item = {
        id: uid('m'), name: `修图 · ${prompt.slice(0, 12)}`, cls: '', kind: 'plain',
        fav: false, source: 'ai', type: 'image', gen: 'photo',
        createdAt: Date.now(), blobKey: null, dataUrl: makeAiArt(`修图:${prompt}`),
      }
      store.state.media.unshift(item)
    } else if (isGraphic) {
      const glyphs = ['◆', '★', '●', '▲', '■', '➜', '✦', '⬟']
      store.state.media.unshift({
        id: uid('m'), name: prompt.slice(0, 16), cls: '', kind: 'graphic',
        glyph: glyphs[hashHue(prompt) % glyphs.length],
        fav: false, source: 'ai', type: 'graphic', gen: 'shape',
        createdAt: Date.now(),
      })
    } else {
      store.state.media.unshift({
        id: uid('m'), name: prompt.slice(0, 18), cls: '', kind: 'plain',
        fav: false, source: 'ai', type: 'image', gen: 'illustration',
        createdAt: Date.now(), blobKey: null, dataUrl: makeAiArt(prompt),
      })
    }
    store.save()
    close()
    switchLibrary(isGraphic ? 'graphic' : 'media')
    renderGrid()
    toast('已生成并保存到媒体库')
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
}

createMenu.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    closeAllMenus()
    aiCreator(btn.dataset.demo)
  })
})

/* Plus 横幅与帮助按钮由 global-ui 的 data-demo 委托统一处理 */

renderGrid()
