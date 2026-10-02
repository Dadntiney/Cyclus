"use client"

import { useState } from "react"
import Link from "next/link"
import { addDays, format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { ChevronRight, Droplet } from "lucide-react"
import { MenstruationDateSheet } from "@/components/cycle/menstruation-date-sheet"
import { todayISO } from "@/lib/dates/amsterdam"
import type { CyclePhase } from "@/lib/cycle/estimate"
import {
  softMenstruationNote,
  type MenstruationSoftHint,
} from "@/lib/cycle/presented-estimate"
import { cn } from "@/lib/utils"
import { RhythmBand } from "@/components/cycle/rhythm-band"

const PHASE_TONE: Record<CyclePhase, { bg: string; text: string }> = {
  menstruatie: {
    bg: "bg-phase-menstruatie-soft",
    text: "text-phase-menstruatie-text",
  },
  folliculair: {
    bg: "bg-phase-folliculair-soft",
    text: "text-phase-folliculair-text",
  },
  ovulatie: {
    bg: "bg-phase-ovulatie-soft",
    text: "text-phase-ovulatie-text",
  },
  luteaal: {
    bg: "bg-phase-luteaal-soft",
    text: "text-phase-luteaal-text",
  },
}

/**
 * One phase surface on Vandaag: day + label + short line, with menstruatie
 * start/stop folded in — never a second duplicate card.
 *
 * Soft states (predicted / just stopped): no big cycle-day digit — that
 * number only means something while Bezig.
 */
export function PhaseContextCard({
  phase,
  phaseLabel,
  cycleDay,
  subtitle,
  hasCycle,
  isMenstruationActive,
  menstruationDay,
  predictedMenstruation = false,
  menstruationSoftHint = null,
  cycleLength = null,
  periodLength = null,
  nextPeriodStart = null,
}: {
  phase: CyclePhase
  phaseLabel: string
  cycleDay: number
  subtitle: string
  hasCycle: boolean
  isMenstruationActive: boolean
  menstruationDay: number | null
  predictedMenstruation?: boolean
  menstruationSoftHint?: MenstruationSoftHint
  /** Her average cycle length — draws the Ritmeband when known. */
  cycleLength?: number | null
  periodLength?: number | null
  /** Estimated next period start (ISO), shown instead of a bare status. */
  nextPeriodStart?: string | null
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const tone = PHASE_TONE[phase]
  const softHint =
    menstruationSoftHint ??
    (predictedMenstruation && !isMenstruationActive ? "predicted" : null)
  const softMode = Boolean(softHint) && !isMenstruationActive

  const title = softHint === "predicted"
    ? `${phaseLabel} · kan komen`
    : softHint === "ended"
      ? phaseLabel
      : isMenstruationActive && menstruationDay
        ? `${phaseLabel} · dag ${menstruationDay}`
        : phaseLabel

  const line = softMode ? (softMenstruationNote(softHint) ?? subtitle) : subtitle

  const statusLabel = isMenstruationActive
    ? "Bezig"
    : softHint === "ended"
      ? "Gestopt"
      : softHint === "predicted"
        ? "Nog niet gestart"
        : nextPeriodStart
          ? `Volgende rond ${format(parseISO(nextPeriodStart), "d MMM", { locale: nl })}`
          : "Nu niet ongesteld"

  // A period that runs well past her usual length most likely ended and
  // "Stoppen" was simply forgotten — ask gently instead of counting on.
  const usualLength = periodLength ?? 5
  const probablyForgotten =
    isMenstruationActive && menstruationDay != null && menstruationDay > usualLength + 2
  const periodStart =
    isMenstruationActive && menstruationDay
      ? format(addDays(parseISO(todayISO()), -(menstruationDay - 1)), "yyyy-MM-dd")
      : null

  const shownDay = isMenstruationActive && menstruationDay ? menstruationDay : cycleDay

  return (
    <div className={cn("rounded-[1.75rem] overflow-hidden", tone.bg)}>
      <Link
        href="/cyclus/vandaag"
        className="block px-5 pt-5 pb-4 touch-manipulation motion-safe:active:scale-[0.99] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/50 rounded-t-[1.75rem]"
      >
        <span className="flex items-start gap-4">
          {!softMode && (
            <span
              className={cn(
                "font-display text-[2.75rem] leading-[0.9] tabular-nums shrink-0",
                tone.text,
              )}
            >
              {shownDay}
            </span>
          )}
          <span className="min-w-0 flex-1 pt-0.5">
            <span className={cn("block text-base font-semibold", tone.text)}>{title}</span>
            {line && (
              <span className="block text-sm text-ink-soft mt-1 leading-relaxed">{line}</span>
            )}
          </span>
          <ChevronRight
            className={cn("h-5 w-5 shrink-0 mt-0.5 opacity-70", tone.text)}
            strokeWidth={2}
            aria-hidden
          />
        </span>
        {cycleLength ? (
          <RhythmBand
            className="mt-4"
            cycleLength={cycleLength}
            periodLength={periodLength}
            cycleDay={softMode ? null : shownDay}
            phase={phase}
          />
        ) : null}
        <span className="sr-only">Open uitleg over deze fase</span>
      </Link>

      {hasCycle && (
        <div className="border-t border-ink/10 px-5 py-1 flex items-center justify-between gap-3 overflow-visible">
          <span
            className={cn(
              "text-xs inline-flex items-center gap-2 min-h-11 overflow-visible",
              isMenstruationActive ? "text-danger font-medium" : "text-ink-soft",
            )}
          >
            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-visible">
              <Droplet
                className={cn(
                  "h-4 w-4 overflow-visible",
                  isMenstruationActive
                    ? "text-danger animate-menstruatie-adem"
                    : "text-ink-soft",
                )}
                fill={isMenstruationActive ? "currentColor" : "none"}
                strokeWidth={1.75}
                aria-hidden
              />
            </span>
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="text-sm font-semibold text-sage-dark min-h-11 px-1 touch-manipulation shrink-0 underline-offset-4 hover:underline"
          >
            {isMenstruationActive ? "Stoppen" : "Ongesteld? Noteer het"}
          </button>
        </div>
      )}
      {hasCycle && probablyForgotten && (
        <p className="text-sm text-ink-soft px-5 pb-4 -mt-1">
          Je menstruatie duurt langer dan meestal. Is hij al gestopt? Tik op{" "}
          <span className="font-medium text-ink">Stoppen</span> en kies je laatste dag.
        </p>
      )}
      {hasCycle && (
        <MenstruationDateSheet
          mode={isMenstruationActive ? "stop" : "start"}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          periodStart={periodStart}
        />
      )}
    </div>
  )
}
