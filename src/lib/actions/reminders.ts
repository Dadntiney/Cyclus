"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const reminderSchema = z.object({
  checkinReminderEnabled: z.boolean(),
  checkinReminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Ongeldige tijd")
    .or(z.string().regex(/^\d{2}:\d{2}:\d{2}$/)),
  workoutReminderEnabled: z.boolean(),
  browserNotificationsEnabled: z.boolean(),
})

export type ReminderSettingsInput = z.infer<typeof reminderSchema>

function normalizeTime(value: string): string {
  return value.length === 5 ? `${value}:00` : value
}

export async function saveReminderSettings(input: ReminderSettingsInput) {
  const parsed = reminderSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("profiles")
    .update({
      checkin_reminder_enabled: parsed.data.checkinReminderEnabled,
      checkin_reminder_time: normalizeTime(parsed.data.checkinReminderTime),
      workout_reminder_enabled: parsed.data.workoutReminderEnabled,
      browser_notifications_enabled: parsed.data.browserNotificationsEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) return { error: "Opslaan van herinneringen is niet gelukt." }

  revalidatePath("/profiel")
  revalidatePath("/hulpmiddelen")
  revalidatePath("/vandaag")
  return { success: true }
}
