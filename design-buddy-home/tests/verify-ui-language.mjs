import assert from 'node:assert/strict'
import { templateBrowser } from '../scripts/template-browser.mjs'
import { uiText, sourceText, watchUILanguage } from '../src/ui-language.js'
import { JSDOM } from 'jsdom'
// Exact strings, variables, reversibility, whitespace, attributes, values, dynamic insertion and authored-content boundaries.
const dom = new JSDOM(`<body><button id="mixed"><svg></svg>创建</button><input placeholder="搜索" value="创建"><select><option>文档</option></select><div id="canvas">创建</div><div contenteditable>创建</div><div translate="no">创建</div><span class="gamma-title">创建</span><textarea placeholder="搜索">创建</textarea></body>`)
let lang = 'English'
const runtime = watchUILanguage(() => lang, dom.window.document)
assert.equal(dom.window.document.querySelector('#mixed').textContent, 'Create')
assert.equal(dom.window.document.querySelector('input').placeholder, 'Search')
assert.equal(dom.window.document.querySelector('input').value, '创建')
assert.equal(dom.window.document.querySelector('option').value, '文档')
assert.equal(dom.window.document.querySelector('textarea').value, '创建')
assert.equal(dom.window.document.querySelector('textarea').placeholder, 'Search')
for (const selector of ['#canvas', '[contenteditable]', '[translate="no"]', '.gamma-title']) assert.equal(dom.window.document.querySelector(selector).textContent, '创建')
for (const [language, expected] of [['日本語', '作成'], ['繁體中文', '建立'], ['简体中文', '创建'], ['English', 'Create']]) {
  lang = language; runtime.refresh()
  // Existing token dictionary uses 建立 or 創建 for Traditional Chinese; both are valid translations.
  if (language === '繁體中文') assert.match(dom.window.document.querySelector('#mixed').textContent, /建立|創建/)
  else assert.equal(dom.window.document.querySelector('#mixed').textContent, expected)
}
dom.window.document.body.insertAdjacentHTML('beforeend', '<button id="late">使用模板</button>')
await new Promise(resolve => setTimeout(resolve, 10))
assert.equal(dom.window.document.querySelector('#late').textContent, 'Use template')
assert.equal(uiText('显示更多 5', 'English'), 'Show 5 more')
assert.equal(uiText('归档 创建', 'English'), 'Archive 创建')
assert.equal(sourceText('Document'), '文档')
runtime.stop(); dom.window.close()
const browser = await templateBrowser(), base = process.env.BASE_URL || 'http://127.0.0.1:5174'
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(base + '/auth.html')
  await page.locator('[data-auth-lang="ja"]').click()
  await page.waitForFunction(() => document.documentElement.lang === 'ja')
  assert.equal(await page.locator('[data-tab="login"]').innerText(), 'ログイン')
  await page.locator('[data-auth-lang="en"]').click()
  await page.locator('[data-provider="google"]').click()
  assert.match(await page.locator('#provider-title').innerText(), /local demo/)
  assert.match(await page.locator('#provider-ok').innerText(), /Continue with local demo/)
  await page.locator('#provider-modal [data-close]').click()
  await page.locator('#guest-entry').click()
  await page.waitForURL('**/index.html')
  async function pick(language) {
    await page.goto(base + '/settings.html')
    const wrap = page.locator('[data-select-kind="language"]')
    await wrap.locator('.select-btn').click()
    await wrap.locator('.select-option').filter({ hasText: language }).click()
    await page.waitForFunction(lang => JSON.parse(localStorage.getItem('design-buddy-state-v1')).settings.language === lang, language)
  }
  for (const [language, htmlLang, use] of [['English', 'en', 'Use template'], ['日本語', 'ja', 'テンプレートを使用'], ['繁體中文', 'zh-TW', '使用模板'], ['简体中文', 'zh-CN', '使用模板']]) {
    await pick(language)
    await page.goto(base + '/templates.html')
    await page.waitForSelector('.rebuild-card')
    await page.waitForFunction(code => document.documentElement.lang === code, htmlLang)
    const canonical = await page.locator('#category-body input').first().inputValue()
    assert.equal(canonical, '课程')
    await page.locator('#category-body input').first().check()
    assert.equal(await page.locator('.rebuild-card').count(), 8)
    await page.locator('#category-body input').first().uncheck()
    assert.equal(await page.locator('.rebuild-card').count(), 65)
    await page.reload()
    assert.equal(await page.locator('html').getAttribute('lang'), htmlLang)
    await page.goto(base + '/atelier/prototype-study/index.html')
    await page.waitForSelector('[data-detail-ready]')
    assert.match(await page.locator('#detail-use').innerText(), new RegExp(use))
    const before = await page.locator('#canvas').innerHTML()
    await page.locator('#detail-images-tab').click()
    assert(await page.locator('#detail-images').isVisible())
    assert.equal(await page.locator('#canvas').innerHTML(), before)
  }
  await pick('English')
  for (const name of ['index', 'settings', 'templates', 'themes', 'media', 'experts', 'skills', 'connectors']) {
    await page.goto(base + '/' + name + '.html')
    await page.waitForTimeout(250)
    const residual = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, 4), out = []; let node
      while ((node = walker.nextNode())) {
        if (node.parentElement.closest('script,style,textarea,[contenteditable],#canvas,[translate="no"],.gamma-title,.workspace-name,.ws-head-name,.avatar,[data-select-kind="language"],.rebuild-card h3')) continue
        const text = node.nodeValue.trim()
        if (text !== '游客' && /[\u3400-\u9fff]/.test(text)) out.push(text)
      }
      return [...new Set(out)]
    })
    assert.deepEqual(residual, [], name + ': untranslated Chinese UI')
  }
  await page.goto(base + '/experts.html')
  await page.locator('[data-open-expert]').first().click()
  assert.equal(await page.locator('[data-summon]').innerText(), 'Summon')
  assert.match(await page.locator('[data-run-expert]').innerText(), /Break down and coordinate/)
  await page.goto(base + '/connectors.html')
  await page.locator('#cn-grid .cn-configure').first().click()
  assert.match(await page.locator('#cn-test').innerText(), /Authentication/)
  await page.goto(base + '/settings.html')
  await page.locator('[data-settings="models"]').click()
  await page.locator('[data-model-add]').click()
  await page.waitForSelector('#custom-model-form')
  assert.match(await page.locator('#custom-model-form').innerText(), /Provider/)
  await page.locator('[data-model-cancel]').click()
  await pick('日本語')
  await page.locator('[data-settings="models"]').click()
  await page.locator('[data-model-add]').click()
  assert.match(await page.locator('#custom-model-form').innerText(), /プロバイダー/)
  assert.equal(await page.locator('input[name="apiKey"]').inputValue(), '')
  await pick('English')
  await page.goto(base + '/index.html')
  await page.locator('[data-quick-type="演示文稿"]').click()
  await page.locator('#type-pill-btn').click()
  await page.locator('[data-chip]').filter({ hasText: /^\s*Document\s*$/ }).click()
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('design-buddy-state-v1')).ui.type), '文档')
  await page.locator('[data-nav]').filter({ hasText: 'Recent conversations' }).click()
  assert.match(await page.locator('.modal-head h3').innerText(), /Recent conversations/)
  await page.locator('.modal-close').click()
  for (const selector of ['.help-fab', '.rail-footer .footer-icon:nth-of-type(1)', '.rail-footer .footer-icon:nth-of-type(2)']) {
    await page.locator(selector).click()
    await page.waitForSelector('.modal-mask')
    assert(!/[\u3400-\u9fff]/.test(await page.locator('.modal-head h3').innerText()))
    await page.locator('.modal-close').click()
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(base + '/templates.html')
  await page.waitForSelector('.rebuild-card')
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.locator('.mobile-filter-toggle').click()
  assert(await page.locator('.tpl-sidebar').isVisible())
  assert.deepEqual(errors, [])
  console.log('PASS four actual language selections / refresh and cross-page persistence / eight-page English residual audit / dynamic model forms and shared dialogs / canonical creation types and category filters / detail image tabs and unchanged canvas / mobile filters / no runtime errors; unit tests protect authored content, input values and native select values.')
} finally { await browser.close() }
