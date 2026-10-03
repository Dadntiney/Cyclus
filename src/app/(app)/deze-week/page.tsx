import type { Metadata } from "next"
import { getAuthedUser } from "@/lib/supabase/server"
import { loadWeekPlanContext } from "@/lib/data/week-plan-context"
import { buildGroceryList } from "@/lib/nutrition/grocery-list"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { WeekView } from "@/components/week/week-view"
import { FEATURES } from "@/lib/navigation/features"

export const metadata: Metadata = { title: FEATURES.week.label }

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

export default async function DezeWeekPage({
  searchParams,
}: {
  searchParams: Promise<{ dag?: string | string[] }>
}) {
  const user = await getAuthedUser()
  if (!user) return null

  const ctx = await loadWeekPlanContext(user.id)
  if (!ctx) return null

  const { dag } = await searchParams
  const requestedDay = typeof dag === "string" && ISO_DAY.test(dag) ? dag : null

  const weekIngredients = ctx.days.flatMap((d) => d.meals.map((m) => m.recipe?.ingredients).filter(Boolean))
  const groceryItemCount = buildGroceryList(weekIngredients).reduce((sum, cat) => sum + cat.items.length, 0)
  const planEnabled = ctx.profile.movement_enabled || ctx.profile.nutrition_enabled

  return (
    <Page>
      <PageHeader
        title={FEATURES.week.label}
        subtitle={planEnabled ? "Je plan voor eten en bewegen. Tik een dag om aan te passen." : undefined}
      />

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
        initialDate={requestedDay}
      />
    </Page>
  )
}
