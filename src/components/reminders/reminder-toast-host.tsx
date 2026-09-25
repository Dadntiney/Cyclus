"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { REMINDER_TYPE_OPTIONS } from "@/lib/constants"
import { getDueReminders, type ReminderLike } from "@/lib/client/reminder-scheduler"
import { wasReminderShownToday, markReminderShownToday } from "@/lib/client/reminder-storage"
import { cn } from "@/lib/utils"

const TYPE_BY_VALUE = new Map<string, (typeof REMINDER_TYPE_OPTIONS)[number]>(
  REMINDER_TYPE_OPTIONS.map((t) => [t.value, t]),
)

function reminderText(reminder: ReminderLike): string {
  if (reminder.label?.trim()) return reminder.label.trim()
  return TYPE_BY_VALUE.get(reminder.type)?.defaultLabel || "Even een herinnering voor je."
}

function reminderEmoji(reminder: ReminderLike): string {
  return TYPE_BY_VALUE.get(reminder.type)?.emoji ?? "🔔"
}

/**
 * Mounted once in the app layout so it can surface a reminder on any page.
 * Purely in-app: while the tab is open, it checks every minute whether a
 * reminder is due (see reminder-scheduler.ts) and shows a small dismissible
 * toast, plus a native browser Notification if she's granted permission.
 * There's no push server behind this — it can't wake up a closed browser —
 * so it only ever fires while Cyclus is actually open.
 */
export function ReminderToastHost({ reminders }: { reminders: ReminderLike[] }) {
  const [visible, setVisible] = useState<ReminderLike[]>([])

  useEffect(() => {
    if (!reminders.some((r) => r.enabled)) return

    function check() {
      const now = new Date()
      const due = getDueReminders(reminders, now, wasReminderShownToday)
      if (!due.length) return

      const todayISO = now.toISOString().slice(0, 10)
      for (const reminder of due) {
        markReminderShownToday(reminder.id, todayISO)
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification("Cyclus", { body: reminderText(reminder), icon: "/favicon.ico" })
          } catch {
            // Notifications can throw in some contexts (e.g. iOS Safari) —
            // the in-app toast below still covers her either way.
          }
        }
      }
      setVisible((prev) => [...prev, ...due])
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [reminders])

  function dismiss(id: string) {
    setVisible((prev) => prev.filter((r) => r.id !== id))
  }

  if (!visible.length) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-0 z-40 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {visible.map((reminder) => (
        <div
          key={reminder.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm bg-white border border-line rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 animate-pop-in",
          )}
        >
          <span className="text-xl shrink-0" aria-hidden>
            {reminderEmoji(reminder)}
          </span>
          <p className="flex-1 text-sm text-ink">{reminderText(reminder)}</p>
          <button
            type="button"
            onClick={() => dismiss(reminder.id)}
            className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
