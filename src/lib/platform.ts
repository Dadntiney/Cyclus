/**
 * Central home for anything that should behave differently once this app
 * runs inside a native shell (Capacitor) instead of a browser tab. Every
 * call site imports from here rather than reaching for @capacitor/* or
 * window.Capacitor directly, so the web build never has to think about it
 * and this file stays the one place that knows the difference.
 */

import { Capacitor } from "@capacitor/core"

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia?.("(display-mode: standalone)").matches === true || nav.standalone === true
}

/** True only inside the actual iOS/Android app — never in a browser, PWA included. */
export function isNativeShell(): boolean {
  return Capacitor.isNativePlatform()
}

export type HapticStyle = "light" | "medium" | "heavy"

/**
 * No-op on the web (there's no meaningful haptic equivalent worth faking).
 * Dynamically imports @capacitor/haptics so the ~1KB plugin bridge never
 * loads in the browser bundle at all.
 */
export async function triggerHaptic(style: HapticStyle = "light") {
  if (!isNativeShell()) return
  const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
  const impactStyle =
    style === "heavy" ? ImpactStyle.Heavy : style === "medium" ? ImpactStyle.Medium : ImpactStyle.Light
  await Haptics.impact({ style: impactStyle }).catch(() => {})
}

/**
 * Native-only startup chores: hide the splash screen once the first real
 * screen has painted, and match the status bar to the cream background.
 * Called once from RegisterServiceWorker (already the app's one client-only
 * "runs once on mount" component) — a no-op on the web.
 */
export async function initNativeShell() {
  if (!isNativeShell()) return
  const [{ SplashScreen }, { StatusBar, Style }] = await Promise.all([
    import("@capacitor/splash-screen"),
    import("@capacitor/status-bar"),
  ])
  await Promise.all([
    StatusBar.setStyle({ style: Style.Light }).catch(() => {}),
    StatusBar.setBackgroundColor({ color: "#faf6f0" }).catch(() => {}),
    SplashScreen.hide().catch(() => {}),
  ])
}
