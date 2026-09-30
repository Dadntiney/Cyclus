"use server"

import { createClient } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates/amsterdam"

export async function exportUserData(): Promise<
  { error: string; data?: undefined } | { error?: undefined; data: string; filename: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const [
    profile,
    cycleProfile,
    checkins,
    cycleLogs,
    sleepEntries,
    medications,
    medicationLogs,
    reminders,
    diary,
    periAssessments,
    favorites,
    savedMoments,
    doctorAppointments,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("cycle_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("daily_checkins").select("*").eq("user_id", user.id).order("date", { ascending: true }),
    supabase.from("cycle_logs").select("*").eq("user_id", user.id).order("date", { ascending: true }),
    supabase.from("sleep_entries").select("*").eq("user_id", user.id).order("date", { ascending: true }),
    supabase.from("medications").select("*").eq("user_id", user.id),
    supabase.from("medication_logs").select("*").eq("user_id", user.id),
    supabase.from("reminders").select("*").eq("user_id", user.id),
    supabase.from("diary_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    supabase.from("peri_assessments").select("*").eq("user_id", user.id).order("assessed_on", { ascending: true }),
    supabase.from("favorites").select("*").eq("user_id", user.id),
    supabase.from("saved_moments").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    supabase.from("doctor_appointments").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    format: "cyclus-export-v1",
    user: { id: user.id, email: user.email ?? null },
    profile: profile.data,
    cycleProfile: cycleProfile.data,
    dailyCheckins: checkins.data ?? [],
    cycleLogs: cycleLogs.data ?? [],
    sleepEntries: sleepEntries.data ?? [],
    medications: medications.data ?? [],
    medicationLogs: medicationLogs.data ?? [],
    reminders: reminders.data ?? [],
    diaryEntries: diary.data ?? [],
    periAssessments: periAssessments.data ?? [],
    favorites: favorites.data ?? [],
    savedMoments: savedMoments.data ?? [],
    doctorAppointments: doctorAppointments.data ?? [],
  }

  const date = todayISO()
  return {
    data: JSON.stringify(payload, null, 2),
    filename: `cyclus-gegevens-${date}.json`,
  }
}
