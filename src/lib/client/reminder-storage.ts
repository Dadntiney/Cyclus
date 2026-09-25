"use client"

/**
 * Tracks which reminders have already been shown today (per device), so the
 * in-app toast doesn't nag her with the same reminder every minute until
 * midnight. Wrapped in try/catch throughout — storage can throw or be
 * unavailable (private browsing, blocked site data), and reminders should
 * simply stop deduping rather than break.
 */

function shownKey(reminderId: string): string {
  return `cyclus:reminder-shown:${reminderId}`
}

export function wasReminderShownToday(reminderId: string, dateISO: string): boolean {
  try {
    return localStorage.getItem(shownKey(reminderId)) === dateISO
  } catch {
    return false
  }
}

export function markReminderShownToday(reminderId: string, dateISO: string): void {
  try {
    localStorage.setItem(shownKey(reminderId), dateISO)
  } catch {
    // Ignore — worst case she sees the same reminder more than once today.
  }
}
