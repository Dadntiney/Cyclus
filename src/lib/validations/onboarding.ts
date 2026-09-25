import { z } from "zod"

export const onboardingSchema = z.object({
  name: z.string().trim().min(1, "Vul je naam in.").max(80),
  age: z.number().int().min(10).max(100),
  hasCycle: z.boolean(),
  lastPeriodStart: z.string().optional(),
  averageCycleLength: z.number().int().min(15).max(60).optional(),
  regularity: z.enum(["regelmatig", "onregelmatig", "onbekend"]).optional(),
  perimenopauseInfo: z.string().max(500).optional(),
  goals: z.array(z.string()).min(1, "Kies minstens één doel."),
  movementEnabled: z.boolean(),
  trainingPreferences: z.array(z.string()),
  trainingFrequency: z.number().int().min(1).max(7).optional(),
  nutritionEnabled: z.boolean(),
  nutritionPreferences: z.array(z.string()),
  wellnessPreference: z.enum(["natuurlijk", "gebalanceerd", "fitness"]),
  heightCm: z.number().int().min(120).max(220).optional(),
  weightKg: z.number().min(30).max(250).optional(),
  goalWeightKg: z.number().min(30).max(250).optional(),
  healthConditions: z.array(z.string()),
  movementLimitations: z.array(z.string()),
  nutritionStyle: z.enum(["normaal", "koolhydraatarm"]),
})

export type OnboardingInput = z.infer<typeof onboardingSchema>
