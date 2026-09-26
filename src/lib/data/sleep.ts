import { subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** Recent sleep entries, oldest first — the shape computeAverageSleepDuration etc. expect. */
export async function getSleepHistory(userId: string, days = 30) {
  const supabase = await createClient()
  const today = todayISO()
  const since = subDays(new Date(today), days - 1).toISOString().slice(0, 10)

  const { data } = await supabase
    .from("sleep_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("date", since)
    .lte("date", today)
    .order("date", { ascending: true })

  return data ?? []
}

export async function getTodaySleepEntry(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("sleep_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", todayISO())
    .maybeSingle()

  return data
}
