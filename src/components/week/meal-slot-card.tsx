"use client"

import { useState } from "react"
import Link from "next/link"
import { ChefHat, Repeat, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WeekPlanRecipe } from "@/lib/recommendations/week-plan"
import type { DayOverride, MealSlotKey } from "@/lib/client/week-plan-storage"

interface MealSlotCardProps {
  slot: MealSlotKey
  label: string
  recipe: WeekPlanRecipe | null
  alternatives: WeekPlanRecipe[]
  override: DayOverride | null
  onOverride: (override: DayOverride | null) => void
}

/**
 * One meal slot (ontbijt/lunch/diner) for a day in the week view. Always
 * shows the suggestion first — this is a plan someone can act on, not a
 * blank form — but "Vervang", "Sla over" and "Eigen maaltijd" are always one
 * tap away, since nobody should feel like the app is prescribing what she
 * has to eat.
 */
export function MealSlotCard({ slot, label, recipe, alternatives, override, onOverride }: MealSlotCardProps) {
  const [mode, setMode] = useState<"idle" | "swap" | "custom">("idle")
  const [customText, setCustomText] = useState("")

  const skipped = override?.type === "skip-meal"
  const swapped = override?.type === "swap-meal" ? override : null
  const custom = override?.type === "custom-meal" ? override : null

  function reset() {
    setMode("idle")
    setCustomText("")
  }

  return (
    <div className="rounded-2xl border border-line/70 p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-ink-soft">{label}</p>
        {(skipped || swapped || custom) && (
          <button
            type="button"
            onClick={() => onOverride(null)}
            className="text-[11px] font-medium text-sage-dark touch-manipulation"
          >
            Herstel voorstel
          </button>
        )}
      </div>

      {skipped ? (
        <p className="text-sm text-ink-soft italic">Overgeslagen</p>
      ) : custom ? (
        <p className="text-sm font-medium text-ink">{custom.text}</p>
      ) : swapped ? (
        <p className="text-sm font-medium text-ink">{swapped.title}</p>
      ) : recipe ? (
        <Link href={`/voeding/${recipe.id}`} className="block group touch-manipulation">
          <p className="text-sm font-medium text-ink group-hover:text-sage-dark transition-colors">
            {recipe.title}
          </p>
          {recipe.preparation_time && (
            <p className="text-xs text-ink-soft mt-0.5 inline-flex items-center gap-1">
              <ChefHat className="h-3 w-3" strokeWidth={1.75} />
              {recipe.preparation_time} min
            </p>
          )}
        </Link>
      ) : (
        <p className="text-sm text-ink-soft">Geen suggestie beschikbaar.</p>
      )}

      {mode === "idle" && !skipped && (
        <div className="flex gap-3 mt-2.5">
          {alternatives.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("swap")}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
            >
              <Repeat className="h-3 w-3" strokeWidth={1.75} />
              Vervangen
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode("custom")}
            className="text-[11px] font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
          >
            Eigen maaltijd
          </button>
          <button
            type="button"
            onClick={() => onOverride({ type: "skip-meal", slot })}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
          >
            <X className="h-3 w-3" strokeWidth={1.75} />
            Overslaan
          </button>
        </div>
      )}

      {mode === "swap" && (
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="text-[11px] text-ink-soft mb-0.5">Vervang door:</p>
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              type="button"
              onClick={() => {
                onOverride({ type: "swap-meal", slot, recipeId: alt.id, title: alt.title })
                reset()
              }}
              className={cn(
                "text-left text-sm text-ink rounded-xl px-3 py-2 bg-cream-soft hover:bg-sage-soft transition-colors touch-manipulation",
              )}
            >
              {alt.title}
            </button>
          ))}
          <button
            type="button"
            onClick={reset}
            className="text-[11px] font-medium text-ink-soft self-start mt-0.5 touch-manipulation"
          >
            Annuleren
          </button>
        </div>
      )}

      {mode === "custom" && (
        <div className="mt-3 flex flex-col gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Bijv. Eigen salade met kip"
            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-sage/50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!customText.trim()}
              onClick={() => {
                if (!customText.trim()) return
                onOverride({ type: "custom-meal", slot, text: customText.trim() })
                reset()
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-white bg-sage-dark rounded-full px-3 py-1.5 disabled:opacity-40 touch-manipulation"
            >
              <Check className="h-3 w-3" />
              Opslaan
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-ink-soft touch-manipulation"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
