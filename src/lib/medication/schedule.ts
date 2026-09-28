import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns"

/**
 * Pure schedule math for medications — entirely derived from what the user
 * typed in (schedule type, days, start date), never from any assumption
 * about what a "normal" HT/AC schedule looks like. Shared by the daily
 * dashboard widget (is today an "on" day?) and the reminder scheduler.
 */

export type MedicationScheduleType = "dagelijks" | "om_de_dag" | "wekelijkse_dagen" | "cyclisch" | "eigen_schema"

export interface MedicationSchedule {
  scheduleType: MedicationScheduleType
  /** ISO weekdays 1-7, only meaningful for "wekelijkse_dagen". */
  scheduleDays: number[] | null
  /** Day counts, only meaningful for "cyclisch". */
  scheduleDaysOn: number | null
  scheduleDaysOff: number | null
  /** Anchor date for "om_de_dag" and "cyclisch"; also the informational "sinds wanneer". */
  startDate: string | null
  endDate: string | null
}

function isoWeekday(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

/**
 * Whether `date` is a dosing/use day for this schedule.
 * - true/false for schedule types the app can actually compute.
 * - null for "eigen_schema", or when required fields are missing — meaning
 *   "not automatically trackable", not "no". Callers should treat null as
 *   "show it as a static entry, don't claim to know today's on/off state".
 */
export function isDosingDay(schedule: MedicationSchedule, date: Date): boolean | null {
  if (schedule.endDate && date > parseISO(schedule.endDate)) return false
  if (schedule.startDate && date < parseISO(schedule.startDate)) return false

  switch (schedule.scheduleType) {
    case "dagelijks":
      return true
    case "wekelijkse_dagen":
      return schedule.scheduleDays?.length ? schedule.scheduleDays.includes(isoWeekday(date)) : null
    case "om_de_dag": {
      if (!schedule.startDate) return null
      const daysSince = differenceInCalendarDays(date, parseISO(schedule.startDate))
      return daysSince >= 0 && daysSince % 2 === 0
    }
    case "cyclisch": {
      if (!schedule.startDate || !schedule.scheduleDaysOn || schedule.scheduleDaysOff === null) return null
      const daysSince = differenceInCalendarDays(date, parseISO(schedule.startDate))
      if (daysSince < 0) return null
      const cycleLength = schedule.scheduleDaysOn + schedule.scheduleDaysOff
      if (cycleLength <= 0) return null
      const dayInCycle = daysSince % cycleLength
      return dayInCycle < schedule.scheduleDaysOn
    }
    case "eigen_schema":
      return null
  }
}

/**
 * Whether `date` is the FIRST day of an "on" block in a "cyclisch" schedule
 * (e.g. day 1 of "2 weken wel") — used to send a start reminder instead of
 * the plain daily one. Always false for other schedule types: "start" only
 * means something when the schedule actually repeats on/off.
 */
export function isScheduleStartDay(schedule: MedicationSchedule, date: Date): boolean {
  if (schedule.scheduleType !== "cyclisch") return false
  if (!schedule.startDate || !schedule.scheduleDaysOn || schedule.scheduleDaysOff === null) return false
  const daysSince = differenceInCalendarDays(date, parseISO(schedule.startDate))
  if (daysSince < 0) return false
  const cycleLength = schedule.scheduleDaysOn + schedule.scheduleDaysOff
  if (cycleLength <= 0) return false
  return daysSince % cycleLength === 0
}

/**
 * Whether `date` is the LAST day of an "on" block — the day the reminder
 * should say "your period ends today", fired on the last active day itself
 * rather than the first "off" day after it.
 */
export function isScheduleStopDay(schedule: MedicationSchedule, date: Date): boolean {
  if (schedule.scheduleType !== "cyclisch") return false
  if (!schedule.startDate || !schedule.scheduleDaysOn || schedule.scheduleDaysOff === null) return false
  if (schedule.scheduleDaysOff === 0) return false // never actually turns "off"
  const daysSince = differenceInCalendarDays(date, parseISO(schedule.startDate))
  if (daysSince < 0) return false
  const cycleLength = schedule.scheduleDaysOn + schedule.scheduleDaysOff
  if (cycleLength <= 0) return false
  return daysSince % cycleLength === schedule.scheduleDaysOn - 1
}

export interface CyclicalPhaseInfo {
  phase: "wel" | "niet"
  /** Inclusive, ISO "yyyy-MM-dd". */
  phaseStartDate: string
  /** Inclusive, ISO "yyyy-MM-dd" — the last day of the current phase. */
  phaseEndDate: string
  nextPhase: "wel" | "niet"
  nextPhaseStartDate: string
}

/**
 * Where she is right now in a doorlopende "cyclisch" schema — the current
 * phase's own start/end date and the next phase's start date — so this can
 * be shown plainly in the medication settings ("huidige fase: 2 weken wel,
 * tot 14 juni · volgende fase: 2 weken niet, vanaf 15 juni") rather than
 * leaving the recurrence implicit. Purely derived from scheduleDaysOn/
 * scheduleDaysOff/startDate, same inputs as isDosingDay — nothing new to
 * keep in sync, and it recurs forever via the same modulo arithmetic.
 */
export function getCyclicalPhaseInfo(schedule: MedicationSchedule, date: Date): CyclicalPhaseInfo | null {
  if (schedule.scheduleType !== "cyclisch") return null
  if (!schedule.startDate || !schedule.scheduleDaysOn || schedule.scheduleDaysOff === null) return null
  const daysSince = differenceInCalendarDays(date, parseISO(schedule.startDate))
  if (daysSince < 0) return null
  const cycleLength = schedule.scheduleDaysOn + schedule.scheduleDaysOff
  if (cycleLength <= 0) return null

  const cycleIndex = Math.floor(daysSince / cycleLength)
  const dayInCycle = daysSince - cycleIndex * cycleLength
  const cycleStart = addDays(parseISO(schedule.startDate), cycleIndex * cycleLength)
  const isWel = dayInCycle < schedule.scheduleDaysOn
  const hasOffPhase = schedule.scheduleDaysOff > 0

  const iso = (d: Date) => format(d, "yyyy-MM-dd")

  if (isWel) {
    return {
      phase: "wel",
      phaseStartDate: iso(cycleStart),
      phaseEndDate: iso(addDays(cycleStart, schedule.scheduleDaysOn - 1)),
      nextPhase: hasOffPhase ? "niet" : "wel",
      nextPhaseStartDate: iso(addDays(cycleStart, schedule.scheduleDaysOn)),
    }
  }
  return {
    phase: "niet",
    phaseStartDate: iso(addDays(cycleStart, schedule.scheduleDaysOn)),
    phaseEndDate: iso(addDays(cycleStart, cycleLength - 1)),
    nextPhase: "wel",
    nextPhaseStartDate: iso(addDays(cycleStart, cycleLength)),
  }
}

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"]

/** Short, human-readable summary for lists, e.g. "Iedere dag · sinds 3 jan". */
export function describeSchedule(schedule: MedicationSchedule): string {
  const since = schedule.startDate ? ` · sinds ${parseISO(schedule.startDate).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}` : ""

  switch (schedule.scheduleType) {
    case "dagelijks":
      return `Iedere dag${since}`
    case "om_de_dag":
      return `Om de dag${since}`
    case "wekelijkse_dagen": {
      const days = (schedule.scheduleDays ?? []).slice().sort((a, b) => a - b)
      const labels = days.map((d) => WEEKDAY_LABELS[d - 1]).join(", ")
      return days.length ? `Op ${labels}` : "Bepaalde dagen van de week"
    }
    case "cyclisch": {
      if (!schedule.scheduleDaysOn || schedule.scheduleDaysOff === null) return `Periode wel/niet${since}`
      return `${schedule.scheduleDaysOn} dagen wel, ${schedule.scheduleDaysOff} dagen niet${since}`
    }
    case "eigen_schema":
      return "Eigen schema"
  }
}
