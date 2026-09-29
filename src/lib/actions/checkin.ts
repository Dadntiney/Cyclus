"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates"
import { checkinSchema, type CheckinInput } from "@/lib/validations/checkin"

function cleanSymptomDetails(
  symptoms: string[],
  details: CheckinInput["symptomDetails"],
): Record<string, { severity?: number; count?: number }> {
  const allowed = new Set(symptoms.filter((s) => s !== "Geen klachten" && s !== "Anders"))
  const cleaned: Record<string, { severity?: number; count?: number }> = {}
  for (const [key, value] of Object.entries(details ?? {})) {
    if (!allowed.has(key)) continue
    const entry: { severity?: number; count?: number } = {}
    if (value.severity) entry.severity = value.severity
    if (value.count) entry.count = value.count
    if (entry.severity || entry.count) cleaned[key] = entry
  }
  return cleaned
}

export async function saveCheckin(input: CheckinInput) {
  const parsed = checkinSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Je bent niet ingelogd." }
  }

  const symptoms = parsed.data.symptoms
  const symptomDetails = cleanSymptomDetails(symptoms, parsed.data.symptomDetails)

  const { error } = await supabase.from("daily_checkins").upsert(
    {
      user_id: user.id,
      date: todayISO(),
      energy: parsed.data.energy,
      mood: parsed.data.mood,
      sleep: parsed.data.sleep,
      stress: parsed.data.stress,
      symptoms,
      symptom_details: symptomDetails,
      notes: parsed.data.notes || null,
      need: parsed.data.need,
    },
    { onConflict: "user_id,date" },
  )

  if (error) {
    return { error: "Opslaan van je check-in is niet gelukt. Probeer het opnieuw." }
  }

  const newCustoms = parsed.data.newCustomSymptoms
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10)

  if (newCustoms.length) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("custom_symptoms")
      .eq("id", user.id)
      .maybeSingle()

    const existing = profile?.custom_symptoms ?? []
    const merged = Array.from(new Set([...existing, ...newCustoms])).slice(0, 40)
    await supabase.from("profiles").update({ custom_symptoms: merged }).eq("id", user.id)
  }

  revalidatePath("/vandaag")
  revalidatePath("/cyclus")
  return { success: true }
}

const NEED_VALUES = ["rust", "beweging", "voeding", "energie", "mezelf"] as const

/**
 * Lightweight, tap-to-save counterpart to the full check-in — just the
 * "waar heb je behoefte aan" answer, saved instantly without touching
 * whatever else is (or isn't) already recorded for today.
 */
export async function setTodayNeed(need: string | null) {
  if (need !== null && !NEED_VALUES.includes(need as (typeof NEED_VALUES)[number])) {
    return { error: "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Je bent niet ingelogd." }
  }

  const { error } = await supabase.from("daily_checkins").upsert(
    { user_id: user.id, date: todayISO(), need },
    { onConflict: "user_id,date" },
  )

  if (error) {
    return { error: "Opslaan is niet gelukt. Probeer het opnieuw." }
  }

  revalidatePath("/vandaag")
  return { success: true }
}
