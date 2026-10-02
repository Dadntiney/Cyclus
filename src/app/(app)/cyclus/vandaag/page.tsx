import Link from "next/link"
import type { ReactNode } from "react"
import { format, subDays } from "date-fns"
import { Droplet, CalendarDays } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { todayDate, todayISO } from "@/lib/dates/amsterdam"
import { resolvePresentedForDate } from "@/lib/cycle/presented-estimate"
import {
  computeCycleHistory,
  computeSymptomFrequency,
  getEffectiveLastPeriodStart,
  withActivePeriod,
} from "@/lib/cycle/history"
import { computePhaseSymptomInsights, getTopPhaseSymptomInsight } from "@/lib/cycle/patterns"
import { buildCyclusdagView } from "@/lib/cycle/cyclusdag"
import { EmptyState } from "@/components/ui/empty-state"
import { Expandable } from "@/components/ui/expandable"
import { BackButton } from "@/components/ui/back-button"
import { buttonVariants } from "@/components/ui/button"
import { BodyChangeList } from "@/components/cycle/body-change-list"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { PhaseNutritionBasics } from "@/components/cycle/phase-nutrition-basics"
import { BuddyMark } from "@/components/buddy/buddy-mark"
import { shouldShowBuddyMessage, type BuddyStyle } from "@/lib/buddy/styles"
import { getSavedMomentTexts } from "@/lib/data/moments"
import { cn } from "@/lib/utils"

/**
 * Ritme reading page: explanations sit on the page ground in a reading
 * column; only asides (Wist je dat, Buddy) get a soft phase tint.
 */
function SoftPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("max-w-[65ch]", className)}>{children}</div>
}

function TintPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[1.25rem] px-5 py-4", className)}>{children}</div>
}

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

  const backLink = <BackButton href="/cyclus" label="Cyclus" />

  if (!cycleProfile?.has_cycle) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        {backLink}
        <SoftPanel>
          <EmptyState
            icon={<Droplet className="h-6 w-6" strokeWidth={1.5} />}
            title="Geen cyclusdag"
            description="Je gaf aan momenteel geen menstruatiecyclus te hebben. Klachten en patronen vind je nog wel onder Cyclus."
            action={
              <Link href="/cyclus" className={buttonVariants({ variant: "secondary" })}>
                Naar overzicht
              </Link>
            }
          />
        </SoftPanel>
      </div>
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
  const softMenstruationMode = Boolean(presented.menstruationSoftHint)

  if (!cycleEstimate) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        {backLink}
        <SoftPanel>
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" strokeWidth={1.5} />}
            title="Nog te weinig gegevens"
            description="Markeer je menstruatiedagen in de kalender. Daarna verschijnt hier jouw persoonlijke uitleg."
            action={
              <Link href="/cyclus" className={buttonVariants({ variant: "secondary" })}>
                Open kalender
              </Link>
            }
          />
        </SoftPanel>
      </div>
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

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      {backLink}

      <header className={cn("rounded-[1.75rem] px-6 py-6 mb-8", view.colors.bg)}>
        <p className={cn("text-sm font-semibold", view.colors.text)}>
          {softMenstruationMode
            ? presented.menstruationSoftHint === "predicted"
              ? "Menstruatie kan komen"
              : "Menstruatie gestopt"
            : `Cyclusdag ${view.cycleDay}`}
        </p>
        <h1 className="font-display text-3xl lg:text-4xl text-ink mt-1.5">{view.phaseLabel}</h1>
      </header>

      <div className="flex flex-col gap-9">
        <section>
          <h2 className="font-display text-xl text-ink mb-3">Wat gebeurt er in je lichaam?</h2>
          <SoftPanel>
            <p className="text-base text-ink leading-relaxed">{view.knowledge.bodySummary}</p>
            <p className="text-base text-ink-soft leading-relaxed mt-3">
              {view.knowledge.hormonalSummary}
            </p>
          </SoftPanel>
        </section>

        <section>
          <h2 className="font-display text-xl text-ink mb-3">Hoe kun je je voelen?</h2>
          <SoftPanel>
            <BodyChangeList items={view.highlightChanges} />
            {view.symptomNote && (
              <p className={cn("text-sm text-ink rounded-2xl px-4 py-3 mt-4 leading-relaxed", view.colors.bg)}>
                {view.symptomNote}
              </p>
            )}
            <div className="mt-5 pt-5 border-t border-line">
              <p className="text-base font-semibold text-ink mb-1.5">Waarom?</p>
              <p className="text-base text-ink-soft leading-relaxed">{view.knowledge.whyExplainer}</p>
            </div>
          </SoftPanel>
        </section>

        {showAmbientBuddyContent && (
          <TintPanel className={view.colors.bg}>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-semibold mb-1", view.colors.text)}>Wist je dat…?</p>
                <p className="font-display text-lg text-ink leading-snug">{view.funFact}</p>
              </div>
              <MomentFavoriteButton
                kind="fun_fact"
                text={view.funFact}
                source="cyclusdag-fun-fact"
                initialFavorited={savedTexts.has(view.funFact)}
                size="sm"
              />
            </div>
          </TintPanel>
        )}

        <section>
          <h2 className="font-display text-xl text-ink mb-3">Voeding in deze fase</h2>
          <PhaseNutritionBasics nutrition={view.nutrition} />
        </section>

        <Expandable label="Meer weten over deze fase">
          <div className="flex flex-col gap-6">
            <SoftPanel>
              <p className="text-base font-semibold text-ink mb-3">Meer signalen</p>
              <BodyChangeList items={view.moreChanges} />
            </SoftPanel>
            <SoftPanel>
              <p className="text-base font-semibold text-ink mb-1.5">Wat kan normaal zijn?</p>
              <p className="text-base text-ink-soft leading-relaxed">{view.knowledge.normalNote}</p>
            </SoftPanel>
            <SoftPanel>
              <p className="text-base font-semibold text-ink mb-1.5">Waar kun je aandacht aan besteden?</p>
              <p className="text-base text-ink-soft leading-relaxed">{view.knowledge.attentionNote}</p>
            </SoftPanel>
          </div>
        </Expandable>

        {showAmbientBuddyContent && (
          <TintPanel className="bg-sage-soft">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold mb-1 inline-flex items-center gap-1.5 text-sage-dark">
                  <BuddyMark size="sm" decorative />
                  {view.buddyMoment.title}
                </p>
                <p className="text-base text-ink leading-relaxed">{view.buddyMoment.text}</p>
              </div>
              <MomentFavoriteButton
                kind={view.buddyMoment.kind === "tip" ? "tip" : "quote"}
                text={view.buddyMoment.text}
                source="cyclusdag-buddy-moment"
                initialFavorited={savedTexts.has(view.buddyMoment.text)}
                size="sm"
              />
            </div>
          </TintPanel>
        )}

        <p className="text-xs text-ink-soft leading-relaxed">
          Deze uitleg is algemene informatie — geen medisch advies en geen diagnose.
          Iedere vrouw ervaart haar cyclus anders. Bij aanhoudende of ernstige klachten:
          overleg met een arts of andere zorgverlener.
        </p>
      </div>
    </div>
  )
}
