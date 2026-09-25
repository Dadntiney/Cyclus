import Link from "next/link"
import { format, subDays } from "date-fns"
import { ChevronLeft } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { estimateCycle } from "@/lib/cycle/estimate"
import { computeCycleHistory, computeSymptomFrequency } from "@/lib/cycle/history"
import { computePhaseSymptomInsights, getTopPhaseSymptomInsight } from "@/lib/cycle/patterns"
import { buildCyclusdagView } from "@/lib/cycle/cyclusdag"
import { Card } from "@/components/ui/card"
import { Expandable } from "@/components/ui/expandable"
import { BodyChangeList } from "@/components/cycle/body-change-list"
import { MedicationTodayCard } from "@/components/today/medication-today-card"
import { getMedicationDashboardItems } from "@/lib/data/medications"
import { cn } from "@/lib/utils"

export default async function CyclusdagPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const sixMonthsAgo = format(subDays(new Date(), 200), "yyyy-MM-dd")

  const [{ data: profile }, { data: cycleProfile }, { data: checkins }, { data: logs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("movement_enabled, training_preferences, show_medication_on_dashboard")
      .eq("id", user.id)
      .single(),
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

  const backLink = (
    <Link
      href="/cyclus"
      className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft mb-4 touch-manipulation"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
      Mijn cyclus
    </Link>
  )

  if (!cycleProfile?.has_cycle) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        {backLink}
        <Card>
          <p className="text-sm text-ink-soft">
            Je gaf aan momenteel geen menstruatiecyclus te hebben, dus er is geen cyclusdag om
            over te laten zien. Je vindt je klachten en patronen nog wel terug bij Mijn cyclus.
          </p>
        </Card>
      </div>
    )
  }

  const cycleEstimate = estimateCycle(
    cycleProfile.last_period_start,
    cycleProfile.average_cycle_length,
    cycleProfile.has_cycle,
  )

  if (!cycleEstimate) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        {backLink}
        <Card>
          <p className="text-sm text-ink-soft">
            We hebben nog niet genoeg gegevens om je huidige cyclusdag te schatten. Markeer je
            menstruatiedagen in de kalender bij Mijn cyclus, dan verschijnt hier straks jouw
            persoonlijke uitleg.
          </p>
        </Card>
      </div>
    )
  }

  const today = format(new Date(), "yyyy-MM-dd")
  const showMedication = Boolean(profile?.show_medication_on_dashboard)
  const medicationItems = showMedication ? await getMedicationDashboardItems(user.id, today) : []
  const patterns = computeSymptomFrequency(checkins ?? [])

  const cycleHistory = computeCycleHistory(
    (logs ?? []).map((l) => ({ date: l.date, menstruation: l.menstruation, symptoms: l.symptoms })),
  )
  const phaseInsights = computePhaseSymptomInsights(cycleHistory, checkins ?? [])
  const phaseInsight = getTopPhaseSymptomInsight(phaseInsights, cycleEstimate.phase)

  const view = buildCyclusdagView({
    cycleEstimate,
    seed: `${user.id}-${today}`,
    movementEnabled: profile?.movement_enabled ?? true,
    trainingPreferences: profile?.training_preferences ?? [],
    topSymptom: patterns[0]?.symptom ?? null,
    phaseInsight,
  })

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      {backLink}

      <div className={cn("rounded-3xl p-5 lg:p-6 mb-6", view.colors.bg)}>
        <p className={cn("text-xs font-semibold uppercase tracking-wide", view.colors.text)}>
          Cyclusdag {view.cycleDay}
        </p>
        <p className="font-display text-2xl text-ink mt-1">{view.phaseLabel}</p>
      </div>

      <div className="flex flex-col gap-5">
        <section>
          <h2 className="font-display text-lg text-ink mb-2.5">Wat gebeurt er in je lichaam?</h2>
          <Card>
            <p className="text-sm text-ink-soft leading-relaxed">{view.knowledge.bodySummary}</p>
            <p className="text-sm text-ink-soft leading-relaxed mt-3">{view.knowledge.hormonalSummary}</p>
          </Card>
        </section>

        <section>
          <h2 className="font-display text-lg text-ink mb-2.5">Hoe kun je je voelen?</h2>
          <Card>
            <BodyChangeList items={view.highlightChanges} />
            {view.symptomNote && (
              <p className="text-xs text-ink-soft bg-cream-soft rounded-xl px-3 py-2.5 mt-4">
                {view.symptomNote}
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-line">
              <p className="text-sm font-medium text-ink mb-2">Waarom?</p>
              <p className="text-sm text-ink-soft leading-relaxed">{view.knowledge.whyExplainer}</p>
            </div>
          </Card>
        </section>

        {medicationItems.length > 0 && (
          <section>
            <MedicationTodayCard items={medicationItems} date={today} />
            <p className="text-xs text-ink-soft px-1 mt-2.5 leading-relaxed">
              Dit toont je cyclusdag, fase, medicatie en klachten naast elkaar — puur ter
              overzicht. Cyclus trekt hier geen conclusies uit over oorzaak en gevolg.
            </p>
          </section>
        )}

        <section>
          <Card className="bg-sage-soft border-transparent">
            <p className="text-xs font-medium text-sage-dark mb-1">Wist je dat...?</p>
            <p className="text-sm text-ink leading-relaxed">{view.funFact}</p>
          </Card>
        </section>

        <Expandable label="Meer weten over deze fase">
          <div className="flex flex-col gap-4">
            <Card>
              <p className="text-sm font-medium text-ink mb-3">Meer lichamelijke en mentale signalen</p>
              <BodyChangeList items={view.moreChanges} />
            </Card>
            <Card>
              <p className="text-sm font-medium text-ink mb-2">Wat kan normaal zijn?</p>
              <p className="text-sm text-ink-soft leading-relaxed">{view.knowledge.normalNote}</p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-ink mb-2">Waar kun je aandacht aan besteden?</p>
              <p className="text-sm text-ink-soft leading-relaxed">{view.knowledge.attentionNote}</p>
            </Card>
          </div>
        </Expandable>

        <section>
          <Card className="bg-white">
            <p className="text-xs font-medium text-sage-dark mb-1">
              <span className="mr-1" aria-hidden>
                {view.buddyMoment.emoji}
              </span>
              {view.buddyMoment.title}
            </p>
            <p className="text-sm text-ink leading-relaxed">{view.buddyMoment.text}</p>
          </Card>
        </section>

        <p className="text-xs text-ink-soft px-1 leading-relaxed">
          Deze uitleg is algemene, informatieve content — geen medisch advies en geen diagnose.
          Iedere vrouw ervaart haar cyclus anders; twijfel je over aanhoudende of ernstige
          klachten, overleg dan met een arts of andere zorgverlener.
        </p>
      </div>
    </div>
  )
}
