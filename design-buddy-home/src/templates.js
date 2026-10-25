/* ============================================================
   探索模板页：筛选 / 搜索 / 排序保留，套用模板真实生成 gamma
   侧栏四个视图：工作区模板 / 最近 / 由您创建 / 已归档（持久化）
   ============================================================ */

import './rail-flyout.js'
import { store, toast, openModal, confirmModal, uid, fmtDate } from './core.js'
import { initGlobalUI, openUpgrade } from './global-ui.js'

initGlobalUI()

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

/* ---------------- 内置 24 套模板 ---------------- */

const CATEGORIES_VISIBLE = [
  ['课程', 220],
  ['提案', 181],
  ['报告', 159],
  ['融资演讲稿', 153],
  ['营销材料', 140],
  ['培训', 126],
  ['商业规划', 116],
  ['活动', 103],
]
const CATEGORIES_HIDDEN = ['作品集', '品牌设计', '教育', '科技', '医疗健康', '艺术', '文化', '旅游', '餐饮', '零售', '建筑']

const TEMPLATES = [
  { name: '渔港日记', cls: 'tpl-shipu', a: '石', b: 'SHIPU', format: '演示文稿', cats: ['文化', '营销材料'] },
  { name: '水墨亭', cls: 'tpl-ink', a: '澄湖', b: 'INK PAVILION', format: '文档', cats: ['文化', '艺术'] },
  { name: 'Overtime', cls: 'tpl-overtime', a: '年终大复盘！', b: 'Phew!! Still cooking', format: '演示文稿', cats: ['培训', '商业规划'] },
  { name: '朱砂册页', cls: 'tpl-cinnabar', a: '茶事雅集', b: '', format: '社交轮播卡片', cats: ['文化', '活动'] },
  { name: '讲堂', cls: 'tpl-lecture', a: '城市生态：六周观察课', b: 'URBAN ECOLOGY', format: '演示文稿', cats: ['课程', '教育'] },
  { name: '国潮商务路演', cls: 'tpl-guochao', a: '用调度效率提升每一块算力的产出', b: '', format: '演示文稿', cats: ['融资演讲稿', '商业规划'] },
  { name: 'Quire', cls: 'tpl-quire', a: 'Back of House', b: '2026 RESTAURANT SURVEY', format: '文档', cats: ['报告', '餐饮'] },
  { name: 'Full Record', cls: 'tpl-fullrecord', a: 'Amara Osei', b: 'FULL RECORD', format: '文档', cats: ['作品集', '品牌设计'] },
  { name: 'Fit Check', cls: 'tpl-fitcheck', a: 'HOMEROOM', b: 'GENERAL UNIFORM POLICY', format: '社交轮播卡片', cats: ['营销材料', '零售'] },
  { name: 'First Edition', cls: 'tpl-firstedition', a: 'Salt and Lemon', b: 'FIRST EDITION', format: '文档', cats: ['作品集', '艺术'] },
  { name: 'The Web Between Us', cls: 'tpl-web', a: 'THE WEB BETWEEN US', b: '', format: '社交轮播卡片', cats: ['科技', '艺术'] },
  { name: 'Soft Current', cls: 'tpl-soft', a: 'Migraine is more than a headache', b: '', format: '社交轮播卡片', cats: ['医疗健康', '课程'] },
  { name: 'Spark and Fire', cls: 'tpl-spark', a: '', b: 'SPARK AND FIRE', format: '演示文稿', cats: ['培训', '活动'] },
  { name: 'Scintilla', cls: 'tpl-scintilla', a: 'The secret life of pollinators', b: '', format: '演示文稿', cats: ['教育', '科技'] },
  { name: 'Sisyphus Riso', cls: 'tpl-sisyphus', a: 'FIND DELIGHT IN PUSHING YOUR ROCK UP YOUR HILL', b: '', format: '演示文稿', cats: ['培训', '商业规划'] },
  { name: 'Rebuilding the Past', cls: 'tpl-rebuilding', a: 'Rebuilding the Past', b: '', format: '演示文稿', cats: ['报告', '建筑'] },
  { name: 'Metamorphosis', cls: 'tpl-metamorphosis', a: '', b: 'METAMORPHOSIS', format: '社交轮播卡片', cats: ['艺术', '品牌设计'] },
  { name: 'Luminal', cls: 'tpl-luminal', a: 'The quiet cascade', b: '', format: '演示文稿', cats: ['作品集', '艺术'] },
  { name: 'Inner Weather', cls: 'tpl-inner', a: '', b: 'INNER WEATHER', format: '文档', cats: ['课程', '医疗健康'] },
  { name: 'Hush', cls: 'tpl-hush', a: 'Our year at the Brierley Institute', b: '', format: '文档', cats: ['报告', '文化'] },
  { name: 'Buzzer', cls: 'tpl-buzzer', a: 'TRIVIA NIGHT', b: 'Harper Street Library · Friday March 14', format: '演示文稿', cats: ['活动', '餐饮'] },
  { name: 'Vista', cls: 'tpl-vista', a: 'Kalai Retreat', b: '', format: '演示文稿', cats: ['旅游', '建筑'] },
  { name: 'Open House', cls: 'tpl-openhouse', a: '214 Birchwood Lane', b: '', format: '演示文稿', cats: ['建筑', '营销材料'] },
  { name: 'Monsoon Modern', cls: 'tpl-monsoon', a: 'A SEASON OF MAKING TOGETHER', b: '', format: '社交轮播卡片', cats: ['活动', '品牌设计'] },
]

const FOLDER_ICON = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`

const view = {
  scope: 'workspace', // workspace | recent | mine | archived
  format: 'all',
  categories: new Set(),
  query: '',
  sort: 'date',
}

/* ---------------- 类别清单 ---------------- */

const categoryBody = $('#category-body')

function categoryRow(name, count) {
  const label = document.createElement('label')
  label.className = 'filter-option'
  label.innerHTML = `
    <input type="checkbox" value="${name}" />
    <span>${name}</span>
    ${count ? `<span class="count">${count}</span>` : ''}`
  return label
}

for (const [name, count] of CATEGORIES_VISIBLE) categoryBody.appendChild(categoryRow(name, count))
const extraWrap = document.createElement('div')
extraWrap.className = 'cat-extra'
extraWrap.hidden = true
for (const name of CATEGORIES_HIDDEN) extraWrap.appendChild(categoryRow(name))
categoryBody.appendChild(extraWrap)

const catToggle = document.createElement('button')
catToggle.type = 'button'
catToggle.className = 'cat-toggle'
catToggle.textContent = `显示更多 ${CATEGORIES_HIDDEN.length}`
categoryBody.appendChild(catToggle)
catToggle.addEventListener('click', () => {
  const expanded = !extraWrap.hidden
  extraWrap.hidden = expanded
  catToggle.textContent = expanded ? `显示更多 ${CATEGORIES_HIDDEN.length}` : '收起'
})

/* ---------------- 数据集合 ---------------- */

function allTemplates() {
  const customs = (store.state.customTemplates ?? []).map((t) => ({ ...t, custom: true }))
  return [...TEMPLATES, ...customs]
}

function scopedTemplates() {
  const customs = store.state.customTemplates
  switch (view.scope) {
    case 'recent': {
      const used = store.state.gammas
        .filter((g) => g.template)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((g) => g.template)
      const uniq = [...new Set(used)]
      return uniq.map((name) => allTemplates().find((t) => t.name === name)).filter(Boolean)
    }
    case 'mine':
      return customs.filter((t) => !t.archived)
    case 'archived':
      return customs.filter((t) => t.archived)
    default:
      return allTemplates().filter((t) => !t.archived)
  }
}

/* ---------------- 网格渲染 ---------------- */

const grid = $('#tpl-grid')
const empty = $('#tpl-empty')

function renderGrid(items) {
  grid.innerHTML = items.map((tpl) => `
    <article class="tpl-card" data-name="${tpl.name}" ${tpl.custom ? `data-custom="${tpl.id}"` : ''}>
      <div class="tpl-cover ${tpl.cls ?? 'tpl-custom'}" ${tpl.cover ? `style="--custom-cover:${tpl.cover}"` : ''}>
        ${tpl.custom ? '<span class="tc-custom-tag">我的模板</span>' : ''}
        ${tpl.a ? `<span class="tc-a">${tpl.a}</span>` : ''}
        ${tpl.b ? `<span class="tc-b">${tpl.b}</span>` : ''}
      </div>
      <p class="tpl-name">${FOLDER_ICON}<span>${tpl.name}</span></p>
    </article>`).join('')
  const none = items.length === 0
  empty.hidden = !none
  grid.hidden = none
  if (none) {
    const map = {
      recent: ['还没有用过模板', '套用任意模板后，它会自动出现在「最近」里。'],
      mine: ['还没有自建模板', '点击侧栏底部的「新建模板」，把常用结构沉淀下来。'],
      archived: ['归档中没有模板', '自建模板可在卡片菜单中归档，之后在这里恢复。'],
      workspace: ['没有匹配的模板', '试试调整筛选或搜索关键词。'],
    }
    const [title, copy] = map[view.scope]
    empty.querySelector('p').textContent = `${title}。${copy}`
  }
}

function applyView() {
  let items = scopedTemplates().filter((tpl) => {
    const formatOk = view.format === 'all' || tpl.format === view.format
    const catOk = view.categories.size === 0 || tpl.cats.some((c) => view.categories.has(c))
    const queryOk = !view.query || tpl.name.toLowerCase().includes(view.query)
    return formatOk && catOk && queryOk
  })
  if (view.sort === 'name') items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
  renderGrid(items)
}

/* ---------------- 侧栏视图切换 ---------------- */

$$('[data-demo]').forEach((nav) => {
  if (!['工作区模板', '最近', '由您创建', '已归档'].includes(nav.dataset.demo)) return
  nav.addEventListener('click', (e) => {
    e.preventDefault()
    view.scope = { 工作区模板: 'workspace', 最近: 'recent', 由您创建: 'mine', 已归档: 'archived' }[nav.dataset.demo]
    $$('.tpl-side-nav .nav-item, .sidebar .nav-item').forEach((n) => n.classList.remove('nav-item-active'))
    nav.classList.add('nav-item-active')
    applyView()
  })
})

/* ---------------- 筛选 / 搜索 / 排序 ---------------- */

$$('input[name="format"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    view.format = radio.value
    applyView()
  })
})

categoryBody.addEventListener('change', (event) => {
  const box = event.target
  if (!(box instanceof HTMLInputElement) || box.type !== 'checkbox') return
  if (box.checked) view.categories.add(box.value)
  else view.categories.delete(box.value)
  applyView()
})

$('#tpl-search-input').addEventListener('input', (event) => {
  view.query = event.target.value.trim().toLowerCase()
  applyView()
})

const sortBtn = $('#sort-btn')
const sortMenu = $('#sort-menu')
const sortLabel = $('#sort-label')

sortBtn.addEventListener('click', (event) => {
  event.stopPropagation()
  sortMenu.hidden = !sortMenu.hidden
  sortBtn.setAttribute('aria-expanded', String(!sortMenu.hidden))
})
document.addEventListener('click', () => {
  sortMenu.hidden = true
  sortBtn.setAttribute('aria-expanded', 'false')
})
sortMenu.addEventListener('click', (event) => {
  const option = event.target.closest('.sort-option')
  if (!option) return
  view.sort = option.dataset.sort
  sortLabel.textContent = option.textContent.trim()
  $$('.sort-option', sortMenu).forEach((btn) => btn.classList.toggle('is-selected', btn === option))
  sortMenu.hidden = true
  applyView()
})

$$('.filter-head').forEach((head) => {
  head.addEventListener('click', () => head.closest('.filter-group').classList.toggle('collapsed'))
})

$('#tpl-reset').addEventListener('click', () => {
  view.format = 'all'
  view.categories.clear()
  view.query = ''
  const allRadio = $('input[name="format"][value="all"]')
  if (allRadio) allRadio.checked = true
  $$('input[type="checkbox"]', categoryBody).forEach((box) => { box.checked = false })
  $('#tpl-search-input').value = ''
  applyView()
  toast('已清除全部筛选条件')
})

/* ---------------- 套用模板：真实生成 gamma ---------------- */

function useTemplate(tpl) {
  const cost = 3
  if (store.state.credits < cost) {
    confirmModal('积分不足', `套用模板需要 ${cost} 积分，当前仅剩 ${store.state.credits} 积分。是否前往充值？`, '去充值').then((ok) => {
      if (ok) openUpgrade()
    })
    return
  }
  const now = Date.now()
  const prompt = `使用「${tpl.name}」模板创作一份${tpl.format}`
  store.state.credits -= cost
  const gamma = {
    id: uid('g'),
    title: `模板创作 · ${tpl.name}`,
    prompt,
    type: tpl.format,
    mode: '标准',
    imgMode: '自动',
    expert: null,
    template: tpl.name,
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
  store.save()

  const { close, bodyEl, footEl } = openModal({
    title: `已套用模板 · ${tpl.name}`,
    body: `
      <p class="modal-copy">gamma 已创建并保存到当前工作区，消耗 ${cost} 积分（剩余 ${store.state.credits}）。</p>
      <p class="hint" style="margin-top:10px">创建时间：${fmtDate(now)}</p>
      <p class="hint">类型：${tpl.format} · 分类：${tpl.cats.join(' / ')}</p>`,
    footer: '<button class="btn btn-ghost" data-close>继续浏览</button><button class="btn btn-primary" data-go>回到首页查看</button>',
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
  footEl.querySelector('[data-go]').addEventListener('click', () => { location.href = 'index.html' })
  bodyEl // 保留引用，避免静态检查告警
}

grid.addEventListener('click', (event) => {
  const card = event.target.closest('.tpl-card')
  if (!card) return
  const tpl = allTemplates().find((t) => t.name === card.dataset.name)
  if (tpl) useTemplate(tpl)
})

/* ---------------- 自建模板 ---------------- */

function openTemplateCreator() {
  const { close, bodyEl, footEl } = openModal({
    title: '新建模板',
    body: `
      <div class="field"><label>模板名称</label><input type="text" id="ct-name" placeholder="例如：季度经营分析" /></div>
      <div class="field"><label>格式</label>
        <select id="ct-format">
          <option>演示文稿</option><option>文档</option><option>社交轮播卡片</option>
        </select></div>
      <div class="field"><label>分类（逗号分隔）</label><input type="text" id="ct-cats" placeholder="报告, 商业规划" /></div>
      <div class="field"><label>封面色</label><input type="color" id="ct-color" value="#3b6ef6" /></div>`,
    footer: '<button class="btn btn-ghost" data-close>取消</button><button class="btn btn-primary" data-ok>保存模板</button>',
  })
  footEl.querySelector('[data-ok]').addEventListener('click', () => {
    const name = bodyEl.querySelector('#ct-name').value.trim()
    if (!name) return toast('请输入模板名称')
    store.state.customTemplates.unshift({
      id: uid('tpl'),
      name,
      cls: null,
      a: name,
      b: '',
      format: bodyEl.querySelector('#ct-format').value,
      cats: bodyEl.querySelector('#ct-cats').value.split(/[,，]/).map((x) => x.trim()).filter(Boolean),
      cover: bodyEl.querySelector('#ct-color').value,
      archived: false,
      createdAt: Date.now(),
    })
    store.save()
    close()
    view.scope = 'mine'
    $$('[data-demo]').forEach((n) => n.classList.toggle('nav-item-active', n.dataset.demo === '由您创建'))
    applyView()
    toast(`模板「${name}」已保存`)
  })
  footEl.querySelector('[data-close]').addEventListener('click', close)
}

/* 侧栏底部新建入口（若模板页侧栏存在占位按钮则复用，否则注入） */
const sideCreate = $('[data-demo="新建模板"]')
if (sideCreate) {
  sideCreate.addEventListener('click', (e) => { e.preventDefault(); openTemplateCreator() })
} else {
  const cta = document.createElement('button')
  cta.className = 'btn btn-ghost'
  cta.style.cssText = 'margin:14px 18px;width:calc(100% - 36px)'
  cta.textContent = '＋ 新建模板'
  cta.addEventListener('click', openTemplateCreator)
  $('.sidebar .sidebar-inner')?.append(cta)
}

/* 自建模板的归档 / 删除：卡片右键菜单改用点击后弹窗确认 */
grid.addEventListener('contextmenu', (event) => {
  const card = event.target.closest('[data-custom]')
  if (!card) return
  event.preventDefault()
  const tpl = store.state.customTemplates.find((t) => t.id === card.dataset.custom)
  const { close, bodyEl } = openModal({
    title: tpl.name,
    body: `<div class="modal-list">
      <button class="modal-list-item" data-tpl-act="archive"><span class="grow"><span class="primary">${tpl.archived ? '恢复模板' : '归档模板'}</span></span></button>
      <button class="modal-list-item" data-tpl-act="delete"><span class="grow"><span class="primary" style="color:#d64545">删除模板</span></span></button>
    </div>`,
  })
  bodyEl.querySelector('[data-tpl-act="archive"]').addEventListener('click', () => {
    tpl.archived = !tpl.archived
    store.save()
    close()
    applyView()
    toast(tpl.archived ? '已归档' : '已恢复')
  })
  bodyEl.querySelector('[data-tpl-act="delete"]').addEventListener('click', () => {
    confirmModal('删除模板', `确定删除「${tpl.name}」吗？`, '删除').then((ok) => {
      if (!ok) return
      store.state.customTemplates = store.state.customTemplates.filter((t) => t.id !== tpl.id)
      store.save()
      close()
      applyView()
      toast('模板已删除')
    })
  })
})

/* 帮助 FAB（data-demo="帮助"）由 global-ui 委托统一处理 */

applyView()
