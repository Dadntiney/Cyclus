import type { Metadata } from "next"
import { getAuthedUser } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { TodayCards } from "@/components/today/today-cards"
import { HormoneRoadmapNote, type SmallTip } from "@/components/today/hormone-roadmap-note"
import { PhaseContextCard } from "@/components/today/phase-context-card"
import { CycleSetupCard } from "@/components/today/cycle-setup-card"
import { CheckinForm } from "@/components/today/checkin-form"
import { DayCloseCard } from "@/components/today/day-close-card"
import { BuddyQuoteCard } from "@/components/today/buddy-quote-card"
import { MedicationTodayCard } from "@/components/today/medication-today-card"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { SleepCard } from "@/components/sleep/sleep-card"
import { ProfileCompleteCard } from "@/components/today/profile-complete-card"
import { greeting } from "@/lib/greeting"
import { FEATURES } from "@/lib/navigation/features"
import { estimateNextPeriod } from "@/lib/cycle/next-period"
import { getDailyBuddyQuote } from "@/lib/data/buddy-quotes"
import { shouldShowBuddyMessage, type BuddyStyle } from "@/lib/buddy/styles"

export const metadata: Metadata = { title: FEATURES.vandaag.label }

/** A Buddy quote about drinking: then the vocht tip steps aside (besluit 29). */
const WATER_QUOTE = /\b(water|drink\w*|vocht\w*)\b/i

/**
 * Vandaag = one calm composition, not a widget dashboard (ontwerpvisie §7.1).
 *
 * 1. Greeting (compact title "Vandaag")
 * 2. Phase status — the one tinted block
 * 3. Check-in on its fixed place (#checkin)
 * 4. Voor jou vandaag: one day voice + the plan card
 * 5. Wat je lichaam kan gebruiken (flat): vooruitkijken, supports, one small tip
 * 6. Optional sleep / medication
 * 7. Even onthouden (Buddy quote, flat)
 * 8. Profiel aanvullen
 * 9. Even afronden
 *
 * Below xl one readable column (content width); on xl greeting, phase and
 * check-in on the left and the rest on the right (no sticky columns,
 * besluit 28).
 */
export default async function VandaagPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const {
    profile,
    cycleProfile,
    cycleHistory,
    effectiveLastStart,
    cycleEstimate,
    isMenstruationActive,
    menstruationDay,
    predictedMenstruation,
    menstruationSoftHint,
    recommendation,
    restDay,
    bodyRecognition,
    anticipation,
    hormoneRoadmap,
    changingCycle,
    lowDay,
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
  const profileIncomplete =
    !profile?.hormonal_medication_status &&
    (profile?.health_conditions?.length ?? 0) === 0 &&
    (profile?.movement_limitations?.length ?? 0) === 0
  // The same inputs as /cyclus (effective last start + her finished
  // cycles), so the phase status shows the same "Volgende ~d MMM" there.
  const nextPeriod = estimateNextPeriod({
    lastPeriodStart: effectiveLastStart,
    averageCycleLength: cycleProfile?.average_cycle_length ?? null,
    hasCycle,
    regularity: cycleProfile?.regularity ?? null,
    lifeStage: cycleProfile?.life_stage ?? null,
    history: cycleHistory,
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

  // One day voice, said once under "Voor jou vandaag": her check-in, else
  // the roadmap's why (with a heart), else what her body may recognise.
  const dayVoice: { text: string; source: "checkin" | "roadmap" | "body" } | null = personalizedFocus
    ? { text: personalizedFocus, source: "checkin" }
    : hormoneRoadmap?.whyNow
      ? { text: hormoneRoadmap.whyNow, source: "roadmap" }
      : bodyRecognition?.text
        ? { text: bodyRecognition.text, source: "body" }
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
        { skipPhaseQuotes: lowDay || changingCycle },
      )
    : null

  // One small tip: the snack, else vocht — unless today's quote already
  // talks about drinking (the quote always stays, besluit 29).
  const snackTip = recommendation?.nutritionEnabled ? recommendation.nutrition.snackTip : null
  const hydrationTip = recommendation?.nutrition.hydrationTip ?? null
  const quoteAboutWater = buddyQuote ? WATER_QUOTE.test(buddyQuote.text) : false
  const smallTip: SmallTip | null = snackTip
    ? { kind: "snack", tip: snackTip, showWhy: !lowDay }
    : hydrationTip && !quoteAboutWater
      ? { kind: "hydration", tip: hydrationTip }
      : null

  const wantRecoveryRow =
    Boolean(mentalWellbeingSuggestion) ||
    checkin?.needs?.includes("rust") ||
    checkin?.needs?.includes("mezelf") ||
    !(profile?.movement_enabled ?? true)

  const name = profile?.name ? `, ${profile.name}` : ""

  let phaseStatus = null
  if (cycleEstimate) {
    phaseStatus = (
      <PhaseContextCard
        phase={cycleEstimate.phase}
        phaseLabel={cycleEstimate.phaseLabel}
        roughEstimate={changingCycle}
        cycleDay={cycleEstimate.cycleDay}
        hasCycle={hasCycle}
        isMenstruationActive={isMenstruationActive}
        menstruationDay={menstruationDay}
        predictedMenstruation={predictedMenstruation}
        menstruationSoftHint={menstruationSoftHint}
        cycleLength={cycleProfile?.average_cycle_length ?? null}
        periodLength={cycleProfile?.average_period_length ?? null}
        nextPeriodStart={nextPeriod && nextPeriod.daysUntil >= 0 ? nextPeriod.estimatedStart : null}
      />
    )
  } else if (hasCycle && isMenstruationActive && menstruationDay) {
    phaseStatus = (
      <PhaseContextCard
        phase="menstruatie"
        phaseLabel="Menstruatie"
        cycleDay={menstruationDay}
        hasCycle
        isMenstruationActive
        menstruationDay={menstruationDay}
        note="Vul je cyclusgegevens aan voor een volledige fase-inschatting."
      />
    )
  } else if (hasCycle) {
    phaseStatus = <CycleSetupCard />
  }

  return (
    <Page
      width="wide"
      className="max-w-2xl xl:grid xl:max-w-6xl xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:items-start xl:gap-x-12"
    >
      <div>
        <PageHeader
          title={`${greeting()}${name}`}
          compactTitle={FEATURES.vandaag.label}
          subtitle={phaseStatus ? undefined : "Fijn dat je er bent. Kies vandaag wat bij je past."}
        />
        <div className="flex flex-col gap-8">
          {phaseStatus}
          <CheckinForm
            initial={checkin ?? null}
            mentalWellbeingEnabled={profile?.mental_wellbeing_enabled === true}
            sleepTrackingEnabled={sleepEnabled}
            customSymptoms={profile?.custom_symptoms ?? []}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 xl:mt-0">
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
            focusLine={dayVoice?.text ?? null}
            focusAction={
              dayVoice?.source === "roadmap" ? (
                <MomentFavoriteButton
                  kind="roadmap"
                  text={dayVoice.text}
                  source="hormone-roadmap"
                  initialFavorited={savedTexts.includes(dayVoice.text)}
                  size="sm"
                />
              ) : null
            }
            hideWorkoutReason={dayVoice?.source === "checkin"}
            showRecovery={wantRecoveryRow}
            restDay={restDay}
            recipeImageById={recipeImageById}
          />
        )}

        <HormoneRoadmapNote
          roadmap={hormoneRoadmap}
          savedTexts={savedTexts}
          changingCycle={changingCycle}
          hideWhy={Boolean(recommendation)}
          excludeKinds={recommendation?.movementEnabled ? ["beweging"] : []}
          tip={smallTip}
          anticipation={anticipation}
        />

        {(sleepEnabled || showMedicationCard) && (
          <div className="flex flex-col gap-8">
            {sleepEnabled && (
              <div id="slaap-vandaag" className="scroll-mt-4">
                <SleepCard
                  date={today}
                  entry={sleepEntry}
                  observation={sleepObservation}
                  historyHref="/slaap"
                />
              </div>
            )}
            {showMedicationCard && <MedicationTodayCard items={medicationItems} date={today} />}
          </div>
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
          restDay={restDay}
          sleepTrackingEnabled={sleepEnabled}
          hasSleepEntry={Boolean(sleepEntry)}
          mentalWellbeingEnabled={profile?.mental_wellbeing_enabled === true}
          savedTexts={savedTexts}
        />
      </div>
    </Page>
  )
}
