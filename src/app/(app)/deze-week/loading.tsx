import { Skeleton, SkeletonPage } from "@/components/ui/skeleton"

/** Mirrors /deze-week: header, the 7-day strip, the day heading and the plan card. */
export default function Loading() {
  return (
    <SkeletonPage back>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-17 w-full" />
          ))}
        </div>
        <div>
          <div className="type-card-title mb-1 flex items-center gap-2">
            <span className="invisible w-0">&nbsp;</span>
            <Skeleton className="h-[0.9em] w-36" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-3/4" />
          <div className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex min-h-18 items-center gap-3 px-4 py-3">
                <Skeleton className="h-14 w-14 shrink-0" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonPage>
  )
}
