"use server"

import { revalidatePath } from "next/cache"
import { eachDayOfInterval, format, parseISO } from "date-fns"
import { createClient } from "@/lib/supabase/server"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
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
export async function startMenstruationPeriod() {
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

  const today = todayISO()
  const { error: profileError } = await supabase
    .from("cycle_profiles")
    .update({ active_period_start: today })
    .eq("user_id", user.id)
  if (profileError) return { error: "Opslaan is niet gelukt." }

  const { error: logError } = await supabase
    .from("cycle_logs")
    .upsert({ user_id: user.id, date: today, menstruation: true }, { onConflict: "user_id,date" })
  if (logError) return { error: "Opslaan is niet gelukt." }

  revalidatePath("/cyclus")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/vandaag")
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
export async function stopMenstruationPeriod() {
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
  const dayDates =
    start <= today
      ? eachDayOfInterval({ start: parseISO(start), end: parseISO(today) }).map((d) => format(d, "yyyy-MM-dd"))
      : []

  if (dayDates.length) {
    const { data: existingLogs } = await supabase
      .from("cycle_logs")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", today)
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

  const { error: profileError } = await supabase
    .from("cycle_profiles")
    .update({ active_period_start: null })
    .eq("user_id", user.id)
  if (profileError) return { error: "Opslaan is niet gelukt." }

  revalidatePath("/cyclus")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/vandaag")
  return { success: true }
}

export async function toggleMenstruationDay(date: string) {
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

  revalidatePath("/cyclus")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/vandaag")
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

  revalidatePath("/cyclus")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/vandaag")
  return { success: true }
}
