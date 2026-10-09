import type { Metadata } from "next"
import Link from "next/link"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"
import { PRIVACY_POLICY_TITLE, PRIVACY_POLICY_VERSION } from "@/lib/legal/versions"
import { formatLongDate } from "@/lib/dates/format"
import { LegalList, LegalPage, LegalSection, legalLinkClass } from "./_legal/legal-page"

export const metadata: Metadata = { title: PRIVACY_POLICY_TITLE }

// One list for "Op deze pagina" and the headings themselves, so the table
// of contents always repeats the h2 titles word for word.
const S = {
  wie: { id: "wie-zijn-wij", title: "Wie zijn wij?" },
  gegevens: { id: "welke-gegevens", title: "Welke gegevens verwerken we?" },
  rechtsgrond: { id: "rechtsgrond", title: "Waarom / rechtsgrond" },
  buddy: { id: "buddy-en-ai", title: "Buddy en AI" },
  verwerkers: { id: "verwerkers", title: "Verwerkers" },
  bewaartermijn: { id: "bewaartermijn", title: "Bewaartermijn" },
  rechten: { id: "jouw-rechten", title: "Jouw rechten" },
  medisch: { id: "geen-medisch-advies", title: "Geen medisch advies" },
} as const

export default function PrivacyPage() {
  return (
    <LegalPage
      title={PRIVACY_POLICY_TITLE}
      subtitle={`Versie van ${formatLongDate(PRIVACY_POLICY_VERSION, { year: true })}`}
      sections={Object.values(S)}
    >
      <LegalSection {...S.wie}>
        <p>
          {APP_DISPLAY_NAME} helpt je om je cyclus, energie, voeding, rust en welzijn beter te
          begrijpen — met jou aan het roer. Voor vragen over privacy kun je contact opnemen via
          het e-mailadres waarmee je het product beheert (zie je accountinstellingen of de
          website waarop {APP_DISPLAY_NAME} wordt aangeboden).
        </p>
      </LegalSection>

      <LegalSection {...S.gegevens}>
        <p>Alleen wat jij zelf invult of toestaat, bijvoorbeeld:</p>
        <LegalList>
          <li>Accountgegevens (e-mail, wachtwoord via onze auth-dienst)</li>
          <li>
            Gezondheids- en cyclusgegevens (check-ins, menstruatie, medicatie, slaap, dagboek,
            voorkeuren) — dit zijn bijzondere persoonsgegevens
          </li>
          <li>Gesprekken met Buddy (als je die gebruikt)</li>
          <li>Technische gegevens die nodig zijn om ingelogd te blijven (auth-cookies)</li>
        </LegalList>
      </LegalSection>

      <LegalSection {...S.rechtsgrond}>
        <p>
          We verwerken gegevens om de app te laten werken en persoonlijker te maken
          (overeenkomst / gerechtvaardigd belang voor strikt noodzakelijke techniek). Voor
          gezondheids- en cyclusgegevens vragen we jouw{" "}
          <strong className="font-medium text-ink">uitdrukkelijke toestemming</strong> (AVG
          art. 9). Je mag die toestemming intrekken; dan kun je de app mogelijk niet meer
          volledig gebruiken totdat je opnieuw toestemt of je account verwijdert.
        </p>
      </LegalSection>

      <LegalSection {...S.buddy}>
        <p>
          Buddy kan lokaal (regelgebaseerd) antwoorden, of — alleen als jij dat apart toestaat —
          een AI-leverancier gebruiken. Dan kunnen relevante contextregels uit jouw profiel en
          recente check-ins meegestuurd worden om een antwoord te formuleren. Zonder die
          toestemming sturen we geen Buddy-context naar een externe AI.
        </p>
      </LegalSection>

      <LegalSection {...S.verwerkers}>
        <p>
          We gebruiken dienstverleners om de app te hosten en te laten draaien, waaronder
          database/auth/opslag (Supabase), hosting (Vercel), foutmeldingen (Sentry) en — alleen
          met jouw Buddy-AI-toestemming — een AI-provider. Naar Sentry gaat alleen technische
          informatie over een fout (wat er misging en op welke pagina), zonder je naam, e-mail,
          IP-adres of wat je hebt ingevuld. Met hen bestaan passende verwerkersafspraken waar dat
          vereist is.
        </p>
      </LegalSection>

      <LegalSection {...S.bewaartermijn}>
        <p>
          We bewaren je gegevens zolang je account actief is. Je kunt je gegevens exporteren of
          je account (en daarmee je data in onze database) verwijderen via Privacy in je
          profiel. Auth-cookies blijven staan tot je uitlogt of ze verlopen.
        </p>
      </LegalSection>

      <LegalSection {...S.rechten}>
        <p>
          Je hebt recht op inzage, correctie, export, verwijdering en bezwaar, en op het
          intrekken van toestemming. Gebruik daarvoor de knoppen onder Profiel → Privacy, of
          neem contact met ons op.
        </p>
      </LegalSection>

      <LegalSection {...S.medisch}>
        <p>
          {APP_DISPLAY_NAME} is informatief en ondersteunend — geen diagnose en geen vervanging
          van een arts. Bij ernstige of aanhoudende klachten: zoek professionele zorg.
        </p>
      </LegalSection>

      <p className="border-t border-line pt-6 text-base text-ink">
        Zie ook de{" "}
        <Link href="/voorwaarden" className={legalLinkClass}>
          gebruiksvoorwaarden
        </Link>
        .
      </p>
    </LegalPage>
  )
}
