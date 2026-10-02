"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates/amsterdam"

export async function fetchAlternativeExercise(muscleGroup: string | null, excludeId: string) {
  if (!muscleGroup) return null
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .eq("muscle_group", muscleGroup)
    .neq("id", excludeId)
    .limit(10)

  const candidates = data ?? []
  if (!candidates.length) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export async function completeWorkoutSession(workoutId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  // Idempotent: a double tap or a retried request must not log the same
  // workout twice today (there is no unique key on this table yet).
  const today = todayISO()
  const { data: existing } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("workout_id", workoutId)
    .eq("date", today)
    .eq("completed", true)
    .limit(1)
    .maybeSingle()

  const { error } = existing
    ? { error: null }
    : await supabase.from("workout_sessions").insert({
        user_id: user.id,
        workout_id: workoutId,
        date: today,
        completed: true,
      })

  if (error) return { error: "Opslaan van je training is niet gelukt." }

  revalidatePath("/training")
  revalidatePath("/vandaag")
  revalidatePath("/deze-week")
  revalidatePath("/profiel")
  return { success: true }
}

/** Undo today's completed session(s) — e.g. accidental finish. */
export async function undoTodaysWorkoutSession() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const today = todayISO()
  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("user_id", user.id)
    .eq("date", today)
    .eq("completed", true)

  if (error) return { error: "Ongedaan maken is niet gelukt." }

  revalidatePath("/training")
  revalidatePath("/vandaag")
  revalidatePath("/deze-week")
  revalidatePath("/profiel")
  return { success: true }
}

export async function toggleExerciseFavorite(exerciseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data: existing } = await supabase
    .from("exercise_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("exercise_id", exerciseId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from("exercise_favorites").delete().eq("id", existing.id)
    if (error) return { error: "Verwijderen is niet gelukt." }
    revalidatePath("/training")
    revalidatePath("/training/favorieten")
    revalidatePath("/favorieten")
    revalidatePath("/profiel")
    return { success: true, favorited: false }
  }

  const { error } = await supabase
    .from("exercise_favorites")
    .insert({ user_id: user.id, exercise_id: exerciseId })
  if (error) return { error: "Opslaan is niet gelukt." }

  revalidatePath("/training")
  revalidatePath("/training/favorieten")
  revalidatePath("/favorieten")
  revalidatePath("/profiel")
  return { success: true, favorited: true }
}
