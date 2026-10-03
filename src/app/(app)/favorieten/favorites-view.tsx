"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"
import { ChevronRight, Footprints, Heart, Salad, Sparkles } from "lucide-react"
import type { SavedMomentKind } from "@/lib/data/moments"
import { ICON, iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { buttonVariants } from "@/components/ui/button"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionAction, SectionHeader } from "@/components/ui/section-header"
import {
  ALL_VIEW_LIMIT,
  FAVORITES_FILTERS,
  favoritesFilterHref,
  parseFavoritesFilter,
  type FavoritesFilter,
} from "./favorites-filter"

export interface FavoriteRecipeItem {
  id: string
  title: string
  imageUrl: string | null
  /** "25 min · ontbijt" (may be empty). */
  meta: string
}

export interface FavoriteExerciseItem {
  id: string
  name: string
  /** Muscle group in sentence case, or null. */
  meta: string | null
  href: string
}

export interface FavoriteMomentItem {
  id: string
  kind: SavedMomentKind
  kindLabel: string
  text: string
  source?: string
  sourceKey?: string
}

type GroupKey = Exclude<FavoritesFilter, "alles">

const GROUP_TITLES: Record<GroupKey, string> = {
  recepten: "Recepten",
  beweging: "Beweging",
  momenten: "Momenten",
}

/** What "Alle n" counts, for screen readers ("Alle 7 oefeningen"). */
const GROUP_ITEMS: Record<GroupKey, string> = {
  recepten: "recepten",
  beweging: "oefeningen",
  momenten: "momenten",
}

// Same row rhythm as ListRow: 56px minimum, the focus outline inside the row.
const rowClasses = "flex min-h-14 w-full items-center gap-3.5 px-4 py-3 -outline-offset-2"
const linkRowClasses = cn(
  rowClasses,
  "touch-manipulation transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft",
)

function RowList({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <ul
      role="list"
      aria-label={label}
      className="rounded-card bg-surface border border-line divide-y divide-line overflow-hidden"
    >
      {children}
    </ul>
  )
}

function RecipeRow({ recipe }: { recipe: FavoriteRecipeItem }) {
  return (
    <li>
      <Link href={`/voeding/${recipe.id}`} className={linkRowClasses}>
        {/* The title already names the photo. */}
        <span aria-hidden className="shrink-0">
          <RecipeImage
            title={recipe.title}
            imageUrl={recipe.imageUrl}
            className="h-12 w-12 rounded-inset"
            sizes="48px"
          />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-medium text-ink line-clamp-2">{recipe.title}</span>
          {recipe.meta && <span className="text-sm text-ink-soft truncate">{recipe.meta}</span>}
        </span>
        <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
      </Link>
    </li>
  )
}

function ExerciseRow({ exercise }: { exercise: FavoriteExerciseItem }) {
  return (
    <li>
      <Link href={exercise.href} className={linkRowClasses}>
        <span
          aria-hidden
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
        >
          <Footprints {...ICON.md} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-medium text-ink line-clamp-2">{exercise.name}</span>
          {exercise.meta && <span className="text-sm text-ink-soft truncate">{exercise.meta}</span>}
        </span>
        <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
      </Link>
    </li>
  )
}

function MomentRow({ moment }: { moment: FavoriteMomentItem }) {
  return (
    <li className={cn(rowClasses, "items-start")}>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
        <span className="type-eyebrow text-sage-dark">{moment.kindLabel}</span>
        <span className="text-sm text-ink">{moment.text}</span>
      </span>
      <MomentFavoriteButton
        kind={moment.kind}
        text={moment.text}
        source={moment.source}
        sourceKey={moment.sourceKey}
        initialFavorited
        size="sm"
        className="-my-1 -mr-2"
      />
    </li>
  )
}

const EMPTY: Record<FavoritesFilter, { icon: typeof Heart; title: string; description: string; href: string; action: string }> = {
  alles: {
    icon: Heart,
    title: "Nog geen favorieten",
    description: "Tik op het hartje bij een recept, oefening, tip of affirmatie, dan vind je ze hier terug.",
    href: "/voeding",
    action: "Bekijk recepten",
  },
  recepten: {
    icon: Salad,
    title: "Nog geen recepten bewaard",
    description: "Tik op het hartje bij een recept dat je lekker lijkt.",
    href: "/voeding",
    action: "Bekijk recepten",
  },
  beweging: {
    icon: Footprints,
    title: "Nog geen oefeningen bewaard",
    description: "Tik tijdens een training op het hartje bij een oefening die bij je past.",
    href: "/training",
    action: "Kies een training",
  },
  momenten: {
    icon: Sparkles,
    title: "Nog geen momenten bewaard",
    description: "Tik op het hartje bij een tip, quote of affirmatie die je wilt onthouden.",
    href: "/vandaag",
    action: "Naar Vandaag",
  },
}

function Empty({ filter }: { filter: FavoritesFilter }) {
  const { icon, title, description, href, action } = EMPTY[filter]
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        <Link href={href} className={buttonVariants({ variant: "tonal", size: "sm" })}>
          {action}
        </Link>
      }
    />
  )
}

/**
 * Favorieten with its filter. Everything is loaded once by the page; the
 * filter only changes what is shown and writes `?soort=` with
 * history.replaceState (no reload, no scroll jump, no extra history step).
 * "Alles" shows up to five per group with "Alle n ›" to that filter.
 */
export function FavoritesView({
  recipes,
  exercises,
  moments,
}: {
  recipes: FavoriteRecipeItem[]
  exercises: FavoriteExerciseItem[]
  moments: FavoriteMomentItem[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filter = parseFavoritesFilter(searchParams.get("soort"))
  const filterRowRef = useRef<HTMLDivElement>(null)
  // "Alle n" disappears once its filter is on: focus moves to that filter's
  // chip instead of being lost.
  const focusFilterRef = useRef(false)

  useEffect(() => {
    if (!focusFilterRef.current) return
    focusFilterRef.current = false
    filterRowRef.current
      ?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')
      ?.focus({ preventScroll: true })
  }, [filter])

  function select(next: FavoritesFilter) {
    if (next === filter) return
    window.history.replaceState(null, "", favoritesFilterHref(next, pathname))
  }

  function showGroup(group: GroupKey) {
    focusFilterRef.current = true
    select(group)
    // "Alle n" sits lower on the page: start the full list at the top.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  }

  const counts: Record<GroupKey, number> = {
    recepten: recipes.length,
    beweging: exercises.length,
    momenten: moments.length,
  }

  function rows(group: GroupKey, limit?: number) {
    switch (group) {
      case "recepten":
        return recipes.slice(0, limit).map((recipe) => <RecipeRow key={recipe.id} recipe={recipe} />)
      case "beweging":
        return exercises.slice(0, limit).map((exercise) => <ExerciseRow key={exercise.id} exercise={exercise} />)
      case "momenten":
        return moments.slice(0, limit).map((moment) => <MomentRow key={moment.id} moment={moment} />)
    }
  }

  const groups = (Object.keys(GROUP_TITLES) as GroupKey[]).filter((group) => counts[group] > 0)

  let content: ReactNode
  if (filter === "alles") {
    content = groups.length ? (
      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group} aria-labelledby={`favorieten-${group}`}>
            <SectionHeader
              id={`favorieten-${group}`}
              title={GROUP_TITLES[group]}
              action={
                counts[group] > ALL_VIEW_LIMIT ? (
                  <SectionAction onClick={() => showGroup(group)}>
                    Alle {counts[group]}
                    <span className="sr-only"> {GROUP_ITEMS[group]}</span>
                  </SectionAction>
                ) : undefined
              }
            />
            <RowList>{rows(group, ALL_VIEW_LIMIT)}</RowList>
          </section>
        ))}
      </div>
    ) : (
      <Empty filter="alles" />
    )
  } else {
    content = counts[filter] ? <RowList label={GROUP_TITLES[filter]}>{rows(filter)}</RowList> : <Empty filter={filter} />
  }

  return (
    <div className="flex flex-col gap-6">
      <div ref={filterRowRef}>
        <ChipRadioGroup
          aria-label="Soort favorieten"
          options={FAVORITES_FILTERS}
          value={filter}
          onChange={select}
          className="scroller-bleed flex-nowrap"
          chipClassName="shrink-0 whitespace-nowrap"
        />
      </div>
      {content}
    </div>
  )
}
