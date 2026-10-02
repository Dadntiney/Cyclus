import { describe, expect, it } from "vitest"
import { classifyPhase, estimateCycle } from "@/lib/cycle/estimate"
import { computeCycleHistory, withActivePeriod } from "@/lib/cycle/history"
import { buildPeriodSeedDates, clampPeriodLength, isPeriodStillActive } from "@/lib/cycle/period-seed"

describe("period seed", () => {
  it("clamps lengths to 2..14 and defaults to 5", () => {
    expect(clampPeriodLength(null)).toBe(5)
    expect(clampPeriodLength(1)).toBe(2)
    expect(clampPeriodLength(30)).toBe(14)
  })

  it("never seeds future days", () => {
    expect(buildPeriodSeedDates("2026-10-01", 5, "2026-10-02")).toEqual(["2026-10-01", "2026-10-02"])
    expect(isPeriodStillActive("2026-10-01", 5, "2026-10-05")).toBe(true)
    expect(isPeriodStillActive("2026-10-01", 5, "2026-10-06")).toBe(false)
  })
})

describe("cycle history", () => {
  it("groups consecutive days into periods and measures cycle length", () => {
    const logs = ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-29", "2026-08-30"].map((date) => ({
      date,
      menstruation: true,
      symptoms: [],
    }))
    const history = computeCycleHistory(logs)
    expect(history).toHaveLength(2)
    expect(history[0]).toMatchObject({ start: "2026-08-01", end: "2026-08-03", days: 3, cycleLength: 28 })
    expect(history[1]).toMatchObject({ start: "2026-08-29", days: 2, cycleLength: null })
  })

  it("adds the running period's days up to today", () => {
    const logs = withActivePeriod([], "2026-10-01", "2026-10-03")
    expect(logs.filter((l) => l.menstruation).map((l) => l.date)).toEqual(["2026-10-01", "2026-10-02", "2026-10-03"])
  })
})

describe("phase estimate", () => {
  it("classifies a 28-day cycle", () => {
    expect(classifyPhase(1, 28, 5)).toBe("menstruatie")
    expect(classifyPhase(8, 28, 5)).toBe("folliculair")
    expect(classifyPhase(14, 28, 5)).toBe("ovulatie")
    expect(classifyPhase(22, 28, 5)).toBe("luteaal")
  })

  it("needs real inputs and wraps around the cycle", () => {
    expect(estimateCycle(null, 28, true)).toBeNull()
    expect(estimateCycle("2026-09-01", null, true)).toBeNull()
    const estimate = estimateCycle("2026-09-01", 28, true, new Date("2026-09-29T12:00:00"))
    expect(estimate?.cycleDay).toBe(1)
  })
})
