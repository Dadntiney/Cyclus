"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const medicationSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht").max(120),
  notes: z.string().trim().max(500).optional(),
  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  reminderEnabled: z.boolean().default(true),
})

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeTime(value: string | null | undefined): string | null {
  if (!value) return null
  return value.length === 5 ? `${value}:00` : value
}

export async function addMedication(input: z.infer<typeof medicationSchema>) {
  const parsed = medicationSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  // Compatible with the richer live medications schema.
  const { error } = await supabase.from("medications").insert({
    user_id: user.id,
    name: parsed.data.name,
    notes: parsed.data.notes || null,
    time_of_day: normalizeTime(parsed.data.reminderTime ?? null),
    reminder_enabled: parsed.data.reminderEnabled,
    category: "overig",
    schedule_type: "dagelijks",
  })

  if (error) {
    // Fallback for simpler local/dev schema.
    const fallback = await supabase.from("medications").insert({
      user_id: user.id,
      name: parsed.data.name,
      notes: parsed.data.notes || null,
      reminder_time: normalizeTime(parsed.data.reminderTime ?? null),
      reminder_enabled: parsed.data.reminderEnabled,
    })
    if (fallback.error) return { error: "Toevoegen is niet gelukt." }
  }

  revalidatePath("/hulpmiddelen")
  revalidatePath("/vandaag")
  return { success: true }
}

export async function updateMedication(
  id: string,
  input: Partial<z.infer<typeof medicationSchema>> & { active?: boolean },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const patch: {
    updated_at: string
    name?: string
    notes?: string | null
    time_of_day?: string | null
    reminder_enabled?: boolean
    end_date?: string | null
  } = { updated_at: new Date().toISOString() }
  if (input.name !== undefined) patch.name = input.name
  if (input.notes !== undefined) patch.notes = input.notes || null
  if (input.reminderTime !== undefined) patch.time_of_day = normalizeTime(input.reminderTime)
  if (input.reminderEnabled !== undefined) patch.reminder_enabled = input.reminderEnabled
  if (input.active === false) patch.end_date = todayISO()
  if (input.active === true) patch.end_date = null

  const { error } = await supabase
    .from("medications")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Bijwerken is niet gelukt." }

  revalidatePath("/hulpmiddelen")
  revalidatePath("/vandaag")
  return { success: true }
}

export async function deleteMedication(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  // Soft-end when possible so history/logs stay intact; hard delete as fallback.
  const soft = await supabase
    .from("medications")
    .update({ end_date: todayISO(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)

  if (soft.error) {
    const hard = await supabase.from("medications").delete().eq("id", id).eq("user_id", user.id)
    if (hard.error) return { error: "Verwijderen is niet gelukt." }
  }

  revalidatePath("/hulpmiddelen")
  revalidatePath("/vandaag")
  return { success: true }
}

export async function toggleMedicationTaken(medicationId: string, taken: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const date = todayISO()

  // Prefer live medication_logs schema.
  const upsertLog = await supabase.from("medication_logs").upsert(
    {
      user_id: user.id,
      medication_id: medicationId,
      date,
      taken,
    },
    { onConflict: "user_id,medication_id,date" },
  )

  if (upsertLog.error) {
    if (taken) {
      const { error } = await supabase.from("medication_intakes").upsert(
        {
          user_id: user.id,
          medication_id: medicationId,
          date,
        },
        { onConflict: "user_id,medication_id,date" },
      )
      if (error) return { error: "Markeren is niet gelukt." }
    } else {
      const { error } = await supabase
        .from("medication_intakes")
        .delete()
        .eq("user_id", user.id)
        .eq("medication_id", medicationId)
        .eq("date", date)
      if (error) return { error: "Ongedaan maken is niet gelukt." }
    }
  }

  revalidatePath("/hulpmiddelen")
  revalidatePath("/vandaag")
  return { success: true }
}
