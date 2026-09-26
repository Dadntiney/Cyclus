import { subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { estimateCycle } from "@/lib/cycle/estimate"
import { computeCycleHistory, getEffectiveLastPeriodStart } from "@/lib/cycle/history"
import { buildRecommendation } from "@/lib/recommendations/engine"
import { computeStreak } from "@/lib/data/streak"
import { getMedicationDashboardItems } from "@/lib/data/medications"
import { getProfile } from "@/lib/data/profile"
import { pickMentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"
import { computeSleepDurationMinutes } from "@/lib/sleep/duration"
import { pickSleepObservation } from "@/lib/sleep/insights"
import type { BuddyStyle } from "@/lib/buddy/styles"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export async function getVandaagData(userId: string) {
  const supabase = await createClient()
  const today = todayISO()
  const weekAgo = subDays(new Date(today), 6).toISOString().slice(0, 10)
  const sixMonthsAgo = subDays(new Date(today), 200).toISOString().slice(0, 10)

  const [
    profile,
    { data: cycleProfile },
    { data: checkin },
    { data: workouts },
    { data: recipes },
    { data: recentCheckins },
    { data: weekSessions },
    { data: cycleLogs },
    medicationItems,
    { data: sleepEntry },
  ] = await Promise.all([
    getProfile(userId),
    supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("daily_checkins").select("*").eq("user_id", userId).eq("date", today).maybeSingle(),
    supabase.from("workouts").select("id, title, type, duration, difficulty"),
    supabase.from("recipes").select("id, title, category, preparation_time, nutrition_information"),
    supabase
      .from("daily_checkins")
      .select("date")
      .eq("user_id", userId)
      .gte("date", weekAgo)
      .lte("date", today),
    supabase
      .from("workout_sessions")
      .select("date, completed")
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("date", weekAgo)
      .lte("date", today),
    supabase
      .from("cycle_logs")
      .select("date, menstruation, symptoms")
      .eq("user_id", userId)
      .gte("date", sixMonthsAgo)
      .order("date", { ascending: true }),
    getMedicationDashboardItems(userId, today),
    supabase.from("sleep_entries").select("*").eq("user_id", userId).eq("date", today).maybeSingle(),
  ])

  const streak = computeStreak((recentCheckins ?? []).map((c) => c.date), today)
  const completedThisWeek = (weekSessions ?? []).length

  const cycleHistory = computeCycleHistory(
    (cycleLogs ?? []).map((l) => ({ date: l.date, menstruation: l.menstruation, symptoms: l.symptoms })),
  )
  const cycleEstimate = cycleProfile
    ? estimateCycle(
        getEffectiveLastPeriodStart(cycleProfile.last_period_start, cycleHistory),
        cycleProfile.average_cycle_length,
        cycleProfile.has_cycle,
      )
    : null

  const recommendation = profile
    ? buildRecommendation({
        profile,
        cycleEstimate,
        latestCheckin: checkin ?? null,
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

  // Only meaningful when she opted into sleep tracking — otherwise there's
  // no sleep_entries row to speak of, and no observation to show.
  const sleepDurationMinutes =
    sleepEntry?.bedtime && sleepEntry?.wake_time
      ? computeSleepDurationMinutes(sleepEntry.bedtime, sleepEntry.wake_time)
      : null
  const sleepObservation =
    profile?.sleep_tracking_enabled === true
      ? pickSleepObservation({
          durationMinutes: sleepDurationMinutes,
          wakeFeeling: sleepEntry?.wake_feeling ?? null,
          energy: checkin?.energy ?? null,
        })
      : null

  return {
    profile,
    cycleProfile,
    checkin,
    cycleEstimate,
    recommendation,
    today,
    streak,
    completedThisWeek,
    medicationItems,
    mentalWellbeingSuggestion,
    sleepEntry,
    sleepObservation,
  }
}
