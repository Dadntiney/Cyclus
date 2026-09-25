import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-2xl", className)} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white border border-line/70 shadow-[0_2px_16px_rgba(44,42,38,0.05)] p-5 flex flex-col gap-3",
        className,
      )}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3.5 w-1/3" />
    </div>
  )
}

export function SkeletonPage({ cards = 3 }: { cards?: number }) {
  return (
    <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2 mb-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
