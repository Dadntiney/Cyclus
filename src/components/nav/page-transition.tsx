"use client"

import { useEffect, useRef, ViewTransition, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { markNavigation, ensurePopstateTracking, consumePopNavigationFlag } from "@/lib/client/navigation-depth"
import { scrollToHash } from "@/lib/client/hash-scroll"

/**
 * Soft route transitions without blanking the screen.
 * Remounting with opacity:0 felt houterig; ViewTransition crossfades
 * between screens while chrome (header/nav) stays put.
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
    <ViewTransition
      key={pathname}
      enter={{
        tab: "vt-tab",
        "nav-forward": "vt-forward",
        "nav-back": "vt-back",
        default: "vt-fade",
      }}
      exit={{
        tab: "vt-tab",
        "nav-forward": "vt-forward",
        "nav-back": "vt-back",
        default: "vt-fade",
      }}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}
