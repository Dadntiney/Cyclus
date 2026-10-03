import { describe, expect, it } from "vitest"
import { EXERCISE_MODE_OPTIONS, parseExerciseMode } from "./exercise-mode"

describe("parseExerciseMode", () => {
  it("remembers Luisteren", () => {
    expect(parseExerciseMode("luisteren")).toBe("luisteren")
  })

  it("falls back to Lezen for anything else", () => {
    expect(parseExerciseMode("lezen")).toBe("lezen")
    expect(parseExerciseMode(null)).toBe("lezen")
    expect(parseExerciseMode(undefined)).toBe("lezen")
    expect(parseExerciseMode("listen")).toBe("lezen")
  })

  it("offers Lezen first", () => {
    expect(EXERCISE_MODE_OPTIONS.map((o) => o.label)).toEqual(["Lezen", "Luisteren"])
  })
})
