/**
 * Shared “does this check-in count as filled?” — used by the form (compact
 * summary) and by Dag afronden (checklist). A bare row with all nulls does
 * not count.
 */
export function checkinHasContent(checkin: {
  energy: number | null
  mood: number | null
  sleep: number | null
  stress: number | null
  symptoms: string[] | null
  notes: string | null
  need: string | null
} | null): boolean {
  if (!checkin) return false
  return Boolean(
    checkin.energy ||
      checkin.mood ||
      checkin.sleep ||
      checkin.stress ||
      (checkin.symptoms?.length ?? 0) > 0 ||
      (checkin.notes?.trim()?.length ?? 0) > 0 ||
      checkin.need,
  )
}
