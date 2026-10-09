/**
 * One way to write a date in the app (ontwerpvisie §7.1–7.2, TODAY-16,
 * CYC-2). Dutch, lower-case months, no trailing dots, no year unless it
 * differs from this year:
 *
 * - formatShortDate("2026-10-18")     → "18 okt"
 * - formatNextPeriod("2026-10-18")    → "~18 okt"   (an estimate)
 * - formatLongDate("2026-10-18")      → "18 oktober"
 * - formatWeekdayDate("2026-10-03")   → "zaterdag 3 okt"
 *   (capitalize: true → "Zaterdag 3 okt", for a heading)
 * - formatDateRange("2026-09-22", "2026-09-26") → "22–26 sep"
 *
 * Dates are calendar days: a `yyyy-MM-dd` string is read as that local day
 * (never shifted by a timezone), a Date by its local calendar fields.
 * Months come from a fixed table instead of the date-fns locale, whose
 * short months carry a dot ("okt.") and would wrap as "~18 / okt.".
 */

export type DateInput = string | Date

const MONTHS_SHORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"] as const

const MONTHS_LONG = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
] as const

const WEEKDAYS = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"] as const

interface CalendarDay {
  year: number
  /** 0–11 */
  month: number
  day: number
  /** 0 = zondag … 6 = zaterdag */
  weekday: number
}

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})/

/** Reads a `yyyy-MM-dd…` string as that calendar day, or a Date by its local fields. */
export function toCalendarDay(input: DateInput): CalendarDay {
  if (typeof input === "string") {
    const match = ISO_DAY.exec(input)
    if (match) {
      const year = Number(match[1])
      const month = Number(match[2]) - 1
      const day = Number(match[3])
      // Noon keeps the weekday right whatever the runtime's timezone.
      const weekday = new Date(year, month, day, 12).getDay()
      return { year, month, day, weekday }
    }
    return toCalendarDay(new Date(input))
  }
  return { year: input.getFullYear(), month: input.getMonth(), day: input.getDate(), weekday: input.getDay() }
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface YearOptions {
  /**
   * "auto" (default): add the year only when it is not the year of `now`.
   * true/false: always/never.
   */
  year?: boolean | "auto"
  /** Reference for "auto" (default: today). */
  now?: Date
}

function withYear(text: string, d: CalendarDay, opts: YearOptions): string {
  const mode = opts.year ?? "auto"
  const show = mode === "auto" ? d.year !== (opts.now ?? new Date()).getFullYear() : mode
  return show ? `${text} ${d.year}` : text
}

/** "18 okt" (and "18 okt 2027" when not this year). */
export function formatShortDate(input: DateInput, opts: YearOptions = {}): string {
  const d = toCalendarDay(input)
  return withYear(`${d.day} ${MONTHS_SHORT[d.month]}`, d, opts)
}

/** "18 oktober" (and "18 oktober 2027" when not this year). */
export function formatLongDate(input: DateInput, opts: YearOptions = {}): string {
  const d = toCalendarDay(input)
  return withYear(`${d.day} ${MONTHS_LONG[d.month]}`, d, opts)
}

/**
 * An estimated day, e.g. the next period: "~18 okt". One format for
 * Vandaag, Cyclus and Deze week. Pair it with `whitespace-nowrap`.
 */
export function formatNextPeriod(input: DateInput, opts: YearOptions = {}): string {
  return `~${formatShortDate(input, opts)}`
}

/** Full weekday name: "zaterdag" (capitalize → "Zaterdag"). */
export function formatWeekday(input: DateInput, opts: { capitalize?: boolean } = {}): string {
  const name: string = WEEKDAYS[toCalendarDay(input).weekday]
  return opts.capitalize ? capitalizeFirst(name) : name
}

/**
 * "zaterdag 3 okt"; `month: "long"` → "zaterdag 3 oktober";
 * `capitalize` for a heading → "Zaterdag 3 okt".
 */
export function formatWeekdayDate(
  input: DateInput,
  opts: YearOptions & { capitalize?: boolean; month?: "short" | "long" } = {},
): string {
  const date = opts.month === "long" ? formatLongDate(input, opts) : formatShortDate(input, opts)
  return `${formatWeekday(input, { capitalize: opts.capitalize })} ${date}`
}

/**
 * A span of days: "22–26 sep", across months "28 sep – 2 okt", across
 * years "28 dec 2026 – 3 jan 2027". One day collapses to "22 sep".
 */
export function formatDateRange(start: DateInput, end: DateInput, opts: YearOptions = {}): string {
  const a = toCalendarDay(start)
  const b = toCalendarDay(end)
  if (a.year === b.year && a.month === b.month && a.day === b.day) return formatShortDate(start, opts)
  if (a.year !== b.year) {
    return `${formatShortDate(start, { ...opts, year: true })} – ${formatShortDate(end, { ...opts, year: true })}`
  }
  if (a.month === b.month) {
    return withYear(`${a.day}–${b.day} ${MONTHS_SHORT[a.month]}`, a, opts)
  }
  return withYear(`${a.day} ${MONTHS_SHORT[a.month]} – ${b.day} ${MONTHS_SHORT[b.month]}`, a, opts)
}
