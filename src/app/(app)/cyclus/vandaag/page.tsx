import Link from "next/link"
import type { ReactNode } from "react"
import { format, subDays } from "date-fns"
import { Droplet, CalendarDays } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { todayDate, todayISO } from "@/lib/dates/amsterdam"
import { estimateCycle } from "@/lib/cycle/estimate"
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
import { PhaseSnackTipCard } from "@/components/cycle/phase-snack-tip-card"
import { shouldShowBuddyMessage, type BuddyStyle } from "@/lib/buddy/styles"
import { getSavedMomentTexts } from "@/lib/data/moments"
import { cn } from "@/lib/utils"
import { getDailyPhaseSnackTip } from "@/lib/cycle/phase-content"

/** Soft panel — same calm surface language as Vandaag (no white bordered cards). */
function SoftPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-3xl bg-sage-soft/50 px-4 py-4", className)}>{children}</div>
  )
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
            description="Je gaf aan momenteel geen menstruatiecyclus te hebben. Klachten en patronen vind je nog wel bij Cyclus."
            action={
              <Link href="/cyclus" className={buttonVariants({ variant: "secondary" })}>
                Naar Cyclus
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
  const cycleEstimate = estimateCycle(
    getEffectiveLastPeriodStart(cycleProfile.last_period_start, cycleHistory),
    cycleProfile.average_cycle_length,
    cycleProfile.has_cycle,
    undefined,
    cycleProfile.average_period_length,
  )

  if (!cycleEstimate) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        {backLink}
        <SoftPanel>
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" strokeWidth={1.5} />}
            title="Nog te weinig gegevens"
            description="Markeer je menstruatiedagen in de kalender bij Cyclus. Daarna verschijnt hier jouw persoonlijke uitleg."
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

      <header className={cn("rounded-3xl px-4 py-4 mb-6", view.colors.bg)}>
        <p className={cn("text-xs font-medium tracking-wide", view.colors.text)}>
          Cyclusdag {view.cycleDay}
        </p>
        <h1 className="font-display text-2xl text-ink mt-1">{view.phaseLabel}</h1>
      </header>

      <div className="flex flex-col gap-6">
        <section>
          <h2 className="font-display text-lg text-ink mb-2">Wat gebeurt er in je lichaam?</h2>
          <SoftPanel>
            <p className="text-sm text-ink leading-relaxed">{view.knowledge.bodySummary}</p>
            <p className="text-sm text-ink-soft leading-relaxed mt-3">
              {view.knowledge.hormonalSummary}
            </p>
          </SoftPanel>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink mb-2">Hoe kun je je voelen?</h2>
          <SoftPanel>
            <BodyChangeList items={view.highlightChanges} />
            {view.symptomNote && (
              <p className="text-xs text-ink-soft bg-surface/65 rounded-2xl px-3 py-2.5 mt-4 leading-relaxed">
                {view.symptomNote}
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-sage/20">
              <p className="text-sm font-medium text-ink mb-1.5">Waarom?</p>
              <p className="text-sm text-ink-soft leading-relaxed">{view.knowledge.whyExplainer}</p>
            </div>
          </SoftPanel>
        </section>

        {showAmbientBuddyContent && (
          <SoftPanel>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className={cn("text-xs font-medium mb-1", view.colors.text)}>Wist je dat…?</p>
                <p className="text-sm text-ink leading-relaxed">{view.funFact}</p>
              </div>
              <MomentFavoriteButton
                kind="fun_fact"
                text={view.funFact}
                source="cyclusdag-fun-fact"
                initialFavorited={savedTexts.has(view.funFact)}
                size="sm"
              />
            </div>
          </SoftPanel>
        )}

        <section>
          <h2 className="font-display text-lg text-ink mb-2.5">Voeding in deze fase</h2>
          <PhaseNutritionBasics nutrition={view.nutrition} />
          <div className="mt-3">
            <PhaseSnackTipCard tip={getDailyPhaseSnackTip(view.phase, `${user.id}-${today}`)} />
          </div>
        </section>

        <Expandable label="Meer weten over deze fase">
          <div className="flex flex-col gap-3">
            <SoftPanel>
              <p className="text-sm font-medium text-ink mb-3">Meer signalen</p>
              <BodyChangeList items={view.moreChanges} />
            </SoftPanel>
            <SoftPanel>
              <p className="text-sm font-medium text-ink mb-1.5">Wat kan normaal zijn?</p>
              <p className="text-sm text-ink-soft leading-relaxed">{view.knowledge.normalNote}</p>
            </SoftPanel>
            <SoftPanel>
              <p className="text-sm font-medium text-ink mb-1.5">Waar kun je aandacht aan besteden?</p>
              <p className="text-sm text-ink-soft leading-relaxed">{view.knowledge.attentionNote}</p>
            </SoftPanel>
          </div>
        </Expandable>

        {showAmbientBuddyContent && (
          <SoftPanel>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className={cn("text-xs font-medium mb-1 inline-flex items-center gap-1.5", view.colors.text)}>
                  <view.buddyMoment.icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  {view.buddyMoment.title}
                </p>
                <p className="text-sm text-ink leading-relaxed">{view.buddyMoment.text}</p>
              </div>
              <MomentFavoriteButton
                kind={view.buddyMoment.kind === "tip" ? "tip" : "quote"}
                text={view.buddyMoment.text}
                source="cyclusdag-buddy-moment"
                initialFavorited={savedTexts.has(view.buddyMoment.text)}
                size="sm"
              />
            </div>
          </SoftPanel>
        )}

        <p className="text-xs text-ink-soft leading-relaxed">
          Deze uitleg is algemene, informatieve content — geen medisch advies en geen diagnose.
          Iedere vrouw ervaart haar cyclus anders; twijfel je over aanhoudende of ernstige
          klachten, overleg dan met een arts of andere zorgverlener.
        </p>
      </div>
    </div>
  )
}
