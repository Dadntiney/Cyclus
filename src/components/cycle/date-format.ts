import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"

/**
 * Calm, compact dates for the Cyclus screens: "22 sep", "22–26 sep",
 * "28 sep – 2 okt", with the year only when it isn't the current one.
 * date-fns' Dutch short months end in a dot ("sep."); we drop it so a
 * range reads quietly.
 */

function shortMonth(date: Date): string {
  return format(date, "MMM", { locale: nl }).replace(/\.$/, "")
}

/** "15 sep 2026" — always with the year (history lists, measurements). */
export function formatReadableDate(iso: string): string {
  const date = parseISO(iso)
  return `${format(date, "d")} ${shortMonth(date)} ${format(date, "yyyy")}`
}

/** "22 sep", or "22 sep 2025" outside the current year. */
export function formatShortDate(iso: string, currentYear: number): string {
  const date = parseISO(iso)
  const base = `${format(date, "d")} ${shortMonth(date)}`
  return date.getFullYear() === currentYear ? base : `${base} ${date.getFullYear()}`
}

/** "22–26 sep", "28 sep – 2 okt", "29 dec 2025 – 3 jan 2026". */
export function formatPeriodRange(startISO: string, endISO: string, currentYear: number): string {
  const start = parseISO(startISO)
  const end = parseISO(endISO)
  const sameYear = start.getFullYear() === end.getFullYear()
  const yearSuffix = sameYear && end.getFullYear() !== currentYear ? ` ${end.getFullYear()}` : ""

  if (startISO === endISO) return formatShortDate(startISO, currentYear)
  if (sameYear && start.getMonth() === end.getMonth()) {
    return `${format(start, "d")}–${format(end, "d")} ${shortMonth(end)}${yearSuffix}`
  }
  if (sameYear) {
    return `${format(start, "d")} ${shortMonth(start)} – ${format(end, "d")} ${shortMonth(end)}${yearSuffix}`
  }
  return `${formatReadableDate(startISO)} – ${formatReadableDate(endISO)}`
}
