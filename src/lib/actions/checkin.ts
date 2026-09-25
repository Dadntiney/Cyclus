"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { checkinSchema, type CheckinInput } from "@/lib/validations/checkin"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
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

  const { error } = await supabase.from("daily_checkins").upsert(
    {
      user_id: user.id,
      date: todayISO(),
      energy: parsed.data.energy,
      mood: parsed.data.mood,
      sleep: parsed.data.sleep,
      stress: parsed.data.stress,
      symptoms: parsed.data.symptoms,
      notes: parsed.data.notes || null,
      need: parsed.data.need,
    },
    { onConflict: "user_id,date" },
  )

  if (error) {
    return { error: "Opslaan van je check-in is niet gelukt. Probeer het opnieuw." }
  }

  revalidatePath("/vandaag")
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
