"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { markNavigation, ensurePopstateTracking, consumePopNavigationFlag } from "@/lib/client/navigation-depth"
import { scrollToHash } from "@/lib/client/hash-scroll"

/**
 * Route shell: scroll/hash/depth bookkeeping + a very light enter fade.
 * No ViewTransition crossfade/slide — that read busy and “webby” on
 * GoFiev’s calm surfaces; tabs especially should feel near-instant.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isFirstPathname = useRef(true)
  const cancelHashScroll = useRef<(() => void) | undefined>(undefined)
  const isPrimaryTab = /^\/(vandaag|deze-week|cyclus|buddy|profiel)(\/|$)/.test(pathname)

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
    <div
      key={pathname}
      className={isPrimaryTab ? undefined : "motion-safe:animate-page-soft"}
    >
      {children}
    </div>
  )
}
