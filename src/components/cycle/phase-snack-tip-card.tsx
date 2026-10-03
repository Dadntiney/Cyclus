import { Cookie } from "lucide-react"
import type { PhaseSnackTip } from "@/lib/cycle/phase-content"
import { Card } from "@/components/ui/card"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

/**
 * One tussendoor tip: concrete snack + short “why” knowledge.
 * Vandaag shows this as the "Kleine tip voor vandaag" row instead.
 */
export function PhaseSnackTipCard({
  tip,
  compact = false,
  className,
}: {
  tip: PhaseSnackTip
  compact?: boolean
  className?: string
}) {
  return (
    <Card padding={compact ? "sm" : "md"} className={className}>
      <p className="mb-1 inline-flex items-center gap-1.5 type-eyebrow text-sage-dark">
        <Cookie {...ICON.sm} aria-hidden />
        Tussendoortip
      </p>
      <p className={cn("font-medium text-ink", compact ? "text-sm" : "text-base")}>{tip.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{tip.snack}</p>
      <p className="mt-2 rounded-inset bg-cream-soft px-3 py-2 text-xs text-ink-soft">
        <span className="font-medium text-ink">Waarom: </span>
        {tip.why}
      </p>
    </Card>
  )
}
