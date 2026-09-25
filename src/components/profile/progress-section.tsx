import { Card } from "@/components/ui/card"
import type { Milestone } from "@/lib/data/profile"

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-cream-soft px-3.5 py-3">
      <p className="font-display text-xl text-ink">{value}</p>
      <p className="text-xs text-ink-soft mt-0.5">{label}</p>
    </div>
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
    <Card>
      <h2 className="font-display text-lg text-ink mb-1">Mijn voortgang</h2>
      <p className="text-sm text-ink-soft mb-4">
        Geen scores, geen druk — gewoon een overzicht van wat je al hebt opgebouwd.
      </p>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <StatTile value={totalWorkoutsCompleted} label="trainingen voltooid" />
        <StatTile value={totalCheckins} label="check-ins" />
        <StatTile value={currentStreak} label={currentStreak === 1 ? "dag op rij" : "dagen op rij"} />
        <StatTile value={bestStreak} label="langste reeks" />
      </div>

      {milestones.length > 0 ? (
        <>
          <p className="text-sm font-medium text-ink mb-2">Mijlpalen</p>
          <div className="flex flex-wrap gap-1.5">
            {milestones.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-sage-dark bg-sage-soft rounded-full px-2.5 py-1.5"
              >
                <span aria-hidden>{m.emoji}</span>
                {m.label}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-ink-soft">
          Jouw reis begint hier. Je eerste mijlpaal verschijnt zodra je een check-in doet of een
          training afrondt.
        </p>
      )}
    </Card>
  )
}
