import type { ThemePreference } from "@/lib/actions/profile"
import { THEME_COOKIE } from "@/lib/theme/theme-cookie"

/**
 * Applies a Dag/Nacht/Automatisch choice to the current page instantly,
 * without a reload. "auto" removes the attribute entirely so the
 * prefers-color-scheme media query in globals.css takes back over.
 * Also mirrors the choice into a cookie so the root layout can paint
 * the right theme without a Supabase round-trip.
 */
export function applyThemePreference(theme: ThemePreference) {
  if (typeof document === "undefined") return
  if (theme === "auto") {
    document.documentElement.removeAttribute("data-theme")
  } else {
    document.documentElement.setAttribute("data-theme", theme)
  }
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${60 * 60 * 24 * 400}; SameSite=Lax`
  void import("@/lib/platform").then(({ syncNativeStatusBar }) => {
    void syncNativeStatusBar()
  })
}
