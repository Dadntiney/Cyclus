import { describe, expect, it } from "vitest"
import { lookupExerciseInstruction } from "@/lib/training/exercise-instructions"
import { STANDING } from "@/lib/training/figure-pose"
import { FLOOR_Y, figureFrame, groundOffset, groundedBounds, peakPose } from "./figure-geometry"

function instruction(name: string) {
  const found = lookupExerciseInstruction(name)
  if (!found) throw new Error(`no instruction for ${name}`)
  return found
}

function parseViewBox(viewBox: string) {
  const [x, y, width, height] = viewBox.split(" ").map(Number)
  return { x, y, width, height }
}

describe("grounding", () => {
  it("puts the lowest point of every pose on the floor", () => {
    for (const name of ["Plank", "Glute bridge", "Side plank", "Squats", "Push-ups", "Kindhouding"]) {
      for (const pose of instruction(name).poses) {
        expect(groundedBounds(pose).maxY).toBe(FLOOR_Y)
      }
    }
  })

  it("moves a floating plank down onto the floor", () => {
    const plank = instruction("Plank").poses[0]
    expect(groundOffset(plank)).toBeGreaterThan(0)
  })
})

describe("figureFrame", () => {
  it("contains every grounded pose with room to spare", () => {
    for (const name of ["Plank", "Glute bridge", "Side plank", "Squats", "Roll-up"]) {
      const { poses } = instruction(name)
      const box = parseViewBox(figureFrame(poses).viewBox)
      for (const pose of poses) {
        const b = groundedBounds(pose)
        expect(b.minX).toBeGreaterThanOrEqual(box.x)
        expect(b.maxX).toBeLessThanOrEqual(box.x + box.width)
        expect(b.minY).toBeGreaterThanOrEqual(box.y)
        expect(FLOOR_Y).toBeLessThan(box.y + box.height)
      }
    }
  })

  it("marks floor work, not standing work", () => {
    expect(figureFrame(instruction("Plank").poses).onFloor).toBe(true)
    expect(figureFrame(instruction("Glute bridge").poses).onFloor).toBe(true)
    expect(figureFrame(instruction("Squats").poses).onFloor).toBe(false)
  })

  it("never returns an empty frame", () => {
    expect(parseViewBox(figureFrame([]).viewBox).width).toBeGreaterThan(0)
    expect(parseViewBox(figureFrame([STANDING]).viewBox).width).toBeGreaterThanOrEqual(160)
  })
})

describe("peakPose", () => {
  it("picks the keyframe furthest from the start", () => {
    const squat = instruction("Squats")
    expect(peakPose(squat.poses)).toBe(squat.poses[1])
    expect(peakPose([])).toBeUndefined()
  })
})
