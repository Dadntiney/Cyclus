import { z } from "zod"
import { normalizeReminderTime } from "@/lib/validations/reminder"

export const doctorAppointmentSchema = z
  .object({
    appointmentDate: z.string().optional(),
    notes: z.string().max(2000).optional(),
    reminderEnabled: z.boolean().default(false),
    reminderTime: z.string().optional(),
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
