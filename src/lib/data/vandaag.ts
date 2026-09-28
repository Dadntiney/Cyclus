import { cache } from "react"
import { differenceInCalendarDays, parseISO, startOfWeek, subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { estimateCycle } from "@/lib/cycle/estimate"
import { computeCycleHistory, getEffectiveLastPeriodStart, withActivePeriod } from "@/lib/cycle/history"
import { buildRecommendation } from "@/lib/recommendations/engine"
import { computeStreak } from "@/lib/data/streak"
import { getMedicationDashboardItems } from "@/lib/data/medications"
import { getProfile } from "@/lib/data/profile"
import { pickMentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"
import { computeSleepDurationMinutes } from "@/lib/sleep/duration"
import { pickSleepObservation } from "@/lib/sleep/insights"
import { getPersonalSleepContext } from "@/lib/data/sleep"
import type { BuddyStyle } from "@/lib/buddy/styles"
import { todayISO } from "@/lib/dates"


/** Deduped per request — Vandaag (and any co-loader) only pays once. */
export const getVandaagData = cache(async function getVandaagData(userId: string) {
  const supabase = await createClient()
  const today = todayISO()
  const weekAgo = subDays(new Date(today), 6).toISOString().slice(0, 10)
  const sixMonthsAgo = subDays(new Date(today), 200).toISOString().slice(0, 10)

  // Profile is React-cached from the app layout — usually a cache hit, then
  // we skip whole optional datasets (workouts, recipes, meds, sleep history).
  const profile = await getProfile(userId)
  const movementEnabled = profile?.movement_enabled ?? true
  const nutritionEnabled = profile?.nutrition_enabled ?? true
  const sleepEnabled = profile?.sleep_tracking_enabled === true
  const medsEnabled = Boolean(profile?.show_medication_on_dashboard)

  const [
    { data: cycleProfile },
    { data: checkin },
    { data: workouts },
    { data: recipes },
    { data: recentCheckins },
    { data: weekSessions },
    { data: cycleLogs },
    medicationItems,
    { data: sleepEntry },
    personalSleepContext,
  ] = await Promise.all([
    supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("daily_checkins").select("*").eq("user_id", userId).eq("date", today).maybeSingle(),
    movementEnabled
      ? supabase.from("workouts").select("id, title, type, duration, difficulty, image_url")
      : Promise.resolve({ data: [] }),
    nutritionEnabled
      ? supabase
          .from("recipes")
          .select("id, title, category, preparation_time, nutrition_information, image_url, ingredients")
      : Promise.resolve({ data: [] }),
    supabase
      .from("daily_checkins")
      .select("date")
      .eq("user_id", userId)
      .gte("date", weekAgo)
      .lte("date", today),
    movementEnabled
      ? supabase
          .from("workout_sessions")
          .select("date, completed, workout_id")
          .eq("user_id", userId)
          .eq("completed", true)
          .gte("date", weekAgo)
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

  const streak = computeStreak((recentCheckins ?? []).map((c) => c.date), today)
  const completedThisWeek = (weekSessions ?? []).length
  const todaySession = (weekSessions ?? []).find((s) => s.date === today) ?? null
  const completedWorkoutMeta = todaySession
    ? (workouts ?? []).find((w) => w.id === todaySession.workout_id) ?? null
    : null
  const completedWorkout = completedWorkoutMeta
    ? {
        workoutId: completedWorkoutMeta.id,
        title: completedWorkoutMeta.title,
        duration: completedWorkoutMeta.duration,
      }
    : null
  const weekStartISO = startOfWeek(new Date(today), { weekStartsOn: 1 }).toISOString().slice(0, 10)

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
  // "Dag 2 van je menstruatie" on Vandaag's quick-action widget — the day
  // count within the CURRENT period specifically, computed directly from the
  // explicit active_period_start, not the whole-cycle estimate above.
  const menstruationDay = activePeriodStart
    ? differenceInCalendarDays(parseISO(today), parseISO(activePeriodStart)) + 1
    : null

  const recommendation = profile
    ? buildRecommendation({
        profile,
        cycleEstimate,
        latestCheckin: checkin ?? null,
        todaySleepDurationMinutes: sleepDurationMinutes,
        personalSleepPattern,
        workouts: workouts ?? [],
        recipes: recipes ?? [],
        seed: `${userId}-${today}`,
      })
    : null

  // Derived purely from her existing check-in (mood + the optional mental
  // symptom checkboxes) — never a second question. Only computed when she
  // opted in, and null on any day nothing relevant was reported, so the
  // Vandaag card simply doesn't render rather than showing something empty.
  const mentalWellbeingSuggestion =
    profile?.mental_wellbeing_enabled === true
      ? pickMentalWellbeingSuggestion({
          symptoms: checkin?.symptoms ?? [],
          mood: checkin?.mood ?? null,
          seed: `${userId}-${today}-mentale-rust`,
          preferredStyles: (profile.buddy_styles ?? []) as BuddyStyle[],
        })
      : null

  const sleepObservation =
    sleepEnabled
      ? pickSleepObservation({
          durationMinutes: sleepDurationMinutes,
          wakeFeeling: sleepEntry?.wake_feeling ?? null,
          energy: checkin?.energy ?? null,
        })
      : null

  const suggestedId = recommendation?.training.workout?.id ?? null
  const workoutAlternatives = (workouts ?? [])
    .filter((w) => w.id !== suggestedId)
    .slice(0, 6)
    .map((w) => ({
      id: w.id,
      title: w.title,
      type: w.type,
      duration: w.duration,
      image_url: w.image_url,
    }))

  return {
    profile,
    cycleProfile,
    checkin,
    cycleEstimate,
    isMenstruationActive: activePeriodStart !== null,
    menstruationDay,
    recommendation,
    today,
    weekStartISO,
    streak,
    completedThisWeek,
    completedWorkout,
    workoutAlternatives,
    medicationItems,
    mentalWellbeingSuggestion,
    sleepEntry,
    sleepObservation,
  }
})
