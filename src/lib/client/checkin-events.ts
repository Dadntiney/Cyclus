/**
 * Client signal when today's check-in has meaningful content saved.
 * DayCloseCard listens so “Check-in nog open” flips without waiting for
 * a full server round-trip (autosave does not otherwise refresh the page).
 */
export const CHECKIN_SAVED_EVENT = "cyclus:checkin-saved"

export function notifyCheckinSaved(date: string) {
  if (typeof window === "undefined") return
  try {
    window.dispatchEvent(
      new CustomEvent(CHECKIN_SAVED_EVENT, { detail: { date } }),
    )
  } catch {
    /* ignore */
  }
}
