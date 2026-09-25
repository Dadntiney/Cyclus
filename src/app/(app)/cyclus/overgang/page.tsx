import Link from "next/link"
import { ChevronLeft, Stethoscope } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { LIFE_STAGE_KNOWLEDGE } from "@/lib/cycle/life-stage-knowledge"
import { Card } from "@/components/ui/card"
import { BodyChangeList } from "@/components/cycle/body-change-list"
import { Expandable } from "@/components/ui/expandable"

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

export default async function OvergangPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const { data: cycleProfile } = await supabase
    .from("cycle_profiles")
    .select("perimenopause_information")
    .eq("user_id", user.id)
    .maybeSingle()

  const today = new Date().toISOString().slice(0, 10)
  const funFact =
    LIFE_STAGE_KNOWLEDGE.funFacts[seededIndex(`${user.id}-${today}-lifestage`, LIFE_STAGE_KNOWLEDGE.funFacts.length)]

  const highlightSignals = LIFE_STAGE_KNOWLEDGE.signals.filter((s) => s.highlight)
  const moreSignals = LIFE_STAGE_KNOWLEDGE.signals.filter((s) => !s.highlight)

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <Link
        href="/cyclus"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft mb-4 touch-manipulation"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Mijn cyclus
      </Link>

      <div className="rounded-3xl p-5 lg:p-6 mb-6 bg-info-soft">
        <p className="text-xs font-semibold uppercase tracking-wide text-info">Cyclus & ouder worden</p>
        <p className="font-display text-2xl text-ink mt-1">De overgang, uitgelegd</p>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">{LIFE_STAGE_KNOWLEDGE.intro}</p>
      </div>

      <div className="flex flex-col gap-5">
        <section>
          <h2 className="font-display text-lg text-ink mb-2.5">Hoe je cyclus kan veranderen</h2>
          <Card>
            <div className="flex flex-col gap-4">
              {LIFE_STAGE_KNOWLEDGE.ageChanges.map((section) => (
                <div key={section.heading}>
                  <p className="text-sm font-medium text-ink mb-1">{section.heading}</p>
                  <p className="text-sm text-ink-soft leading-relaxed">{section.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink mb-2.5">Wat is perimenopauze?</h2>
          <Card>
            <p className="text-sm text-ink-soft leading-relaxed">{LIFE_STAGE_KNOWLEDGE.whatIsPerimenopause}</p>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink mb-2.5">Signalen die je kunt herkennen</h2>
          <Card>
            <BodyChangeList items={highlightSignals} />
          </Card>
        </section>

        <section>
          <Card className="bg-sage-soft border-transparent">
            <p className="text-xs font-medium text-sage-dark mb-1">Wist je dat...?</p>
            <p className="text-sm text-ink leading-relaxed">{funFact}</p>
          </Card>
        </section>

        <Expandable label="Meer weten over de overgang">
          <div className="flex flex-col gap-4">
            <Card>
              <p className="text-sm font-medium text-ink mb-3">Meer signalen</p>
              <BodyChangeList items={moreSignals} />
            </Card>
            <Card>
              <p className="text-sm font-medium text-ink mb-2">Wat kan normaal zijn?</p>
              <p className="text-sm text-ink-soft leading-relaxed">{LIFE_STAGE_KNOWLEDGE.normalNote}</p>
            </Card>
            <Card className="bg-cream-soft border-transparent">
              <div className="flex gap-2.5">
                <Stethoscope className="h-4 w-4 text-ink-soft shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-sm font-medium text-ink mb-1.5">Wanneer een zorgverlener inschakelen?</p>
                  <p className="text-sm text-ink-soft leading-relaxed">{LIFE_STAGE_KNOWLEDGE.whenToTalkToDoctor}</p>
                </div>
              </div>
            </Card>
          </div>
        </Expandable>

        {cycleProfile?.perimenopause_information && (
          <section>
            <h2 className="font-display text-lg text-ink mb-2.5">Wat jij hierover met ons deelde</h2>
            <Card>
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                {cycleProfile.perimenopause_information}
              </p>
              <Link
                href="/profiel#cyclus"
                className="inline-block text-xs font-medium text-sage-dark mt-3 touch-manipulation"
              >
                Aanpassen in je profiel
              </Link>
            </Card>
          </section>
        )}

        <p className="text-xs text-ink-soft px-1 leading-relaxed">
          Deze uitleg is algemene, informatieve content — geen medisch advies en geen diagnose.
          Iedere vrouw ervaart deze levensfase anders; bij twijfel of zorgwekkende klachten is
          overleg met een arts of andere zorgverlener altijd een goede stap.
        </p>
      </div>
    </div>
  )
}
