"use client"

import { useState } from "react"
import { parseIngredientLine } from "@/lib/nutrition/ingredient-parse"
import { lookupIngredientInfo } from "@/lib/nutrition/ingredient-info"
import { BottomSheet } from "@/components/ui/bottom-sheet"

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

      <BottomSheet
        open={Boolean(open?.info)}
        onClose={() => setOpenIndex(null)}
        title={open?.info ? `${open.info.emoji} ${open.info.label}` : undefined}
      >
        {open?.info && (
          <>
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
          </>
        )}
      </BottomSheet>
    </>
  )
}
