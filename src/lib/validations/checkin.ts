import { z } from "zod"

export const checkinSchema = z.object({
  energy: z.number().int().min(1).max(5).nullable(),
  mood: z.number().int().min(1).max(5).nullable(),
  sleep: z.number().int().min(1).max(5).nullable(),
  stress: z.number().int().min(1).max(5).nullable(),
  symptoms: z.array(z.string()),
  notes: z.string().max(1000).optional(),
  need: z.enum(["rust", "beweging", "voeding", "energie", "mezelf"]).nullable(),
})

export type CheckinInput = z.infer<typeof checkinSchema>
