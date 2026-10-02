/**
 * Cyclus is Dutch-market with no per-profile timezone yet, so calendar
 * "today" is always Europe/Amsterdam (CET/CEST). Server runtimes (Vercel)
 * are UTC — using `new Date().toISOString().slice(0, 10)` or date-fns
 * `format(new Date(), "yyyy-MM-dd")` there flips the day too early after
 * midnight for users in NL.
 */

export const APP_TIMEZONE = "Europe/Amsterdam"

/** Calendar date in Europe/Amsterdam as `yyyy-MM-dd`. */
export function todayISO(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00"
  return `${get("year")}-${get("month")}-${get("day")}`
}

/**
 * A Date at local noon for the Amsterdam calendar day — safe for date-fns
 * calendar helpers (startOfWeek, addDays, format yyyy-MM-dd) without
 * crossing midnight due to timezone offsets.
 */
export function todayDate(now: Date = new Date()): Date {
  return new Date(`${todayISO(now)}T12:00:00`)
}

/** Minutes since midnight on the Europe/Amsterdam wall clock (0–1439). */
export function nowMinutesInAmsterdam(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0")
  return get("hour") * 60 + get("minute")
}
