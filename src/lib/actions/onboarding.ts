"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"

export async function completeOnboarding(input: OnboardingInput) {
  const parsed = onboardingSchema.safeParse(input)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ongeldige invoer.")
  }
  const data = parsed.data

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      age: data.age,
      goals: data.goals,
      training_preferences: data.trainingPreferences,
      nutrition_preferences: data.nutritionPreferences,
      training_frequency: data.trainingFrequency,
      wellness_preference: data.wellnessPreference,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (profileError) {
    throw new Error("Opslaan van je profiel is niet gelukt.")
  }

  const { error: cycleError } = await supabase.from("cycle_profiles").upsert(
    {
      user_id: user.id,
      has_cycle: data.hasCycle,
      last_period_start: data.hasCycle ? data.lastPeriodStart || null : null,
      average_cycle_length: data.hasCycle ? data.averageCycleLength ?? null : null,
      regularity: data.hasCycle ? data.regularity ?? null : null,
      perimenopause_information: data.perimenopauseInfo || null,
    },
    { onConflict: "user_id" },
  )

  if (cycleError) {
    throw new Error("Opslaan van je cyclusgegevens is niet gelukt.")
  }

  redirect("/vandaag")
}
