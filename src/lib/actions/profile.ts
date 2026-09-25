"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export interface UpdateProfileInput {
  name: string
  age: number | null
  heightCm: number | null
  weightKg: number | null
  goalWeightKg: number | null
  goals: string[]
  healthConditions: string[]
  movementLimitations: string[]
  movementEnabled: boolean
  trainingPreferences: string[]
  nutritionEnabled: boolean
  nutritionStyle: string
  nutritionPreferences: string[]
  trainingFrequency: number | null
  trackFlowIntensity: boolean
  wellnessPreference: string | null
  motivation: string | null
  personalNote: string | null
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
      movement_enabled: input.movementEnabled,
      training_preferences: input.trainingPreferences,
      nutrition_enabled: input.nutritionEnabled,
      nutrition_style: input.nutritionStyle,
      nutrition_preferences: input.nutritionPreferences,
      training_frequency: input.trainingFrequency,
      track_flow_intensity: input.trackFlowIntensity,
      wellness_preference: input.wellnessPreference,
      motivation: input.motivation,
      personal_note: input.personalNote,
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
  revalidatePath("/training")
  revalidatePath("/voeding")
  revalidatePath("/cyclus")
  revalidatePath("/deze-week")
  return { success: true }
}

export async function updateAvatar(avatarUrl: string | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id)

  if (error) return { error: "Opslaan van je foto is niet gelukt." }

  revalidatePath("/profiel")
  revalidatePath("/vandaag")
  return { success: true }
}

/**
 * Permanently deletes the signed-in user's account and everything tied to
 * it (profile, check-ins, cycle data, favorites, chat history — all of it
 * cascades via foreign keys). Uses the service-role client because
 * `auth.admin.deleteUser` is a privileged operation no regular session can
 * perform on itself.
 */
export async function deleteAccount() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const service = createServiceClient()
  const { error } = await service.auth.admin.deleteUser(user.id)
  if (error) return { error: "Verwijderen van je account is niet gelukt. Probeer het later opnieuw." }

  await supabase.auth.signOut()
  redirect("/login")
}
