import {
  destinations,
  imageURL,
  QIYE_KEY,
  readQiyeState,
  initialQiyeState,
  filteredDestinations,
  addToTrip,
  moveTripItem,
} from './qiye-data.js'
const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  )
const paths = {
  home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
  discover: 'M15 9 9 11l-2 6 6-2 2-6ZM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  trips: 'm3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16',
  heart:
    'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
  profile: 'M20 21a8 8 0 0 0-16 0M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  back: 'M19 12H5m6-6-6 6 6 6',
  search: 'M21 21l-5-5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14',
  plus: 'M12 5v14M5 12h14',
  pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  clock: 'M12 8v5l3 2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  leaf: 'M20 3C8 1 1 10 7 17s15-1 13-14ZM5 21 16 10',
  close: 'M6 6l12 12M6 18 18 6',
  check: 'm5 12 4 4L19 6',
  up: 'm6 14 6-6 6 6',
  down: 'm6 10 6 6 6-6',
  trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
}
const icon = (name, cls = '') =>
  `<svg class="q-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.leaf}"/></svg>`
let storage
try {
  storage = window.localStorage
} catch {
  storage = {
    getItem: () => null,
    setItem: () => {
      throw Error('storage')
    },
  }
}
let state = readQiyeState(storage),
  tag = '全部',
  duration = '全部',
  query = '',
  galleryIndex = 0,
  detailBack = '#discover',
  modalReturn = null
const root = document.querySelector('#qiye-app'),
  modalRoot = document.querySelector('#qiye-modal-root')
const nav = [
  ['home', 'home', '去出走'],
  ['discover', 'discover', '发现目的地'],
  ['trips', 'trips', '我的行程'],
  ['saved', 'heart', '心愿收藏'],
  ['profile', 'profile', '我的'],
]
function route() {
  const [name, id] = location.hash.slice(1).split('/')
  return { name: nav.some((x) => x[0] === name) || name === 'destination' ? name : 'home', id }
}
function toast(message) {
  const el = document.querySelector('#qiye-toast')
  el.textContent = message
  el.classList.add('show')
  clearTimeout(toast.timer)
  toast.timer = setTimeout(() => el.classList.remove('show'), 2400)
}
function persist() {
  try {
    storage.setItem(QIYE_KEY, JSON.stringify(state))
    return true
  } catch {
    toast('浏览器未允许保存，当前修改仅在本次预览保留')
    return false
  }
}
function go(path) {
  if (route().name !== 'destination' && path.startsWith('#destination'))
    detailBack = location.hash || '#home'
  window.history.pushState(null, '', path)
  galleryIndex = 0
  render()
  document.querySelector('#q-main')?.focus({ preventScroll: true })
  window.scrollTo?.({ top: 0, behavior: 'instant' })
}
const currentTrip = () => state.trips.find((t) => t.id === state.activeTrip) || null
const find = (id) => destinations.find((d) => d.id === id)
function saveButton(d) {
  return `<button class="q-save ${state.saved.includes(d.id) ? 'is-saved' : ''}" data-save="${d.id}" aria-label="${state.saved.includes(d.id) ? '取消收藏' : '收藏'}${d.name}" aria-pressed="${state.saved.includes(d.id)}">${icon('heart')}</button>`
}
function card(d, wide = false) {
  return `<article class="q-card ${wide ? 'q-card-wide' : ''}"><div class="q-card-image"><a href="#destination/${d.id}" data-go="#destination/${d.id}" aria-label="探索${d.name}"><img src="${imageURL(d.image)}" alt="${d.name}的 AI 场景示意图" loading="lazy"></a><span class="q-tag">${d.tag}</span>${saveButton(d)}</div><div class="q-card-meta"><span>${d.region}</span><span>${d.days} 天</span></div><a class="q-card-title" href="#destination/${d.id}" data-go="#destination/${d.id}">${d.name}${icon('arrow')}</a><p>${d.highlights[0]}，${d.highlights[1]}。</p><div class="q-card-bottom"><span>${icon('clock')}${d.distance}车程</span><span>¥ <b>${d.budget}</b><small> / 人起 · 示例</small></span></div></article>`
}
function sectionTitle(kicker, title, link = '') {
  return `<div class="q-section-title"><div><span class="q-eyebrow">${kicker}</span><h2>${title}</h2></div>${link}</div>`
}
const linkAll = () =>
  `<a href="#discover" data-go="#discover" class="q-text-link">全部目的地 ${icon('arrow')}</a>`
function home() {
  const recommended = destinations.filter((d) => state.preferences.includes(d.kind))
  const picks = [...recommended, ...destinations.filter((d) => !recommended.includes(d))].slice(
    0,
    3,
  )
  return `<div class="q-welcome"><div><span class="q-eyebrow">A LITTLE ESCAPE, A LOT OF LIFE</span><h1>周末，去自然里。</h1><p>不必走得很远，也能离日常远一点。</p></div><span class="q-season">${icon('leaf')} 秋日出走计划 <i></i> VOL. 01</span></div><section class="q-hero"><img src="${imageURL('mountain')}" alt="山间营地的 AI 场景示意图" fetchpriority="high"><div class="q-hero-shade"></div><div class="q-hero-copy"><span>本 周 精 选 · 山 野 露 营</span><h2>把周末，<br>还给山野。</h2><p>去山里住一晚，收藏一整个清晨的风。</p><button class="q-button q-cream" data-go="#destination/mountain">探索青岚山谷 ${icon('arrow')}</button></div><div class="q-hero-foot"><span>QIYE SELECTED / 001</span><span>${icon('pin')} 青岚山谷 · 示例目的地</span></div><div class="q-hero-number">01 <span>/ 05</span></div></section><section class="q-moods"><div><span class="q-eyebrow">FIND YOUR OWN PACE</span><h3>这个周末，<br>想怎么过？</h3></div>${[
    ['mountain', '山野露营', '听风，也听自己'],
    ['coast', '海边漫步', '让心事随海浪走'],
    ['town', '古镇闲逛', '在旧时光里慢下来'],
    ['forest', '林间小住', '把日子过得轻一点'],
  ]
    .map(
      ([id, label, sub]) =>
        `<button class="q-mood" data-mood="${label}"><img src="${imageURL(id)}" alt=""><span>${label}<small>${sub}</small></span>${icon('arrow')}</button>`,
    )
    .join(
      '',
    )}</section><section>${sectionTitle('WEEKEND WISHLIST', '总有一处，适合现在的你', linkAll())}<div class="q-card-grid">${picks.map((d) => card(d)).join('')}</div></section><section class="q-note"><span class="q-note-symbol">${icon('leaf')}</span><div><span class="q-eyebrow">LESS PLANNING. MORE LIVING.</span><h2>好风景不赶时间，你也不用。</h2><p>把喜欢的地方加进行程，留一点空白给偶然。</p></div><button class="q-button q-outline" data-new-trip>计划一次小出走 ${icon('plus')}</button></section>`
}
function discover() {
  const list = filteredDestinations({ query, tag, duration })
  return `<div class="q-page-heading"><span class="q-eyebrow">SOMEWHERE THAT FEELS LIKE YOU</span><h1>发现你的下一站</h1><p>山野、海岸，或是一间不被打扰的小屋。</p></div><form class="q-search-form" id="q-search-form"><label>${icon('search')}<input id="q-discover-search" type="search" aria-label="搜索目的地" placeholder="搜索目的地、风景或想做的事" value="${esc(query)}"></label><button class="q-button" type="submit">寻找灵感 ${icon('arrow')}</button></form><div class="q-filter-line"><div class="q-chips">${['全部', ...destinations.map((d) => d.tag)].map((t) => `<button data-tag="${t}" class="${tag === t ? 'active' : ''}" aria-pressed="${tag === t}">${t}</button>`).join('')}</div><label class="q-duration">出走时间 <select id="q-duration" aria-label="按旅行天数筛选"><option value="全部">不限天数</option><option value="1" ${duration === '1' ? 'selected' : ''}>1 天</option><option value="2" ${duration === '2' ? 'selected' : ''}>2 天</option></select></label></div><p class="q-result-count" aria-live="polite">为你找到 <b>${list.length}</b> 个出走灵感 <button class="q-clear" data-clear-filters>重置筛选</button></p><div class="q-card-grid q-discover-grid">${list.map((d) => card(d)).join('')}</div>${!list.length ? empty('没有找到这片风景', '换个关键词，或清空筛选，再发现一个喜欢的地方。', '重新发现', 'clear') : ''}`
}
function detail(id) {
  const d = find(id)
  if (!d) return empty('这处风景暂时找不到了', '换个地方，继续出发。', '回到发现', '#discover')
  galleryIndex %= d.gallery.length
  return `<div class="q-detail-top"><button class="q-back" data-go="${esc(detailBack)}">${icon('back')} 返回探索</button><span>${d.region} / ${d.tag}</span>${saveButton(d)}</div><div class="q-detail-gallery"><img src="${imageURL(d.gallery[galleryIndex])}" alt="${d.name}场景灵感 ${galleryIndex + 1}，AI 生成"><span class="q-image-disclosure">AI 场景示意 · 非实地照片</span><div class="q-gallery-controls">${d.gallery.map((img, i) => `<button data-gallery="${i}" aria-label="查看第 ${i + 1} 张图片" aria-pressed="${galleryIndex === i}" class="${galleryIndex === i ? 'active' : ''}"></button>`).join('')}<span>${galleryIndex + 1} / ${d.gallery.length}</span></div></div><div class="q-detail-columns"><section><span class="q-eyebrow">A PLACE TO SLOW DOWN</span><h1>${d.name}</h1><p class="q-detail-lead">${d.description}</p><div class="q-facts"><span>${icon('clock')} ${d.days} 天慢游</span><span>${icon('pin')} ${d.distance}车程</span><span>${icon('leaf')} ${d.kind}</span></div><h2 class="q-small-title">值得为它出发的理由</h2><div class="q-highlights">${d.highlights.map((h, i) => `<div><span>0${i + 1}</span><p>${h}</p></div>`).join('')}</div><h2 class="q-small-title">不赶路的游玩建议</h2><ol class="q-schedule">${d.schedule.map((s) => `<li>${s}</li>`).join('')}</ol></section><aside class="q-bookmark-panel"><span class="q-eyebrow">MAKE IT YOUR WEEKEND</span><h3>下一次出走，就去这里。</h3><p>示例预算 / 每人</p><strong>¥${d.budget}<small> 起</small></strong><button class="q-button" data-add="${d.id}">${icon('plus')} 加入我的行程</button><button class="q-button q-outline" data-save="${d.id}">${icon('heart')} ${state.saved.includes(d.id) ? '已收藏，点击取消' : '先收藏这片风景'}</button><small class="q-disclaimer">演示目的地。图片由 AI 生成；距离、预算和游玩安排均为示例，不构成预订或出行建议。切换图片展示的是场景灵感，不代表同一真实地点。</small></aside></div>`
}
function empty(title, copy, button, path) {
  return `<div class="q-empty">${icon('leaf')}<h2>${title}</h2><p>${copy}</p><button class="q-button" ${path === 'clear' ? 'data-clear-filters' : `data-go="${path}"`}>${button} ${icon('arrow')}</button></div>`
}
function trips() {
  const t = currentTrip()
  return `<div class="q-page-heading q-heading-row"><div><span class="q-eyebrow">LEAVE ROOM FOR THE UNEXPECTED</span><h1>我的出走计划</h1><p>喜欢的地方慢慢走，行程不必排得太满。</p></div><button class="q-button" data-new-trip>${icon('plus')} 新建行程</button></div>${
    !t
      ? empty(
          '还没有计划好的周末',
          '从一个喜欢的地方开始，给自己安排一次小出走。',
          '去发现目的地',
          '#discover',
        )
      : `<div class="q-trip-selector">${state.trips.map((x) => `<button class="${x.id === t.id ? 'active' : ''}" data-trip="${esc(x.id)}">${icon('trips')} ${esc(x.name)}</button>`).join('')}</div><div class="q-itinerary-layout"><section><div class="q-trip-head"><h2>${esc(t.name)}</h2><button class="q-icon-button" data-delete-trip="${esc(t.id)}" aria-label="删除此行程">${icon('trash')}</button></div>${Array.from(
          { length: t.days },
          (_, i) => i + 1,
        )
          .map(
            (day) =>
              `<section class="q-day"><h3><span>DAY 0${day}</span> ${day === 1 ? '出发，把城市留在身后' : '慢一点，再慢一点'}</h3>${
                t.items
                  .filter((x) => x.day === day)
                  .map((item, i, items) => {
                    const d = find(item.id)
                    return `<article class="q-itinerary-item" data-trip-item="${d.id}"><span class="q-stop-no">${String(i + 1).padStart(2, '0')}</span><img src="${imageURL(d.image)}" alt=""><div><a href="#destination/${d.id}" data-go="#destination/${d.id}">${d.name}</a><p>${d.tag} · 示例预算 ¥${d.budget}/人</p><label>安排在 <select data-item-day="${d.id}" aria-label="${d.name}的出行日">${Array.from({ length: t.days }, (_, j) => `<option value="${j + 1}" ${j + 1 === day ? 'selected' : ''}>第 ${j + 1} 天</option>`).join('')}</select></label></div><div class="q-item-tools"><button data-move="${d.id}" data-direction="-1" aria-label="上移${d.name}" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button><button data-move="${d.id}" data-direction="1" aria-label="下移${d.name}" ${i === items.length - 1 ? 'disabled' : ''}>${icon('down')}</button><button data-remove="${d.id}" aria-label="移除${d.name}">${icon('close')}</button></div></article>`
                  })
                  .join('') ||
                '<p class="q-day-empty">留白也是一种安排。去添加一个喜欢的地方吧。</p>'
              }<button class="q-add-stop" data-go="#discover">${icon('plus')} 添加目的地</button></section>`,
          )
          .join(
            '',
          )}</section><aside class="q-trip-summary"><span class="q-eyebrow">YOUR LITTLE ESCAPE</span><h3>这一趟，刚刚好。</h3><div><b>${t.days}</b><span>天的慢时光</span></div><div><b>${t.items.length}</b><span>个喜欢的地方</span></div><p>示例预算合计 <strong>¥${t.items.reduce((s, x) => s + find(x.id).budget, 0)}</strong></p><small>仅按已添加目的地的示例预算相加，未核实交通距离，不含实际订单、预订或费用承诺。</small></aside></div>`
  }`
}
function saved() {
  const list = destinations.filter((d) => state.saved.includes(d.id))
  return `<div class="q-page-heading"><span class="q-eyebrow">KEEP A LITTLE WANDERLUST</span><h1>收藏一份向往</h1><p>现在还没出发的地方，总有一个周末会抵达。<span class="q-count-pill">${list.length} 处收藏</span></p></div>${list.length ? `<div class="q-card-grid">${list.map((d) => card(d)).join('')}</div>` : empty('把喜欢的风景留在这里', '点击目的地上的爱心，就能在这里再见。', '去发现喜欢', '#discover')}`
}
function profile() {
  return `<div class="q-page-heading"><span class="q-eyebrow">YOUR OWN WAY TO WANDER</span><h1>旅行，也是认识自己。</h1><p>你的节奏，就是最好的旅行方式。</p></div><section class="q-profile-card"><div class="q-avatar">${icon('leaf')}</div><div><h2>${esc(state.name)}</h2><p>不赶时间的周末旅人</p></div><button class="q-button q-outline" data-edit-name>编辑昵称</button></section><div class="q-profile-stats"><button data-go="#saved"><b>${state.saved.length}</b><span>心愿目的地 ${icon('arrow')}</span></button><button data-go="#trips"><b>${state.trips.length}</b><span>我的出走计划 ${icon('arrow')}</span></button></div><section class="q-settings"><h2>找到你的旅行节奏</h2><p>选择喜欢的方式，首页会优先展示相关灵感。</p><div class="q-chips">${['慢旅行', '轻徒步', '放空休息'].map((p) => `<button data-preference="${p}" class="${state.preferences.includes(p) ? 'active' : ''}" aria-pressed="${state.preferences.includes(p)}">${p} ${state.preferences.includes(p) ? icon('check') : icon('plus')}</button>`).join('')}</div><label class="q-setting-row">紧凑显示<small>减少卡片留白，浏览更多目的地</small><input id="q-compact" type="checkbox" role="switch" ${state.compact ? 'checked' : ''}></label><div class="q-setting-row"><div>本地数据<small>收藏、行程和偏好仅保存在此浏览器，不会上传。</small></div><button class="q-clear" data-reset>清空数据</button></div></section><section class="q-about"><span class="q-eyebrow">ABOUT THIS PROTOTYPE</span><p>栖野 QIYE · Design Buddy App 案例</p><p>6 个交互页面 · 5 张专属 AI 场景图。目的地、预算及车程均为示例；未接入登录、支付、预订、实时天气或导航服务。</p><a href="/templates.html">返回 Design Buddy 作品展 ↗</a></section>`
}
function render() {
  const r = route()
  const active = r.name === 'destination' ? 'discover' : r.name
  document.body.classList.toggle('q-compact', state.compact)
  root.innerHTML = `<aside class="q-sidebar"><a class="q-brand" href="#home" data-go="#home">${icon('leaf')}<strong>栖野<span>QIYE</span></strong></a><p class="q-brand-caption">把周末，还给自己。</p><nav aria-label="主导航">${nav.map(([id, i, label]) => `<a href="#${id}" data-go="#${id}" class="${active === id ? 'active' : ''}" ${active === id ? 'aria-current="page"' : ''}>${icon(i)}<span>${label}</span>${active === id ? '<i></i>' : ''}</a>`).join('')}</nav><div class="q-sidebar-note"><span>WEEKEND, UNHURRIED.</span><p>生活有很多种打开方式，<br>不妨先走进自然。</p>${icon('leaf')}</div><a class="q-workspace-link" href="/templates.html">${icon('back')} 回到作品展</a></aside><div class="q-body"><header class="q-topbar"><a class="q-mobile-brand" href="#home" data-go="#home">${icon('leaf')} 栖野</a><span class="q-departure">${icon('pin')} 杭州出发 <small>· 示例</small></span><div class="q-top-actions"><span class="q-prototype-badge">可交互 App 原型</span><button class="q-top-search" data-go="#discover" aria-label="搜索目的地">${icon('search')}</button><button class="q-mini-avatar" data-go="#profile" aria-label="我的资料">${icon('profile')}</button></div></header><main id="q-main" tabindex="-1">${r.name === 'home' ? home() : r.name === 'discover' ? discover() : r.name === 'destination' ? detail(r.id) : r.name === 'trips' ? trips() : r.name === 'saved' ? saved() : profile()}</main><footer class="q-footer"><span>栖野 QIYE <i>—</i> 周末，去自然里。</span><span>AI 图片 · 虚构目的地 · 示例行程</span></footer></div><nav class="q-bottom-nav" aria-label="移动端导航">${nav.map(([id, i, label]) => `<a href="#${id}" data-go="#${id}" class="${active === id ? 'active' : ''}" ${active === id ? 'aria-current="page"' : ''}>${icon(i)}<span>${label === '发现目的地' ? '发现' : label === '心愿收藏' ? '收藏' : label === '我的行程' ? '行程' : label}</span></a>`).join('')}</nav>`
  document.title = `${{ home: '去出走', discover: '发现', destination: find(r.id)?.name || '目的地', trips: '我的行程', saved: '收藏', profile: '我的' }[r.name]} · 栖野 QIYE`
}
function closeModal() {
  modalRoot.innerHTML = ''
  modalReturn?.focus()
  modalReturn = null
}
function modal(title, body) {
  modalReturn = document.activeElement
  modalRoot.innerHTML = `<div class="q-modal-mask"><section class="q-modal" role="dialog" aria-modal="true" aria-labelledby="q-dialog-title"><button class="q-modal-close" data-close-modal aria-label="关闭">${icon('close')}</button><span class="q-eyebrow">YOUR NEXT LITTLE ESCAPE</span><h2 id="q-dialog-title">${title}</h2>${body}</section></div>`
  ;(
    modalRoot.querySelector('input:not([type="hidden"]),select,button[type="submit"]') ||
    modalRoot.querySelector('[data-close-modal]')
  )?.focus()
}
function newTrip(addId = '') {
  modal(
    '给这次出走起个名字',
    `<form id="q-new-trip"><input type="hidden" name="addId" value="${addId}"><label>行程名称<input name="name" required maxlength="40" placeholder="例如：周末山野两日游" value="周末小出走"></label><label>慢游几天<select name="days"><option value="1">1 天</option><option value="2" selected>2 天</option><option value="3">3 天</option></select></label><button class="q-button" type="submit">创建行程 ${icon('arrow')}</button></form>`,
  )
}
function addModal(id) {
  if (!state.trips.length) {
    newTrip(id)
    return
  }
  modal(
    '把风景放进行程',
    `<form id="q-add-trip"><input type="hidden" name="destination" value="${id}"><label>选择行程<select name="trip">${state.trips.map((t) => `<option value="${esc(t.id)}" ${t.id === state.activeTrip ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label><p class="q-form-note">先加入第 1 天，可在行程页调整日期和顺序。</p><button class="q-button" type="submit">加入行程 ${icon('plus')}</button></form><button class="q-text-link" data-new-trip="${id}">或新建一个行程</button>`,
  )
}
function clickHandler(e) {
  const b = e.target.closest('button,a')
  if (!b) return
  if (b.hasAttribute('data-go')) {
    e.preventDefault()
    go(b.dataset.go)
    return
  }
  if (b.hasAttribute('data-save')) {
    const id = b.dataset.save
    if (!find(id)) return
    state.saved = state.saved.includes(id)
      ? state.saved.filter((x) => x !== id)
      : [...state.saved, id]
    const ok = persist()
    render()
    if (ok) toast(state.saved.includes(id) ? '已收藏，留给下个周末' : '已取消收藏')
    return
  }
  if (b.hasAttribute('data-mood')) {
    tag = b.dataset.mood
    duration = '全部'
    query = ''
    go('#discover')
    return
  }
  if (b.hasAttribute('data-tag')) {
    tag = b.dataset.tag
    render()
    return
  }
  if (b.hasAttribute('data-clear-filters')) {
    tag = '全部'
    duration = '全部'
    query = ''
    render()
    return
  }
  if (b.hasAttribute('data-gallery')) {
    galleryIndex = Number(b.dataset.gallery)
    render()
    return
  }
  if (b.hasAttribute('data-close-modal')) {
    closeModal()
    return
  }
  if (b.hasAttribute('data-new-trip')) {
    newTrip(b.dataset.newTrip)
    return
  }
  if (b.hasAttribute('data-add')) {
    addModal(b.dataset.add)
    return
  }
  if (b.hasAttribute('data-trip')) {
    state.activeTrip = b.dataset.trip
    persist()
    render()
    return
  }
  if (b.hasAttribute('data-move')) {
    if (moveTripItem(currentTrip(), b.dataset.move, Number(b.dataset.direction))) {
      persist()
      render()
    }
    return
  }
  if (b.hasAttribute('data-remove')) {
    const t = currentTrip()
    if (t) {
      t.items = t.items.filter((i) => i.id !== b.dataset.remove)
      persist()
      render()
      toast('已从行程移除')
    }
    return
  }
  if (b.hasAttribute('data-delete-trip')) {
    modal(
      '删除这次出走计划？',
      `<p>只删除行程，不会影响已收藏的目的地。</p><button class="q-button q-danger" data-confirm-delete="${esc(b.dataset.deleteTrip)}">确认删除</button>`,
    )
    return
  }
  if (b.hasAttribute('data-confirm-delete')) {
    state.trips = state.trips.filter((t) => t.id !== b.dataset.confirmDelete)
    state.activeTrip = state.trips[0]?.id || null
    persist()
    closeModal()
    render()
    return
  }
  if (b.hasAttribute('data-preference')) {
    const p = b.dataset.preference
    state.preferences = state.preferences.includes(p)
      ? state.preferences.filter((x) => x !== p)
      : [...state.preferences, p]
    persist()
    render()
    return
  }
  if (b.hasAttribute('data-edit-name')) {
    modal(
      '怎么称呼这位旅人？',
      `<form id="q-name-form"><label>昵称<input name="name" value="${esc(state.name)}" required maxlength="24"></label><button class="q-button" type="submit">保存昵称</button></form>`,
    )
    return
  }
  if (b.hasAttribute('data-reset')) {
    modal(
      '清空本地旅行数据？',
      `<p>这会移除本浏览器内的收藏、行程和偏好，无法撤销。</p><button class="q-button q-danger" data-confirm-reset>确认清空</button>`,
    )
    return
  }
  if (b.hasAttribute('data-confirm-reset')) {
    state = initialQiyeState()
    persist()
    closeModal()
    render()
    toast('本地数据已重置')
  }
}
root.addEventListener('click', clickHandler)
modalRoot.addEventListener('click', (e) => {
  if (e.target.classList.contains('q-modal-mask')) closeModal()
  else clickHandler(e)
})
root.addEventListener('input', (e) => {
  if (e.target.id === 'q-discover-search') {
    query = e.target.value
    const start = e.target.selectionStart
    render()
    const input = document.querySelector('#q-discover-search')
    input?.focus()
    try {
      input?.setSelectionRange(start, start)
    } catch {}
  }
})
root.addEventListener('change', (e) => {
  if (e.target.id === 'q-duration') {
    duration = e.target.value
    render()
  }
  if (e.target.hasAttribute('data-item-day')) {
    const t = currentTrip(),
      item = t?.items.find((i) => i.id === e.target.dataset.itemDay)
    if (item) {
      item.day = Number(e.target.value)
      persist()
      render()
    }
  }
  if (e.target.id === 'q-compact') {
    state.compact = e.target.checked
    persist()
    render()
  }
})
root.addEventListener('submit', (e) => {
  if (e.target.id === 'q-search-form') {
    e.preventDefault()
    query = e.target.querySelector('input').value
    render()
  }
})
modalRoot.addEventListener('submit', (e) => {
  e.preventDefault()
  const form = e.target,
    values = Object.fromEntries(
      [...form.elements].filter((x) => x.name).map((x) => [x.name, x.value]),
    )
  if (form.id === 'q-new-trip') {
    const name = values.name.trim()
    if (!name) {
      toast('给行程起个名字吧')
      return
    }
    const t = {
      id: `trip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.slice(0, 40),
      days: Number(values.days),
      items: [],
    }
    if (values.addId) addToTrip(t, values.addId)
    state.trips.push(t)
    state.activeTrip = t.id
    persist()
    closeModal()
    go('#trips')
  }
  if (form.id === 'q-add-trip') {
    const t = state.trips.find((t) => t.id === values.trip)
    if (!addToTrip(t, values.destination)) {
      toast('这个地方已经在行程里了')
      return
    }
    state.activeTrip = t.id
    persist()
    closeModal()
    go('#trips')
    toast('已加入行程，给周末留一点期待')
  }
  if (form.id === 'q-name-form') {
    const name = values.name.trim()
    if (!name) {
      toast('昵称不能只包含空格')
      return
    }
    state.name = name.slice(0, 24)
    persist()
    closeModal()
    render()
  }
})
document.addEventListener('keydown', (e) => {
  if (!modalRoot.firstChild) return
  if (e.key === 'Escape') closeModal()
  if (e.key === 'Tab') {
    const controls = [
      ...modalRoot.querySelectorAll('button,input:not([type="hidden"]),select'),
    ].filter((x) => !x.disabled)
    const first = controls[0],
      last = controls.at(-1)
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }
})
window.addEventListener('popstate', () => {
  galleryIndex = 0
  render()
})
window.addEventListener('hashchange', () => {
  galleryIndex = 0
  render()
})
if (new URLSearchParams(location.search).has('embed')) document.body.classList.add('q-embedded')
render()
