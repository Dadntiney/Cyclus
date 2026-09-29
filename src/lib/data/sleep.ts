import { subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates"
import { computeSleepDurationMinutes } from "@/lib/sleep/duration"
import { computeSleepSymptomInsights } from "@/lib/sleep/insights"

const PATTERN_WINDOW_DAYS = 60

/**
 * Shared by Vandaag and Beweging (both call pickTodaysWorkout with the same
 * seed so they land on the exact same pick) — computing this in one place
 * keeps that guarantee intact now that the personal sleep/symptom pattern
 * can also influence the pick. Cheap no-op when she has no sleep entries
 * yet: both fields just come back null.
 */
export async function getPersonalSleepContext(
  userId: string,
  today: string,
): Promise<{ todaySleepDurationMinutes: number | null; personalSleepPattern: { symptom: string } | null }> {
  const supabase = await createClient()
  const since = subDays(new Date(today), PATTERN_WINDOW_DAYS - 1).toISOString().slice(0, 10)

  const [{ data: sleepHistory }, { data: checkinsWithSymptoms }] = await Promise.all([
    supabase
      .from("sleep_entries")
      .select("date, bedtime, wake_time, wake_feeling")
      .eq("user_id", userId)
      .gte("date", since)
      .lte("date", today),
    supabase
      .from("daily_checkins")
      .select("date, symptoms")
      .eq("user_id", userId)
      .gte("date", since)
      .lte("date", today),
  ])

  const todayEntry = (sleepHistory ?? []).find((e) => e.date === today)
  const todaySleepDurationMinutes =
    todayEntry?.bedtime && todayEntry?.wake_time
      ? computeSleepDurationMinutes(todayEntry.bedtime, todayEntry.wake_time)
      : null

  const insights = computeSleepSymptomInsights(sleepHistory ?? [], checkinsWithSymptoms ?? [])
  const personalSleepPattern = insights[0] ? { symptom: insights[0].symptom } : null

  return { todaySleepDurationMinutes, personalSleepPattern }
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
