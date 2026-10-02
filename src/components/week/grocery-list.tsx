"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { groceryItemSubtitle, type GroceryCategory } from "@/lib/nutrition/grocery-list"
import { buildDayGroceryList, buildWeekGroceryList } from "@/lib/nutrition/week-grocery"
import { loadCheckedGroceryIds, loadWeekOverrides, saveCheckedGroceryIds } from "@/lib/client/week-plan-storage"
import {
  DEFAULT_HOUSEHOLD_SERVINGS,
  loadServingsPrefs,
  setDefaultServings,
  SERVINGS_CHANGED_EVENT,
  type ServingsPrefs,
} from "@/lib/client/servings-storage"
import { ServingsStepper } from "@/components/nutrition/servings-stepper"
import type { WeekDayPlan, WeekPlanRecipe } from "@/lib/recommendations/week-plan"

export type GroceryMode = "week" | "day"

export function GroceryList({
  userId,
  weekStartISO,
  baseWeekCategories,
  days,
  recipesById,
  initialMode = "week",
  initialDate = null,
}: {
  userId: string
  weekStartISO: string
  /** Server-computed week list (no overrides) — shown until client hydrates. */
  baseWeekCategories: GroceryCategory[]
  days: WeekDayPlan[]
  recipesById: Record<string, WeekPlanRecipe>
  initialMode?: GroceryMode
  /** ISO date when opening in day mode; falls back to today / first day. */
  initialDate?: string | null
}) {
  const router = useRouter()
  const todayISO = days.find((d) => d.isToday)?.date ?? days[0]?.date ?? null
  const [mode, setMode] = useState<GroceryMode>(initialMode)
  const [selectedDate, setSelectedDate] = useState<string>(
    () => initialDate && days.some((d) => d.date === initialDate)
      ? initialDate
      : todayISO ?? days[0]?.date ?? "",
  )
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [overridesReady, setOverridesReady] = useState(false)
  const [overrides, setOverrides] = useState(() => ({} as ReturnType<typeof loadWeekOverrides>))
  const [servingsPrefs, setServingsPrefs] = useState<ServingsPrefs>({
    defaultServings: DEFAULT_HOUSEHOLD_SERVINGS,
    byRecipeId: {},
  })

  useEffect(() => {
    // localStorage only on client — keep SSR markup stable, then hydrate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked(loadCheckedGroceryIds(userId, weekStartISO))
    setOverrides(loadWeekOverrides(userId, weekStartISO))
    setServingsPrefs(loadServingsPrefs(userId))
    setOverridesReady(true)

    function onServingsChange() {
      setServingsPrefs(loadServingsPrefs(userId))
    }
    window.addEventListener(SERVINGS_CHANGED_EVENT, onServingsChange)
    return () => window.removeEventListener(SERVINGS_CHANGED_EVENT, onServingsChange)
  }, [userId, weekStartISO])

  const byId = useMemo(() => new Map(Object.entries(recipesById)), [recipesById])

  const categories = useMemo(() => {
    if (!overridesReady) {
      if (mode === "week") return baseWeekCategories
      const day = days.find((d) => d.date === selectedDate)
      return day ? buildDayGroceryList(day, {}, byId, servingsPrefs) : []
    }
    if (mode === "week") return buildWeekGroceryList(days, overrides, byId, servingsPrefs)
    const day = days.find((d) => d.date === selectedDate)
    return day ? buildDayGroceryList(day, overrides, byId, servingsPrefs) : []
  }, [
    overridesReady,
    mode,
    selectedDate,
    days,
    overrides,
    byId,
    baseWeekCategories,
    servingsPrefs,
  ])

  function syncUrl(nextMode: GroceryMode, nextDate: string) {
    const params = new URLSearchParams()
    if (nextMode === "day") {
      params.set("modus", "dag")
      if (nextDate) params.set("dag", nextDate)
    }
    const qs = params.toString()
    router.replace(qs ? `/deze-week/boodschappen?${qs}` : "/deze-week/boodschappen", { scroll: false })
  }

  function selectMode(next: GroceryMode) {
    setMode(next)
    syncUrl(next, selectedDate)
  }

  function selectDay(date: string) {
    setSelectedDate(date)
    setMode("day")
    syncUrl("day", date)
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      // Shared across week ↔ day — same item ids, one checklist.
      saveCheckedGroceryIds(userId, weekStartISO, next)
      return next
    })
  }

  const recipeOverrideCount = Object.keys(servingsPrefs.byRecipeId).length

  return (
    <div className="flex flex-col gap-5">
      <div
        className="inline-flex self-start rounded-full bg-cream-soft border border-line p-1"
        role="tablist"
        aria-label="Boodschappenweergave"
      >
        {(
          [
            { id: "week" as const, label: "Week" },
            { id: "day" as const, label: "Dag" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => selectMode(tab.id)}
            className={cn(
              "min-h-10 px-5 rounded-full text-sm font-medium touch-manipulation transition-colors",
              mode === tab.id
                ? "bg-surface-elevated text-ink font-semibold ring-1 ring-line shadow-[0_1px_3px_rgba(46,37,41,0.12)]"
                : "text-ink-soft",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "day" && (
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {days.map((d) => {
            const selected = d.date === selectedDate
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => selectDay(d.date)}
                aria-pressed={selected}
                aria-label={`${d.weekday} ${format(parseISO(d.date), "d MMMM", { locale: nl })}${d.isToday ? ", vandaag" : ""}`}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 min-h-14 touch-manipulation transition-colors",
                  selected ? "bg-sage-fill border-sage-fill text-white" : "bg-surface border-line text-ink",
                )}
              >
                <span className="text-xs font-medium opacity-80">{d.weekdayShort}</span>
                <span className="text-base font-semibold tabular-nums">{format(parseISO(d.date), "d")}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="rounded-[1.25rem] bg-surface border border-line px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Basis porties</p>
          <p className="text-xs text-ink-soft mt-0.5 leading-snug">
            Hoeveelheden op de lijst volgen dit aantal
            {recipeOverrideCount > 0
              ? ` · ${recipeOverrideCount} recept${recipeOverrideCount === 1 ? "" : "en"} afwijkend`
              : ""}
            . Per recept aanpasbaar op de receptpagina.
          </p>
        </div>
        <ServingsStepper
          value={servingsPrefs.defaultServings}
          onChange={(n) => setServingsPrefs(setDefaultServings(userId, n))}
          size="sm"
        />
      </div>

      <p className="text-sm text-ink-soft -mt-1">
        {mode === "week"
          ? "Alles voor je weekplanning. Vink af wat je al in huis hebt of hebt gehaald."
          : selectedDate
            ? `Alleen voor ${format(parseISO(selectedDate), "EEEE d MMMM", { locale: nl })}${selectedDate === todayISO ? " (vandaag)" : ""}.`
            : "Kies een dag."}
      </p>

      {!categories.length ? (
        <p className="text-sm text-ink-soft">
          {mode === "day"
            ? "Geen maaltijden op deze dag — of ze zijn overgeslagen."
            : "Nog geen boodschappen — zodra je weekplanning maaltijden bevat, verschijnen ze hier automatisch."}
        </p>
      ) : (
        categories.map((cat) => {
          // Still-to-buy first; what she already has sinks to the bottom.
          const items = [...cat.items].sort(
            (a, b) => Number(checked.has(a.id)) - Number(checked.has(b.id)),
          )
          const done = cat.items.filter((i) => checked.has(i.id)).length
          const allDone = done === cat.items.length
          return (
            <details key={`${cat.category}-${allDone}`} open={!allDone} className="group">
              <summary className="flex items-center justify-between gap-3 mb-2.5 cursor-pointer list-none min-h-11 touch-manipulation [&::-webkit-details-marker]:hidden">
                <h2 className="font-display text-lg text-ink">
                  {cat.category}
                  <span className="font-sans text-sm text-ink-soft font-normal"> · {cat.items.length}</span>
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                  {done > 0 && (allDone ? "Alles in huis" : `${done} afgevinkt`)}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" strokeWidth={1.75} aria-hidden />
                </span>
              </summary>
              <div className="rounded-[1.25rem] bg-surface border border-line divide-y divide-line overflow-hidden">
                {items.map((item) => {
                  const isChecked = checked.has(item.id)
                  const subtitle = groceryItemSubtitle(item, mode)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 min-h-12 text-left touch-manipulation transition-colors active:bg-cream-soft"
                    >
                      {/* Small checkbox (not a thumbnail-sized tile); row stays ≥44px for touch. */}
                      <span
                        aria-hidden
                        className={cn(
                          "shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                          isChecked
                            ? "bg-sage-fill border-sage-dark text-white"
                            : "border-sage-dark/45 bg-surface",
                        )}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-sm font-medium",
                            isChecked ? "text-ink-soft/60 line-through" : "text-ink",
                          )}
                        >
                          {item.name}
                        </span>
                        {subtitle && (
                          <span className="block text-xs text-ink-soft mt-0.5">{subtitle}</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </details>
          )
        })
      )}
    </div>
  )
}
