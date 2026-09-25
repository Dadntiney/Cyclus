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
  return { success: true }
}
