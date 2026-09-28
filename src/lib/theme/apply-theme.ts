import type { ThemePreference } from "@/lib/actions/profile"
import { syncNativeStatusBar } from "@/lib/platform"

/**
 * Applies a Dag/Nacht/Automatisch choice to the current page instantly,
 * without a reload. "auto" removes the attribute entirely so the
 * prefers-color-scheme media query in globals.css takes back over — which
 * also means it keeps following the device live if the system theme
 * changes, with no listener needed here. Also re-syncs the native status
 * bar (a no-op on the web) since that one doesn't follow CSS on its own.
 */
export function applyThemePreference(theme: ThemePreference) {
  if (typeof document === "undefined") return
  if (theme === "auto") {
    document.documentElement.removeAttribute("data-theme")
  } else {
    document.documentElement.setAttribute("data-theme", theme)
  }
  void syncNativeStatusBar()
}
