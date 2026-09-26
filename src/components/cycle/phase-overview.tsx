"use client"

import { useState } from "react"
import { PHASE_CONTENT, PHASE_ORDER } from "@/lib/cycle/phase-content"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { cn } from "@/lib/utils"

/**
 * "Menstruatie → Folliculair → Ovulatie → Luteaal" strip for the Cyclus
 * (month/cycle) overview: tap a phase to preview its nutrition/movement
 * focus, so someone can look ahead without needing to be in that phase yet.
 */
export function PhaseOverview({ currentPhase }: { currentPhase: CyclePhase | null }) {
  const [selected, setSelected] = useState<CyclePhase>(currentPhase ?? "menstruatie")
  const content = PHASE_CONTENT[selected]

  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {PHASE_ORDER.map((phase) => {
          const isCurrent = phase === currentPhase
          const isSelected = phase === selected
          return (
            <button
              key={phase}
              type="button"
              onClick={() => setSelected(phase)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl px-1.5 py-3 touch-manipulation transition-colors",
                isSelected ? PHASE_CONTENT[phase].colors.bg : "bg-white border border-line",
              )}
            >
              <span
                className={cn("h-2.5 w-2.5 rounded-full", PHASE_CONTENT[phase].colors.dot)}
                aria-hidden
              />
              <span
                className={cn(
                  "text-[11px] font-medium text-center leading-tight",
                  isSelected ? PHASE_CONTENT[phase].colors.text : "text-ink-soft",
                )}
              >
                {PHASE_CONTENT[phase].label.replace(" fase", "")}
              </span>
              {isCurrent && (
                <span className="text-[9px] font-semibold text-sage-dark uppercase">Nu</span>
              )}
            </button>
          )
        })}
      </div>

      <div className={cn("rounded-3xl p-5 mt-3", content.colors.bg)}>
        <p className={cn("text-sm font-semibold mb-1", content.colors.text)}>{content.label}</p>
        <p className="text-sm text-ink-soft mb-4">{content.shortDescription}</p>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-ink mb-1">🥗 Voeding — {content.nutrition.focusLabel}</p>
            <p className="text-sm text-ink-soft leading-relaxed">{content.nutrition.focusText}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {content.nutrition.exampleFoods.map((food) => (
                <span
                  key={food}
                  className="text-[11px] font-medium text-ink bg-white/70 rounded-full px-2.5 py-1"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-ink mb-1">🏃 Beweging — {content.movement.intensityLabel}</p>
            <p className="text-sm text-ink-soft leading-relaxed">{content.movement.focusText}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-ink mb-1">💡 Aandachtspunt</p>
            <p className="text-sm text-ink-soft leading-relaxed">{content.lifestyleTips[0]?.text}</p>
          </div>
        </div>

        <p className="text-xs text-ink-soft mt-4 pt-3 border-t border-white/40">{content.whyText}</p>
      </div>
    </div>
  )
}
