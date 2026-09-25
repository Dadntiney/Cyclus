import { subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { estimateCycle } from "@/lib/cycle/estimate"
import { buildRecommendation } from "@/lib/recommendations/engine"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** Consecutive days (counting back from today) with a saved check-in. */
function computeStreak(checkinDates: string[], today: string): number {
  const dates = new Set(checkinDates)
  let streak = 0
  let cursor = new Date(today)
  // If today isn't checked in yet, that's fine — the streak still counts
  // up through yesterday so it doesn't flicker to 0 while the day is young.
  if (!dates.has(today)) {
    cursor = subDays(cursor, 1)
  }
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }
  return streak
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
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("daily_checkins").select("*").eq("user_id", userId).eq("date", today).maybeSingle(),
    supabase.from("workouts").select("*"),
    supabase.from("recipes").select("*"),
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
  }
}
