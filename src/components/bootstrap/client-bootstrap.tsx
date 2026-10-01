"use client"

import { useEffect } from "react"

/**
 * One-time client bootstrap, mounted once in the root layout:
 * - registers the static-asset service worker (public/sw.js)
 * - inside Capacitor only: splash + status bar (dynamic import so the web
 *   bundle never pays for @capacitor/* on the critical path)
 */
export function ClientBootstrap() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {})
    }
    void import("@/lib/platform").then(({ initNativeShell }) => {
      void initNativeShell()
    })
  }, [])

  return null
}
