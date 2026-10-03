import type { Metadata } from "next"
import Link from "next/link"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates/amsterdam"
import { LIFE_STAGE_KNOWLEDGE } from "@/lib/cycle/life-stage-knowledge"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { Card } from "@/components/ui/card"
import { Disclosure } from "@/components/ui/disclosure"
import { ListGroup, ListRow } from "@/components/ui/list-group"
import { SectionHeader } from "@/components/ui/section-header"
import { textActionClass } from "@/components/ui/button"
import { BodyChangeList } from "@/components/cycle/body-change-list"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { getSavedMomentTexts } from "@/lib/data/moments"

export const metadata: Metadata = { title: FEATURES.overgang.label }

const KENNIS_ARTICLE = {
  href: "/kennis/wat-verandert-er-rondom-de-overgang",
  title: "Wat verandert er rondom de overgang?",
}

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

/** First sentence as the 2-line lead; the rest reads as body text. */
function splitIntro(intro: string): { lead: string; rest: string } {
  const [lead, ...rest] = intro.split(/(?<=\.)\s+/)
  return { lead, rest: rest.join(" ") }
}

/**
 * De overgang (ontwerpvisie §7.8): a reading page. Only the eyebrow
 * carries the info tint; what she shared sits right under the header in a
 * subtle card (besluit 21); when to see a care provider is its own section
 * instead of hiding in "meer weten".
 */
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
  const intro = splitIntro(LIFE_STAGE_KNOWLEDGE.intro)
  const sharedNote = cycleProfile?.perimenopause_information?.trim() ? cycleProfile.perimenopause_information : null

  return (
    <Page>
      <PageHeader
        eyebrow={<span className="text-info">Cyclus & ouder worden</span>}
        title={FEATURES.overgang.label}
        subtitle={intro.lead}
      />

      <PageSections>
        {sharedNote && (
          <Card tone="subtle">
            <h2 className="type-eyebrow text-ink-soft">Wat jij deelde</h2>
            <p className="text-sm text-ink mt-1 whitespace-pre-wrap">{sharedNote}</p>
            <Link href={FEATURES.cyclusinstellingen.href} className={textActionClass("mt-1")}>
              Aanpassen in {FEATURES.cyclusinstellingen.label}
            </Link>
          </Card>
        )}

        <section aria-labelledby="veranderen" className="max-w-prose">
          <SectionHeader id="veranderen" title="Hoe je cyclus kan veranderen" />
          {intro.rest && <p className="text-base text-ink-soft">{intro.rest}</p>}
          <div className="flex flex-col gap-5 mt-5">
            {LIFE_STAGE_KNOWLEDGE.ageChanges.map((section) => (
              <div key={section.heading}>
                <h3 className="text-base font-semibold text-ink mb-1">{section.heading}</h3>
                <p className="text-base text-ink-soft">{section.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="perimenopauze" className="max-w-prose">
          <SectionHeader id="perimenopauze" title="Wat is perimenopauze?" />
          <p className="text-base text-ink-soft">{LIFE_STAGE_KNOWLEDGE.whatIsPerimenopause}</p>
        </section>

        <section aria-labelledby="signalen" className="max-w-prose">
          <SectionHeader id="signalen" title="Signalen die je kunt herkennen" />
          <BodyChangeList items={highlightSignals} />
          <Disclosure label="Meer signalen en wat normaal is" openLabel="Minder tonen" className="mt-3">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-base font-semibold text-ink mb-3">Meer signalen</h3>
                <BodyChangeList items={moreSignals} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink mb-1.5">Wat kan normaal zijn?</h3>
                <p className="text-base text-ink-soft">{LIFE_STAGE_KNOWLEDGE.normalNote}</p>
              </div>
            </div>
          </Disclosure>
        </section>

        <aside aria-label="Even weten" className="max-w-prose flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="type-eyebrow text-info mb-1">Even weten</p>
            <p className="font-display text-lg text-ink">{funFact}</p>
          </div>
          <MomentFavoriteButton
            kind="fun_fact"
            text={funFact}
            source="overgang-fun-fact"
            initialFavorited={savedTexts.has(funFact)}
            size="sm"
          />
        </aside>

        <section aria-labelledby="zorgverlener" className="max-w-prose">
          <SectionHeader id="zorgverlener" title="Wanneer een zorgverlener inschakelen?" />
          <p className="text-base text-ink-soft">{LIFE_STAGE_KNOWLEDGE.whenToTalkToDoctor}</p>
        </section>

        <ListGroup label="Lees ook in Kennis">
          <ListRow
            href={KENNIS_ARTICLE.href}
            icon={FEATURES.kennis.icon}
            title={KENNIS_ARTICLE.title}
            description="Over hormonen, energie, slaap en stemming in deze fase"
          />
        </ListGroup>

        <p className="text-xs text-ink-soft max-w-prose">
          Deze uitleg is algemene informatie — geen medisch advies en geen diagnose.
          Iedere vrouw ervaart deze levensfase anders. Bij twijfel of zorgwekkende klachten:
          overleg met een arts of andere zorgverlener.
        </p>
      </PageSections>
    </Page>
  )
}
