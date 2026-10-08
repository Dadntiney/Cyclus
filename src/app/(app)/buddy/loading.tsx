import { Skeleton } from "@/components/ui/skeleton"

/**
 * Buddy answers at once, like the other tab roots: a few quiet bubbles
 * where the conversation will be. No heading skeleton — on mobile the app
 * bar already carries the title, so nothing jumps when the chat arrives.
 */
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-2xl px-5 pt-4 pb-8 lg:px-8 lg:pt-10">
      <span className="sr-only">Even laden…</span>
      <div aria-hidden className="flex flex-col gap-3">
        <Skeleton className="h-20 w-3/4 rounded-card" />
        <Skeleton className="h-11 w-1/2 self-end rounded-card" />
        <Skeleton className="h-16 w-2/3 rounded-card" />
      </div>
    </div>
  )
}
