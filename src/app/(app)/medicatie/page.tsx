import Link from "next/link"
import { ChevronLeft, Plus, Pill } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getMedications } from "@/lib/data/medications"
import { MEDICATION_CATEGORY_OPTIONS } from "@/lib/constants"
import { MedicationList } from "@/components/medication/medication-list"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"

export default async function MedicatiePage() {
  const user = await getAuthedUser()
  if (!user) return null

  const medications = await getMedications(user.id)

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <Link
        href="/profiel"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft mb-4 touch-manipulation"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Mijn profiel
      </Link>

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-ink">Mijn medicatie</h1>
        <Link href="/medicatie/nieuw" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Toevoegen
        </Link>
      </div>
      <p className="text-sm text-ink-soft mb-6">
        Jouw eigen overzicht van hormoontherapie, anticonceptie of andere medicatie — precies
        zoals jij het van je arts, apotheker of bijsluiter hebt gekregen.
      </p>

      {medications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Pill className="h-6 w-6" strokeWidth={1.5} />}
            title="Je hebt nog niets toegevoegd"
            description="Voeg je eigen voorgeschreven schema toe wanneer jij dat wilt."
            action={
              <Link href="/medicatie/nieuw" className={buttonVariants()}>
                <Plus className="h-4 w-4" strokeWidth={2} />
                Toevoegen
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {MEDICATION_CATEGORY_OPTIONS.map((cat) => {
            const items = medications.filter((m) => m.category === cat.value)
            if (items.length === 0) return null
            return (
              <section key={cat.value}>
                <h2 className="font-display text-lg text-ink mb-2.5">
                  <span aria-hidden>{cat.emoji}</span> {cat.label}
                </h2>
                <MedicationList medications={items} />
              </section>
            )
          })}
        </div>
      )}

      <p className="text-xs text-ink-soft mt-6 leading-relaxed">
        Dit is jouw eigen registratie. Cyclus geeft geen medisch advies en bepaalt niet welke
        dosering of behandeling voor jou geschikt is. Voer alleen in wat je van je arts,
        apotheker of bijsluiter hebt gekregen.
      </p>
    </div>
  )
}
