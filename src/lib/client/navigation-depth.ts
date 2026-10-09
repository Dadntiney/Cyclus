import { ensureHistoryTracking, goBackOr, hasHistory } from "@/lib/navigation/nav-store"

/**
 * Compatibility layer over the navigation store (src/lib/navigation).
 * New code uses `goBackOr` / `replaceTo` / `hasHistory` from
 * "@/lib/navigation/nav-store" directly; these exports keep older call
 * sites working unchanged.
 */

/**
 * @deprecated The store records every navigation itself (it wraps
 * history.pushState/replaceState); calling this is harmless and does nothing.
 */
export function markNavigation() {}

/**
 * Is there an in-app screen to go back to? True when router.back() lands on
 * a screen of this app — false on a deep link, a notification or a fresh
 * load, where a fallback link should be used instead.
 */
export function hasNavigatedInApp(): boolean {
  return hasHistory()
}

/**
 * Distinguishes a browser back/forward move (popstate — scroll position
 * should be restored, native-app style) from an in-app Link click or
 * router.push (a genuinely new screen — should open at the top). The
 * listener is attached once per tab; popstate fires synchronously before
 * the resulting pathname change reaches PageTransition's effect, so the
 * flag is reliably set by the time it's read.
 */
let isPopNavigation = false
let popstateListenerAttached = false

export function ensurePopstateTracking() {
  ensureHistoryTracking()
  if (popstateListenerAttached || typeof window === "undefined") return
  popstateListenerAttached = true
  window.addEventListener("popstate", () => {
    isPopNavigation = true
  })
}

export function consumePopNavigationFlag(): boolean {
  const was = isPopNavigation
  isPopNavigation = false
  return was
}

/**
 * Leaving a finished flow (workout done, exercise done, medication saved):
 * go back to wherever she came from. Pushing the parent page instead put it
 * on top of the finished screen, so the next "back" reopened that screen.
 * Without in-app history the finished screen is replaced by the parent.
 */
export function leaveFlow(
  router: { back(): void; replace(href: string): void },
  fallbackHref: string,
) {
  goBackOr(router, fallbackHref)
}
