import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { InsightProgress } from "@/lib/cycle/cycle-recap"
import { textActionClass } from "@/components/ui/button"
import { ICON } from "@/lib/ui/icon"

/**
 * Shows how close she is to her first personal pattern, so tracking has a
 * visible purpose before there's anything to show. A block inside the one
 * "Jouw patronen" card on Cyclus — no surface of its own.
 */
export function InsightProgressBlock({ progress }: { progress: InsightProgress }) {
  return (
    <div>
      <h3 className="type-card-title text-ink">{progress.title}</h3>
      <p className="text-sm text-ink-soft mt-1">{progress.body}</p>
      <ul className="flex flex-col gap-3 mt-4">
        {progress.steps.map((step) => {
          const pct = Math.round((step.done / step.total) * 100)
          return (
            <li key={step.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm mb-1.5">
                <span className="text-ink">{step.label}</span>
                <span className="text-ink-soft tabular-nums">
                  {step.done} van {step.total}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full bg-chart-track overflow-hidden"
                role="progressbar"
                aria-label={step.label}
                aria-valuemin={0}
                aria-valuemax={step.total}
                aria-valuenow={step.done}
              >
                <div
                  className="h-full rounded-full bg-sage-fill transition-[width] duration-slow ease-standard"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
      <Link href="/vandaag#checkin" className={textActionClass("mt-2")}>
        Check-in van vandaag
        <ChevronRight {...ICON.sm} aria-hidden />
      </Link>
    </div>
  )
}
