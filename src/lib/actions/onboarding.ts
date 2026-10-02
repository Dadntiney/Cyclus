"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import {
  buildPeriodSeedDates,
  clampPeriodLength,
  isPeriodStillActive,
} from "@/lib/cycle/period-seed"

/**
 * Returns `{ error }` instead of throwing: in production Next.js replaces a
 * thrown Server Action error with a generic English message, so a thrown
 * Dutch explanation would never reach her.
 */
export async function completeOnboarding(input: OnboardingInput): Promise<{ error: string } | void> {
  const parsed = onboardingSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer je antwoorden." }
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
      movement_enabled: data.movementEnabled,
      training_preferences: data.movementEnabled ? data.trainingPreferences : [],
      training_frequency: data.movementEnabled ? (data.trainingFrequency ?? null) : null,
      nutrition_enabled: data.nutritionEnabled,
      nutrition_preferences: data.nutritionEnabled ? data.nutritionPreferences : [],
      disliked_foods: data.nutritionEnabled ? data.dislikedFoods : [],
      food_allergies: data.nutritionEnabled ? data.foodAllergies : [],
      mental_wellbeing_enabled: data.mentalWellbeingEnabled ?? null,
      mental_wellbeing_categories: data.mentalWellbeingEnabled ? data.mentalWellbeingCategories : [],
      // Only set when she switched it on; otherwise leave the column default.
      ...(data.sleepTrackingEnabled ? { sleep_tracking_enabled: true } : {}),
      wellness_preference: data.wellnessPreference,
      height_cm: data.heightCm ?? null,
      weight_kg: data.weightKg ?? null,
      goal_weight_kg: data.goalWeightKg ?? null,
      health_conditions: data.healthConditions,
      movement_limitations: data.movementLimitations,
      nutrition_style: data.nutritionStyle,
      hormonal_medication_status: data.hormonalMedicationStatus || null,
      buddy_styles: data.buddyStyles,
      buddy_message_frequency: data.buddyMessageFrequency || null,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (profileError) {
    return { error: "Opslaan van je profiel is niet gelukt. Probeer het opnieuw." }
  }

  const averagePeriodLength = data.hasCycle
    ? clampPeriodLength(data.averagePeriodLength ?? undefined)
    : null
  const periodOngoing =
    Boolean(data.hasCycle && data.lastPeriodStart && averagePeriodLength) &&
    isPeriodStillActive(data.lastPeriodStart!, averagePeriodLength!)

  const { error: cycleError } = await supabase.from("cycle_profiles").upsert(
    {
      user_id: user.id,
      has_cycle: data.hasCycle,
      last_period_start: data.hasCycle ? data.lastPeriodStart || null : null,
      average_cycle_length: data.hasCycle ? data.averageCycleLength ?? null : null,
      average_period_length: averagePeriodLength,
      regularity: data.hasCycle ? data.regularity ?? null : null,
      perimenopause_information: data.perimenopauseInfo || null,
      active_period_start: periodOngoing ? data.lastPeriodStart! : null,
    },
    { onConflict: "user_id" },
  )

  if (cycleError) {
    return { error: "Opslaan van je cyclusgegevens is niet gelukt. Probeer het opnieuw." }
  }

  // Seed consecutive bleed days so history/duration match what she told us.
  if (data.hasCycle && data.lastPeriodStart) {
    const seedDates = buildPeriodSeedDates(data.lastPeriodStart, averagePeriodLength ?? 5)
    const { error: logError } = await supabase.from("cycle_logs").upsert(
      seedDates.map((date) => ({ user_id: user.id, date, menstruation: true })),
      { onConflict: "user_id,date", ignoreDuplicates: true },
    )
    if (logError) {
      return { error: "Opslaan van je cyclusgegevens is niet gelukt. Probeer het opnieuw." }
    }
  }

  redirect("/vandaag")
}
