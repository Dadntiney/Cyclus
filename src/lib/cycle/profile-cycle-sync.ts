import { todayISO } from "@/lib/dates/amsterdam"
import { buildPeriodSeedDates, clampPeriodLength, isPeriodStillActive } from "@/lib/cycle/period-seed"

export interface StoredCycleState {
  last_period_start: string | null
  active_period_start: string | null
}

export interface ProfileCycleInput {
  hasCycle: boolean
  lastPeriodStart: string | null
  averagePeriodLength: number | null
}

export interface ProfileCyclePlan {
  /** Value to store in cycle_profiles.active_period_start. */
  activePeriodStart: string | null
  /** Value to store in cycle_profiles.average_period_length. */
  averagePeriodLength: number | null
  /**
   * Menstruation days to add to cycle_logs — only days without an existing
   * row may be written (insert-if-missing), so a day she deliberately
   * unmarked in the kalender is never switched back on.
   */
  seedDates: string[]
}

/**
 * Decides what a Profiel save may change about her cycle registration.
 *
 * Profiel autosaves every field on every edit, and `lastPeriodStart` in the
 * form is simply the value the app itself synced from her kalender. So only
 * an actual change of that date counts as her telling us something new about
 * her period; any other edit (her name, a toggle) must leave the active
 * period and the kalender exactly as they were — otherwise a period she
 * stopped on Vandaag would silently start again.
 */
export function planProfileCycleUpdate(
  input: ProfileCycleInput,
  stored: StoredCycleState | null,
  today: string = todayISO(),
): ProfileCyclePlan {
  if (!input.hasCycle) {
    return { activePeriodStart: null, averagePeriodLength: null, seedDates: [] }
  }

  const averagePeriodLength = input.lastPeriodStart ? clampPeriodLength(input.averagePeriodLength) : null
  const storedActive = stored?.active_period_start ?? null
  const startChanged = input.lastPeriodStart !== (stored?.last_period_start ?? null)

  if (!startChanged || !input.lastPeriodStart) {
    return { activePeriodStart: storedActive, averagePeriodLength, seedDates: [] }
  }

  const start = input.lastPeriodStart
  const periodLength = averagePeriodLength ?? clampPeriodLength(null)

  let activePeriodStart: string | null
  if (storedActive && storedActive !== stored?.last_period_start) {
    // A period started from Vandaag that differs from the synced start —
    // never override it from the profile.
    activePeriodStart = storedActive
  } else if (storedActive) {
    // She corrected the start date of the period that is running right now.
    activePeriodStart = start <= today ? start : storedActive
  } else {
    // No running period: a freshly entered recent start that still covers
    // today counts as running, like during onboarding.
    activePeriodStart = isPeriodStillActive(start, periodLength, today) ? start : null
  }

  return {
    activePeriodStart,
    averagePeriodLength,
    seedDates: buildPeriodSeedDates(start, periodLength, today),
  }
}
