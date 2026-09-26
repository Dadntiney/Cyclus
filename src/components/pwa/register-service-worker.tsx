"use client"

import { useEffect } from "react"

/**
 * Registers the static-asset service worker (public/sw.js). Silently does
 * nothing where unsupported (older browsers, some in-app browsers) and
 * never blocks rendering — this is pure background enhancement.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal: the app works identically without the cache.
    })
  }, [])

  return null
}
