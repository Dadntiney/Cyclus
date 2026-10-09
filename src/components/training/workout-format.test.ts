import { describe, expect, it } from "vitest"
import { difficultyLabel, muscleGroupLabel, workoutDisplayTitle, workoutMeta } from "./workout-format"

describe("workoutDisplayTitle", () => {
  it("drops a trailing duration", () => {
    expect(workoutDisplayTitle("Core Boost - 7 minuten")).toBe("Core Boost")
    expect(workoutDisplayTitle("Yoga – 20 min")).toBe("Yoga")
    expect(workoutDisplayTitle("Ochtend · 5 min.")).toBe("Ochtend")
  })

  it("keeps other dashes and titles without a duration", () => {
    expect(workoutDisplayTitle("Krachttraining - Full Body")).toBe("Krachttraining - Full Body")
    expect(workoutDisplayTitle("Nek & Schouders Reset")).toBe("Nek & Schouders Reset")
    expect(workoutDisplayTitle("7 minuten")).toBe("7 minuten")
  })
})

describe("muscleGroupLabel", () => {
  it("uses sentence case", () => {
    expect(muscleGroupLabel("core")).toBe("Core")
    expect(muscleGroupLabel("billen/hamstrings")).toBe("Billen/hamstrings")
  })

  it("returns null for empty values", () => {
    expect(muscleGroupLabel(null)).toBeNull()
    expect(muscleGroupLabel("  ")).toBeNull()
  })
})

describe("difficultyLabel", () => {
  it("maps known levels and keeps unknown ones readable", () => {
    expect(difficultyLabel("pittig")).toBe("Pittig")
    expect(difficultyLabel("rustig")).toBe("Rustig")
    expect(difficultyLabel(null)).toBeNull()
  })
})

describe("workoutMeta", () => {
  it("joins duration and exercise count", () => {
    expect(workoutMeta(7, 3)).toBe("7 min · 3 oefeningen")
    expect(workoutMeta(5, 1)).toBe("5 min · 1 oefening")
    expect(workoutMeta(30)).toBe("30 min")
    expect(workoutMeta(null, 0)).toBe("")
  })
})
