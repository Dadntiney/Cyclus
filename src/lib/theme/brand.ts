/**
 * Canonical brand hex values for native shells / meta tags that cannot
 * read CSS variables (Capacitor splash, StatusBar, theme-color).
 * Keep in sync with src/app/globals.css :root tokens.
 */
export const BRAND_HEX = {
  cream: "#f6f1ee",
  creamDark: "#1c1719",
  sageFill: "#3e5c55",
  peach: "#c98a7e",
} as const

/**
 * Temporary product display name (was Cyclus). Flip back here when the
 * final name is locked — UI chrome, PWA label, and notification titles
 * read from this constant.
 */
export const APP_DISPLAY_NAME = "GoFiev" as const

export const APP_TAGLINE = "Jouw lichaam. Jouw ritme. Jouw dag." as const

export const APP_DESCRIPTION =
  "GoFiev helpt je bewegen, eten en rusten in het ritme van jouw lichaam." as const
