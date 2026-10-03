import { Page } from "@/components/layout/page"
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton"

/**
 * Mirrors Vandaag: greeting, the phase status and the check-in on the left
 * (xl), "Voor jou vandaag" with its plan card on the right — so nothing
 * jumps when the page arrives.
 */
export default function Loading() {
  return (
    <Page
      width="wide"
      className="xl:grid xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:items-start xl:gap-x-12"
    >
      {/* sr-only is absolutely positioned, so it takes no grid cell on xl. */}
      <span role="status" className="sr-only">
        Even laden…
      </span>
      <div aria-hidden>
        <div className="mb-6 flex h-9 items-center lg:h-10">
          <Skeleton className="h-8 w-56 max-w-full lg:h-9" />
        </div>
        <div className="flex flex-col gap-8">
          <Skeleton className="h-44 w-full rounded-card" />
          <SkeletonCard />
        </div>
      </div>
      <div aria-hidden className="mt-8 flex flex-col xl:mt-0">
        <Skeleton className="mb-3 h-7 w-40" />
        <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex min-h-14 items-center gap-3 px-4 py-3">
              <Skeleton className="h-11 w-11 shrink-0" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}
