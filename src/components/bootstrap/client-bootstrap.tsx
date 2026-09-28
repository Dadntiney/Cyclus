"use client"

import { useEffect } from "react"
import { initNativeShell } from "@/lib/platform"

/**
 * One-time client bootstrap, mounted once in the root layout:
 * - registers the static-asset service worker (public/sw.js) — silently
 *   does nothing where unsupported, never blocks rendering.
 * - inside the Capacitor native shell only: hides the splash screen and
 *   matches the status bar to the app background (initNativeShell is a
 *   no-op on the web).
 */
export function ClientBootstrap() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-fatal: the app works identically without the cache.
      })
    }
    initNativeShell()
  }, [])

  return null
}
