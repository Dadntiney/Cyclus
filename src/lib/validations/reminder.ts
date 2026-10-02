import { z } from "zod"
import { normalizeReminderTime } from "@/lib/reminders/options"

/** Browsers (esp. iOS) may emit `HH:MM:SS` from `<input type="time">`. */
export { normalizeReminderTime }

export const reminderSchema = z.object({
  type: z.enum([
    "dagelijkse_checkin",
    "symptomen",
    "beweging",
    "routine",
    "voeding",
    "cyclus",
    "herstel",
    "mentale_ondersteuning",
    "anders",
  ]),
  label: z.string().max(80).optional(),
  enabled: z.boolean(),
  days: z.array(z.number().int().min(1).max(7)).min(1, "Kies minstens één dag."),
  time: z
    .string()
    .transform(normalizeReminderTime)
    .pipe(z.string().regex(/^\d{2}:\d{2}$/, "Kies een geldig tijdstip.")),
})

export type ReminderInput = z.infer<typeof reminderSchema>
