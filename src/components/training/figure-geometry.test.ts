import { describe, expect, it } from "vitest"
import { lookupExerciseInstruction } from "@/lib/training/exercise-instructions"
import { STANDING, type FigurePose } from "@/lib/training/figure-pose"
import { FLOOR_Y, figureFrame, groundOffset, groundedBounds, peakPose, placedJoint, posesDiffer } from "./figure-geometry"

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

/** Distance between the bottom of a joint (its drawn radius) and the floor. */
const RADIUS = { lHand: 4, rHand: 4, rElbow: 4.5, lShoulder: 4.5, lKnee: 5.5, rKnee: 5.5, lFoot: 5, rFoot: 5 } as const
function gap(pose: FigurePose, joint: keyof typeof RADIUS) {
  return FLOOR_Y - (placedJoint(pose, joint).y + RADIUS[joint])
}

describe("anatomy", () => {
  it("bends the knees backwards in a squat: hips back, knees forward, feet under them", () => {
    const bottom = instruction("Squats").poses[1]
    const hip = placedJoint(bottom, "rHip")
    const knee = placedJoint(bottom, "rKnee")
    const foot = placedJoint(bottom, "rFoot")
    expect(knee.x).toBeGreaterThan(hip.x)
    expect(foot.x).toBeLessThan(knee.x)
    expect(foot.y).toBeGreaterThan(knee.y)
    expect(gap(bottom, "rFoot")).toBeLessThan(4)
  })

  it("keeps the feet flat on the mat and the knees up in a glute bridge", () => {
    for (const pose of instruction("Glute bridge").poses) {
      expect(gap(pose, "lFoot")).toBeLessThan(3)
      expect(gap(pose, "lShoulder")).toBeLessThan(3)
      expect(placedJoint(pose, "lKnee").y).toBeLessThan(placedJoint(pose, "lFoot").y - 20)
    }
  })

  it("rests both contact points on the mat in floor work", () => {
    const contacts: [string, number, keyof typeof RADIUS, keyof typeof RADIUS][] = [
      ["Push-ups", 0, "rHand", "rFoot"],
      ["Push-ups", 1, "rHand", "rFoot"],
      ["Plank", 0, "rElbow", "rFoot"],
      ["Side plank", 1, "rElbow", "rFoot"],
      ["Kat-koe", 0, "rHand", "rKnee"],
      ["Neerwaartse hond", 1, "rHand", "rFoot"],
    ]
    for (const [name, index, a, b] of contacts) {
      const pose = instruction(name).poses[index]
      expect(gap(pose, a), `${name} ${a}`).toBeLessThan(3)
      expect(gap(pose, b), `${name} ${b}`).toBeLessThan(3)
    }
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

describe("posesDiffer", () => {
  it("treats a plank that only breathes as one still, a squat as two", () => {
    const plank = instruction("Plank").poses
    expect(posesDiffer(plank[0], peakPose(plank)!)).toBe(false)
    const squat = instruction("Squats").poses
    expect(posesDiffer(squat[0], peakPose(squat)!)).toBe(true)
  })
})
