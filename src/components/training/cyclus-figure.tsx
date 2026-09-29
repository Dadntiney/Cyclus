"use client"

import type { FigurePose } from "@/lib/training/figure-pose"

const ARM = 34
const FORE = 30
const THIGH = 38
const SHIN = 36

function rad(deg: number) {
  return (deg * Math.PI) / 180
}

function endPoint(x: number, y: number, length: number, deg: number) {
  return {
    x: x + Math.sin(rad(deg)) * length,
    y: y + Math.cos(rad(deg)) * length,
  }
}

/**
 * One consistent Cyclus figure — soft female silhouette in brand peach/sage.
 * Same character, outfit and proportions for every exercise instruction.
 */
export function CyclusFigure({ pose, className }: { pose: FigurePose; className?: string }) {
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
  const lFoot = endPoint(lKnee.x, lKnee.y, SHIN, pose.lHip + pose.lKnee)
  const rFoot = endPoint(rKnee.x, rKnee.y, SHIN, pose.rHip + pose.rKnee)

  const headY = pose.rootY - 22
  const pivotX = pose.rootX
  const pivotY = pose.rootY + 70
  const rotation = pose.bodyRotation ?? 0

  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id="cyclus-mat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-peach-soft)" />
          <stop offset="100%" stopColor="var(--color-cream)" />
        </linearGradient>
        <linearGradient id="cyclus-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0c4a8" />
          <stop offset="100%" stopColor="#e2a888" />
        </linearGradient>
      </defs>

      {/* Soft studio mat */}
      <ellipse cx="100" cy="232" rx="72" ry="10" fill="var(--color-sage-soft)" opacity="0.55" />

      <g transform={`rotate(${rotation} ${pivotX} ${pivotY})`}>
      {/* Hair bun */}
      <circle cx={pose.rootX + 10} cy={headY - 10} r="7" fill="var(--color-sage-dark)" />
      <ellipse cx={pose.rootX} cy={headY - 2} rx="15" ry="12" fill="var(--color-sage-dark)" />

      {/* Head */}
      <circle cx={pose.rootX} cy={headY} r="13" fill="url(#cyclus-skin)" />

      {/* Torso / top */}
      <path
        d={`M ${lShoulder.x} ${lShoulder.y}
            Q ${pose.rootX} ${pose.rootY - 4} ${rShoulder.x} ${rShoulder.y}
            L ${rHip.x + 2} ${rHip.y}
            Q ${torsoBottom.x} ${hipY + 6} ${lHip.x - 2} ${lHip.y}
            Z`}
        fill="var(--color-peach)"
      />

      {/* Arms */}
      <line
        x1={lShoulder.x}
        y1={lShoulder.y}
        x2={lElbow.x}
        y2={lElbow.y}
        stroke="url(#cyclus-skin)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line
        x1={lElbow.x}
        y1={lElbow.y}
        x2={lHand.x}
        y2={lHand.y}
        stroke="url(#cyclus-skin)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1={rShoulder.x}
        y1={rShoulder.y}
        x2={rElbow.x}
        y2={rElbow.y}
        stroke="url(#cyclus-skin)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line
        x1={rElbow.x}
        y1={rElbow.y}
        x2={rHand.x}
        y2={rHand.y}
        stroke="url(#cyclus-skin)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Legs / leggings */}
      <line
        x1={lHip.x}
        y1={lHip.y}
        x2={lKnee.x}
        y2={lKnee.y}
        stroke="var(--color-sage-dark)"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <line
        x1={lKnee.x}
        y1={lKnee.y}
        x2={lFoot.x}
        y2={lFoot.y}
        stroke="var(--color-sage-dark)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <line
        x1={rHip.x}
        y1={rHip.y}
        x2={rKnee.x}
        y2={rKnee.y}
        stroke="var(--color-sage-dark)"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <line
        x1={rKnee.x}
        y1={rKnee.y}
        x2={rFoot.x}
        y2={rFoot.y}
        stroke="var(--color-sage-dark)"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Soft waistband */}
      <ellipse
        cx={torsoBottom.x}
        cy={hipY - 2}
        rx="18"
        ry="5"
        fill="var(--color-sage)"
        opacity="0.85"
      />
      </g>
    </svg>
  )
}
