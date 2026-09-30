import Link from "next/link"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-cream text-ink px-6 py-12">
      <div className="mx-auto max-w-xl flex flex-col gap-6">
        <p className="text-sm text-sage-dark font-medium">{APP_DISPLAY_NAME}</p>
        <h1 className="font-display text-3xl text-ink">Gebruiksvoorwaarden</h1>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Gebruik van de app</h2>
          <p>
            {APP_DISPLAY_NAME} is bedoeld als persoonlijke ondersteuning rondom cyclus, energie,
            voeding, rust en welzijn. Je gebruikt de app voor eigen rekening en houdt zelf de
            regie over keuzes die je maakt.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Geen medische dienst</h2>
          <p>
            Informatie, tips en Buddy-antwoorden zijn geen medisch advies, diagnose of
            behandeling. Twijfel je of heb je ernstige klachten? Neem contact op met een
            zorgprofessional.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Jouw account</h2>
          <p>
            Je bent verantwoordelijk voor het geheimhouden van je inloggegevens. Misbruik of
            schade via jouw account meld je zo snel mogelijk.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Privacy</h2>
          <p>
            Hoe we met jouw gegevens omgaan, staat in de{" "}
            <Link href="/privacy" className="text-sage-dark font-medium underline-offset-2 hover:underline">
              privacyverklaring
            </Link>
            . Voor gezondheidsgegevens en Buddy-AI vragen we aparte toestemming.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Wijzigingen</h2>
          <p>
            We mogen deze voorwaarden of de app aanpassen. Bij materiële wijzigingen informeren
            we je waar redelijk — bijvoorbeeld via de app.
          </p>
        </section>

        <Link href="/registreren" className="text-sm text-sage-dark font-medium hover:underline pt-2">
          ← Terug
        </Link>
      </div>
    </main>
  )
}
