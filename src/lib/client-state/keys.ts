/**
 * localStorage keys that are also kept on the account (user_client_state),
 * so week-plan adjustments, the grocery checklist, servings and "dag
 * afgesloten" follow her to another device. Shared by the client sync and
 * the server action that validates what may be stored.
 */

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
const DATE = "\\d{4}-\\d{2}-\\d{2}"

const SYNCED_KEY_PATTERNS = [
  new RegExp(`^cyclus:week-overrides:(${UUID}):${DATE}$`),
  new RegExp(`^cyclus:grocery-checked:(${UUID}):${DATE}$`),
  new RegExp(`^cyclus:servings:(${UUID})$`),
  new RegExp(`^cyclus:day-closed:(${UUID}):${DATE}$`),
]

/** The user id a synced key belongs to, or null when the key is not synced. */
export function syncedKeyOwner(key: string): string | null {
  for (const pattern of SYNCED_KEY_PATTERNS) {
    const match = pattern.exec(key)
    if (match) return match[1]
  }
  return null
}

export const MAX_SYNCED_VALUE_LENGTH = 20000

/** Rows older than this are not loaded back onto a device. */
export const SYNC_WINDOW_DAYS = 60
