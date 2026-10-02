import { describe, expect, it } from "vitest"
import { isPastOrTodayISODate, isValidISODate } from "@/lib/validations/dates"

describe("date validation", () => {
  it("accepts real calendar dates only", () => {
    expect(isValidISODate("2026-02-28")).toBe(true)
    expect(isValidISODate("2026-02-31")).toBe(false)
    expect(isValidISODate("2026-2-3")).toBe(false)
    expect(isValidISODate("gisteren")).toBe(false)
  })

  it("rejects dates after today", () => {
    expect(isPastOrTodayISODate("2026-10-02", "2026-10-02")).toBe(true)
    expect(isPastOrTodayISODate("2026-10-01", "2026-10-02")).toBe(true)
    expect(isPastOrTodayISODate("2026-10-03", "2026-10-02")).toBe(false)
  })
})
