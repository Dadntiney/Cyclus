import { createClient } from "@/lib/supabase/server"

export type MedicationRow = {
  id: string
  name: string
  notes: string | null
  reminder_time: string | null
  reminder_enabled: boolean
  takenToday: boolean
}

/**
 * Maps the richer live `medications` + `medication_logs` schema to the
 * simple shape the Hulpmiddelen UI expects.
 */
export async function getMedicationsForUser(userId: string): Promise<MedicationRow[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: medications, error: medError }, { data: logs }] = await Promise.all([
    supabase
      .from("medications")
      .select("id, name, notes, time_of_day, reminder_enabled, end_date")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("medication_logs")
      .select("medication_id, taken")
      .eq("user_id", userId)
      .eq("date", today),
  ])

  if (medError) {
    // Fallback for environments that still use the simpler Wave-2 schema.
    const { data: simple } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
    const takenIds = new Set(
      (logs ?? []).filter((l) => (l as { taken?: boolean }).taken !== false).map((l) => l.medication_id),
    )
    return (simple ?? [])
      .filter((m) => (m as { active?: boolean }).active !== false)
      .map((m) => ({
        id: m.id,
        name: m.name,
        notes: (m as { notes?: string | null }).notes ?? null,
        reminder_time:
          (m as { reminder_time?: string | null }).reminder_time ??
          (m as { time_of_day?: string | null }).time_of_day ??
          null,
        reminder_enabled: Boolean((m as { reminder_enabled?: boolean }).reminder_enabled),
        takenToday: takenIds.has(m.id),
      }))
  }

  const takenIds = new Set(
    (logs ?? []).filter((l) => l.taken !== false).map((l) => l.medication_id),
  )

  return (medications ?? [])
    .filter((m) => !m.end_date || m.end_date >= today)
    .map((m) => ({
      id: m.id,
      name: m.name,
      notes: m.notes,
      reminder_time: m.time_of_day,
      reminder_enabled: Boolean(m.reminder_enabled),
      takenToday: takenIds.has(m.id),
    }))
}
