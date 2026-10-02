"use client"

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { consumePopNavigationFlag, ensurePopstateTracking } from "@/lib/client/navigation-depth"
import { scrollToHash } from "@/lib/client/hash-scroll"
import { isTabRoot } from "@/lib/navigation/features"
import { getLastNavigation } from "@/lib/navigation/nav-store"

const PUSH_CLASS = "animate-page-push"
/** Stop waiting for a streamed-in h1 after this long. */
const FOCUS_WAIT_MS = 5000

/**
 * After a push, move focus to the new page's h1 (tabIndex −1, no ring) so a
 * screen reader starts reading the new screen. Waits for the h1 when the
 * page streams in after a loading skeleton. Leaves focus alone once she is
 * already working inside the new page.
 */
function focusPageHeading(): () => void {
  let cancelled = false
  let observer: MutationObserver | undefined
  let timer: number | undefined
  let frame = 0

  const stop = () => {
    observer?.disconnect()
    observer = undefined
    if (timer !== undefined) window.clearTimeout(timer)
  }

  const tryFocus = (): boolean => {
    const main = document.querySelector("main")
    const h1 = main?.querySelector<HTMLElement>("h1")
    if (!main || !h1) return false
    const active = document.activeElement
    if (active && active !== document.body && main.contains(active) && !h1.contains(active)) return true
    if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1")
    if (!h1.hasAttribute("data-focus-target")) h1.setAttribute("data-focus-target", "")
    h1.focus({ preventScroll: true })
    return true
  }

  // After Next.js has finished its own scroll/focus handling for the route.
  frame = requestAnimationFrame(() => {
    if (cancelled || tryFocus()) return
    const main = document.querySelector("main")
    if (!main) return
    observer = new MutationObserver(() => {
      if (!cancelled && tryFocus()) stop()
    })
    observer.observe(main, { childList: true, subtree: true })
    timer = window.setTimeout(stop, FOCUS_WAIT_MS)
  })

  return () => {
    cancelled = true
    cancelAnimationFrame(frame)
    stop()
  }
}

/**
 * Route shell: scroll, hash, motion and focus per navigation (§4.6, §6.2).
 * - Tab switch (push to a tab root): instant.
 * - Push to any other screen: opacity .92 → 1 in 160ms, no transform and
 *   no lasting fill (a transform would trap `fixed` children — besluit 10);
 *   off under reduced motion. Opens at the top; focus moves to the h1.
 * - Back/forward (popstate): no animation, the browser's scroll position.
 * - Replace: opens at the top, no animation.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
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

  // Layout effect: Next.js has written the history entry (insertion
  // effect) by now, so the store knows whether this was a push or a pop,
  // and the animation class lands before the first paint.
  useLayoutEffect(() => {
    if (isFirstPathname.current) {
      isFirstPathname.current = false
      return
    }
    // Keep the legacy flag in sync for anyone still reading it.
    consumePopNavigationFlag()
    const { action } = getLastNavigation()
    const travelled = action === "pop" || action === "forward" || action === "reset"
    const hasHash = !!window.location.hash

    if (!travelled && !hasHash) window.scrollTo(0, 0)
    if (action !== "push" || isTabRoot(pathname)) return

    const el = ref.current
    if (el) {
      // Animation events of children bubble up too; only ours ends it.
      const done = (event: AnimationEvent) => {
        if (event.target !== el) return
        el.classList.remove(PUSH_CLASS)
        el.removeEventListener("animationend", done)
        el.removeEventListener("animationcancel", done)
      }
      el.classList.add(PUSH_CLASS)
      el.addEventListener("animationend", done)
      el.addEventListener("animationcancel", done)
    }
    return hasHash ? undefined : focusPageHeading()
  }, [pathname])

  return (
    <div key={pathname} ref={ref}>
      {children}
    </div>
  )
}
