import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

export type DoctorAppointment = Tables<"doctor_appointments">

export async function getDoctorAppointments(userId: string): Promise<DoctorAppointment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("doctor_appointments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  const rows = data ?? []
  // Upcoming dates first, then undated notes, then past — stable client sort.
  const today = new Date().toISOString().slice(0, 10)
  return [...rows].sort((a, b) => {
    const aDate = a.appointment_date
    const bDate = b.appointment_date
    const aUpcoming = aDate && aDate >= today ? 0 : aDate ? 2 : 1
    const bUpcoming = bDate && bDate >= today ? 0 : bDate ? 2 : 1
    if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming
    if (aDate && bDate && aDate !== bDate) {
      return aUpcoming === 0 ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
    }
    return b.created_at.localeCompare(a.created_at)
  })
}

/** Appointments with a reminder today (or upcoming) for the app shell toast. */
export async function getDoctorAppointmentReminderSources(
  userId: string,
): Promise<DoctorAppointment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("doctor_appointments")
    .select("*")
    .eq("user_id", userId)
    .eq("reminder_enabled", true)
    .not("appointment_date", "is", null)
    .not("reminder_time", "is", null)
  return data ?? []
}
