import Link from "next/link"
import { Heart, ShoppingCart, ChevronRight } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { TodayCards } from "@/components/today/today-cards"
import { AnticipationNote } from "@/components/today/anticipation-note"
import { HormoneRoadmapNote } from "@/components/today/hormone-roadmap-note"
import { PhaseContextCard } from "@/components/today/phase-context-card"
import { CheckinForm } from "@/components/today/checkin-form"
import { DayCloseCard } from "@/components/today/day-close-card"
import { MedicationTodayCard } from "@/components/today/medication-today-card"
import { SleepCard } from "@/components/sleep/sleep-card"
import { MenstruationQuickAction } from "@/components/cycle/menstruation-quick-action"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { greeting } from "@/lib/greeting"
import { getSavedMomentTexts } from "@/lib/data/moments"

const PHASE_TONE: Record<CyclePhase, { bg: string; text: string }> = {
  menstruatie: {
    bg: "bg-phase-menstruatie-soft",
    text: "text-phase-menstruatie-text",
  },
  folliculair: {
    bg: "bg-phase-folliculair-soft",
    text: "text-phase-folliculair-text",
  },
  ovulatie: {
    bg: "bg-phase-ovulatie-soft",
    text: "text-phase-ovulatie-text",
  },
  luteaal: {
    bg: "bg-phase-luteaal-soft",
    text: "text-phase-luteaal-text",
  },
}

const PHASE_TAGLINE: Record<CyclePhase, string> = {
  menstruatie: "Een moment om het rustiger aan te doen.",
  folliculair: "Je energie bouwt zich vaak op in deze fase.",
  ovulatie: "Voor veel vrouwen een piek in energie.",
  luteaal: "Je lichaam bouwt rustig toe naar rust.",
}

/**
 * Vandaag = one calm composition, not a widget dashboard.
 *
 * 1. Hello + one phase surface (menstruatie start/stop folded in)
 * 2. Check-in first when empty (so roadmap can become personal)
 * 3. Optional vooruitkijken
 * 4. Compact hormone roadmap
 * 5. Voor jou vandaag (act)
 * 6. Check-in adjust when already filled
 * 7. Optional sleep / meds
 * 8. Day close — compact until evening
 */
export default async function VandaagPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const {
    profile,
    cycleProfile,
    cycleEstimate,
    isMenstruationActive,
    menstruationDay,
    recommendation,
    bodyRecognition,
    anticipation,
    hormoneRoadmap,
    checkin,
    today,
    weekStartISO,
    completedWorkout,
    workoutAlternatives,
    mealAlternativesBySlot,
    medicationItems,
    mentalWellbeingSuggestion,
    sleepEntry,
    sleepObservation,
    recipeImageById,
  } = await getVandaagData(user.id)

  const savedTexts = [...(await getSavedMomentTexts(user.id))]

  const showMedicationCard =
    Boolean(profile?.show_medication_on_dashboard) && medicationItems.length > 0
  const sleepEnabled = profile?.sleep_tracking_enabled === true
  const hasCycle = Boolean(cycleProfile?.has_cycle)
  const tone = cycleEstimate ? PHASE_TONE[cycleEstimate.phase] : null

  const hasMeaningfulCheckin = Boolean(
    checkin &&
      (checkin.energy ||
        checkin.mood ||
        checkin.sleep ||
        checkin.stress ||
        (checkin.symptoms?.length ?? 0) > 0 ||
        (checkin.needs?.length ?? 0) > 0 ||
        (checkin.notes?.trim()?.length ?? 0) > 0),
  )

  const dayFocus = recommendation?.dayFocus ?? null
  const personalizedFocus =
    dayFocus &&
    checkin &&
    (checkin.needs?.length ||
      (checkin.energy != null && checkin.energy <= 2) ||
      (checkin.mood != null && checkin.mood <= 2) ||
      (checkin.stress != null && checkin.stress >= 4))
      ? dayFocus
      : null

  const wantRecoveryRow =
    Boolean(mentalWellbeingSuggestion) ||
    checkin?.needs?.includes("rust") ||
    checkin?.needs?.includes("mezelf") ||
    !(profile?.movement_enabled ?? true)

  // When roadmap follows, keep the phase chip short — avoid repeating the same story.
  const phaseSubtitle = cycleEstimate
    ? hormoneRoadmap
      ? PHASE_TAGLINE[cycleEstimate.phase]
      : (bodyRecognition?.text ?? PHASE_TAGLINE[cycleEstimate.phase])
    : ""

  const checkinForm = (
    <CheckinForm
      initial={checkin ?? null}
      mentalWellbeingEnabled={profile?.mental_wellbeing_enabled === true}
      sleepTrackingEnabled={sleepEnabled}
      customSymptoms={profile?.custom_symptoms ?? []}
    />
  )

  return (
    <PullToRefresh>
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <header className="mb-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl lg:text-3xl text-ink tracking-tight min-w-0">
              {greeting()}
              {profile?.name ? `, ${profile.name}` : ""}
            </h1>
            <Link
              href="/favorieten"
              aria-label="Favorieten"
              className="shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-full text-peach touch-manipulation motion-safe:active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
            >
              <Heart className="h-5 w-5" fill="currentColor" strokeWidth={0} aria-hidden />
            </Link>
          </div>

          {cycleEstimate && tone ? (
            <div className="mt-3">
              <PhaseContextCard
                phase={cycleEstimate.phase}
                phaseLabel={cycleEstimate.phaseLabel}
                cycleDay={cycleEstimate.cycleDay}
                subtitle={phaseSubtitle}
                hasCycle={hasCycle}
                isMenstruationActive={isMenstruationActive}
                menstruationDay={menstruationDay}
              />
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-ink-soft">
                Fijn dat je er bent. Kies vandaag wat bij je past.
              </p>
              {hasCycle && (
                <div className="mt-2">
                  {isMenstruationActive ? (
                    <MenstruationQuickAction isActive day={menstruationDay} variant="inline" />
                  ) : (
                    <MenstruationQuickAction isActive={false} day={null} variant="quiet" />
                  )}
                </div>
              )}
            </div>
          )}
        </header>

        <div className="flex flex-col gap-6">
          {/* Empty check-in early: understand starts after she shares how she feels */}
          {!hasMeaningfulCheckin && checkinForm}

          {anticipation && <AnticipationNote anticipation={anticipation} />}

          {hormoneRoadmap && (
            <HormoneRoadmapNote
              roadmap={hormoneRoadmap}
              phaseTone={tone}
              savedTexts={savedTexts}
            />
          )}

          {recommendation && (
            <TodayCards
              recommendation={recommendation}
              userId={user.id}
              date={today}
              weekStartISO={weekStartISO}
              workoutAlternatives={workoutAlternatives}
              mealAlternativesBySlot={mealAlternativesBySlot}
              completedWorkout={completedWorkout}
              mentalSuggestion={mentalWellbeingSuggestion}
              focusLine={personalizedFocus}
              showRecovery={wantRecoveryRow}
              recipeImageById={recipeImageById}
            />
          )}

          {recommendation?.nutritionEnabled && (
            <div className="flex flex-col gap-1">
              <Link
                href="/deze-week/boodschappen"
                className="flex items-center justify-between rounded-3xl bg-sage-soft/50 px-4 py-3.5 touch-manipulation"
              >
                <span className="inline-flex items-center gap-2.5 text-sm font-medium text-ink">
                  <ShoppingCart className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
                  Boodschappen voor deze week
                </span>
                <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
              </Link>
              <Link
                href="/deze-week/boodschappen?modus=dag"
                className="text-xs font-medium text-sage-dark px-1 min-h-11 inline-flex items-center touch-manipulation"
              >
                Alleen vandaag →
              </Link>
            </div>
          )}

          {/* Filled check-in later: adjust without blocking the plan */}
          {hasMeaningfulCheckin && checkinForm}

          {(sleepEnabled || showMedicationCard) && (
            <section aria-label="Extra voor vandaag" className="flex flex-col gap-3">
              {sleepEnabled && (
                <div id="slaap-vandaag">
                  <SleepCard
                    date={today}
                    entry={sleepEntry}
                    observation={sleepObservation}
                    historyHref="/slaap"
                  />
                </div>
              )}
              {showMedicationCard && <MedicationTodayCard items={medicationItems} date={today} />}
            </section>
          )}

          <DayCloseCard
            userId={user.id}
            date={today}
            weekStartISO={weekStartISO}
            hasCheckin={hasMeaningfulCheckin}
            movementEnabled={profile?.movement_enabled ?? true}
            movementDone={Boolean(completedWorkout)}
            sleepTrackingEnabled={sleepEnabled}
            hasSleepEntry={Boolean(sleepEntry)}
            mentalWellbeingEnabled={profile?.mental_wellbeing_enabled === true}
            savedTexts={savedTexts}
          />
        </div>
      </div>
    </PullToRefresh>
  )
}
