import { Card } from "@/components/ui/card"
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
    <Card>
      <h2 className="font-display text-lg text-ink mb-3">Jouw voortgang</h2>
      {movementEnabled && (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm text-ink-soft">Trainingen deze week</p>
            <p className="text-sm font-medium text-ink">
              {completedThisWeek} / {goal}
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-cream-soft overflow-hidden mb-2">
            <div
              className={cn("h-full rounded-full transition-all duration-500", "bg-sage-dark")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-ink-soft mb-4">
            {completedThisWeek === 0
              ? "Nog niets deze week? Geen probleem — elk moment is een goed moment om te beginnen."
              : "Dit heb je zelf opgebouwd."}
          </p>
        </>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">Check-in reeks</p>
        <p className="text-sm font-medium text-ink">
          {streak > 0 ? `${streak} ${streak === 1 ? "dag" : "dagen"}` : "Begin vandaag"}
        </p>
      </div>
    </Card>
  )
}
