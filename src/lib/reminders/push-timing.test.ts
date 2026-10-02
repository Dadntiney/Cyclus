import { describe, expect, it } from "vitest"
import { isPushTimeDue, timeToMinutes } from "@/lib/reminders/push-timing"
import { nowMinutesInAmsterdam } from "@/lib/dates/amsterdam"

describe("timeToMinutes", () => {
  it("reads HH:MM and HH:MM:SS", () => {
    expect(timeToMinutes("08:30")).toBe(510)
    expect(timeToMinutes("20:00:00")).toBe(1200)
  })
  it("rejects empty or invalid values", () => {
    expect(timeToMinutes(null)).toBeNull()
    expect(timeToMinutes("")).toBeNull()
    expect(timeToMinutes("25:00")).toBeNull()
    expect(timeToMinutes("ochtend")).toBeNull()
  })
})

describe("isPushTimeDue", () => {
  it("is due from the chosen time until the grace window ends", () => {
    expect(isPushTimeDue("20:00", 19 * 60 + 59)).toBe(false)
    expect(isPushTimeDue("20:00", 20 * 60)).toBe(true)
    expect(isPushTimeDue("20:00", 23 * 60)).toBe(true)
    expect(isPushTimeDue("20:00", 23 * 60 + 1)).toBe(false)
  })
  it("uses the fallback time when an item has none", () => {
    expect(isPushTimeDue(null, 8 * 60)).toBe(true)
    expect(isPushTimeDue(null, 7 * 60)).toBe(false)
    expect(isPushTimeDue(undefined, 9 * 60, "09:00")).toBe(true)
  })
})

describe("nowMinutesInAmsterdam", () => {
  it("follows summer and winter time", () => {
    expect(nowMinutesInAmsterdam(new Date("2026-07-01T06:15:00Z"))).toBe(8 * 60 + 15)
    expect(nowMinutesInAmsterdam(new Date("2026-12-01T06:15:00Z"))).toBe(7 * 60 + 15)
  })
})
