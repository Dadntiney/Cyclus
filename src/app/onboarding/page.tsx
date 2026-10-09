import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { PRIVACY_POLICY_VERSION } from "@/lib/legal/versions"

export const metadata: Metadata = { title: "Welkom" }

export default async function OnboardingPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, name, health_data_consent_at, health_data_consent_version")
    .eq("id", user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect("/vandaag")
  }

  return (
    <main className="min-h-dvh bg-cream">
      <OnboardingWizard
        initialName={profile?.name ?? ""}
        consentGiven={
          Boolean(profile?.health_data_consent_at) &&
          profile?.health_data_consent_version === PRIVACY_POLICY_VERSION
        }
      />
    </main>
  )
}
