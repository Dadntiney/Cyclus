import { describe, expect, it } from "vitest"
import { getRovingTabStop, getRovingTarget } from "./roving"

describe("getRovingTarget", () => {
  it("moves forward and back with arrow keys (both orientations by default)", () => {
    expect(getRovingTarget("ArrowRight", 1, 5)).toBe(2)
    expect(getRovingTarget("ArrowDown", 1, 5)).toBe(2)
    expect(getRovingTarget("ArrowLeft", 1, 5)).toBe(0)
    expect(getRovingTarget("ArrowUp", 1, 5)).toBe(0)
  })

  it("wraps around at the ends, like native radios", () => {
    expect(getRovingTarget("ArrowRight", 4, 5)).toBe(0)
    expect(getRovingTarget("ArrowLeft", 0, 5)).toBe(4)
  })

  it("stops at the ends when loop is off", () => {
    expect(getRovingTarget("ArrowRight", 4, 5, { loop: false })).toBeNull()
    expect(getRovingTarget("ArrowLeft", 0, 5, { loop: false })).toBeNull()
  })

  it("jumps with Home and End", () => {
    expect(getRovingTarget("Home", 3, 5)).toBe(0)
    expect(getRovingTarget("End", 1, 5)).toBe(4)
  })

  it("respects orientation", () => {
    expect(getRovingTarget("ArrowDown", 1, 5, { orientation: "horizontal" })).toBeNull()
    expect(getRovingTarget("ArrowRight", 1, 5, { orientation: "vertical" })).toBeNull()
    expect(getRovingTarget("ArrowDown", 1, 5, { orientation: "vertical" })).toBe(2)
  })

  it("skips disabled options in every direction", () => {
    const isDisabled = (i: number) => i === 2 || i === 0
    expect(getRovingTarget("ArrowRight", 1, 5, { isDisabled })).toBe(3)
    expect(getRovingTarget("ArrowLeft", 1, 5, { isDisabled })).toBe(4)
    expect(getRovingTarget("Home", 4, 5, { isDisabled })).toBe(1)
    expect(getRovingTarget("End", 1, 5, { isDisabled: (i) => i === 4 })).toBe(3)
  })

  it("ignores keys it does not own (Tab, Space, Enter, letters)", () => {
    for (const key of ["Tab", " ", "Enter", "a", "Escape"]) {
      expect(getRovingTarget(key, 1, 5)).toBeNull()
    }
  })

  it("returns null when there is nowhere else to go", () => {
    expect(getRovingTarget("ArrowRight", 0, 1)).toBeNull()
    expect(getRovingTarget("ArrowRight", 0, 0)).toBeNull()
    expect(getRovingTarget("ArrowRight", 1, 3, { isDisabled: (i) => i !== 1 })).toBeNull()
  })
})

describe("getRovingTabStop", () => {
  it("is the selected option", () => {
    expect(getRovingTabStop(3, 5)).toBe(3)
  })

  it("falls back to the first enabled option when nothing is selected", () => {
    expect(getRovingTabStop(-1, 5)).toBe(0)
    expect(getRovingTabStop(-1, 5, (i) => i < 2)).toBe(2)
  })

  it("never lands on a disabled selection", () => {
    expect(getRovingTabStop(1, 5, (i) => i === 1)).toBe(0)
  })

  it("is -1 for an empty or fully disabled group", () => {
    expect(getRovingTabStop(-1, 0)).toBe(-1)
    expect(getRovingTabStop(-1, 3, () => true)).toBe(-1)
  })
})
