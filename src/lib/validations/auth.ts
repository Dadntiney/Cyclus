import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in."),
  password: z.string().min(1, "Vul je wachtwoord in."),
})

export const registerSchema = z.object({
  email: z.string().email("Vul een geldig e-mailadres in."),
  password: z.string().min(8, "Je wachtwoord moet minstens 8 tekens bevatten."),
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
