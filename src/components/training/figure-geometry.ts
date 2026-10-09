import { lerpPose, type FigurePose } from "@/lib/training/figure-pose"

/**
 * Geometry of the Cyclus instruction figure, separate from the SVG so it
 * can be tested. The figure is drawn in a 200-wide coordinate space; every
 * pose is moved down or up so its lowest point rests on FLOOR_Y (no more
 * floating planks), and the viewBox is fitted to the poses of one
 * exercise so a head or foot is never cut off.
 */

export const FLOOR_Y = 232

const ARM = 34
const FORE = 30
const THIGH = 38
const SHIN = 36

export interface Point {
  x: number
  y: number
}

/** A joint or body part, as a circle (stroke half-width or shape radius). */
interface Part extends Point {
  r: number
}

function rad(deg: number) {
  return (deg * Math.PI) / 180
}

function endPoint(x: number, y: number, length: number, deg: number): Point {
  return {
    x: x + Math.sin(rad(deg)) * length,
    y: y + Math.cos(rad(deg)) * length,
  }
}

/** All joints of a pose, before the whole-body rotation (as CyclusFigure draws them). */
export function figureJoints(pose: FigurePose) {
  const hipY = pose.rootY + 58
  const shoulderY = pose.rootY + 8

  const torsoTop = { x: pose.rootX, y: pose.rootY }
  const torsoBottom = endPoint(torsoTop.x, torsoTop.y + 10, 48, pose.torso)

  const lShoulder = { x: torsoTop.x - 16, y: shoulderY }
  const rShoulder = { x: torsoTop.x + 16, y: shoulderY }

  const lElbow = endPoint(lShoulder.x, lShoulder.y, ARM, pose.lShoulder)
  const rElbow = endPoint(rShoulder.x, rShoulder.y, ARM, pose.rShoulder)
  const lHand = endPoint(lElbow.x, lElbow.y, FORE, pose.lShoulder + pose.lElbow)
  const rHand = endPoint(rElbow.x, rElbow.y, FORE, pose.rShoulder + pose.rElbow)

  const lHip = { x: torsoBottom.x - 10, y: hipY }
  const rHip = { x: torsoBottom.x + 10, y: hipY }
  const lKnee = endPoint(lHip.x, lHip.y, THIGH, pose.lHip)
  const rKnee = endPoint(rHip.x, rHip.y, THIGH, pose.rHip)
  // Knees bend backwards: the shin turns back from the thigh by the knee angle.
  const lFoot = endPoint(lKnee.x, lKnee.y, SHIN, pose.lHip - pose.lKnee)
  const rFoot = endPoint(rKnee.x, rKnee.y, SHIN, pose.rHip - pose.rKnee)

  const headY = pose.rootY - 22

  return {
    hipY,
    torsoBottom,
    lShoulder,
    rShoulder,
    lElbow,
    rElbow,
    lHand,
    rHand,
    lHip,
    rHip,
    lKnee,
    rKnee,
    lFoot,
    rFoot,
    headY,
    pivot: { x: pose.rootX, y: pose.rootY + 70 },
  }
}

function rotate(p: Point, pivot: Point, deg: number): Point {
  if (!deg) return p
  const a = rad(deg)
  const dx = p.x - pivot.x
  const dy = p.y - pivot.y
  // SVG rotate(): positive angles turn clockwise on screen (y points down).
  return {
    x: pivot.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: pivot.y + dx * Math.sin(a) + dy * Math.cos(a),
  }
}

/** The outline of the drawn figure as circles, after the body rotation. */
function figureParts(pose: FigurePose): Part[] {
  const j = figureJoints(pose)
  const parts: Part[] = [
    // Head, hair and bun.
    { x: pose.rootX, y: j.headY, r: 13 },
    { x: pose.rootX, y: j.headY - 2, r: 15 },
    { x: pose.rootX - 10, y: j.headY - 10, r: 7 },
    // Torso corners and the curve under the hips.
    { ...j.lShoulder, r: 4.5 },
    { ...j.rShoulder, r: 4.5 },
    { x: j.lHip.x - 2, y: j.lHip.y, r: 0 },
    { x: j.rHip.x + 2, y: j.rHip.y, r: 0 },
    { x: j.torsoBottom.x, y: j.hipY + 3, r: 0 },
    // Limbs: half the stroke width.
    { ...j.lElbow, r: 4.5 },
    { ...j.rElbow, r: 4.5 },
    { ...j.lHand, r: 4 },
    { ...j.rHand, r: 4 },
    { ...j.lHip, r: 5.5 },
    { ...j.rHip, r: 5.5 },
    { ...j.lKnee, r: 5.5 },
    { ...j.rKnee, r: 5.5 },
    { ...j.lFoot, r: 5 },
    { ...j.rFoot, r: 5 },
  ]
  const rotation = pose.bodyRotation ?? 0
  return parts.map((p) => ({ ...rotate(p, j.pivot, rotation), r: p.r }))
}

type JointName = "lHand" | "rHand" | "lElbow" | "rElbow" | "lShoulder" | "rShoulder" | "lHip" | "rHip" | "lKnee" | "rKnee" | "lFoot" | "rFoot"

/** Where a joint lands on screen: rotated with the body and grounded on the floor. */
export function placedJoint(pose: FigurePose, name: JointName): Point {
  const j = figureJoints(pose)
  const p = rotate(j[name], j.pivot, pose.bodyRotation ?? 0)
  return { x: p.x, y: p.y + groundOffset(pose) }
}

export interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

function boundsOf(parts: Part[]): Bounds {
  return parts.reduce<Bounds>(
    (b, p) => ({
      minX: Math.min(b.minX, p.x - p.r),
      maxX: Math.max(b.maxX, p.x + p.r),
      minY: Math.min(b.minY, p.y - p.r),
      maxY: Math.max(b.maxY, p.y + p.r),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )
}

/** How far to move a pose down (+) or up (−) so its lowest point touches the floor. */
export function groundOffset(pose: FigurePose): number {
  return FLOOR_Y - boundsOf(figureParts(pose)).maxY
}

/** Bounds of a pose once it stands (or lies) on the floor. */
export function groundedBounds(pose: FigurePose): Bounds {
  const b = boundsOf(figureParts(pose))
  const dy = FLOOR_Y - b.maxY
  return { minX: b.minX, maxX: b.maxX, minY: b.minY + dy, maxY: FLOOR_Y }
}

export interface FigureFrame {
  /** SVG viewBox fitted to every pose of the exercise, with padding. */
  viewBox: string
  /** Horizontal extent of the figure, for the mat under it. */
  matFrom: number
  matTo: number
  /** Floor work (lying, kneeling, plank): draw a mat line. */
  onFloor: boolean
}

const PADDING = 12
const MIN_WIDTH = 160
const MIN_HEIGHT = 140

/**
 * One frame for all poses of an exercise (including the in-betweens of
 * the loop), so the camera never moves and nothing is ever clipped.
 */
export function figureFrame(poses: readonly FigurePose[]): FigureFrame {
  const samples: FigurePose[] = []
  poses.forEach((pose, i) => {
    const next = poses[i + 1]
    if (!next) {
      samples.push(pose)
      return
    }
    for (let s = 0; s < 6; s++) samples.push(lerpPose(pose, next, s / 6))
  })
  if (!samples.length) samples.push(...poses)

  const union = samples.map(groundedBounds).reduce<Bounds>(
    (u, b) => ({
      minX: Math.min(u.minX, b.minX),
      maxX: Math.max(u.maxX, b.maxX),
      minY: Math.min(u.minY, b.minY),
      maxY: Math.max(u.maxY, b.maxY),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )

  if (!Number.isFinite(union.minX)) {
    return { viewBox: `0 0 200 ${FLOOR_Y + PADDING}`, matFrom: 40, matTo: 160, onFloor: false }
  }

  let x = union.minX - PADDING
  let width = union.maxX - union.minX + PADDING * 2
  if (width < MIN_WIDTH) {
    x -= (MIN_WIDTH - width) / 2
    width = MIN_WIDTH
  }
  // The floor (and the mat under it) is the bottom of the frame.
  const bottom = FLOOR_Y + PADDING
  let y = union.minY - PADDING
  if (bottom - y < MIN_HEIGHT) y = bottom - MIN_HEIGHT
  const height = bottom - y

  const onFloor = poses.some((p) => Math.abs(p.bodyRotation ?? 0) >= 45) || union.maxY - union.minY < 110

  return {
    viewBox: [x, y, width, height].map((n) => Math.round(n * 10) / 10).join(" "),
    matFrom: union.minX - 8,
    matTo: union.maxX + 8,
    onFloor,
  }
}

/** The keyframe furthest from the first: the "Eind" of a movement (the squat's bottom, the bridge's top). */
export function peakPose(poses: readonly FigurePose[]): FigurePose | undefined {
  const first = poses[0]
  if (!first) return undefined
  let best = first
  let bestDistance = -1
  for (const pose of poses) {
    const d = (Object.keys(first) as (keyof FigurePose)[]).reduce(
      (sum, key) => sum + Math.abs((pose[key] ?? 0) - (first[key] ?? 0)),
      0,
    )
    if (d > bestDistance) {
      best = pose
      bestDistance = d
    }
  }
  return best
}

/**
 * Whether two poses look different: some joint angle or position moves by
 * more than a few degrees/units. A plank that only "breathes" does not, so
 * it gets one still instead of two identical Start/Eind figures.
 */
export function posesDiffer(a: FigurePose, b: FigurePose, threshold = 6): boolean {
  return (Object.keys(a) as (keyof FigurePose)[]).some(
    (key) => Math.abs((a[key] ?? 0) - (b[key] ?? 0)) > threshold,
  )
}
