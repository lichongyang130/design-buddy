/* 任务十持久化专项：localStorage 落库、跨刷新还原、跨页面联动。
   jsdom 无 IndexedDB，媒体上传自动走 dataURL 降级路径。 */

import { loadPage, readState, click, input, tick, LS_KEY } from './helpers.mjs'
import { AUTH_KEY } from '../src/auth.js'

const results = []
const check = (name, ok, extra) => results.push([name, !!ok, extra])

/* ---------------- 1. 首页：发送提示词 → gamma 落库 + 扣积分 ---------------- */
{
  const { doc, w, errors, storage } = await loadPage('/index.html')
  check('home loads without errors', errors.length === 0, errors)

  const before = readState(storage)
  check('default credits 236', before.credits === 236)
  check('default media seeded (15 = 9 图 + 6 图形)', before.media.length === 15)

  input(w, doc.querySelector('#prompt-input'), '写一份季度经营分析演示文稿')
  click(w, doc.querySelector('#send-btn'))
  await tick()
  const after = readState(storage)
  check('send creates a gamma', after.gammas.length === 1 && after.gammas[0].prompt.includes('季度经营分析'))
  check('send deducts 3 credits (标准模式)', after.credits === 233)
  check('conversation recorded', after.conversations.length === 1)
  check('ui preference persisted (no type until one is picked)',
    after.ui.type === null && after.ui.mode === '标准')

  click(w, doc.querySelector('[data-quick-type="文档"]'))
  check('type choice persists', readState(storage).ui.type === '文档')

  // 工作区下拉：截图式白色卡片（设置 / 邀请 / 方案价格 + 新建）
  click(w, doc.querySelector('.workspace-switch'))
  await tick()
  const wsMenu = doc.querySelector('.ws-menu')
  check('ws menu card opens', !!wsMenu && !wsMenu.hidden)
  check('ws menu has settings entry', wsMenu.querySelector('[data-ws-settings]')?.textContent === '设置')
  check('ws menu has invite entry', wsMenu.querySelector('[data-ws-invite] span')?.textContent === '邀请团队成员')
  check('ws menu has pricing entry', wsMenu.querySelector('[data-ws-upgrade] span')?.textContent === '方案和价格')
  check('ws menu shows member count', /1 名成员/.test(wsMenu.querySelector('.ws-head-sub')?.textContent ?? ''))
  check('ws menu single workspace hides switch list', !wsMenu.querySelector('[data-ws]'))
  // 邀请入口打开真实弹窗
  click(w, wsMenu.querySelector('[data-ws-invite]'))
  await tick()
  check('ws invite opens modal', !!doc.querySelector('.modal-mask'))
  click(w, doc.querySelector('.modal-close'))
  await tick()

  // 工作区新建 + 切换
  click(w, doc.querySelector('.workspace-switch'))
  click(w, doc.querySelector('[data-ws-new]'))
  await tick()
  input(w, doc.querySelector('#ws-name'), '品牌设计组')
  click(w, doc.querySelector('.modal-foot [data-ok]'))
  await tick()
  const wsState = readState(storage)
  check('workspace created and activated', wsState.workspaces.length === 2 && wsState.activeWorkspaceId === wsState.workspaces[1].id)
  check('workspace switcher label updates', doc.querySelector('.workspace-name').textContent === '品牌设计组')
  // 多工作区后菜单出现切换列表，成员数随之更新
  click(w, doc.querySelector('.workspace-switch'))
  await tick()
  const wsMenu2 = doc.querySelector('.ws-menu')
  check('multi workspace shows switch rows', wsMenu2.querySelectorAll('[data-ws]').length === 2)
  check('member count tracks workspaces', /2 名成员/.test(wsMenu2.querySelector('.ws-head-sub')?.textContent ?? ''))
  click(w, doc.querySelector('.workspace-switch'))
  await tick()

  // 文件夹创建
  click(w, doc.querySelector('.folder-link'))
  await tick()
  input(w, doc.querySelector('#folder-name'), 'Q4 项目')
  click(w, doc.querySelector('.modal-foot [data-ok]'))
  await tick()
  check('folder persisted', readState(storage).folders.some((f) => f.name === 'Q4 项目'))
  check('folder rendered in sidebar', [...doc.querySelectorAll('.folder-row')].some((r) => r.textContent.includes('Q4 项目')))

  // 侧栏「最近的 gammas」弹窗读取真实数据
  const navRecent = [...doc.querySelectorAll('[data-nav]')].find((n) => n.textContent.includes('最近的 Design Buddy'))
  click(w, navRecent)
  await tick()
  check('gamma list modal shows stored gamma', doc.querySelector('.modal-list .gamma-title')?.textContent.includes('季度经营分析'))
  click(w, doc.querySelector('.modal-close'))

  // ⌘K 命令面板
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
  await tick()
  check('command palette opens', !!doc.querySelector('.palette-mask'))
  input(w, doc.querySelector('#palette-input'), '季度')
  await tick()
  check('palette finds stored gamma', doc.querySelectorAll('.palette-item').length === 1)
  click(w, doc.querySelector('.palette-mask'))
}

/* ---------------- 1b. gamma 详情：归入文件夹 + 共享开关 ---------------- */
{
  const { doc, w, errors, storage } = await loadPage('/index.html')
  // 先创作一个 gamma
  input(w, doc.querySelector('#prompt-input'), '详情操作测试')
  click(w, doc.querySelector('#send-btn'))
  await tick()
  // 打开「最近的 Design Buddy」列表
  const nav = [...doc.querySelectorAll('[data-nav]')].find((n) => n.textContent.includes('最近的 Design Buddy'))
  click(w, nav)
  await tick()
  click(w, doc.querySelector('.gamma-item'))
  await tick()
  check('gamma detail modal opens', !!doc.querySelector('.modal-mask #detail-folder'))
  check('detail has share button', !!doc.querySelector('#detail-share'))
  // 共享
  click(w, doc.querySelector('#detail-share'))
  await tick()
  check('share flag persisted', readState(storage).gammas.some((g) => g.shared && g.prompt.includes('详情操作测试')))
  // 归入文件夹（先建文件夹）——按弹窗栈顺序关闭最上层的详情，再关列表
  const masksBefore = [...doc.querySelectorAll('.modal-mask')]
  click(w, masksBefore.at(-1).querySelector('[data-close]'))
  await tick()
  const masksLeft = [...doc.querySelectorAll('.modal-mask')]
  if (masksLeft.length) click(w, masksLeft.at(-1).querySelector('.modal-close'))
  await tick()
  click(w, doc.querySelector('.folder-link'))
  await tick()
  input(w, doc.querySelector('#folder-name'), '详情文件夹')
  click(w, doc.querySelector('.modal-foot [data-ok]'))
  await tick()
  click(w, nav)
  await tick()
  click(w, doc.querySelector('.gamma-item'))
  await tick()
  const folderSelect = doc.querySelector('#detail-folder')
  const opt = [...folderSelect.options].find((o) => o.textContent === '详情文件夹')
  folderSelect.value = opt.value
  folderSelect.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick()
  check('folder assignment persisted', readState(storage).gammas.some((g) => g.folderId && g.prompt.includes('详情操作测试')))
  check('folder count updated in sidebar', [...doc.querySelectorAll('.folder-row')].some((r) => r.textContent.includes('详情文件夹') && r.textContent.includes('1')))
}

/* ---------------- 2. 刷新还原：全新模块图读同一份 localStorage ---------------- */
{
  const first = await loadPage('/index.html')
  input(first.w, first.doc.querySelector('#prompt-input'), '刷新前的提示词')
  click(first.w, first.doc.querySelector('#send-btn'))
  await tick()
  check('gamma exists before refresh', readState(first.storage).gammas.some((g) => g.prompt.includes('刷新前的提示词')))

  const creditsBefore = readState(first.storage).credits
  const reloaded = await loadPage('/index.html', { storage: first.storage, freshCopy: true })
  await tick()
  check('reload restores gammas', readState(reloaded.storage).gammas.some((g) => g.prompt.includes('刷新前的提示词')))
  check('reload restores credits', readState(reloaded.storage).credits === creditsBefore)
  check('reload renders workspace label', reloaded.doc.querySelector('.workspace-name').textContent === '品牌设计组')
}

/* ---------------- 3. 媒体页：收藏 / 上传 / 图形视图 持久化 ---------------- */
{
  const { doc, w, errors, storage } = await loadPage('/media.html')
  check('media page loads without errors', errors.length === 0, errors)
  check('initial grid shows 9 images', doc.querySelectorAll('.media-item').length === 9)

  const firstStar = doc.querySelector('[data-fav]')
  const id = firstStar.dataset.fav
  const wasFav = readState(storage)?.media?.find((m) => m.id === id)?.fav ?? false
  click(w, firstStar)
  await tick()
  check('fav toggle persisted', readState(storage).media.find((m) => m.id === id).fav === !wasFav)

  const file = new w.File(['<html>fake-image-bytes</html>'], '我的截图.png', { type: 'image/png' })
  const upload = doc.querySelector('#upload-input')
  Object.defineProperty(upload, 'files', { value: [file], configurable: true })
  upload.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick(120)
  const state = readState(storage)
  check('upload adds media item', state.media.some((m) => m.name === '我的截图' && m.dataUrl?.startsWith('data:')))
  check('uploaded image renders in grid', doc.querySelectorAll('.media-item').length === 10)

  click(w, doc.querySelector('[data-tip="图形"]'))
  await tick()
  check('graphic view shows 6 seeded graphics', doc.querySelectorAll('.graphic-cell').length === 6)

  click(w, doc.querySelector('#pick-btn'))
  await tick()
  const cells = doc.querySelectorAll('.graphic-cell')
  click(w, cells[0])
  click(w, cells[1])
  await tick()
  check('batch bar appears with count 2', doc.querySelector('.batch-bar .count')?.textContent.includes('2'))
  click(w, doc.querySelector('[data-batch="fav"]'))
  await tick()
  check('batch favourite persisted', readState(storage).media.filter((m) => m.fav).length >= 3)
}

/* ---------------- 4. 主题页：新建自定义主题 / 应用 / 归档 ---------------- */
{
  const { doc, w, errors, storage } = await loadPage('/themes.html')
  check('themes page loads without errors', errors.length === 0, errors)
  check('18 standard themes', doc.querySelectorAll('.theme-card').length === 18)

  click(w, doc.querySelector('#th-create'))
  await tick()
  check('full-screen theme editor opens', !!doc.querySelector('.te-mask'))
  check('editor has 7 setting tabs', doc.querySelectorAll('.te-nav-item').length === 7)
  check('editor shows color tab by default', doc.querySelector('.te-nav-item.is-active')?.dataset.teTab === 'color')
  check('editor has 4 text color rows', doc.querySelectorAll('.te-field-row').length >= 4)
  check('live preview rendered', !!doc.querySelector('.pv-card .pv-title'))
  // 修改主要强调色并确认预览变量同步
  const accentPicker = doc.querySelector('[data-color="accent"]')
  accentPicker.value = '#3B6EF6'
  accentPicker.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  check('preview reacts to accent change', doc.querySelector('#te-preview').style.getPropertyValue('--pv-accent').trim().toUpperCase() === '#3B6EF6')
  // 切到字体分组再切回，验证分组切换
  click(w, doc.querySelector('[data-te-tab="font"]'))
  await tick()
  check('font tab renders selects', doc.querySelectorAll('select[data-draft]').length === 2)
  click(w, doc.querySelector('[data-te-tab="color"]'))
  await tick()
  // 命名并保存
  input(w, doc.querySelector('#te-name'), '品牌靛蓝')
  click(w, doc.querySelector('#te-save'))
  await tick()
  const state1 = readState(storage)
  check('custom theme saved', state1.customThemes.some((t) => t.name === '品牌靛蓝'))
  check('saved theme carries new vars shape', state1.customThemes[0].vars.accent != null && state1.customThemes[0].vars.body === '#E5E0DF')
  check('editor closed after save', !doc.querySelector('.te-mask'))
  check('custom tab renders the card', doc.querySelectorAll('.theme-card').length === 1)

  click(w, doc.querySelector('.theme-card'))
  await tick()
  check('applied theme persisted', readState(storage).appliedTheme === state1.customThemes[0].id)
  check('root accent variable applied', doc.documentElement.style.getPropertyValue('--app-accent').length > 0)

  click(w, doc.querySelector('.theme-more'))
  await tick()
  click(w, doc.querySelector('[data-card-action="归档主题"]'))
  await tick()
  const state2 = readState(storage)
  check('archive moves theme', state2.archivedThemes.length === 1 && state2.customThemes.length === 0)

  click(w, [...doc.querySelectorAll('.th-tab')].find((t) => t.dataset.tab === 'archived'))
  await tick()
  check('archived tab shows card', doc.querySelectorAll('.theme-card').length === 1)
  click(w, doc.querySelector('[data-card-action="恢复主题"]'))
  await tick()
  check('restore moves theme back', readState(storage).customThemes.length === 1)
}

/* ---------------- 5. 模板页：详情弹层 + 套用模板真实生成 gamma ---------------- */
{
  const mem = new Map()
  const tplStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
    clear: () => mem.clear(),
  }
  tplStorage.setItem(LS_KEY, JSON.stringify({
    customTemplates: [
      { id: 'ct-p1', name: '持久化演示模板', a: 'Persist Deck', b: 'PERSIST', cover: '', format: '演示文稿', cats: ['培训'] },
      { id: 'ct-p2', name: '持久化文档模板', a: 'Persist Doc', b: 'PERSIST', cover: '', format: '文档', cats: ['报告'] },
      { id: 'ct-p3', name: '持久化轮播模板', a: 'Persist Carousel', b: 'PERSIST', cover: '', format: '社交轮播卡片', cats: ['活动'] },
    ],
  }))
  const { doc, w, errors, storage } = await loadPage('/templates.html', { storage: tplStorage, freshCopy: true })
  check('templates page loads without errors', errors.length === 0, errors)
  const cards = doc.querySelectorAll('.tpl-card')

  // 点击卡片先打开详情预览弹层
  click(w, cards[0])
  await tick()
  check('template detail overlay opens', !!doc.querySelector('.td-mask'))
  check('detail shows template name', doc.querySelector('.td-head h2')?.textContent === '持久化演示模板')
  // 底部其他案例轮播行已移除，幻灯页浏览器就位
  check('detail other-cases row removed',
    !doc.querySelector('.td-carousel-wrap') && doc.querySelectorAll('.td-thumb').length === 0)
  check('detail deck renders a page', !!doc.querySelector('.td-deck .dp-page'))
  check('detail has page count', /01 \/ \d\d/.test(doc.querySelector('#td-page-count')?.textContent ?? ''))
  check('detail has framework badge', !!doc.querySelector('#td-frame')?.textContent)
  check('detail spec block shown', doc.querySelectorAll('.td-spec > div').length === 3)
  check('detail shows fit list', doc.querySelectorAll('.td-fits li').length === 4)
  check('detail shows style dots', doc.querySelectorAll('.td-dot').length >= 3)
  // 翻页交互：下一页改变页码与进度条
  const pageNoBefore = doc.querySelector('#td-page-count').textContent
  click(w, doc.querySelector('#td-page-next'))
  await tick()
  const pageNoAfter = doc.querySelector('#td-page-count').textContent
  check('page next advances deck', pageNoAfter !== pageNoBefore && pageNoAfter.startsWith('02'))
  check('progress bar advanced', doc.querySelector('#td-progress-i').style.width !== '0%' && !!doc.querySelector('#td-progress-i').style.width)
  // 页码圆点可点击跳页
  const dots = doc.querySelectorAll('.td-page-dot')
  check('page strip has dots', dots.length >= 5)
  click(w, dots[dots.length - 1])
  await tick()
  check('page dot jumps', doc.querySelector('.td-page-dot.is-active')?.textContent === dots[dots.length - 1].textContent)
  // 自动播放开关
  click(w, doc.querySelector('#td-autoplay'))
  await tick()
  check('autoplay toggles on', doc.querySelector('#td-autoplay').classList.contains('is-on'))
  click(w, doc.querySelector('#td-autoplay'))
  await tick()
  check('autoplay toggles off', !doc.querySelector('#td-autoplay').classList.contains('is-on'))
  // 回到第一页，避免影响后续模板切换断言
  click(w, doc.querySelector('#td-page-prev'))
  await tick()

  // 切换模板改为关闭弹层后从卡片网格打开第二个模板（轮播行已移除）
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
  click(w, cards[1])
  await tick()
  check('grid reopen switches template', doc.querySelector('.td-head h2')?.textContent === '持久化文档模板')
  // 样式选择可切换并持久化
  click(w, doc.querySelector('#td-dots'))
  await tick()
  click(w, doc.querySelector('#td-style-menu [data-style="1"]'))
  await tick()
  check('style choice persisted', readState(storage)?.templateStyles?.['持久化文档模板'] === 1)

  // 「使用模板」生成 gamma
  click(w, doc.querySelector('#td-use'))
  await tick()
  const afterFirst = readState(storage)
  check('template use creates gamma', afterFirst.gammas.some((g) => g.origin === 'template' && g.template === '持久化文档模板'))
  check('success modal shown', doc.querySelector('.modal-box')?.textContent.includes('已套用模板'))

  // 第三张卡（与第一次不同的模板，保证「最近」去重后为 2 项）
  click(w, cards[2])
  await tick()
  click(w, doc.querySelector('#td-use'))
  await tick()
  const state = readState(storage)
  check('second template use creates gamma', state.gammas.filter((g) => g.origin === 'template').length === 2)
  check('each template use deducts 3 credits', state.credits === afterFirst.credits - 3)

  // 「最近」视图基于 gamma 历史过滤
  click(w, [...doc.querySelectorAll('[data-demo]')].find((n) => n.dataset.demo === '最近'))
  await tick()
  check('recent view lists used templates', doc.querySelectorAll('.tpl-card').length === 2)
}

/* ---------------- 6. 设置页：表单持久化 + 数据管理 ---------------- */
{
  const { doc, w, errors, storage } = await loadPage('/settings.html')
  check('settings page loads without errors', errors.length === 0, errors)

  const keepAwake = doc.querySelector('[data-switch]')
  click(w, keepAwake)
  await tick()
  check('general switch persisted', readState(storage).settings.keepAwake === false)

  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'appearance'))
  await tick()
  const density = doc.querySelector('[data-bind="settings.appearance.density"]')
  density.value = 'compact'
  density.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick()
  check('dynamic select persisted', readState(storage).settings.appearance.density === 'compact')

  const imageMode = doc.querySelector('[data-bind="imageMode"]')
  check('image mode select exists in appearance settings', !!imageMode)
  imageMode.value = 'photo'
  imageMode.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick()
  check('image mode persisted at top level', readState(storage).imageMode === 'photo')

  // 密度设置真实改变文档根节点数据属性（CSS 据此收紧间距）
  check('density applies to document root', doc.documentElement.dataset.density === 'compact')

  // 头像缩写：登录用户缩写优先，未登录回退设置值；设置值始终持久化
  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'profile'))
  await tick()
  const initialsInput = doc.querySelector('[data-bind="settings.profile.initials"]')
  input(w, initialsInput, 'CD')
  initialsInput.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  check('logged-in initials override settings value', doc.querySelector('.avatar')?.textContent === '测试')
  check('profile initials persisted while logged in', readState(storage).settings.profile.initials === 'CD')
  storage.removeItem(AUTH_KEY)
  input(w, initialsInput, 'CD')
  initialsInput.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  check('anonymous avatar falls back to settings initials', doc.querySelector('.avatar')?.textContent === 'CD')

  // 界面语言真实切换设置页导航文案
  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'general'))
  await tick()
  const englishOpt = [...doc.querySelectorAll('[data-select] .select-option')].find((o) => o.textContent.trim() === 'English')
  click(w, englishOpt)
  await tick()
  const generalNav = [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'general')
  check('language switch localizes settings nav', generalNav.textContent.trim() === 'General')
  check('language persisted', readState(storage).settings.language === 'English')

  // 快捷键真实注册：默认 ⌘K/Ctrl+K 聚焦设置页搜索框
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }))
  await tick()
  check('shortcut ctrl-k focuses search', doc.activeElement?.id === 'settings-search')

  // 自定义代理：切换后出现 URL 输入并持久化为素材基址
  const proxySelect = doc.querySelectorAll('[data-select]')[3]
  // 枚举选项已按界面语言翻译显示，按稳定的中文枚举 data-value 选取（存储契约不变）
  click(w, proxySelect.querySelector('.select-option[data-value="自定义代理"]'))
  await tick()
  const proxyUrlInput = doc.querySelector('.proxy-url-input')
  check('custom proxy reveals url input', !!proxyUrlInput && !proxyUrlInput.hidden)
  input(w, proxyUrlInput, 'https://proxy.example.com')
  proxyUrlInput.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  check('proxy url persisted', readState(storage).settings.proxyUrl === 'https://proxy.example.com')

  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'memory'))
  await tick()
  input(w, doc.querySelector('#mem-input'), '测试记忆条目')
  click(w, doc.querySelector('#mem-add'))
  await tick()
  check('memory add persisted', readState(storage).settings.memories.includes('测试记忆条目'))

  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'data'))
  await tick()
  const exported = readState(storage)
  click(w, doc.querySelector('[data-act="reset"]'))
  await tick()
  click(w, doc.querySelector('.modal-foot [data-act="ok"]'))
  await tick()
  const resetState = readState(storage)
  check('reset restores defaults', resetState.credits === 236 && resetState.gammas.length === 0 && resetState.folders.length === 0)
  check('reset clears custom themes', resetState.customThemes.length === 0)
  check('export payload has all top-level keys', ['workspaces', 'gammas', 'media', 'settings', 'customThemes'].every((k) => k in exported))
}

/* ---------------- 汇总 ---------------- */
let failed = 0
for (const [name, ok, extra] of results) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? '  ' + JSON.stringify(extra) : ''}`)
  if (!ok) failed += 1
}
console.log(failed ? `\n${failed} CHECK(S) FAILED` : `\nALL ${results.length} PERSISTENCE CHECKS PASSED`)
process.exitCode = failed ? 1 : 0
