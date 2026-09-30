import Link from "next/link"
import { Card } from "@/components/ui/card"
import { DeleteAccountButton } from "@/components/profile/delete-account-button"
import { ExportDataButton } from "@/components/profile/export-data-button"
import { PrivacyConsentControls } from "@/components/profile/privacy-consent-controls"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"

export function PrivacySection({
  healthConsentAt,
  buddyAiConsentAt,
  buddyAiAvailable,
}: {
  healthConsentAt: string | null
  buddyAiConsentAt: string | null
  buddyAiAvailable: boolean
}) {
  return (
    <Card id="privacy" className="scroll-mt-24 flex flex-col gap-5">
      <div>
        <p className="text-sm text-ink-soft leading-relaxed">
          {APP_DISPLAY_NAME} bewaart wat jij zelf invult — profiel, check-ins, cyclus en
          voorkeuren — om de app persoonlijker te maken. Gezondheidsgegevens verwerken we alleen
          met jouw toestemming. Hosting- en auth-partners helpen de app draaien; Buddy-AI wordt
          alleen gebruikt als jij dat apart toestaat.
        </p>
        <p className="text-sm text-ink-soft leading-relaxed mt-2">
          Lees de volledige{" "}
          <Link href="/privacy" className="text-sage-dark font-medium underline-offset-2 hover:underline">
            privacyverklaring
          </Link>{" "}
          en{" "}
          <Link href="/voorwaarden" className="text-sage-dark font-medium underline-offset-2 hover:underline">
            gebruiksvoorwaarden
          </Link>
          .
        </p>
      </div>

      <PrivacyConsentControls
        healthConsentAt={healthConsentAt}
        buddyAiConsentAt={buddyAiConsentAt}
        buddyAiAvailable={buddyAiAvailable}
      />

      <div className="border-t border-line/60 pt-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-ink">Jouw gegevens</p>
        <ExportDataButton />
        <DeleteAccountButton />
      </div>
    </Card>
  )
}
