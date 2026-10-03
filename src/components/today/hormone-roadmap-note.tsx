import Link from "next/link"
import type { ReactNode } from "react"
import { CalendarClock, ChevronRight, Cookie, Droplets, Footprints, Heart, Leaf, Lightbulb, Salad } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Anticipation } from "@/lib/cycle/anticipation"
import type { PhaseHydrationTip, PhaseSnackTip } from "@/lib/cycle/phase-content"
import type { RoadmapSupportKind, TodayRoadmap } from "@/lib/cycle/today-roadmap"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { textActionClass } from "@/components/ui/button"
import { Disclosure } from "@/components/ui/disclosure"
import { SectionHeader } from "@/components/ui/section-header"
import { FEATURES } from "@/lib/navigation/features"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

const KIND_ICON: Record<RoadmapSupportKind, LucideIcon> = {
  beweging: Footprints,
  voeding: Salad,
  rust: Leaf,
  tip: Lightbulb,
  helped: Heart,
}

/** At most two supports on Vandaag (ontwerpvisie §7.1). */
const MAX_SUPPORTS = 2

export type SmallTip =
  | { kind: "snack"; tip: PhaseSnackTip; showWhy: boolean }
  | { kind: "hydration"; tip: PhaseHydrationTip }

function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark",
        className,
      )}
    >
      {children}
    </span>
  )
}

/**
 * "Wat je lichaam kan gebruiken" — flat on the page, no tint (the phase
 * status is the one tinted block). Rows: vooruitkijken (when a harder
 * stretch is coming), max two supports, one "Kleine tip voor vandaag"
 * (snack, or vocht when there is no snack). Then "Over jouw fase ›" (or
 * "De overgang ›") and "Jouw verhaal ›".
 *
 * The "why now" line is normally said once, as the day voice under "Voor
 * jou vandaag" (`hideWhy`).
 */
export function HormoneRoadmapNote({
  roadmap,
  savedTexts = [],
  changingCycle = false,
  hideWhy = false,
  excludeKinds = [],
  tip = null,
  anticipation = null,
}: {
  roadmap: TodayRoadmap | null
  savedTexts?: string[]
  /** Changing cycle: point to the overgang explainer instead of the phase page. */
  changingCycle?: boolean
  /** The why-line is already the day voice elsewhere on the page. */
  hideWhy?: boolean
  /** Support kinds the plan already covers (e.g. beweging when the plan has a workout). */
  excludeKinds?: RoadmapSupportKind[]
  tip?: SmallTip | null
  anticipation?: Anticipation | null
}) {
  const saved = new Set(savedTexts)
  const excluded = new Set(excludeKinds)
  const supports = (roadmap?.supports ?? []).filter((s) => !excluded.has(s.kind)).slice(0, MAX_SUPPORTS)
  const showWhy = Boolean(roadmap && !hideWhy && roadmap.whyNow)

  if (!showWhy && supports.length === 0 && !tip && !anticipation) return null

  const phaseLink = changingCycle ? FEATURES.overgang : FEATURES.fase
  const phaseLinkLabel = changingCycle ? FEATURES.overgang.label : (FEATURES.fase.linkLabel ?? FEATURES.fase.label)

  return (
    <section aria-labelledby="lichaam-heading">
      <SectionHeader id="lichaam-heading" title="Wat je lichaam kan gebruiken" />

      {showWhy && roadmap && (
        <div className="-mt-1 mb-1 flex items-start gap-1">
          <p className="min-w-0 flex-1 text-sm text-ink-soft">{roadmap.whyNow}</p>
          <span className="-my-2.5 shrink-0">
            <MomentFavoriteButton
              kind="roadmap"
              text={roadmap.whyNow}
              source="hormone-roadmap"
              initialFavorited={saved.has(roadmap.whyNow)}
              size="sm"
            />
          </span>
        </div>
      )}

      <ul className="divide-y divide-line">
        {anticipation && (
          <li className="flex gap-3 py-3">
            <Tile>
              <CalendarClock {...ICON.sm} />
            </Tile>
            <div className="min-w-0 flex-1">
              <p className="type-eyebrow text-sage-dark">Vooruitkijken</p>
              <p className="text-base font-medium text-ink">{anticipation.headline}</p>
              <p className="text-sm text-ink-soft">{anticipation.body}</p>
              <Link href={`${FEATURES.week.href}?dag=${anticipation.startDate}`} className={textActionClass("-ml-1 px-1")}>
                Week daarop afstemmen
                <ChevronRight {...ICON.sm} aria-hidden />
              </Link>
            </div>
          </li>
        )}

        {supports.map((support) => {
          const Icon = KIND_ICON[support.kind]
          const momentText = `${support.title}: ${support.why}`
          const heartable = support.kind === "tip" || support.kind === "helped"
          const helped = support.kind === "helped"
          return (
            <li key={`${support.kind}-${support.title}`} className="flex gap-3 py-3">
              <Tile className={helped ? "bg-peach-soft text-peach" : undefined}>
                <Icon {...ICON.sm} fill={helped ? "currentColor" : "none"} />
              </Tile>
              <div className="min-w-0 flex-1">
                <p className="text-base font-medium text-ink">{support.title}</p>
                <p className="text-sm text-ink-soft">{support.why}</p>
              </div>
              {heartable && (
                <span className="-my-1 shrink-0">
                  <MomentFavoriteButton
                    kind="tip"
                    text={momentText}
                    source="hormone-roadmap-support"
                    initialFavorited={saved.has(momentText)}
                    size="sm"
                  />
                </span>
              )}
            </li>
          )
        })}

        {tip && (
          <li className="flex gap-3 py-3">
            <Tile>{tip.kind === "snack" ? <Cookie {...ICON.sm} /> : <Droplets {...ICON.sm} />}</Tile>
            <div className="min-w-0 flex-1">
              <p className="type-eyebrow text-sage-dark">Kleine tip voor vandaag</p>
              <p className="text-base font-medium text-ink">{tip.tip.title}</p>
              <p className="text-sm text-ink-soft">{tip.kind === "snack" ? tip.tip.snack : tip.tip.text}</p>
              {tip.kind === "snack" && tip.showWhy && (
                <Disclosure label="Waarom" className="-mb-2" contentClassName="pt-1 pb-2">
                  <p className="text-sm text-ink-soft">{tip.tip.why}</p>
                </Disclosure>
              )}
            </div>
          </li>
        )}
      </ul>

      <div className="mt-1 flex flex-wrap items-center gap-x-5">
        <Link href={phaseLink.href} className={textActionClass()}>
          {phaseLinkLabel}
          <ChevronRight {...ICON.sm} aria-hidden />
        </Link>
        <Link href={`${FEATURES.cyclus.href}#jouw-verhaal`} className={textActionClass()}>
          Jouw verhaal
          <ChevronRight {...ICON.sm} aria-hidden />
        </Link>
      </div>
    </section>
  )
}
