import Link from "next/link"
import { startOfWeek, subDays } from "date-fns"
import { ChevronLeft } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { buildWeekPlan, type WeekPlanRecipe } from "@/lib/recommendations/week-plan"
import { buildGroceryList } from "@/lib/nutrition/grocery-list"
import { computeCycleHistory, getEffectiveLastPeriodStart, withActivePeriod } from "@/lib/cycle/history"
import { GroceryList } from "@/components/week/grocery-list"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"

const RECIPE_COLUMNS = "id, title, category, preparation_time, ingredients, nutrition_information"

export default async function BoodschappenPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const sixMonthsAgo = subDays(new Date(), 200).toISOString().slice(0, 10)

  const [profile, { data: cycleProfile }, { data: workouts }, { data: recipes }, { data: cycleLogs }] =
    await Promise.all([
      getProfile(user.id),
      supabase.from("cycle_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("workouts").select("id, title, type, duration, difficulty"),
      supabase.from("recipes").select(RECIPE_COLUMNS),
      supabase
        .from("cycle_logs")
        .select("date, menstruation, symptoms")
        .eq("user_id", user.id)
        .gte("date", sixMonthsAgo)
        .order("date", { ascending: true }),
    ])

  if (!profile) return null

  if (!profile.nutrition_enabled) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <Link
          href="/deze-week"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft mb-4 touch-manipulation"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          Deze week
        </Link>
        <Card className="text-center py-8">
          <p className="text-3xl mb-3">🌿</p>
          <p className="font-display text-lg text-ink mb-2">Voeding staat nu uit</p>
          <p className="text-sm text-ink-soft mb-5 max-w-sm mx-auto">
            Er is geen boodschappenlijst omdat voeding niet aanstaat in je profiel.
          </p>
          <Link href="/profiel#voeding" className={buttonVariants()}>
            Zet aan in mijn profiel
          </Link>
        </Card>
      </div>
    )
  }

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

  const weekIngredients = days.flatMap((d) => d.meals.map((m) => m.recipe?.ingredients).filter(Boolean))
  const baseCategories = buildGroceryList(weekIngredients)

  const recipesById: Record<string, WeekPlanRecipe> = Object.fromEntries(
    (recipes ?? []).map((r) => [r.id, r]),
  )

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <Link
        href="/deze-week"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft mb-4 touch-manipulation"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Deze week
      </Link>
      <div className="mb-5">
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Boodschappen</h1>
        <p className="text-sm text-ink-soft mt-1">
          Op basis van je weekplanning. Vink af wat je al in huis hebt of hebt gehaald.
        </p>
      </div>

      <GroceryList
        userId={user.id}
        weekStartISO={weekStart.toISOString().slice(0, 10)}
        baseCategories={baseCategories}
        days={days}
        recipesById={recipesById}
      />
    </div>
  )
}
