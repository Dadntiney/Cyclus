"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface UpdateProfileInput {
  name: string
  age: number | null
  heightCm: number | null
  weightKg: number | null
  goalWeightKg: number | null
  goals: string[]
  healthConditions: string[]
  movementLimitations: string[]
  trainingPreferences: string[]
  nutritionStyle: string
  nutritionPreferences: string[]
  trainingFrequency: number | null
  wellnessPreference: string | null
  averageCycleLength: number | null
  regularity: string | null
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: input.name,
      age: input.age,
      height_cm: input.heightCm,
      weight_kg: input.weightKg,
      goal_weight_kg: input.goalWeightKg,
      goals: input.goals,
      health_conditions: input.healthConditions,
      movement_limitations: input.movementLimitations,
      training_preferences: input.trainingPreferences,
      nutrition_style: input.nutritionStyle,
      nutrition_preferences: input.nutritionPreferences,
      training_frequency: input.trainingFrequency,
      wellness_preference: input.wellnessPreference,
    })
    .eq("id", user.id)

  if (profileError) return { error: "Opslaan van je profiel is niet gelukt." }

  const { error: cycleError } = await supabase
    .from("cycle_profiles")
    .update({
      average_cycle_length: input.averageCycleLength,
      regularity: input.regularity,
    })
    .eq("user_id", user.id)

  if (cycleError) return { error: "Opslaan van je cyclusinstellingen is niet gelukt." }

  revalidatePath("/profiel")
  revalidatePath("/vandaag")
  return { success: true }
}
