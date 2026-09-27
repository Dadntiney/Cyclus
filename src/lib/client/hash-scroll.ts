const TIMEOUT_MS = 4000
const POLL_MS = 50

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
 * This polls until the element actually exists — however long streaming
 * takes — then scrolls it into view. `scroll-padding-top` in globals.css
 * keeps the result from landing under the sticky mobile header.
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
  const deadline = Date.now() + TIMEOUT_MS
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth"

  function attempt() {
    if (cancelled) return
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior, block: "start" })
      return
    }
    if (Date.now() < deadline) {
      window.setTimeout(attempt, POLL_MS)
    }
  }

  attempt()
  return () => {
    cancelled = true
  }
}
