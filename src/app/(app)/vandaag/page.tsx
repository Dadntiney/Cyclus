import Link from "next/link"
import { Heart } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { TodayCards } from "@/components/today/today-cards"
import { AnticipationNote } from "@/components/today/anticipation-note"
import { HormoneRoadmapNote } from "@/components/today/hormone-roadmap-note"
import { PhaseContextCard } from "@/components/today/phase-context-card"
import { CycleSetupCard } from "@/components/today/cycle-setup-card"
import { VandaagCheckinSlot } from "@/components/today/vandaag-checkin-slot"
import { DayCloseCard } from "@/components/today/day-close-card"
import { BuddyQuoteCard } from "@/components/today/buddy-quote-card"
import { MedicationTodayCard } from "@/components/today/medication-today-card"
import { SleepCard } from "@/components/sleep/sleep-card"
import { ProfileCompleteCard } from "@/components/today/profile-complete-card"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { greeting } from "@/lib/greeting"
import { estimateNextPeriod } from "@/lib/cycle/next-period"
import { getDailyBuddyQuote } from "@/lib/data/buddy-quotes"
import { shouldShowBuddyMessage, type BuddyStyle } from "@/lib/buddy/styles"

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
 * Flow (top → bottom):
 * 1. Hello + phase context (menstruatie start/stop folded in)
 * 2. Soft Buddy “even onthouden” (optional, frequency-gated)
 * 3. Empty check-in first when needed (so roadmap can become personal)
 * 4. Optional vooruitkijken / hormone roadmap (“wat je lichaam kan gebruiken”)
 * 5. Plan: bewegen → maaltijden → boodschappen → voor je hoofd
 * 6. Tussendoortip (lichte food-tip onder het plan)
 * 7. Check-in aanpassen when already filled
 * 8. Optional sleep / meds
 * 9. Even afronden
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
    predictedMenstruation,
    menstruationSoftHint,
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
    savedTexts,
    recipeImageById,
  } = await getVandaagData(user.id)

  const showMedicationCard =
    Boolean(profile?.show_medication_on_dashboard) && medicationItems.length > 0
  const sleepEnabled = profile?.sleep_tracking_enabled === true
  const hasCycle = Boolean(cycleProfile?.has_cycle)
  const tone = cycleEstimate ? PHASE_TONE[cycleEstimate.phase] : null
  const profileIncomplete =
    !profile?.hormonal_medication_status &&
    (profile?.health_conditions?.length ?? 0) === 0 &&
    (profile?.movement_limitations?.length ?? 0) === 0
  const nextPeriod = estimateNextPeriod({
    lastPeriodStart: cycleProfile?.last_period_start ?? null,
    averageCycleLength: cycleProfile?.average_cycle_length ?? null,
    hasCycle,
    regularity: cycleProfile?.regularity ?? null,
    lifeStage: cycleProfile?.life_stage ?? null,
  })

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

  const preferredStyles = (profile?.buddy_styles ?? []) as BuddyStyle[]
  const showBuddyQuote = shouldShowBuddyMessage(
    `${user.id}-${today}-vandaag-quote`,
    profile?.buddy_message_frequency ?? null,
    Boolean(bodyRecognition || personalizedFocus),
  )
  const buddyQuote = showBuddyQuote
    ? getDailyBuddyQuote(
        `${user.id}-${today}-vandaag`,
        cycleEstimate?.phase ?? null,
        preferredStyles,
      )
    : null

  const wantRecoveryRow =
    Boolean(mentalWellbeingSuggestion) ||
    checkin?.needs?.includes("rust") ||
    checkin?.needs?.includes("mezelf") ||
    !(profile?.movement_enabled ?? true)

  // When roadmap follows, keep the phase chip short — avoid repeating the same story.
  // Predicted bleed (not started): soft line instead of a hard cycle-day claim.
  const phaseSubtitle =
    predictedMenstruation && !isMenstruationActive
      ? ""
      : cycleEstimate
        ? hormoneRoadmap
          ? PHASE_TAGLINE[cycleEstimate.phase]
          : (bodyRecognition?.text ?? PHASE_TAGLINE[cycleEstimate.phase])
        : ""

  const checkinFormProps = {
    initial: checkin ?? null,
    mentalWellbeingEnabled: profile?.mental_wellbeing_enabled === true,
    sleepTrackingEnabled: sleepEnabled,
    customSymptoms: profile?.custom_symptoms ?? [],
  }

  return (
    // On wide screens: phase + greeting stay in view on the left, the day's
    // plan scrolls on the right (usertest: one narrow column left half the
    // laptop screen empty).
    <div className="w-full max-w-2xl xl:max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 xl:grid xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:gap-12 xl:items-start">
        <header className="mb-8 xl:sticky xl:top-10">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl lg:text-4xl text-ink min-w-0 pt-1">
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
            <div className="mt-5">
              <PhaseContextCard
                phase={cycleEstimate.phase}
                phaseLabel={cycleEstimate.phaseLabel}
                cycleDay={cycleEstimate.cycleDay}
                subtitle={phaseSubtitle}
                hasCycle={hasCycle}
                isMenstruationActive={isMenstruationActive}
                menstruationDay={menstruationDay}
                predictedMenstruation={predictedMenstruation}
                menstruationSoftHint={menstruationSoftHint}
                cycleLength={cycleProfile?.average_cycle_length ?? null}
                periodLength={cycleProfile?.average_period_length ?? null}
                nextPeriodStart={nextPeriod && nextPeriod.daysUntil >= 0 ? nextPeriod.estimatedStart : null}
              />
            </div>
          ) : hasCycle && isMenstruationActive && menstruationDay ? (
            <div className="mt-3">
              <PhaseContextCard
                phase="menstruatie"
                phaseLabel="Menstruatie"
                cycleDay={menstruationDay}
                subtitle="Je hebt menstruatie gestart. Vul je cyclusgegevens aan voor een volledige fase-inschatting."
                hasCycle
                isMenstruationActive
                menstruationDay={menstruationDay}
              />
            </div>
          ) : hasCycle ? (
            <div className="mt-3">
              <CycleSetupCard />
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-ink-soft">
                Fijn dat je er bent. Kies vandaag wat bij je past.
              </p>
            </div>
          )}
        </header>

        <VandaagCheckinSlot
          hasMeaningfulCheckin={hasMeaningfulCheckin}
          {...checkinFormProps}
          earlyExtras={
            <>
              {anticipation && <AnticipationNote anticipation={anticipation} />}
              {hormoneRoadmap && (
                <HormoneRoadmapNote
                  roadmap={hormoneRoadmap}
                  phaseTone={tone}
                  savedTexts={savedTexts}
                />
              )}
            </>
          }
          plan={
            recommendation ? (
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
            ) : null
          }
          lateExtras={
            <>
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

              {buddyQuote && <BuddyQuoteCard quote={buddyQuote} />}

              {profileIncomplete && <ProfileCompleteCard />}

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
            </>
          }
        />
      </div>
  )
}
