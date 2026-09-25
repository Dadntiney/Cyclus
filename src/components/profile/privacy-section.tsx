import { Card } from "@/components/ui/card"
import { DeleteAccountButton } from "@/components/profile/delete-account-button"

export function PrivacySection() {
  return (
    <Card>
      <h2 className="font-display text-lg text-ink mb-2">Privacy & gegevens</h2>
      <p className="text-sm text-ink-soft leading-relaxed mb-4">
        We bewaren alleen wat jij zelf invult — je profiel, check-ins en voorkeuren — om jouw
        advies persoonlijker te maken. Niemand anders ziet deze gegevens. Je kunt alles op deze
        pagina op elk moment aanpassen of verwijderen.
      </p>
      <DeleteAccountButton />
    </Card>
  )
}
