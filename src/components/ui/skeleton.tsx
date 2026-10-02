import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-inset", className)} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("rounded-card bg-surface border border-line p-5 flex flex-col gap-3", className)}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3.5 w-1/3" />
    </div>
  )
}

type SkeletonVariant = "cards" | "list" | "grid"

interface SkeletonPageProps {
  /** @deprecated alias for `count` with variant "cards" (old loading.tsx files). */
  cards?: number
  /** How many cards / rows / tiles. */
  count?: number
  /** cards: stacked cards · list: one ListGroup of rows · grid: 2-column tiles. */
  variant?: SkeletonVariant
  /** Same width as the real page: content (max-w-2xl) or wide (max-w-6xl). */
  width?: "content" | "wide"
  /** The page shows a back link (md+ only — on mobile it lives in the app bar). */
  back?: boolean
  /** The page has a 4:3 hero image above its title (recipe). */
  hero?: boolean
  /** The page header has a subtitle line. Default true. */
  subtitle?: boolean
}

/**
 * Loading state that mirrors <Page> + <PageHeader>: same container,
 * same title height (type-page-title line box), same spacing, so the
 * heading does not jump when the real page arrives.
 */
export function SkeletonPage({
  cards,
  count,
  variant = "cards",
  width = "content",
  back = false,
  hero = false,
  subtitle = true,
}: SkeletonPageProps) {
  const n = count ?? cards ?? 3

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        "mx-auto w-full px-5 lg:px-8 pt-4 pb-8 lg:pt-10",
        width === "wide" ? "max-w-6xl" : "max-w-2xl",
      )}
    >
      <span className="sr-only">Even laden…</span>
      <div aria-hidden className="mb-6">
        {back && <Skeleton className="hidden md:block h-11 w-24 mb-2 rounded-full" />}
        {hero && <Skeleton className="aspect-[4/3] w-full rounded-card mb-5" />}
        {/* type-page-title line box: 32 × 1.1 ≈ 36px (lg: 36 × 1.1 ≈ 40px) */}
        <div className="flex h-9 lg:h-10 items-center">
          <Skeleton className="h-8 lg:h-9 w-48" />
        </div>
        {subtitle && (
          // mt-1 + one text-sm line (22.5px)
          <div className="mt-1 flex h-5.5 items-center">
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        )}
      </div>

      {variant === "list" ? (
        <div aria-hidden className="rounded-card bg-surface border border-line divide-y divide-line overflow-hidden">
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="flex min-h-14 items-center gap-3.5 px-4 py-3">
              <Skeleton className="h-9 w-9 shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : variant === "grid" ? (
        <div aria-hidden className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: n }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-card" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {Array.from({ length: n }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  )
}
