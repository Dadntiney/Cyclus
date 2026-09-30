import { Droplets } from "lucide-react"
import type { PhaseHydrationTip } from "@/lib/cycle/phase-content"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Soft vocht-reminder for Vandaag / Week — not a checklist chore. */
export function PhaseHydrationTipCard({
  tip,
  compact = false,
  className,
}: {
  tip: PhaseHydrationTip
  compact?: boolean
  className?: string
}) {
  return (
    <Card className={cn(compact ? "p-3.5" : undefined, className)}>
      <p className="text-xs font-medium text-sage-dark mb-1 inline-flex items-center gap-1.5">
        <Droplets className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        Vocht vandaag
      </p>
      <p className={cn("font-medium text-ink", compact ? "text-sm" : "text-base")}>{tip.title}</p>
      <p className="text-sm text-ink-soft leading-relaxed mt-1">{tip.text}</p>
    </Card>
  )
}
