import { z } from "zod"
import { PRIVACY_POLICY_VERSION } from "@/lib/legal/versions"

export const loginSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in."),
  password: z.string().min(1, "Vul je wachtwoord in."),
})

export const registerSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in."),
  password: z.string().min(8, "Je wachtwoord moet minstens 8 tekens bevatten."),
  healthDataConsent: z.literal(true, {
    message: "Geef toestemming voor het verwerken van je gezondheidsgegevens om verder te gaan.",
  }),
  acceptTerms: z.literal(true, {
    message: "Accepteer de gebruiksvoorwaarden om verder te gaan.",
  }),
  privacyPolicyVersion: z.literal(PRIVACY_POLICY_VERSION),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in."),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Je wachtwoord moet minstens 8 tekens bevatten."),
    confirmPassword: z.string().min(8, "Bevestig je nieuwe wachtwoord."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Wachtwoorden komen niet overeen.",
    path: ["confirmPassword"],
  })
