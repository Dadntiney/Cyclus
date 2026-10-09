"use client"

import { ensureHistoryTracking } from "@/lib/navigation/nav-store"

/**
 * Loads the navigation store on every page (root layout), so history is
 * tracked from the very first screen — also on pages outside the app shell
 * (login, legal) that later link into the app or offer a back link.
 * Installing is idempotent and needs no effect: it only wraps
 * history.pushState/replaceState once.
 */
export function NavigationTracker() {
  if (typeof window !== "undefined") ensureHistoryTracking()
  return null
}
