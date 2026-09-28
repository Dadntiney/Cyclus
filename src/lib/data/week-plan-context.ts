import { cache } from "react"
import { startOfWeek, subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import {
  buildWeekPlan,
  type WeekDayPlan,
  type WeekPlanRecipe,
  type WeekPlanWorkout,
  type MealSlot,
} from "@/lib/recommendations/week-plan"
import { filterOutDislikedRecipes } from "@/lib/nutrition/dislikes"
import { computeCycleHistory, getEffectiveLastPeriodStart, withActivePeriod } from "@/lib/cycle/history"
import type { Tables } from "@/types/database"

const RECIPE_COLUMNS =
  "id, title, category, preparation_time, ingredients, nutrition_information, image_url"
const WORKOUT_COLUMNS = "id, title, type, duration, difficulty, image_url"

export interface WeekPlanContext {
  userId: string
  weekStart: Date
  weekStartISO: string
  profile: Tables<"profiles">
  days: WeekDayPlan[]
  workouts: WeekPlanWorkout[]
  recipes: WeekPlanRecipe[]
  recipePoolBySlot: Record<MealSlot, WeekPlanRecipe[]>
}

/**
 * Shared loader for Deze week + Boodschappen so both pages resolve the same
 * plan from one query set (and React cache() dedupes within a request).
 */
export const loadWeekPlanContext = cache(async (userId: string): Promise<WeekPlanContext | null> => {
  const supabase = await createClient()
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const sixMonthsAgo = subDays(new Date(), 200).toISOString().slice(0, 10)

  const [profile, { data: cycleProfile }, { data: workouts }, { data: recipes }, { data: cycleLogs }] =
    await Promise.all([
      getProfile(userId),
      supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("workouts").select(WORKOUT_COLUMNS),
      supabase.from("recipes").select(RECIPE_COLUMNS),
      supabase
        .from("cycle_logs")
        .select("date, menstruation, symptoms")
        .eq("user_id", userId)
        .gte("date", sixMonthsAgo)
        .order("date", { ascending: true }),
    ])

  if (!profile) return null

  const today = new Date().toISOString().slice(0, 10)
  const cycleHistory = computeCycleHistory(
    withActivePeriod(
      (cycleLogs ?? []).map((l) => ({
        date: l.date,
        menstruation: l.menstruation,
        symptoms: l.symptoms,
      })),
      cycleProfile?.active_period_start ?? null,
      today,
    ),
  )
  const effectiveCycleProfile = cycleProfile
    ? {
        ...cycleProfile,
        last_period_start: getEffectiveLastPeriodStart(cycleProfile.last_period_start, cycleHistory),
      }
    : null

  const workoutRows = (workouts ?? []) as WeekPlanWorkout[]
  const recipeRows = (recipes ?? []) as WeekPlanRecipe[]

  const days = buildWeekPlan({
    weekStart,
    today: new Date(),
    profile,
    cycleProfile: effectiveCycleProfile,
    workouts: workoutRows,
    recipes: recipeRows,
    seed: userId,
  })

  const availableRecipes = filterOutDislikedRecipes(recipeRows, profile.disliked_foods)
  const recipePoolBySlot: Record<MealSlot, WeekPlanRecipe[]> = {
    ontbijt: availableRecipes.filter((r) => r.category.includes("Ontbijt")),
    lunch: availableRecipes.filter((r) => r.category.includes("Lunch")),
    diner: availableRecipes.filter((r) => r.category.includes("Diner")),
  }

  return {
    userId,
    weekStart,
    weekStartISO: weekStart.toISOString().slice(0, 10),
    profile,
    days,
    workouts: workoutRows,
    recipes: recipeRows,
    recipePoolBySlot,
  }
})
