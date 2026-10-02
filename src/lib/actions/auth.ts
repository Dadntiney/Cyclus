"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth"
import { safeNextPath } from "@/lib/safe-redirect"

export interface ActionState {
  error?: string
  success?: boolean
}

// Temporary test-phase switch: when enabled, auth flows that would normally
// send a Supabase email are short-circuited so the app can be tested without
// a working SMTP/email quota. Set AUTH_TEST_MODE=false (or unset) to restore
// normal behavior once going live — no other code path changes.
const isAuthTestMode = () => process.env.AUTH_TEST_MODE === "true"

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) {
    return { error: "E-mailadres of wachtwoord klopt niet." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let onboardingCompleted = false
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single()
    onboardingCompleted = profile?.onboarding_completed ?? false
  }

  const next = safeNextPath(formData.get("next"))
  if (next && next !== "/login" && !next.startsWith("/login?")) {
    redirect(next)
  }
  redirect(onboardingCompleted ? "/vandaag" : "/onboarding")
}

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const consentRaw = formData.get("healthDataConsent")
  const termsRaw = formData.get("acceptTerms")
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    healthDataConsent: consentRaw === "on" || consentRaw === "true" ? true : consentRaw,
    acceptTerms: termsRaw === "on" || termsRaw === "true" ? true : termsRaw,
    privacyPolicyVersion: formData.get("privacyPolicyVersion"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const originHeader = (await headers()).get("origin")
  const origin = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? ""

  const { error, data } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      data: {
        health_data_consent: true,
        health_data_consent_version: parsed.data.privacyPolicyVersion,
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Er bestaat al een account met dit e-mailadres." }
    }
    return { error: "Registreren is niet gelukt. Probeer het opnieuw." }
  }

  // Ensure consent is stored even if the trigger missed metadata (e.g. older DB).
  if (data.user) {
    await supabase
      .from("profiles")
      .update({
        health_data_consent_at: new Date().toISOString(),
        health_data_consent_version: parsed.data.privacyPolicyVersion,
      })
      .eq("id", data.user.id)
  }

  if (!data.session) {
    return {
      error:
        "Check je e-mail om je account te bevestigen voordat je verder kunt.",
    }
  }

  redirect("/onboarding")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function forgotPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  if (!isAuthTestMode()) {
    const supabase = await createClient()
    const originHeader = (await headers()).get("origin")
    const origin = originHeader ?? process.env.NEXT_PUBLIC_SITE_URL ?? ""

    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=/wachtwoord-resetten`,
    })
  }

  // Always report success, regardless of whether the email exists, so we
  // don't leak which addresses have an account. In test mode we skip the
  // actual Supabase call entirely so it never touches the email quota.
  return { success: true }
}

export async function resetPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      error: "Je resetlink is verlopen. Vraag een nieuwe link aan.",
    }
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    return { error: "Wachtwoord resetten is niet gelukt. Probeer het opnieuw." }
  }

  redirect("/vandaag")
}
