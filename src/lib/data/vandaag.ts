import { cache } from "react"
import { differenceInCalendarDays, format, parseISO, startOfWeek, subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { todayISO as amsterdamTodayISO } from "@/lib/dates/amsterdam"
import {
  loggedMenstruationDateSet,
  resolvePresentedForDate,
} from "@/lib/cycle/presented-estimate"
import { computeCycleHistory, getEffectiveLastPeriodStart, withActivePeriod } from "@/lib/cycle/history"
import {
  computeCycleLengthTrend,
  computePhaseSymptomInsights,
} from "@/lib/cycle/patterns"
import { computeSymptomCoOccurrences } from "@/lib/cycle/co-occurrence"
import { composeBodyRecognition } from "@/lib/cycle/body-translator"
import { composeAnticipation } from "@/lib/cycle/anticipation"
import { composeTodayRoadmap } from "@/lib/cycle/today-roadmap"
import {
  computeWhatHelpedInsights,
  getWhatHelpedForToday,
} from "@/lib/cycle/what-helped"
import { buildRecommendation } from "@/lib/recommendations/engine"
import { computeStreak } from "@/lib/data/streak"
import { getMedicationDashboardItems } from "@/lib/data/medications"
import { getProfile } from "@/lib/data/profile"
import { loadWeekPlanContext } from "@/lib/data/week-plan-context"
import { getDailyTip, loadTips } from "@/lib/data/daily-tip"
import { getSavedMomentTexts } from "@/lib/data/moments"
import { pickMentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"
import { computeSleepDurationMinutes } from "@/lib/sleep/duration"
import { pickSleepObservation } from "@/lib/sleep/insights"
import { getPersonalSleepContext } from "@/lib/data/sleep"
import {
  getCycleLogsForHistory,
  getCycleProfile,
  getRecentCheckinsForHistory,
} from "@/lib/data/shared-sources"
import type { BuddyStyle } from "@/lib/buddy/styles"

/** Deduped per request — Vandaag (and any co-loader) only pays once. */
export const getVandaagData = cache(async function getVandaagData(userId: string) {
  const supabase = await createClient()
  const today = amsterdamTodayISO()
  const weekAgo = subDays(new Date(`${today}T12:00:00`), 6)
  const weekAgoISO = format(weekAgo, "yyyy-MM-dd")
  const ninetyDaysAgo = format(subDays(new Date(`${today}T12:00:00`), 90), "yyyy-MM-dd")
  const weekStartISO = format(startOfWeek(new Date(`${today}T12:00:00`), { weekStartsOn: 1 }), "yyyy-MM-dd")

  // Fire shared / ungated work immediately — do not wait on profile for these.
  // Week plan + history sources React-cache with Deze week when both run.
  const profilePromise = getProfile(userId)
  const weekCtxPromise = loadWeekPlanContext(userId)
  const tipsPromise = loadTips()
  const momentsPromise = getSavedMomentTexts(userId)
  const cycleProfilePromise = getCycleProfile(userId)
  const checkinPromise = supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle()
  const recentCheckinsPromise = getRecentCheckinsForHistory(userId)
  const cycleLogsPromise = getCycleLogsForHistory(userId)

  const profile = await profilePromise
  const movementEnabled = profile?.movement_enabled ?? true
  const nutritionEnabled = profile?.nutrition_enabled ?? true
  const sleepEnabled = profile?.sleep_tracking_enabled === true
  const medsEnabled = Boolean(profile?.show_medication_on_dashboard)
  const wantWeekPlan = movementEnabled || nutritionEnabled

  const [
    { data: checkin },
    weekCtx,
    recentCheckins,
    historySessions,
    cycleLogs,
    cycleProfile,
    medicationItems,
    { data: sleepEntry },
    personalSleepContext,
    ,
    savedTexts,
  ] = await Promise.all([
    checkinPromise,
    wantWeekPlan ? weekCtxPromise : Promise.resolve(null),
    recentCheckinsPromise,
    movementEnabled
      ? supabase
          .from("workout_sessions")
          .select("date, completed, workout_id, created_at")
          .eq("user_id", userId)
          .eq("completed", true)
          .gte("date", ninetyDaysAgo)
          .lte("date", today)
          .order("created_at", { ascending: false })
          .then((r) => r.data ?? [])
      : Promise.resolve(
          [] as { date: string; completed: boolean; workout_id: string; created_at: string }[],
        ),
    cycleLogsPromise,
    cycleProfilePromise,
    medsEnabled ? getMedicationDashboardItems(userId, today) : Promise.resolve([]),
    sleepEnabled
      ? supabase.from("sleep_entries").select("*").eq("user_id", userId).eq("date", today).maybeSingle()
      : Promise.resolve({ data: null }),
    sleepEnabled
      ? getPersonalSleepContext(userId, today)
      : Promise.resolve({ todaySleepDurationMinutes: null, personalSleepPattern: null }),
    tipsPromise,
    momentsPromise,
  ])

  const weekSessions = historySessions.filter((s) => s.date >= weekAgoISO)

  const workoutTypeById = new Map<string, string>()
  // Prefer types already loaded for the week plan; fill gaps for older sessions.
  for (const w of weekCtx?.workouts ?? []) {
    workoutTypeById.set(w.id, w.type)
  }
  const missingWorkoutIds = [
    ...new Set(
      historySessions
        .map((s) => s.workout_id)
        .filter((id): id is string => Boolean(id) && !workoutTypeById.has(id)),
    ),
  ]
  if (missingWorkoutIds.length) {
    const { data: workoutRows } = await supabase
      .from("workouts")
      .select("id, type")
      .in("id", missingWorkoutIds)
    for (const w of workoutRows ?? []) {
      workoutTypeById.set(w.id, w.type)
    }
  }

  const checkinsForPatterns = recentCheckins.map((c) => ({
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

  const todaySession = weekSessions.find((s) => s.date === today) ?? null
  const completedFromWeek = weekCtx?.completedWorkoutsByDate?.[today] ?? null
  const completedWorkoutMeta = !completedFromWeek && todaySession
    ? workouts.find((w) => w.id === todaySession.workout_id) ?? null
    : null
  const completedWorkout = completedFromWeek
    ? {
        workoutId: completedFromWeek.workoutId,
        title: completedFromWeek.title,
        duration: completedFromWeek.duration,
      }
    : completedWorkoutMeta
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
  const logsWithActive = withActivePeriod(
    cycleLogs.map((l) => ({ date: l.date, menstruation: l.menstruation, symptoms: l.symptoms })),
    activePeriodStart,
    today,
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

  // Same row as Deze week when the week plan loaded — never re-resolve differently.
  const presentedToday =
    todayPlan != null
      ? {
          estimate: todayPlan.cycleEstimate,
          predictedMenstruation: todayPlan.predictedMenstruation,
        }
      : resolvePresentedForDate(today, effectiveCycleProfile, loggedMenstruationDates)
  const dayCycleEstimate = presentedToday.estimate
  const predictedMenstruation = presentedToday.predictedMenstruation

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
        lifeStage: cycleProfile?.life_stage ?? null,
        hasCycle: cycleProfile?.has_cycle ?? null,
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
  // Diversify across activity types so she can switch e.g. from yoga to
  // wandelen/pilates — not only near-duplicates of today's suggestion.
  const workoutAlternatives = (() => {
    const pool = workouts.filter((w) => w.id !== suggestedId)
    const byType = new Map<string, typeof pool>()
    for (const w of pool) {
      const list = byType.get(w.type) ?? []
      if (list.length < 4) {
        list.push(w)
        byType.set(w.type, list)
      }
    }
    return Array.from(byType.values())
      .flat()
      .map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
        duration: w.duration,
        image_url: w.image_url,
      }))
  })()

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
  const anticipation = composeAnticipation({
    lastPeriodStart: effectiveLastStart,
    averageCycleLength: cycleProfile?.average_cycle_length ?? null,
    averagePeriodLength: cycleProfile?.average_period_length ?? null,
    hasCycle: Boolean(cycleProfile?.has_cycle),
    phaseInsights: allPhaseInsights,
  })

  const whatHelpedInsights = computeWhatHelpedInsights(
    recentCheckins.map((c) => ({
      date: c.date,
      needs: c.needs ?? null,
      energy: c.energy ?? null,
      mood: c.mood ?? null,
    })),
    historySessions.map((s) => ({
      date: s.date,
      workoutType: workoutTypeById.get(s.workout_id) ?? null,
    })),
  )
  const whatHelpedToday = getWhatHelpedForToday(whatHelpedInsights, checkin?.needs ?? [])

  // tipsPromise already resolved in Promise.all — getDailyTip hits React cache.
  const dailyTip = dayCycleEstimate
    ? await getDailyTip(today, {
        userId,
        goals: profile?.goals ?? [],
        recentSymptoms: checkin?.symptoms?.length
          ? checkin.symptoms
          : checkinsForPatterns.slice(0, 7).flatMap((c) => c.symptoms),
      })
    : null

  const hormoneRoadmap = dayCycleEstimate
    ? composeTodayRoadmap({
        phase: dayCycleEstimate.phase,
        phaseLabel: dayCycleEstimate.phaseLabel,
        seed: `${userId}-${today}-roadmap`,
        symptoms: checkin?.symptoms ?? [],
        needs: checkin?.needs ?? [],
        energy: checkin?.energy ?? null,
        stress: checkin?.stress ?? null,
        bodyRecognition,
        whatHelped: whatHelpedToday,
        dailyTip: dailyTip
          ? { title: dailyTip.title, short_explanation: dailyTip.short_explanation }
          : null,
        movementEnabled: profile?.movement_enabled ?? true,
        nutritionEnabled: profile?.nutrition_enabled ?? true,
        hasConcreteWorkout: Boolean(recommendation?.training.workout) || Boolean(completedWorkout),
      })
    : null

  return {
    profile,
    cycleProfile,
    checkin,
    cycleEstimate: dayCycleEstimate,
    predictedMenstruation,
    isMenstruationActive: activePeriodStart !== null,
    menstruationDay,
    recommendation,
    bodyRecognition,
    anticipation,
    hormoneRoadmap,
    whatHelped: whatHelpedToday,
    today,
    weekStartISO,
    streak,
    completedThisWeek: weekSessions.length,
    completedWorkout,
    workoutAlternatives,
    mealAlternativesBySlot,
    medicationItems,
    mentalWellbeingSuggestion,
    sleepEntry,
    sleepObservation,
    savedTexts: [...savedTexts],
    recipeImageById: Object.fromEntries(
      (weekCtx?.recipes ?? []).map((r) => [r.id, r.image_url ?? null]),
    ) as Record<string, string | null>,
  }
})
