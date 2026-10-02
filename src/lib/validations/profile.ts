import { z } from "zod"
import { pastOrTodayDateSchema } from "@/lib/validations/dates"

const shortText = z.string().trim().max(80)
const tagList = z.array(z.string().trim().min(1).max(80)).max(40)

/**
 * Server-side guard for Profiel autosave. Validated BEFORE any write so a
 * bad value can never leave the profile half-saved. Enum-like lists that the
 * database already constrains (buddy styles, categories, content types) are
 * checked there too; here they only get sane size limits.
 */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Vul je naam in.").max(80, "Je naam mag maximaal 80 tekens zijn."),
  age: z
    .number()
    .int()
    .min(16, "Vul een leeftijd tussen 16 en 100 in.")
    .max(100, "Vul een leeftijd tussen 16 en 100 in.")
    .nullable(),
  heightCm: z.number().int().min(120, "Vul een lengte tussen 120 en 220 cm in.").max(220, "Vul een lengte tussen 120 en 220 cm in.").nullable(),
  weightKg: z.number().min(30, "Vul een gewicht tussen 30 en 250 kg in.").max(250, "Vul een gewicht tussen 30 en 250 kg in.").nullable(),
  goalWeightKg: z.number().min(30, "Vul een streefgewicht tussen 30 en 250 kg in.").max(250, "Vul een streefgewicht tussen 30 en 250 kg in.").nullable(),
  goals: tagList,
  healthConditions: tagList,
  movementLimitations: tagList,
  movementEnabled: z.boolean(),
  trainingPreferences: tagList,
  nutritionEnabled: z.boolean(),
  nutritionStyle: z.enum(["normaal", "koolhydraatarm"]),
  nutritionPreferences: tagList,
  dislikedFoods: tagList,
  foodAllergies: tagList,
  mentalWellbeingEnabled: z.boolean(),
  mentalWellbeingCategories: z.array(shortText).max(20),
  morningReminderEnabled: z.boolean(),
  morningReminderTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Kies een geldige tijd."),
  morningReminderDays: z.array(z.number().int().min(1).max(7)).min(1).max(7),
  morningReminderContentTypes: z.array(shortText).min(1).max(4),
  sleepTrackingEnabled: z.boolean(),
  trainingFrequency: z.number().int().min(1).max(7).nullable(),
  trackFlowIntensity: z.boolean(),
  wellnessPreference: shortText.nullable(),
  motivation: z.string().trim().max(1000, "Je motivatie mag maximaal 1000 tekens zijn.").nullable(),
  personalNote: z.string().trim().max(2000, "Je notitie mag maximaal 2000 tekens zijn.").nullable(),
  hasCycle: z.boolean(),
  lastPeriodStart: pastOrTodayDateSchema.nullable(),
  averageCycleLength: z
    .number()
    .int()
    .min(15, "Vul een gemiddelde cyclusduur tussen 15 en 60 dagen in.")
    .max(60, "Vul een gemiddelde cyclusduur tussen 15 en 60 dagen in.")
    .nullable(),
  averagePeriodLength: z
    .number()
    .int()
    .min(2, "Vul een menstruatieduur tussen 2 en 14 dagen in.")
    .max(14, "Vul een menstruatieduur tussen 2 en 14 dagen in.")
    .nullable(),
  regularity: z.enum(["regelmatig", "onregelmatig", "onbekend"]).nullable(),
  lifeStage: z.enum(["regelmatig", "veranderend", "perimenopauze", "menopauze", "onbekend"]).nullable(),
  perimenopauseInfo: z.string().trim().max(500, "Deze toelichting mag maximaal 500 tekens zijn.").nullable(),
  hormonalMedicationStatus: z
    .enum(["nee", "ht", "ac", "andere_hormonaal", "andere_medicatie", "onbekend_liever_niet"])
    .nullable(),
  showMedicationOnDashboard: z.boolean(),
  buddyStyles: z.array(shortText).max(8),
  buddyMessageFrequency: z.enum(["elke_dag", "paar_keer_per_week", "alleen_relevant", "uit"]).nullable(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

const FIELD_LABELS: Partial<Record<keyof UpdateProfileInput, string>> = {
  name: "naam",
  age: "leeftijd",
  heightCm: "lengte",
  weightKg: "gewicht",
  goalWeightKg: "streefgewicht",
  morningReminderTime: "tijd voor de ochtendherinnering",
  morningReminderDays: "dagen voor de ochtendherinnering",
  trainingFrequency: "trainingsfrequentie",
  lastPeriodStart: "startdatum van je laatste menstruatie",
  averageCycleLength: "gemiddelde cyclusduur",
  averagePeriodLength: "menstruatieduur",
}

/**
 * Per-parse fallback for issues without a custom message (e.g. a field that
 * is not a number), so she never sees Zod's English default text.
 */
export function profileIssueMessage(issue: { path?: PropertyKey[] }): string {
  const field = issue.path?.[0] as keyof UpdateProfileInput | undefined
  const label = field ? FIELD_LABELS[field] : undefined
  return label ? `Controleer je ${label}.` : "Controleer je invoer."
}
