"use client"

import { useRef, useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

const PULL_THRESHOLD = 64
const MAX_PULL = 96
const RESISTANCE = 0.5

function isNearTop(target: EventTarget | null): boolean {
  if (typeof window === "undefined") return false
  if (window.scrollY > 1) return false

  let el: Element | null = target instanceof Element ? target : null
  while (el && el !== document.documentElement) {
    const style = window.getComputedStyle(el)
    const oy = style.overflowY
    const scrollable =
      (oy === "auto" || oy === "scroll" || oy === "overlay") && el.scrollHeight > el.clientHeight + 1
    if (scrollable && el.scrollTop > 1) return false
    el = el.parentElement
  }
  return true
}

function isNearBottom(target: EventTarget | null): boolean {
  if (typeof window === "undefined") return false

  let el: Element | null = target instanceof Element ? target : null
  let sawNested = false
  while (el && el !== document.documentElement) {
    const style = window.getComputedStyle(el)
    const oy = style.overflowY
    const scrollable =
      (oy === "auto" || oy === "scroll" || oy === "overlay") && el.scrollHeight > el.clientHeight + 1
    if (scrollable) {
      sawNested = true
      const remaining = el.scrollHeight - el.clientHeight - el.scrollTop
      if (remaining > 1) return false
    }
    el = el.parentElement
  }

  if (sawNested) return true

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  return maxScroll <= 1 || window.scrollY >= maxScroll - 1
}

/**
 * Native-style pull-to-refresh + light elastic give at the bottom.
 * Top pull past the threshold runs router.refresh() (real RSC refetch).
 * Nested scroll areas (Buddy chat, etc.) are respected — no hijack mid-list.
 */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pull, setPull] = useState(0)
  const [bottomPull, setBottomPull] = useState(0)
  const startY = useRef<number | null>(null)
  const mode = useRef<"none" | "top" | "bottom">("none")

  function handleTouchStart(e: React.TouchEvent) {
    if (isPending) {
      mode.current = "none"
      return
    }
    startY.current = e.touches[0].clientY
    if (isNearTop(e.target)) {
      mode.current = "top"
    } else if (isNearBottom(e.target)) {
      mode.current = "bottom"
    } else {
      mode.current = "none"
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (mode.current === "none" || startY.current === null || isPending) return
    const delta = e.touches[0].clientY - startY.current

    if (mode.current === "top") {
      if (delta <= 0 || !isNearTop(e.target)) {
        mode.current = "none"
        setPull(0)
        return
      }
      setPull(Math.min(delta * RESISTANCE, MAX_PULL))
      return
    }

    // bottom: finger moves up → negative delta → elastic give
    if (delta >= 0 || !isNearBottom(e.target)) {
      mode.current = "none"
      setBottomPull(0)
      return
    }
    setBottomPull(Math.min(-delta * RESISTANCE, MAX_PULL * 0.55))
  }

  function handleTouchEnd() {
    if (mode.current === "top") {
      const shouldRefresh = pull >= PULL_THRESHOLD
      mode.current = "none"
      startY.current = null
      setPull(0)
      if (shouldRefresh) {
        startTransition(() => {
          router.refresh()
        })
      }
      return
    }
    mode.current = "none"
    startY.current = null
    setBottomPull(0)
  }

  const displayHeight = isPending ? PULL_THRESHOLD : pull

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden motion-safe:transition-[height] motion-safe:duration-200 motion-safe:ease-out"
        style={{ height: displayHeight }}
        aria-hidden={displayHeight === 0}
      >
        <RefreshCw
          className={cn("h-5 w-5 text-sage-dark", isPending && "motion-safe:animate-spin")}
          strokeWidth={2}
          style={!isPending ? { transform: `rotate(${(pull / PULL_THRESHOLD) * 360}deg)` } : undefined}
        />
      </div>
      {children}
      <div
        className="overflow-hidden motion-safe:transition-[height] motion-safe:duration-200 motion-safe:ease-out"
        style={{ height: bottomPull }}
        aria-hidden
      />
    </div>
  )
}
