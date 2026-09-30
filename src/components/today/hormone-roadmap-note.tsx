import Link from "next/link"
import { ChevronRight, Footprints, Salad, Leaf, Lightbulb, Heart } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { RoadmapSupportKind, TodayRoadmap } from "@/lib/cycle/today-roadmap"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<RoadmapSupportKind, LucideIcon> = {
  beweging: Footprints,
  voeding: Salad,
  rust: Leaf,
  tip: Lightbulb,
  helped: Heart,
}

/**
 * Compact “hormoonwegwijzer” on Vandaag — one why-beat + max two supports.
 */
export function HormoneRoadmapNote({
  roadmap,
  phaseTone,
  savedTexts = [],
}: {
  roadmap: TodayRoadmap
  phaseTone?: { bg: string; text: string } | null
  savedTexts?: string[]
}) {
  const saved = new Set(savedTexts)

  return (
    <section
      aria-labelledby="roadmap-heading"
      className={cn(
        "rounded-3xl px-4 py-3.5",
        phaseTone?.bg ?? "bg-sage-soft/55",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p
            id="roadmap-heading"
            className={cn("text-sm font-medium mb-1", phaseTone?.text ?? "text-sage-dark")}
          >
            Wat jouw lichaam vandaag kan gebruiken
          </p>
          <p className="text-sm text-ink leading-relaxed">{roadmap.whyNow}</p>
        </div>
        <MomentFavoriteButton
          kind="roadmap"
          text={roadmap.whyNow}
          source="hormone-roadmap"
          initialFavorited={saved.has(roadmap.whyNow)}
          size="sm"
        />
      </div>

      {roadmap.supports.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {roadmap.supports.map((support) => {
            const Icon = KIND_ICON[support.kind]
            const momentText = `${support.title}: ${support.why}`
            const heartable = support.kind === "tip" || support.kind === "helped"
            return (
              <li key={`${support.kind}-${support.title}`} className="flex gap-2.5">
                <span className="mt-0.5 shrink-0 h-7 w-7 rounded-full bg-surface/70 flex items-center justify-center">
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      support.kind === "helped"
                        ? "text-peach"
                        : (phaseTone?.text ?? "text-sage-dark"),
                    )}
                    strokeWidth={support.kind === "helped" ? 0 : 1.75}
                    fill={support.kind === "helped" ? "currentColor" : "none"}
                    aria-hidden
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{support.title}</span>
                  <span className="block text-xs text-ink-soft mt-0.5 leading-relaxed">
                    {support.why}
                  </span>
                </span>
                {heartable && (
                  <MomentFavoriteButton
                    kind="tip"
                    text={momentText}
                    source="hormone-roadmap-support"
                    initialFavorited={saved.has(momentText)}
                    size="sm"
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link
          href="/cyclus/vandaag"
          className={cn(
            "inline-flex items-center gap-1 min-h-11 text-xs font-medium touch-manipulation",
            phaseTone?.text ?? "text-sage-dark",
          )}
        >
          Meer over deze fase
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          href="/cyclus"
          className={cn(
            "inline-flex items-center gap-1 min-h-11 text-xs font-medium touch-manipulation",
            phaseTone?.text ?? "text-sage-dark",
          )}
        >
          Jouw verhaal
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
      </div>
    </section>
  )
}
