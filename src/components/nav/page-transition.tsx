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

/* ——— Focus on back/forward (NAVQA-7) ——— */

/** The control she last used on a screen, found again by what it is. */
type FocusMark = { signature: string; index: number }

const CONTROL_SELECTOR = "a[href], button, [role='button'], [role='radio'], [role='tab'], summary"
/** Per pathname: the control that was focused last (usually the one that opened the next screen). */
const lastFocusByPath = new Map<string, FocusMark>()

function controlSignature(el: Element): string {
  const label = el.getAttribute("aria-label") ?? (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80)
  return `${el.tagName}|${el.getAttribute("href") ?? ""}|${label}`
}

function markFor(el: Element, main: Element): FocusMark | null {
  const control = el.closest(CONTROL_SELECTOR)
  if (!control || !main.contains(control)) return null
  const signature = controlSignature(control)
  const same = Array.from(main.querySelectorAll(CONTROL_SELECTOR)).filter(
    (c) => controlSignature(c) === signature,
  )
  return { signature, index: Math.max(0, same.indexOf(control)) }
}

function findMark(mark: FocusMark, main: Element): HTMLElement | null {
  const same = Array.from(main.querySelectorAll<HTMLElement>(CONTROL_SELECTOR)).filter(
    (c) => controlSignature(c) === mark.signature && !c.closest("[inert]"),
  )
  return same[mark.index] ?? same[0] ?? null
}

/** Remember the focused control per screen (text fields are skipped: refocusing one would open the keyboard). */
function trackFocus(event: FocusEvent) {
  const main = document.querySelector("main")
  const target = event.target
  if (!main || !(target instanceof Element) || !main.contains(target)) return
  if (target.matches("input, textarea, select, [contenteditable='true']")) return
  const mark = markFor(target, main)
  if (mark) lastFocusByPath.set(window.location.pathname, mark)
}

/**
 * After back/forward, put focus back on the control that opened the next
 * screen (a recipe card, "Medicatie toevoegen"), else on the h1 — never
 * leave it on <body> or on the app bar's back link, which now points
 * somewhere else. Leaves focus alone once she is working in the page.
 */
function restoreFocus(pathname: string): () => void {
  let cancelled = false
  let observer: MutationObserver | undefined
  let timer: number | undefined
  let frame = 0
  let cancelHeading: (() => void) | undefined
  const mark = lastFocusByPath.get(pathname)

  const stop = () => {
    observer?.disconnect()
    observer = undefined
    if (timer !== undefined) window.clearTimeout(timer)
  }

  const focusLost = (main: Element) => {
    const active = document.activeElement
    return !active || active === document.body || !main.contains(active)
  }

  // The h1 may still be streaming in (a refreshed page shows its skeleton
  // first, e.g. /medicatie after a save), so wait for it like a push does.
  const focusHeading = () => {
    cancelHeading = focusPageHeading()
  }

  /** true = done (restored, or she is already busy in the page). */
  const tryRestore = (): boolean => {
    const main = document.querySelector("main")
    if (!main) return false
    if (!focusLost(main)) return true
    const el = mark ? findMark(mark, main) : null
    if (!el) return false
    el.focus({ preventScroll: true })
    return true
  }

  frame = requestAnimationFrame(() => {
    if (cancelled || tryRestore()) return
    if (!mark) {
      focusHeading()
      return
    }
    // The control may stream in a moment later; then give up on it.
    const main = document.querySelector("main")
    if (main) {
      observer = new MutationObserver(() => {
        if (!cancelled && tryRestore()) stop()
      })
      observer.observe(main, { childList: true, subtree: true })
    }
    timer = window.setTimeout(() => {
      stop()
      if (!cancelled) focusHeading()
    }, 1000)
  })

  return () => {
    cancelled = true
    cancelAnimationFrame(frame)
    stop()
    cancelHeading?.()
  }
}

/**
 * Route shell: scroll, hash, motion and focus per navigation (§4.6, §6.2).
 * - Tab switch (push to a tab root): instant.
 * - Push to any other screen: opacity .92 → 1 in 160ms, no transform and
 *   no lasting fill (a transform would trap `fixed` children — besluit 10);
 *   off under reduced motion. Opens at the top; focus moves to the h1.
 * - Back/forward (popstate): no animation, the browser's scroll position;
 *   focus returns to the control that opened the next screen (else the h1).
 * - Replace: opens at the top, no animation; focus moves to the h1 when it
 *   was lost (leaving a flow or a deep link with no history to go back to).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const isFirstPathname = useRef(true)
  const cancelHashScroll = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    ensurePopstateTracking()
    document.addEventListener("focusin", trackFocus)
    return () => document.removeEventListener("focusin", trackFocus)
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
    if (travelled) return restoreFocus(pathname)
    if (action === "replace") return hasHash ? undefined : focusPageHeading()
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
