import { describe, expect, it } from "vitest"
import { planProfileCycleUpdate } from "@/lib/cycle/profile-cycle-sync"

const TODAY = "2026-10-03"

describe("planProfileCycleUpdate", () => {
  it("does not restart a period she stopped when she edits another field", () => {
    // Started 1 okt, stopped 2 okt; the form still carries the synced start.
    const plan = planProfileCycleUpdate(
      { hasCycle: true, lastPeriodStart: "2026-10-01", averagePeriodLength: 5 },
      { last_period_start: "2026-10-01", active_period_start: null },
      TODAY,
    )
    expect(plan.activePeriodStart).toBeNull()
    expect(plan.seedDates).toEqual([])
  })

  it("keeps a running period untouched on unrelated edits", () => {
    const plan = planProfileCycleUpdate(
      { hasCycle: true, lastPeriodStart: "2026-10-01", averagePeriodLength: 5 },
      { last_period_start: "2026-10-01", active_period_start: "2026-10-01" },
      TODAY,
    )
    expect(plan.activePeriodStart).toBe("2026-10-01")
    expect(plan.seedDates).toEqual([])
  })

  it("treats a newly entered recent start as a running period and seeds up to today", () => {
    const plan = planProfileCycleUpdate(
      { hasCycle: true, lastPeriodStart: "2026-10-02", averagePeriodLength: 5 },
      { last_period_start: "2026-09-01", active_period_start: null },
      TODAY,
    )
    expect(plan.activePeriodStart).toBe("2026-10-02")
    expect(plan.seedDates).toEqual(["2026-10-02", "2026-10-03"])
  })

  it("seeds a past period without making it active", () => {
    const plan = planProfileCycleUpdate(
      { hasCycle: true, lastPeriodStart: "2026-09-10", averagePeriodLength: 4 },
      { last_period_start: null, active_period_start: null },
      TODAY,
    )
    expect(plan.activePeriodStart).toBeNull()
    expect(plan.seedDates).toEqual(["2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13"])
  })

  it("moves the running period when she corrects its start date", () => {
    const plan = planProfileCycleUpdate(
      { hasCycle: true, lastPeriodStart: "2026-09-30", averagePeriodLength: 5 },
      { last_period_start: "2026-10-01", active_period_start: "2026-10-01" },
      TODAY,
    )
    expect(plan.activePeriodStart).toBe("2026-09-30")
  })

  it("never overrides a different period started from Vandaag", () => {
    const plan = planProfileCycleUpdate(
      { hasCycle: true, lastPeriodStart: "2026-09-01", averagePeriodLength: 5 },
      { last_period_start: "2026-09-20", active_period_start: "2026-10-02" },
      TODAY,
    )
    expect(plan.activePeriodStart).toBe("2026-10-02")
  })

  it("clears everything when she no longer has a cycle", () => {
    const plan = planProfileCycleUpdate(
      { hasCycle: false, lastPeriodStart: null, averagePeriodLength: null },
      { last_period_start: "2026-10-01", active_period_start: "2026-10-01" },
      TODAY,
    )
    expect(plan).toEqual({ activePeriodStart: null, averagePeriodLength: null, seedDates: [] })
  })
})
