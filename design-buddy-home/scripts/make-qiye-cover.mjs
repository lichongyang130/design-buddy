// Build a composed cover from the real App screen, not a generated/fake UI.
// Requires a running preview and optional local Playwright + Chromium tooling.
// QIYE_PLAYWRIGHT_MODULE / QIYE_CHROMIUM_MODULE can point to external installs.
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { chromium } = await import(process.env.QIYE_PLAYWRIGHT_MODULE || 'playwright')
const provider = process.env.QIYE_CHROMIUM_MODULE
  ? (await import(process.env.QIYE_CHROMIUM_MODULE)).default
  : null
const browser = await chromium.launch({
  headless: true,
  ...(provider ? { executablePath: await provider.executablePath(), args: provider.args } : {}),
  ...(process.env.QIYE_BROWSER_EXECUTABLE ? { executablePath: process.env.QIYE_BROWSER_EXECUTABLE } : {}),
})
const base = process.env.QIYE_PREVIEW_URL || 'http://127.0.0.1:5174'
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
  await page.goto(`${base}/qiye-app.html?embed=1#home`)
  await page.locator('.q-hero').waitFor()
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})))
  })
  const screen = `data:image/png;base64,${(await page.screenshot()).toString('base64')}`
  await page.setViewportSize({ width: 1200, height: 714 })
  await page.setContent(`<!doctype html><html lang="zh-CN"><head>
    <link rel="stylesheet" href="${base}/art/qiye/fonts/fonts.css">
    <style>
    *{box-sizing:border-box}body{margin:0;width:1200px;height:714px;overflow:hidden;background:#eaf0e5;color:#254c38;font-family:'Qiye Sans',sans-serif;position:relative}
    .photo{position:absolute;inset:0 0 0 630px;background:linear-gradient(90deg,#eaf0e5 0%,#eaf0e529 35%,#244a3620),url('${base}/art/qiye/mountain.webp') center/cover;opacity:.62}
    .orb{position:absolute;width:730px;height:730px;border-radius:50%;border:1px solid #ffffff80;left:605px;top:-40px;box-shadow:0 0 0 35px #ffffff14,0 0 0 70px #ffffff0e}
    .copy{position:absolute;left:73px;top:64px;width:600px}
    .eyebrow{display:flex;gap:12px;align-items:center;font-size:12px;letter-spacing:3px;color:#819477}.eyebrow:before{content:'';width:24px;height:1px;background:#819477}
    h1{font-family:'Qiye Serif',serif;font-size:136px;font-weight:400;letter-spacing:10px;line-height:1.1;margin:62px 0 15px}
    .english{font-size:13px;letter-spacing:10px;color:#7a9270;margin:0 0 37px 6px}
    h2{font-size:28px;font-weight:400;letter-spacing:3px;margin:0 0 17px 5px}
    .caption{font-size:13px;letter-spacing:2px;color:#8a9b7f;margin-left:7px}
    .badge{display:inline-flex;align-items:center;gap:12px;margin:35px 0 0 6px;padding:12px 19px;border:1px solid #b8c9ad;border-radius:30px;font-size:11px;letter-spacing:2px;color:#708966}
    .badge i{width:5px;height:5px;background:#779768;border-radius:50%}
    .phone{position:absolute;width:280px;height:601px;left:807px;top:53px;transform:rotate(8deg);border:8px solid #213b2b;border-radius:41px;background:#f6f8f3;box-shadow:10px 28px 45px #1c392b40,0 0 0 1px #82947d;overflow:hidden}
    .phone img{width:264px;height:585px;display:block;object-fit:fill;border-radius:32px}
    .bottom{position:absolute;bottom:36px;left:79px;display:flex;gap:18px;align-items:center;color:#91a086;font-size:9px;letter-spacing:2px}.bottom span{width:30px;border-top:1px solid #adbea2}
    </style></head><body><div class="photo"></div><div class="orb"></div><div class="copy"><div class="eyebrow">MOBILE APP / TRAVEL</div><h1>栖野</h1><p class="english">Q I Y E</p><h2>周末，去自然里。</h2><div class="caption">发现一处风景 · 留给一个周末</div><div class="badge"><i></i> 周末旅行 APP</div></div><div class="phone"><img src="${screen}" alt="栖野 App 真实首页"></div><div class="bottom">DESIGN BUDDY <span></span> INTERACTIVE APP CASE</div></body></html>`)
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([...document.images].map(img => img.decode()))
  })
  const png = await page.screenshot({ type: 'png', scale: 'css' })
  const webp = await page.evaluate(async data => {
    const image = new Image()
    image.src = data
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width; canvas.height = image.height
    canvas.getContext('2d').drawImage(image, 0, 0)
    return canvas.toDataURL('image/webp', 0.93).split(',')[1]
  }, `data:image/png;base64,${png.toString('base64')}`)
  const target = resolve(root, 'public/art/qiye/cover.webp')
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, Buffer.from(webp, 'base64'))
  console.log(`Created ${target} · 1200 × 714 · real App screenshot`)
} finally {
  await browser.close()
}
