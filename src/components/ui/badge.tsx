import type { HTMLAttributes } from "react"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { cn } from "@/lib/utils"

type BadgeTone = "neutral" | "sage" | "phase"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** neutral: status ("staat uit") · sage: positive/meta · phase: phase name on a neutral ground. */
  tone?: BadgeTone
  /** Required for tone="phase". */
  phase?: CyclePhase
}

const phaseClasses: Record<CyclePhase, string> = {
  menstruatie: "bg-phase-menstruatie-soft text-phase-menstruatie-text",
  folliculair: "bg-phase-folliculair-soft text-phase-folliculair-text",
  ovulatie: "bg-phase-ovulatie-soft text-phase-ovulatie-text",
  luteaal: "bg-phase-luteaal-soft text-phase-luteaal-text",
}

const toneClasses: Record<Exclude<BadgeTone, "phase">, string> = {
  neutral: "bg-cream-soft text-ink-soft",
  sage: "bg-sage-soft text-sage-darker",
}

/**
 * Small static label (13/500, pill). Never interactive — a removable
 * filter is a `<Chip removable>`, not a Badge.
 */
export function Badge({ tone = "neutral", phase, className, ...props }: BadgeProps) {
  const toneClass = tone === "phase" ? (phase ? phaseClasses[phase] : toneClasses.neutral) : toneClasses[tone]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClass,
        className,
      )}
      {...props}
    />
  )
}
