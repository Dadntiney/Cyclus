"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { addDays, format, parseISO } from "date-fns"
import { ChevronRight, Droplet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { textActionClass } from "@/components/ui/button"
import { MenstruationDateSheet } from "@/components/cycle/menstruation-date-sheet"
import { RhythmBand } from "@/components/cycle/rhythm-band"
import { todayISO } from "@/lib/dates/amsterdam"
import { formatNextPeriod } from "@/lib/dates/format"
import type { CyclePhase } from "@/lib/cycle/estimate"
import {
  softMenstruationNote,
  type MenstruationSoftHint,
} from "@/lib/cycle/presented-estimate"
import { FEATURES } from "@/lib/navigation/features"
import { ICON, iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

const PHASE_TEXT: Record<CyclePhase, string> = {
  menstruatie: "text-phase-menstruatie-text",
  folliculair: "text-phase-folliculair-text",
  ovulatie: "text-phase-ovulatie-text",
  luteaal: "text-phase-luteaal-text",
}

/**
 * The phase status — the one tinted surface on a screen (Vandaag and
 * Cyclus share it, ontwerpvisie §7.1):
 *
 * 1. day numeral · phase name · "cyclusdag · schatting" · chevron — one
 *    link to Jouw fase;
 * 2. a compact Ritmeband;
 * 3. hairline, then "💧 Volgende ~18 okt" and the one action
 *    "Noteer menstruatie" / "Stoppen" (wraps onto its own line, right
 *    aligned, on narrow screens).
 *
 * Soft states (predicted / just stopped) show no day numeral: that number
 * only means something while her period is running or the cycle is known.
 * No tagline: what the day asks for is said once, under "Voor jou vandaag".
 */
export function PhaseContextCard({
  phase,
  phaseLabel,
  cycleDay,
  hasCycle,
  isMenstruationActive,
  menstruationDay,
  predictedMenstruation = false,
  menstruationSoftHint = null,
  cycleLength = null,
  periodLength = null,
  nextPeriodStart = null,
  roughEstimate = false,
  note = null,
}: {
  phase: CyclePhase
  phaseLabel: string
  cycleDay: number
  /**
   * @deprecated No longer shown: the compact status has no tagline (one
   * voice per day). Still accepted so existing callers keep compiling.
   */
  subtitle?: string
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
  /** Changing cycle (40+, irregular): mark the phase as a rough guess. */
  roughEstimate?: boolean
  /** One short practical line under the band, e.g. "Vul je cyclusgegevens aan…". */
  note?: ReactNode
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const tone = PHASE_TEXT[phase]
  const softHint =
    menstruationSoftHint ??
    (predictedMenstruation && !isMenstruationActive ? "predicted" : null)
  const softMode = Boolean(softHint) && !isMenstruationActive
  const activeDay = isMenstruationActive && menstruationDay ? menstruationDay : null
  const shownDay = activeDay ?? cycleDay

  const caption = softMode
    ? (softMenstruationNote(softHint) ?? "")
    : activeDay
      ? "menstruatiedag"
      : roughEstimate
        ? "cyclusdag · ruwe schatting"
        : "cyclusdag · schatting"

  const statusLabel = isMenstruationActive
    ? "Bezig"
    : softHint === "ended"
      ? "Gestopt"
      : softHint === "predicted"
        ? "Nog niet gestart"
        : nextPeriodStart
          ? `Volgende ${formatNextPeriod(nextPeriodStart)}`
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

  return (
    <Card tone="phase" phase={phase} className={cn(hasCycle && "pb-3")}>
      <h2 className="sr-only">{FEATURES.fase.label}</h2>
      <Link
        href={FEATURES.fase.href}
        className="-m-2 flex items-center gap-4 rounded-inset p-2 touch-manipulation transition-transform duration-fast ease-standard motion-safe:active:scale-[0.985]"
      >
        <span className="sr-only">{FEATURES.fase.linkLabel}: </span>
        {!softMode && <span className={cn("type-numeral shrink-0", tone)}>{shownDay}</span>}
        <span className="min-w-0 flex-1">
          <span className={cn("block text-base font-semibold", tone)}>{phaseLabel}</span>
          {caption && <span className="block text-xs text-ink-soft">{caption}</span>}
        </span>
        <ChevronRight {...iconProps("md", cn("opacity-70", tone))} aria-hidden />
      </Link>

      {cycleLength ? (
        <RhythmBand
          size="sm"
          className="mt-3"
          cycleLength={cycleLength}
          periodLength={periodLength}
          cycleDay={softMode ? null : shownDay}
          phase={phase}
        />
      ) : null}

      {note && <p className="mt-3 text-sm text-ink-soft">{note}</p>}

      {hasCycle && (
        <div className="mt-4 flex flex-wrap items-center gap-x-3 border-t border-ink/10 pt-2">
          <span
            className={cn(
              "inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm",
              isMenstruationActive ? "font-medium text-phase-menstruatie-strong" : "text-ink-soft",
            )}
          >
            <span className={cn("inline-flex", isMenstruationActive && "animate-menstruatie-adem")}>
              <Droplet {...ICON.sm} fill={isMenstruationActive ? "currentColor" : "none"} aria-hidden />
            </span>
            {statusLabel}
          </span>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            aria-label={isMenstruationActive ? "Menstruatie stoppen" : undefined}
            className={textActionClass("ml-auto")}
          >
            {isMenstruationActive ? "Stoppen" : "Noteer menstruatie"}
          </button>
        </div>
      )}
      {hasCycle && probablyForgotten && (
        <p className="mb-2 text-sm text-ink-soft">
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
    </Card>
  )
}
