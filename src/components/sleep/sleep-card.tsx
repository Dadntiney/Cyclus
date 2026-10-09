"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Moon } from "lucide-react"
import { SleepEntrySheet } from "@/components/sleep/sleep-entry-sheet"
import { textActionClass } from "@/components/ui/button"
import { computeSleepDurationMinutes, formatSleepDuration } from "@/lib/sleep/duration"
import { WAKE_FEELING_OPTIONS } from "@/lib/constants"
import { FEATURES } from "@/lib/navigation/features"
import { ICON, iconProps } from "@/lib/ui/icon"
import type { Tables } from "@/types/database"

type SleepEntry = Tables<"sleep_entries">

const WAKE_FEELING_BY_VALUE = new Map<string, (typeof WAKE_FEELING_OPTIONS)[number]>(
  WAKE_FEELING_OPTIONS.map((o) => [o.value, o]),
)

/**
 * Last night on Vandaag: one tap opens the entry sheet; an optional
 * observation and a link to Slaap sit underneath.
 */
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
  const feeling = entry?.wake_feeling ? WAKE_FEELING_BY_VALUE.get(entry.wake_feeling) : undefined

  return (
    <>
      <div className="rounded-card bg-surface border border-line overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="w-full text-left px-4 py-3.5 touch-manipulation -outline-offset-2 transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft"
        >
          <span className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage-dark"
            >
              <Moon {...ICON.sm} />
            </span>
            <span className="min-w-0 flex-1">
              {hasDuration ? (
                <>
                  <span className="block text-base font-medium text-ink">
                    {formatSleepDuration(durationMinutes)} geslapen
                  </span>
                  {feeling && (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-sm text-ink-soft">
                      <feeling.icon {...iconProps("sm", "h-3.5 w-3.5")} aria-hidden />
                      {feeling.label}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="block text-base font-medium text-ink">Hoe heb je geslapen?</span>
                  <span className="block text-sm text-ink-soft mt-0.5">
                    {entry?.bedtime || entry?.wake_time
                      ? "Vul bedtijd én opsta-tijd in voor je slaapduur"
                      : "Tik om je nacht in te vullen"}
                  </span>
                </>
              )}
            </span>
          </span>
        </button>
        {(observation || historyHref) && (
          <div className="border-t border-line px-4 pt-3 pb-1">
            {observation && <p className="text-sm text-ink-soft">{observation}</p>}
            {historyHref && (
              <Link href={historyHref} className={textActionClass()}>
                {FEATURES.slaap.label}
                <ChevronRight {...ICON.sm} aria-hidden />
              </Link>
            )}
          </div>
        )}
      </div>
      <SleepEntrySheet open={open} onClose={() => setOpen(false)} date={date} initial={entry} />
    </>
  )
}
