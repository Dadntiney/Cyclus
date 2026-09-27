"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Replays a short fade/slide-in whenever the route changes, so navigating
 * between screens feels like a native app rather than a hard page swap.
 * Keyed by pathname so React remounts (and re-animates) on every route.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="motion-safe:animate-page-in">
      {children}
    </div>
  )
}
