import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SectionHeader } from "@/components/ui/section-header"
import { ICON } from "@/lib/ui/icon"
import type { Milestone } from "@/lib/data/profile"

/** Every tile is the same height, number on top, words underneath. */
const TILE = "flex min-h-28 flex-col justify-between gap-2 rounded-card p-4"

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <li className={`${TILE} bg-cream-soft`}>
      <p className="type-section-title text-ink tabular-nums">{value}</p>
      <p className="text-sm text-ink-soft">{label}</p>
    </li>
  )
}

/** A zero reads as failing — show a gentle first step instead of the number. */
function InviteTile({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <li>
      <Link
        href={href}
        className={`${TILE} h-full border border-dashed border-line-strong touch-manipulation transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft`}
      >
        <span className="text-sm text-ink-soft">{text}</span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-sage-dark">
          {cta}
          <ArrowRight {...ICON.sm} aria-hidden />
        </span>
      </Link>
    </li>
  )
}

export function ProgressSection({
  totalWorkoutsCompleted,
  totalCheckins,
  currentStreak,
  bestStreak,
  milestones,
}: {
  totalWorkoutsCompleted: number
  totalCheckins: number
  currentStreak: number
  bestStreak: number
  milestones: Milestone[]
}) {
  return (
    <>
      <section aria-label="Wat je hebt opgebouwd">
        <ul className="grid grid-cols-2 gap-3">
          {totalWorkoutsCompleted > 0 ? (
            <StatTile
              value={totalWorkoutsCompleted}
              label={totalWorkoutsCompleted === 1 ? "training voor jezelf gedaan" : "trainingen voor jezelf gedaan"}
            />
          ) : (
            <InviteTile text="Je eerste moment voor jezelf?" href="/training" cta="Kies een korte beweging" />
          )}
          {totalCheckins > 0 ? (
            <StatTile value={totalCheckins} label={totalCheckins === 1 ? "check-in" : "check-ins"} />
          ) : (
            <InviteTile text="Hoe voel je je vandaag?" href="/vandaag" cta="Doe een check-in" />
          )}
          {currentStreak > 0 && (
            <StatTile
              value={currentStreak}
              label={currentStreak === 1 ? "dag op rij bij jezelf" : "dagen op rij bij jezelf"}
            />
          )}
          {bestStreak > 0 && (
            <StatTile
              value={bestStreak}
              label={bestStreak === 1 ? "dag, je langste reeks" : "dagen, je langste reeks"}
            />
          )}
        </ul>
      </section>

      <section aria-labelledby="mijlpalen">
        <SectionHeader id="mijlpalen" title="Mijlpalen" />
        {milestones.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-3.5">
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
                >
                  <m.icon {...ICON.sm} />
                </span>
                <span className="text-base text-ink">{m.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body text-ink-soft">
            Jouw reis begint hier. Je eerste mijlpaal verschijnt zodra je een check-in doet of iets
            voor jezelf doet.
          </p>
        )}
      </section>
    </>
  )
}
