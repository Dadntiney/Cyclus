import dynamic from "next/dynamic"
import { BackButton } from "@/components/ui/back-button"
import { loadProfileSettings } from "@/lib/data/profile-settings-page"

const ProfileForm = dynamic(
  () => import("@/components/profile/profile-form").then((m) => ({ default: m.ProfileForm })),
  {
    loading: () => (
      <div className="rounded-3xl bg-sage-soft/50 p-5 min-h-48 skeleton" aria-hidden />
    ),
  },
)

export default async function ProfielBuddyPage() {
  const data = await loadProfileSettings()
  if (!data) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-5">
      <div>
        <BackButton href="/profiel" label="Profiel" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Buddy</h1>
        <p className="text-sm text-ink-soft mt-1">De toon van je berichten en tips.</p>
      </div>
      <ProfileForm
        profile={data.profile!}
        cycleProfile={data.cycleProfile}
        hasMedications={data.hasMedications}
        group="buddy"
      />
    </div>
  )
}
