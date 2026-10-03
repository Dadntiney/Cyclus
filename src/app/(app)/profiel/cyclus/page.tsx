import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { FEATURES } from "@/lib/navigation/features"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { loadProfileSettings } from "@/lib/data/profile-settings-page"

const ProfileForm = dynamic(
  () => import("@/components/profile/profile-form").then((m) => ({ default: m.ProfileForm })),
  { loading: () => <Skeleton className="h-48 w-full rounded-card" /> },
)

export const metadata: Metadata = { title: FEATURES.cyclusinstellingen.label }

export default async function ProfielCyclusPage() {
  const data = await loadProfileSettings()
  if (!data) return null

  return (
    <Page>
      <PageHeader title={FEATURES.cyclusinstellingen.label} subtitle="Lengte, regelmaat en levensfase." />
      <ProfileForm
        profile={data.profile!}
        cycleProfile={data.cycleProfile}
        hasMedications={data.hasMedications}
        group="cyclus"
      />
    </Page>
  )
}
