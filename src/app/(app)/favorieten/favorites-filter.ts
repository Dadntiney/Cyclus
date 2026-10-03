/**
 * The Favorieten filter (ontwerpvisie §7.7) and its `?soort=` value. The
 * old per-library pages redirect here with `recepten` and `beweging`
 * (next.config.ts), so those names are part of the URL contract.
 */
export const FAVORITES_FILTERS = [
  { value: "alles", label: "Alles" },
  { value: "recepten", label: "Recepten" },
  { value: "beweging", label: "Beweging" },
  { value: "momenten", label: "Momenten" },
] as const

export type FavoritesFilter = (typeof FAVORITES_FILTERS)[number]["value"]

/** How many items a group shows in "Alles" before "Alle n ›". */
export const ALL_VIEW_LIMIT = 5

/** `?soort=` → filter; anything unknown (or missing) is "alles". */
export function parseFavoritesFilter(value: string | string[] | null | undefined): FavoritesFilter {
  const raw = (Array.isArray(value) ? value[0] : value)?.trim().toLowerCase()
  return FAVORITES_FILTERS.find((f) => f.value === raw)?.value ?? "alles"
}

/** The URL for a filter: "alles" is the bare page, the rest `?soort=…`. */
export function favoritesFilterHref(filter: FavoritesFilter, pathname = "/favorieten"): string {
  return filter === "alles" ? pathname : `${pathname}?soort=${filter}`
}
