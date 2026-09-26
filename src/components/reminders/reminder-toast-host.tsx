"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { REMINDER_TYPE_OPTIONS } from "@/lib/constants"
import { getDueReminders, type ReminderLike } from "@/lib/client/reminder-scheduler"
import {
  getDueMedicationReminders,
  type MedicationReminderLike,
} from "@/lib/client/medication-reminder-scheduler"
import { wasReminderShownToday, markReminderShownToday } from "@/lib/client/reminder-storage"
import { resolveReminderText } from "@/lib/buddy/reminder-labels"
import { cn } from "@/lib/utils"

const TYPE_BY_VALUE = new Map<string, (typeof REMINDER_TYPE_OPTIONS)[number]>(
  REMINDER_TYPE_OPTIONS.map((t) => [t.value, t]),
)

interface Toast {
  id: string
  emoji: string
  text: string
}

function reminderToast(reminder: ReminderLike, preferredStyles: string[], todayISO: string): Toast {
  const typeOption = TYPE_BY_VALUE.get(reminder.type)
  return {
    id: reminder.id,
    emoji: typeOption?.emoji ?? "🔔",
    text: resolveReminderText(
      reminder.type,
      reminder.label,
      typeOption?.defaultLabel ?? "",
      preferredStyles,
      `${reminder.id}-${todayISO}`,
    ),
  }
}

function medicationToast(medication: MedicationReminderLike): Toast {
  return {
    id: medication.id,
    emoji: "💊",
    text: `Herinnering: je hebt vandaag ${medication.name} ingepland.`,
  }
}

/**
 * Mounted once in the app layout so it can surface a reminder on any page.
 * Purely in-app: while the tab is open, it checks every minute whether a
 * reminder is due (see reminder-scheduler.ts) and shows a small dismissible
 * toast, plus a native browser Notification if she's granted permission.
 * There's no push server behind this — it can't wake up a closed browser —
 * so it only ever fires while Cyclus is actually open.
 */
export function ReminderToastHost({
  reminders,
  medications = [],
  buddyStyles = [],
}: {
  reminders: ReminderLike[]
  medications?: MedicationReminderLike[]
  buddyStyles?: string[]
}) {
  const [visible, setVisible] = useState<Toast[]>([])

  useEffect(() => {
    const hasReminders = reminders.some((r) => r.enabled)
    const hasMedicationReminders = medications.some((m) => m.reminderEnabled)
    if (!hasReminders && !hasMedicationReminders) return

    function check() {
      const now = new Date()
      const dueReminders = getDueReminders(reminders, now, wasReminderShownToday)
      const dueMedications = getDueMedicationReminders(medications, now, wasReminderShownToday)
      if (!dueReminders.length && !dueMedications.length) return

      const todayISO = now.toISOString().slice(0, 10)
      const toasts: Toast[] = []

      for (const reminder of dueReminders) {
        markReminderShownToday(reminder.id, todayISO)
        toasts.push(reminderToast(reminder, buddyStyles, todayISO))
      }
      for (const medication of dueMedications) {
        markReminderShownToday(medication.id, todayISO)
        toasts.push(medicationToast(medication))
      }

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        for (const toast of toasts) {
          try {
            new Notification("Cyclus", { body: toast.text, icon: "/favicon.ico" })
          } catch {
            // Notifications can throw in some contexts (e.g. iOS Safari) —
            // the in-app toast below still covers her either way.
          }
        }
      }
      setVisible((prev) => [...prev, ...toasts])
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [reminders, medications, buddyStyles])

  function dismiss(id: string) {
    setVisible((prev) => prev.filter((r) => r.id !== id))
  }

  if (!visible.length) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-0 z-40 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {visible.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm bg-white border border-line rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 animate-pop-in",
          )}
        >
          <span className="text-xl shrink-0" aria-hidden>
            {toast.emoji}
          </span>
          <p className="flex-1 text-sm text-ink">{toast.text}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
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
