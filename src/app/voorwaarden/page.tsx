import type { Metadata } from "next"
import Link from "next/link"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"
import { TERMS_TITLE } from "@/lib/legal/versions"
import { LegalPage, LegalSection, legalLinkClass } from "@/app/privacy/_legal/legal-page"

export const metadata: Metadata = { title: TERMS_TITLE }

// One list for "Op deze pagina" and the headings themselves, so the table
// of contents always repeats the h2 titles word for word.
const S = {
  gebruik: { id: "gebruik-van-de-app", title: "Gebruik van de app" },
  medisch: { id: "geen-medische-dienst", title: "Geen medische dienst" },
  account: { id: "jouw-account", title: "Jouw account" },
  privacy: { id: "privacy", title: "Privacy" },
  wijzigingen: { id: "wijzigingen", title: "Wijzigingen" },
} as const

export default function TermsPage() {
  return (
    <LegalPage title={TERMS_TITLE} sections={Object.values(S)}>
      <LegalSection {...S.gebruik}>
        <p>
          {APP_DISPLAY_NAME} is bedoeld als persoonlijke ondersteuning rondom cyclus, energie,
          voeding, rust en welzijn. Je gebruikt de app voor eigen rekening en houdt zelf de
          regie over keuzes die je maakt.
        </p>
      </LegalSection>

      <LegalSection {...S.medisch}>
        <p>
          Informatie, tips en Buddy-antwoorden zijn geen medisch advies, diagnose of
          behandeling. Twijfel je of heb je ernstige klachten? Neem contact op met een
          zorgprofessional.
        </p>
      </LegalSection>

      <LegalSection {...S.account}>
        <p>
          Je bent verantwoordelijk voor het geheimhouden van je inloggegevens. Misbruik of
          schade via jouw account meld je zo snel mogelijk.
        </p>
      </LegalSection>

      <LegalSection {...S.privacy}>
        <p>
          Hoe we met jouw gegevens omgaan, staat in de{" "}
          <Link href="/privacy" className={legalLinkClass}>
            privacyverklaring
          </Link>
          . Voor gezondheidsgegevens en Buddy-AI vragen we aparte toestemming.
        </p>
      </LegalSection>

      <LegalSection {...S.wijzigingen}>
        <p>
          We mogen deze voorwaarden of de app aanpassen. Bij materiële wijzigingen informeren
          we je waar redelijk — bijvoorbeeld via de app.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
