import { getAuthedUser } from "@/lib/supabase/server"
import { loadWeekPlanContext } from "@/lib/data/week-plan-context"
import { buildGroceryList } from "@/lib/nutrition/grocery-list"
import { WeekView } from "@/components/week/week-view"
import { BackButton } from "@/components/ui/back-button"

export default async function DezeWeekPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const ctx = await loadWeekPlanContext(user.id)
  if (!ctx) return null

  const weekIngredients = ctx.days.flatMap((d) => d.meals.map((m) => m.recipe?.ingredients).filter(Boolean))
  const groceryItemCount = buildGroceryList(weekIngredients).reduce((sum, cat) => sum + cat.items.length, 0)

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <div className="mb-5">
        <BackButton href="/ontdek" label="Ontdek" />
        <h1 className="font-display text-3xl lg:text-4xl text-ink">Deze week</h1>
        <p className="text-sm text-ink-soft mt-1">
          Weekplan voor eten en bewegen — tik een dag om aan te passen.
        </p>
      </div>

      <WeekView
        userId={user.id}
        weekStartISO={ctx.weekStartISO}
        activePeriodStart={ctx.activePeriodStart}
        days={ctx.days}
        recipePoolBySlot={ctx.recipePoolBySlot}
        workoutPool={ctx.workouts}
        groceryItemCount={groceryItemCount}
        movementEnabled={ctx.profile.movement_enabled}
        nutritionEnabled={ctx.profile.nutrition_enabled}
        completedWorkoutsByDate={ctx.completedWorkoutsByDate}
        changingCycle={ctx.changingCycle}
        todayLow={ctx.todayLow}
      />
    </div>
  )
}
