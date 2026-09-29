import { Card } from "@/components/ui/card"
import { DeleteAccountButton } from "@/components/profile/delete-account-button"
import { ExportDataButton } from "@/components/profile/export-data-button"

export function PrivacySection() {
  return (
    <Card id="privacy" className="scroll-mt-24">
      <p className="text-sm text-ink-soft leading-relaxed mb-4">
        We bewaren alleen wat jij zelf invult — je profiel, check-ins en voorkeuren — om jouw
        advies persoonlijker te maken. Niemand anders ziet deze gegevens. Je kunt alles
        exporteren of je account verwijderen.
      </p>
      <ExportDataButton />
      <DeleteAccountButton />
    </Card>
  )
}
