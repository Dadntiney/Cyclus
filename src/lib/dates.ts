/**
 * Calendar dates for Cyclus are Europe/Amsterdam — not UTC.
 * Using toISOString().slice(0,10) near midnight CE(S)T saved check-ins /
 * menstruatie on the wrong day relative to what the user sees in the UI.
 */
export const APP_TIMEZONE = "Europe/Amsterdam"

/** Today's calendar date in the app timezone, YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}
