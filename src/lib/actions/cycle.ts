"use server"

import { revalidatePath } from "next/cache"
import { addDays, differenceInCalendarDays, eachDayOfInterval, format, parseISO } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates/amsterdam"
import { computeCycleHistory } from "@/lib/cycle/history"
import { isPastOrTodayISODate } from "@/lib/validations/dates"

/** How far back she may say "het begon eigenlijk op…". */
const MAX_START_BACKDATE_DAYS = 14

function daysBetween(start: string, end: string): string[] {
  if (start > end) return []
  return eachDayOfInterval({ start: parseISO(start), end: parseISO(end) }).map((d) => format(d, "yyyy-MM-dd"))
}

function revalidateCyclePages() {
  revalidatePath("/cyclus")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/vandaag")
  revalidatePath("/deze-week")
  revalidatePath("/", "layout")
}

/**
 * Calendar marks are the live source of truth for “when did her last period
 * start?”. After she adds/removes menstruation days, sync profile
 * `last_period_start` to the latest logged period — or clear it when she
 * wiped every mark, so Vandaag stops showing a phantom menstruatiefase
 * from a stale onboarding date.
 */
async function syncLastPeriodStartFromLogs(userId: string) {
  const supabase = await createClient()
  const { data: logs } = await supabase
    .from("cycle_logs")
    .select("date, menstruation, symptoms")
    .eq("user_id", userId)
    .eq("menstruation", true)
    .order("date", { ascending: true })

  const history = computeCycleHistory(
    (logs ?? []).map((l) => ({
      date: l.date,
      menstruation: l.menstruation,
      symptoms: l.symptoms ?? [],
    })),
  )
  const latestStart = history.length ? history[history.length - 1].start : null

  await supabase
    .from("cycle_profiles")
    .update({ last_period_start: latestStart })
    .eq("user_id", userId)
}

/**
 * "Menstruatie starten" on Vandaag - sets cycle_profiles.active_period_start
 * to today (the single, explicit source of truth for "is a period active,
 * and since when") and marks today in cycle_logs so the calendar has a real
 * row for day 1 immediately. Refuses if a period is already active: only
 * one active period can ever exist per user (the column holds one value),
 * so this structurally rules out double/conflicting registrations rather
 * than just discouraging them in the UI.
 */
export async function startMenstruationPeriod(startDate?: string) {
  const today = todayISO()
  const start = startDate ?? today
  if (!isPastOrTodayISODate(start, today)) {
    return { error: "Kies een dag van vandaag of eerder." }
  }
  if (differenceInCalendarDays(parseISO(today), parseISO(start)) > MAX_START_BACKDATE_DAYS) {
    return { error: "Kies een dag in de afgelopen twee weken, of zet eerdere dagen in de kalender." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data: cycleProfile } = await supabase
    .from("cycle_profiles")
    .select("active_period_start")
    .eq("user_id", user.id)
    .maybeSingle()
  if (cycleProfile?.active_period_start) {
    return { error: "Er loopt al een menstruatie." }
  }

  const { error: profileError } = await supabase
    .from("cycle_profiles")
    .update({ active_period_start: start })
    .eq("user_id", user.id)
  if (profileError) return { error: "Opslaan is niet gelukt." }

  // Every day from her chosen start through today is a period day. Existing
  // rows are updated (she is telling us these days were menstruation now),
  // so flow and other details on them are kept.
  const { error: logError } = await supabase
    .from("cycle_logs")
    .upsert(
      daysBetween(start, today).map((date) => ({ user_id: user.id, date, menstruation: true })),
      { onConflict: "user_id,date" },
    )
  if (logError) return { error: "Opslaan is niet gelukt." }

  await syncLastPeriodStartFromLogs(user.id)
  revalidateCyclePages()
  return { success: true }
}

/**
 * "Menstruatie stoppen" on Vandaag - finalizes the active period through
 * today and clears active_period_start (so it stops reading as active
 * everywhere, immediately). Fills every day from active_period_start
 * through today that has NO cycle_logs row yet, so the calendar shows one
 * continuous period even if she never opened the app in between - but
 * never overrides a day she explicitly unmarked via the calendar mid-period
 * (respects that as a deliberate correction, at the cost of a documented
 * edge case: computeCycleHistory then sees two shorter periods instead of
 * one, which only affects retrospective pattern insights, not the day
 * count or calendar dots for the range actually covered).
 */
export async function stopMenstruationPeriod(endDate?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data: cycleProfile } = await supabase
    .from("cycle_profiles")
    .select("active_period_start")
    .eq("user_id", user.id)
    .maybeSingle()
  const start = cycleProfile?.active_period_start
  if (!start) return { error: "Er loopt geen menstruatie om te stoppen." }

  const today = todayISO()
  // Her last bleeding day: today by default, or an earlier day when she
  // forgot to tap "Stoppen" in time.
  const end = endDate ?? today
  if (!isPastOrTodayISODate(end, today) || end < start) {
    return { error: "Kies een dag tussen de start van je menstruatie en vandaag." }
  }
  const dayDates = daysBetween(start, end)

  if (dayDates.length) {
    const { data: existingLogs } = await supabase
      .from("cycle_logs")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end)
    const existingDates = new Set((existingLogs ?? []).map((l) => l.date))
    const missing = dayDates.filter((d) => !existingDates.has(d))

    if (missing.length) {
      const { error: logError } = await supabase
        .from("cycle_logs")
        .upsert(
          missing.map((date) => ({ user_id: user.id, date, menstruation: true })),
          { onConflict: "user_id,date" },
        )
      if (logError) return { error: "Opslaan is niet gelukt." }
    }
  }

  // Days after her chosen last day were never period days — undo any that
  // were marked while the period was (wrongly) still running.
  if (end < today) {
    const dayAfterEnd = format(addDays(parseISO(end), 1), "yyyy-MM-dd")
    const { error: clearError } = await supabase
      .from("cycle_logs")
      .update({ menstruation: false, flow: null })
      .eq("user_id", user.id)
      .eq("menstruation", true)
      .gte("date", dayAfterEnd)
      .lte("date", today)
    if (clearError) return { error: "Opslaan is niet gelukt." }
  }

  const { error: profileError } = await supabase
    .from("cycle_profiles")
    .update({ active_period_start: null })
    .eq("user_id", user.id)
  if (profileError) return { error: "Opslaan is niet gelukt." }

  await syncLastPeriodStartFromLogs(user.id)
  revalidateCyclePages()
  return { success: true }
}

export async function toggleMenstruationDay(date: string) {
  if (!isPastOrTodayISODate(date)) return { error: "Je kunt alleen dagen tot en met vandaag markeren." }

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

  let unmarked = false
  if (existing) {
    const nextValue = !existing.menstruation
    const { error } = await supabase.from("cycle_logs").update({ menstruation: nextValue }).eq("id", existing.id)
    if (error) return { error: "Bijwerken is niet gelukt." }
    unmarked = !nextValue
  } else {
    const { error } = await supabase
      .from("cycle_logs")
      .insert({ user_id: user.id, date, menstruation: true, symptoms: [] })
    if (error) return { error: "Opslaan is niet gelukt." }
  }

  // Unmarking the very first day of an active period via the kalender is
  // her way of undoing an accidental "Menstruatie starten" tap — clear the
  // active status too, rather than leaving Vandaag stuck showing "Dag N"
  // for a period whose start day no longer exists.
  if (unmarked) {
    const { data: cycleProfile } = await supabase
      .from("cycle_profiles")
      .select("active_period_start")
      .eq("user_id", user.id)
      .maybeSingle()
    if (cycleProfile?.active_period_start === date) {
      const { error } = await supabase
        .from("cycle_profiles")
        .update({ active_period_start: null })
        .eq("user_id", user.id)
      if (error) return { error: "Bijwerken is niet gelukt." }
    }
  }

  await syncLastPeriodStartFromLogs(user.id)
  revalidateCyclePages()
  return { success: true }
}

const FLOW_VALUES = ["geen", "licht", "gemiddeld", "hevig"] as const

/**
 * Sets (or clears) the flow intensity for a menstruation day. Marks the day
 * as menstruation if it wasn't already (so choosing a flow also counts as
 * logging the period day) - passing `null` just clears the flow value
 * without unmarking the day; unmarking itself is still `toggleMenstruationDay`.
 */
export async function setCycleLogFlow(date: string, flow: (typeof FLOW_VALUES)[number] | null) {
  if (!isPastOrTodayISODate(date)) return { error: "Je kunt alleen dagen tot en met vandaag invullen." }

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

  await syncLastPeriodStartFromLogs(user.id)
  revalidateCyclePages()
  return { success: true }
}
