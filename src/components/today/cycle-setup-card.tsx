"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { MenstruationQuickAction } from "@/components/cycle/menstruation-quick-action"

/**
 * When she has a cycle but we can't estimate a phase yet (missing last period
 * or cycle length), still give Vandaag a calm cycle surface — not only a quiet
 * text link under a generic greeting.
 */
export function CycleSetupCard() {
  return (
    <div className="rounded-[1.25rem] bg-surface border border-line overflow-hidden">
      <Link
        href="/profiel/cyclus"
        className="flex items-center gap-3 px-3.5 py-2.5 touch-manipulation motion-safe:active:scale-[0.99] transition-transform"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">Jouw cyclus</span>
          <span className="block text-xs text-ink-soft mt-0.5 leading-relaxed">
            Vul je laatste menstruatie in voor een fase-inschatting — of start hieronder
            als je vandaag begint.
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={2} aria-hidden />
      </Link>
      <div className="border-t border-line px-3.5">
        <MenstruationQuickAction isActive={false} day={null} variant="quiet" />
      </div>
    </div>
  )
}
