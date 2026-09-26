import { startOfWeek, subDays } from "date-fns"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { buildWeekPlan, type WeekPlanRecipe, type MealSlot } from "@/lib/recommendations/week-plan"
import { buildGroceryList } from "@/lib/nutrition/grocery-list"
import { computeCycleHistory, getEffectiveLastPeriodStart, withActivePeriod } from "@/lib/cycle/history"
import { WeekView } from "@/components/week/week-view"

const RECIPE_COLUMNS = "id, title, category, preparation_time, ingredients, nutrition_information"
const WORKOUT_COLUMNS = "id, title, type, duration, difficulty"

export default async function DezeWeekPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const sixMonthsAgo = subDays(new Date(), 200).toISOString().slice(0, 10)

  const [profile, { data: cycleProfile }, { data: workouts }, { data: recipes }, { data: cycleLogs }] =
    await Promise.all([
      getProfile(user.id),
      supabase.from("cycle_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("workouts").select(WORKOUT_COLUMNS),
      supabase.from("recipes").select(RECIPE_COLUMNS),
      supabase
        .from("cycle_logs")
        .select("date, menstruation, symptoms")
        .eq("user_id", user.id)
        .gte("date", sixMonthsAgo)
        .order("date", { ascending: true }),
    ])

  if (!profile) return null

  const today = new Date().toISOString().slice(0, 10)
  const cycleHistory = computeCycleHistory(
    withActivePeriod(
      (cycleLogs ?? []).map((l) => ({ date: l.date, menstruation: l.menstruation, symptoms: l.symptoms })),
      cycleProfile?.active_period_start ?? null,
      today,
    ),
  )
  const effectiveCycleProfile = cycleProfile
    ? { ...cycleProfile, last_period_start: getEffectiveLastPeriodStart(cycleProfile.last_period_start, cycleHistory) }
    : null

  const days = buildWeekPlan({
    weekStart,
    today: new Date(),
    profile,
    cycleProfile: effectiveCycleProfile,
    workouts: workouts ?? [],
    recipes: recipes ?? [],
    seed: user.id,
  })

  const recipePoolBySlot: Record<MealSlot, WeekPlanRecipe[]> = {
    ontbijt: (recipes ?? []).filter((r) => r.category.includes("Ontbijt")),
    lunch: (recipes ?? []).filter((r) => r.category.includes("Lunch")),
    diner: (recipes ?? []).filter((r) => r.category.includes("Diner")),
  }

  const weekIngredients = days.flatMap((d) => d.meals.map((m) => m.recipe?.ingredients).filter(Boolean))
  const groceryItemCount = buildGroceryList(weekIngredients).reduce((sum, cat) => sum + cat.items.length, 0)

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <div className="mb-5">
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Deze week</h1>
        <p className="text-sm text-ink-soft mt-1">
          Je week in één oogopslag — afgestemd op je cyclus, en helemaal aan te passen.
        </p>
      </div>

      <WeekView
        userId={user.id}
        weekStartISO={weekStart.toISOString().slice(0, 10)}
        days={days}
        recipePoolBySlot={recipePoolBySlot}
        workoutPool={workouts ?? []}
        groceryItemCount={groceryItemCount}
        movementEnabled={profile.movement_enabled}
        nutritionEnabled={profile.nutrition_enabled}
      />
    </div>
  )
}
