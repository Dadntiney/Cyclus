import { Skeleton, SkeletonPage } from "@/components/ui/skeleton"

const MOMENT_WIDTHS = ["w-18", "w-22", "w-20", "w-18", "w-20"]

/**
 * Mirrors /voeding: wide page, title + subtitle, the meal-moment chip row,
 * the count row with Filters, then the recipe grid — same heights, so the
 * grid does not drop when the library arrives.
 */
export default function Loading() {
  return (
    <SkeletonPage back width="wide">
      <div className="flex flex-col gap-3">
        <div className="scroller-bleed flex gap-2">
          {MOMENT_WIDTHS.map((width, i) => (
            <Skeleton key={i} className={`h-11 shrink-0 rounded-full ${width}`} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-h-11 items-center">
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-card border border-line bg-surface">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="flex flex-col gap-1.5 p-4">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonPage>
  )
}
