import { createClient } from "@/lib/supabase/server"

export async function getMedicationsForUser(userId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: medications }, { data: intakes }] = await Promise.all([
    supabase
      .from("medications")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("medication_intakes")
      .select("medication_id")
      .eq("user_id", userId)
      .eq("date", today),
  ])

  const takenIds = new Set((intakes ?? []).map((i) => i.medication_id))
  return (medications ?? []).map((m) => ({
    ...m,
    takenToday: takenIds.has(m.id),
  }))
}
