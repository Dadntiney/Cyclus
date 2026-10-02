import { describe, expect, it } from "vitest"
import { isDosingDay, isScheduleStartDay, isScheduleStopDay, type MedicationSchedule } from "@/lib/medication/schedule"

const cyclic: MedicationSchedule = {
  scheduleType: "cyclisch",
  scheduleDays: null,
  scheduleDaysOn: 14,
  scheduleDaysOff: 14,
  startDate: "2026-09-01",
  endDate: null,
}
const at = (iso: string) => new Date(`${iso}T12:00:00`)

describe("medication schedule", () => {
  it("follows a 14-on / 14-off cycle", () => {
    expect(isDosingDay(cyclic, at("2026-09-01"))).toBe(true)
    expect(isDosingDay(cyclic, at("2026-09-14"))).toBe(true)
    expect(isDosingDay(cyclic, at("2026-09-15"))).toBe(false)
    expect(isDosingDay(cyclic, at("2026-09-29"))).toBe(true)
  })

  it("marks start and last dosing days", () => {
    expect(isScheduleStartDay(cyclic, at("2026-09-29"))).toBe(true)
    expect(isScheduleStopDay(cyclic, at("2026-09-14"))).toBe(true)
    expect(isScheduleStopDay(cyclic, at("2026-09-13"))).toBe(false)
  })

  it("respects start and end dates", () => {
    const daily: MedicationSchedule = { ...cyclic, scheduleType: "dagelijks", endDate: "2026-09-10" }
    expect(isDosingDay(daily, at("2026-08-31"))).toBe(false)
    expect(isDosingDay(daily, at("2026-09-10"))).toBe(true)
    expect(isDosingDay(daily, at("2026-09-11"))).toBe(false)
  })

  it("does not claim to know a custom schedule", () => {
    expect(isDosingDay({ ...cyclic, scheduleType: "eigen_schema" }, at("2026-09-05"))).toBeNull()
  })
})
