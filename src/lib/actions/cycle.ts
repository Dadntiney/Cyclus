"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function toggleMenstruationDay(date: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data: existing } = await supabase
    .from("cycle_logs")
    .select("id, menstruation")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("cycle_logs")
      .update({ menstruation: !existing.menstruation })
      .eq("id", existing.id)
    if (error) return { error: "Bijwerken is niet gelukt." }
  } else {
    const { error } = await supabase
      .from("cycle_logs")
      .insert({ user_id: user.id, date, menstruation: true, symptoms: [] })
    if (error) return { error: "Opslaan is niet gelukt." }
  }

  revalidatePath("/cyclus")
  return { success: true }
}

export async function saveCycleProfileSettings(input: {
  averageCycleLength: number | null
  regularity: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("cycle_profiles")
    .update({
      average_cycle_length: input.averageCycleLength,
      regularity: input.regularity,
    })
    .eq("user_id", user.id)

  if (error) return { error: "Opslaan is niet gelukt." }

  revalidatePath("/cyclus")
  return { success: true }
}
