"use client"

import { useId } from "react"
import type { FigurePose } from "@/lib/training/figure-pose"
import { FLOOR_Y, figureFrame, figureJoints, groundOffset, type FigureFrame } from "@/components/training/figure-geometry"

/**
 * One consistent Cyclus figure — soft female silhouette in brand peach/sage.
 * Same character, outfit and proportions for every exercise instruction.
 *
 * Every pose rests on the floor (its lowest point touches the mat line),
 * and `frame` — fitted once to all poses of an exercise — keeps the camera
 * still and nothing clipped. Size it with the container (`h-full w-full`):
 * the viewBox scales to fit.
 */
export function CyclusFigure({
  pose,
  frame,
  className,
}: {
  pose: FigurePose
  frame?: FigureFrame
  className?: string
}) {
  const fitted = frame ?? figureFrame([pose])
  const skinId = `cyclus-skin-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const skin = `url(#${skinId})`
  const { hipY, torsoBottom, lShoulder, rShoulder, lElbow, rElbow, lHand, rHand, lHip, rHip, lKnee, rKnee, lFoot, rFoot, headY, pivot } =
    figureJoints(pose)
  const rotation = pose.bodyRotation ?? 0
  const lift = groundOffset(pose)
  const matCenter = (fitted.matFrom + fitted.matTo) / 2
  const matHalf = Math.max(24, (fitted.matTo - fitted.matFrom) / 2)

  return (
    <svg
      viewBox={fitted.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={skinId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0c4a8" />
          <stop offset="100%" stopColor="#e2a888" />
        </linearGradient>
      </defs>

      {/* Soft studio mat, and a mat line for floor work. */}
      <ellipse cx={matCenter} cy={FLOOR_Y + 2} rx={matHalf + 10} ry="7" fill="var(--color-sage-soft)" opacity="0.55" />
      {fitted.onFloor && (
        <line
          x1={fitted.matFrom}
          y1={FLOOR_Y + 0.75}
          x2={fitted.matTo}
          y2={FLOOR_Y + 0.75}
          stroke="var(--color-line-strong)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}

      <g transform={`translate(0 ${lift})`}>
      <g transform={`rotate(${rotation} ${pivot.x} ${pivot.y})`}>
      {/* Hair bun */}
      <circle cx={pose.rootX + 10} cy={headY - 10} r="7" fill="var(--color-sage-dark)" />
      <ellipse cx={pose.rootX} cy={headY - 2} rx="15" ry="12" fill="var(--color-sage-dark)" />

      {/* Head */}
      <circle cx={pose.rootX} cy={headY} r="13" fill={skin} />

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
        stroke={skin}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line
        x1={lElbow.x}
        y1={lElbow.y}
        x2={lHand.x}
        y2={lHand.y}
        stroke={skin}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1={rShoulder.x}
        y1={rShoulder.y}
        x2={rElbow.x}
        y2={rElbow.y}
        stroke={skin}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <line
        x1={rElbow.x}
        y1={rElbow.y}
        x2={rHand.x}
        y2={rHand.y}
        stroke={skin}
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
      </g>
    </svg>
  )
}
