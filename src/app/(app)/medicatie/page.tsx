import type { Metadata } from "next"
import Link from "next/link"
import { Plus, Pill } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getMedications } from "@/lib/data/medications"
import { MEDICATION_CATEGORY_OPTIONS } from "@/lib/constants"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { MedicationList } from "@/components/medication/medication-list"
import { EmptyState } from "@/components/ui/empty-state"
import { IconButton } from "@/components/ui/icon-button"
import { SectionHeader } from "@/components/ui/section-header"
import { buttonVariants } from "@/components/ui/button"
import { ICON } from "@/lib/ui/icon"

export const metadata: Metadata = { title: FEATURES.medicatie.label }

export default async function MedicatiePage() {
  const user = await getAuthedUser()
  if (!user) return null

  const medications = await getMedications(user.id)

  return (
    <Page>
      <PageHeader
        title={FEATURES.medicatie.label}
        subtitle="Je eigen overzicht, zoals je het voorgeschreven kreeg."
        action={
          medications.length > 0 ? (
            <IconButton href="/medicatie/nieuw" label="Medicatie toevoegen" icon={Plus} />
          ) : undefined
        }
      />

      <PageSections>
        {medications.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="Je hebt nog niets toegevoegd"
            description="Hormoontherapie, anticonceptie of andere medicatie: voeg je eigen voorgeschreven schema toe wanneer jij dat wilt."
            action={
              <Link href="/medicatie/nieuw" className={buttonVariants()}>
                <Plus {...ICON.md} aria-hidden />
                Medicatie toevoegen
              </Link>
            }
          />
        ) : (
          MEDICATION_CATEGORY_OPTIONS.map((cat) => {
            const items = medications.filter((m) => m.category === cat.value)
            if (items.length === 0) return null
            const headingId = `medicatie-${cat.value}`
            return (
              <section key={cat.value} aria-labelledby={headingId}>
                <SectionHeader id={headingId} title={cat.label} />
                <MedicationList medications={items} />
              </section>
            )
          })
        )}

        <p className="type-caption text-ink-soft">
          Dit is jouw eigen registratie. GoFiev geeft geen medisch advies en bepaalt niet welke
          dosering of behandeling voor jou geschikt is. Voer alleen in wat je van je arts,
          apotheker of bijsluiter hebt gekregen.
        </p>
      </PageSections>
    </Page>
  )
}
