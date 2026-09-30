import { Cookie } from "lucide-react"
import type { PhaseSnackTip } from "@/lib/cycle/phase-content"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** One tussendoor tip: concrete snack + short “why” knowledge. */
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
    <Card className={cn(compact ? "p-3.5" : undefined, className)}>
      <p className="text-xs font-medium text-sage-dark mb-1 inline-flex items-center gap-1.5">
        <Cookie className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        Tussendoortip
      </p>
      <p className={cn("font-medium text-ink", compact ? "text-sm" : "text-base")}>{tip.title}</p>
      <p className="text-sm text-ink-soft leading-relaxed mt-1">{tip.snack}</p>
      <p className="text-xs text-ink-soft leading-relaxed mt-2 bg-cream-soft rounded-xl px-3 py-2">
        <span className="font-medium text-ink">Waarom: </span>
        {tip.why}
      </p>
    </Card>
  )
}
