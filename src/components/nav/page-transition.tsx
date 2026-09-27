"use client"

import { ViewTransition } from "react"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/**
 * Crossfades route content on every navigation via the browser's View
 * Transitions API (React's <ViewTransition>, activated automatically by
 * App Router navigations). key={pathname} makes React treat the old and
 * new route as an exit/enter pair instead of an in-place update; "auto"
 * uses React's built-in crossfade, no custom CSS needed. Falls back to an
 * instant swap in browsers without View Transitions support.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <ViewTransition key={pathname} name="page-content" share="auto" enter="auto" default="none">
      {children}
    </ViewTransition>
  )
}
