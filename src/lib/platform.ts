/**
 * Central home for anything that should behave differently once this app
 * runs inside a native shell (Capacitor) instead of a browser tab. Every
 * call site imports from here rather than reaching for @capacitor/* or
 * window.Capacitor directly, so the web build never has to think about it
 * and this file stays the one place that knows the difference.
 */

import { Capacitor } from "@capacitor/core"
import { BRAND_HEX } from "@/lib/theme/brand"

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

/** Mirrors the dark-mode resolution in globals.css: an explicit data-theme
 * wins, "auto" (no attribute) follows the device. */
function isEffectivelyDark(): boolean {
  const explicit = document.documentElement.getAttribute("data-theme")
  if (explicit === "dark") return true
  if (explicit === "light") return false
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches === true
}

/**
 * Matches the native status bar to the app's current light/dark theme.
 * No-op on the web. Called on startup (initNativeShell) and again whenever
 * the Dag/Nacht/Automatisch setting changes (see apply-theme.ts) so it
 * never gets stuck showing the wrong theme after a live switch.
 */
export async function syncNativeStatusBar() {
  if (!isNativeShell()) return
  const { StatusBar, Style } = await import("@capacitor/status-bar")
  const dark = isEffectivelyDark()
  await Promise.all([
    // Style names the icon/text color, not the background: Dark = light
    // icons for a dark background, Light = dark icons for a light one.
    StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }).catch(() => {}),
    StatusBar.setBackgroundColor({
      color: dark ? BRAND_HEX.creamDark : BRAND_HEX.cream,
    }).catch(() => {}),
    // Keep the status bar opaque above the WebView — overlaying made the
    // top chrome look translucent over the GoFiev header.
    StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {}),
  ])
}

/**
 * Native-only startup chores: hide the splash screen once the first real
 * screen has painted, and match the status bar to the current theme.
 * Called once from RegisterServiceWorker (already the app's one client-only
 * "runs once on mount" component) — a no-op on the web.
 */
export async function initNativeShell() {
  if (!isNativeShell()) return
  const [, { SplashScreen }] = await Promise.all([syncNativeStatusBar(), import("@capacitor/splash-screen")])
  await SplashScreen.hide().catch(() => {})
}
