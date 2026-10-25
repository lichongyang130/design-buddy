/* 冒烟：遍历设置 14 组、首页各弹窗、媒体灯箱 / AI 生成、模板详情弹层，捕获运行时错误。 */

import { loadPage, click, input, tick } from './helpers.mjs'

const results = []
const check = (name, ok, extra) => results.push([name, !!ok, extra])

/* ---------------- 设置：14 组全部渲染 ---------------- */
{
  const { doc, w, errors } = await loadPage('/settings.html')
  const keys = ['general', 'profile', 'billing', 'appearance', 'shortcuts', 'personalize',
    'memory', 'agents', 'models', 'assistant', 'devices', 'data', 'apps', 'security']
  for (const key of keys) {
    const nav = [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === key)
    click(w, nav)
    await tick()
    const visible = key === 'general' ? !doc.querySelector('#view-general').hidden : !doc.querySelector('#view-placeholder').hidden
    check(`settings section ${key} renders`, visible && errors.length === 0, errors)
  }
  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'appearance'))
  await tick()
  const fontSel = doc.querySelector('[data-bind="settings.fontFamily"]')
  fontSel.value = 'mono'
  fontSel.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick()
  check('font family change applied', doc.documentElement.dataset.appFont === 'mono')
  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'models'))
  await tick()
  click(w, doc.querySelector('[data-model="高级模型"]'))
  await tick()
  check('model switch persisted', JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).settings.model === '高级模型')
  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'data'))
  await tick()
  click(w, doc.querySelector('[data-act="export"]'))
  check('export action runs', errors.length === 0, errors)
}

/* ---------------- 首页：参数 / 弹出菜单 / 引用 / Max 门槛 / 空白新建 ---------------- */
{
  const { doc, w, errors } = await loadPage('/index.html')
  click(w, doc.querySelector('.tool-btn[aria-label="调整参数"]'))
  await tick()
  check('params modal opens', !!doc.querySelector('.modal-mask'))
  const range = doc.querySelector('#p-creativity')
  input(w, range, '4')
  range.dispatchEvent(new w.Event('input', { bubbles: true }))
  click(w, doc.querySelector('.modal-foot [data-ok]'))
  await tick()
  check('params saved', JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).settings.params.creativity === 4)

  click(w, doc.querySelector('#add-menu-btn'))
  await tick()
  check('full-access button removed from popover', !doc.querySelector('.access-btn'))
  check('popover has no full-access label', !doc.body.textContent.includes('允许完全访问'))
  check('footer keeps new plus button', !!doc.querySelector('.popover-footer .access-plus'))
  // 底部「新建」按钮仍可点击并给出反馈
  click(w, doc.querySelector('.popover-footer .access-plus'))
  await tick()
  check('plus button gives feedback', !!doc.querySelector('.toast.show'))

  click(w, doc.querySelector('#add-menu-btn'))
  await tick()
  click(w, doc.querySelector('[data-action="引用对话中的文件"]'))
  await tick()
  const refButtons = doc.querySelectorAll('[data-ref]')
  check('reference picker lists media', refButtons.length === 15)
  click(w, refButtons[0])
  await tick()
  check('attachment chip added', doc.querySelectorAll('.attach-chip').length === 1)

  click(w, doc.querySelector('#mode-menu-btn'))
  await tick()
  click(w, doc.querySelector('[data-mode="Max"]'))
  await tick()
  check('max gated for free plan', !!doc.querySelector('.modal-mask'))
  click(w, doc.querySelector('.modal-foot [data-act="cancel"]'))
  await tick()

  // 图片模式上弹卡片：无对勾、灰底选中态、药丸标签联动
  click(w, doc.querySelector('#img-menu-btn'))
  await tick()
  check('img popover opens', !doc.querySelector('#img-popover').hidden)
  check('img options have no checkmarks', doc.querySelectorAll('.img-check').length === 0)
  check('img popover has 4 options', doc.querySelectorAll('.img-option').length === 4)
  check('default selected is 自动', doc.querySelector('.img-option.is-selected')?.dataset.imgMode === '自动')
  check('pill label defaults to 自动', doc.querySelector('#img-mode-label').textContent === '自动')
  check('on-icon visible by default', !doc.querySelector('.img-ic-on').hasAttribute('hidden'))
  click(w, doc.querySelector('[data-img-mode="不添加图片"]'))
  await tick()
  check('img popover closes after pick', doc.querySelector('#img-popover').hidden)
  check('pill label switches to 无图片', doc.querySelector('#img-mode-label').textContent === '无图片')
  check('off-icon shown for 无图片', doc.querySelector('.img-ic-off').hidden === false && doc.querySelector('.img-ic-on').hidden === true)
  check('img mode persisted', JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).ui.imgMode === '不添加图片')
  click(w, doc.querySelector('#img-menu-btn'))
  await tick()
  check('selected state moved to 不添加图片', doc.querySelector('.img-option.is-selected')?.dataset.imgMode === '不添加图片')
  click(w, doc.querySelector('[data-img-mode="自动"]'))
  await tick()
  check('pill label restores to 自动', doc.querySelector('#img-mode-label').textContent === '自动')

  const gammaCount = JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).gammas.length
  click(w, doc.querySelector('.topbar-right .pill'))
  await tick()
  check('blank gamma created without credits flow', JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).gammas.length === gammaCount + 1)

  click(w, doc.querySelector('.help-fab'))
  await tick()
  check('help modal opens', doc.querySelector('.modal-head h3')?.textContent.includes('帮助'))
  click(w, doc.querySelector('.modal-close'))
  await tick()
  const footerIcons = [...doc.querySelectorAll('.rail-footer .footer-icon')]
  click(w, footerIcons[0])
  await tick()
  check('invite modal opens', doc.querySelector('.modal-head h3')?.textContent.includes('邀请'))
  click(w, doc.querySelector('.modal-close'))
  click(w, footerIcons[1])
  await tick()
  check('messages modal opens', doc.querySelector('.modal-head h3')?.textContent.includes('消息'))
  check('home smoke no errors', errors.length === 0, errors)
}

/* ---------------- 媒体：灯箱 + AI 生成 ---------------- */
{
  const { doc, w, errors } = await loadPage('/media.html')
  click(w, doc.querySelector('.media-item'))
  await tick()
  check('lightbox opens', !!doc.querySelector('.lightbox-mask'))
  click(w, doc.querySelector('.lb-close'))
  await tick()

  click(w, doc.querySelector('#create-ai-btn'))
  await tick()
  click(w, doc.querySelector('[data-demo="AI 生成图片"]'))
  await tick()
  input(w, doc.querySelector('#ai-prompt'), '科技发布会主视觉')
  click(w, doc.querySelector('.modal-foot [data-ok]'))
  await tick(40)
  const state = JSON.parse(w.localStorage.getItem('design-buddy-state-v1'))
  check('ai generation adds media', state.media.some((m) => m.name.includes('科技发布会') && m.dataUrl?.startsWith('data:image/svg')))
  check('media smoke no errors', errors.length === 0, errors)
}

/* ---------------- 主题：侧栏字体 / 指令弹窗 ---------------- */
{
  const { doc, w, errors } = await loadPage('/themes.html')
  click(w, doc.querySelector('[data-demo="自定义字体"]'))
  await tick()
  check('font modal opens', !!doc.querySelector('[data-font]'))
  click(w, doc.querySelector('[data-font="song"]'))
  await tick()
  check('font choice persisted', JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).settings.fontFamily === 'song')
  click(w, doc.querySelector('[data-demo="自定义指令"]'))
  await tick()
  input(w, doc.querySelector('#instr-text'), '默认 16:9')
  click(w, doc.querySelector('.modal-foot [data-ok]'))
  await tick()
  check('instruction persisted', JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).instructions === '默认 16:9')
  check('themes smoke no errors', errors.length === 0, errors)
}

/* ---------------- 主题：全屏新建编辑器 ---------------- */
{
  const { doc, w, errors } = await loadPage('/themes.html')
  click(w, doc.querySelector('#th-create'))
  await tick()
  check('theme editor opens', !!doc.querySelector('.te-mask'))
  check('editor left panel + preview', !!doc.querySelector('.te-panel') && doc.querySelectorAll('.pv-card').length === 2)
  check('editor nav has 7 tabs', doc.querySelectorAll('.te-nav-item').length === 7)
  // 颜色改动 → 重置按钮出现 → 恢复默认
  const accentPicker = doc.querySelector('[data-color="accent"]')
  check('accent reset hidden at default', doc.querySelector('[data-reset="accent"]')?.hidden === true)
  accentPicker.value = '#123456'
  accentPicker.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  check('accent reset appears after change', doc.querySelector('[data-reset="accent"]')?.hidden === false)
  click(w, doc.querySelector('[data-reset="accent"]'))
  await tick()
  check('accent restored to default', doc.querySelector('[data-hex="accent"]')?.value === '#F2F2F3')
  // 辅助点缀色增删
  click(w, doc.querySelector('#te-add-accent'))
  await tick()
  check('aux color added', doc.querySelectorAll('[data-accent-color]').length === 1)
  click(w, doc.querySelector('[data-accent-del]'))
  await tick()
  check('aux color removed', doc.querySelectorAll('[data-accent-color]').length === 0)
  // 遍历其余分组，确保无渲染错误
  for (const tab of ['font', 'logo', 'design', 'image', 'chart', 'css']) {
    click(w, doc.querySelector(`[data-te-tab="${tab}"]`))
    await tick()
    check(`editor tab ${tab} renders`, doc.querySelector('.te-content')?.children.length > 0)
  }
  check('theme editor no errors', errors.length === 0, errors)
  click(w, doc.querySelector('#te-cancel'))
  await tick()
  check('cancel closes editor', !doc.querySelector('.te-mask'))
}

/* ---------------- 模板：详情弹层交互 + 空态 ---------------- */
{
  const { doc, w, errors } = await loadPage('/templates.html')
  click(w, [...doc.querySelectorAll('[data-demo]')].find((n) => n.dataset.demo === '由您创建'))
  await tick()
  check('mine view empty state', doc.querySelector('#tpl-empty')?.hidden === false)
  // 回到工作区模板视图再打开详情
  click(w, [...doc.querySelectorAll('[data-demo]')].find((n) => n.dataset.demo === '工作区模板'))
  await tick()

  click(w, doc.querySelector('.tpl-card'))
  await tick()
  check('detail overlay opens', !!doc.querySelector('.td-mask'))
  check('detail panel has use button', !!doc.querySelector('#td-use'))
  check('detail has two style sections (dots + cards)',
    !!doc.querySelector('#td-dots') && doc.querySelectorAll('.td-style-card').length === 3)
  // 底部样式变体卡片可点击并持久化
  click(w, doc.querySelectorAll('.td-style-card')[2])
  await tick()
  check('style card selection persisted',
    JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).templateStyles['渔港日记'] === 2)
  check('style card shows picked ring', doc.querySelectorAll('.td-style-card')[2].classList.contains('is-picked'))
  // 轮播缩略图切换
  const thumbs = doc.querySelectorAll('.td-thumb')
  click(w, thumbs[3])
  await tick()
  check('carousel thumb switches detail', doc.querySelector('.td-head h2')?.textContent === '朱砂册页')
  // Esc 关闭
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
  check('esc closes detail', !doc.querySelector('.td-mask'))
  // 深链直达
  click(w, doc.querySelector('.tpl-card'))
  await tick()
  check('reopen detail works', !!doc.querySelector('.td-mask'))
  click(w, doc.querySelector('.td-close'))
  check('templates smoke no errors', errors.length === 0, errors)
}

let failed = 0
for (const [name, ok, extra] of results) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? '  ' + JSON.stringify(extra) : ''}`)
  if (!ok) failed += 1
}
console.log(failed ? `\n${failed} SMOKE CHECK(S) FAILED` : `\nALL ${results.length} SMOKE CHECKS PASSED`)
process.exitCode = failed ? 1 : 0
