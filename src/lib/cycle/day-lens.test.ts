import { describe, expect, it } from "vitest"
import { isLowDay, mostlyLowRecently, phaseTagline, usesChangingCycleLens } from "@/lib/cycle/day-lens"
import { composeTodayRoadmap } from "@/lib/cycle/today-roadmap"
import { composeYourStory } from "@/lib/cycle/your-story"
import { composeCycleRecap, composeInsightProgress } from "@/lib/cycle/cycle-recap"

describe("isLowDay", () => {
  it("treats fatigue or a need for rest as a low day, even with energy 4", () => {
    expect(isLowDay({ energy: 4, symptoms: ["Vermoeidheid"], needs: [] })).toBe(true)
    expect(isLowDay({ energy: 4, symptoms: [], needs: ["rust"] })).toBe(true)
    expect(isLowDay({ energy: 4, symptoms: ["Opvliegers"], needs: [] })).toBe(false)
    expect(isLowDay(null)).toBe(false)
  })

  it("mostlyLowRecently follows the majority of recent check-ins", () => {
    expect(mostlyLowRecently([])).toBe(false)
    expect(mostlyLowRecently([{ energy: 1 }])).toBe(true)
    expect(mostlyLowRecently([{ energy: 1 }, { energy: 4 }])).toBe(true)
    expect(mostlyLowRecently([{ energy: 1 }, { energy: 4 }, { energy: 5 }])).toBe(false)
  })
})

describe("usesChangingCycleLens", () => {
  it("is on for 40+ with an irregular cycle or overgang symptoms", () => {
    expect(usesChangingCycleLens({ age: 44, regularity: "onregelmatig" })).toBe(true)
    expect(usesChangingCycleLens({ age: 44, regularity: "regelmatig", recentSymptoms: ["Opvliegers"] })).toBe(true)
    expect(usesChangingCycleLens({ age: 35, regularity: "onregelmatig" })).toBe(false)
  })

  it("respects an explicit life stage", () => {
    expect(usesChangingCycleLens({ lifeStage: "regelmatig", age: 50, regularity: "onregelmatig" })).toBe(false)
    expect(usesChangingCycleLens({ lifeStage: "perimenopauze", age: 38 })).toBe(true)
  })

  it("phase tagline follows her day first", () => {
    expect(phaseTagline("ovulatie", {})).toContain("piek in energie")
    expect(phaseTagline("ovulatie", { lowDay: true })).not.toContain("energie")
    expect(phaseTagline("ovulatie", { changingCycle: true })).toContain("schatting")
  })
})

describe("composeTodayRoadmap", () => {
  const base = { phase: "ovulatie" as const, phaseLabel: "Ovulatie", seed: "s" }

  it("never explains a tired day with a peak in energy", () => {
    const r = composeTodayRoadmap({ ...base, symptoms: ["Vermoeidheid", "Opvliegers"], needs: ["rust"], energy: 4 })
    expect(r.whyNow).toContain("vermoeidheid")
    expect(r.whyNow).not.toMatch(/oestrogeen|energieker|piek/)
  })

  it("keeps the no-check-in line to one short sentence", () => {
    const r = composeTodayRoadmap(base)
    expect(r.whyNow.split(/[.!?]\s/).length).toBe(1)
    expect(r.whyNow.length).toBeLessThan(140)
  })

  it("leads with the changing cycle for the overgang lens", () => {
    expect(composeTodayRoadmap({ ...base, changingCycle: true }).whyNow).toContain("overgang")
  })
})

describe("composeYourStory", () => {
  it("suggests gentler movement when recent days were low", () => {
    const story = composeYourStory({
      phase: "ovulatie",
      phaseLabel: "Ovulatie",
      cycleDay: 11,
      hasCycle: true,
      recentlyLow: true,
    })
    expect(story?.whatFitsThisWeek).toContain("Zachtere beweging")
  })
})

describe("insight progress and cycle recap", () => {
  it("shows progress until the first pattern exists", () => {
    const p = composeInsightProgress({ hasCycle: true, completedCycles: 0, checkinCount: 3, hasPersonalPattern: false })
    expect(p?.steps).toEqual([
      { label: "Afgeronde cycli", done: 0, total: 2 },
      { label: "Check-ins", done: 3, total: 10 },
    ])
    expect(composeInsightProgress({ hasCycle: true, completedCycles: 0, checkinCount: 3, hasPersonalPattern: true })).toBeNull()
    expect(composeInsightProgress({ hasCycle: true, completedCycles: 3, checkinCount: 30, hasPersonalPattern: false })).toBeNull()
  })

  it("summarizes the last completed cycle", () => {
    const history = [
      { start: "2026-08-01", end: "2026-08-05", length: 5, cycleLength: 28, dominantFlow: null },
      { start: "2026-08-29", end: "2026-09-02", length: 5, cycleLength: null, dominantFlow: null },
    ]
    const checkins = [
      { date: "2026-08-02", energy: 2, symptoms: ["Vermoeidheid", "Krampen"] },
      { date: "2026-08-03", energy: 2, symptoms: ["Vermoeidheid"] },
      { date: "2026-08-10", energy: 4, symptoms: [] },
      { date: "2026-08-11", energy: 5, symptoms: [] },
      { date: "2026-09-01", energy: 1, symptoms: ["Hoofdpijn"] },
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recap = composeCycleRecap(history as any, checkins)
    expect(recap?.lines[0]).toBe("Je cyclus duurde 28 dagen. Je vulde 4 keer een check-in in.")
    expect(recap?.lines[1]).toContain("vermoeidheid (2×)")
    expect(recap?.lines[2]).toContain("folliculaire fase")
  })

  it("stays quiet with too few check-ins", () => {
    const history = [{ start: "2026-08-01", cycleLength: 28 }]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(composeCycleRecap(history as any, [{ date: "2026-08-02", energy: 3 }])).toBeNull()
  })
})
