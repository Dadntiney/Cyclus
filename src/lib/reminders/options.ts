/**
 * Zod-free reminder helpers. Client components import these directly, so
 * the validation library (≈90 KB gzip) stays out of the browser bundle;
 * the Zod schemas in `@/lib/validations/*` reuse them on the server.
 */

/** "HH:MM:SS" (Postgres `time`) or "HH:MM" → "HH:MM". */
export function normalizeReminderTime(time: string): string {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time.trim())
  if (!match) return time.trim()
  return `${match[1]}:${match[2]}`
}

/** Allowed “how far ahead” values for doctor appointment reminders. */
export const DOCTOR_REMINDER_LEAD_OPTIONS = [
  { value: 0, label: "Op de dag zelf" },
  { value: 1, label: "1 dag van tevoren" },
  { value: 2, label: "2 dagen van tevoren" },
  { value: 7, label: "1 week van tevoren" },
] as const

export type DoctorReminderLeadDays = (typeof DOCTOR_REMINDER_LEAD_OPTIONS)[number]["value"]

export function doctorReminderLeadLabel(days: number): string {
  return DOCTOR_REMINDER_LEAD_OPTIONS.find((o) => o.value === days)?.label ?? `${days} dagen van tevoren`
}
