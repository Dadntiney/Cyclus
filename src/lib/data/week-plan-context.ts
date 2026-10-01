import { cache } from "react"
import { format, startOfWeek } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { todayDate, todayISO as amsterdamTodayISO } from "@/lib/dates/amsterdam"
import { getProfile } from "@/lib/data/profile"
import {
  getCycleLogsForHistory,
  getCycleProfile,
  getRecentCheckinsForHistory,
  getRecipePlanCatalog,
  getWorkoutPlanCatalog,
} from "@/lib/data/shared-sources"
import {
  buildWeekPlan,
  type WeekDayPlan,
  type WeekPlanRecipe,
  type WeekPlanWorkout,
  type MealSlot,
} from "@/lib/recommendations/week-plan"
import { resolveTodaysTraining } from "@/lib/recommendations/engine"
import { filterRecipesForNutritionPrefs } from "@/lib/nutrition/dislikes"
import { filterRecipesByCuisinePrefs } from "@/lib/nutrition/cuisine"
import { computeCycleHistory, getEffectiveLastPeriodStart, withActivePeriod } from "@/lib/cycle/history"
import { computePhaseSymptomInsights } from "@/lib/cycle/patterns"
import { composeAnticipation } from "@/lib/cycle/anticipation"
import { loggedMenstruationDateSet } from "@/lib/cycle/presented-estimate"
import type { Tables } from "@/types/database"

export type CompletedWorkoutInfo = {
  workoutId: string
  title: string
  duration: number
  type: string
  imageUrl: string | null
}

export interface WeekPlanContext {
  userId: string
  weekStart: Date
  weekStartISO: string
  profile: Tables<"profiles">
  /** For UI sync with Vandaag menstruatie · dag N while Bezig. */
  activePeriodStart: string | null
  days: WeekDayPlan[]
  workouts: WeekPlanWorkout[]
  recipes: WeekPlanRecipe[]
  recipePoolBySlot: Record<MealSlot, WeekPlanRecipe[]>
  /** Completed workouts keyed by date (yyyy-MM-dd) — shared with Vandaag. */
  completedWorkoutsByDate: Record<string, CompletedWorkoutInfo>
}

/**
 * Shared loader for Deze week + Boodschappen + Vandaag so all surfaces
 * resolve the same plan from one query set (React cache() dedupes).
 */
export const loadWeekPlanContext = cache(async (userId: string): Promise<WeekPlanContext | null> => {
  const supabase = await createClient()
  // Calendar day in Europe/Amsterdam — not the UTC server clock.
  const today = todayDate()
  const todayISO = amsterdamTodayISO()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekStartISO = format(weekStart, "yyyy-MM-dd")

  const [
    profile,
    cycleProfile,
    workouts,
    recipes,
    cycleLogs,
    recentCheckins,
    { data: weekSessions },
  ] = await Promise.all([
    getProfile(userId),
    getCycleProfile(userId),
    getWorkoutPlanCatalog(),
    getRecipePlanCatalog(),
    getCycleLogsForHistory(userId),
    getRecentCheckinsForHistory(userId),
    supabase
      .from("workout_sessions")
      .select("date, workout_id, created_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("date", weekStartISO)
      .lte("date", todayISO)
      .order("created_at", { ascending: false }),
  ])

  if (!profile) return null

  const logsWithActive = withActivePeriod(
    cycleLogs.map((l) => ({
      date: l.date,
      menstruation: l.menstruation,
      symptoms: l.symptoms,
    })),
    cycleProfile?.active_period_start ?? null,
    todayISO,
  )
  const cycleHistory = computeCycleHistory(logsWithActive)
  const loggedMenstruationDates = loggedMenstruationDateSet(logsWithActive)
  const effectiveLastStart = cycleProfile
    ? getEffectiveLastPeriodStart(cycleProfile.last_period_start, cycleHistory)
    : null
  const effectiveCycleProfile = cycleProfile
    ? {
        ...cycleProfile,
        last_period_start: effectiveLastStart,
      }
    : null

  const phaseInsights = computePhaseSymptomInsights(
    cycleHistory,
    recentCheckins.map((c) => ({ date: c.date, symptoms: c.symptoms ?? [] })),
  )
  const anticipation = composeAnticipation({
    lastPeriodStart: effectiveLastStart,
    averageCycleLength: cycleProfile?.average_cycle_length ?? null,
    averagePeriodLength: cycleProfile?.average_period_length ?? null,
    hasCycle: Boolean(cycleProfile?.has_cycle),
    phaseInsights,
  })

  const workoutRows = workouts as WeekPlanWorkout[]
  const workoutById = new Map(workoutRows.map((w) => [w.id, w]))
  const recipeRows = recipes as WeekPlanRecipe[]

  const completedWorkoutsByDate: Record<string, CompletedWorkoutInfo> = {}
  for (const session of weekSessions ?? []) {
    if (completedWorkoutsByDate[session.date]) continue // newest first
    const workout = workoutById.get(session.workout_id)
    if (!workout) continue
    completedWorkoutsByDate[session.date] = {
      workoutId: workout.id,
      title: workout.title,
      duration: workout.duration,
      type: workout.type,
      imageUrl: workout.image_url,
    }
  }

  const days = buildWeekPlan({
    weekStart,
    today,
    profile,
    cycleProfile: effectiveCycleProfile,
    workouts: workoutRows,
    recipes: recipeRows,
    seed: userId,
    anticipationSoftDates: anticipation?.softDates ?? [],
    anticipationTip: anticipation ? anticipation.body : null,
    lifeStage: cycleProfile?.life_stage ?? null,
    loggedMenstruationDates,
  })

  // Bend today's workout with check-in so Deze week matches Vandaag.
  const todayCheckin = recentCheckins.find((c) => c.date === todayISO) ?? null
  const todayIndex = days.findIndex((d) => d.isToday)
  if (todayIndex >= 0 && profile.movement_enabled !== false) {
    const day = days[todayIndex]
    const adapted = resolveTodaysTraining({
      profile,
      latestCheckin: todayCheckin
        ? {
            energy: todayCheckin.energy,
            mood: todayCheckin.mood,
            sleep: todayCheckin.sleep,
            stress: todayCheckin.stress,
            symptoms: todayCheckin.symptoms,
            needs: todayCheckin.needs,
          }
        : null,
      workouts: workoutRows,
      seed: `${userId}-${todayISO}`,
      lifeStage: cycleProfile?.life_stage ?? null,
      dayPlanWorkout: day.workout,
    })
    days[todayIndex] = {
      ...day,
      workout: {
        ...day.workout,
        workout: adapted.workout,
        reason: adapted.reason,
      },
    }
  }

  const availableRecipes = filterRecipesByCuisinePrefs(
    filterRecipesForNutritionPrefs(recipeRows, profile.food_allergies, profile.disliked_foods),
    profile.nutrition_preferences,
  )
  const recipePoolBySlot: Record<MealSlot, WeekPlanRecipe[]> = {
    ontbijt: availableRecipes.filter((r) => r.category.includes("Ontbijt")),
    lunch: availableRecipes.filter((r) => r.category.includes("Lunch")),
    diner: availableRecipes.filter((r) => r.category.includes("Diner")),
  }

  return {
    userId,
    weekStart,
    weekStartISO,
    profile,
    activePeriodStart: cycleProfile?.active_period_start ?? null,
    days,
    workouts: workoutRows,
    recipes: recipeRows,
    recipePoolBySlot,
    completedWorkoutsByDate,
  }
})
