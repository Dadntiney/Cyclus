"use client"

import { useState } from "react"
import Link from "next/link"
import { Moon } from "lucide-react"
import { SleepEntrySheet } from "@/components/sleep/sleep-entry-sheet"
import { computeSleepDurationMinutes, formatSleepDuration } from "@/lib/sleep/duration"
import { WAKE_FEELING_OPTIONS } from "@/lib/constants"
import type { Tables } from "@/types/database"

type SleepEntry = Tables<"sleep_entries">

const WAKE_FEELING_BY_VALUE = new Map<string, (typeof WAKE_FEELING_OPTIONS)[number]>(
  WAKE_FEELING_OPTIONS.map((o) => [o.value, o]),
)

export function SleepCard({
  date,
  entry,
  observation = null,
  historyHref = null,
}: {
  date: string
  entry: SleepEntry | null
  observation?: string | null
  historyHref?: string | null
}) {
  const [open, setOpen] = useState(false)
  const durationMinutes =
    entry?.bedtime && entry?.wake_time
      ? computeSleepDurationMinutes(entry.bedtime, entry.wake_time)
      : null
  const hasDuration = durationMinutes != null

  return (
    <>
      <div className="rounded-3xl bg-sage-soft/55 overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-left px-4 py-3.5 touch-manipulation transition-colors duration-150 motion-safe:active:bg-sage-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-inset"
        >
          <div className="flex items-center gap-3">
            <span
              className="shrink-0 h-10 w-10 rounded-full bg-surface/70 flex items-center justify-center"
              aria-hidden
            >
              <Moon className="h-4.5 w-4.5 text-sage-dark" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              {hasDuration ? (
                <>
                  <p className="font-medium text-ink text-sm">{formatSleepDuration(durationMinutes)} geslapen</p>
                  {entry?.wake_feeling && WAKE_FEELING_BY_VALUE.has(entry.wake_feeling) && (
                    <p className="text-xs text-ink-soft mt-0.5 inline-flex items-center gap-1">
                      {(() => {
                        const FeelingIcon = WAKE_FEELING_BY_VALUE.get(entry.wake_feeling)!.icon
                        return <FeelingIcon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                      })()}
                      {WAKE_FEELING_BY_VALUE.get(entry.wake_feeling)!.label}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-medium text-ink text-sm">Hoe heb je geslapen?</p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {entry?.bedtime || entry?.wake_time
                      ? "Vul bedtijd én opsta-tijd in voor je slaapduur"
                      : "Tik om je nacht in te vullen"}
                  </p>
                </>
              )}
            </div>
          </div>
        </button>
        {(observation || historyHref) && (
          <div className="border-t border-sage/15 px-4 py-3 flex flex-col gap-0.5">
            {observation && <p className="text-xs text-ink-soft leading-relaxed">{observation}</p>}
            {historyHref && (
              <Link
                href={historyHref}
                className="text-xs font-medium text-sage-dark inline-flex items-center min-h-11 touch-manipulation w-fit"
              >
                Slaapgeschiedenis
              </Link>
            )}
          </div>
        )}
      </div>
      <SleepEntrySheet open={open} onClose={() => setOpen(false)} date={date} initial={entry} />
    </>
  )
}
