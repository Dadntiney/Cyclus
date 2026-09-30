"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { normalizeReminderTime, reminderSchema, type ReminderInput } from "@/lib/validations/reminder"

function toClientReminder(data: {
  id: string
  user_id: string
  type: string
  label: string | null
  enabled: boolean
  days: number[] | null
  time: string
  created_at: string
  updated_at: string
}) {
  return {
    id: data.id,
    user_id: data.user_id,
    type: data.type,
    label: data.label,
    enabled: data.enabled,
    days: [...(data.days ?? [])],
    time: normalizeReminderTime(String(data.time)),
    created_at: data.created_at,
    updated_at: data.updated_at,
  }
}

function revalidateReminderPages() {
  revalidatePath("/profiel/meldingen")
  revalidatePath("/profiel")
  revalidatePath("/", "layout")
}

export async function createReminder(input: ReminderInput) {
  const parsed = reminderSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data, error } = await supabase
    .from("reminders")
    .insert({
      user_id: user.id,
      type: parsed.data.type,
      label: parsed.data.label?.trim() || null,
      enabled: parsed.data.enabled,
      days: parsed.data.days,
      time: parsed.data.time,
    })
    .select()
    .single()

  if (error) return { error: "Opslaan van je herinnering is niet gelukt." }
  if (!data) return { error: "Opslaan van je herinnering is niet gelukt." }

  revalidateReminderPages()
  return { success: true as const, reminder: toClientReminder(data) }
}

export async function updateReminder(id: string, input: ReminderInput) {
  const parsed = reminderSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data, error } = await supabase
    .from("reminders")
    .update({
      type: parsed.data.type,
      label: parsed.data.label?.trim() || null,
      enabled: parsed.data.enabled,
      days: parsed.data.days,
      time: parsed.data.time,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return { error: "Bijwerken van je herinnering is niet gelukt." }
  if (!data) return { error: "Bijwerken van je herinnering is niet gelukt." }

  revalidateReminderPages()
  return { success: true as const, reminder: toClientReminder(data) }
}

export async function toggleReminder(id: string, enabled: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("reminders")
    .update({ enabled })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Bijwerken is niet gelukt." }

  revalidateReminderPages()
  return { success: true as const }
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase.from("reminders").delete().eq("id", id).eq("user_id", user.id)

  if (error) return { error: "Verwijderen is niet gelukt." }

  revalidateReminderPages()
  return { success: true as const }
}
