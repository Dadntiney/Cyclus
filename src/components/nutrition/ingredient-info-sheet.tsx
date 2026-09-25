"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { parseIngredientLine } from "@/lib/nutrition/ingredient-parse"
import { lookupIngredientInfo } from "@/lib/nutrition/ingredient-info"

/**
 * Wraps a list of raw ingredient strings and makes each one tappable: when
 * we have explainer content for it, tapping opens a short bottom sheet with
 * "why this fits" info. Ingredients we don't recognize just render as plain
 * text — no dead-end taps. One sheet is shared for the whole list rather
 * than one per ingredient, so state stays simple.
 */
export function IngredientList({
  ingredients,
  bulletClassName = "text-sage",
}: {
  ingredients: string[]
  bulletClassName?: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const parsed = ingredients.map((raw) => {
    const p = parseIngredientLine(raw)
    return { raw, info: lookupIngredientInfo(p.normalized) }
  })

  const open = openIndex !== null ? parsed[openIndex] : null

  return (
    <>
      <ul className="flex flex-col gap-1.5 text-[15px] text-ink-soft">
        {parsed.map(({ raw, info }, i) => (
          <li key={i} className="flex gap-2">
            <span className={bulletClassName}>•</span>
            {info ? (
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className="text-left underline decoration-dotted decoration-ink-soft/50 underline-offset-2 touch-manipulation hover:decoration-sage-dark"
              >
                {raw}
              </button>
            ) : (
              <span>{raw}</span>
            )}
          </li>
        ))}
      </ul>

      {open?.info && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-ink/40 p-0 sm:p-5"
          onClick={() => setOpenIndex(null)}
        >
          <div
            className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] animate-pop-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="font-display text-xl text-ink">
                <span className="mr-1.5" aria-hidden>
                  {open.info.emoji}
                </span>
                {open.info.label}
              </p>
              <button
                type="button"
                onClick={() => setOpenIndex(null)}
                className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation"
                aria-label="Sluiten"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">{open.info.explanation}</p>
            <p className="text-xs font-medium text-ink mb-2">Voedingsstoffen</p>
            <div className="flex flex-wrap gap-1.5 mb-1">
              {open.info.nutrients.map((n) => (
                <span
                  key={n}
                  className="text-[11px] font-medium text-sage-dark bg-sage-soft rounded-full px-2.5 py-1"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
