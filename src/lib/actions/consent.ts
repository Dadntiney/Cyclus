"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { PRIVACY_POLICY_VERSION } from "@/lib/legal/versions"

export async function acceptHealthDataConsent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("profiles")
    .update({
      health_data_consent_at: new Date().toISOString(),
      health_data_consent_version: PRIVACY_POLICY_VERSION,
    })
    .eq("id", user.id)

  if (error) return { error: "Toestemming opslaan is niet gelukt." }
  revalidatePath("/", "layout")
  return { success: true as const }
}

export async function acceptBuddyAiConsent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("profiles")
    .update({
      buddy_ai_consent_at: new Date().toISOString(),
      buddy_ai_consent_version: PRIVACY_POLICY_VERSION,
    })
    .eq("id", user.id)

  if (error) return { error: "Toestemming opslaan is niet gelukt." }
  revalidatePath("/buddy")
  revalidatePath("/profiel/privacy")
  return { success: true as const }
}

export async function revokeBuddyAiConsent() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("profiles")
    .update({
      buddy_ai_consent_at: null,
      buddy_ai_consent_version: null,
    })
    .eq("id", user.id)

  if (error) return { error: "Intrekken is niet gelukt." }
  revalidatePath("/buddy")
  revalidatePath("/profiel/privacy")
  return { success: true as const }
}
