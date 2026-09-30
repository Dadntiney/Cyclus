import { cache } from "react"
import { Sprout, Footprints, Dumbbell, Flame, Trophy, Zap, Star, Crown, Heart } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates/amsterdam"
import { computeStreak } from "@/lib/data/streak"
import { getFavoriteRecipes } from "@/lib/data/nutrition"
import { getFavoriteExercises } from "@/lib/data/training"

// The layout and whichever page it wraps both need her profile row on
// nearly every navigation; without this every request paid for that
// select twice. React's cache() dedupes it to one query per request, the
// same pattern getAuthedUser already uses for the auth round-trip.
export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
  return data
})

export interface Milestone {
  id: string
  icon: LucideIcon
  label: string
}

/** Longest run of consecutive calendar days in a (possibly unordered) date list. */
function longestStreak(dates: string[]): number {
  if (!dates.length) return 0
  const sorted = [...new Set(dates)].sort()
  let longest = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const diffDays = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86_400_000,
    )
    current = diffDays === 1 ? current + 1 : 1
    longest = Math.max(longest, current)
  }
  return longest
}

function buildMilestones(stats: {
  totalCheckins: number
  totalWorkoutsCompleted: number
  bestStreak: number
  favoriteCount: number
}): Milestone[] {
  const milestones: Milestone[] = []

  if (stats.totalCheckins >= 1) milestones.push({ id: "first-checkin", icon: Sprout, label: "Je eerste check-in" })
  if (stats.totalWorkoutsCompleted >= 1) milestones.push({ id: "first-workout", icon: Footprints, label: "Eerste keer voor jezelf bewogen" })
  if (stats.totalWorkoutsCompleted >= 5) milestones.push({ id: "5-workouts", icon: Dumbbell, label: "5 trainingen voor jezelf gedaan" })
  if (stats.totalWorkoutsCompleted >= 10) milestones.push({ id: "10-workouts", icon: Flame, label: "10 trainingen voor jezelf gedaan" })
  if (stats.totalWorkoutsCompleted >= 25) milestones.push({ id: "25-workouts", icon: Trophy, label: "25 trainingen — dit heb je zelf opgebouwd" })
  if (stats.bestStreak >= 3) milestones.push({ id: "streak-3", icon: Zap, label: "3 dagen bij jezelf geweest" })
  if (stats.bestStreak >= 7) milestones.push({ id: "streak-7", icon: Star, label: "Een week lang even bij jezelf" })
  if (stats.bestStreak >= 30) milestones.push({ id: "streak-30", icon: Crown, label: "30 dagen bij jezelf — knap volgehouden" })
  if (stats.favoriteCount >= 1) milestones.push({ id: "first-favorite", icon: Heart, label: "Je eerste favoriet opgeslagen" })

  return milestones
}

export async function getProfileOverview(userId: string) {
  const supabase = await createClient()
  const today = todayISO()

  const [
    { data: profile },
    { data: cycleProfile },
    { data: checkinDates },
    { data: workoutSessions },
    favoriteRecipes,
    favoriteExercises,
    { count: medicationCount },
  ] = await Promise.all([
    getProfile(userId).then((data) => ({ data })),
    supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("daily_checkins").select("date").eq("user_id", userId),
    supabase.from("workout_sessions").select("date").eq("user_id", userId).eq("completed", true),
    getFavoriteRecipes(userId),
    getFavoriteExercises(userId),
    supabase.from("medications").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ])

  const dates = (checkinDates ?? []).map((c) => c.date)
  const totalCheckins = dates.length
  const totalWorkoutsCompleted = (workoutSessions ?? []).length
  const currentStreak = computeStreak(dates, today)
  const bestStreak = Math.max(currentStreak, longestStreak(dates))

  const milestones = buildMilestones({
    totalCheckins,
    totalWorkoutsCompleted,
    bestStreak,
    favoriteCount: favoriteRecipes.length + favoriteExercises.length,
  })

  return {
    profile,
    cycleProfile,
    hasMedications: (medicationCount ?? 0) > 0,
    stats: {
      memberSince: profile?.created_at ?? null,
      totalCheckins,
      totalWorkoutsCompleted,
      currentStreak,
      bestStreak,
    },
    favoriteRecipes,
    favoriteExercises,
    milestones,
  }
}
