"use client"

import { useEffect, useState } from "react"
import { Moon, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CHECKIN_SAVED_EVENT } from "@/lib/client/checkin-events"
import {
  loadWeekOverrides,
  WEEK_OVERRIDES_CHANGED_EVENT,
} from "@/lib/client/week-plan-storage"

/**
 * Compact day wrap-up — not a second questionnaire. Lives at the bottom of
 * Vandaag so she can confirm what still needs a note (check-in, movement,
 * sleep) and mark the day “afgerond” without guilt or extra forms.
 *
 * Always available (not hour-gated): an evening-only gate hid the card when
 * hydration lagged, and users who close their day earlier still need it.
 *
 * Check-in status updates live via CHECKIN_SAVED_EVENT so autosave flips
 * “nog open” → “ingevuld” without waiting for a full navigation.
 */
export function DayCloseCard({
  userId,
  date,
  weekStartISO,
  hasCheckin,
  movementEnabled,
  movementDone,
  sleepTrackingEnabled,
  hasSleepEntry,
}: {
  userId: string
  date: string
  weekStartISO: string
  hasCheckin: boolean
  movementEnabled: boolean
  movementDone: boolean
  sleepTrackingEnabled: boolean
  hasSleepEntry: boolean
}) {
  const [closed, setClosed] = useState(false)
  // Optimistic flip after autosave; server `hasCheckin` wins once refresh lands.
  // Remount via key={date} on the parent so a new day starts clean.
  const [optimisticCheckin, setOptimisticCheckin] = useState(false)
  const checkinDone = hasCheckin || optimisticCheckin
  const [movementHandled, setMovementHandled] = useState(movementDone)
  const [hydrated, setHydrated] = useState(false)
  const storageKey = `cyclus:day-closed:${date}`

  useEffect(() => {
    function syncFromClient() {
      try {
        setClosed(localStorage.getItem(storageKey) === "1")
        const override = loadWeekOverrides(userId, weekStartISO)[`${date}:workout`]
        // Swap/skip counts as “genoteerd” — she already chose what today looks like.
        setMovementHandled(
          movementDone ||
            override?.type === "skip-workout" ||
            override?.type === "swap-workout",
        )
      } catch {
        setClosed(false)
        setMovementHandled(movementDone)
      }
      setHydrated(true)
    }
    function onCheckinSaved(event: Event) {
      const detail = (event as CustomEvent<{ date?: string }>).detail
      if (detail?.date && detail.date !== date) return
      setOptimisticCheckin(true)
    }
    syncFromClient()
    window.addEventListener(WEEK_OVERRIDES_CHANGED_EVENT, syncFromClient)
    window.addEventListener("focus", syncFromClient)
    window.addEventListener(CHECKIN_SAVED_EVENT, onCheckinSaved)
    return () => {
      window.removeEventListener(WEEK_OVERRIDES_CHANGED_EVENT, syncFromClient)
      window.removeEventListener("focus", syncFromClient)
      window.removeEventListener(CHECKIN_SAVED_EVENT, onCheckinSaved)
    }
  }, [storageKey, userId, weekStartISO, date, movementDone])

  function markClosed() {
    try {
      localStorage.setItem(storageKey, "1")
    } catch {
      /* ignore */
    }
    setClosed(true)
  }

  function reopen() {
    try {
      localStorage.removeItem(storageKey)
    } catch {
      /* ignore */
    }
    setClosed(false)
  }

  const items = [
    {
      key: "checkin",
      done: checkinDone,
      label: checkinDone ? "Check-in ingevuld" : "Check-in nog open",
      href: null as string | null,
    },
    ...(movementEnabled
      ? [
          {
            key: "movement",
            done: movementHandled,
            label: movementHandled ? "Beweging genoteerd" : "Beweging nog open",
            href: null,
          },
        ]
      : []),
    ...(sleepTrackingEnabled
      ? [
          {
            key: "sleep",
            done: hasSleepEntry,
            label: hasSleepEntry ? "Slaap ingevuld" : "Slaap nog invullen",
            href: hasSleepEntry ? null : "#",
          },
        ]
      : []),
  ]

  // Before client hydration, render the open checklist (not the closed state)
  // so SSR and first paint match. Closed state applies after localStorage read.
  if (hydrated && closed) {
    return (
      <div className="rounded-2xl border border-line/70 bg-sage-soft/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="h-5 w-5 text-sage-dark shrink-0" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-medium text-ink">Dag afgerond</p>
              <p className="text-xs text-ink-soft mt-0.5">Je kunt later nog iets aanpassen.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reopen}
            className="text-xs font-medium text-sage-dark min-h-11 px-1 touch-manipulation shrink-0"
          >
            Heropen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line/70 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Moon className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
        <h2 className="font-display text-lg text-ink">Dag afronden</h2>
      </div>
      <p className="text-sm text-ink-soft mb-3">
        Korte check of alles klopt — geen extra vragenlijst.
      </p>
      <ul className="flex flex-col gap-2 mb-3">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-sage-dark shrink-0" strokeWidth={1.75} />
            ) : (
              <Circle className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
            )}
            <span className={cn(item.done ? "text-ink" : "text-ink-soft")}>{item.label}</span>
            {item.key === "checkin" && !item.done && (
              <a href="#checkin-vandaag" className="ml-auto text-xs font-medium text-sage-dark touch-manipulation">
                Naar check-in
              </a>
            )}
            {item.key === "sleep" && !item.done && (
              <a href="#slaap-vandaag" className="ml-auto text-xs font-medium text-sage-dark touch-manipulation">
                Naar slaap
              </a>
            )}
            {item.key === "movement" && !item.done && (
              <span className="ml-auto text-xs text-ink-soft">Boven bij Beweging</span>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={markClosed}
        className="w-full inline-flex items-center justify-center min-h-11 rounded-xl border border-line/70 bg-cream-soft/60 text-sm font-medium text-sage-dark touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
      >
        Markeer als afgerond
      </button>
    </div>
  )
}
