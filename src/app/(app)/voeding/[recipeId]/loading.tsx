import { Page } from "@/components/layout/page"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Mirrors the recipe page exactly (Page + PageHeader with the hero), so
 * the title does not jump when the recipe arrives: the hero has the same
 * 4:3 / 21:9 shape and 420px cap, then title, meta and the ingredients.
 */
export default function Loading() {
  return (
    <Page width="wide">
      <div role="status" aria-busy="true">
        <span className="sr-only">Even laden…</span>
        <div aria-hidden className="mb-6">
          <Skeleton className="mb-2 hidden h-11 w-24 rounded-full md:block" />
          <Skeleton className="mb-5 aspect-[4/3] max-h-105 w-full rounded-card lg:aspect-[21/9]" />
          {/* type-page-title line box: 32 × 1.1 ≈ 36px (lg: 36 × 1.1 ≈ 40px) */}
          <div className="flex h-9 items-center lg:h-10">
            <Skeleton className="h-8 w-3/4 max-w-md lg:h-9" />
          </div>
          <div className="mt-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-2/3 max-w-md" />
          </div>
          <Skeleton className="mt-4 h-4 w-56" />
        </div>
        <div aria-hidden className="grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-3 lg:col-span-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-72 w-full rounded-card" />
          </div>
          <div className="grid grid-cols-2 content-start gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    </Page>
  )
}
