/* UAQ Family Connect service worker
   - Makes the installed app open instantly and survive weak signal.
   - NEVER caches Supabase / API traffic or anything cross-origin:
     resident data always comes live from the server.
   Bump VERSION whenever you want every phone to drop old caches. */
const VERSION = 'fc-2026-10-14'
const SHELL = ['/offline.html', '/manifest.webmanifest', '/images/uaq-mark.png', '/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // Supabase, fonts, etc. → straight to network

  // Page loads: always from the network so data and login state are fresh.
  // With no signal, show the branded offline page instead of opening the app
  // (opening the app offline would fail to load data and sign the family out).
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')))
    return
  }

  // Built JS/CSS have hashed names, images rarely change: cache-first, refresh in background.
  if (url.pathname.startsWith('/assets/') || /\.(png|jpe?g|webp|svg|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        const hit = await cache.match(req)
        const net = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone())
            return res
          })
          .catch(() => hit)
        return hit || net
      })
    )
  }
})

// 📲 Notifications from the care team (sent by the UAQ bot, Web Push).
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'UAQ Family Connect', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url: data.url || '/' },
    })
  )
})

// Tap on a notification: focus the open app (or open it) on the right page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (new URL(w.url).origin === self.location.origin) {
          return w.focus().then(() => w.navigate(target)).catch(() => self.clients.openWindow(target))
        }
      }
      return self.clients.openWindow(target)
    })
  )
})
