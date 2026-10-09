"use client"

import { useState } from "react"
import { parseIngredientLine } from "@/lib/nutrition/ingredient-parse"
import { lookupIngredientInfo } from "@/lib/nutrition/ingredient-info"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function infoFor(raw: string) {
  return lookupIngredientInfo(parseIngredientLine(raw).normalized)
}

/** Whether any line has an explainer (then the page shows the "Tik op …" hint). */
export function hasIngredientInfo(ingredients: string[]): boolean {
  return ingredients.some((raw) => infoFor(raw) !== null)
}

/**
 * Wraps a list of raw ingredient strings and makes each one tappable: when
 * we have explainer content for it, tapping opens a short bottom sheet with
 * "why this fits" info. Ingredients we don't recognize just render as plain
 * text — no dead-end taps. One sheet is shared for the whole list rather
 * than one per ingredient, so state stays simple.
 *
 * Every row is at least 44px tall, so a tappable line is easy to hit and
 * the list keeps one rhythm whether a line is tappable or not.
 */
export function IngredientList({
  ingredients,
  bulletClassName = "text-sage",
  className,
}: {
  ingredients: string[]
  bulletClassName?: string
  className?: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const parsed = ingredients.map((raw) => ({ raw, info: infoFor(raw) }))
  const open = openIndex !== null ? parsed[openIndex] : null

  return (
    <>
      <ul className={cn("flex flex-col text-base text-ink", className)}>
        {parsed.map(({ raw, info }, i) => {
          const bullet = (
            <span aria-hidden className={cn("shrink-0", bulletClassName)}>
              •
            </span>
          )
          return (
            <li key={i}>
              {info ? (
                <button
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-haspopup="dialog"
                  className="group flex min-h-11 w-full gap-3 rounded-inset py-2 text-left touch-manipulation"
                >
                  {bullet}
                  <span className="underline decoration-ink-soft decoration-dotted underline-offset-4 transition-colors duration-fast ease-standard group-hover:decoration-sage-dark">
                    {raw}
                  </span>
                </button>
              ) : (
                <span className="flex min-h-11 gap-3 py-2">
                  {bullet}
                  <span>{raw}</span>
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <BottomSheet open={Boolean(open?.info)} onClose={() => setOpenIndex(null)} title={open?.info?.label}>
        {open?.info && (
          <>
            <p className="mb-4 text-base text-ink-soft">{open.info.explanation}</p>
            <h3 className="mb-2 text-sm font-medium text-ink">Voedingsstoffen</h3>
            <ul className="flex flex-wrap gap-2 pb-1">
              {open.info.nutrients.map((n) => (
                <li key={n}>
                  <Badge tone="sage">{n}</Badge>
                </li>
              ))}
            </ul>
          </>
        )}
      </BottomSheet>
    </>
  )
}
