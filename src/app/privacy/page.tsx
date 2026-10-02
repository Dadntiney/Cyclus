import Link from "next/link"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"
import { PRIVACY_POLICY_VERSION } from "@/lib/legal/versions"

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-cream text-ink px-6 py-12">
      <div className="mx-auto max-w-xl flex flex-col gap-6">
        <p className="text-sm text-sage-dark font-medium">{APP_DISPLAY_NAME}</p>
        <h1 className="font-display text-3xl text-ink">Privacyverklaring</h1>
        <p className="text-sm text-ink-soft">Versie {PRIVACY_POLICY_VERSION}</p>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Wie zijn wij?</h2>
          <p>
            {APP_DISPLAY_NAME} helpt je om je cyclus, energie, voeding, rust en welzijn beter te
            begrijpen — met jou aan het roer. Voor vragen over privacy kun je contact opnemen via
            het e-mailadres waarmee je het product beheert (zie je accountinstellingen of de
            website waarop {APP_DISPLAY_NAME} wordt aangeboden).
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Welke gegevens verwerken we?</h2>
          <p>Alleen wat jij zelf invult of toestaat, bijvoorbeeld:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-ink-soft">
            <li>Accountgegevens (e-mail, wachtwoord via onze auth-dienst)</li>
            <li>
              Gezondheids- en cyclusgegevens (check-ins, menstruatie, medicatie, slaap, dagboek,
              voorkeuren) — dit zijn bijzondere persoonsgegevens
            </li>
            <li>Gesprekken met Buddy (als je die gebruikt)</li>
            <li>Technische gegevens die nodig zijn om ingelogd te blijven (auth-cookies)</li>
          </ul>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Waarom / rechtsgrond</h2>
          <p>
            We verwerken gegevens om de app te laten werken en persoonlijker te maken
            (overeenkomst / gerechtvaardigd belang voor strikt noodzakelijke techniek). Voor
            gezondheids- en cyclusgegevens vragen we jouw{" "}
            <strong className="font-medium text-ink">uitdrukkelijke toestemming</strong> (AVG
            art. 9). Je mag die toestemming intrekken; dan kun je de app mogelijk niet meer
            volledig gebruiken totdat je opnieuw toestemt of je account verwijdert.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Buddy en AI</h2>
          <p>
            Buddy kan lokaal (regelgebaseerd) antwoorden, of — alleen als jij dat apart toestaat —
            een AI-leverancier gebruiken. Dan kunnen relevante contextregels uit jouw profiel en
            recente check-ins meegestuurd worden om een antwoord te formuleren. Zonder die
            toestemming sturen we geen Buddy-context naar een externe AI.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Verwerkers</h2>
          <p>
            We gebruiken dienstverleners om de app te hosten en te laten draaien, waaronder
            database/auth/opslag (Supabase), hosting (Vercel), foutmeldingen (Sentry) en — alleen
            met jouw Buddy-AI-toestemming — een AI-provider. Naar Sentry gaat alleen technische
            informatie over een fout (wat er misging en op welke pagina), zonder je naam, e-mail,
            IP-adres of wat je hebt ingevuld. Met hen bestaan passende verwerkersafspraken waar dat
            vereist is.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Bewaartermijn</h2>
          <p>
            We bewaren je gegevens zolang je account actief is. Je kunt je gegevens exporteren of
            je account (en daarmee je data in onze database) verwijderen via Privacy in je
            profiel. Auth-cookies blijven staan tot je uitlogt of ze verlopen.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Jouw rechten</h2>
          <p>
            Je hebt recht op inzage, correctie, export, verwijdering en bezwaar, en op het
            intrekken van toestemming. Gebruik daarvoor de knoppen onder Profiel → Privacy, of
            neem contact met ons op.
          </p>
        </section>

        <section className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
          <h2 className="font-display text-xl">Geen medisch advies</h2>
          <p>
            {APP_DISPLAY_NAME} is informatief en ondersteunend — geen diagnose en geen vervanging
            van een arts. Bij ernstige of aanhoudende klachten: zoek professionele zorg.
          </p>
        </section>

        <p className="text-sm text-ink-soft pt-4 border-t border-line">
          Zie ook de{" "}
          <Link href="/voorwaarden" className="text-sage-dark font-medium underline-offset-2 hover:underline">
            gebruiksvoorwaarden
          </Link>
          .
        </p>
        <Link href="/registreren" className="text-sm text-sage-dark font-medium hover:underline">
          ← Terug
        </Link>
      </div>
    </main>
  )
}
