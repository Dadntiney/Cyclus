"use client"

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Salad, SlidersHorizontal } from "lucide-react"
import { RecipeCard } from "./recipe-card"
import { Badge } from "@/components/ui/badge"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button, textActionClass } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { EmptyState } from "@/components/ui/empty-state"
import { useRovingRadio } from "@/lib/hooks/use-roving-radio"
import { CUISINE_OPTIONS } from "@/lib/nutrition/cuisine"
import { ICON } from "@/lib/ui/icon"
import type { RecipeCardData } from "@/lib/data/nutrition"
import { MEAL_MOMENTS, type MealMoment } from "./recipe-format"
import {
  NO_FILTERS,
  TIME_LIMITS,
  WISHES,
  activeSheetFilters,
  matchesFilters,
  orderRecipes,
  parseRecipeFilters,
  recipeFiltersQuery,
  removeFilter,
  sheetFilterCount,
  toggleInList,
  type RecipeFilters,
  type TimeLimit,
} from "./recipe-filters"

const PAGE_SIZE = 12

const ALL = "alles"
const MEAL_OPTIONS: { value: MealMoment | typeof ALL; label: string }[] = [
  { value: ALL, label: "Alles" },
  ...MEAL_MOMENTS.map((meal) => ({ value: meal, label: meal })),
]

const ANY_TIME = 0
const TIME_OPTIONS: { value: TimeLimit | typeof ANY_TIME; label: string }[] = [
  { value: ANY_TIME, label: "Maakt niet uit" },
  ...TIME_LIMITS.map((limit) => ({ value: limit, label: `${limit} min` })),
]

/*
 * How many recipes "Toon nog …" has shown, per filter selection, for this
 * tab (sessionStorage). Going back from a recipe remounts the library: with
 * the count restored in the very first client render, the list is as long
 * as she left it and the browser can put her back at the card she opened
 * (DISC-4). The server render (and hydration) always starts at one page.
 */
const SHOWN_KEY = "gofiev:voeding:getoond"
let shownMemory: string | null = null
const shownListeners = new Set<() => void>()

function readShown(): string | null {
  try {
    return window.sessionStorage.getItem(SHOWN_KEY) ?? shownMemory
  } catch {
    return shownMemory
  }
}

function writeShown(filterKey: string, count: number) {
  shownMemory = JSON.stringify({ key: filterKey, count })
  try {
    window.sessionStorage.setItem(SHOWN_KEY, shownMemory)
  } catch {
    // Private mode: the in-memory copy still covers this visit.
  }
  shownListeners.forEach((listener) => listener())
}

function subscribeShown(listener: () => void) {
  shownListeners.add(listener)
  return () => {
    shownListeners.delete(listener)
  }
}

function shownCountFor(raw: string | null, filterKey: string): number {
  if (!raw) return PAGE_SIZE
  try {
    const parsed = JSON.parse(raw) as { key?: unknown; count?: unknown }
    return parsed.key === filterKey && typeof parsed.count === "number" && parsed.count > PAGE_SIZE
      ? parsed.count
      : PAGE_SIZE
  } catch {
    return PAGE_SIZE
  }
}

function countLabel(n: number) {
  return `${n} ${n === 1 ? "recept" : "recepten"}`
}

/**
 * The recipe library (ontwerpvisie §7.4): one chip row for the meal moment,
 * a count row that also shows the active filters ("12 recepten ·
 * Vegetarisch ×", besluit 32; "Wis filters" once there are two or more),
 * and a Filters sheet for wishes, time and world cuisine. "Alles" shows every recipe: the everyday ones first, then
 * the world cuisines.
 *
 * The filters live in the URL (?moment=diner&wens=vegetarisch …, written
 * with history.replaceState: no reload, no extra history step), so going
 * back from a recipe lands on the same selection.
 */
export function RecipeLibrary({ recipes }: { recipes: RecipeCardData[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = useMemo(() => parseRecipeFilters(searchParams), [searchParams])
  const filterKey = recipeFiltersQuery(filters)

  const ordered = useMemo(() => orderRecipes(recipes), [recipes])
  const filtered = useMemo(() => ordered.filter((recipe) => matchesFilters(recipe, filters)), [ordered, filters])

  // "Toon nog …" starts over whenever the selection changes, and is kept
  // for the way back from a recipe.
  const storedShown = useSyncExternalStore(subscribeShown, readShown, () => null)
  const visibleCount = shownCountFor(storedShown, filterKey)
  const visible = filtered.slice(0, visibleCount)
  const hiddenCount = Math.max(0, filtered.length - visible.length)

  const [sheetOpen, setSheetOpen] = useState(false)
  const filtersButtonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const focusIndexRef = useRef<number | null>(null)

  const active = activeSheetFilters(filters)
  const sheetCount = sheetFilterCount(filters)

  function apply(next: RecipeFilters) {
    window.history.replaceState(null, "", `${pathname}${recipeFiltersQuery(next)}`)
  }

  function showMore() {
    focusIndexRef.current = visibleCount
    writeShown(filterKey, visibleCount + PAGE_SIZE)
  }

  // After "Toon nog …", move focus to the first new recipe so keyboard and
  // screen-reader users continue where the new ones start.
  useEffect(() => {
    const index = focusIndexRef.current
    if (index === null) return
    focusIndexRef.current = null
    listRef.current?.querySelectorAll<HTMLAnchorElement>("a")[index]?.focus()
  }, [visibleCount])

  // The chosen meal moment is always in view, also on a narrow phone where
  // "Snack" starts past the edge (NUT-3). Only the row scrolls, never the page.
  const mealRowRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scroller = mealRowRef.current
    const chip = scroller?.querySelector<HTMLElement>('[aria-checked="true"]')
    if (!scroller || !chip) return
    const edge = 20
    const row = scroller.getBoundingClientRect()
    const box = chip.getBoundingClientRect()
    if (box.right > row.right - edge) scroller.scrollLeft += box.right - (row.right - edge)
    else if (box.left < row.left + edge) scroller.scrollLeft -= row.left + edge - box.left
  }, [filters.meal])

  // Both "Wis filters" clear the same set: the Filters-sheet choices. The
  // meal moment stays as chosen (DISC-8).
  function clearSheetFilters() {
    apply({ ...NO_FILTERS, meal: filters.meal })
    filtersButtonRef.current?.focus()
  }

  function showAllRecipes() {
    apply(NO_FILTERS)
    filtersButtonRef.current?.focus()
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        <MealRow
          rowRef={mealRowRef}
          value={filters.meal ?? ALL}
          onChange={(meal) => apply({ ...filters, meal: meal === ALL ? null : meal })}
        />

        {/* Count and Filters on one line; the active filters as one
            compact chip row under it, "Wis filters" at the end (besluit 32). */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p role="status" className="flex min-h-11 items-center text-sm text-ink-soft">
              {countLabel(filtered.length)}
            </p>
            <Button
              ref={filtersButtonRef}
              variant="secondary"
              size="sm"
              aria-haspopup="dialog"
              onClick={() => setSheetOpen(true)}
              className="shrink-0"
            >
              <SlidersHorizontal {...ICON.sm} aria-hidden />
              Filters
              {sheetCount > 0 && (
                <Badge tone="sage">
                  {sheetCount}
                  <span className="sr-only"> aan</span>
                </Badge>
              )}
            </Button>
          </div>
          {active.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {active.map((filter) => (
                <Chip
                  key={`${filter.kind}-${filter.value}`}
                  removable
                  className="whitespace-nowrap"
                  onClick={() => {
                    apply(removeFilter(filters, filter))
                    // The chip disappears; keep the focus on something that stays.
                    filtersButtonRef.current?.focus()
                  }}
                >
                  {filter.label}
                </Chip>
              ))}
              {active.length > 1 && (
                <button type="button" onClick={clearSheetFilters} className={textActionClass("px-2")}>
                  Wis filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="sr-only">Recepten</h2>
        {filtered.length ? (
          <>
            <ul ref={listRef} className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((recipe) => (
                <li key={recipe.id}>
                  <RecipeCard recipe={recipe} />
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <Button variant="tonal" className="mt-6 w-full" onClick={showMore}>
                Toon nog {countLabel(Math.min(PAGE_SIZE, hiddenCount))}
              </Button>
            )}
          </>
        ) : (
          <EmptyState
            icon={Salad}
            titleAs="h3"
            title="Geen recepten bij deze filters"
            description="Probeer een andere combinatie, of bekijk alles."
            action={
              sheetCount > 0 ? (
                <Button variant="secondary" size="sm" onClick={clearSheetFilters}>
                  Wis filters
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={showAllRecipes}>
                  Bekijk alle recepten
                </Button>
              )
            }
          />
        )}
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-disabled={sheetCount === 0 || undefined}
              onClick={() => {
                if (sheetCount > 0) apply({ ...NO_FILTERS, meal: filters.meal })
              }}
              className={textActionClass("shrink-0 px-2 aria-disabled:opacity-50 aria-disabled:no-underline")}
            >
              Wis alles
            </button>
            <Button className="min-w-0 flex-1 px-4" disabled={filtered.length === 0} onClick={() => setSheetOpen(false)}>
              {filtered.length ? `Toon ${countLabel(filtered.length)}` : "Geen recepten"}
            </Button>
          </div>
        }
      >
        <p role="status" className="sr-only">
          {countLabel(filtered.length)}
        </p>
        <div className="flex flex-col gap-6 pb-2">
          <FilterGroup title="Wensen" description="Recepten met alles wat je kiest.">
            {(labelId) => (
              <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
                {WISHES.map((wish) => (
                  <Chip
                    key={wish}
                    selected={filters.wishes.includes(wish)}
                    onClick={() => apply({ ...filters, wishes: toggleInList(filters.wishes, wish) })}
                  >
                    {wish}
                  </Chip>
                ))}
              </div>
            )}
          </FilterGroup>

          <FilterGroup title="Tijd" description="Hoe lang mag het hooguit duren?">
            {(labelId) => (
              <ChipRadioGroup
                aria-labelledby={labelId}
                columns={4}
                options={TIME_OPTIONS}
                value={filters.maxTime ?? ANY_TIME}
                onChange={(time) => apply({ ...filters, maxTime: time === ANY_TIME ? null : time })}
              />
            )}
          </FilterGroup>

          <FilterGroup title="Wereldkeuken" description="Recepten uit een van de keukens die je kiest.">
            {(labelId) => (
              <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
                {CUISINE_OPTIONS.map((cuisine) => (
                  <Chip
                    key={cuisine}
                    selected={filters.cuisines.includes(cuisine)}
                    onClick={() => apply({ ...filters, cuisines: toggleInList(filters.cuisines, cuisine) })}
                  >
                    {cuisine}
                  </Chip>
                ))}
              </div>
            )}
          </FilterGroup>
        </div>
      </BottomSheet>
    </div>
  )
}

/**
 * The meal moments as one scrolling radio row: one Tab stop, arrow keys
 * choose. The check sits in a corner badge (the `fill` look) so choosing a
 * moment never makes its chip wider and the row never shifts.
 */
function MealRow({
  rowRef,
  value,
  onChange,
}: {
  rowRef: RefObject<HTMLDivElement | null>
  value: MealMoment | typeof ALL
  onChange: (value: MealMoment | typeof ALL) => void
}) {
  const selectedIndex = MEAL_OPTIONS.findIndex((option) => option.value === value)
  const { getItemProps } = useRovingRadio({
    count: MEAL_OPTIONS.length,
    selectedIndex,
    onSelect: (i) => onChange(MEAL_OPTIONS[i].value),
  })
  return (
    <div ref={rowRef} role="radiogroup" aria-label="Maaltijd" className="scroller-bleed flex gap-2">
      {MEAL_OPTIONS.map((option, i) => (
        <Chip
          key={option.value}
          role="radio"
          fill
          selected={i === selectedIndex}
          onClick={() => onChange(option.value)}
          className="w-auto shrink-0 px-4"
          {...getItemProps(i)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  )
}

function FilterGroup({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: (labelId: string) => ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="text-base font-medium text-ink">
        {title}
      </h3>
      <p className="text-sm text-ink-soft">{description}</p>
      <div className="mt-3">{children(id)}</div>
    </section>
  )
}
