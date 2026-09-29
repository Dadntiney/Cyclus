"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates/amsterdam"
import { z } from "zod"

const entrySchema = z.object({
  body: z.string().trim().min(1, "Schrijf iets op").max(8000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export async function createDiaryEntry(input: z.infer<typeof entrySchema>) {
  const parsed = entrySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase.from("diary_entries").insert({
    user_id: user.id,
    date: parsed.data.date ?? todayISO(),
    body: parsed.data.body,
  })

  if (error) return { error: "Opslaan is niet gelukt." }

  revalidatePath("/dagboek")
  revalidatePath("/vandaag")
  return { success: true }
}

export async function updateDiaryEntry(id: string, body: string) {
  const parsed = entrySchema.safeParse({ body })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("diary_entries")
    .update({ body: parsed.data.body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Bijwerken is niet gelukt." }

  revalidatePath("/dagboek")
  return { success: true }
}

export async function deleteDiaryEntry(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Verwijderen is niet gelukt." }

  revalidatePath("/dagboek")
  return { success: true }
}
