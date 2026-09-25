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

export interface ActionState {
  error?: string
  success?: boolean
  testMode?: boolean
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

  const next = formData.get("next")
  if (typeof next === "string" && next && next !== "/login") {
    redirect(next)
  }
  redirect(onboardingCompleted ? "/vandaag" : "/onboarding")
}

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
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
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Er bestaat al een account met dit e-mailadres." }
    }
    return { error: "Registreren is niet gelukt. Probeer het opnieuw." }
  }

  if (!data.session) {
    if (isAuthTestMode()) {
      return {
        error:
          "Testmodus staat aan, maar Supabase vraagt nog om e-mailbevestiging. Zet 'Confirm email' uit bij Authentication → Providers → Email in het Supabase dashboard om dit tijdens de testfase te omzeilen.",
      }
    }
    return {
      error:
        "Check je e-mail om je account te bevestigen voordat je verder kunt.",
    }
  }

  redirect(isAuthTestMode() ? "/onboarding?testMode=1" : "/onboarding")
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

  const testMode = isAuthTestMode()

  if (!testMode) {
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
  return { success: true, testMode }
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
