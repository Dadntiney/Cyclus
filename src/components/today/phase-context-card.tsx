"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Droplet } from "lucide-react"
import { startMenstruationPeriod, stopMenstruationPeriod } from "@/lib/actions/cycle"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { cn } from "@/lib/utils"

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
 */
export function PhaseContextCard({
  phase,
  phaseLabel,
  cycleDay,
  subtitle,
  hasCycle,
  isMenstruationActive,
  menstruationDay,
}: {
  phase: CyclePhase
  phaseLabel: string
  cycleDay: number
  subtitle: string
  hasCycle: boolean
  isMenstruationActive: boolean
  menstruationDay: number | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const tone = PHASE_TONE[phase]

  function handleMenstruation() {
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

  return (
    <div className={cn("rounded-2xl overflow-hidden", tone.bg)}>
      <Link
        href="/cyclus/vandaag"
        className="flex items-center gap-3 px-3.5 py-2.5 touch-manipulation motion-safe:active:scale-[0.99] transition-transform"
      >
        <span
          className={cn(
            "font-display text-xl leading-none tabular-nums shrink-0",
            tone.text,
          )}
        >
          {cycleDay}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-sm font-medium", tone.text)}>
            {isMenstruationActive && menstruationDay
              ? `${phaseLabel} · dag ${menstruationDay}`
              : phaseLabel}
          </span>
          <span className="block text-xs text-ink-soft mt-0.5 leading-relaxed">
            {subtitle}
          </span>
        </span>
        <ChevronRight
          className={cn("h-4 w-4 shrink-0 opacity-70", tone.text)}
          strokeWidth={2}
          aria-hidden
        />
        <span className="sr-only">Open uitleg over deze fase</span>
      </Link>

      {hasCycle && (
        <div className="border-t border-black/5 px-3.5 py-1 flex items-center justify-between gap-3 overflow-visible">
          <span
            className={cn(
              "text-xs inline-flex items-center gap-2 min-h-11 overflow-visible",
              isMenstruationActive ? "text-danger font-medium" : "text-ink-soft",
            )}
          >
            {/* Freestanding droplet — room to breathe, no glow halo behind */}
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
            {isMenstruationActive ? "Bezig" : "Nog niet gestart"}
          </span>
          <button
            type="button"
            onClick={handleMenstruation}
            disabled={isPending}
            className="text-sm font-medium text-sage-dark min-h-11 px-1 touch-manipulation shrink-0"
          >
            {isPending
              ? "Bezig…"
              : isMenstruationActive
                ? "Stoppen"
                : "Menstruatie starten"}
          </button>
        </div>
      )}
      {error && <p className="text-xs text-danger px-3.5 pb-2">{error}</p>}
    </div>
  )
}
