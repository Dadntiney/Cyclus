import "server-only"
import { cache } from "react"
import { unstable_cache } from "next/cache"
import { format, subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { todayISO as amsterdamTodayISO } from "@/lib/dates/amsterdam"

/** Columns shared by week plan + Vandaag recommendation engine. */
export const WORKOUT_PLAN_COLUMNS =
  "id, title, type, duration, difficulty, image_url" as const

export const RECIPE_PLAN_COLUMNS =
  "id, title, category, preparation_time, servings, ingredients, nutrition_information, image_url" as const

/** ~6.5 months — same window week plan and Vandaag pattern insights use. */
export function historyWindowStartISO(today = amsterdamTodayISO()) {
  return format(subDays(new Date(`${today}T12:00:00`), 200), "yyyy-MM-dd")
}

export const getCycleProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("cycle_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()
  return data
})

export const getCycleLogsForHistory = cache(async (userId: string) => {
  const supabase = await createClient()
  const since = historyWindowStartISO()
  const { data } = await supabase
    .from("cycle_logs")
    .select("date, menstruation, symptoms")
    .eq("user_id", userId)
    .gte("date", since)
    .order("date", { ascending: true })
  return data ?? []
})

export const getRecentCheckinsForHistory = cache(async (userId: string) => {
  const supabase = await createClient()
  const since = historyWindowStartISO()
  const today = amsterdamTodayISO()
  const { data } = await supabase
    .from("daily_checkins")
    .select("date, symptoms, energy, mood, sleep, stress, needs")
    .eq("user_id", userId)
    .gte("date", since)
    .lte("date", today)
  return data ?? []
})

/**
 * Global workout catalog. Cross-request cached when the service role is
 * available (no cookies() → safe for unstable_cache); otherwise one
 * React-cache hit per request via the cookie client.
 */
export const getWorkoutPlanCatalog = cache(async () => {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getCachedWorkoutPlanCatalog()
  }
  const supabase = await createClient()
  const { data } = await supabase.from("workouts").select(WORKOUT_PLAN_COLUMNS)
  return data ?? []
})

const getCachedWorkoutPlanCatalog = unstable_cache(
  async () => {
    const supabase = createServiceClient()
    const { data } = await supabase.from("workouts").select(WORKOUT_PLAN_COLUMNS)
    return data ?? []
  },
  ["workout-plan-catalog-v1"],
  { revalidate: 600 },
)

/** Global recipe catalog — same caching strategy as workouts. */
export const getRecipePlanCatalog = cache(async () => {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getCachedRecipePlanCatalog()
  }
  const supabase = await createClient()
  const { data } = await supabase.from("recipes").select(RECIPE_PLAN_COLUMNS)
  return data ?? []
})

const getCachedRecipePlanCatalog = unstable_cache(
  async () => {
    const supabase = createServiceClient()
    const { data } = await supabase.from("recipes").select(RECIPE_PLAN_COLUMNS)
    return data ?? []
  },
  ["recipe-plan-catalog-v1"],
  { revalidate: 600 },
)
