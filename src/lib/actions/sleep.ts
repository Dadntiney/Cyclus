"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { sleepEntrySchema, type SleepEntryInput } from "@/lib/validations/sleep"

export async function saveSleepEntry(input: SleepEntryInput) {
  const parsed = sleepEntrySchema.safeParse(input)
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

  const { error } = await supabase.from("sleep_entries").upsert(
    {
      user_id: user.id,
      date: parsed.data.date,
      bedtime: parsed.data.bedtime,
      wake_time: parsed.data.wakeTime,
      wake_feeling: parsed.data.wakeFeeling,
      sleep_quality: parsed.data.sleepQuality,
      wake_count: parsed.data.wakeCount,
    },
    { onConflict: "user_id,date" },
  )

  if (error) {
    return { error: "Opslaan van je slaapgegevens is niet gelukt. Probeer het opnieuw." }
  }

  revalidatePath("/vandaag")
  revalidatePath("/slaap")
  return { success: true }
}
