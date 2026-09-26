import { z } from "zod"

export const sleepEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bedtime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  wakeFeeling: z.enum(["uitgerust", "redelijk_uitgerust", "moe", "erg_moe"]).nullable(),
  sleepQuality: z.enum(["slecht", "matig", "redelijk", "goed", "heel_goed"]).nullable(),
  wakeCount: z.number().int().min(0).max(3).nullable(),
})

export type SleepEntryInput = z.infer<typeof sleepEntrySchema>
