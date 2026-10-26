/* ============================================================
   任务二十五：通用/权限九项设置必须真实可感知
   语言 i18n / 链接策略 / 字号 / 锁屏 / 唤醒锁 / PWA 自启 /
   代理连通性 / 可信技能自动安装 / 技能自动更新
   ============================================================ */

import { loadPage, click, input, tick, readState } from './helpers.mjs'
import { resolveLinkTarget } from '../src/settings-effects.js'
import { SKILL_REGISTRY } from '../src/skill-registry.js'
import { AVAILABLE_MODELS } from '../src/model-config.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const pickOption = async (w, wrap, label) => {
  click(w, wrap.querySelector('.select-btn'))
  await tick()
  const opt = [...wrap.querySelectorAll('.select-option')].find((o) => o.textContent.trim() === label)
  click(w, opt)
  await tick()
}

/* ---------------- 纯函数：链接策略三态 ---------------- */
{
  check('link resolver: relative links always stay in tab', resolveLinkTarget('index.html', '智能打开') === 'self')
  check('link resolver: smart opens external in new tab', resolveLinkTarget('https://a.com', '智能打开') === 'blank')
  check('link resolver: browser mode forces new tab', resolveLinkTarget('https://a.com', '始终在浏览器打开') === 'blank')
  check('link resolver: in-app mode forces same tab', resolveLinkTarget('https://a.com', '始终在应用内打开') === 'self')
}

/* ---------------- 页面级：设置页 ---------------- */
{
  const { doc, w, errors, storage } = await loadPage('/settings.html')
  check('settings page loads without errors', errors.length === 0, errors)
  const selects = () => doc.querySelectorAll('[data-select]')
  const switches = () => doc.querySelectorAll('[data-switch]')

  /* ----- 1. 语言：真实 i18n，五页共享导航 + 设置页文案 ----- */
  const railHome = [...doc.querySelectorAll('[data-i18n="rail.home"]')][0]
  check('i18n: default chinese rail label', railHome?.textContent === '首页')
  await pickOption(w, selects()[0], 'English')
  check('i18n: english rail label', railHome.textContent === 'Home')
  check('i18n: english settings row title', doc.querySelector('[data-i18n="set.language"]').textContent === 'Language')
  check('i18n: html lang switched to en', doc.documentElement.lang === 'en')
  check('i18n: persisted', readState(storage).settings.language === 'English')
  await pickOption(w, selects()[0], '日本語')
  check('i18n: japanese rail label', railHome.textContent === 'ホーム')
  check('i18n: html lang switched to ja', doc.documentElement.lang === 'ja')
  await pickOption(w, selects()[0], '繁體中文')
  check('i18n: traditional chinese rail label', railHome.textContent === '首頁')
  await pickOption(w, selects()[0], '简体中文')
  check('i18n: back to simplified chinese', railHome.textContent === '首页')

  /* ----- 1b. 常规/权限区四语言全覆盖 + 枚举存储契约 + 图标保留 ----- */
  // 英文：整区可见文案真实切换
  await pickOption(w, selects()[0], 'English')
  check('i18n: EN nav group labels',
    [...doc.querySelectorAll('.settings-group')].map((g) => g.textContent).join('|') === 'Settings|Features|Data & security')
  check('i18n: EN search placeholder', doc.querySelector('#settings-search').placeholder === 'Search settings')
  check('i18n: EN font preview', doc.querySelector('#font-preview').textContent === 'Design Buddy font preview Aa')
  check('i18n: EN slider aria-label', doc.querySelector('#font-slider').getAttribute('aria-label') === 'Font size')
  check('i18n: EN test buttons',
    doc.querySelector('#wakelock-test-btn').textContent === 'Test wake lock'
    && doc.querySelector('#proxy-test-btn').textContent === 'Test connection'
    && doc.querySelector('#pwa-install-btn').textContent === 'Install as desktop app')
  check('i18n: EN honest hint localized', doc.querySelector('#pwa-hint').textContent.startsWith('Browsers cannot'))
  check('i18n: EN enum option labels',
    [...selects()[1].querySelectorAll('.select-option')].map((o) => o.textContent.trim()).join('|')
      === 'Smart open|Always in-app|Always in browser')
  check('i18n: EN lock enum options',
    [...selects()[2].querySelectorAll('.select-option')].map((o) => o.textContent.trim()).join('|')
      === 'Off|Always allow|While charging')
  // 英文下选择枚举：显示翻译、存储仍是中文枚举（逻辑与旧数据契约不变）
  await pickOption(w, selects()[1], 'Always in browser')
  check('i18n: enum displays translated value', selects()[1].querySelector('.select-value').textContent === 'Always in browser')
  check('i18n: enum stores canonical chinese', readState(storage).settings.linkOpen === '始终在浏览器打开')
  check('i18n: enum option keeps canonical data-value',
    selects()[1].querySelectorAll('.select-option')[2].dataset.value === '始终在浏览器打开')
  // 导航图标在语言切换后不被 textContent 覆盖
  check('i18n: settings nav icons survive language switch',
    doc.querySelectorAll('.settings-nav .nav-item svg').length === doc.querySelectorAll('.settings-nav .nav-item').length)
  // 日文：选项与状态本地化
  await pickOption(w, selects()[0], '日本語')
  check('i18n: JA proxy enum options',
    [...selects()[3].querySelectorAll('.select-option')].map((o) => o.textContent.trim()).join('|')
      === '直接接続|システムプロキシ|カスタムプロキシ')
  check('i18n: JA untested chip', doc.querySelector('#proxy-state').textContent === '未テスト')
  // 繁中：字体预览与下拉显示
  await pickOption(w, selects()[0], '繁體中文')
  check('i18n: ZH-TW font preview', doc.querySelector('#font-preview').textContent.includes('字級預覽'))
  check('i18n: ZH-TW enum display', selects()[1].querySelector('.select-value').textContent === '始終在瀏覽器開啟')
  check('i18n: stored canonical unchanged across languages', readState(storage).settings.linkOpen === '始终在浏览器打开')
  // 回简中，恢复后续测试的中文环境
  await pickOption(w, selects()[0], '简体中文')
  check('i18n: ZH enum display restored', selects()[1].querySelector('.select-value').textContent === '始终在浏览器打开')
  await pickOption(w, selects()[1], '智能打开')

  /* ----- 1c. 13 个动态设置组：四语渲染 + 原生 select 存储契约 + 切语言即时重绘 ----- */
  const openSection = async (key) => {
    click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === key))
    await tick()
    return doc.querySelector('#view-placeholder')
  }
  await pickOption(w, selects()[0], 'English')
  check('i18n: EN document title', doc.title === 'Settings — Design Buddy')
  check('i18n: EN nav aria labels',
    doc.querySelector('nav.rail').getAttribute('aria-label') === 'Main navigation'
    && doc.querySelector('#settings-nav').getAttribute('aria-label') === 'Settings navigation'
    && doc.querySelector('.more-flyout').getAttribute('aria-label') === 'More menu')
  let vp = await openSection('appearance')
  check('i18n: EN dynamic section label', vp.querySelector('.settings-section-label')?.textContent === 'Appearance')
  check('i18n: EN dynamic row title', vp.querySelector('.setting-row h3')?.textContent === 'Theme')
  const densitySel = vp.querySelector('select[data-bind="settings.appearance.density"]')
  check('i18n: EN dynamic select options translated',
    [...densitySel.options].map((o) => o.textContent).join('|') === 'Comfortable|Compact')
  densitySel.value = 'compact'
  densitySel.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick()
  check('i18n: dynamic select stores canonical value', readState(storage).settings.appearance.density === 'compact')
  const imageSel = vp.querySelector('select[data-bind="imageMode"]')
  check('i18n: EN image mode options', [...imageSel.options].map((o) => o.textContent).join('|') === 'Illustration|Photo|Classic SVG')
  vp = await openSection('models')
  if (AVAILABLE_MODELS.length) {
    const modelIds = AVAILABLE_MODELS.map((m) => m.id)
    check('i18n: model rows match hardcoded available list',
      [...vp.querySelectorAll('[data-model]')].map((b) => b.dataset.model).join('|') === modelIds.join('|'))
    const firstId = modelIds[0]
    click(w, [...vp.querySelectorAll('[data-model]')].find((b) => b.dataset.model === firstId))
    await tick()
    check('i18n: model switch toast localized',
      [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes(firstId)))
    check('i18n: model id persisted', readState(storage).settings.model === firstId)
  } else {
    // 尚未跑 discover-models：诚实空态，不放假模型
    check('i18n: empty model state shown in EN', vp.textContent.includes('No available models yet'))
  }
  vp = await openSection('memory')
  check('i18n: EN memory heading and placeholder',
    vp.querySelector('h3')?.textContent === 'Memory notes'
    && vp.querySelector('#mem-input')?.placeholder === 'Add a note, e.g. avoid emoji in output')
  input(w, vp.querySelector('#mem-input'), 'i18n-memory-note')
  click(w, vp.querySelector('#mem-add'))
  await tick()
  check('i18n: memory add still works under EN', readState(storage).settings.memories.includes('i18n-memory-note'))
  vp = await openSection('security')
  const timeoutSel = vp.querySelector('select[data-bind="settings.security.sessionTimeout"]')
  check('i18n: EN timeout options translated',
    [...timeoutSel.options].map((o) => o.textContent).join('|') === '15 minutes|30 minutes|1 hour|Never')
  timeoutSel.value = '永不'
  timeoutSel.dispatchEvent(new w.Event('change', { bubbles: true }))
  await tick()
  check('i18n: timeout stored canonical chinese', readState(storage).settings.security.sessionTimeout === '永不')
  vp = await openSection('data')
  check('i18n: EN data action buttons',
    [...vp.querySelectorAll('button')].map((b) => b.textContent).join('|') === 'Export JSON|Choose file to import|Reset')
  // 停留在动态组时切日语：整组即时重绘，无需重新点击侧栏
  await pickOption(w, selects()[0], '日本語')
  vp = doc.querySelector('#view-placeholder')
  check('i18n: JA live re-render of dynamic section',
    vp.querySelector('.settings-section-label')?.textContent === 'データ'
    && vp.querySelector('[data-act="export"]')?.textContent === 'JSONを書き出す')
  // 回简中：动态组中文恢复，模型枚举仍为中文存储
  await pickOption(w, selects()[0], '简体中文')
  vp = doc.querySelector('#view-placeholder')
  check('i18n: ZH dynamic section restored',
    vp.querySelector('.settings-section-label')?.textContent === '数据管理'
    && vp.querySelector('[data-act="reset"]')?.textContent === '重置')
  check('i18n: selected model survives language roundtrip',
    readState(storage).settings.model === (AVAILABLE_MODELS[0]?.id ?? ''))
  // 恢复通用视图，避免影响后续通用区测试
  click(w, [...doc.querySelectorAll('[data-settings]')].find((n) => n.dataset.settings === 'general'))
  await tick()

  /* ----- 1d. 下拉真实展开/收起：按钮互斥、外部点击、Esc、选中即收 ----- */
  const langWrap = selects()[0]
  const langBtn = langWrap.querySelector('.select-btn')
  const langMenu = langWrap.querySelector('.select-menu')
  check('dropdown: menu hidden initially', langMenu.hidden === true)
  click(w, langBtn)
  await tick()
  check('dropdown: click button opens menu',
    langMenu.hidden === false && langWrap.classList.contains('is-open')
    && langBtn.getAttribute('aria-expanded') === 'true')
  check('dropdown: four language options visible',
    [...langMenu.querySelectorAll('.select-option')].map((o) => o.textContent.trim())
      .join('|') === '简体中文|繁體中文|English|日本語')
  // 展开一个下拉时，其他下拉必须收起
  const linkWrap = selects()[1]
  click(w, linkWrap.querySelector('.select-btn'))
  await tick()
  check('dropdown: opening another closes the first',
    langMenu.hidden === true && !langWrap.classList.contains('is-open')
    && linkWrap.querySelector('.select-menu').hidden === false)
  // 外部点击收起
  doc.body.dispatchEvent(new w.MouseEvent('click', { bubbles: true }))
  await tick()
  check('dropdown: outside click closes all',
    [...doc.querySelectorAll('.select-menu')].every((m) => m.hidden === true))
  // Esc 收起
  click(w, langBtn)
  await tick()
  doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await tick()
  check('dropdown: escape closes menu', langMenu.hidden === true && !langWrap.classList.contains('is-open'))
  // 选中选项后菜单自动收起
  click(w, langBtn)
  await tick()
  click(w, [...langMenu.querySelectorAll('.select-option')].find((o) => o.textContent.trim() === 'English'))
  await tick()
  check('dropdown: picking option closes menu and persists',
    langMenu.hidden === true && readState(storage).settings.language === 'English')
  // 恢复简中，避免影响后续断言
  await pickOption(w, selects()[0], '简体中文')

  /* ----- 2. 链接打开方式：DOM 级真实委托 ----- */
  const openCalls = []
  w.open = (url) => { openCalls.push(url); return null }
  const testLink = doc.querySelector('#link-policy-test')
  check('link policy: test anchor is real external link', /^https:\/\//.test(testLink.getAttribute('href')))
  click(w, testLink)
  await tick()
  check('link policy: smart mode opens external via window.open', openCalls[0]?.includes('example.com'))
  await pickOption(w, selects()[1], '始终在应用内打开')
  check('link resolver follows saved policy', resolveLinkTarget('https://a.com', readState(storage).settings.linkOpen) === 'self')
  await pickOption(w, selects()[1], '智能打开')

  /* ----- 3. 字体大小：即时缩放 + 档位标签 ----- */
  const slider = doc.querySelector('#font-slider')
  const levelLabel = doc.querySelector('#font-level-label')
  slider.value = '0'
  slider.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  check('font: smallest level label shown', levelLabel.textContent === '很小')
  check('font: zoom applied to body', doc.body.style.zoom === '0.85')
  check('font: css var set for fallback', doc.documentElement.style.getPropertyValue('--font-scale') === '0.85')
  check('font: persisted', readState(storage).settings.fontScale === 0.85)
  slider.value = '4'
  slider.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  check('font: largest level label shown', levelLabel.textContent === '很大')

  /* ----- 4. 允许锁屏运行：立即体验，三态真实分叉 ----- */
  click(w, doc.querySelector('#lock-test-btn'))
  await tick()
  let lockMask = doc.querySelector('.app-lock')
  check('lock: closed mode shows lock mask immediately', !!lockMask)
  click(w, lockMask.querySelector('.app-lock-unlock'))
  await tick()
  check('lock: unlock removes mask', !doc.querySelector('.app-lock'))
  await pickOption(w, selects()[2], '始终允许')
  click(w, doc.querySelector('#lock-test-btn'))
  await tick()
  check('lock: always-allow never shows mask', !doc.querySelector('.app-lock'))
  check('lock: honest toast for background continuation',
    [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('继续运行')))
  await pickOption(w, selects()[2], '关闭')

  /* ----- 5. 防止休眠：唤醒锁状态可感知（jsdom 无 API → 诚实回退） ----- */
  check('wakelock: initial chip rendered', !!doc.querySelector('#wakelock-state'))
  click(w, doc.querySelector('#wakelock-test-btn'))
  await tick()
  const wakeChip = doc.querySelector('#wakelock-state')
  check('wakelock: unsupported environment reported honestly', wakeChip.dataset.state === 'unsupported')
  check('wakelock: no runtime error', errors.length === 0, JSON.stringify(errors))

  /* ----- 6. 开机自启：PWA 安装等价物 ----- */
  const pwaBtn = doc.querySelector('#pwa-install-btn')
  const pwaChip = doc.querySelector('#pwa-state')
  check('pwa: install button exists', !!pwaBtn)
  check('pwa: no install prompt in jsdom → disabled honestly', pwaBtn.disabled === true)
  check('pwa: state chip explains environment', pwaChip.dataset.state === 'unsupported')
  click(w, pwaBtn)
  await tick()
  check('pwa: disabled click does nothing / no error', errors.length === 0, JSON.stringify(errors))

  /* ----- 7. 网络代理：真实连通性测试 ----- */
  click(w, doc.querySelector('#proxy-test-btn'))
  await tick(120)
  const proxyChip = doc.querySelector('#proxy-state')
  check('proxy: direct connection test reaches local manifest', proxyChip.dataset.state === 'ok'
    && /HTTP 2\d\d/.test(proxyChip.textContent), proxyChip.textContent)
  // 自定义代理：非法地址立即诚实报错
  await pickOption(w, selects()[3], '自定义代理')
  const proxyInput = doc.querySelector('.proxy-url-input')
  check('proxy: custom mode reveals url input', !!proxyInput && !proxyInput.hidden)
  input(w, proxyInput, 'not-a-url')
  proxyInput.dispatchEvent(new w.Event('input', { bubbles: true }))
  await tick()
  click(w, doc.querySelector('#proxy-test-btn'))
  await tick()
  check('proxy: bad url reported honestly', proxyChip.dataset.state === 'fail')
  input(w, proxyInput, '')
  proxyInput.dispatchEvent(new w.Event('input', { bubbles: true }))
  await pickOption(w, selects()[3], '直接连接')

  /* ----- 8/9. 技能：自动安装门控 + 自动更新（技能已升级为独立页面） ----- */
  // 默认 trustedSkills=false, skillAutoUpdate=true
  const sk1 = await loadPage('/skills.html', { storage, freshCopy: true })
  const skModal = (page) => page.doc.querySelector('.skills-page')
  check('skills: page renders installed and catalog sections',
    !!skModal(sk1) && sk1.doc.body.textContent.includes('已安装') && sk1.doc.body.textContent.includes('精选技能'))
  const catalogCount = sk1.doc.querySelectorAll('#sk-grid [data-install]').length
  check('skills: registry offers uninstalled entries', catalogCount > 0)
  const regInstallCount = [...sk1.doc.querySelectorAll('#sk-grid [data-install]')]
    .filter((b) => b.dataset.install.startsWith('reg-')).length
  check('skills: every uninstalled registry entry is offered', regInstallCount === SKILL_REGISTRY.length - 4)
  // 默认自动更新已在进页面时消费：预置技能版本被抬高
  const seeded = readState(storage).skills
  check('skills: auto-update applied on open (idle moment)',
    seeded.every((sk) => sk.version !== '1.0.0') && seeded.some((sk) => sk.version === '2.0.0'))
  // 未信任时点安装可信技能 → 必须弹手动确认
  const trustedReg = [...sk1.doc.querySelectorAll('#sk-grid [data-install]')]
    .find((b) => b.dataset.install.startsWith('reg-'))
  click(sk1.w, trustedReg)
  await tick()
  let confirmBox = [...sk1.doc.querySelectorAll('.modal-box')].find((m) => m.textContent.includes('手动安装'))
  check('skills: untrusted install requires confirmation', !!confirmBox)
  click(sk1.w, confirmBox.querySelector('[data-act="cancel"]'))
  await tick()
  check('skills: cancel keeps skill uninstalled',
    readState(storage).skills.length === 4)
  // 开启「自动安装可信技能」后 → 可信技能直接安装，无确认弹窗
  click(w, switches()[2])
  await tick()
  check('skills: trusted switch persisted', readState(storage).settings.trustedSkills === true)
  const sk2 = await loadPage('/skills.html', { storage, freshCopy: true })
  const trustedBtn = [...sk2.doc.querySelectorAll('#sk-grid [data-install]')]
    .find((b) => b.dataset.install.startsWith('reg-'))
  const installingName = SKILL_REGISTRY.find((r) => r.id === trustedBtn.dataset.install).name
  click(sk2.w, trustedBtn)
  await tick()
  check('skills: trusted skill auto-installed without confirm',
    readState(storage).skills.some((sk) => sk.name === installingName))
  check('skills: auto install toast shown',
    [...sk2.doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('自动安装')))
  // 高风险技能即使开启自动安装，也必须手动确认
  const reviewBtn = [...sk2.doc.querySelectorAll('#sk-grid [data-install]')].find((b) =>
    SKILL_REGISTRY.find((r) => r.id === b.dataset.install)?.risk === 'review')
  check('skills: review-risk entry exists in catalog', !!reviewBtn)
  click(sk2.w, reviewBtn)
  await tick()
  confirmBox = [...sk2.doc.querySelectorAll('.modal-box')].find((m) => m.querySelector('[data-act="ok"]')
    && m.textContent.includes('高风险'))
  check('skills: high-risk always requires manual confirm', !!confirmBox)
  click(sk2.w, confirmBox.querySelector('[data-act="ok"]'))
  await tick()
  const reviewName = SKILL_REGISTRY.find((r) => r.id === reviewBtn.dataset.install).name
  check('skills: confirmed high-risk skill installed',
    readState(storage).skills.some((sk) => sk.name === reviewName))
  // 关闭自动更新 → 用全新模块图模拟刷新：旧版本技能应出现更新徽标与手动按钮。
  // 技能页写入过 store，设置页的旧实例已过期，必须重新加载，否则旧内存状态会把新装技能覆盖掉。
  const settingsFresh = await loadPage('/settings.html', { storage, freshCopy: true })
  await tick(120)
  click(settingsFresh.w, settingsFresh.doc.querySelectorAll('[data-switch]')[3])
  await tick()
  check('skills: auto update switch persisted off', readState(storage).settings.skillAutoUpdate === false)
  const st = readState(storage)
  st.skills[0].version = '1.0.0'
  storage.setItem('design-buddy-state-v1', JSON.stringify(st))

  const fresh = await loadPage('/settings.html', { storage, freshCopy: true })
  await tick(120)
  const freshSk = await loadPage('/skills.html', { storage, freshCopy: true })
  click(freshSk.w, freshSk.doc.querySelector('[data-installed-toggle]'))
  await tick()
  const panel3 = freshSk.doc.querySelector('.skills-page')
  check('skills: paused banner shown', panel3.textContent.includes('自动更新已暂停'))
  check('skills: update pill visible when outdated', !!panel3.querySelector('.update-pill'))
  check('skills: manual update button available', !!panel3.querySelector('[data-update-sk]'))
  check('skills: outdated skill still at old version', readState(storage).skills[0].version === '1.0.0')
  check('skills: installs survive the settings round-trip', readState(storage).skills.length === 6)
  click(freshSk.w, panel3.querySelector('[data-update-sk]'))
  await tick()
  check('skills: manual update bumps version', readState(storage).skills[0].version !== '1.0.0')
  // 检查更新按钮：全部最新时诚实提示
  click(freshSk.w, panel3.querySelector('[data-check-update]'))
  await tick()
  check('skills: check update reports up-to-date',
    [...freshSk.doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('最新版本')))

  // 跨页面语言生效：全新加载（模拟真实浏览器导航）的其他页面 rail 跟随设置
  const fSelect = fresh.doc.querySelectorAll('[data-select]')[0]
  click(fresh.w, fSelect.querySelector('.select-btn'))
  await tick()
  click(fresh.w, [...fSelect.querySelectorAll('.select-option')].find((o) => o.textContent.trim() === 'English'))
  await tick(120)
  check('i18n: language choice persisted for cross-page', readState(storage).settings.language === 'English')
  const media = await loadPage('/media.html', { storage, freshCopy: true })
  await tick(150)
  check('i18n: fresh media page rail follows english',
    media.doc.documentElement.lang === 'en'
    && media.doc.querySelector('[data-i18n="rail.media"]')?.textContent === 'Media')
  const home = await loadPage('/index.html', { storage, freshCopy: true })
  await tick(150)
  check('i18n: fresh home page rail follows english',
    home.doc.querySelector('[data-i18n="rail.home"]')?.textContent === 'Home')

  check('settings real effects: no runtime errors', errors.length === 0, JSON.stringify(errors))
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} SETTINGS-REAL CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
