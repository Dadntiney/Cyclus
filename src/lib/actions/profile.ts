"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import {
  buildPeriodSeedDates,
  clampPeriodLength,
  isPeriodStillActive,
} from "@/lib/cycle/period-seed"

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
  dislikedFoods: string[]
  foodAllergies: string[]
  mentalWellbeingEnabled: boolean
  mentalWellbeingCategories: string[]
  morningReminderEnabled: boolean
  morningReminderTime: string
  morningReminderDays: number[]
  morningReminderContentTypes: string[]
  sleepTrackingEnabled: boolean
  trainingFrequency: number | null
  trackFlowIntensity: boolean
  wellnessPreference: string | null
  motivation: string | null
  personalNote: string | null
  hasCycle: boolean
  lastPeriodStart: string | null
  averageCycleLength: number | null
  averagePeriodLength: number | null
  regularity: string | null
  lifeStage: string | null
  perimenopauseInfo: string | null
  hormonalMedicationStatus: string | null
  showMedicationOnDashboard: boolean
  buddyStyles: string[]
  buddyMessageFrequency: string | null
}

const LIFE_STAGE_VALUES = new Set([
  "regelmatig",
  "veranderend",
  "perimenopauze",
  "menopauze",
  "onbekend",
])

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
      disliked_foods: input.dislikedFoods,
      food_allergies: input.foodAllergies,
      mental_wellbeing_enabled: input.mentalWellbeingEnabled,
      mental_wellbeing_categories: input.mentalWellbeingCategories,
      morning_reminder_enabled: input.morningReminderEnabled,
      morning_reminder_time: input.morningReminderTime,
      morning_reminder_days: input.morningReminderDays,
      morning_reminder_content_types: input.morningReminderContentTypes,
      sleep_tracking_enabled: input.sleepTrackingEnabled,
      training_frequency: input.trainingFrequency,
      track_flow_intensity: input.trackFlowIntensity,
      wellness_preference: input.wellnessPreference,
      motivation: input.motivation,
      personal_note: input.personalNote,
      hormonal_medication_status: input.hormonalMedicationStatus,
      show_medication_on_dashboard: input.showMedicationOnDashboard,
      buddy_styles: input.buddyStyles,
      buddy_message_frequency: input.buddyMessageFrequency,
    })
    .eq("id", user.id)

  if (profileError) return { error: "Opslaan van je profiel is niet gelukt." }

  if (input.averageCycleLength !== null && (input.averageCycleLength < 15 || input.averageCycleLength > 60)) {
    return { error: "Vul een gemiddelde cyclusduur tussen 15 en 60 dagen in." }
  }

  const averagePeriodLength =
    input.hasCycle && input.lastPeriodStart
      ? clampPeriodLength(input.averagePeriodLength)
      : null

  if (
    input.averagePeriodLength !== null &&
    (input.averagePeriodLength < 2 || input.averagePeriodLength > 14)
  ) {
    return { error: "Vul een menstruatieduur tussen 2 en 14 dagen in." }
  }

  const lifeStage =
    input.lifeStage && LIFE_STAGE_VALUES.has(input.lifeStage) ? input.lifeStage : null

  const { data: existingCycle } = await supabase
    .from("cycle_profiles")
    .select("active_period_start")
    .eq("user_id", user.id)
    .maybeSingle()

  const periodOngoing =
    Boolean(input.hasCycle && input.lastPeriodStart && averagePeriodLength) &&
    isPeriodStillActive(input.lastPeriodStart!, averagePeriodLength!)

  // Mirror live Start when the profile-seeded bleed is still going; don't
  // overwrite a differently dated active period she started from Vandaag.
  let nextActivePeriodStart = existingCycle?.active_period_start ?? null
  if (periodOngoing && input.lastPeriodStart) {
    if (!nextActivePeriodStart || nextActivePeriodStart === input.lastPeriodStart) {
      nextActivePeriodStart = input.lastPeriodStart
    }
  } else if (
    nextActivePeriodStart &&
    input.lastPeriodStart &&
    nextActivePeriodStart === input.lastPeriodStart &&
    !periodOngoing
  ) {
    nextActivePeriodStart = null
  }

  const { error: cycleError } = await supabase
    .from("cycle_profiles")
    .update({
      has_cycle: input.hasCycle,
      last_period_start: input.lastPeriodStart,
      average_cycle_length: input.averageCycleLength,
      average_period_length: averagePeriodLength,
      regularity: input.regularity,
      life_stage: lifeStage,
      perimenopause_information: input.perimenopauseInfo,
      active_period_start: input.hasCycle ? nextActivePeriodStart : null,
    })
    .eq("user_id", user.id)

  if (cycleError) return { error: "Opslaan van je cyclusinstellingen is niet gelukt." }

  if (input.hasCycle && input.lastPeriodStart) {
    const seedDates = buildPeriodSeedDates(
      input.lastPeriodStart,
      averagePeriodLength ?? 5,
    )
    const { error: logError } = await supabase.from("cycle_logs").upsert(
      seedDates.map((date) => ({
        user_id: user.id,
        date,
        menstruation: true,
        symptoms: [],
      })),
      { onConflict: "user_id,date" },
    )
    if (logError) return { error: "Opslaan van je cyclusinstellingen is niet gelukt." }
  }

  revalidatePath("/profiel")
  revalidatePath("/vandaag")
  revalidatePath("/training")
  revalidatePath("/voeding")
  revalidatePath("/voeding/favorieten")
  revalidatePath("/cyclus")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/cyclus/overgang")
  revalidatePath("/deze-week")
  revalidatePath("/deze-week/boodschappen")
  revalidatePath("/medicatie")
  revalidatePath("/buddy")
  revalidatePath("/mentale-rust")
  revalidatePath("/slaap")
  return { success: true }
}

export type ThemePreference = "light" | "dark" | "auto"

/**
 * Persists the Dag/Nacht/Automatisch display setting (profiel → Weergave).
 * Applying it instantly and flash-free on the next load is handled outside
 * this action: the client sets the `data-theme` attribute directly for the
 * current session (see ThemeSection), and the root layout reads this same
 * column server-side on every request to render the right attribute from
 * the first byte — this call only needs to make the choice durable.
 */
export async function updateThemePreference(theme: ThemePreference) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("profiles")
    .update({ theme_preference: theme })
    .eq("id", user.id)

  if (error) return { error: "Opslaan van je weergave-instelling is niet gelukt." }

  // Keep root-layout theme paint free of a profile fetch.
  try {
    const { cookies } = await import("next/headers")
    const { THEME_COOKIE, themeCookieOptions } = await import("@/lib/theme/theme-cookie")
    const jar = await cookies()
    jar.set(THEME_COOKIE, theme, themeCookieOptions())
  } catch {
    // Cookie write can fail in some edge contexts — client applyTheme still sets it.
  }

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
