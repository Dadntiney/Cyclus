// Purely a safety backstop against a typo'd/removed id watching forever —
// not tuned for the success path, since MutationObserver (not a timeout)
// is what actually detects the element.
const GIVE_UP_MS = 20000
// How long to keep correcting for layout shifts (images and other async
// content near the target loading in and pushing it around) after the
// first successful scroll, before leaving the user's scroll position alone.
const SETTLE_MS = 1200

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Next's own "scroll to #hash" behavior only runs once, right when a
 * navigation completes. Several routes here (anything with a loading.tsx —
 * /profiel among them) render a skeleton first while their Server Component
 * data loads, so the element the hash actually points at (e.g. the "Slaap"
 * Card) doesn't exist in the DOM yet at that moment. Next never retries, so
 * the page silently opens at the top instead of at the anchor.
 *
 * This used to poll on a fixed timeout, which was exactly why it worked
 * "sometimes" — a cold serverless start plus a couple of Supabase round
 * trips can easily take longer than any fixed window, so the poll would
 * occasionally give up before the element ever appeared. A MutationObserver
 * has no such race: it reacts the moment the element is actually added,
 * however long that takes. It then keeps correcting for a short settle
 * window in case an image or other async content above/around the target
 * reflows the page right after — the same kind of intermittent "worked
 * this time, not that time" symptom, just from a different cause.
 * `scroll-padding-top` in globals.css keeps every one of these scrolls
 * from landing under the sticky mobile header.
 *
 * Returns a cancel function so a caller can abandon the attempt (e.g. the
 * user navigated on again before it resolved).
 */
export function scrollToHash(hash: string): (() => void) | undefined {
  if (!hash) return undefined

  let id: string
  try {
    id = decodeURIComponent(hash.replace(/^#/, ""))
  } catch {
    id = hash.replace(/^#/, "")
  }
  if (!id) return undefined

  let cancelled = false
  let findObserver: MutationObserver | undefined
  let settleObserver: ResizeObserver | undefined
  let giveUpTimer: number | undefined
  let settleTimer: number | undefined
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth"

  function scrollNow(smooth: boolean): boolean {
    const el = document.getElementById(id)
    if (!el) return false
    el.scrollIntoView({ behavior: smooth ? behavior : "auto", block: "start" })
    return true
  }

  function stopFinding() {
    findObserver?.disconnect()
    findObserver = undefined
    if (giveUpTimer !== undefined) window.clearTimeout(giveUpTimer)
  }

  function stopSettling() {
    settleObserver?.disconnect()
    settleObserver = undefined
    if (settleTimer !== undefined) window.clearTimeout(settleTimer)
  }

  function watchForLateLayoutShifts() {
    settleObserver = new ResizeObserver(() => {
      if (!cancelled) scrollNow(false)
    })
    settleObserver.observe(document.body)
    settleTimer = window.setTimeout(stopSettling, SETTLE_MS)
  }

  function onFound() {
    stopFinding()
    scrollNow(true)
    watchForLateLayoutShifts()
  }

  if (scrollNow(true)) {
    watchForLateLayoutShifts()
  } else {
    findObserver = new MutationObserver(() => {
      if (cancelled) return
      if (document.getElementById(id)) onFound()
    })
    findObserver.observe(document.body, { childList: true, subtree: true })
    giveUpTimer = window.setTimeout(stopFinding, GIVE_UP_MS)
  }

  return () => {
    cancelled = true
    stopFinding()
    stopSettling()
  }
}

/**
 * Jump to an element on the current page without touching history.
 *
 * A plain `<a href="#x">` adds a native history entry with `state: null`.
 * Next's app router ignores popstate events without its own state, so
 * "back" from a screen opened after such a jump only changed the URL and
 * left the old screen showing (NAVQA-1). This scrolls the target to the
 * top (the app bar sits in `scroll-padding-top`) and moves focus there, so
 * keyboard and screen-reader users continue at the target. Returns whether
 * the target exists.
 */
export function jumpToId(id: string): boolean {
  const el = typeof document === "undefined" ? null : document.getElementById(id)
  if (!el) return false
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" })
  if (el.tabIndex < 0 && !el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1")
    el.setAttribute("data-focus-target", "")
  }
  el.focus({ preventScroll: true })
  return true
}
