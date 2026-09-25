import { subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { estimateCycle } from "@/lib/cycle/estimate"
import { buildRecommendation } from "@/lib/recommendations/engine"
import { computeStreak } from "@/lib/data/streak"
import { getMedicationDashboardItems } from "@/lib/data/medications"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export async function getVandaagData(userId: string) {
  const supabase = await createClient()
  const today = todayISO()
  const weekAgo = subDays(new Date(today), 6).toISOString().slice(0, 10)

  const [
    { data: profile },
    { data: cycleProfile },
    { data: checkin },
    { data: workouts },
    { data: recipes },
    { data: recentCheckins },
    { data: weekSessions },
    medicationItems,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
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
    getMedicationDashboardItems(userId, today),
  ])

  const streak = computeStreak((recentCheckins ?? []).map((c) => c.date), today)
  const completedThisWeek = (weekSessions ?? []).length

  const cycleEstimate = cycleProfile
    ? estimateCycle(
        cycleProfile.last_period_start,
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
  }
}
