import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ProgressCard({
  completedThisWeek,
  weeklyGoal,
  streak,
}: {
  completedThisWeek: number
  weeklyGoal: number | null
  streak: number
}) {
  const goal = weeklyGoal ?? 3
  const pct = Math.min(100, Math.round((completedThisWeek / Math.max(1, goal)) * 100))

  return (
    <Card>
      <h2 className="font-display text-lg text-ink mb-3">Jouw voortgang</h2>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm text-ink-soft">Trainingen deze week</p>
        <p className="text-sm font-medium text-ink">
          {completedThisWeek} / {goal}
        </p>
      </div>
      <div className="w-full h-2 rounded-full bg-cream-soft overflow-hidden mb-4">
        <div
          className={cn("h-full rounded-full transition-all duration-500", "bg-sage")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">Check-in reeks</p>
        <p className="text-sm font-medium text-ink">
          {streak} {streak === 1 ? "dag" : "dagen"}
        </p>
      </div>
    </Card>
  )
}
