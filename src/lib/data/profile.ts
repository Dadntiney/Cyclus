import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { computeStreak } from "@/lib/data/streak"
import { getFavoriteRecipes } from "@/lib/data/nutrition"

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
  emoji: string
  label: string
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
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

  if (stats.totalCheckins >= 1) milestones.push({ id: "first-checkin", emoji: "🌱", label: "Je eerste check-in" })
  if (stats.totalWorkoutsCompleted >= 1) milestones.push({ id: "first-workout", emoji: "🏋️", label: "Je eerste training afgerond" })
  if (stats.totalWorkoutsCompleted >= 5) milestones.push({ id: "5-workouts", emoji: "✨", label: "5 trainingen voor jezelf gedaan" })
  if (stats.totalWorkoutsCompleted >= 10) milestones.push({ id: "10-workouts", emoji: "💪", label: "10 trainingen voor jezelf gedaan" })
  if (stats.totalWorkoutsCompleted >= 25) milestones.push({ id: "25-workouts", emoji: "🏆", label: "25 trainingen — dit heb je zelf opgebouwd" })
  if (stats.bestStreak >= 3) milestones.push({ id: "streak-3", emoji: "🔥", label: "3 dagen op rij ingecheckt" })
  if (stats.bestStreak >= 7) milestones.push({ id: "streak-7", emoji: "🔥", label: "Een hele week op rij ingecheckt" })
  if (stats.bestStreak >= 30) milestones.push({ id: "streak-30", emoji: "🌟", label: "30 dagen op rij — knap volgehouden" })
  if (stats.favoriteCount >= 1) milestones.push({ id: "first-favorite", emoji: "❤️", label: "Je eerste favoriet opgeslagen" })

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
    { data: exerciseFavoriteRows },
    { count: medicationCount },
  ] = await Promise.all([
    getProfile(userId).then((data) => ({ data })),
    supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("daily_checkins").select("date").eq("user_id", userId),
    supabase.from("workout_sessions").select("date").eq("user_id", userId).eq("completed", true),
    getFavoriteRecipes(userId),
    supabase
      .from("exercise_favorites")
      .select("exercise_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("medications").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ])

  const dates = (checkinDates ?? []).map((c) => c.date)
  const totalCheckins = dates.length
  const totalWorkoutsCompleted = (workoutSessions ?? []).length
  const currentStreak = computeStreak(dates, today)
  const bestStreak = Math.max(currentStreak, longestStreak(dates))

  const favoriteExerciseIds = (exerciseFavoriteRows ?? []).map((f) => f.exercise_id)
  let favoriteExercises: { id: string; name: string; muscle_group: string | null; workout_id: string }[] = []
  if (favoriteExerciseIds.length) {
    const { data: exercises } = await supabase
      .from("exercises")
      .select("id, name, muscle_group, workout_id")
      .in("id", favoriteExerciseIds)
    const byId = new Map((exercises ?? []).map((e) => [e.id, e]))
    favoriteExercises = favoriteExerciseIds
      .map((id) => byId.get(id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
  }

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
