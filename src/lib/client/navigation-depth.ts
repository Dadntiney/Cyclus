/**
 * Tracks whether she has navigated client-side at least once since this
 * tab loaded the app. A plain module-level counter (not React state) —
 * BackButton just needs a yes/no read at click time, not a re-render.
 *
 * Why this exists: Next.js gives no reliable "can I go back" signal, and
 * `window.history.length` counts entries from before the app was ever
 * opened too. But PageTransition re-renders on every route change, so it
 * can mark each one here — "at least one in-app navigation happened" is
 * exactly the condition under which router.back() is safe to trust to land
 * somewhere relevant, as opposed to a fresh page load or a deep link.
 */
let navigationCount = 0

export function markNavigation() {
  navigationCount += 1
}

export function hasNavigatedInApp(): boolean {
  return navigationCount > 0
}
