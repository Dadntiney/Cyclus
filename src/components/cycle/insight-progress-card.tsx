import Link from "next/link"
import { ChevronRight, Sparkles } from "lucide-react"
import type { InsightProgress } from "@/lib/cycle/cycle-recap"
import { Card } from "@/components/ui/card"

/**
 * Shows how close she is to her first personal pattern, so tracking has a
 * visible purpose before there's anything to show.
 */
export function InsightProgressCard({ progress }: { progress: InsightProgress }) {
  return (
    <Card>
      <div className="flex gap-2.5 mb-3">
        <Sparkles className="h-4 w-4 text-sage-dark shrink-0 mt-1" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0">
          <p className="font-display text-lg text-ink">{progress.title}</p>
          <p className="text-sm text-ink-soft leading-relaxed mt-1">{progress.body}</p>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {progress.steps.map((step) => {
          const pct = Math.round((step.done / step.total) * 100)
          return (
            <li key={step.label}>
              <div className="flex items-baseline justify-between text-sm mb-1.5">
                <span className="text-ink">{step.label}</span>
                <span className="text-ink-soft tabular-nums">
                  {step.done} van {step.total}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full bg-cream-soft overflow-hidden"
                role="progressbar"
                aria-label={step.label}
                aria-valuemin={0}
                aria-valuemax={step.total}
                aria-valuenow={step.done}
              >
                <div className="h-full rounded-full bg-sage-fill" style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
      <Link
        href="/vandaag"
        className="mt-3 inline-flex items-center gap-1 min-h-11 text-sm font-medium text-sage-dark touch-manipulation"
      >
        Check-in van vandaag
        <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
    </Card>
  )
}
