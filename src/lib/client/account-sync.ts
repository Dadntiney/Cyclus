"use client"

import { saveClientState } from "@/lib/actions/client-state"
import { syncedKeyOwner } from "@/lib/client-state/keys"

/**
 * Background mirror of selected localStorage entries to the account
 * (user_client_state). localStorage stays the fast, synchronous source the
 * UI reads; this file only makes sure the same values reach the server and
 * come back on another device. Nothing here throws or blocks the UI.
 */

export const ACCOUNT_STATE_APPLIED_EVENT = "cyclus:account-state-applied"

const inFlight = new Set<string>()
const pending = new Map<string, string | null>()
/** Keys written on this page since it loaded; a server snapshot must not undo them. */
const writtenThisPage = new Set<string>()

/** Queue the latest value of a synced key for the account. Coalesces rapid writes per key. */
export function syncToAccount(key: string, value: string | null): void {
  if (!syncedKeyOwner(key)) return
  writtenThisPage.add(key)
  pending.set(key, value)
  if (inFlight.has(key)) return
  inFlight.add(key)
  void (async () => {
    while (pending.has(key)) {
      const next = pending.get(key) ?? null
      pending.delete(key)
      try {
        await saveClientState(key, next)
      } catch {
        // Offline or a failed request: the device copy is still correct and
        // the next change to this key sends the whole value again.
      }
    }
    inFlight.delete(key)
  })()
}

function migratedFlag(userId: string) {
  return `cyclus:account-sync-migrated:${userId}`
}

/**
 * Brings this device in line with the account on a full page load. The
 * first time, entries that only exist on this device are uploaded (they
 * predate syncing); after that the account wins and stale device-only
 * entries are dropped.
 */
export function applyAccountState(userId: string, rows: { key: string; value: string }[]): void {
  let changed = false
  try {
    const onServer = new Set<string>()
    for (const row of rows) {
      if (syncedKeyOwner(row.key) !== userId) continue
      onServer.add(row.key)
      if (writtenThisPage.has(row.key)) continue
      if (localStorage.getItem(row.key) !== row.value) {
        localStorage.setItem(row.key, row.value)
        changed = true
      }
    }

    const firstSync = localStorage.getItem(migratedFlag(userId)) !== "1"
    const deviceOnly: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && syncedKeyOwner(key) === userId && !onServer.has(key) && !writtenThisPage.has(key)) {
        deviceOnly.push(key)
      }
    }
    if (firstSync) {
      // Only mark the device as migrated once every upload succeeded;
      // otherwise the next load would treat these entries as stale.
      const uploads = deviceOnly.map((key) =>
        saveClientState(key, localStorage.getItem(key)).then(
          (r) => !r?.error,
          () => false,
        ),
      )
      void Promise.all(uploads).then((results) => {
        if (results.every(Boolean)) {
          try {
            localStorage.setItem(migratedFlag(userId), "1")
          } catch {
            /* ignore */
          }
        }
      })
    } else {
      for (const key of deviceOnly) {
        localStorage.removeItem(key)
        changed = true
      }
    }
  } catch {
    return
  }
  if (changed) {
    try {
      window.dispatchEvent(new Event(ACCOUNT_STATE_APPLIED_EVENT))
    } catch {
      /* ignore */
    }
  }
}

/** Removes this app's personal data from the device (on logout). */
export function clearLocalUserData(): void {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith("cyclus:") || key.startsWith("gofiev:"))) keys.push(key)
    }
    for (const key of keys) localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
