"use server"

import { revalidatePath } from "next/cache"
import { addDays, eachDayOfInterval, format, parseISO, subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { MENSTRUATION_OPEN_GAP_DAYS } from "@/lib/cycle/history"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/** Quick "menstruatie gestart 🩸" action on Vandaag — marks just today. */
export async function startMenstruationToday() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const today = todayISO()
  const { data: existing } = await supabase
    .from("cycle_logs")
    .select("id, menstruation")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  if (existing) {
    if (!existing.menstruation) {
      const { error } = await supabase.from("cycle_logs").update({ menstruation: true }).eq("id", existing.id)
      if (error) return { error: "Opslaan is niet gelukt." }
    }
  } else {
    const { error } = await supabase
      .from("cycle_logs")
      .insert({ user_id: user.id, date: today, menstruation: true, symptoms: [] })
    if (error) return { error: "Opslaan is niet gelukt." }
  }

  revalidatePath("/cyclus")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/vandaag")
  return { success: true }
}

/**
 * Quick "menstruatie gestopt" action on Vandaag — closes out the current
 * period through today. Fills any days she didn't open the app for since
 * her last logged day (capped at MENSTRUATION_OPEN_GAP_DAYS, so this never
 * reaches back into an unrelated, much older period), without touching
 * symptoms/flow already logged on any of those days.
 */
export async function stopMenstruationToday() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const today = todayISO()
  const windowStart = format(subDays(parseISO(today), MENSTRUATION_OPEN_GAP_DAYS), "yyyy-MM-dd")

  const { data: recentLogs } = await supabase
    .from("cycle_logs")
    .select("id, date, menstruation")
    .eq("user_id", user.id)
    .gte("date", windowStart)
    .lte("date", today)

  const byDate = new Map((recentLogs ?? []).map((l) => [l.date, l]))
  const lastTrueDate = (recentLogs ?? [])
    .filter((l) => l.menstruation)
    .map((l) => l.date)
    .sort()
    .at(-1)

  const fillFrom = lastTrueDate ? addDays(parseISO(lastTrueDate), 1) : parseISO(today)
  const daysToFill = eachDayOfInterval({ start: fillFrom, end: parseISO(today) }).map((d) => format(d, "yyyy-MM-dd"))

  for (const date of daysToFill) {
    const existing = byDate.get(date)
    if (existing) {
      if (!existing.menstruation) {
        const { error } = await supabase.from("cycle_logs").update({ menstruation: true }).eq("id", existing.id)
        if (error) return { error: "Opslaan is niet gelukt." }
      }
    } else {
      const { error } = await supabase
        .from("cycle_logs")
        .insert({ user_id: user.id, date, menstruation: true, symptoms: [] })
      if (error) return { error: "Opslaan is niet gelukt." }
    }
  }

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

  if (existing) {
    const { error } = await supabase
      .from("cycle_logs")
      .update({ menstruation: !existing.menstruation })
      .eq("id", existing.id)
    if (error) return { error: "Bijwerken is niet gelukt." }
  } else {
    const { error } = await supabase
      .from("cycle_logs")
      .insert({ user_id: user.id, date, menstruation: true, symptoms: [] })
    if (error) return { error: "Opslaan is niet gelukt." }
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
 * logging the period day) — passing `null` just clears the flow value
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
