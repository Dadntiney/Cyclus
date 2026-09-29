import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { TodayCards } from "@/components/today/today-cards"
import { CheckinForm } from "@/components/today/checkin-form"
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
 * 2. One “voor jou vandaag” surface with a single primary CTA
 * 3. Light check-in
 * 4. Optional sleep / meds only
 */
export default async function VandaagPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const today = new Date().toISOString().slice(0, 10)

  const {
    profile,
    cycleProfile,
    cycleEstimate,
    isMenstruationActive,
    menstruationDay,
    recommendation,
    bodyRecognition,
    checkin,
    weekStartISO,
    completedWorkout,
    workoutAlternatives,
    medicationItems,
    mentalWellbeingSuggestion,
    sleepEntry,
    sleepObservation,
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
    (checkin.need ||
      (checkin.energy != null && checkin.energy <= 2) ||
      (checkin.mood != null && checkin.mood <= 2) ||
      (checkin.stress != null && checkin.stress >= 4))
      ? dayFocus
      : null

  // Generic recovery row only when it actually matches a need for rest,
  // or when movement is off (recovery becomes the soft primary).
  const wantRecoveryRow =
    Boolean(mentalWellbeingSuggestion) ||
    checkin?.need === "rust" ||
    checkin?.need === "mezelf" ||
    !(profile?.movement_enabled ?? true)

  return (
    <PullToRefresh>
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <header className="mb-6">
          <h1 className="font-display text-2xl lg:text-3xl text-ink tracking-tight">
            {greeting()}
            {profile?.name ? `, ${profile.name}` : ""}
          </h1>

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
                  <SleepCard date={today} entry={sleepEntry} />
                  {sleepObservation && (
                    <p className="text-xs text-ink-soft mt-2 px-1 leading-relaxed">{sleepObservation}</p>
                  )}
                  <Link
                    href="/slaap"
                    className="text-xs font-medium text-sage-dark mt-0.5 px-1 inline-flex items-center min-h-11 touch-manipulation"
                  >
                    Slaapgeschiedenis
                  </Link>
                </div>
              )}
              {showMedicationCard && <MedicationTodayCard items={medicationItems} date={today} />}
            </section>
          )}
        </div>
      </div>
    </PullToRefresh>
  )
}
