import { z } from "zod"

export const reminderSchema = z.object({
  type: z.enum([
    "dagelijkse_checkin",
    "symptomen",
    "beweging",
    "routine",
    "voeding",
    "cyclus",
    "herstel",
    "anders",
  ]),
  label: z.string().max(80).optional(),
  enabled: z.boolean(),
  days: z.array(z.number().int().min(1).max(7)).min(1, "Kies minstens één dag."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Kies een geldig tijdstip."),
})

export type ReminderInput = z.infer<typeof reminderSchema>
