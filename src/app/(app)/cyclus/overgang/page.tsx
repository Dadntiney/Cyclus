import Link from "next/link"
import { Stethoscope } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates/amsterdam"
import { LIFE_STAGE_KNOWLEDGE } from "@/lib/cycle/life-stage-knowledge"
import { Card } from "@/components/ui/card"
import { BodyChangeList } from "@/components/cycle/body-change-list"
import { Expandable } from "@/components/ui/expandable"
import { BackButton } from "@/components/ui/back-button"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { getSavedMomentTexts } from "@/lib/data/moments"

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

  const today = todayISO()
  const funFact =
    LIFE_STAGE_KNOWLEDGE.funFacts[seededIndex(`${user.id}-${today}-lifestage`, LIFE_STAGE_KNOWLEDGE.funFacts.length)]

  const highlightSignals = LIFE_STAGE_KNOWLEDGE.signals.filter((s) => s.highlight)
  const moreSignals = LIFE_STAGE_KNOWLEDGE.signals.filter((s) => !s.highlight)
  const savedTexts = await getSavedMomentTexts(user.id)

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <BackButton href="/cyclus" label="Cyclus" />

      <header className="rounded-[1.75rem] px-6 py-6 mb-8 bg-info-soft">
        <p className="text-sm font-semibold text-info">Cyclus & ouder worden</p>
        <h1 className="font-display text-3xl lg:text-4xl text-ink mt-1.5">De overgang, uitgelegd</h1>
        <p className="text-base text-ink-soft mt-3 leading-relaxed max-w-[65ch]">{LIFE_STAGE_KNOWLEDGE.intro}</p>
      </header>

      <div className="flex flex-col gap-9">
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Hoe je cyclus kan veranderen</h2>
          <div className="flex flex-col gap-5 max-w-[65ch]">
            {LIFE_STAGE_KNOWLEDGE.ageChanges.map((section) => (
              <div key={section.heading}>
                <p className="text-base font-semibold text-ink mb-1">{section.heading}</p>
                <p className="text-base text-ink-soft leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-3">Wat is perimenopauze?</h2>
          <p className="text-base text-ink-soft leading-relaxed max-w-[65ch]">
            {LIFE_STAGE_KNOWLEDGE.whatIsPerimenopause}
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-3">Signalen die je kunt herkennen</h2>
          <div className="max-w-[65ch]">
            <BodyChangeList items={highlightSignals} />
          </div>
        </section>

        <div className="rounded-[1.25rem] bg-info-soft px-5 py-4">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-info mb-1">Wist je dat…?</p>
              <p className="font-display text-lg text-ink leading-snug">{funFact}</p>
            </div>
            <MomentFavoriteButton
              kind="fun_fact"
              text={funFact}
              source="overgang-fun-fact"
              initialFavorited={savedTexts.has(funFact)}
              size="sm"
            />
          </div>
        </div>

        <Expandable label="Meer weten over de overgang">
          <div className="flex flex-col gap-6 max-w-[65ch]">
            <div>
              <p className="text-base font-semibold text-ink mb-3">Meer signalen</p>
              <BodyChangeList items={moreSignals} />
            </div>
            <div>
              <p className="text-base font-semibold text-ink mb-1.5">Wat kan normaal zijn?</p>
              <p className="text-base text-ink-soft leading-relaxed">{LIFE_STAGE_KNOWLEDGE.normalNote}</p>
            </div>
            <Card>
              <div className="flex gap-3">
                <Stethoscope className="h-5 w-5 text-sage-dark shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-base font-semibold text-ink mb-1.5">Wanneer een zorgverlener inschakelen?</p>
                  <p className="text-base text-ink-soft leading-relaxed">{LIFE_STAGE_KNOWLEDGE.whenToTalkToDoctor}</p>
                </div>
              </div>
            </Card>
          </div>
        </Expandable>

        {cycleProfile?.perimenopause_information && (
          <section>
            <h2 className="font-display text-xl text-ink mb-3">Wat jij hierover met ons deelde</h2>
            <Card>
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">
                {cycleProfile.perimenopause_information}
              </p>
              <Link
                href="/profiel/cyclus"
                className="inline-flex items-center min-h-11 text-sm font-semibold text-sage-dark mt-1 touch-manipulation underline-offset-4 hover:underline"
              >
                Aanpassen in je profiel
              </Link>
            </Card>
          </section>
        )}

        <p className="text-xs text-ink-soft leading-relaxed">
          Deze uitleg is algemene informatie — geen medisch advies en geen diagnose.
          Iedere vrouw ervaart deze levensfase anders. Bij twijfel of zorgwekkende klachten:
          overleg met een arts of andere zorgverlener.
        </p>
      </div>
    </div>
  )
}
