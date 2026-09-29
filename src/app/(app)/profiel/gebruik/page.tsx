import Link from "next/link"
import dynamic from "next/dynamic"
import { ChevronRight } from "lucide-react"
import { BackButton } from "@/components/ui/back-button"
import { loadProfileSettings } from "@/lib/data/profile-settings-page"

const ProfileForm = dynamic(
  () => import("@/components/profile/profile-form").then((m) => ({ default: m.ProfileForm })),
  {
    loading: () => (
      <div className="rounded-2xl border border-line/70 bg-surface p-5 min-h-48 skeleton" aria-hidden />
    ),
  },
)

export default async function ProfielGebruikPage() {
  const data = await loadProfileSettings()
  if (!data) return null

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-5">
      <div>
        <BackButton href="/profiel" label="Profiel" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Wat ik gebruik</h1>
        <p className="text-sm text-ink-soft mt-1">
          Zet aan wat bij je past. Niets is verplicht.
        </p>
        <Link
          href="/voor-jou"
          className="mt-2 inline-flex items-center gap-0.5 min-h-11 text-sm font-medium text-sage-dark touch-manipulation"
        >
          Modules openen
          <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      </div>
      <ProfileForm
        profile={data.profile!}
        cycleProfile={data.cycleProfile}
        hasMedications={data.hasMedications}
        group="modules"
      />
    </div>
  )
}
