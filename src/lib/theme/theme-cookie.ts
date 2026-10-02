export const THEME_COOKIE = "gofiev-theme"

export type ThemeCookieValue = "light" | "dark" | "auto"

export function themeCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 400) {
  return {
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: "lax" as const,
  }
}
