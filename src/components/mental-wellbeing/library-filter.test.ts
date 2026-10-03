import { describe, expect, it } from "vitest"
import { MINDFUL_EXERCISES } from "@/lib/data/mindful-exercises"
import { filterExercises, isEvening, pickForNow } from "./library-filter"

describe("filterExercises", () => {
  it("shows everything without a filter", () => {
    expect(filterExercises(MINDFUL_EXERCISES, { maxMinutes: null, topics: [] })).toHaveLength(
      MINDFUL_EXERCISES.length,
    )
  })

  it("keeps exercises within the time limit", () => {
    const short = filterExercises(MINDFUL_EXERCISES, { maxMinutes: 3, topics: [] })
    expect(short.length).toBeGreaterThan(0)
    expect(short.every((e) => e.durationMinutes <= 3)).toBe(true)
  })

  it("matches any of the chosen topics, and the time limit too", () => {
    const result = filterExercises(MINDFUL_EXERCISES, { maxMinutes: 10, topics: ["piekeren", "slaap"] })
    expect(result.length).toBeGreaterThan(0)
    for (const e of result) {
      expect(e.durationMinutes).toBeLessThanOrEqual(10)
      expect(e.categories.some((c) => c === "piekeren" || c === "slaap")).toBe(true)
    }
    expect(result.some((e) => e.categories.includes("piekeren"))).toBe(true)
    expect(result.some((e) => e.categories.includes("slaap"))).toBe(true)
  })
})

describe("pickForNow", () => {
  it("picks the shortest exercise on her topics", () => {
    const pick = pickForNow(MINDFUL_EXERCISES, ["zelfvertrouwen"], 10)
    expect(pick?.categories).toContain("zelfvertrouwen")
    const shortest = Math.min(
      ...MINDFUL_EXERCISES.filter((e) => e.categories.includes("zelfvertrouwen")).map((e) => e.durationMinutes),
    )
    expect(pick?.durationMinutes).toBe(shortest)
  })

  it("adds avondrust in the evening", () => {
    const pick = pickForNow(MINDFUL_EXERCISES, [], 22)
    expect(pick?.categories).toContain("slaap")
    expect(isEvening(22)).toBe(true)
    expect(isEvening(4)).toBe(true)
    expect(isEvening(12)).toBe(false)
  })

  it("falls back to the shortest exercise, and to nothing without exercises", () => {
    const pick = pickForNow(MINDFUL_EXERCISES, [], 10)
    expect(pick?.durationMinutes).toBe(Math.min(...MINDFUL_EXERCISES.map((e) => e.durationMinutes)))
    expect(pickForNow([], ["rust"], 10)).toBeNull()
  })
})
