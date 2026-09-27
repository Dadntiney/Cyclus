"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { markNavigation } from "@/lib/client/navigation-depth"

/**
 * Replays a short fade/slide-in whenever the route changes, so navigating
 * between screens feels like a native app rather than a hard page swap.
 * Keyed by pathname so React remounts (and re-animates) on every route.
 *
 * Also the one place that observes every route change app-wide, so it
 * doubles as the source for BackButton's "has she navigated in-app yet"
 * signal (see lib/client/navigation-depth) — skipping the very first
 * pathname (the page she actually loaded, not something she navigated to).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isFirstPathname = useRef(true)

  useEffect(() => {
    if (isFirstPathname.current) {
      isFirstPathname.current = false
      return
    }
    markNavigation()
  }, [pathname])

  return (
    <div key={pathname} className="motion-safe:animate-page-in">
      {children}
    </div>
  )
}
