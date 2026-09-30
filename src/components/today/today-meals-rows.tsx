"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Repeat, X, Check, ChevronDown } from "lucide-react"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  loadWeekOverrides,
  setDayOverride,
  WEEK_OVERRIDES_CHANGED_EVENT,
  type DayOverride,
  type MealSlotKey,
} from "@/lib/client/week-plan-storage"

export type TodayMeal = {
  slot: MealSlotKey
  label: string
  recipe: {
    id: string
    title: string
    image_url: string | null
    preparation_time: number | null
  } | null
}

export type TodayMealAlternative = {
  id: string
  title: string
  image_url: string | null
  preparation_time: number | null
}

/**
 * Today's meals (ontbijt → lunch → diner) with the same localStorage
 * overrides as Deze week. Matching training: Aanpassen → vervangen /
 * eigen maaltijd / overslaan.
 */
export function TodayMealsRows({
  userId,
  date,
  weekStartISO,
  meals,
  alternativesBySlot = {},
  recipeImageById = {},
}: {
  userId: string
  date: string
  weekStartISO: string
  meals: TodayMeal[]
  alternativesBySlot?: Partial<Record<MealSlotKey, TodayMealAlternative[]>>
  recipeImageById?: Record<string, string | null>
}) {
  const [overrides, setOverrides] = useState<Record<string, DayOverride>>({})
  const [adjustSlot, setAdjustSlot] = useState<MealSlotKey | null>(null)
  const [mode, setMode] = useState<"idle" | "swap" | "custom">("idle")
  const [customText, setCustomText] = useState("")

  useEffect(() => {
    function refresh() {
      setOverrides(loadWeekOverrides(userId, weekStartISO))
    }
    refresh()
    window.addEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
  }, [userId, weekStartISO])

  function applyOverride(slot: MealSlotKey, next: DayOverride | null) {
    setDayOverride(userId, weekStartISO, date, slot, next)
    setOverrides(loadWeekOverrides(userId, weekStartISO))
    setAdjustSlot(null)
    setMode("idle")
    setCustomText("")
  }

  function openAdjust(slot: MealSlotKey) {
    if (adjustSlot === slot) {
      setAdjustSlot(null)
      setMode("idle")
      setCustomText("")
      return
    }
    setAdjustSlot(slot)
    setMode("idle")
    setCustomText("")
  }

  if (!meals.length) return null

  return (
    <>
      {meals.map((meal) => {
        const override = overrides[`${date}:${meal.slot}`] ?? null
        const skipped = override?.type === "skip-meal"
        const swapped = override?.type === "swap-meal" ? override : null
        const custom = override?.type === "custom-meal" ? override : null
        const alternatives = (alternativesBySlot[meal.slot] ?? []).filter(
          (a) => a.id !== meal.recipe?.id && a.id !== swapped?.recipeId,
        )
        const isAdjusting = adjustSlot === meal.slot
        const hasOverride = Boolean(skipped || swapped || custom)

        if (skipped) {
          return (
            <div key={meal.slot} className="px-4 py-3">
              <p className="text-[11px] font-medium text-sage-dark">{meal.label}</p>
              <p className="text-sm text-ink-soft italic">Overgeslagen</p>
              <button
                type="button"
                onClick={() => applyOverride(meal.slot, null)}
                className="mt-1 text-xs font-medium text-sage-dark min-h-11 touch-manipulation"
              >
                Herstel voorstel
              </button>
            </div>
          )
        }

        if (custom) {
          return (
            <div key={meal.slot} className="px-4 py-3">
              <p className="text-[11px] font-medium text-sage-dark">{meal.label}</p>
              <p className="text-sm font-medium text-ink">{custom.text}</p>
              <p className="text-xs text-ink-soft mt-0.5">Eigen maaltijd</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => openAdjust(meal.slot)}
                  className="inline-flex items-center gap-1 min-h-11 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
                  aria-expanded={isAdjusting}
                >
                  Aanpassen
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", isAdjusting && "rotate-180")}
                    strokeWidth={2}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => applyOverride(meal.slot, null)}
                  className="inline-flex items-center min-h-11 px-2 text-xs font-medium text-sage-dark touch-manipulation"
                >
                  Herstel advies
                </button>
              </div>
              {isAdjusting && (
                <MealAdjustPanel
                  slot={meal.slot}
                  mode={mode}
                  setMode={setMode}
                  customText={customText}
                  setCustomText={setCustomText}
                  alternatives={alternatives}
                  onApply={(next) => applyOverride(meal.slot, next)}
                  onCancel={() => {
                    setAdjustSlot(null)
                    setMode("idle")
                    setCustomText("")
                  }}
                />
              )}
            </div>
          )
        }

        const title = swapped?.title ?? meal.recipe?.title
        const recipeId = swapped?.recipeId ?? meal.recipe?.id
        if (!title || !recipeId) {
          return (
            <div key={meal.slot} className="px-4 py-3">
              <p className="text-[11px] font-medium text-sage-dark">{meal.label}</p>
              <p className="text-sm text-ink-soft">Nog geen voorstel</p>
              <button
                type="button"
                onClick={() => openAdjust(meal.slot)}
                className="mt-1 inline-flex items-center gap-1 min-h-11 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
                aria-expanded={isAdjusting}
              >
                Aanpassen
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", isAdjusting && "rotate-180")}
                  strokeWidth={2}
                />
              </button>
              {isAdjusting && (
                <MealAdjustPanel
                  slot={meal.slot}
                  mode={mode}
                  setMode={setMode}
                  customText={customText}
                  setCustomText={setCustomText}
                  alternatives={alternatives}
                  onApply={(next) => applyOverride(meal.slot, next)}
                  onCancel={() => {
                    setAdjustSlot(null)
                    setMode("idle")
                    setCustomText("")
                  }}
                />
              )}
            </div>
          )
        }

        const imageUrl = swapped
          ? (alternativesBySlot[meal.slot]?.find((a) => a.id === recipeId)?.image_url ??
            recipeImageById[recipeId] ??
            null)
          : (meal.recipe?.image_url ?? recipeImageById[recipeId] ?? null)

        return (
          <div key={meal.slot} className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Link
                href={`/voeding/${recipeId}`}
                className="flex items-center gap-3 min-w-0 flex-1 touch-manipulation motion-safe:active:opacity-80"
              >
                <RecipeImage
                  title={title}
                  imageUrl={imageUrl}
                  className="h-11 w-11 rounded-xl shrink-0"
                  sizes="44px"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-sage-dark">{meal.label}</p>
                  <p className="text-sm font-medium text-ink leading-snug truncate">{title}</p>
                  {swapped && meal.recipe && (
                    <p className="text-[11px] text-ink-soft mt-0.5 truncate">
                      Jouw keuze · advies was {meal.recipe.title}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={2} aria-hidden />
              </Link>
            </div>

            <div className="flex flex-wrap gap-1 mt-0.5">
              <button
                type="button"
                onClick={() => openAdjust(meal.slot)}
                className="inline-flex items-center gap-1 min-h-11 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
                aria-expanded={isAdjusting}
              >
                Aanpassen
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", isAdjusting && "rotate-180")}
                  strokeWidth={2}
                />
              </button>
              {hasOverride && (
                <button
                  type="button"
                  onClick={() => applyOverride(meal.slot, null)}
                  className="inline-flex items-center min-h-11 px-2 text-xs font-medium text-sage-dark touch-manipulation"
                >
                  Herstel advies
                </button>
              )}
            </div>

            {isAdjusting && (
              <MealAdjustPanel
                slot={meal.slot}
                mode={mode}
                setMode={setMode}
                customText={customText}
                setCustomText={setCustomText}
                alternatives={alternatives}
                onApply={(next) => applyOverride(meal.slot, next)}
                onCancel={() => {
                  setAdjustSlot(null)
                  setMode("idle")
                  setCustomText("")
                }}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

function MealAdjustPanel({
  slot,
  mode,
  setMode,
  customText,
  setCustomText,
  alternatives,
  onApply,
  onCancel,
}: {
  slot: MealSlotKey
  mode: "idle" | "swap" | "custom"
  setMode: (m: "idle" | "swap" | "custom") => void
  customText: string
  setCustomText: (v: string) => void
  alternatives: TodayMealAlternative[]
  onApply: (override: DayOverride | null) => void
  onCancel: () => void
}) {
  if (mode === "swap") {
    return (
      <div className="mt-2 flex flex-col gap-1.5">
        <p className="text-[11px] text-ink-soft mb-0.5">Vervang door:</p>
        {alternatives.map((alt) => (
          <button
            key={alt.id}
            type="button"
            onClick={() =>
              onApply({ type: "swap-meal", slot, recipeId: alt.id, title: alt.title })
            }
            className="text-left text-sm text-ink rounded-xl px-3 py-2.5 min-h-11 bg-surface/70 hover:bg-surface transition-colors touch-manipulation flex items-center justify-between gap-2"
          >
            <span className="truncate">{alt.title}</span>
            {alt.preparation_time != null && (
              <span className="text-xs text-ink-soft shrink-0">{alt.preparation_time} min</span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMode("idle")}
          className="text-[11px] font-medium text-ink-soft self-start touch-manipulation min-h-11"
        >
          Annuleren
        </button>
      </div>
    )
  }

  if (mode === "custom") {
    return (
      <div className="mt-2 flex flex-col gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Bijv. Eigen salade met kip"
          className="w-full rounded-xl border border-line/60 bg-surface px-3 py-2.5 text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-sage/40"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={!customText.trim()}
            onClick={() => {
              if (!customText.trim()) return
              onApply({ type: "custom-meal", slot, text: customText.trim() })
            }}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            Opslaan
          </Button>
          <button
            type="button"
            onClick={() => setMode("idle")}
            className="text-sm font-medium text-ink-soft min-h-11 px-2 touch-manipulation"
          >
            Annuleren
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1 -mt-1">
      {alternatives.length > 0 && (
        <button
          type="button"
          onClick={() => setMode("swap")}
          className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
        >
          <Repeat className="h-3.5 w-3.5" strokeWidth={1.75} />
          Andere maaltijd
        </button>
      )}
      <button
        type="button"
        onClick={() => setMode("custom")}
        className="inline-flex items-center min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
      >
        Eigen maaltijd
      </button>
      <button
        type="button"
        onClick={() => onApply({ type: "skip-meal", slot })}
        className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        Overslaan
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center min-h-11 px-2 text-xs font-medium text-ink-soft touch-manipulation"
      >
        Sluiten
      </button>
    </div>
  )
}
