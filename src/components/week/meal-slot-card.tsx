"use client"

import { useState } from "react"
import Link from "next/link"
import { ChefHat, Repeat, X, Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RecipeImage } from "@/components/nutrition/recipe-image"
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
 * One meal slot for the week plan. Suggestion first; adjust options behind
 * one “Aanpassen” control so the day list stays scannable (same pattern as Vandaag).
 */
export function MealSlotCard({ slot, label, recipe, alternatives, override, onOverride }: MealSlotCardProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"menu" | "swap" | "custom">("menu")
  const [customText, setCustomText] = useState("")

  const skipped = override?.type === "skip-meal"
  const swapped = override?.type === "swap-meal" ? override : null
  const custom = override?.type === "custom-meal" ? override : null
  const swappedRecipe = swapped ? (alternatives.find((a) => a.id === swapped.recipeId) ?? null) : null

  function closeAdjust() {
    setOpen(false)
    setMode("menu")
    setCustomText("")
  }

  return (
    <div className="rounded-3xl bg-sage-soft/50 p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-ink-soft">{label}</p>
        {(skipped || swapped || custom) && (
          <button
            type="button"
            onClick={() => onOverride(null)}
            className="text-[11px] font-medium text-sage-dark touch-manipulation min-h-11 px-1"
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
        <Link href={`/voeding/${swapped.recipeId}`} className="flex items-center gap-3 group touch-manipulation">
          <RecipeImage
            title={swapped.title}
            imageUrl={swappedRecipe?.image_url ?? null}
            className="h-14 w-14 rounded-xl shrink-0"
            sizes="56px"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink group-hover:text-sage-dark transition-colors">
              {swapped.title}
            </p>
            {swappedRecipe?.preparation_time && (
              <p className="text-xs text-ink-soft mt-0.5 inline-flex items-center gap-1">
                <ChefHat className="h-3 w-3" strokeWidth={1.75} />
                {swappedRecipe.preparation_time} min
              </p>
            )}
          </div>
        </Link>
      ) : recipe ? (
        <Link href={`/voeding/${recipe.id}`} className="flex items-center gap-3 group touch-manipulation">
          <RecipeImage
            title={recipe.title}
            imageUrl={recipe.image_url}
            className="h-14 w-14 rounded-xl shrink-0"
            sizes="56px"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink group-hover:text-sage-dark transition-colors">
              {recipe.title}
            </p>
            {recipe.preparation_time && (
              <p className="text-xs text-ink-soft mt-0.5 inline-flex items-center gap-1">
                <ChefHat className="h-3 w-3" strokeWidth={1.75} />
                {recipe.preparation_time} min
              </p>
            )}
          </div>
        </Link>
      ) : (
        <p className="text-sm text-ink-soft">
          Nog geen recept in deze categorie.{" "}
          <Link href="/voeding" className="font-medium text-sage-dark underline-offset-2 hover:underline">
            Bekijk de bibliotheek
          </Link>
          .
        </p>
      )}

      {!skipped && (
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v)
            setMode("menu")
          }}
          className="mt-1.5 inline-flex items-center gap-1 min-h-11 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
          aria-expanded={open}
        >
          Aanpassen
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            strokeWidth={2}
          />
        </button>
      )}

      {open && !skipped && mode === "menu" && (
        <div className="mt-1 flex flex-wrap gap-1">
          {alternatives.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("swap")}
              className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
            >
              <Repeat className="h-3.5 w-3.5" strokeWidth={1.75} />
              Vervangen
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
            onClick={() => {
              onOverride({ type: "skip-meal", slot })
              closeAdjust()
            }}
            className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            Overslaan
          </button>
        </div>
      )}

      {open && mode === "swap" && (
        <div className="mt-2 flex flex-col gap-1.5">
          <p className="text-[11px] text-ink-soft mb-0.5">Vervang door:</p>
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              type="button"
              onClick={() => {
                onOverride({ type: "swap-meal", slot, recipeId: alt.id, title: alt.title })
                closeAdjust()
              }}
              className="text-left text-sm text-ink rounded-xl px-3 py-2 bg-cream-soft hover:bg-sage-soft transition-colors touch-manipulation"
            >
              {alt.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMode("menu")}
            className="text-[11px] font-medium text-ink-soft self-start mt-0.5 touch-manipulation min-h-11"
          >
            Terug
          </button>
        </div>
      )}

      {open && mode === "custom" && (
        <div className="mt-2 flex flex-col gap-2">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Bijv. Eigen salade met kip"
            className="w-full rounded-xl border border-line px-3 py-2.5 text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-sage/50"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!customText.trim()}
              onClick={() => {
                if (!customText.trim()) return
                onOverride({ type: "custom-meal", slot, text: customText.trim() })
                closeAdjust()
              }}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Opslaan
            </Button>
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="text-sm font-medium text-ink-soft min-h-11 px-2 touch-manipulation"
            >
              Terug
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
