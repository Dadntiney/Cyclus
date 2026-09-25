"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export async function fetchAlternativeExercise(muscleGroup: string | null, excludeId: string) {
  if (!muscleGroup) return null
  const supabase = await createClient()
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

  const { error } = await supabase.from("workout_sessions").insert({
    user_id: user.id,
    workout_id: workoutId,
    date: todayISO(),
    completed: true,
  })

  if (error) return { error: "Opslaan van je training is niet gelukt." }

  revalidatePath("/training")
  revalidatePath("/vandaag")
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
    revalidatePath("/profiel")
    return { success: true, favorited: false }
  }

  const { error } = await supabase
    .from("exercise_favorites")
    .insert({ user_id: user.id, exercise_id: exerciseId })
  if (error) return { error: "Opslaan is niet gelukt." }

  revalidatePath("/training")
  revalidatePath("/profiel")
  return { success: true, favorited: true }
}
