/**
 * Only same-origin, app-internal paths may be used as a post-login target.
 * Anything else (absolute URLs, protocol-relative `//host`, `/\host`, or
 * strings that would change the host when appended to the origin such as
 * `@evil.example`) falls back to `fallback`, so a crafted `?next=` link can
 * never send her to another site after she signs in.
 */
export function safeNextPath(next: unknown, fallback: string | null = null): string | null {
  if (typeof next !== "string") return fallback
  const value = next.trim()
  if (!value.startsWith("/")) return fallback
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback
  // Control characters (tabs/newlines) are stripped by URL parsers and can
  // smuggle a second slash in; reject them outright.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback

  const base = "https://app.invalid"
  try {
    const url = new URL(value, base)
    if (url.origin !== base) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
