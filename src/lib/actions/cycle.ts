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
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/vandaag")
  return { success: true }
}

const FLOW_VALUES = ["geen", "licht", "gemiddeld", "hevig"] as const

/**
 * Sets (or clears) the flow intensity for a menstruation day. Marks the day
 * as menstruation if it wasn't already (so choosing a flow also counts as
 * logging the period day) — passing `null` just clears the flow value
 * without unmarking the day; unmarking itself is still `toggleMenstruationDay`.
 */
export async function setCycleLogFlow(date: string, flow: (typeof FLOW_VALUES)[number] | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  if (flow !== null && !FLOW_VALUES.includes(flow)) {
    return { error: "Ongeldige waarde." }
  }

  const { data: existing } = await supabase
    .from("cycle_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("cycle_logs")
      .update({ menstruation: true, flow })
      .eq("id", existing.id)
    if (error) return { error: "Bijwerken is niet gelukt." }
  } else {
    const { error } = await supabase
      .from("cycle_logs")
      .insert({ user_id: user.id, date, menstruation: true, flow, symptoms: [] })
    if (error) return { error: "Opslaan is niet gelukt." }
  }

  revalidatePath("/cyclus")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/vandaag")
  return { success: true }
}
