import type { Metadata } from "next"
import Link from "next/link"
import { format, subDays } from "date-fns"
import { CalendarDays, ChevronRight, Droplet } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { todayDate, todayISO } from "@/lib/dates/amsterdam"
import { phaseLabel, type CyclePhase } from "@/lib/cycle/estimate"
import { resolvePresentedForDate } from "@/lib/cycle/presented-estimate"
import {
  computeCycleHistory,
  computeSymptomFrequency,
  getEffectiveLastPeriodStart,
  withActivePeriod,
} from "@/lib/cycle/history"
import { computePhaseSymptomInsights, getTopPhaseSymptomInsight } from "@/lib/cycle/patterns"
import { buildCyclusdagView } from "@/lib/cycle/cyclusdag"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Card } from "@/components/ui/card"
import { Disclosure } from "@/components/ui/disclosure"
import { SectionHeader } from "@/components/ui/section-header"
import { buttonVariants, textActionClass } from "@/components/ui/button"
import { BodyChangeList } from "@/components/cycle/body-change-list"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { PhaseNutritionBasics } from "@/components/cycle/phase-nutrition-basics"
import { BuddyMark } from "@/components/buddy/buddy-mark"
import { shouldShowBuddyMessage, type BuddyStyle } from "@/lib/buddy/styles"
import { getSavedMomentTexts } from "@/lib/data/moments"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: FEATURES.fase.label }

const PHASE_ORDER: CyclePhase[] = ["menstruatie", "folliculair", "ovulatie", "luteaal"]

/**
 * The four phases in one quiet line under the title, the current one in
 * ink — so "Luteale fase" has a place in the whole cycle. Inline spans:
 * it lives inside the header's subtitle paragraph.
 */
function PhaseLegend({ current }: { current: CyclePhase }) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1">
      {PHASE_ORDER.map((phase) => {
        const isCurrent = phase === current
        return (
          <span
            key={phase}
            className={cn("inline-flex items-center gap-1.5", isCurrent && "font-medium text-ink")}
          >
            <span aria-hidden className={cn("h-2 w-2 rounded-full", getPhaseContent(phase).colors.dot)} />
            {phaseLabel(phase)}
            {isCurrent && <span className="sr-only"> (nu)</span>}
          </span>
        )
      })}
    </span>
  )
}

/**
 * Jouw fase (ontwerpvisie §7.8): a reading page. The explanation sits on
 * the page ground in a reading column; the eyebrow carries the phase tint
 * and says plainly that the day is an estimate. It ends with one soft next
 * step, never a list of to-dos.
 */
export default async function CyclusdagPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const sixMonthsAgo = format(subDays(todayDate(), 200), "yyyy-MM-dd")

  const [profile, { data: cycleProfile }, { data: checkins }, { data: logs }] = await Promise.all([
    getProfile(user.id),
    supabase.from("cycle_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("daily_checkins")
      .select("date, symptoms")
      .eq("user_id", user.id)
      .gte("date", sixMonthsAgo),
    supabase
      .from("cycle_logs")
      .select("date, menstruation, symptoms")
      .eq("user_id", user.id)
      .gte("date", sixMonthsAgo)
      .order("date", { ascending: true }),
  ])

  if (!cycleProfile?.has_cycle) {
    return (
      <Page>
        <PageHeader title={FEATURES.fase.label} />
        <EmptyState
          icon={Droplet}
          title="Geen cyclusdag"
          description="Je gaf aan momenteel geen menstruatiecyclus te hebben. Klachten en patronen vind je nog wel onder Cyclus."
          action={
            <Link href={FEATURES.cyclus.href} className={buttonVariants({ variant: "secondary" })}>
              Naar Cyclus
            </Link>
          }
        />
      </Page>
    )
  }

  const today = todayISO()
  const cycleHistory = computeCycleHistory(
    withActivePeriod(
      (logs ?? []).map((l) => ({ date: l.date, menstruation: l.menstruation, symptoms: l.symptoms })),
      cycleProfile.active_period_start,
      today,
    ),
  )
  const menstruationDates = new Set(
    (logs ?? []).filter((l) => l.menstruation).map((l) => l.date),
  )
  const effectiveLastStart = getEffectiveLastPeriodStart(
    cycleProfile.last_period_start,
    cycleHistory,
  )
  const presented = resolvePresentedForDate(
    today,
    {
      last_period_start: effectiveLastStart,
      average_cycle_length: cycleProfile.average_cycle_length,
      average_period_length: cycleProfile.average_period_length,
      has_cycle: cycleProfile.has_cycle,
      active_period_start: cycleProfile.active_period_start,
    },
    menstruationDates,
  )
  const cycleEstimate = presented.estimate

  if (!cycleEstimate) {
    return (
      <Page>
        <PageHeader title={FEATURES.fase.label} />
        <EmptyState
          icon={CalendarDays}
          title="Nog te weinig gegevens"
          description="Markeer je menstruatiedagen in de kalender. Daarna verschijnt hier jouw persoonlijke uitleg."
          action={
            <Link href={`${FEATURES.cyclus.href}#kalender`} className={buttonVariants({ variant: "secondary" })}>
              Open kalender
            </Link>
          }
        />
      </Page>
    )
  }

  const patterns = computeSymptomFrequency(checkins ?? [])
  const phaseInsights = computePhaseSymptomInsights(cycleHistory, checkins ?? [])
  const phaseInsight = getTopPhaseSymptomInsight(phaseInsights, cycleEstimate.phase)
  const preferredStyles = (profile?.buddy_styles ?? []) as BuddyStyle[]

  const view = buildCyclusdagView({
    cycleEstimate,
    seed: `${user.id}-${today}`,
    movementEnabled: profile?.movement_enabled ?? true,
    trainingPreferences: profile?.training_preferences ?? [],
    topSymptom: patterns[0]?.symptom ?? null,
    phaseInsight,
    preferredStyles,
  })

  const showAmbientBuddyContent = shouldShowBuddyMessage(
    `${user.id}-${today}-cyclusdag`,
    profile?.buddy_message_frequency ?? null,
    view.symptomNote !== null,
  )
  const savedTexts = await getSavedMomentTexts(user.id)

  // Eyebrow (ontwerpvisie §4.4: "Jouw fase · dag 11 · schatting"): the
  // page name first, so the phase h1 reads as "Jouw fase". Soft states name
  // what may be happening; otherwise the day, marked as an estimate unless
  // her period is running (then it's her own day count).
  const softHint = presented.menstruationSoftHint
  const periodRunning = cycleProfile.active_period_start != null
  const eyebrowDetail =
    softHint === "predicted"
      ? "menstruatie kan komen"
      : softHint === "ended"
        ? "menstruatie gestopt"
        : periodRunning
          ? `dag ${view.cycleDay}`
          : `dag ${view.cycleDay} · schatting`
  const eyebrow = `${FEATURES.fase.label} · ${eyebrowDetail}`

  return (
    <Page>
      <PageHeader
        compactTitle={FEATURES.fase.label}
        eyebrow={<span className={view.colors.text}>{eyebrow}</span>}
        title={view.phaseLabel}
        subtitle={<PhaseLegend current={view.phase} />}
      />

      <PageSections>
        <section aria-labelledby="lichaam" className="max-w-prose">
          <SectionHeader id="lichaam" title="Wat gebeurt er in je lichaam?" />
          <p className="text-base text-ink">{view.knowledge.bodySummary}</p>
          <p className="text-base text-ink-soft mt-3">{view.knowledge.hormonalSummary}</p>
        </section>

        <section aria-labelledby="voelen" className="max-w-prose">
          <SectionHeader id="voelen" title="Hoe kun je je voelen?" />
          <BodyChangeList items={view.highlightChanges} />
          {view.symptomNote && (
            <Card tone="subtle" padding="sm" className="mt-4">
              <p className="text-sm text-ink">{view.symptomNote}</p>
            </Card>
          )}
          <Disclosure
            label="Meer signalen en wat normaal is"
            openLabel="Minder tonen"
            className="mt-3"
          >
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-base font-semibold text-ink mb-3">Meer signalen</h3>
                <BodyChangeList items={view.moreChanges} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink mb-1.5">Wat kan normaal zijn?</h3>
                <p className="text-base text-ink-soft">{view.knowledge.normalNote}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink mb-1.5">Waar kun je aandacht aan besteden?</h3>
                <p className="text-base text-ink-soft">{view.knowledge.attentionNote}</p>
              </div>
            </div>
          </Disclosure>
          <div className="mt-5 pt-5 border-t border-line">
            <h3 className="text-base font-semibold text-ink mb-1.5">Waarom?</h3>
            <p className="text-base text-ink-soft">{view.knowledge.whyExplainer}</p>
          </div>
        </section>

        {showAmbientBuddyContent && (
          <aside aria-label="Even weten" className="max-w-prose flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className={cn("type-eyebrow mb-1", view.colors.text)}>Even weten</p>
              <p className="font-display text-lg text-ink">{view.funFact}</p>
            </div>
            <MomentFavoriteButton
              kind="fun_fact"
              text={view.funFact}
              source="cyclusdag-fun-fact"
              initialFavorited={savedTexts.has(view.funFact)}
              size="sm"
            />
          </aside>
        )}

        <section aria-labelledby="voeding">
          <SectionHeader id="voeding" title="Voeding in deze fase" />
          <PhaseNutritionBasics nutrition={view.nutrition} />
        </section>

        {showAmbientBuddyContent && (
          <aside aria-label={view.buddyMoment.title} className="max-w-prose flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="type-eyebrow mb-1 inline-flex items-center gap-1.5 text-sage-dark">
                <BuddyMark size="sm" decorative />
                {view.buddyMoment.title}
              </p>
              <p className="text-base text-ink">{view.buddyMoment.text}</p>
            </div>
            <MomentFavoriteButton
              kind={view.buddyMoment.kind === "tip" ? "tip" : "quote"}
              text={view.buddyMoment.text}
              source="cyclusdag-buddy-moment"
              initialFavorited={savedTexts.has(view.buddyMoment.text)}
              size="sm"
            />
          </aside>
        )}

        <section aria-labelledby="vervolg" className="max-w-prose">
          <SectionHeader
            id="vervolg"
            title="Wat past vandaag?"
            description="Je plan op Vandaag houdt rekening met je fase. Kies wat bij je past, niets hoeft."
          />
          <Link href={FEATURES.vandaag.href} className={textActionClass()}>
            Naar Vandaag
            <ChevronRight {...ICON.sm} aria-hidden />
          </Link>
        </section>

        <p className="text-xs text-ink-soft max-w-prose">
          Deze uitleg is algemene informatie — geen medisch advies en geen diagnose.
          Iedere vrouw ervaart haar cyclus anders. Bij aanhoudende of ernstige klachten:
          overleg met een arts of andere zorgverlener.
        </p>
      </PageSections>
    </Page>
  )
}
