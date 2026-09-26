// Minimal PWA shell cache: speeds up repeat loads of static, hashed assets
// (Next.js build output + app icons). Deliberately does NOT cache pages,
// API routes or Server Action POSTs — those must always hit the network so
// auth state and data stay correct. Bump CACHE_NAME to invalidate old caches
// on the next deploy.
const CACHE_NAME = "cyclus-static-v1"
const CACHEABLE_PATH_PREFIXES = ["/_next/static/", "/icons/"]

self.addEventListener("install", (event) => {
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
