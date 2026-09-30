import { z } from "zod"

export const symptomDetailSchema = z.object({
  severity: z.number().int().min(1).max(3).optional(),
  count: z.number().int().min(1).max(30).optional(),
})

export const checkinSchema = z.object({
  energy: z.number().int().min(1).max(5).nullable(),
  mood: z.number().int().min(1).max(5).nullable(),
  sleep: z.number().int().min(1).max(5).nullable(),
  stress: z.number().int().min(1).max(5).nullable(),
  symptoms: z.array(z.string().trim().min(1).max(60)).max(40),
  symptomDetails: z.record(z.string(), symptomDetailSchema).default({}),
  notes: z.string().max(1000).optional(),
  needs: z
    .array(z.enum(["rust", "beweging", "voeding", "energie", "mezelf"]))
    .max(5)
    .default([]),
  newCustomSymptoms: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
})

export type CheckinInput = z.infer<typeof checkinSchema>
export type SymptomDetail = z.infer<typeof symptomDetailSchema>
