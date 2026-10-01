export const THEME_COOKIE = "gofiev-theme"

export type ThemeCookieValue = "light" | "dark" | "auto"

export function readThemeAttr(raw: string | undefined): "light" | "dark" | undefined {
  if (raw === "light" || raw === "dark") return raw
  return undefined
}

export function themeCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 400) {
  return {
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: "lax" as const,
  }
}
