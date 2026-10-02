"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { planProfileCycleUpdate } from "@/lib/cycle/profile-cycle-sync"
import { profileIssueMessage, updateProfileSchema } from "@/lib/validations/profile"

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

export async function updateProfile(rawInput: UpdateProfileInput) {
  // Validate everything before the first write, so a bad value can never
  // leave the profile saved but the cycle settings rejected (half-saved).
  const parsed = updateProfileSchema.safeParse(rawInput, { error: profileIssueMessage })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Controleer je invoer." }
  }
  const input = parsed.data

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

  const { data: storedCycle } = await supabase
    .from("cycle_profiles")
    .select("last_period_start, active_period_start")
    .eq("user_id", user.id)
    .maybeSingle()

  const lastPeriodStart = input.hasCycle ? input.lastPeriodStart : null
  const plan = planProfileCycleUpdate(
    {
      hasCycle: input.hasCycle,
      lastPeriodStart,
      averagePeriodLength: input.averagePeriodLength,
    },
    storedCycle ?? null,
  )

  const { error: cycleError } = await supabase
    .from("cycle_profiles")
    .update({
      has_cycle: input.hasCycle,
      last_period_start: lastPeriodStart,
      average_cycle_length: input.hasCycle ? input.averageCycleLength : null,
      average_period_length: plan.averagePeriodLength,
      regularity: input.hasCycle ? input.regularity : null,
      life_stage: input.lifeStage,
      perimenopause_information: input.perimenopauseInfo,
      active_period_start: plan.activePeriodStart,
    })
    .eq("user_id", user.id)

  if (cycleError) return { error: "Opslaan van je cyclusinstellingen is niet gelukt." }

  if (plan.seedDates.length) {
    // Insert-if-missing: never flip a day she unmarked back on.
    const { error: logError } = await supabase.from("cycle_logs").upsert(
      plan.seedDates.map((date) => ({ user_id: user.id, date, menstruation: true })),
      { onConflict: "user_id,date", ignoreDuplicates: true },
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

  // Only her own file in the avatars bucket — never an arbitrary URL.
  const ownPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.id}/`
  if (avatarUrl !== null && (!avatarUrl.startsWith(ownPrefix) || avatarUrl.length > 500)) {
    return { error: "Opslaan van je foto is niet gelukt." }
  }

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

  // Storage files don't cascade with the account, so remove her profile
  // photo(s) first. Best effort: a storage hiccup must not block deletion.
  try {
    const { data: files } = await service.storage.from("avatars").list(user.id, { limit: 100 })
    if (files?.length) {
      await service.storage.from("avatars").remove(files.map((file) => `${user.id}/${file.name}`))
    }
  } catch {
    // ignore — account deletion below is what matters
  }

  const { error } = await service.auth.admin.deleteUser(user.id)
  if (error) return { error: "Verwijderen van je account is niet gelukt. Probeer het later opnieuw." }

  await supabase.auth.signOut()
  redirect("/login")
}
