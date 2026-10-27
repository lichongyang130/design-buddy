/* ============================================================
   DesignBuddy 商业级演示文稿案例页
   4 个完整案例，每个 15 页，支持全屏浏览与逐页切换
   ============================================================ */

import { CASE_DECKS, renderCaseDocumentHTML, renderCaseSlideHTML, caseMeta, caseCoverStyle } from './case-decks.js'
import { store, uid, fmtDate } from './core.js'

/* ---------------- 工具 ---------------- */

const $ = (s, root = document) => root.querySelector(s)
const $$ = (s, root = document) => [...root.querySelectorAll(s)]

function toast(msg) {
  let el = document.querySelector('.toast-host')
  if (!el) { el = document.createElement('div'); el.className = 'toast-host'; document.body.append(el) }
  const t = document.createElement('div')
  t.className = 'toast'
  t.textContent = msg
  el.append(t)
  setTimeout(() => t.classList.add('show'), 10)
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300) }, 2800)
}

function click(el) { el?.dispatchEvent(new MouseEvent('click', { bubbles: true })) }

async function tick(ms = 30) { await new Promise(r => setTimeout(r, ms)) }

/* ---------------- 渲染案例网格 ---------------- */

function renderGrid() {
  const grid = $('#case-grid')
  grid.innerHTML = CASE_DECKS.map((deck, i) => {
    const m = caseMeta(deck)
    const cs = caseCoverStyle(deck)
    const firstPage = renderCaseSlideHTML(deck, 0)
    return `
      <button class="case-card" type="button" data-case="${deck.id}">
        <div class="case-cover" style="border-radius:${cs.radius}px">
          ${firstPage}
        </div>
        <div class="case-meta">
          <div class="case-head">
            <h3>${m.name}</h3>
            <span class="case-pill">${m.format}</span>
          </div>
          <p class="case-sub">${m.subtitle}</p>
          <div class="case-foot">
            <span class="case-tag">${m.framework}</span>
            <span class="case-pages">${m.pageCount} 页</span>
          </div>
        </div>
      </button>`
  }).join('')

  grid.querySelectorAll('.case-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.case
      const deck = CASE_DECKS.find((d) => d.id === id)
      if (deck) openViewer(deck)
    })
  })
}

/* ---------------- 全屏浏览器 ---------------- */

let viewerDeck = null
let viewerPage = 0
let viewerTimer = null
let viewerAutoplay = false

function openViewer(deck) {
  viewerDeck = deck
  viewerPage = 0
  viewerAutoplay = false

  const mask = document.createElement('div')
  mask.className = 'case-viewer-mask'
  mask.innerHTML = `
    <div class="case-viewer" role="dialog" aria-modal="true">
      <div class="case-viewer-topbar">
        <div class="case-viewer-title">
          <strong>${deck.name}</strong>
          <span>${deck.subtitle}</span>
        </div>
        <div class="case-viewer-actions">
          <button class="cv-btn" data-cv-autoplay title="自动播放">▶ 自动播放</button>
          <button class="cv-btn" data-cv-doc title="文档视图">📖 文档视图</button>
          <button class="cv-btn cv-close" data-cv-close title="关闭">✕</button>
        </div>
      </div>
      <div class="case-viewer-stage" id="cv-stage"></div>
      <div class="case-viewer-bar">
        <button class="cv-arrow" data-cv-prev title="上一页">‹</button>
        <span class="cv-pagecount" id="cv-pagecount">01 / ${String(deck.pageCount).padStart(2, '0')}</span>
        <button class="cv-arrow" data-cv-next title="下一页">›</button>
      </div>
      <div class="case-viewer-strip" id="cv-strip"></div>
    </div>`

  document.body.append(mask)

  const stage = $('#cv-stage', mask)
  const pagecount = $('#cv-pagecount', mask)
  const strip = $('#cv-strip', mask)

  function renderPage() {
    if (viewerPage >= deck.pages.length) viewerPage = 0
    if (viewerPage < 0) viewerPage = deck.pages.length - 1
    stage.innerHTML = renderCaseSlideHTML(deck, viewerPage)
    stage.querySelector('.dp-page')?.classList.add('is-shown')
    pagecount.textContent = `${String(viewerPage + 1).padStart(2, '0')} / ${String(deck.pageCount).padStart(2, '0')}`
    strip.querySelectorAll('.cv-strip-item').forEach((s, i) =>
      s.classList.toggle('is-active', i === viewerPage))
  }

  function renderStrip() {
    strip.innerHTML = deck.pages.map((_, i) =>
      `<button class="cv-strip-item" data-cv-strip="${i}" title="第 ${i + 1} 页">${String(i + 1).padStart(2, '0')}</button>`
    ).join('')
    strip.querySelectorAll('.cv-strip-item').forEach((s) => {
      s.addEventListener('click', () => { viewerPage = Number(s.dataset.cvStrip); renderPage() })
    })
  }

  function renderDoc() {
    stage.innerHTML = renderCaseDocumentHTML(deck)
    stage.classList.add('is-doc')
    stage.querySelectorAll('.cv-arrow, .cv-pagecount').forEach((el) => el.hidden = true)
  }

  function go(delta) {
    viewerPage += delta
    if (viewerPage >= deck.pages.length) viewerPage = 0
    if (viewerPage < 0) viewerPage = deck.pages.length - 1
    renderPage()
  }

  function toggleAutoplay() {
    viewerAutoplay = !viewerAutoplay
    const btn = $('[data-cv-autoplay]', mask)
    btn.textContent = viewerAutoplay ? '⏸ 暂停' : '▶ 自动播放'
    btn.classList.toggle('is-on', viewerAutoplay)
    if (viewerTimer) { clearInterval(viewerTimer); viewerTimer = null }
    if (viewerAutoplay) {
      viewerTimer = setInterval(() => go(1), 2800)
    }
  }

  function close() {
    if (viewerTimer) { clearInterval(viewerTimer); viewerTimer = null }
    mask.remove()
  }

  // 事件绑定
  $('[data-cv-prev]', mask).addEventListener('click', () => go(-1))
  $('[data-cv-next]', mask).addEventListener('click', () => go(1))
  $('[data-cv-close]', mask).addEventListener('click', close)
  $('[data-cv-autoplay]', mask).addEventListener('click', toggleAutoplay)
  $('[data-cv-doc]', mask).addEventListener('click', () => {
    if (stage.classList.contains('is-doc')) {
      stage.classList.remove('is-doc')
      renderPage()
      $('[data-cv-doc]', mask).textContent = '📖 文档视图'
    } else {
      renderDoc()
      $('[data-cv-doc]', mask).textContent = '🎬 幻灯片视图'
    }
  })
  mask.addEventListener('click', (e) => { if (e.target === mask) close() })
  document.addEventListener('keydown', function onKey(e) {
    if (!mask.isConnected) { document.removeEventListener('keydown', onKey); return }
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  })

  renderStrip()
  renderPage()
}

/* ---------------- "套用此案例" 功能 ---------------- */

function useCase(deck) {
  const cost = 3
  if (store.state.credits < cost) {
    toast('积分不足，无法套用案例')
    return
  }
  store.state.credits -= cost
  const now = Date.now()
  const gamma = {
    id: uid('g'),
    title: `案例创作 · ${deck.name}`,
    prompt: `使用「${deck.name}」案例创建一份${deck.format}`,
    type: deck.format,
    mode: '标准',
    imgMode: '自动',
    expert: null,
    template: deck.name,
    origin: 'template',
    attachments: [],
    folderId: null,
    shared: false,
    deleted: false,
    createdAt: now,
    updatedAt: now,
  }
  store.state.gammas.unshift(gamma)
  store.state.conversations.unshift({ id: uid('c'), gammaId: gamma.id, title: gamma.title, at: now })
  store.state.tasks.unshift({
    id: uid('t'), gammaId: gamma.id, name: gamma.title, prompt: gamma.prompt,
    mode: gamma.mode, type: gamma.type, skill: null,
    status: '已完成', createdAt: now, finishedAt: now, artifact: null,
    files: [],
  })
  store.state.tasks = store.state.tasks.slice(0, 50)
  store.save()
  toast(`已套用「${deck.name}」案例，消耗 ${cost} 积分（剩余 ${store.state.credits}）`)
  setTimeout(() => { location.href = 'index.html' }, 1200)
}

/* ---------------- 页面初始化 ---------------- */

renderGrid()

// 头部统计
$('#case-count').textContent = CASE_DECKS.length
$('#case-total-pages').textContent = CASE_DECKS.reduce((sum, d) => sum + d.pageCount, 0)
