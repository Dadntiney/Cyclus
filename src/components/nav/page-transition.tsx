"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { markNavigation, ensurePopstateTracking, consumePopNavigationFlag } from "@/lib/client/navigation-depth"
import { scrollToHash } from "@/lib/client/hash-scroll"

/**
 * Replays a short fade/slide-in whenever the route changes, so navigating
 * between screens feels like a native app rather than a hard page swap.
 * Keyed by pathname so React remounts (and re-animates) on every route.
 *
 * Also the one place that observes every route change app-wide, so it
 * doubles as the source for BackButton's "has she navigated in-app yet"
 * signal (see lib/client/navigation-depth), resets scroll to the top for a
 * genuinely new screen, and drives every #hash deep link (see hash-scroll):
 * - a back/forward move (popstate) restores scroll natively, so neither
 *   the top-reset nor the hash-scroll below run for it;
 * - a link to a hash (e.g. /profiel#slaap) skips the top-reset and instead
 *   polls for that element and scrolls to it once it exists — several
 *   routes render a loading.tsx skeleton first, so the real target often
 *   isn't in the DOM yet at the moment the navigation "completes".
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isFirstPathname = useRef(true)
  const cancelHashScroll = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    ensurePopstateTracking()
  }, [])

  useEffect(() => {
    function handleHashChange() {
      cancelHashScroll.current?.()
      cancelHashScroll.current = scrollToHash(window.location.hash)
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
      cancelHashScroll.current?.()
    }
  }, [pathname])

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
