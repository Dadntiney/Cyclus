import Link from "next/link"
import { ChevronRight, Heart } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { TodayCards } from "@/components/today/today-cards"
import { AnticipationNote } from "@/components/today/anticipation-note"
import { CheckinForm } from "@/components/today/checkin-form"
import { DayCloseCard } from "@/components/today/day-close-card"
import { MedicationTodayCard } from "@/components/today/medication-today-card"
import { SleepCard } from "@/components/sleep/sleep-card"
import { MenstruationQuickAction } from "@/components/cycle/menstruation-quick-action"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { cn } from "@/lib/utils"
import { greeting } from "@/lib/greeting"

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
 * 1. Hello + cycle context (incl. menstruatie-actie hier — vindbaar, niet luid)
 * 2. Optional vooruitkijken note (her harder days approaching)
 * 3. One “voor jou vandaag” surface with a single primary CTA
 * 4. Light check-in
 * 5. Optional sleep / meds only
 * 6. Soft day checkout — close the day without a second form
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
    checkin,
    today,
    weekStartISO,
    completedWorkout,
    workoutAlternatives,
    medicationItems,
    mentalWellbeingSuggestion,
    sleepEntry,
    sleepObservation,
    recipeImageById,
  } = await getVandaagData(user.id)

  const showMedicationCard =
    Boolean(profile?.show_medication_on_dashboard) && medicationItems.length > 0
  const sleepEnabled = profile?.sleep_tracking_enabled === true
  const hasCycle = Boolean(cycleProfile?.has_cycle)
  const tone = cycleEstimate ? PHASE_TONE[cycleEstimate.phase] : null

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

  // Generic recovery row only when it actually matches a need for rest,
  // or when movement is off (recovery becomes the soft primary).
  const wantRecoveryRow =
    Boolean(mentalWellbeingSuggestion) ||
    checkin?.needs?.includes("rust") ||
    checkin?.needs?.includes("mezelf") ||
    !(profile?.movement_enabled ?? true)

  return (
    <PullToRefresh>
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <header className="mb-6">
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
              <Heart className="h-5 w-5" strokeWidth={1.75} />
            </Link>
          </div>

          {cycleEstimate && tone ? (
            <div className="mt-3">
              <Link
                href="/cyclus/vandaag"
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 touch-manipulation motion-safe:active:scale-[0.99] transition-transform",
                  tone.bg,
                )}
              >
                <span
                  className={cn(
                    "font-display text-xl leading-none tabular-nums shrink-0",
                    tone.text,
                  )}
                >
                  {cycleEstimate.cycleDay}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm font-medium", tone.text)}>
                    {cycleEstimate.phaseLabel}
                  </span>
                  <span className="block text-xs text-ink-soft mt-0.5 leading-relaxed">
                    {bodyRecognition?.text ?? PHASE_TAGLINE[cycleEstimate.phase]}
                  </span>
                </span>
                <ChevronRight
                  className={cn("h-4 w-4 shrink-0 opacity-70", tone.text)}
                  strokeWidth={2}
                  aria-hidden
                />
                <span className="sr-only">Open uitleg over deze fase</span>
              </Link>

              {/* Menstruatie: bij cyclus-context — vindbaar, geen aparte dashboardkaart. */}
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

        <div className="flex flex-col gap-8">
          {anticipation && <AnticipationNote anticipation={anticipation} />}

          {recommendation && (
            <TodayCards
              recommendation={recommendation}
              userId={user.id}
              date={today}
              weekStartISO={weekStartISO}
              workoutAlternatives={workoutAlternatives}
              completedWorkout={completedWorkout}
              mentalSuggestion={mentalWellbeingSuggestion}
              focusLine={personalizedFocus}
              showRecovery={wantRecoveryRow}
              recipeImageById={recipeImageById}
            />
          )}

          <CheckinForm
            initial={checkin ?? null}
            mentalWellbeingEnabled={profile?.mental_wellbeing_enabled === true}
            sleepTrackingEnabled={sleepEnabled}
            customSymptoms={profile?.custom_symptoms ?? []}
          />

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
            hasCheckin={Boolean(
              checkin &&
                (checkin.energy ||
                  checkin.mood ||
                  checkin.sleep ||
                  checkin.stress ||
                  (checkin.symptoms?.length ?? 0) > 0 ||
                  (checkin.needs?.length ?? 0) > 0 ||
                  (checkin.notes?.trim()?.length ?? 0) > 0),
            )}
            movementEnabled={profile?.movement_enabled ?? true}
            movementDone={Boolean(completedWorkout)}
            sleepTrackingEnabled={sleepEnabled}
            hasSleepEntry={Boolean(sleepEntry)}
            mentalWellbeingEnabled={profile?.mental_wellbeing_enabled === true}
          />
        </div>
      </div>
    </PullToRefresh>
  )
}
