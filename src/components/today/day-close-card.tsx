"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { Moon, CheckCircle2, Circle, Heart, Sparkles, NotebookPen } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDayCloseLine, getEveningAffirmation } from "@/lib/data/day-close-notes"
import { createDiaryEntry } from "@/lib/actions/diary"
import {
  loadWeekOverrides,
  WEEK_OVERRIDES_CHANGED_EVENT,
} from "@/lib/client/week-plan-storage"

/**
 * Evening wrap-up on Vandaag: a short consciousness moment, not a second
 * questionnaire. Checklist for what was noted, optional gratitude (saved to
 * dagboek), a soft affirmation, and optional links to sleep meditation /
 * diary — then she can mark the day closed without guilt.
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
  mentalWellbeingEnabled = false,
}: {
  userId: string
  date: string
  weekStartISO: string
  hasCheckin: boolean
  movementEnabled: boolean
  movementDone: boolean
  sleepTrackingEnabled: boolean
  hasSleepEntry: boolean
  mentalWellbeingEnabled?: boolean
}) {
  const [closed, setClosed] = useState(false)
  const [movementHandled, setMovementHandled] = useState(movementDone)
  const [hydrated, setHydrated] = useState(false)
  const [gratitude, setGratitude] = useState("")
  const [gratitudeSaved, setGratitudeSaved] = useState(false)
  const [gratitudeError, setGratitudeError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const storageKey = `cyclus:day-closed:${date}`
  const gratitudeKey = `cyclus:day-gratitude:${date}`
  const closeLine = getDayCloseLine(date)
  const affirmation = getEveningAffirmation(date)

  useEffect(() => {
    function syncFromClient() {
      try {
        setClosed(localStorage.getItem(storageKey) === "1")
        const savedGratitude = localStorage.getItem(gratitudeKey)
        if (savedGratitude) {
          setGratitude(savedGratitude)
          setGratitudeSaved(true)
        }
        const override = loadWeekOverrides(userId, weekStartISO)[`${date}:workout`]
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
    syncFromClient()
    window.addEventListener(WEEK_OVERRIDES_CHANGED_EVENT, syncFromClient)
    window.addEventListener("focus", syncFromClient)
    return () => {
      window.removeEventListener(WEEK_OVERRIDES_CHANGED_EVENT, syncFromClient)
      window.removeEventListener("focus", syncFromClient)
    }
  }, [storageKey, gratitudeKey, userId, weekStartISO, date, movementDone])

  function persistClosed() {
    try {
      localStorage.setItem(storageKey, "1")
    } catch {
      /* ignore */
    }
    setClosed(true)
  }

  function saveGratitudeThen(onDone?: () => void) {
    const text = gratitude.trim()
    if (!text || gratitudeSaved) {
      onDone?.()
      return
    }
    setGratitudeError(null)
    startTransition(async () => {
      const result = await createDiaryEntry({
        date,
        body: `Dankbaar vandaag: ${text}`,
      })
      if (result?.error) {
        setGratitudeError(result.error)
        return
      }
      try {
        localStorage.setItem(gratitudeKey, text)
      } catch {
        /* ignore */
      }
      setGratitudeSaved(true)
      onDone?.()
    })
  }

  function markClosed() {
    saveGratitudeThen(persistClosed)
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
    },
    ...(movementEnabled
      ? [
          {
            key: "movement",
            done: movementHandled,
            label: movementHandled ? "Beweging genoteerd" : "Beweging nog open",
          },
        ]
      : []),
    ...(sleepTrackingEnabled
      ? [
          {
            key: "sleep",
            done: hasSleepEntry,
            label: hasSleepEntry ? "Slaap ingevuld" : "Slaap nog invullen",
          },
        ]
      : []),
  ]

  if (hydrated && closed) {
    return (
      <div className="rounded-3xl bg-sage-soft/55 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-sage-dark shrink-0" strokeWidth={1.75} />
              <p className="text-sm font-medium text-ink">Dag afgesloten</p>
            </div>
            {gratitudeSaved && gratitude.trim() && (
              <p className="text-sm text-ink/80 pl-6 mb-2 leading-relaxed">
                Dankbaar voor: {gratitude.trim()}
              </p>
            )}
            <p className="font-display text-[1.05rem] leading-snug text-ink/90 pl-6">
              {closeLine}
            </p>
            {mentalWellbeingEnabled && (
              <Link
                href="/mentale-rust/avondroutine-voor-diepe-ontspanning"
                className="mt-3 ml-6 inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark min-h-11 touch-manipulation"
              >
                <Moon className="h-3.5 w-3.5" strokeWidth={1.75} />
                Avondmeditatie
              </Link>
            )}
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
    <div className="rounded-3xl bg-sage-soft/55 px-4 py-4">
      <div className="flex items-center gap-2 mb-1">
        <Moon className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
        <h2 className="font-display text-lg text-ink">Dag afsluiten</h2>
      </div>
      <p className="text-sm text-ink-soft mb-3">
        Even terugkijken op vandaag — kort, bewust, zonder oordeel.
      </p>

      <ul className="flex flex-col gap-2 mb-4">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 text-sage-dark shrink-0" strokeWidth={1.75} />
            ) : (
              <Circle className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
            )}
            <span className={cn(item.done ? "text-ink" : "text-ink-soft")}>{item.label}</span>
            {item.key === "sleep" && !item.done && (
              <a
                href="#slaap-vandaag"
                className="ml-auto inline-flex items-center min-h-11 text-xs font-medium text-sage-dark touch-manipulation"
              >
                Naar slaap
              </a>
            )}
            {item.key === "movement" && !item.done && (
              <span className="ml-auto text-xs text-ink-soft">Boven bij Beweging</span>
            )}
          </li>
        ))}
      </ul>

      <div className="rounded-2xl bg-surface/65 px-3.5 py-3.5 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-3.5 w-3.5 text-sage-dark shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-medium text-ink">Waar ben je vandaag dankbaar voor?</p>
        </div>
        {gratitudeSaved ? (
          <p className="text-sm text-ink leading-relaxed">{gratitude.trim()}</p>
        ) : (
          <>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              rows={2}
              maxLength={280}
              placeholder="Iets kleins mag ook — een moment, een persoon, een gevoel…"
              aria-label="Dankbaarheid vandaag"
              className="w-full rounded-xl border border-line/60 bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/80 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40 min-h-[2.75rem]"
            />
            {gratitude.trim() && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => saveGratitudeThen()}
                className="mt-2 text-xs font-medium text-sage-dark min-h-11 px-1 touch-manipulation"
              >
                {isPending ? "Bewaren…" : "Bewaar in dagboek"}
              </button>
            )}
            {gratitudeError && <p className="text-xs text-danger mt-1">{gratitudeError}</p>}
          </>
        )}
      </div>

      <div className="rounded-2xl bg-surface/65 px-3.5 py-3.5 mb-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-sage-dark shrink-0" strokeWidth={1.75} />
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide">Voor vanavond</p>
        </div>
        <p className="font-display text-[1.05rem] leading-snug text-ink">
          &ldquo;{affirmation}&rdquo;
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {mentalWellbeingEnabled && (
          <>
            <Link
              href="/mentale-rust/dankbaarheidsmoment"
              className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-2 text-xs font-medium text-ink touch-manipulation min-h-11"
            >
              <Heart className="h-3.5 w-3.5 text-sage-dark" strokeWidth={1.75} />
              Dankbaarheid · 2 min
            </Link>
            <Link
              href="/mentale-rust/avondroutine-voor-diepe-ontspanning"
              className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-2 text-xs font-medium text-ink touch-manipulation min-h-11"
            >
              <Moon className="h-3.5 w-3.5 text-sage-dark" strokeWidth={1.75} />
              Avondmeditatie
            </Link>
          </>
        )}
        <Link
          href="/dagboek"
          className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-2 text-xs font-medium text-ink touch-manipulation min-h-11"
        >
          <NotebookPen className="h-3.5 w-3.5 text-sage-dark" strokeWidth={1.75} />
          Dagboek
        </Link>
      </div>

      <button
        type="button"
        onClick={markClosed}
        disabled={isPending}
        className="w-full inline-flex items-center justify-center min-h-11 rounded-xl bg-sage-fill text-sm font-medium text-white touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 motion-safe:active:scale-[0.99] transition-transform disabled:opacity-70"
      >
        {isPending ? "Even bewaren…" : "Markeer dag als afgesloten"}
      </button>
    </div>
  )
}
