import { Skeleton, SkeletonPage } from "@/components/ui/skeleton"

/** Mirrors Jouw fase: eyebrow, h1 and the phase line, then flat reading sections. */
export default function Loading() {
  return (
    <SkeletonPage back eyebrow>
      <div className="flex max-w-prose flex-col gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <div className="type-section-title mb-1 flex items-center">
              <span className="invisible w-0">&nbsp;</span>
              <Skeleton className="h-[0.8em] w-56 max-w-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </SkeletonPage>
  )
}
