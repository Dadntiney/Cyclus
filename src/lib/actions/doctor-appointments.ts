"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  doctorAppointmentSchema,
  type DoctorAppointmentInput,
} from "@/lib/validations/doctor-appointment"
import { normalizeReminderTime } from "@/lib/validations/reminder"

function revalidateAppointmentPages() {
  revalidatePath("/cyclus/samenvatting")
  revalidatePath("/cyclus")
  revalidatePath("/", "layout")
}

function toRow(userId: string, input: DoctorAppointmentInput) {
  const date = input.appointmentDate?.trim() || null
  const notes = input.notes?.trim() || null
  const reminderEnabled = Boolean(input.reminderEnabled && date && input.reminderTime)
  const leadDays = input.reminderLeadDays ?? 0
  return {
    user_id: userId,
    appointment_date: date,
    notes,
    reminder_enabled: reminderEnabled,
    reminder_time: reminderEnabled && input.reminderTime ? normalizeReminderTime(input.reminderTime) : null,
    reminder_lead_days: reminderEnabled ? leadDays : 0,
  }
}

export async function createDoctorAppointment(input: DoctorAppointmentInput) {
  const parsed = doctorAppointmentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase.from("doctor_appointments").insert(toRow(user.id, parsed.data))
  if (error) return { error: "Opslaan is niet gelukt." }

  revalidateAppointmentPages()
  return { success: true as const }
}

export async function updateDoctorAppointment(id: string, input: DoctorAppointmentInput) {
  const parsed = doctorAppointmentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const row = toRow(user.id, parsed.data)
  const { error } = await supabase
    .from("doctor_appointments")
    .update({
      appointment_date: row.appointment_date,
      notes: row.notes,
      reminder_enabled: row.reminder_enabled,
      reminder_time: row.reminder_time,
      reminder_lead_days: row.reminder_lead_days,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Bijwerken is niet gelukt." }

  revalidateAppointmentPages()
  return { success: true as const }
}

export async function deleteDoctorAppointment(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("doctor_appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: "Verwijderen is niet gelukt." }

  revalidateAppointmentPages()
  return { success: true as const }
}
