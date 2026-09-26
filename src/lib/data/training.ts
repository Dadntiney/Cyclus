import { createClient } from "@/lib/supabase/server"

export async function getWorkoutLibrary() {
  const supabase = await createClient()
  const { data } = await supabase.from("workouts").select("*").order("title")
  return data ?? []
}

export async function getWorkoutDetail(workoutId: string) {
  const supabase = await createClient()
  const [{ data: workout }, { data: exercises }] = await Promise.all([
    supabase.from("workouts").select("*").eq("id", workoutId).single(),
    supabase
      .from("exercises")
      .select("*")
      .eq("workout_id", workoutId)
      .order("order_index"),
  ])
  return { workout, exercises: exercises ?? [] }
}

export async function getFavoriteExerciseIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("exercise_favorites")
    .select("exercise_id")
    .eq("user_id", userId)
  return new Set((data ?? []).map((f) => f.exercise_id))
}
