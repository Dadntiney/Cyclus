/**
 * Articulated pose for the Cyclus instruction figure.
 * Angles are degrees; she faces right (+x). Arms: 0 = hanging down,
 * positive = forward/up; the elbow adds to the shoulder. Legs: 0 = straight
 * down, positive = forward; the knee bends the shin back (positive knee =
 * a bent knee, as in a squat). Torso tilts the hips forward (+) or back (−).
 * bodyRotation rotates the whole figure clockwise (floor work); see
 * onScreen() in exercise-instructions.ts for floor poses.
 */
export type FigurePose = {
  rootX: number
  rootY: number
  /** Whole-figure rotation around mid-body, degrees. */
  bodyRotation: number
  torso: number
  lShoulder: number
  rShoulder: number
  lElbow: number
  rElbow: number
  lHip: number
  rHip: number
  lKnee: number
  rKnee: number
}

export const STANDING: FigurePose = {
  rootX: 100,
  rootY: 72,
  bodyRotation: 0,
  torso: 0,
  lShoulder: 8,
  rShoulder: -8,
  lElbow: 10,
  rElbow: -10,
  lHip: 6,
  rHip: -6,
  lKnee: 4,
  rKnee: -4,
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function lerpPose(a: FigurePose, b: FigurePose, t: number): FigurePose {
  if (!a && !b) return STANDING
  if (!a) return b
  if (!b) return a
  return {
    rootX: lerp(a.rootX, b.rootX, t),
    rootY: lerp(a.rootY, b.rootY, t),
    bodyRotation: lerp(a.bodyRotation ?? 0, b.bodyRotation ?? 0, t),
    torso: lerp(a.torso, b.torso, t),
    lShoulder: lerp(a.lShoulder, b.lShoulder, t),
    rShoulder: lerp(a.rShoulder, b.rShoulder, t),
    lElbow: lerp(a.lElbow, b.lElbow, t),
    rElbow: lerp(a.rElbow, b.rElbow, t),
    lHip: lerp(a.lHip, b.lHip, t),
    rHip: lerp(a.rHip, b.rHip, t),
    lKnee: lerp(a.lKnee, b.lKnee, t),
    rKnee: lerp(a.rKnee, b.rKnee, t),
  }
}

/** Ease in-out for smoother movement loops. */
export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
