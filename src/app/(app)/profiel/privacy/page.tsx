import { BackButton } from "@/components/ui/back-button"
import { PrivacySection } from "@/components/profile/privacy-section"

export default function ProfielPrivacyPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-5">
      <div>
        <BackButton href="/profiel" label="Profiel" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Privacy & gegevens</h1>
        <p className="text-sm text-ink-soft mt-1">Jouw data blijft van jou.</p>
      </div>
      <PrivacySection />
    </div>
  )
}
