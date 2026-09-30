import { cache } from "react"
import { differenceInCalendarDays, format, parseISO, startOfWeek, subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { todayISO as amsterdamTodayISO } from "@/lib/dates/amsterdam"
import { estimateCycle } from "@/lib/cycle/estimate"
import { computeCycleHistory, getEffectiveLastPeriodStart, withActivePeriod } from "@/lib/cycle/history"
import {
  computeCycleLengthTrend,
  computePhaseSymptomInsights,
} from "@/lib/cycle/patterns"
import { computeSymptomCoOccurrences } from "@/lib/cycle/co-occurrence"
import { composeBodyRecognition } from "@/lib/cycle/body-translator"
import { composeAnticipation } from "@/lib/cycle/anticipation"
import { buildRecommendation } from "@/lib/recommendations/engine"
import { computeStreak } from "@/lib/data/streak"
import { getMedicationDashboardItems } from "@/lib/data/medications"
import { getProfile } from "@/lib/data/profile"
import { loadWeekPlanContext } from "@/lib/data/week-plan-context"
import { pickMentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"
import { computeSleepDurationMinutes } from "@/lib/sleep/duration"
import { pickSleepObservation } from "@/lib/sleep/insights"
import { getPersonalSleepContext } from "@/lib/data/sleep"
import type { BuddyStyle } from "@/lib/buddy/styles"

/** Deduped per request — Vandaag (and any co-loader) only pays once. */
export const getVandaagData = cache(async function getVandaagData(userId: string) {
  const supabase = await createClient()
  const today = amsterdamTodayISO()
  const weekAgo = subDays(new Date(`${today}T12:00:00`), 6)
  const weekAgoISO = format(weekAgo, "yyyy-MM-dd")
  const sixMonthsAgo = format(subDays(new Date(`${today}T12:00:00`), 200), "yyyy-MM-dd")
  const weekStartISO = format(startOfWeek(new Date(`${today}T12:00:00`), { weekStartsOn: 1 }), "yyyy-MM-dd")

  // Profile is React-cached from the app layout — usually a cache hit, then
  // we skip whole optional datasets (workouts, recipes, meds, sleep history).
  const profile = await getProfile(userId)
  const movementEnabled = profile?.movement_enabled ?? true
  const nutritionEnabled = profile?.nutrition_enabled ?? true
  const sleepEnabled = profile?.sleep_tracking_enabled === true
  const medsEnabled = Boolean(profile?.show_medication_on_dashboard)

  // Week plan is the calendar source of truth for today's meals + workout —
  // same computation as Deze week (React-cached within the request).
  const weekCtxPromise =
    movementEnabled || nutritionEnabled ? loadWeekPlanContext(userId) : Promise.resolve(null)

  const [
    { data: cycleProfile },
    { data: checkin },
    weekCtx,
    { data: recentCheckins },
    { data: weekSessions },
    { data: cycleLogs },
    medicationItems,
    { data: sleepEntry },
    personalSleepContext,
  ] = await Promise.all([
    supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("daily_checkins").select("*").eq("user_id", userId).eq("date", today).maybeSingle(),
    weekCtxPromise,
    supabase
      .from("daily_checkins")
      .select("date, symptoms")
      .eq("user_id", userId)
      .gte("date", sixMonthsAgo)
      .lte("date", today),
    movementEnabled
      ? supabase
          .from("workout_sessions")
          .select("date, completed, workout_id")
          .eq("user_id", userId)
          .eq("completed", true)
          .gte("date", weekAgoISO)
          .lte("date", today)
      : Promise.resolve({ data: [] }),
    supabase
      .from("cycle_logs")
      .select("date, menstruation, symptoms")
      .eq("user_id", userId)
      .gte("date", sixMonthsAgo)
      .order("date", { ascending: true }),
    medsEnabled ? getMedicationDashboardItems(userId, today) : Promise.resolve([]),
    sleepEnabled
      ? supabase.from("sleep_entries").select("*").eq("user_id", userId).eq("date", today).maybeSingle()
      : Promise.resolve({ data: null }),
    sleepEnabled
      ? getPersonalSleepContext(userId, today)
      : Promise.resolve({ todaySleepDurationMinutes: null, personalSleepPattern: null }),
  ])

  const checkinsForPatterns = (recentCheckins ?? []).map((c) => ({
    date: c.date,
    symptoms: c.symptoms ?? [],
  }))
  const streak = computeStreak(
    checkinsForPatterns.filter((c) => c.date >= weekAgoISO).map((c) => c.date),
    today,
  )

  const todayPlan = weekCtx?.days.find((d) => d.date === today) ?? weekCtx?.days.find((d) => d.isToday) ?? null
  const workouts = weekCtx?.workouts ?? []
  const recipes = (weekCtx?.recipes ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    preparation_time: r.preparation_time,
    nutrition_information: r.nutrition_information,
    image_url: r.image_url,
  }))

  const todaySession = (weekSessions ?? []).find((s) => s.date === today) ?? null
  const completedWorkoutMeta = todaySession
    ? workouts.find((w) => w.id === todaySession.workout_id) ?? null
    : null
  const completedWorkout = completedWorkoutMeta
    ? {
        workoutId: completedWorkoutMeta.id,
        title: completedWorkoutMeta.title,
        duration: completedWorkoutMeta.duration,
      }
    : null

  const sleepDurationMinutes =
    sleepEntry?.bedtime && sleepEntry?.wake_time
      ? computeSleepDurationMinutes(sleepEntry.bedtime, sleepEntry.wake_time)
      : null

  const personalSleepPattern = sleepEnabled ? personalSleepContext.personalSleepPattern : null

  const activePeriodStart = cycleProfile?.active_period_start ?? null
  const cycleHistory = computeCycleHistory(
    withActivePeriod(
      (cycleLogs ?? []).map((l) => ({ date: l.date, menstruation: l.menstruation, symptoms: l.symptoms })),
      activePeriodStart,
      today,
    ),
  )
  const cycleEstimate = cycleProfile
    ? estimateCycle(
        getEffectiveLastPeriodStart(cycleProfile.last_period_start, cycleHistory),
        cycleProfile.average_cycle_length,
        cycleProfile.has_cycle,
      )
    : null
  // Prefer the week-plan estimate for today when present — same phase as Deze week.
  const dayCycleEstimate = todayPlan?.cycleEstimate ?? cycleEstimate

  const menstruationDay = activePeriodStart
    ? differenceInCalendarDays(parseISO(today), parseISO(activePeriodStart)) + 1
    : null

  const recommendation = profile
    ? buildRecommendation({
        profile,
        cycleEstimate: dayCycleEstimate,
        latestCheckin: checkin ?? null,
        todaySleepDurationMinutes: sleepDurationMinutes,
        personalSleepPattern,
        workouts,
        recipes,
        seed: `${userId}-${today}`,
        dayPlan: todayPlan
          ? {
              meals: todayPlan.meals.map((m) => ({
                slot: m.slot,
                label: m.label,
                recipe: m.recipe
                  ? {
                      id: m.recipe.id,
                      title: m.recipe.title,
                      category: m.recipe.category,
                      preparation_time: m.recipe.preparation_time,
                      nutrition_information: m.recipe.nutrition_information,
                      image_url: m.recipe.image_url,
                    }
                  : null,
              })),
              workout: {
                workout: todayPlan.workout.workout,
                reason: todayPlan.workout.reason,
              },
            }
          : null,
      })
    : null

  const mentalWellbeingSuggestion =
    profile?.mental_wellbeing_enabled === true
      ? pickMentalWellbeingSuggestion({
          symptoms: checkin?.symptoms ?? [],
          mood: checkin?.mood ?? null,
          seed: `${userId}-${today}-mentale-rust`,
          preferredStyles: (profile.buddy_styles ?? []) as BuddyStyle[],
        })
      : null

  const sleepObservation = sleepEnabled
    ? pickSleepObservation({
        durationMinutes: sleepDurationMinutes,
        wakeFeeling: sleepEntry?.wake_feeling ?? null,
        energy: checkin?.energy ?? null,
      })
    : null

  const suggestedId = recommendation?.training.workout?.id ?? null
  const workoutAlternatives = workouts
    .filter((w) => w.id !== suggestedId)
    .slice(0, 6)
    .map((w) => ({
      id: w.id,
      title: w.title,
      type: w.type,
      duration: w.duration,
      image_url: w.image_url,
    }))

  const mealAlternativesBySlot = {
    ontbijt: (weekCtx?.recipePoolBySlot.ontbijt ?? [])
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        title: r.title,
        image_url: r.image_url,
        preparation_time: r.preparation_time,
      })),
    lunch: (weekCtx?.recipePoolBySlot.lunch ?? [])
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        title: r.title,
        image_url: r.image_url,
        preparation_time: r.preparation_time,
      })),
    diner: (weekCtx?.recipePoolBySlot.diner ?? [])
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        title: r.title,
        image_url: r.image_url,
        preparation_time: r.preparation_time,
      })),
  }

  const allPhaseInsights = computePhaseSymptomInsights(cycleHistory, checkinsForPatterns)
  const phaseInsightsForToday = dayCycleEstimate
    ? allPhaseInsights.filter((insight) => insight.phase === dayCycleEstimate.phase)
    : []
  const phaseInsight = phaseInsightsForToday[0] ?? null
  const bodyRecognition = composeBodyRecognition({
    phase: dayCycleEstimate?.phase ?? null,
    phaseLabel: dayCycleEstimate?.phaseLabel ?? null,
    phaseInsight,
    phaseInsights: phaseInsightsForToday,
    cycleLengthTrend: computeCycleLengthTrend(cycleHistory),
    coOccurrences: computeSymptomCoOccurrences(checkinsForPatterns),
    todaySymptoms: checkin?.symptoms ?? [],
  })
  const effectiveLastStart = cycleProfile
    ? getEffectiveLastPeriodStart(cycleProfile.last_period_start, cycleHistory)
    : null
  const anticipation = composeAnticipation({
    lastPeriodStart: effectiveLastStart,
    averageCycleLength: cycleProfile?.average_cycle_length ?? null,
    hasCycle: Boolean(cycleProfile?.has_cycle),
    phaseInsights: allPhaseInsights,
  })

  return {
    profile,
    cycleProfile,
    checkin,
    cycleEstimate: dayCycleEstimate,
    isMenstruationActive: activePeriodStart !== null,
    menstruationDay,
    recommendation,
    bodyRecognition,
    anticipation,
    today,
    weekStartISO,
    streak,
    completedThisWeek: (weekSessions ?? []).length,
    completedWorkout,
    workoutAlternatives,
    mealAlternativesBySlot,
    medicationItems,
    mentalWellbeingSuggestion,
    sleepEntry,
    sleepObservation,
    recipeImageById: Object.fromEntries(
      (weekCtx?.recipes ?? []).map((r) => [r.id, r.image_url ?? null]),
    ) as Record<string, string | null>,
  }
})
