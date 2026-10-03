import Link from "next/link"
import { SectionHeader } from "@/components/ui/section-header"
import { DeleteAccountButton } from "@/components/profile/delete-account-button"
import { ExportDataButton } from "@/components/profile/export-data-button"
import { PrivacyConsentControls } from "@/components/profile/privacy-consent-controls"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"

const LINK = "font-medium text-sage-dark underline underline-offset-2"

/**
 * Privacy: one plain explanation, then what she agreed to, then what she
 * can do with her data. Sections sit inside the page's PageSections.
 */
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
    <>
      <section aria-label="Hoe we met je gegevens omgaan" className="flex flex-col gap-2">
        <p className="type-body text-ink-soft">
          {APP_DISPLAY_NAME} bewaart wat jij zelf invult (profiel, check-ins, cyclus en voorkeuren)
          om de app persoonlijker te maken. Gezondheidsgegevens verwerken we alleen met jouw
          toestemming. Hosting- en auth-partners helpen de app draaien; Buddy-AI wordt alleen
          gebruikt als jij dat apart toestaat.
        </p>
        <p className="type-body text-ink-soft">
          Lees de volledige{" "}
          <Link href="/privacy" className={LINK}>
            privacyverklaring
          </Link>{" "}
          en{" "}
          <Link href="/voorwaarden" className={LINK}>
            gebruiksvoorwaarden
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="toestemming">
        <SectionHeader id="toestemming" title="Toestemming" />
        <PrivacyConsentControls
          healthConsentAt={healthConsentAt}
          buddyAiConsentAt={buddyAiConsentAt}
          buddyAiAvailable={buddyAiAvailable}
        />
      </section>

      <section aria-labelledby="jouw-gegevens">
        <SectionHeader id="jouw-gegevens" title="Jouw gegevens" />
        <div className="flex flex-col gap-4">
          <ExportDataButton />
          <div className="border-t border-line pt-2">
            <DeleteAccountButton />
          </div>
        </div>
      </section>
    </>
  )
}
