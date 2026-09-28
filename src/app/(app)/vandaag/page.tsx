import Link from "next/link"
import { getAuthedUser } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { TodayCards } from "@/components/today/today-cards"
import { TodayCycleStrip } from "@/components/today/today-cycle-strip"
import { CheckinForm } from "@/components/today/checkin-form"
import { MedicationTodayCard } from "@/components/today/medication-today-card"
import { SleepCard } from "@/components/sleep/sleep-card"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { greeting } from "@/lib/greeting"

/**
 * Vandaag = one calm “this is your day” composition.
 *
 * 1. Greeting + single cycle strip (never phase + menstruatie dubbel)
 * 2. One plan surface — rest leads when she needs rest
 * 3. Light check-in
 * 4. Optional sleep / meds
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

  const dayFocus = recommendation?.dayFocus ?? null
  const energyLow = checkin?.energy != null && checkin.energy <= 2
  const moodLow = checkin?.mood != null && checkin.mood <= 2
  const stressHigh = checkin?.stress != null && checkin.stress >= 4
  const fatigued = Boolean(
    checkin?.symptoms?.some((s) => s === "Vermoeidheid" || s === "Overprikkeld"),
  )
  const signalsLow =
    Boolean(checkin?.need) || energyLow || moodLow || stressHigh || fatigued

  // Only show the personal focus line when check-in actually says something.
  const personalizedFocus = dayFocus && signalsLow ? dayFocus : null

  // Soft days lead with rest/mental — never a hard workout as the hero CTA.
  // Explicit “beweging” need keeps movement first.
  const prioritizeRest =
    checkin?.need !== "beweging" &&
    (checkin?.need === "rust" ||
      checkin?.need === "mezelf" ||
      energyLow ||
      moodLow ||
      stressHigh ||
      fatigued)

  // Generic recovery only when it earns a place — not on every good day.
  const showRecovery =
    prioritizeRest ||
    checkin?.need === "mezelf" ||
    !(profile?.movement_enabled ?? true)

  return (
    <PullToRefresh>
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <header className="mb-7">
          <h1 className="font-display text-2xl lg:text-3xl text-ink tracking-tight">
            {greeting()}
            {profile?.name ? `, ${profile.name}` : ""}
          </h1>
          <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
            Fijn dat je er bent. Kies vandaag wat bij je past.
          </p>

          <TodayCycleStrip
            hasCycle={hasCycle}
            isMenstruationActive={isMenstruationActive}
            menstruationDay={menstruationDay}
            phase={cycleEstimate?.phase ?? null}
            phaseLabel={cycleEstimate?.phaseLabel ?? null}
            cycleDay={cycleEstimate?.cycleDay ?? null}
          />
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
              prioritizeRest={prioritizeRest}
              showRecovery={showRecovery}
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
                    <p className="text-xs text-ink-soft mt-2 px-1 leading-relaxed">
                      {sleepObservation}
                    </p>
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
