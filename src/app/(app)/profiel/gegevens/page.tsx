import dynamic from "next/dynamic"
import { BackButton } from "@/components/ui/back-button"
import { loadProfileSettings } from "@/lib/data/profile-settings-page"

const ProfileForm = dynamic(
  () => import("@/components/profile/profile-form").then((m) => ({ default: m.ProfileForm })),
  {
    loading: () => (
      <div className="rounded-[1.25rem] bg-surface border border-line p-5 min-h-48 skeleton" aria-hidden />
    ),
  },
)

export default async function ProfielGegevensPage() {
  const data = await loadProfileSettings()
  if (!data) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-5">
      <div>
        <BackButton href="/profiel" label="Profiel" />
        <h1 className="font-display text-3xl lg:text-4xl text-ink">Mijn gegevens</h1>
        <p className="text-sm text-ink-soft mt-1">Wat jij over jezelf deelt — alleen voor jou.</p>
      </div>
      <ProfileForm
        profile={data.profile!}
        cycleProfile={data.cycleProfile}
        hasMedications={data.hasMedications}
        group="account"
      />
    </div>
  )
}
