import { cn } from "@/lib/utils"

export function ProgressCard({
  completedThisWeek,
  weeklyGoal,
  streak,
  movementEnabled = true,
}: {
  completedThisWeek: number
  weeklyGoal: number | null
  streak: number
  movementEnabled?: boolean
}) {
  const goal = weeklyGoal ?? 3
  const pct = Math.min(100, Math.round((completedThisWeek / Math.max(1, goal)) * 100))

  return (
    <div className="rounded-3xl bg-sage-soft/50 p-4">
      <h2 className="font-display text-lg text-ink mb-2.5">Mijn voortgang</h2>
      {movementEnabled && (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm text-ink-soft">Trainingen deze week</p>
            <p className="text-sm font-medium text-ink">
              {completedThisWeek} / {goal}
            </p>
          </div>
          <div
            className="w-full h-2 rounded-full bg-cream-soft overflow-hidden mb-2"
            role="progressbar"
            aria-valuenow={completedThisWeek}
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-label="Trainingen deze week"
          >
            <div
              className={cn("h-full rounded-full transition-all duration-500", "bg-sage-fill")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-ink-soft mb-3">
            {completedThisWeek === 0
              ? "Nog niets deze week? Geen probleem — elk moment is een goed moment om te beginnen."
              : "Dit heb je zelf opgebouwd."}
          </p>
        </>
      )}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm text-ink-soft">Check-in reeks</p>
          <p className="text-sm font-medium text-ink">
            {streak > 0 ? `${streak} ${streak === 1 ? "dag" : "dagen"}` : "Begin vandaag"}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5"
          role="img"
          aria-label={
            streak > 0
              ? `Check-in reeks van ${streak} ${streak === 1 ? "dag" : "dagen"}`
              : "Nog geen check-in reeks"
          }
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const filled = streak > 0 && i < Math.min(streak, 7)
            return (
              <span
                key={i}
                className={cn(
                  "h-2 flex-1 rounded-full transition-colors",
                  filled ? "bg-sage-fill" : "bg-cream-soft",
                )}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
