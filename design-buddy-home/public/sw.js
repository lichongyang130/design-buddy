/* Design Buddy 本地 Service Worker：让「安装为桌面应用」满足可安装性要求，
   并提供离线外壳缓存。仅缓存同源 GET，绝不代理第三方请求。
   策略：
   - 页面导航：network-first，保证新版本构建后用户立刻能看到，离线才回退缓存
   - 脚本/样式/图片等静态资源：stale-while-revalidate，秒开且后台静默更新
   - 缓存版本号升级即清空全部旧缓存，避免旧壳长期驻留 */
const CACHE = 'design-buddy-shell-v2'
const SHELL = [
  './',
  './index.html',
  './site.webmanifest',
  './icon-192.png',
  './icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  // 页面导航：网络优先，失败（离线）才用缓存外壳
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html'))),
    )
    return
  }

  // 静态资源：stale-while-revalidate，先给缓存再后台更新
  if (['script', 'style', 'image', 'font', 'manifest'].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const network = fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }).catch(() => hit)
        return hit || network
      }),
    )
  }
})
