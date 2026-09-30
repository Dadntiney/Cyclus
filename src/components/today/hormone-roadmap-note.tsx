import Link from "next/link"
import { ChevronRight, Footprints, Salad, Leaf, Lightbulb } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { RoadmapSupportKind, TodayRoadmap } from "@/lib/cycle/today-roadmap"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<RoadmapSupportKind, LucideIcon> = {
  beweging: Footprints,
  voeding: Salad,
  rust: Leaf,
  tip: Lightbulb,
}

/**
 * Compact “hormoonwegwijzer” on Vandaag: why her body may feel this way,
 * plus 1–3 soft support points that move with phase + today’s check-in.
 */
export function HormoneRoadmapNote({
  roadmap,
  phaseTone,
}: {
  roadmap: TodayRoadmap
  phaseTone?: { bg: string; text: string } | null
}) {
  return (
    <section
      aria-labelledby="roadmap-heading"
      className={cn(
        "rounded-3xl px-4 py-4",
        phaseTone?.bg ?? "bg-sage-soft/55",
      )}
    >
      <p
        id="roadmap-heading"
        className={cn("text-sm font-medium mb-1", phaseTone?.text ?? "text-sage-dark")}
      >
        Wat jouw lichaam vandaag kan gebruiken
      </p>
      <p className="text-sm text-ink leading-relaxed">{roadmap.whyNow}</p>

      {roadmap.supports.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2.5">
          {roadmap.supports.map((support) => {
            const Icon = KIND_ICON[support.kind]
            return (
              <li key={`${support.kind}-${support.title}`} className="flex gap-2.5">
                <span className="mt-0.5 shrink-0 h-7 w-7 rounded-full bg-surface/70 flex items-center justify-center">
                  <Icon
                    className={cn("h-3.5 w-3.5", phaseTone?.text ?? "text-sage-dark")}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{support.title}</span>
                  <span className="block text-xs text-ink-soft mt-0.5 leading-relaxed">
                    {support.why}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      )}

      <Link
        href="/cyclus/vandaag"
        className={cn(
          "mt-3 inline-flex items-center gap-1 min-h-11 text-xs font-medium touch-manipulation",
          phaseTone?.text ?? "text-sage-dark",
        )}
      >
        Meer over deze fase
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </Link>
    </section>
  )
}
