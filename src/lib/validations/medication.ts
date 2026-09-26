import { z } from "zod"

export const medicationSchema = z
  .object({
    category: z.enum(["ht", "anticonceptie", "andere_hormonaal", "andere_medicatie"]),
    name: z.string().trim().min(1, "Vul een naam in.").max(80),
    hormoneType: z.string().max(80).optional(),
    form: z.string().max(40).optional(),
    dosage: z.string().max(80).optional(),
    scheduleType: z.enum(["dagelijks", "om_de_dag", "wekelijkse_dagen", "cyclisch", "eigen_schema"]),
    scheduleDays: z.array(z.number().int().min(1).max(7)).optional(),
    scheduleDaysOn: z.number().int().min(1).max(90).optional(),
    scheduleDaysOff: z.number().int().min(0).max(90).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    timeOfDay: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional(),
    reminderEnabled: z.boolean(),
    // Only meaningful for "cyclisch" schedules — independently toggleable
    // start/daily/stop notifications. Default true reproduces the existing
    // single reminder_enabled behavior (all three fire together).
    remindOnStart: z.boolean().default(true),
    remindDaily: z.boolean().default(true),
    remindOnStop: z.boolean().default(true),
    notes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scheduleType === "wekelijkse_dagen" && !data.scheduleDays?.length) {
      ctx.addIssue({
        code: "custom",
        message: "Kies minstens één dag van de week.",
        path: ["scheduleDays"],
      })
    }
    if (data.scheduleType === "cyclisch") {
      if (!data.scheduleDaysOn) {
        ctx.addIssue({ code: "custom", message: "Vul in hoeveel dagen je het wel gebruikt.", path: ["scheduleDaysOn"] })
      }
      if (data.scheduleDaysOff === undefined) {
        ctx.addIssue({ code: "custom", message: "Vul in hoeveel dagen je het niet gebruikt.", path: ["scheduleDaysOff"] })
      }
      if (!data.startDate) {
        ctx.addIssue({ code: "custom", message: "Vul in wanneer de eerste periode begint.", path: ["startDate"] })
      }
    }
    if (data.scheduleType === "om_de_dag" && !data.startDate) {
      ctx.addIssue({ code: "custom", message: "Vul in vanaf welke datum dit schema geldt.", path: ["startDate"] })
    }
    if (data.reminderEnabled && !data.timeOfDay) {
      ctx.addIssue({ code: "custom", message: "Kies een tijdstip voor je herinnering.", path: ["timeOfDay"] })
    }
  })

export type MedicationInput = z.infer<typeof medicationSchema>
