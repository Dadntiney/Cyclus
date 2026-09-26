"use client"

import { useRef, useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const PULL_THRESHOLD = 64
const MAX_PULL = 96
const RESISTANCE = 0.5

/**
 * Native-style pull-to-refresh. Only engages when the page is already
 * scrolled to the very top and the gesture is a downward pull — it never
 * hijacks a normal scroll or an upward pull mid-page. The spinner tracks
 * real Server Component refetch completion (via useTransition around
 * router.refresh()), not a guessed timeout.
 */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pull, setPull] = useState(0)
  const startY = useRef<number | null>(null)
  const gestureActive = useRef(false)

  function handleTouchStart(e: React.TouchEvent) {
    if (isPending || window.scrollY > 0) {
      gestureActive.current = false
      return
    }
    startY.current = e.touches[0].clientY
    gestureActive.current = true
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!gestureActive.current || startY.current === null || isPending) return
    const delta = e.touches[0].clientY - startY.current
    if (delta <= 0 || window.scrollY > 0) {
      gestureActive.current = false
      setPull(0)
      return
    }
    setPull(Math.min(delta * RESISTANCE, MAX_PULL))
  }

  function handleTouchEnd() {
    if (!gestureActive.current) return
    gestureActive.current = false
    const shouldRefresh = pull >= PULL_THRESHOLD
    startY.current = null
    setPull(0)
    if (shouldRefresh) {
      startTransition(() => {
        router.refresh()
      })
    }
  }

  const displayHeight = isPending ? PULL_THRESHOLD : pull

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden motion-safe:transition-[height] motion-safe:duration-200 motion-safe:ease-out"
        style={{ height: displayHeight }}
      >
        <RefreshCw
          className={cn("h-5 w-5 text-sage-dark", isPending && "motion-safe:animate-spin")}
          strokeWidth={2}
          style={!isPending ? { transform: `rotate(${(pull / PULL_THRESHOLD) * 360}deg)` } : undefined}
        />
      </div>
      {children}
    </div>
  )
}
