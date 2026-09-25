"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { medicationSchema, type MedicationInput } from "@/lib/validations/medication"

function toRow(data: MedicationInput) {
  return {
    category: data.category,
    name: data.name.trim(),
    hormone_type: data.hormoneType?.trim() || null,
    form: data.form?.trim() || null,
    dosage: data.dosage?.trim() || null,
    schedule_type: data.scheduleType,
    schedule_days: data.scheduleType === "wekelijkse_dagen" ? (data.scheduleDays ?? null) : null,
    schedule_days_on: data.scheduleType === "cyclisch" ? (data.scheduleDaysOn ?? null) : null,
    schedule_days_off: data.scheduleType === "cyclisch" ? (data.scheduleDaysOff ?? null) : null,
    start_date: data.startDate || null,
    end_date: data.endDate || null,
    time_of_day: data.timeOfDay || null,
    reminder_enabled: data.reminderEnabled,
    notes: data.notes?.trim() || null,
  }
}

function revalidateMedicationPaths() {
  revalidatePath("/medicatie")
  revalidatePath("/vandaag")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/profiel")
}

export async function createMedication(input: MedicationInput) {
  const parsed = medicationSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data, error } = await supabase
    .from("medications")
    .insert({ user_id: user.id, ...toRow(parsed.data) })
    .select()
    .single()

  if (error) return { error: "Opslaan is niet gelukt." }

  revalidateMedicationPaths()
  return { success: true, medication: data }
}

export async function updateMedication(id: string, input: MedicationInput) {
  const parsed = medicationSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("medications")
    .update(toRow(parsed.data))
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Bijwerken is niet gelukt." }

  revalidateMedicationPaths()
  return { success: true }
}

export async function deleteMedication(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase.from("medications").delete().eq("id", id).eq("user_id", user.id)

  if (error) return { error: "Verwijderen is niet gelukt." }

  revalidateMedicationPaths()
  return { success: true }
}

/** Toggles whether today's (or a given date's) dose was marked as taken. */
export async function toggleMedicationTaken(medicationId: string, date: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data: existing } = await supabase
    .from("medication_logs")
    .select("id, taken")
    .eq("medication_id", medicationId)
    .eq("date", date)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("medication_logs")
      .update({ taken: !existing.taken })
      .eq("id", existing.id)
    if (error) return { error: "Bijwerken is niet gelukt." }
  } else {
    const { error } = await supabase
      .from("medication_logs")
      .insert({ user_id: user.id, medication_id: medicationId, date, taken: true })
    if (error) return { error: "Opslaan is niet gelukt." }
  }

  revalidatePath("/vandaag")
  revalidatePath("/cyclus/vandaag")
  return { success: true }
}
