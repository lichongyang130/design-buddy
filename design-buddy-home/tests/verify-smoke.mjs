/* 冒烟：遍历设置 14 组、首页各弹窗、媒体灯箱 / AI 生成、模板详情弹层，捕获运行时错误。 */

import { loadPage, click, input, tick } from './helpers.mjs'
import { AVAILABLE_MODELS } from '../src/model-config.js'

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
  if (AVAILABLE_MODELS.length) {
    const target = AVAILABLE_MODELS[AVAILABLE_MODELS.length - 1].id
    click(w, [...doc.querySelectorAll('[data-model]')].find((b) => b.dataset.model === target))
    await tick()
    check('model switch persisted', JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).settings.model === target)
  } else {
    check('model empty state renders without errors', !!doc.querySelector('#view-placeholder .modal-copy'))
  }
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
  check('popover opens without any right-hand panel', doc.querySelector('#add-sub').hidden)
  // 专家子菜单与主菜单顶部对齐（不再有 118px 下压偏移）
  click(w, doc.querySelector('#expert-row'))
  await tick()
  check('expert submenu opens', !doc.querySelector('#expert-sub').hidden)

  click(w, doc.body)
  await tick()
  click(w, doc.querySelector('#add-menu-btn'))
  await tick()
  // 「引用对话中的文件」收在「添加文件」面板里
  doc.querySelector('[data-sub="files"]').dispatchEvent(new w.MouseEvent('mouseenter', { bubbles: true }))
  await tick()
  click(w, doc.querySelector('[data-open-refs]'))
  await tick()
  click(w, doc.querySelector('[data-open-ref-picker]'))
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

  // 参考图上弹卡片：真实文件上传 + 风格/角色/内容三类参考单选
  click(w, doc.querySelector('#img-menu-btn'))
  await tick()
  check('img popover opens', !doc.querySelector('#img-popover').hidden)
  check('reference menu has upload entry', !!doc.querySelector('[data-ref-upload]'))
  check('reference menu has 3 reference types', doc.querySelectorAll('.ref-option').length === 3)
  check('default reference type is style',
    doc.querySelector('.ref-option.is-selected')?.dataset.refType === 'style')
  check('button label is 参考图', doc.querySelector('#img-mode-label').textContent === '参考图')
  check('image icon visible', !doc.querySelector('.img-ic-on').hasAttribute('hidden'))
  check('removed off-icon no longer rendered', !doc.querySelector('.img-ic-off'))
  // 切换到内容参考：菜单关闭、选中态与持久化联动
  click(w, doc.querySelector('[data-ref-type="content"]'))
  await tick()
  check('img popover closes after pick', doc.querySelector('#img-popover').hidden)
  check('reference type persisted',
    JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).ui.refType === 'content')
  click(w, doc.querySelector('#img-menu-btn'))
  await tick()
  check('selected state moved to content',
    doc.querySelector('.ref-option.is-selected')?.dataset.refType === 'content')
  click(w, doc.querySelector('[data-ref-type="style"]'))
  await tick()
  check('reference type restores to style',
    JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).ui.refType === 'style')
  // 上传图片：真实文件选择后进入附件芯片
  click(w, doc.querySelector('#img-menu-btn'))
  await tick()
  const refInput = doc.querySelector('#ref-file-input')
  Object.defineProperty(refInput, 'files', {
    value: [new w.File(['x'], 'ref-photo.png', { type: 'image/png' })],
    configurable: true,
  })
  refInput.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick()
  check('uploaded image becomes attachment chip',
    [...doc.querySelectorAll('.attach-chip .chip-name')].some((n) => n.textContent === 'ref-photo.png'))
  check('upload closes popover', doc.querySelector('#img-popover').hidden)

  const gammaCount = JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).gammas.length
  click(w, doc.querySelector('.topbar-right .pill'))
  await tick()
  // 现在会弹出新建 gamma 弹窗，需要双击格式卡片来创建
  const ngModal = doc.querySelector('.modal-mask')
  if (ngModal) {
    const formatCard = ngModal.querySelector('[data-format]')
    if (formatCard) {
      formatCard.dispatchEvent(new w.MouseEvent('dblclick', { bubbles: true }))
      await tick()
    }
    // 关闭弹窗
    const closeBtn = ngModal.querySelector('.modal-close')
    if (closeBtn) click(w, closeBtn)
    await tick()
  }
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
  check('messages have real speak buttons', doc.querySelectorAll('[data-speak]').length > 0)
  check('assistant name shown in messages', doc.body.textContent.includes(w.localStorage.getItem('design-buddy-state-v1') ? JSON.parse(w.localStorage.getItem('design-buddy-state-v1')).settings.assistant.name : 'Buddy'))
  click(w, doc.querySelector('.modal-close'))
  await tick()

  // 设置 → 应用管理：默认关闭的「轮播图」对应 chip 被真实隐藏
  check('disabled app chip hidden', [...doc.querySelectorAll('[data-chip]')].find((c) => c.textContent.trim() === '轮播图')?.hidden === true)

  // 设置 → 模型：创作弹窗显示当前模型标签
  input(w, doc.querySelector('#prompt-input'), '测试模型标签的创作')
  click(w, doc.querySelector('#send-btn'))
  await tick(600)
  check('generation modal shows model tag', !!doc.querySelector('.gen-model-tag'))
  click(w, doc.querySelector('.modal-close'))
  await tick()
  check('home smoke no errors', errors.length === 0, errors)
}

/* ---------------- 设置真实生效：技能门控 / 智能体 / 自动命名 / 智能建议 ----------------
   freshCopy 复制整份 dist 到临时目录，模块图（含 rail-flyout 共享 chunk）全新执行，
   事件绑定到当前 document，并真正读取传入的 storage（模拟浏览器刷新） */
{
  const seed = await loadPage('/index.html')
  const st = JSON.parse(seed.storage.getItem('design-buddy-state-v1'))
  st.settings.personalize.autoTitle = false
  st.settings.personalize.smartSuggest = false
  seed.storage.setItem('design-buddy-state-v1', JSON.stringify(st))
  const { doc, w, errors, storage } = await loadPage('/index.html', { storage: seed.storage, freshCopy: true })
  await tick(150)
  check('smart suggest hides template row', doc.querySelector('.template-row')?.hidden === true)

  const before = JSON.parse(storage.getItem('design-buddy-state-v1')).gammas.length
  click(w, doc.querySelector('.topbar-right .pill'))
  await tick()
  // 现在会弹出新建 gamma 弹窗，需要双击格式卡片来创建
  const ngModal = doc.querySelector('.modal-mask')
  if (ngModal) {
    const formatCard = ngModal.querySelector('[data-format]')
    if (formatCard) {
      formatCard.dispatchEvent(new w.MouseEvent('dblclick', { bubbles: true }))
      await tick()
    }
    // 关闭弹窗
    const closeBtn = ngModal.querySelector('.modal-close')
    if (closeBtn) click(w, closeBtn)
    await tick()
  }
  const after = JSON.parse(storage.getItem('design-buddy-state-v1')).gammas
  check('auto title off yields timestamp placeholder', after.length === before + 1 && /^未命名创作 \d{2}:\d{2}$/.test(after[0].title), after[0].title)

  // 技能信任门控：默认未信任，开关点击不启用并给出提示（技能已是独立页面）
  const skillsPage = await loadPage('/skills.html', { storage, freshCopy: true })
  click(skillsPage.w, skillsPage.doc.querySelector('[data-installed-toggle]'))
  await tick()
  const firstSkillSwitch = skillsPage.doc.querySelector('[data-sk]')
  const beforeEnabled = JSON.parse(skillsPage.storage.getItem('design-buddy-state-v1')).skills.find((x) => x.id === firstSkillSwitch?.dataset.sk)?.enabled
  click(skillsPage.w, firstSkillSwitch)
  await tick()
  const afterEnabled = JSON.parse(skillsPage.storage.getItem('design-buddy-state-v1')).skills.find((x) => x.id === firstSkillSwitch?.dataset.sk)?.enabled
  check('untrusted skill toggle is gated', beforeEnabled === afterEnabled)
  check('skill trust hint visible', [...skillsPage.doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('信任技能')))

  // 专家入口：已升级为独立页面，窄栏「更多」只负责关闭浮层并跳转
  click(w, doc.querySelector('.more-wrap .rail-item'))
  await tick()
  click(w, doc.querySelector('[data-more="专家"]'))
  await tick()
  check('experts entry closes flyout without leftover modal',
    doc.querySelector('.more-pop').hidden === true && !doc.querySelector('.modal-mask'))
  check('settings-driven page no errors', errors.length === 0, errors)
}

/* ---------------- 每周报告：开启且到期时弹真实统计，且只弹一次 ---------------- */
{
  const seed = await loadPage('/index.html')
  const st = JSON.parse(seed.storage.getItem('design-buddy-state-v1'))
  st.settings.personalize.weeklyReport = true
  st.lastReportAt = 0
  seed.storage.setItem('design-buddy-state-v1', JSON.stringify(st))
  const { doc, w, storage } = await loadPage('/index.html', { storage: seed.storage, freshCopy: true })
  await tick(150)
  check('weekly report modal pops when due', doc.querySelector('.modal-head h3')?.textContent.includes('本周创作报告'))
  check('weekly report shows real stats', !!doc.querySelector('.report-cell b'))
  const after = JSON.parse(storage.getItem('design-buddy-state-v1'))
  check('weekly report stamps lastReportAt', !!after.lastReportAt && after.lastReportAt > 0)
  click(w, doc.querySelector('.modal-close'))
  await tick()
  const again = await loadPage('/index.html', { storage, freshCopy: true })
  await tick(150)
  check('weekly report does not repop within week', !again.doc.body.textContent.includes('本周创作报告'))
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
  // 底部其他案例缩略图行已移除
  check('other-cases strip removed',
    !doc.querySelector('.td-carousel-wrap') && doc.querySelectorAll('.td-thumb').length === 0)
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
