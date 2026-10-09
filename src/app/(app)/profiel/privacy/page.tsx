import type { Metadata } from "next"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { PrivacySection } from "@/components/profile/privacy-section"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { isBuddyAiConfigured } from "@/lib/buddy"

export const metadata: Metadata = { title: FEATURES.privacy.label }

export default async function ProfielPrivacyPage() {
  const user = await getAuthedUser()
  const profile = user ? await getProfile(user.id) : null

  return (
    <Page>
      <PageHeader title={FEATURES.privacy.label} subtitle="Jouw gegevens blijven van jou." />
      <PageSections>
        <PrivacySection
          healthConsentAt={profile?.health_data_consent_at ?? null}
          buddyAiConsentAt={profile?.buddy_ai_consent_at ?? null}
          buddyAiAvailable={isBuddyAiConfigured()}
        />
      </PageSections>
    </Page>
  )
}
