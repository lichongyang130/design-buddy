import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { PAGE_SKILLS, FEATURED_SKILLS, installedSkillPresentation } from '../src/skills-catalog.js'
import { requiresSkillConfirmation } from '../src/creation-skill-policy.js'
import { availableToInstall, registryEntry } from '../src/skill-registry.js'
import { skillCap, runSkill } from '../src/skill-runtime.js'
import { templateBrowser } from '../scripts/template-browser.mjs'
const dom = new JSDOM(''), oldDocument = globalThis.document
globalThis.document = dom.window.document
try {
  assert(requiresSkillConfirmation({ risk: 'review' }, true))
  assert(requiresSkillConfirmation({ risk: 'review' }, false))
  assert(requiresSkillConfirmation({ risk: 'trusted' }, false))
  assert(!requiresSkillConfirmation({ risk: 'trusted' }, true))
  assert.equal(PAGE_SKILLS.length, 18)
  assert.equal(new Set(PAGE_SKILLS.map(s => s.name)).size, 18)
  assert(FEATURED_SKILLS.every(s => s && PAGE_SKILLS.some(p => p.id === s.id)))
  for (const name of ['中英互译', '邮件撰写助手', '深度联网调研', '自动化工作流执行', '背景移除', '文件夹监听', '定时任务', '数据即查']) assert(!PAGE_SKILLS.some(s => s.name === name))
  assert(registryEntry('中英互译').retired)
  assert(!availableToInstall([]).some(s => s.retired))
  assert.match(installedSkillPresentation('背景移除').displayName, /旧版/)
  for (const entry of PAGE_SKILLS) {
    assert(skillCap(entry.name), entry.name)
    const result = await runSkill(entry.name, skillCap(entry.name).sample)
    assert(result?.artifacts?.length, entry.name + ' needs actual output')
    assert(result.artifacts.every(a => a.content && a.name))
  }
  const source = '# Plan\n\n### Evidence\n\nTODO verify {{owner}}\n\n## Evidence\n\n```md\n# code example\n```'
  const doc = JSON.parse(runSkill('文档结构检查', source).artifacts[0].content)
  assert.equal(doc.headings.length, 3)
  assert.equal(doc.placeholders.length, 2)
  const fencedHTML = JSON.parse(runSkill('文档结构检查', '# Real heading\n\n```html\n<h3>Code sample</h3>\n```').artifacts[0].content)
  assert.equal(fencedHTML.headings.length, 1)
  assert(doc.findings.some(f => /重复标题/.test(f.text)))
  assert(doc.findings.some(f => /层级跳跃/.test(f.text)))
  const broken = runSkill('页面可访问性检查', '<h1>Title</h1><h3>Jump</h3><img src="a.jpg"><input placeholder="Email"><button></button><script>globalThis.__executed=true</script>')
  assert(broken.findings.some(f => /alt/.test(f.text)))
  assert(broken.findings.some(f => /标签/.test(f.text)))
  assert(broken.findings.some(f => /名称/.test(f.text)))
  assert(!globalThis.__executed)
  const good = runSkill('页面可访问性检查', '<h1>Title</h1><img src="a.jpg" alt=""><label for="email">Email</label><input id="email"><button aria-label="Save"></button>')
  assert(!good.findings.some(f => f.level === 'high' || f.level === 'med'))
  assert(runSkill('页面可访问性检查', 'make a nice website').findings.some(f => f.level === 'high'))
  const inventory = JSON.parse(runSkill('素材引用清单', '<img src="a.jpg"><img src="a.jpg"><img srcset="b.jpg 1x, c.jpg 2x"><a href="https://example.com/a">Source</a><style>.x{background:url(d.jpg)}</style>').artifacts[0].content)
  assert.equal(inventory.occurrenceCount, 6)
  assert.equal(inventory.references.length, 5)
  const md = JSON.parse(runSkill('素材引用清单', '![Cover](images/a.jpg)\n![Again](images/a.jpg)\n[Source](https://example.com)').artifacts[0].content)
  assert.equal(md.references.length, 2)
  assert.equal(md.occurrenceCount, 3)
} finally { globalThis.document = oldDocument; dom.window.close() }
const browser = await templateBrowser(), base = 'http://127.0.0.1:5174'
try {
  const page = await browser.newPage({ acceptDownloads: true }), errors = [], unexpected = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('request', r => { if (r.url().startsWith('https://skill-test.invalid')) unexpected.push(r.url()) })
  await page.goto(base + '/auth.html'); await page.locator('#guest-entry').click(); await page.waitForURL('**/index.html')
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('design-buddy-state-v1'))
    state.skills.push({ id: 'legacy-user-install', name: '中英互译', desc: '原个人备注', enabled: false, version: '1.4.0' })
    localStorage.setItem('design-buddy-state-v1', JSON.stringify(state))
  })
  await page.goto(base + '/skills.html')
  assert.equal(await page.locator('#sk-grid [data-skill-card]').count(), 18)
  assert.equal(await page.locator('#sk-grid [data-sk-name="背景移除"]').count(), 0)
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('design-buddy-state-v1')).skills)
  for (const name of ['文档结构检查', '素材引用清单']) {
    await page.locator(`#sk-grid [data-sk-name="${name}"]`).click()
    const input = name === '文档结构检查' ? '# Plan\n\n### TODO {{owner}}' : '<h1>Title</h1><img src="https://skill-test.invalid/no-fetch.jpg"><button></button><script>window.__skillExecuted=true</script>'
    await page.locator('#sk-run-input').fill(input)
    await page.locator('[data-sk-run]').click()
    await page.waitForSelector('[data-sk-download="0"]')
    assert.equal(await page.locator('#sk-run-input').inputValue(), input)
    const downloadPromise = page.waitForEvent('download')
    await page.locator('[data-sk-download="0"]').click()
    const download = await downloadPromise, json = JSON.parse(await fs.readFile(await download.path(), 'utf8'))
    assert(json.findings.length > 0)
    assert(!await page.evaluate(() => window.__skillExecuted))
    if (name === '素材引用清单') {
      await page.locator('[data-sk-install-inline]').click()
      if (await page.locator('[data-act="ok"]').count()) await page.locator('[data-act="ok"]').click()
      await page.waitForFunction(name => JSON.parse(localStorage.getItem('design-buddy-state-v1')).skills.some(s => s.name === name), name)
    }
    await page.locator('[data-sk-run-close]').click()
  }
  await page.reload()
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('design-buddy-state-v1')).skills)
  assert(after.some(s => s.name === '素材引用清单'))
  for (const original of before) assert(after.some(s => s.id === original.id && s.name === original.name && s.enabled === original.enabled))
  const legacy = after.find(s => s.id === 'legacy-user-install')
  assert.equal(legacy.desc, '原个人备注')
  assert.equal(legacy.enabled, false)
  await page.locator('[data-installed-toggle]').click()
  assert.match(await page.locator('#sk-grid').innerText(), /旧版能力/)
  assert.deepEqual(unexpected, [])
  assert.deepEqual(errors, [])
  console.log('PASS 18 curated skills have actual output / 3 new static engines / malformed-input handling / findings and downloads / canonical install persists / existing installs preserved / no user HTML execution or remote asset requests.')
} finally { await browser.close() }
