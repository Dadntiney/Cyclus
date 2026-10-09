import { todayISO } from "@/lib/dates/amsterdam"

/**
 * Pure helpers for the Buddy conversation (BUD-5, BUD-8): quiet day
 * separators and message groups, so the avatar only sits under the last
 * bubble of a run of Buddy messages.
 *
 * Days are Europe/Amsterdam calendar days, like "today" everywhere else in
 * the app. That keeps the server render and the hydrated client identical
 * (the server runs in UTC), so the separators never cause a hydration
 * mismatch. Labels are built by hand, not with Intl month names, for the
 * same reason: engines disagree on "sep" vs "sep.".
 */

const WEEKDAYS = ["zo", "ma", "di", "wo", "do", "vr", "za"] as const
const MONTHS = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"] as const

/** Calendar day (`yyyy-MM-dd`, Europe/Amsterdam) a message was sent on; null when unreadable. */
export function messageDay(createdAt: string): string | null {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return null
  return todayISO(date)
}

function parseDay(dayISO: string): { y: number; m: number; d: number } {
  const [y, m, d] = dayISO.split("-").map(Number)
  return { y, m, d }
}

function shiftDay(dayISO: string, days: number): string {
  const { y, m, d } = parseDay(dayISO)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/**
 * "Vandaag", "Gisteren", "ma 28 sep" — with the year added once the day
 * lies in another year than today ("vr 12 dec 2025").
 */
export function dayLabel(dayISO: string, today: string): string {
  if (dayISO === today) return "Vandaag"
  if (dayISO === shiftDay(today, -1)) return "Gisteren"
  const { y, m, d } = parseDay(dayISO)
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  const label = `${weekday} ${d} ${MONTHS[m - 1]}`
  return y === parseDay(today).y ? label : `${label} ${y}`
}

export interface ThreadMessageLike {
  id: string
  role: string
  created_at: string
}

export type ThreadItem<M extends ThreadMessageLike> =
  | { kind: "day"; key: string; label: string }
  | {
      kind: "message"
      key: string
      message: M
      /** First bubble of a run from the same sender (more room above it). */
      groupStart: boolean
      /** Last bubble of the run: carries the avatar and the bubble tail. */
      groupEnd: boolean
    }

function sender(role: string): "user" | "buddy" {
  return role === "user" ? "user" : "buddy"
}

/**
 * The conversation as rendered: a day separator before the first message of
 * every Amsterdam day, and each message marked as the start / end of a run
 * from one sender. A day change always starts a new run. `breaksAfter`
 * ends a run after a message regardless (a bubble that failed to send has
 * its own status line under it).
 */
export function buildThread<M extends ThreadMessageLike>(
  messages: readonly M[],
  today: string,
  breaksAfter?: (message: M) => boolean,
): ThreadItem<M>[] {
  const items: ThreadItem<M>[] = []
  let currentDay: string | null = null
  let previous: { sender: "user" | "buddy"; item: Extract<ThreadItem<M>, { kind: "message" }> } | null = null

  for (const message of messages) {
    const day = messageDay(message.created_at)
    const newDay = day !== null && day !== currentDay
    if (newDay) {
      currentDay = day
      items.push({ kind: "day", key: `day-${day}`, label: dayLabel(day, today) })
    }

    const from = sender(message.role)
    const continues =
      previous !== null && !newDay && previous.sender === from && !(breaksAfter?.(previous.item.message) ?? false)
    if (previous && !continues) previous.item.groupEnd = true

    const item: Extract<ThreadItem<M>, { kind: "message" }> = {
      kind: "message",
      key: message.id,
      message,
      groupStart: !continues,
      groupEnd: false,
    }
    items.push(item)
    previous = { sender: from, item }
  }

  if (previous) previous.item.groupEnd = true
  return items
}
