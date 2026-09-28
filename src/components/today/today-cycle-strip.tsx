"use client"

import Link from "next/link"
import { ChevronRight, Droplet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { startMenstruationPeriod, stopMenstruationPeriod } from "@/lib/actions/cycle"
import type { CyclePhase } from "@/lib/cycle/estimate"

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

const PHASE_TAGLINE: Record<CyclePhase, string> = {
  menstruatie: "Een moment om het rustiger aan te doen.",
  folliculair: "Je energie bouwt zich vaak op in deze fase.",
  ovulatie: "Voor veel vrouwen een piek in energie.",
  luteaal: "Je lichaam bouwt rustig toe naar rust.",
}

/**
 * ONE cycle status for Vandaag — never phase card + menstruatie banner.
 * Active period becomes the strip; otherwise phase + quiet start action.
 */
export function TodayCycleStrip({
  hasCycle,
  isMenstruationActive,
  menstruationDay,
  phase,
  phaseLabel,
  cycleDay,
}: {
  hasCycle: boolean
  isMenstruationActive: boolean
  menstruationDay: number | null
  phase: CyclePhase | null
  phaseLabel: string | null
  cycleDay: number | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!hasCycle) return null

  function togglePeriod() {
    setError(null)
    startTransition(async () => {
      const result = isMenstruationActive
        ? await stopMenstruationPeriod()
        : await startMenstruationPeriod()
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  // Active menstruation = the cycle context itself.
  if (isMenstruationActive) {
    return (
      <div className="mt-3">
        <div className="flex items-center gap-3 rounded-2xl bg-phase-menstruatie-soft px-3.5 py-2.5">
          <Link
            href="/cyclus/vandaag"
            className="min-w-0 flex-1 flex items-center gap-2.5 touch-manipulation"
          >
            <Droplet
              className="h-4 w-4 text-danger shrink-0"
              fill="currentColor"
              strokeWidth={1.75}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">
                Menstruatie · dag {menstruationDay ?? "—"}
              </span>
              <span className="block text-xs text-ink-soft mt-0.5">
                Tik voor uitleg over deze fase
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-soft shrink-0 opacity-70" strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={togglePeriod}
            disabled={isPending}
            className="shrink-0 text-sm font-medium text-sage-dark min-h-11 px-1 touch-manipulation"
          >
            {isPending ? "Bezig…" : "Stoppen"}
          </button>
        </div>
        {error && <p className="text-xs text-danger mt-1 px-1">{error}</p>}
      </div>
    )
  }

  // Estimated phase + quiet start.
  if (phase && phaseLabel && cycleDay != null) {
    const tone = PHASE_TONE[phase]
    return (
      <div className="mt-3">
        <Link
          href="/cyclus/vandaag"
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 touch-manipulation motion-safe:active:scale-[0.99] transition-transform",
            tone.bg,
          )}
        >
          <span className={cn("font-display text-xl leading-none tabular-nums shrink-0", tone.text)}>
            {cycleDay}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block text-sm font-medium", tone.text)}>{phaseLabel}</span>
            <span className="block text-xs text-ink-soft mt-0.5">{PHASE_TAGLINE[phase]}</span>
          </span>
          <ChevronRight className={cn("h-4 w-4 shrink-0 opacity-70", tone.text)} strokeWidth={2} />
        </Link>
        <button
          type="button"
          onClick={togglePeriod}
          disabled={isPending}
          className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark min-h-11 touch-manipulation"
        >
          <Droplet className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          {isPending ? "Bezig…" : "Menstruatie starten"}
        </button>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>
    )
  }

  // Has cycle but no estimate yet.
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={togglePeriod}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark min-h-11 touch-manipulation"
      >
        <Droplet className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
        {isPending ? "Bezig…" : "Menstruatie starten"}
      </button>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}
