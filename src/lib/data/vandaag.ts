import { createClient } from "@/lib/supabase/server"
import { estimateCycle } from "@/lib/cycle/estimate"
import { buildRecommendation } from "@/lib/recommendations/engine"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export async function getVandaagData(userId: string) {
  const supabase = await createClient()
  const today = todayISO()

  const [{ data: profile }, { data: cycleProfile }, { data: checkin }, { data: workouts }, { data: recipes }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("daily_checkins").select("*").eq("user_id", userId).eq("date", today).maybeSingle(),
      supabase.from("workouts").select("*"),
      supabase.from("recipes").select("*"),
    ])

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
  }
}
