/* Design Buddy 本地 Service Worker：让「安装为桌面应用」满足可安装性要求，
   并提供离线外壳缓存。仅缓存同源 GET，绝不代理第三方请求。 */
const CACHE = 'design-buddy-shell-v1'
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
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && (req.destination === 'image' || req.destination === 'style' || req.destination === 'script')) {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copy))
      }
      return res
    }).catch(() => caches.match('./index.html'))),
  )
})
