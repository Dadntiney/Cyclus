// Minimal PWA shell cache: speeds up repeat loads of static, hashed assets
// (Next.js build output + app icons). Deliberately does NOT cache pages,
// API routes or Server Action POSTs — those must always hit the network so
// auth state and data stay correct. Bump CACHE_NAME to invalidate old caches
// on the next deploy. Page loads that fail without a connection fall back
// to the precached /offline.html instead of the browser's error screen.
const CACHE_NAME = "gofiev-static-v2"
const CACHEABLE_PATH_PREFIXES = ["/_next/static/", "/icons/"]
const OFFLINE_URL = "/offline.html"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL, "/icons/icon-192.png"]))
      .catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

function isCacheable(request) {
  if (request.method !== "GET") return false
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return false
  return CACHEABLE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
}

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || Response.error()),
      ),
    )
    return
  }

  if (!isCacheable(event.request)) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        }
        return response
      })
    }),
  )
})

// ---- Real web push (see src/app/api/cron/send-reminders and src/lib/push) ----

self.addEventListener("push", (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: "GoFiev", body: event.data.text() }
  }

  const title = payload.title || "GoFiev"
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: payload.tag,
      data: { url: payload.url || "/vandaag" },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || "/vandaag"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        const clientUrl = new URL(client.url)
        if (clientUrl.origin === self.location.origin && "focus" in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      return self.clients.openWindow(targetUrl)
    }),
  )
})
