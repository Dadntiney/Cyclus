/**
 * Central home for anything that should behave differently once this app
 * runs inside a native shell (Capacitor) instead of a browser tab. Every
 * export here is a safe no-op on the web today; wiring in the real
 * Capacitor plugins later only touches this file, not every call site
 * that already calls into it.
 */

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.("(display-mode: standalone)").matches === true || nav.standalone === true
}

export function isNativeShell(): boolean {
  if (typeof window === "undefined") return false
  return Boolean((window as unknown as { Capacitor?: unknown }).Capacitor)
}

export type HapticStyle = "light" | "medium" | "heavy"

/**
 * No-op outside a native shell. Once this app is wrapped in Capacitor,
 * replace the body with @capacitor/haptics' Haptics.impact({ style }) —
 * every call site already calls this function, so nothing else changes.
 */
export function triggerHaptic(style: HapticStyle = "light") {
  if (!isNativeShell()) return
  void style
}
