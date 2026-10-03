import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { RemindersSection } from "@/components/profile/reminders-section"
import { PushNotificationsCard } from "@/components/notifications/push-notifications-card"
import { loadProfileSettings } from "@/lib/data/profile-settings-page"

const ProfileForm = dynamic(
  () => import("@/components/profile/profile-form").then((m) => ({ default: m.ProfileForm })),
  { loading: () => <Skeleton className="h-32 w-full rounded-card" /> },
)

export const metadata: Metadata = { title: FEATURES.meldingen.label }

/**
 * Meldingen: first whether GoFiev may reach this device at all, then the
 * morning message, then her own reminders. Everything here is optional.
 */
export default async function ProfielMeldingenPage() {
  const data = await loadProfileSettings()
  if (!data?.profile) return null

  return (
    <Page>
      <PageHeader
        title={FEATURES.meldingen.label}
        subtitle="Wanneer GoFiev zich laat horen. Alles hier is optioneel."
      />
      <PageSections>
        <div className="flex flex-col gap-3">
          <PushNotificationsCard />
          <ProfileForm
            profile={data.profile}
            cycleProfile={data.cycleProfile}
            hasMedications={data.hasMedications}
            group="meldingen"
          />
        </div>
        <RemindersSection
          initialReminders={data.reminders}
          movementEnabled={data.profile.movement_enabled}
          nutritionEnabled={data.profile.nutrition_enabled}
          mentalWellbeingEnabled={data.profile.mental_wellbeing_enabled === true}
        />
      </PageSections>
    </Page>
  )
}
