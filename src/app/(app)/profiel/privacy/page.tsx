import { BackButton } from "@/components/ui/back-button"
import { PrivacySection } from "@/components/profile/privacy-section"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { isBuddyAiConfigured } from "@/lib/buddy"

export default async function ProfielPrivacyPage() {
  const user = await getAuthedUser()
  const profile = user ? await getProfile(user.id) : null

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-5">
      <div>
        <BackButton href="/profiel" label="Profiel" />
        <h1 className="font-display text-3xl lg:text-4xl text-ink">Privacy & gegevens</h1>
        <p className="text-sm text-ink-soft mt-1">Jouw data blijft van jou.</p>
      </div>
      <PrivacySection
        healthConsentAt={profile?.health_data_consent_at ?? null}
        buddyAiConsentAt={profile?.buddy_ai_consent_at ?? null}
        buddyAiAvailable={isBuddyAiConfigured()}
      />
    </div>
  )
}
