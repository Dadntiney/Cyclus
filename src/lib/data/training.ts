import { createClient } from "@/lib/supabase/server"
import { startOfWeek, addDays, format } from "date-fns"

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

export async function getWeekSessions(userId: string) {
  const supabase = await createClient()
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => format(addDays(monday, i), "yyyy-MM-dd"))

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("date, completed, workout_id")
    .eq("user_id", userId)
    .gte("date", days[0])
    .lte("date", days[6])

  return days.map((date) => ({
    date,
    sessions: (sessions ?? []).filter((s) => s.date === date),
  }))
}
