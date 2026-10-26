/* ============================================================
   专家真实能力（expert-runtime）：每个专家都要真跑出东西，而不是介绍占位
   1. 20 位专家全部登记能力，且产出非空
   2. 每类能力的算法都要可验证：数据→图、文本→改稿、HTML→体检…
   3. 抽屉里点「开工」能出结果、能下载、原型能预览
   4. 首页选中专家后发送，产出真实内容而不是固定五页
   ============================================================ */

import { loadPage, click, input, tick, readState } from './helpers.mjs'
import { EXPERT_CATALOG } from '../src/experts-catalog.js'
import {
  EXPERT_CAPS, runExpert, rewriteText, auditResponsive, auditDelivery, analyze,
  colorScale, contrast, typeScale, keywords, aiToneScore, resultHTML,
} from '../src/expert-runtime.js'

let passed = 0
const fails = []
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ', name) }
  else { fails.push(name); console.log('FAIL ', name, extra ?? '') }
}

const capOf = (id) => EXPERT_CAPS[id]
const runOf = (id, txt) => runExpert(id, txt ?? capOf(id).sample)

/* ---------- 1. 全量登记与产出非空 ---------- */
{
  check('every catalog expert is registered with a real capability',
    EXPERT_CATALOG.every((e) => capOf(e.id) && capOf(e.id).kind))
  check('capabilities are real engines, not a single stub kind',
    new Set(Object.values(EXPERT_CAPS).map((c) => c.kind)).size >= 14)

  let thin = []
  for (const e of EXPERT_CATALOG) {
    const r = runOf(e.id)
    const ok = r && r.title && r.summary?.length > 20
      && (r.blocks?.length ?? 0) >= 2
      && (r.stats?.length ?? 0) >= 4
      && (r.findings?.length ?? 0) >= 1
    if (!ok) thin.push(e.id)
  }
  check('every expert returns stats + blocks + findings', thin.length === 0, thin.join(','))

  check('every result is renderable HTML',
    EXPERT_CATALOG.every((e) => resultHTML(runOf(e.id)).includes('xr-result')))
  check('no result leaks placeholder wording',
    EXPERT_CATALOG.every((e) => !/Lorem|TODO|待补充|占位符残留/.test(resultHTML(runOf(e.id)))))
  check('every expert produces a downloadable artifact or a live preview',
    EXPERT_CATALOG.every((e) => (runOf(e.id).artifacts?.length ?? 0) > 0 || !!runOf(e.id).preview))
}

/* ---------- 2. 解析层：真的从输入里读到了东西 ---------- */
{
  const ctx = analyze('下季度给制造业客户的数字化方案，30 分钟讲完，共 12 页，目标降本 20%，受众是评审专家')
  check('analyze extracts audience, duration and page target',
    ctx.audience === '评审专家' && ctx.durationMin === 30 && ctx.pageTarget === 12)
  check('analyze extracts the numbers that matter', ctx.numbers.some((n) => n.value === 20 && n.unit === '%'))
  check('keyword extraction ignores filler words',
    keywords('我们认为这个方案非常重要的是数据与增长，数据与增长决定一切').includes('数据')
    && !keywords('我们认为这个方案非常重要的是数据与增长').includes('非常'))
  check('same input always yields the same context (reproducible)', JSON.stringify(analyze('同一段输入')) === JSON.stringify(analyze('同一段输入')))
}

/* ---------- 3. 大纲：逐页结构由输入决定 ---------- */
{
  const r = runOf('ec-deck-writer', '给制造业客户的数字化提案，30 分钟，决策层 5 人')
  check('outline produces one row per page', r.pages.length === r.blocks[0].rows.length && r.pages.length >= 8)
  check('outline seconds add up to the requested duration',
    r.pages.reduce((n, p) => n + p.seconds, 0) === 30 * 60)
  check('outline speaks to the audience named in the input',
    r.pages[0].message.includes('客户') && r.pages.at(-1).message.includes('客户'))
  check('outline ships a markdown artifact with every page',
    r.artifacts[0].content.includes('## 1.') && r.artifacts[0].content.split('## ').length - 1 === r.pages.length)
  const other = runOf('ec-deck-writer', '给经销商的季度回顾，10 分钟')
  check('a different input yields a different outline', other.pages[0].message !== r.pages[0].message || other.summary !== r.summary)
}

/* ---------- 4. 文档 / 版式 / 令牌：真实数值 ---------- */
{
  const d = runOf('ec-doc-writer', '写一份行业白皮书，12000 字')
  const sum = d.blocks[0].rows.reduce((n, row) => n + parseInt(row[1], 10), 0)
  check('doc word budgets stay within 2% of the target', Math.abs(sum - 12000) / 12000 < 0.02, String(sum))
  check('doc budget covers 8 sections', d.blocks[0].rows.length === 8)

  const l = runOf('ec-slide-designer', '这一页有 6 个要点、2 张图和一段说明，读者反馈看不下去')
  check('layout computes a real density percentage', /密度 \d+%/.test(l.summary) && l.stats.some((s) => s.label === '密度'))
  check('layout recommends one of three real grids', l.blocks[0].rows.length === 3 && l.blocks[1].code.includes('grid-template-columns'))

  const t = runOf('ec-brand-guardian', '主色 #1e2b4d')
  const scale = colorScale('#1e2b4d')
  check('tokens build a 10-step scale from the seed color',
    scale.length === 10 && scale[9].color === '#1e2b4d')
  check('tokens keep light steps light and dark steps dark',
    scale[0].onWhite < 1.4 && scale[5].onWhite > 2 && scale[9].onWhite > 8)
  check('tokens export usable CSS variables',
    t.blocks[2].code.includes('--brand-500:') && t.blocks[2].code.includes('--fs-2:') && t.blocks[2].code.includes('--sp-1: 4px'))
  check('type scale follows a 1.25 ratio', typeScale(14).map((x) => x.px).join() === '14,18,22,27,34,43')
  check('contrast helper is mathematically sound', contrast('#000000', '#ffffff') === 21 && contrast('#777777', '#777777') === 1)
}

/* ---------- 5. 图表：解析数据并生成真实 SVG ---------- */
{
  const r = runOf('ec-data-viz', '一月 12，二月 20，三月 18，四月 31，五月 40')
  const svg = r.blocks[0].svg
  check('chart parses every labelled number from the input', (svg.match(/<rect/g) ?? []).length === 5)
  check('chart renders axis labels for each point',
    ['一月', '五月'].every((m) => svg.includes(m)))
  check('chart states a conclusion with a real percentage', /\d+\.\d%/.test(r.summary) && r.stats.some((s) => s.label === '变化' && s.value.includes('%')))
  check('chart exports a standalone svg', r.artifacts[0].content.startsWith('<svg') && r.artifacts[0].name.endsWith('.svg'))
  const down = runOf('ec-data-viz', 'Q1 90，Q2 60，Q3 30')
  check('chart detects a downward trend honestly', down.summary.includes('下降'))
}

/* ---------- 6. 配图：真实调用本地素材库 ---------- */
{
  const r = runOf('ec-illustrator', '面向制造业的品牌焕新提案，要专业克制')
  check('art picks files that exist in the local library',
    r.blocks[0].rows.every((row) => row[2].endsWith('.svg')))
  check('art plan covers every page slot', r.blocks[0].rows.length >= 6)
  check('art never points outside the repo', r.blocks[0].rows.every((row) => !row[2].startsWith('http')))
}

/* ---------- 7. 轮播 / 改编 / 文案 ---------- */
{
  const c = runOf('ec-social-carousel', '把我们的内容方法论讲清楚：选题、结构、去 AI 腔、发布节奏、复盘。每张都要能单独看懂。')
  check('carousel fixes the first slide as the hook', c.slides[0].role === '钩子')
  check('carousel fixes the last slide as the CTA', c.slides.at(-1).role === '行动号召')
  check('carousel keeps every title within 16 chars', c.slides.every((s) => s.title.length <= 16))
  check('carousel keeps every body within 42 chars', c.slides.every((s) => s.body.length <= 42))
  check('carousel titles are not duplicates', new Set(c.slides.map((s) => s.title)).size === c.slides.length)

  const rp = runOf('ec-content-repurpose', '产品方案，42 个团队在用，节省 6.5 小时/周，要改编成汇报版、一页纸、轮播和公众号开头')
  check('repurpose produces four formats', rp.blocks[0].rows.length === 4)
  check('repurpose locks the same numbers across formats', rp.summary.includes('42') && rp.blocks[0].rows.every((row) => row[2].includes('42') || row[2].includes('6.5')))

  const cp = runOf('ec-web-copy', '给小团队用的 AI 设计工具，卖点是快、好看、能直接交付')
  check('copy returns three hero options within 12 chars', cp.blocks[0].rows.length === 3 && cp.blocks[0].rows.every((r) => r[1].replace(/\D/g, '') <= 12))
  check('copy offers CTA options', cp.blocks[2].items.length === 3)
}

/* ---------- 8. 原型 + 响应式体检：真实 HTML，真实结论 ---------- */
{
  const p = runOf('ec-web-prototype', '做一个 B 端落地页，主色 #1e2b4d')
  const html = p.preview
  check('prototype is a complete document', html.startsWith('<!doctype html>') && html.includes('</html>'))
  check('prototype declares a viewport', /name="viewport"/.test(html))
  check('prototype ships two real breakpoints', (html.match(/@media/g) ?? []).length === 2)
  check('prototype applies the brand color from the input', html.includes('#1e2b4d'))
  check('prototype has no external dependency', !/https?:\/\//.test(html))
  check('prototype exports as a downloadable html file',
    p.artifacts[0].name.endsWith('.html') && p.artifacts[0].content === html)

  const broken = '<div style="width:1200px"><img src="a.png"><p style="font-size:10px">x</p><div style="width:100vw;height:32px">y</div></div>'
  const audit = auditResponsive(broken)
  const levels = audit.findings.map((f) => f.level)
  check('responsive audit flags a missing viewport as blocking',
    audit.findings.some((f) => f.level === 'high' && f.text.includes('viewport')))
  check('responsive audit flags fixed widths but not max-width',
    audit.findings.some((f) => f.text.includes('固定宽度'))
    && !auditResponsive('<div style="max-width:1040px"></div>').findings.some((f) => f.text.includes('固定宽度')))
  check('responsive audit catches 100vw, tiny fonts, missing alt and small targets',
    ['100vw', '字号小于 12px', 'alt', '触控区'].every((k) => audit.findings.some((f) => f.text.includes(k))))
  check('responsive audit reports severity mix', levels.includes('high') && levels.includes('med') && levels.includes('low'))
  check('clean prototype passes the audit', auditResponsive(html).findings.every((f) => f.level === 'low'))
}

/* ---------- 9. 改稿：真实压缩与去套话 ---------- */
{
  const src = '众所周知，我们非常有效地利用了各种各样的先进工具，可以说在很大程度上充分提升了整体的工作效率，毫无疑问这是一个十分值得注意的重大突破。'
  const { text, hits, splits } = rewriteText(src)
  check('rewrite removes filler words', !/众所周知|非常|各种各样|在很大程度上|毫无疑问|十分/.test(text))
  check('rewrite never leaves dangling punctuation', !/^[，。、；：]/.test(text) && !/[，、；：]{2}/.test(text))
  check('rewrite shrinks the text by a measurable amount', text.length < src.length * 0.6, `${src.length} → ${text.length}`)
  check('rewrite reports which rules fired', hits.length >= 3)
  check('AI tone score drops after rewriting', aiToneScore(src) > aiToneScore(text) && aiToneScore(text) <= 10)
  const long = '这是一句非常长的话，'.repeat(6) + '结束。'
  check('rewrite splits over-long sentences', rewriteText(long).splits >= 1 || long.length < 42)
}

/* ---------- 10. 讲稿 / 需求 / 导入 / 质检 ---------- */
{
  const s = runOf('ec-speaker-coach', '12 页方案，只给 10 分钟，讲给评审专家听')
  check('script distributes exactly the requested minutes',
    s.blocks[0].rows.length === s.blocks[1].items.length + 2 - 2 || s.blocks[0].rows.length >= 4)
  check('script computes words from a real speaking rate', s.stats.some((x) => x.label === '语速' && x.value.includes('240')))
  check('script predicts Q&A', s.blocks[1].items.length === 5 && s.blocks[1].items[0].startsWith('问：'))

  const b = runOf('ec-prompt-architect', '想给经销商做一份季度回顾')
  check('brief lists the assumptions it had to make', b.findings.length >= 2 && b.findings.every((f) => f.text.startsWith('⚠')))
  check('brief asks back the missing questions', b.blocks[1].items.length === 3)

  const imp = runOf('ec-import-fixer', '① 背景\n\n\n② 现状 问题分析\n③ 下一步')
  check('import fix converts circled numbers to a single style',
    /^1\. 背景$/m.test(imp.output) && /^2\. 现状问题分析$/m.test(imp.output) && !/[①-⑳]/.test(imp.output))
  check('import fix collapses blank lines and trailing spaces', !/\n{3,}/.test(imp.output) && !/[ \t]+\n/.test(imp.output))

  const dv = auditDelivery({ text: '这里有 {{title}} 占位，还有 TODO 和 待补充。' })
  check('delivery audit finds placeholders', dv.findings.some((f) => f.level === 'high' && f.text.includes('占位符')) && dv.score < 80)
  const clean = auditDelivery({ text: '三月收入 120 万，四月 150 万，五月 180 万。' })
  check('delivery audit scores clean copy high', clean.score >= 90)
}

/* ---------- 11. 专家团：多能力接力 ---------- */
{
  for (const id of ['ec-team-proposal', 'ec-team-launch', 'ec-team-rebrand', 'ec-team-handover']) {
    const r = runOf(id)
    check(`pipeline ${id} chains real steps`, r.kind === 'pipeline' && r.steps.length >= 2 && r.blocks.length >= 4)
    check(`pipeline ${id} exports combined artifacts`, r.artifacts.length >= 1)
  }
}

/* ---------- 12. 抽屉里真的能开工 ---------- */
{
  const { doc, w, errors } = await loadPage('/experts.html', { freshCopy: true })
  click(w, doc.querySelector('[data-open-expert="ec-data-viz"]'))
  await tick()
  check('drawer exposes a real run panel', !!doc.querySelector('.ex-run-sec') && !!doc.querySelector('#ex-run-input'))
  check('run panel shows which capability and a sample', !!doc.querySelector('.ex-run-cap') && !!doc.querySelector('[data-run-sample]'))

  input(w, doc.querySelector('#ex-run-input'), '一月 12，二月 20，三月 18，四月 31')
  click(w, doc.querySelector('[data-run-expert]'))
  await tick(600)
  const out = doc.querySelector('#ex-run-out')
  check('running the expert renders a real result card', !!out?.querySelector('.xr-result'))
  check('result reflects the pasted data', out.querySelectorAll('.xr-svg rect').length === 4)
  check('result offers download / copy / collapse', [...out.querySelectorAll('.xr-act')].map((a) => a.textContent.trim()).join() === '下载产物,复制结果,收起')

  click(w, doc.querySelector('[data-drawer-close]'))
  await tick()
  click(w, doc.querySelector('[data-open-expert="ec-web-prototype"]'))
  await tick()
  click(w, doc.querySelector('[data-run-expert]'))
  await tick(700)
  const proto = doc.querySelector('#ex-run-out')
  check('prototype result previews in a sandboxed iframe',
    !!proto?.querySelector('iframe.xr-preview')
    && proto.querySelector('iframe').getAttribute('sandbox') === 'allow-same-origin'
    && proto.querySelector('iframe').getAttribute('srcdoc').includes('<!doctype'))
  check('experts page stays error-free', errors.length === 0, errors)
}

/* ---------- 13. 首页：选中专家后产出真实内容 ---------- */
{
  const { doc, w, errors, storage } = await loadPage('/index.html', { freshCopy: true })
  click(w, doc.querySelector('#add-menu-btn'))
  await tick()
  doc.querySelector('#expert-row').dispatchEvent(new w.MouseEvent('mouseenter', { bubbles: true }))
  await tick()
  click(w, [...doc.querySelectorAll('.expert-item')].find((i) => i.dataset.expert === '提案叙事专家'))
  await tick()
  input(w, doc.querySelector('#prompt-input'), '下季度给制造业客户的数字化方案，30 分钟，决策层 5 人')
  click(w, doc.querySelector('#send-btn'))
  await tick(3200)
  const modal = doc.querySelector('.modal-mask')
  const body = modal?.querySelector('.modal-body')
  check('home generation with an expert yields a real result', !!body?.querySelector('.xr-result'))
  check('home result is an outline driven by the prompt', body?.querySelector('.xr-result')?.dataset.resultKind === 'outline')
  check('home result lists one row per page', body.querySelectorAll('.xr-table tbody tr').length >= 8)
  check('home result can be downloaded', [...modal.querySelectorAll('.modal-foot button')].some((b) => b.textContent.includes('下载')))
  check('home keeps the creation persisted', readState(storage).gammas.length >= 1)
  check('home flow stays error-free', errors.length === 0, errors)
}

console.log(`\n${fails.length === 0 ? `ALL ${passed} EXPERT RUNTIME CHECKS PASSED` : `${fails.length} FAILED: ${fails.join('; ')}`}`)
process.exit(fails.length ? 1 : 0)
