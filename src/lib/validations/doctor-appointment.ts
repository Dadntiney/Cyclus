import { z } from "zod"
import { normalizeReminderTime } from "@/lib/validations/reminder"

/** Allowed “how far ahead” values for doctor appointment reminders. */
export const DOCTOR_REMINDER_LEAD_OPTIONS = [
  { value: 0, label: "Op de dag zelf" },
  { value: 1, label: "1 dag van tevoren" },
  { value: 2, label: "2 dagen van tevoren" },
  { value: 7, label: "1 week van tevoren" },
] as const

export type DoctorReminderLeadDays = (typeof DOCTOR_REMINDER_LEAD_OPTIONS)[number]["value"]

const LEAD_VALUES = DOCTOR_REMINDER_LEAD_OPTIONS.map((o) => o.value) as [
  DoctorReminderLeadDays,
  ...DoctorReminderLeadDays[],
]

export function doctorReminderLeadLabel(days: number): string {
  return DOCTOR_REMINDER_LEAD_OPTIONS.find((o) => o.value === days)?.label ?? `${days} dagen van tevoren`
}

export const doctorAppointmentSchema = z
  .object({
    appointmentDate: z.string().optional(),
    notes: z.string().max(2000).optional(),
    reminderEnabled: z.boolean().default(false),
    reminderTime: z.string().optional(),
    reminderLeadDays: z.number().int().refine((n) => (LEAD_VALUES as number[]).includes(n), {
      message: "Kies hoe ver van tevoren je herinnering wilt.",
    }).default(0),
  })
  .superRefine((data, ctx) => {
    const date = data.appointmentDate?.trim() || ""
    const notes = data.notes?.trim() || ""
    if (!date && !notes) {
      ctx.addIssue({
        code: "custom",
        message: "Vul een afspraakdatum en/of een notitie in.",
        path: ["appointmentDate"],
      })
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      ctx.addIssue({
        code: "custom",
        message: "Kies een geldige datum.",
        path: ["appointmentDate"],
      })
    }
    if (data.reminderEnabled) {
      if (!date) {
        ctx.addIssue({
          code: "custom",
          message: "Voor een herinnering heb je een afspraakdatum nodig.",
          path: ["appointmentDate"],
        })
      }
      const time = data.reminderTime ? normalizeReminderTime(data.reminderTime) : ""
      if (!/^\d{2}:\d{2}$/.test(time)) {
        ctx.addIssue({
          code: "custom",
          message: "Kies een tijdstip voor je herinnering.",
          path: ["reminderTime"],
        })
      }
    }
  })

export type DoctorAppointmentInput = z.infer<typeof doctorAppointmentSchema>
