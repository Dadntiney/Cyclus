"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { markNavigation, ensurePopstateTracking, consumePopNavigationFlag } from "@/lib/client/navigation-depth"

/**
 * Replays a short fade/slide-in whenever the route changes, so navigating
 * between screens feels like a native app rather than a hard page swap.
 * Keyed by pathname so React remounts (and re-animates) on every route.
 *
 * Also the one place that observes every route change app-wide, so it
 * doubles as the source for BackButton's "has she navigated in-app yet"
 * signal (see lib/client/navigation-depth), and resets scroll to the top
 * for a genuinely new screen — but only when that's actually appropriate:
 * a back/forward move (popstate) restores scroll natively, and a link to
 * a hash (e.g. /profiel#slaap) is left to the browser's own anchor
 * scrolling (see the scroll-padding-top rule in globals.css for why that
 * doesn't end up hidden behind the sticky mobile header).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isFirstPathname = useRef(true)

  useEffect(() => {
    ensurePopstateTracking()
  }, [])

  useEffect(() => {
    if (isFirstPathname.current) {
      isFirstPathname.current = false
      return
    }
    markNavigation()
    if (!consumePopNavigationFlag() && !window.location.hash) {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return (
    <div key={pathname} className="motion-safe:animate-page-in">
      {children}
    </div>
  )
}
