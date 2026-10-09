/**
 * Kennis categories (WB-16): small groups on the index, with neutral dots
 * — the phase colours mean "cycle phase" everywhere else in the app.
 */

const CATEGORY_LABELS: Record<string, string> = {
  overgang: "Overgang",
  klachten: "Klachten",
  slaap: "Slaap",
  mentaal: "Mentaal",
  beweging: "Beweging",
  voeding: "Voeding",
  zorg: "Zorg",
  prive: "Privé",
}

export function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1)
}

const GROUPS = [
  { key: "overgang-klachten", title: "Overgang & klachten", categories: ["overgang", "klachten"] },
  { key: "slaap-stemming", title: "Slaap & stemming", categories: ["slaap", "mentaal"] },
  { key: "beweging-voeding", title: "Beweging & voeding", categories: ["beweging", "voeding"] },
  { key: "zorg-prive", title: "Zorg & privé", categories: ["zorg", "prive"] },
] as const

const OTHER = { key: "overig", title: "Overig" } as const

function groupKey(category: string) {
  return GROUPS.find((g) => (g.categories as readonly string[]).includes(category))?.key ?? OTHER.key
}

export interface ArticleGroup<T> {
  key: string
  title: string
  articles: T[]
}

/** Articles under their group, in group order; the order within a group is kept. Empty groups are left out. */
export function groupArticles<T extends { category: string }>(articles: readonly T[]): ArticleGroup<T>[] {
  return [...GROUPS, OTHER]
    .map((group) => ({
      key: group.key,
      title: group.title,
      articles: articles.filter((a) => groupKey(a.category) === group.key),
    }))
    .filter((group) => group.articles.length > 0)
}

/** "Ook interessant": others from the same group first, then the rest, in their own order. */
export function relatedArticles<T extends { slug: string; category: string }>(
  articles: readonly T[],
  current: { slug: string; category: string },
  limit = 3,
): T[] {
  const others = articles.filter((a) => a.slug !== current.slug)
  const key = groupKey(current.category)
  const near = others.filter((a) => groupKey(a.category) === key)
  const far = others.filter((a) => groupKey(a.category) !== key)
  return [...near, ...far].slice(0, limit)
}
