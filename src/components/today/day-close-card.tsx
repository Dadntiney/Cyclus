"use client"

import { ACCOUNT_STATE_APPLIED_EVENT, syncToAccount } from "@/lib/client/account-sync"
import { useEffect, useId, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { CheckCircle2, ChevronDown, Circle, NotebookPen } from "lucide-react"
import { cn } from "@/lib/utils"
import { getEveningAffirmation } from "@/lib/data/day-close-notes"
import { createDiaryEntry } from "@/lib/actions/diary"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { Button, textActionClass } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Collapse } from "@/components/ui/disclosure"
import { Label, Textarea } from "@/components/ui/input"
import { JumpLink } from "@/components/ui/jump-link"
import { FEATURES } from "@/lib/navigation/features"
import { triggerHaptic } from "@/lib/platform"
import { ICON, iconProps } from "@/lib/ui/icon"
import {
  loadWeekOverrides,
  WEEK_OVERRIDES_CHANGED_EVENT,
} from "@/lib/client/week-plan-storage"

const AVONDMEDITATIE_HREF = "/mentale-rust/avondroutine-voor-diepe-ontspanning"
const DANKBAARHEID_HREF = "/mentale-rust/dankbaarheidsmoment"

/**
 * "Even afronden" — the evening wrap-up, folded by default (it never opens
 * by itself). Open: what is still open as in-page links (JumpLink: no
 * history entry, so "back" keeps working), one prompt "Wat
 * neem je mee van vandaag?", a row of plain text links and "Dag laten
 * rusten". The affirmation (with a heart to save it) appears once the day
 * rests. Icon: NotebookPen (besluit 22); a heart only ever means "bewaren".
 */
export function DayCloseCard({
  userId,
  date,
  weekStartISO,
  hasCheckin,
  movementEnabled,
  movementDone,
  restDay = false,
  sleepTrackingEnabled,
  hasSleepEntry,
  mentalWellbeingEnabled = false,
  savedTexts = [],
}: {
  userId: string
  date: string
  weekStartISO: string
  hasCheckin: boolean
  movementEnabled: boolean
  movementDone: boolean
  /** A planned rest day: nothing to "do", so no "Beweging nog open" row. */
  restDay?: boolean
  sleepTrackingEnabled: boolean
  hasSleepEntry: boolean
  mentalWellbeingEnabled?: boolean
  savedTexts?: string[]
}) {
  const [closed, setClosed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [movementHandled, setMovementHandled] = useState(movementDone)
  const [gratitude, setGratitude] = useState("")
  const [gratitudeSaved, setGratitudeSaved] = useState(false)
  const [gratitudeError, setGratitudeError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const contentId = useId()
  const promptId = useId()
  const errorId = useId()

  // Per user, so a shared device never shows someone else's evening; the
  // closed flag is also mirrored to the account (account-sync.ts).
  const storageKey = `cyclus:day-closed:${userId}:${date}`
  const gratitudeKey = `cyclus:day-gratitude:${userId}:${date}`
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
    }
    syncFromClient()
    window.addEventListener(WEEK_OVERRIDES_CHANGED_EVENT, syncFromClient)
    window.addEventListener(ACCOUNT_STATE_APPLIED_EVENT, syncFromClient)
    window.addEventListener("focus", syncFromClient)
    return () => {
      window.removeEventListener(WEEK_OVERRIDES_CHANGED_EVENT, syncFromClient)
      window.removeEventListener(ACCOUNT_STATE_APPLIED_EVENT, syncFromClient)
      window.removeEventListener("focus", syncFromClient)
    }
  }, [storageKey, gratitudeKey, userId, weekStartISO, date, movementDone])

  function persistClosed() {
    try {
      localStorage.setItem(storageKey, "1")
    } catch {
      /* ignore */
    }
    syncToAccount(storageKey, "1")
    setClosed(true)
    void triggerHaptic("light")
    // The button she tapped is gone now; keep focus on the card.
    toggleRef.current?.focus()
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
        body: `Van vandaag meegenomen: ${text}`,
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
    syncToAccount(storageKey, null)
    setClosed(false)
    setExpanded(true)
    toggleRef.current?.focus()
  }

  const items = [
    {
      key: "checkin",
      done: hasCheckin,
      label: hasCheckin ? "Even bij jezelf geweest" : "Check-in nog open",
      target: "checkin",
    },
    ...(movementEnabled && (movementHandled || !restDay)
      ? [
          {
            key: "movement",
            done: movementHandled,
            label: movementHandled ? "Beweging genoteerd" : "Beweging nog open",
            target: "beweging",
          },
        ]
      : []),
    ...(sleepTrackingEnabled
      ? [
          {
            key: "sleep",
            done: hasSleepEntry,
            label: hasSleepEntry ? "Slaap genoteerd" : "Slaap nog invullen",
            target: "slaap-vandaag",
          },
        ]
      : []),
  ]

  const savedLine = gratitudeSaved ? gratitude.trim() : ""

  return (
    <Card as="section" padding="none" aria-labelledby={`${contentId}-titel`}>
      <h2>
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className={cn(
            "flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left touch-manipulation -outline-offset-2",
            "transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft",
            expanded ? "rounded-t-card" : "rounded-card",
          )}
        >
          <span
            aria-hidden
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
          >
            <NotebookPen {...ICON.sm} />
          </span>
          <span className="min-w-0 flex-1">
            <span id={`${contentId}-titel`} className="block text-base font-medium text-ink">
              Even afronden
            </span>
            <span className="block text-sm text-ink-soft">
              {closed ? "Dag mag rusten" : "Kort terugkijken, als je wilt"}
            </span>
          </span>
          <ChevronDown
            {...iconProps(
              "sm",
              cn(
                "text-ink-soft transition-transform duration-base ease-standard motion-reduce:transition-none",
                expanded && "rotate-180",
              ),
            )}
            aria-hidden
          />
        </button>
      </h2>

      <Collapse open={expanded} id={contentId}>
        {closed ? (
          <div className="flex flex-col gap-3 px-4 pb-4 pt-1">
            {savedLine && <p className="text-sm text-ink-soft">Meegenomen: {savedLine}</p>}
            <div className="flex items-start gap-1">
              <p className="min-w-0 flex-1 font-display text-base leading-snug text-ink">
                &ldquo;{affirmation}&rdquo;
              </p>
              <span className="-my-2 shrink-0">
                <MomentFavoriteButton
                  kind="affirmation"
                  text={affirmation}
                  source="day-close-affirmation"
                  initialFavorited={savedTexts.includes(affirmation)}
                  size="sm"
                />
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5">
              {mentalWellbeingEnabled && (
                <Link href={AVONDMEDITATIE_HREF} className={textActionClass()}>
                  Avondmeditatie
                </Link>
              )}
              <button type="button" onClick={reopen} className={textActionClass()}>
                Heropen
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
            <ul className="flex flex-col">
              {items.map((item) =>
                item.done ? (
                  <li key={item.key} className="flex min-h-11 items-center gap-2 text-sm text-ink">
                    <CheckCircle2 {...iconProps("sm", "text-sage-dark")} aria-hidden />
                    {item.label}
                  </li>
                ) : (
                  <li key={item.key}>
                    <JumpLink targetId={item.target} className={textActionClass("gap-2")}>
                      <Circle {...iconProps("sm", "text-ink-soft")} aria-hidden />
                      {item.label}
                    </JumpLink>
                  </li>
                ),
              )}
            </ul>

            <div>
              <Label htmlFor={gratitudeSaved ? undefined : promptId}>Wat neem je mee van vandaag?</Label>
              {gratitudeSaved ? (
                <p className="text-sm text-ink">{gratitude.trim()}</p>
              ) : (
                <>
                  <Textarea
                    id={promptId}
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                    rows={2}
                    maxLength={280}
                    placeholder="Iets kleins mag ook: een moment, een inzicht, een gevoel…"
                    aria-invalid={gratitudeError ? true : undefined}
                    aria-describedby={gratitudeError ? errorId : undefined}
                  />
                  {gratitude.trim() && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => saveGratitudeThen()}
                      className={textActionClass("-ml-1 px-1")}
                    >
                      {isPending ? "Bewaren…" : "Bewaar in dagboek"}
                    </button>
                  )}
                  {gratitudeError && (
                    <p id={errorId} role="alert" className="mt-1 text-sm text-danger">
                      {gratitudeError}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5">
              <Link href={FEATURES.dagboek.href} className={textActionClass()}>
                {FEATURES.dagboek.label}
              </Link>
              {mentalWellbeingEnabled && (
                <>
                  <Link href={DANKBAARHEID_HREF} className={textActionClass()}>
                    Dankbaarheid · 2 min
                  </Link>
                  <Link href={AVONDMEDITATIE_HREF} className={textActionClass()}>
                    Avondmeditatie
                  </Link>
                </>
              )}
            </div>

            <Button className="w-full" onClick={markClosed} disabled={isPending}>
              {isPending ? "Even bewaren…" : "Dag laten rusten"}
            </Button>
          </div>
        )}
      </Collapse>
    </Card>
  )
}
