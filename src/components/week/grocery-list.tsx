"use client"

import { ACCOUNT_STATE_APPLIED_EVENT } from "@/lib/client/account-sync"
import { useEffect, useId, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
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
import { DayStrip } from "@/components/week/day-strip"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Chip } from "@/components/ui/chip"
import { Collapse } from "@/components/ui/disclosure"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { formatWeekdayDate } from "@/lib/dates/format"
import { CHECK_STROKE, iconProps } from "@/lib/ui/icon"
import type { WeekDayPlan, WeekPlanRecipe } from "@/lib/recommendations/week-plan"

export type GroceryMode = "week" | "day"

const MODE_OPTIONS = [
  { value: "week" as const, label: "Week" },
  { value: "day" as const, label: "Dag" },
]

function personen(n: number) {
  return `${n} ${n === 1 ? "persoon" : "personen"}`
}

/**
 * One category: the heading is the toggle (h2 › button), the rows open in
 * place. Folded when everything in it is checked off.
 */
function GroceryCategorySection({
  category,
  checked,
  mode,
  onToggle,
}: {
  category: GroceryCategory
  checked: Set<string>
  mode: GroceryMode
  onToggle: (id: string) => void
}) {
  const done = category.items.filter((i) => checked.has(i.id)).length
  const allDone = done === category.items.length
  const [open, setOpen] = useState(!allDone)
  const contentId = useId()
  // Still-to-buy first; what she already has sinks to the bottom.
  const items = [...category.items].sort((a, b) => Number(checked.has(a.id)) - Number(checked.has(b.id)))

  return (
    <section>
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-inset text-left touch-manipulation"
        >
          <span className="type-card-title min-w-0 text-ink">
            {category.category}
            <span className="font-sans text-sm font-normal text-ink-soft"> · {category.items.length}</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ink-soft">
            {done > 0 && (allDone ? "Alles in huis" : `${done} afgevinkt`)}
            <ChevronDown
              {...iconProps(
                "sm",
                cn("transition-transform duration-base ease-standard motion-reduce:transition-none", open && "rotate-180"),
              )}
              aria-hidden
            />
          </span>
        </button>
      </h2>
      <Collapse open={open} id={contentId}>
        <div className="pt-2">
          <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {items.map((item) => {
              const isChecked = checked.has(item.id)
              const subtitle = groceryItemSubtitle(item, mode)
              // Keep this structure (box span, then a span holding name +
              // subtitle): the smoke test reads the item name from it.
              return (
                <button
                  key={item.id}
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => onToggle(item.id)}
                  className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left touch-manipulation -outline-offset-2 transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xs border-[1.5px] text-white transition-colors duration-fast ease-standard",
                      isChecked ? "border-sage-fill bg-sage-fill" : "border-line-strong bg-surface",
                    )}
                  >
                    {isChecked && <Check className="h-4 w-4" strokeWidth={CHECK_STROKE} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-base", isChecked ? "text-ink-soft line-through" : "text-ink")}>
                      {item.name}
                    </span>
                    {subtitle && <span className="block text-sm text-ink-soft">{subtitle}</span>}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </Collapse>
    </section>
  )
}

/**
 * Boodschappen (ontwerpvisie §7.2): Week/Dag as a SegmentedControl, the
 * same DayStrip as Deze week in Dag-mode, portions as an inline chip that
 * opens a sheet with the stepper, one helper line and one status line
 * "12 van 88 afgevinkt". Checked items and portions live where they always
 * did (this device + account sync).
 */
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
  const [servingsOpen, setServingsOpen] = useState(false)

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
    // Newer state from her account (another device) replaced the local copy.
    function onAccountState() {
      setChecked(loadCheckedGroceryIds(userId, weekStartISO))
      setOverrides(loadWeekOverrides(userId, weekStartISO))
      setServingsPrefs(loadServingsPrefs(userId))
    }
    window.addEventListener(SERVINGS_CHANGED_EVENT, onServingsChange)
    window.addEventListener(ACCOUNT_STATE_APPLIED_EVENT, onAccountState)
    return () => {
      window.removeEventListener(SERVINGS_CHANGED_EVENT, onServingsChange)
      window.removeEventListener(ACCOUNT_STATE_APPLIED_EVENT, onAccountState)
    }
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

  const stripDays = useMemo(
    () =>
      days.map((d) => ({
        date: d.date,
        weekdayShort: d.weekdayShort,
        isToday: d.isToday,
        isPast: d.isPast,
      })),
    [days],
  )

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
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0)
  const checkedItems = categories.reduce((sum, cat) => sum + cat.items.filter((i) => checked.has(i.id)).length, 0)
  const selectedDayIndex = Math.max(
    0,
    days.findIndex((d) => d.date === selectedDate),
  )

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        fullWidth
        aria-label="Boodschappen per"
        options={MODE_OPTIONS}
        value={mode}
        onChange={selectMode}
      />

      {mode === "day" && (
        <DayStrip days={stripDays} selectedIndex={selectedDayIndex} onSelect={(i) => selectDay(days[i].date)} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Chip onClick={() => setServingsOpen(true)} aria-haspopup="dialog">
          Voor {personen(servingsPrefs.defaultServings)}
          <ChevronDown {...iconProps("sm")} aria-hidden />
        </Chip>
        {totalItems > 0 && (
          <p className="text-sm font-medium text-ink">
            {checkedItems} van {totalItems} afgevinkt
          </p>
        )}
      </div>

      <p className="-mt-1 text-sm text-ink-soft">
        {mode === "week"
          ? "Alles voor je weekplanning. Vink af wat je al in huis hebt of hebt gehaald."
          : selectedDate
            ? `Alleen voor ${formatWeekdayDate(selectedDate, { month: "long" })}${selectedDate === todayISO ? " (vandaag)" : ""}.`
            : "Kies een dag."}
      </p>

      {!categories.length ? (
        <p className="text-sm text-ink-soft">
          {mode === "day"
            ? "Geen maaltijden op deze dag, of ze zijn overgeslagen."
            : "Nog geen boodschappen. Zodra je weekplanning maaltijden bevat, verschijnen ze hier vanzelf."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {categories.map((cat) => {
            const allDone = cat.items.every((i) => checked.has(i.id))
            return (
              <GroceryCategorySection
                key={`${cat.category}-${allDone}`}
                category={cat}
                checked={checked}
                mode={mode}
                onToggle={toggle}
              />
            )
          })}
        </div>
      )}

      <BottomSheet open={servingsOpen} onClose={() => setServingsOpen(false)} title="Porties">
        <div className="flex flex-col gap-4 pb-2">
          <p className="text-sm text-ink-soft">
            De hoeveelheden op de lijst volgen dit aantal personen
            {recipeOverrideCount > 0
              ? `, behalve ${recipeOverrideCount} recept${recipeOverrideCount === 1 ? "" : "en"} waarvoor je zelf iets anders koos`
              : ""}
            . Per recept pas je het aan op de receptpagina.
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-medium text-ink">{personen(servingsPrefs.defaultServings)}</p>
            <ServingsStepper
              value={servingsPrefs.defaultServings}
              onChange={(n) => setServingsPrefs(setDefaultServings(userId, n))}
              label="Aantal personen"
            />
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
