"use client"

import { ACCOUNT_STATE_APPLIED_EVENT } from "@/lib/client/account-sync"
import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, PencilLine, Repeat, RotateCcw, SlidersHorizontal, X } from "lucide-react"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button, textActionClass } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Input, Label } from "@/components/ui/input"
import { ListGroup, ListRow } from "@/components/ui/list-group"
import { ICON } from "@/lib/ui/icon"
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

type SheetMode = "menu" | "swap" | "custom"

const rowLinkClass =
  "flex min-h-14 min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-1 touch-manipulation -outline-offset-2 " +
  "transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft"

/**
 * Today's meals (ontbijt → lunch → diner) as rows of the plan card.
 * "Aanpassen" works the same everywhere: a sliders IconButton opens a
 * sheet with the options (Andere maaltijd · Eigen maaltijd · Vandaag niet ·
 * Herstel advies). A skipped meal keeps its inline "Herstel".
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const [adjustSlot, setAdjustSlot] = useState<MealSlotKey | null>(null)
  const [mode, setMode] = useState<SheetMode>("menu")
  const [customText, setCustomText] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const customInputRef = useRef<HTMLInputElement>(null)
  const modeChangedRef = useRef(false)

  // The tapped option disappears when the sheet switches view, so move
  // focus along with it instead of dropping it on the page behind.
  useEffect(() => {
    if (!modeChangedRef.current) return
    modeChangedRef.current = false
    if (mode === "swap") backRef.current?.focus()
    else if (mode === "custom") customInputRef.current?.focus()
    else menuRef.current?.focus()
  }, [mode])

  function changeMode(next: SheetMode) {
    modeChangedRef.current = true
    setMode(next)
  }

  // After a choice the row may look different (skipped, own meal) and the
  // button that opened the sheet is gone: focus that row's own control.
  const rowPrefix = useId()
  const sheetWasOpenRef = useRef(false)
  useEffect(() => {
    if (sheetOpen) {
      sheetWasOpenRef.current = true
      return
    }
    if (!sheetWasOpenRef.current) return
    sheetWasOpenRef.current = false
    if (document.activeElement && document.activeElement !== document.body) return
    const row = adjustSlot ? document.querySelector(`[data-meal-row="${rowPrefix}${adjustSlot}"]`) : null
    const target =
      row?.querySelector<HTMLElement>('[aria-haspopup="dialog"]') ?? row?.querySelector<HTMLElement>("button, a[href]")
    target?.focus({ preventScroll: true })
  }, [sheetOpen, adjustSlot, rowPrefix])

  useEffect(() => {
    function refresh() {
      setOverrides(loadWeekOverrides(userId, weekStartISO))
    }
    refresh()
    window.addEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
    window.addEventListener(ACCOUNT_STATE_APPLIED_EVENT, refresh)
    return () => {
      window.removeEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
      window.removeEventListener(ACCOUNT_STATE_APPLIED_EVENT, refresh)
    }
  }, [userId, weekStartISO])

  function applyOverride(slot: MealSlotKey, next: DayOverride | null) {
    setDayOverride(userId, weekStartISO, date, slot, next)
    setOverrides(loadWeekOverrides(userId, weekStartISO))
    setSheetOpen(false)
  }

  function openAdjust(slot: MealSlotKey) {
    setAdjustSlot(slot)
    setMode("menu")
    setCustomText("")
    setSheetOpen(true)
  }

  if (!meals.length) return null

  const sheetMeal = meals.find((m) => m.slot === adjustSlot) ?? null
  const sheetOverride = sheetMeal ? (overrides[`${date}:${sheetMeal.slot}`] ?? null) : null
  const sheetSwapped = sheetOverride?.type === "swap-meal" ? sheetOverride : null
  const sheetAlternatives = sheetMeal
    ? (alternativesBySlot[sheetMeal.slot] ?? []).filter(
        (a) => a.id !== sheetMeal.recipe?.id && a.id !== sheetSwapped?.recipeId,
      )
    : []
  const customId = `maaltijd-eigen-${adjustSlot ?? "x"}`

  function saveCustom() {
    const text = customText.trim()
    if (!text || !sheetMeal) return
    applyOverride(sheetMeal.slot, { type: "custom-meal", slot: sheetMeal.slot, text })
  }

  return (
    <>
      {meals.map((meal) => {
        const override = overrides[`${date}:${meal.slot}`] ?? null
        const skipped = override?.type === "skip-meal"
        const swapped = override?.type === "swap-meal" ? override : null
        const custom = override?.type === "custom-meal" ? override : null
        const adjustButton = (
          <IconButton
            label={`${meal.label} aanpassen`}
            icon={SlidersHorizontal}
            aria-haspopup="dialog"
            onClick={() => openAdjust(meal.slot)}
          />
        )

        if (skipped) {
          return (
            <div key={meal.slot} data-meal-row={`${rowPrefix}${meal.slot}`} className="flex min-h-14 items-center gap-3 py-2 pl-4 pr-3">
              <div className="min-w-0 flex-1">
                <p className="type-eyebrow text-sage-dark">{meal.label}</p>
                <p className="text-sm text-ink-soft">Vandaag overgeslagen, ook goed</p>
              </div>
              <button
                type="button"
                onClick={() => applyOverride(meal.slot, null)}
                className={textActionClass("shrink-0 px-1")}
              >
                Herstel
              </button>
            </div>
          )
        }

        if (custom) {
          return (
            <div key={meal.slot} data-meal-row={`${rowPrefix}${meal.slot}`} className="flex min-h-14 items-center gap-1 py-2 pl-4 pr-2">
              <div className="min-w-0 flex-1">
                <p className="type-eyebrow text-sage-dark">{meal.label}</p>
                <p className="text-base font-medium text-ink wrap-anywhere">{custom.text}</p>
                <p className="text-xs text-ink-soft">Eigen maaltijd</p>
              </div>
              {adjustButton}
            </div>
          )
        }

        const title = swapped?.title ?? meal.recipe?.title
        const recipeId = swapped?.recipeId ?? meal.recipe?.id
        if (!title || !recipeId) {
          return (
            <div key={meal.slot} data-meal-row={`${rowPrefix}${meal.slot}`} className="flex min-h-14 items-center gap-1 py-2 pl-4 pr-2">
              <div className="min-w-0 flex-1">
                <p className="type-eyebrow text-sage-dark">{meal.label}</p>
                <p className="text-sm text-ink-soft">Nog geen voorstel</p>
              </div>
              {adjustButton}
            </div>
          )
        }

        const imageUrl = swapped
          ? (alternativesBySlot[meal.slot]?.find((a) => a.id === recipeId)?.image_url ??
            recipeImageById[recipeId] ??
            null)
          : (meal.recipe?.image_url ?? recipeImageById[recipeId] ?? null)

        return (
          <div key={meal.slot} data-meal-row={`${rowPrefix}${meal.slot}`} className="flex items-center gap-1 pr-2">
            <Link href={`/voeding/${recipeId}`} className={rowLinkClass}>
              <RecipeImage
                title={title}
                imageUrl={imageUrl}
                className="h-11 w-11 shrink-0 rounded-inset"
                sizes="44px"
              />
              <span className="min-w-0 flex-1">
                <span className="block type-eyebrow text-sage-dark">{meal.label}</span>
                <span className="block truncate text-base font-medium text-ink">{title}</span>
                {swapped && meal.recipe && (
                  <span className="block truncate text-xs text-ink-soft">
                    Jouw keuze · advies was {meal.recipe.title}
                  </span>
                )}
              </span>
            </Link>
            {adjustButton}
          </div>
        )
      })}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={sheetMeal ? `${sheetMeal.label} aanpassen` : "Maaltijd aanpassen"}
        footer={
          mode === "custom" ? (
            <Button className="w-full" disabled={!customText.trim()} onClick={saveCustom}>
              Opslaan
            </Button>
          ) : undefined
        }
      >
        {sheetMeal && mode === "menu" && (
          <div ref={menuRef} tabIndex={-1} data-focus-target="" className="pb-2">
            <ListGroup>
              {sheetAlternatives.length > 0 && (
                <ListRow icon={Repeat} title="Andere maaltijd" onClick={() => changeMode("swap")} />
              )}
              <ListRow icon={PencilLine} title="Eigen maaltijd" onClick={() => changeMode("custom")} />
              <ListRow
                icon={X}
                title="Vandaag niet"
                trailing="none"
                onClick={() => applyOverride(sheetMeal.slot, { type: "skip-meal", slot: sheetMeal.slot })}
              />
              {sheetOverride && (
                <ListRow
                  icon={RotateCcw}
                  title="Herstel advies"
                  description={sheetMeal.recipe ? sheetMeal.recipe.title : undefined}
                  trailing="none"
                  onClick={() => applyOverride(sheetMeal.slot, null)}
                />
              )}
            </ListGroup>
          </div>
        )}

        {sheetMeal && mode === "swap" && (
          <div className="flex flex-col gap-2 pb-2">
            <button
              ref={backRef}
              type="button"
              onClick={() => changeMode("menu")}
              className={textActionClass("self-start -ml-1 px-1")}
            >
              <ChevronLeft {...ICON.sm} aria-hidden />
              Terug
            </button>
            <ListGroup label="Vervang door" labelAs="h3">
              {sheetAlternatives.map((alt) => (
                <ListRow
                  key={alt.id}
                  title={alt.title}
                  value={alt.preparation_time != null ? `${alt.preparation_time} min` : undefined}
                  trailing="none"
                  onClick={() =>
                    applyOverride(sheetMeal.slot, {
                      type: "swap-meal",
                      slot: sheetMeal.slot,
                      recipeId: alt.id,
                      title: alt.title,
                    })
                  }
                />
              ))}
            </ListGroup>
          </div>
        )}

        {sheetMeal && mode === "custom" && (
          <div className="flex flex-col gap-2 pb-2">
            <button type="button" onClick={() => changeMode("menu")} className={textActionClass("self-start -ml-1 px-1")}>
              <ChevronLeft {...ICON.sm} aria-hidden />
              Terug
            </button>
            <Label htmlFor={customId}>Wat eet je?</Label>
            <Input
              ref={customInputRef}
              id={customId}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  saveCustom()
                }
              }}
              placeholder="Bijv. eigen salade met kip"
            />
          </div>
        )}
      </BottomSheet>
    </>
  )
}
