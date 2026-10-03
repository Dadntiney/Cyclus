import { Skeleton } from "@/components/ui/skeleton"

/** Mirrors the Profiel hub: 64px photo + name, then three row groups. */
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-2xl px-5 pt-4 pb-8 lg:px-8 lg:pt-10">
      <span className="sr-only">Even laden…</span>
      <div aria-hidden className="mb-6 flex items-center gap-4">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-8 w-40 max-w-full" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
      </div>
      <div aria-hidden className="flex flex-col gap-8">
        {[3, 6, 2].map((rows, group) => (
          <div key={group} className="flex flex-col">
            <Skeleton className="mb-2 ml-1 h-4 w-24" />
            <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex min-h-14 items-center gap-3.5 px-4 py-3">
                  <Skeleton className="h-9 w-9 shrink-0" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
