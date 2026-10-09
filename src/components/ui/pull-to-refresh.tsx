"use client"

import { useEffect, useRef, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { prefersReducedMotion } from "@/lib/ui/focus"
import { iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

const PULL_THRESHOLD = 64
const MAX_PULL = 96
const RESISTANCE = 0.5

function isNearTop(target: EventTarget | null): boolean {
  if (typeof window === "undefined") return false
  if (window.scrollY > 1) return false

  let el: Element | null = target instanceof Element ? target : null
  // Screens with their own scroll model (Buddy chat) opt out entirely.
  if (el?.closest("[data-no-pull-refresh]")) return false
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

/**
 * Native-style pull-to-refresh. Gesture distance is driven via refs (no React
 * re-render per touchmove). Never calls preventDefault, so the browser's own
 * elastic edge (globals.css `overscroll-behavior-y: contain`) keeps working
 * at the top and bottom; this only adds the refresh indicator on top of it.
 */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const startY = useRef<number | null>(null)
  const mode = useRef<"none" | "top">("none")
  const pullRef = useRef(0)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const iconWrapRef = useRef<HTMLSpanElement>(null)
  const wasPending = useRef(false)

  function paintTop(pull: number, settle = false) {
    pullRef.current = pull
    if (indicatorRef.current) {
      // Follow the finger 1:1 while dragging; ease back on release so the
      // indicator settles together with the native bounce instead of snapping
      // (instantly under reduced motion).
      indicatorRef.current.style.transition =
        settle && !prefersReducedMotion() ? "height var(--duration-base) var(--ease-standard)" : "none"
      indicatorRef.current.style.height = `${pull}px`
    }
    if (iconWrapRef.current && !isPending) {
      iconWrapRef.current.style.transform = `rotate(${(pull / PULL_THRESHOLD) * 360}deg)`
    }
  }

  useEffect(() => {
    if (wasPending.current && !isPending) {
      // Reset inline (not via paintTop) so the effect only depends on isPending.
      pullRef.current = 0
      if (indicatorRef.current) indicatorRef.current.style.height = "0px"
      if (iconWrapRef.current) iconWrapRef.current.style.transform = ""
    }
    wasPending.current = isPending
    if (isPending && indicatorRef.current) {
      indicatorRef.current.style.height = `${PULL_THRESHOLD}px`
    }
  }, [isPending])

  function handleTouchStart(e: React.TouchEvent) {
    if (isPending) {
      mode.current = "none"
      return
    }
    startY.current = e.touches[0].clientY
    mode.current = isNearTop(e.target) ? "top" : "none"
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (mode.current === "none" || startY.current === null || isPending) return
    const delta = e.touches[0].clientY - startY.current

    if (delta <= 0 || !isNearTop(e.target)) {
      mode.current = "none"
      paintTop(0, true)
      return
    }
    paintTop(Math.min(delta * RESISTANCE, MAX_PULL))
  }

  function handleTouchEnd() {
    if (mode.current === "top") {
      const shouldRefresh = pullRef.current >= PULL_THRESHOLD
      mode.current = "none"
      startY.current = null
      if (shouldRefresh) {
        paintTop(PULL_THRESHOLD, true)
        startTransition(() => {
          router.refresh()
        })
      } else {
        paintTop(0, true)
      }
      return
    }
    mode.current = "none"
    startY.current = null
  }

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        ref={indicatorRef}
        className="flex items-center justify-center overflow-hidden will-change-[height]"
        style={{ height: 0 }}
        aria-hidden
      >
        <span ref={iconWrapRef} className="inline-flex">
          <RefreshCw {...iconProps("md", cn("text-sage-dark", isPending && "motion-safe:animate-spin"))} aria-hidden />
        </span>
      </div>
      {children}
    </div>
  )
}
