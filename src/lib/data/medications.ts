import { createClient } from "@/lib/supabase/server"
import { isDosingDay, type MedicationSchedule } from "@/lib/medication/schedule"

export async function getMedications(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
  return data ?? []
}

/** Slim projection used for the reminder toast host — only what it needs to compute "is this due now". */
export async function getMedicationReminderSources(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("medications")
    .select(
      "id, name, reminder_enabled, time_of_day, schedule_type, schedule_days, schedule_days_on, schedule_days_off, start_date, end_date, remind_on_start, remind_daily, remind_on_stop",
    )
    .eq("user_id", userId)
    .eq("reminder_enabled", true)
  return data ?? []
}

export async function getMedication(userId: string, id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("medications")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle()
  return data
}

export async function getMedicationLogsForDate(userId: string, date: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("medication_logs")
    .select("medication_id, taken")
    .eq("user_id", userId)
    .eq("date", date)
  return data ?? []
}

export interface MedicationDashboardItem {
  id: string
  name: string
  form: string | null
  dosage: string | null
  timeOfDay: string | null
  /** true = today is a dosing day, false = a computed "off" day, null = not automatically trackable ("eigen schema"). */
  status: boolean | null
  taken: boolean
}

/**
 * Combines her medications with today's schedule and today's log entries —
 * the data behind the optional "Mijn medicatie vandaag" dashboard widget.
 * Never draws conclusions beyond "is this a dosing day" and "did she mark
 * it taken"; no symptom or phase correlation happens here.
 */
export async function getMedicationDashboardItems(userId: string, date: string): Promise<MedicationDashboardItem[]> {
  const [medications, logs] = await Promise.all([getMedications(userId), getMedicationLogsForDate(userId, date)])
  const takenById = new Map(logs.map((l) => [l.medication_id, l.taken]))
  const today = new Date(`${date}T00:00:00`)

  return medications.map((m) => {
    const schedule: MedicationSchedule = {
      scheduleType: m.schedule_type as MedicationSchedule["scheduleType"],
      scheduleDays: m.schedule_days,
      scheduleDaysOn: m.schedule_days_on,
      scheduleDaysOff: m.schedule_days_off,
      startDate: m.start_date,
      endDate: m.end_date,
    }
    return {
      id: m.id,
      name: m.name,
      form: m.form,
      dosage: m.dosage,
      timeOfDay: m.time_of_day,
      status: isDosingDay(schedule, today),
      taken: takenById.get(m.id) ?? false,
    }
  })
}
