"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePrefersReducedMotion } from "@/components/training/use-reduced-motion"
import { cn } from "@/lib/utils"

/**
 * "Stap 2 van 6" with one dot per step instead of a running clock: she
 * sees how far she is, not how long it takes (WB-22).
 */
export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="type-eyebrow text-sage-dark">
        Stap {current + 1} van {total}
      </p>
      <span aria-hidden className="flex items-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-[width,background-color] duration-base ease-standard",
              i === current ? "w-4 bg-sage-dark" : i < current ? "w-1.5 bg-sage" : "w-1.5 bg-line-strong",
            )}
          />
        ))}
      </span>
    </div>
  )
}

const INHALE_MS = 4000
const EXHALE_MS = 6000

/**
 * A slow breathing ring while she listens: grows a little in 4 seconds,
 * settles in 6 (instead of a blinking pulse, WB-18), so it can double as a
 * gentle pace for the breath. Still under reduced motion and while paused.
 */
export function BreathingRing({ breathing, children }: { breathing: boolean; children: ReactNode }) {
  const reduceMotion = usePrefersReducedMotion()
  const active = breathing && !reduceMotion
  const [inhale, setInhale] = useState(false)

  useEffect(() => {
    if (!active) return
    let next = true
    function step() {
      setInhale(next)
      timer = setTimeout(step, next ? INHALE_MS : EXHALE_MS)
      next = !next
    }
    // First breath in right after the paint, then in 4 / out 6.
    let timer = setTimeout(step, 0)
    return () => clearTimeout(timer)
  }, [active])

  const grown = active && inhale

  return (
    <div className="relative mx-auto h-24 w-24">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-sage-soft transition-transform ease-in-out motion-reduce:transition-none"
        style={{
          transform: grown ? "scale(1.08)" : "scale(1)",
          transitionDuration: `${grown ? INHALE_MS : EXHALE_MS}ms`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
