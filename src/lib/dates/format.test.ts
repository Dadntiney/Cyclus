import { describe, expect, it } from "vitest"
import {
  formatDateRange,
  formatLongDate,
  formatNextPeriod,
  formatShortDate,
  formatWeekday,
  formatWeekdayDate,
  toCalendarDay,
} from "@/lib/dates/format"

const NOW = new Date(2026, 9, 2, 12)

describe("toCalendarDay", () => {
  it("reads yyyy-MM-dd as that calendar day, never shifted by a timezone", () => {
    expect(toCalendarDay("2026-10-03")).toEqual({ year: 2026, month: 9, day: 3, weekday: 6 })
  })

  it("ignores a time part after the date", () => {
    expect(toCalendarDay("2026-01-01T23:30:00Z")).toMatchObject({ year: 2026, month: 0, day: 1 })
  })

  it("reads a Date by its local fields", () => {
    expect(toCalendarDay(new Date(2026, 1, 28, 8))).toMatchObject({ year: 2026, month: 1, day: 28 })
  })
})

describe("formatShortDate", () => {
  it("writes day + short month without a dot", () => {
    expect(formatShortDate("2026-10-18", { now: NOW })).toBe("18 okt")
    expect(formatShortDate("2026-03-01", { now: NOW })).toBe("1 mrt")
    expect(formatShortDate("2026-09-30", { now: NOW })).toBe("30 sep")
  })

  it("adds the year only when it is not this year", () => {
    expect(formatShortDate("2027-01-04", { now: NOW })).toBe("4 jan 2027")
    expect(formatShortDate("2026-01-04", { year: true })).toBe("4 jan 2026")
    expect(formatShortDate("2027-01-04", { year: false })).toBe("4 jan")
  })
})

describe("formatNextPeriod", () => {
  it("marks the date as an estimate", () => {
    expect(formatNextPeriod("2026-10-18", { now: NOW })).toBe("~18 okt")
  })
})

describe("formatLongDate", () => {
  it("writes the full month", () => {
    expect(formatLongDate("2026-10-03", { now: NOW })).toBe("3 oktober")
    expect(formatLongDate("2025-12-24", { now: NOW })).toBe("24 december 2025")
  })
})

describe("formatWeekday / formatWeekdayDate", () => {
  it("names the weekday in Dutch", () => {
    expect(formatWeekday("2026-10-03")).toBe("zaterdag")
    expect(formatWeekday("2026-10-05", { capitalize: true })).toBe("Maandag")
  })

  it("combines weekday and date for a day heading", () => {
    expect(formatWeekdayDate("2026-10-03", { now: NOW })).toBe("zaterdag 3 okt")
    expect(formatWeekdayDate("2026-10-03", { capitalize: true, now: NOW })).toBe("Zaterdag 3 okt")
    expect(formatWeekdayDate("2026-10-03", { month: "long", now: NOW })).toBe("zaterdag 3 oktober")
  })
})

describe("formatDateRange", () => {
  it("shares the month when both days are in it", () => {
    expect(formatDateRange("2026-09-22", "2026-09-26", { now: NOW })).toBe("22–26 sep")
  })

  it("names both months across a month boundary", () => {
    expect(formatDateRange("2026-09-28", "2026-10-02", { now: NOW })).toBe("28 sep – 2 okt")
  })

  it("names both years across a year boundary", () => {
    expect(formatDateRange("2026-12-28", "2027-01-03", { now: NOW })).toBe("28 dec 2026 – 3 jan 2027")
  })

  it("collapses a single day", () => {
    expect(formatDateRange("2026-09-22", "2026-09-22", { now: NOW })).toBe("22 sep")
  })

  it("adds the year for a range in another year", () => {
    expect(formatDateRange("2025-05-02", "2025-05-06", { now: NOW })).toBe("2–6 mei 2025")
  })
})
