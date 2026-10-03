import { describe, expect, it } from "vitest"
import { formatPeriodRange, formatReadableDate, formatShortDate } from "./date-format"

describe("cycle date formatting", () => {
  it("drops the dot of Dutch short months and keeps the year for readable dates", () => {
    expect(formatReadableDate("2026-09-15")).toBe("15 sep 2026")
    expect(formatReadableDate("2026-05-03")).toBe("3 mei 2026")
  })

  it("shows the year only outside the current year", () => {
    expect(formatShortDate("2026-09-22", 2026)).toBe("22 sep")
    expect(formatShortDate("2025-09-22", 2026)).toBe("22 sep 2025")
  })

  it("compacts a period within one month", () => {
    expect(formatPeriodRange("2026-09-22", "2026-09-26", 2026)).toBe("22–26 sep")
    expect(formatPeriodRange("2025-09-22", "2025-09-26", 2026)).toBe("22–26 sep 2025")
  })

  it("spells out both months across a month boundary", () => {
    expect(formatPeriodRange("2026-09-28", "2026-10-02", 2026)).toBe("28 sep – 2 okt")
  })

  it("spells out both years across a year boundary", () => {
    expect(formatPeriodRange("2025-12-29", "2026-01-03", 2026)).toBe("29 dec 2025 – 3 jan 2026")
  })

  it("shows a one-day period as a single date", () => {
    expect(formatPeriodRange("2026-09-22", "2026-09-22", 2026)).toBe("22 sep")
  })
})
