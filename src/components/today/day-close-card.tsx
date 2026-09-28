"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Moon, CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { loadWeekOverrides } from "@/lib/client/week-plan-storage"

/**
 * Compact evening wrap-up — not a second questionnaire. Surfaces what’s still
 * open and lets her mark the day as “afgerond” locally. Visible from 18:00.
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
  const [ready, setReady] = useState(false)
  const [closed, setClosed] = useState(false)
  const [movementHandled, setMovementHandled] = useState(movementDone)
  const storageKey = `cyclus:day-closed:${date}`

  useEffect(() => {
    // Hour + localStorage only on client to avoid SSR mismatch.
    const evening = new Date().getHours() >= 18
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setClosed(localStorage.getItem(storageKey) === "1")
      const override = loadWeekOverrides(userId, weekStartISO)[`${date}:workout`]
      setMovementHandled(movementDone || override?.type === "skip-workout")
    } catch {
      setClosed(false)
      setMovementHandled(movementDone)
    }
    setReady(evening)
  }, [storageKey, userId, weekStartISO, date, movementDone])

  if (!ready) return null

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
      done: hasCheckin,
      label: hasCheckin ? "Check-in ingevuld" : "Check-in nog open",
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

  if (closed) {
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
            {item.key === "sleep" && !item.done && (
              <Link href="/slaap" className="ml-auto text-xs font-medium text-sage-dark touch-manipulation">
                Naar slaap
              </Link>
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
        className="text-sm font-medium text-sage-dark min-h-11 touch-manipulation"
      >
        Markeer als afgerond
      </button>
    </div>
  )
}
