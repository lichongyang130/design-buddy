/* ============================================================
   任务二十五：通用/权限九项设置必须真实可感知
   语言 i18n / 链接策略 / 字号 / 锁屏 / 唤醒锁 / PWA 自启 /
   代理连通性 / 可信技能自动安装 / 技能自动更新
   ============================================================ */

import { loadPage, click, input, tick, readState } from './helpers.mjs'
import { resolveLinkTarget } from '../src/settings-effects.js'
import { SKILL_REGISTRY } from '../src/skill-registry.js'

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

  /* ----- 8/9. 技能：自动安装门控 + 自动更新 ----- */
  // 打开技能弹窗（默认 trustedSkills=false, skillAutoUpdate=true）
  click(w, doc.querySelector('.more-wrap .rail-item'))
  await tick()
  click(w, doc.querySelector('[data-more="技能"]'))
  await tick()
  const skillsModal = doc.querySelector('.modal-box')
  check('skills: modal renders installed and catalog sections',
    !!skillsModal && skillsModal.textContent.includes('已安装') && skillsModal.textContent.includes('可安装'))
  const catalogCount = skillsModal.querySelectorAll('[data-install]').length
  check('skills: registry offers uninstalled entries', catalogCount === SKILL_REGISTRY.length - 4)
  // 默认自动更新已在开弹窗时消费：预置技能版本被抬高
  const seeded = readState(storage).skills
  check('skills: auto-update applied on open (idle moment)',
    seeded.every((sk) => sk.version !== '1.0.0') && seeded.some((sk) => sk.version === '2.0.0'))
  // 未信任时点安装可信技能 → 必须弹手动确认
  const trustedReg = skillsModal.querySelector('[data-install]')
  click(w, trustedReg)
  await tick()
  let confirmBox = [...doc.querySelectorAll('.modal-box')].find((m) => m.textContent.includes('手动安装'))
  check('skills: untrusted install requires confirmation', !!confirmBox)
  click(w, confirmBox.querySelector('[data-act="cancel"]'))
  await tick()
  check('skills: cancel keeps skill uninstalled',
    readState(storage).skills.length === 4)
  // 开启「自动安装可信技能」后 → 可信技能直接安装，无确认弹窗
  click(w, switches()[2])
  await tick()
  check('skills: trusted switch persisted', readState(storage).settings.trustedSkills === true)
  const modal2 = [...doc.querySelectorAll('.modal-box')].find((m) => m.querySelector('#skills-root'))
  const trustedBtn = modal2.querySelector('[data-install]')
  const installingName = SKILL_REGISTRY.find((r) => r.id === trustedBtn.dataset.install).name
  click(w, trustedBtn)
  await tick()
  check('skills: trusted skill auto-installed without confirm',
    readState(storage).skills.some((sk) => sk.name === installingName))
  check('skills: auto install toast shown',
    [...doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('自动安装')))
  // 高风险技能即使开启自动安装，也必须手动确认
  const reviewBtn = [...modal2.querySelectorAll('[data-install]')].find((b) =>
    SKILL_REGISTRY.find((r) => r.id === b.dataset.install)?.risk === 'review')
  check('skills: review-risk entry exists in catalog', !!reviewBtn)
  click(w, reviewBtn)
  await tick()
  // 注意：技能弹窗本身也含「高风险」徽标，确认框要用 ok 按钮精确定位
  confirmBox = [...doc.querySelectorAll('.modal-box')].find((m) => m.querySelector('[data-act="ok"]')
    && m.textContent.includes('高风险'))
  check('skills: high-risk always requires manual confirm', !!confirmBox)
  click(w, confirmBox.querySelector('[data-act="ok"]'))
  await tick()
  const reviewName = SKILL_REGISTRY.find((r) => r.id === reviewBtn.dataset.install).name
  check('skills: confirmed high-risk skill installed',
    readState(storage).skills.some((sk) => sk.name === reviewName))
  // 关闭自动更新 → 用全新模块图模拟刷新：旧版本技能应出现更新徽标与手动按钮
  click(w, doc.querySelector('.modal-close'))
  await tick()
  click(w, switches()[3])
  await tick()
  check('skills: auto update switch persisted off', readState(storage).settings.skillAutoUpdate === false)
  const st = readState(storage)
  st.skills[0].version = '1.0.0'
  storage.setItem('design-buddy-state-v1', JSON.stringify(st))

  const fresh = await loadPage('/settings.html', { storage, freshCopy: true })
  await tick(120)
  click(fresh.w, fresh.doc.querySelector('.more-wrap .rail-item'))
  await tick()
  click(fresh.w, fresh.doc.querySelector('[data-more="技能"]'))
  await tick()
  const modal3 = [...fresh.doc.querySelectorAll('.modal-box')].find((m) => m.querySelector('#skills-root'))
  check('skills: paused banner shown', modal3.textContent.includes('自动更新已暂停'))
  check('skills: update pill visible when outdated', !!modal3.querySelector('.update-pill'))
  check('skills: manual update button available', !!modal3.querySelector('[data-update-sk]'))
  check('skills: outdated skill still at old version', readState(storage).skills[0].version === '1.0.0')
  click(fresh.w, modal3.querySelector('[data-update-sk]'))
  await tick()
  check('skills: manual update bumps version', readState(storage).skills[0].version !== '1.0.0')
  // 检查更新按钮：全部最新时诚实提示
  click(fresh.w, modal3.querySelector('[data-check-update]'))
  await tick()
  check('skills: check update reports up-to-date',
    [...fresh.doc.querySelectorAll('.toast')].some((t) => t.textContent.includes('最新版本')))
  click(fresh.w, fresh.doc.querySelector('.modal-close'))
  await tick()

  check('settings real effects: no runtime errors', errors.length === 0, JSON.stringify(errors))
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} SETTINGS-REAL CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
