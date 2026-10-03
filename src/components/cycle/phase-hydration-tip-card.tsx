import { Droplets } from "lucide-react"
import type { PhaseHydrationTip } from "@/lib/cycle/phase-content"
import { Card } from "@/components/ui/card"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

/**
 * Soft vocht-reminder — not a checklist chore. Vandaag shows this as the
 * "Kleine tip voor vandaag" row instead.
 */
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
    <Card padding={compact ? "sm" : "md"} className={className}>
      <p className="mb-1 inline-flex items-center gap-1.5 type-eyebrow text-sage-dark">
        <Droplets {...ICON.sm} aria-hidden />
        Vocht vandaag
      </p>
      <p className={cn("font-medium text-ink", compact ? "text-sm" : "text-base")}>{tip.title}</p>
      <p className="mt-1 text-sm text-ink-soft">{tip.text}</p>
    </Card>
  )
}
