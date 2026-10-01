"use client"

import { useEffect, useRef, useTransition, type ReactNode } from "react"
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
 * Gesture distance is driven via refs (no React re-render per touchmove).
 */
export function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const startY = useRef<number | null>(null)
  const mode = useRef<"none" | "top" | "bottom">("none")
  const pullRef = useRef(0)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const iconWrapRef = useRef<HTMLSpanElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const wasPending = useRef(false)

  function paintTop(pull: number) {
    pullRef.current = pull
    if (indicatorRef.current) indicatorRef.current.style.height = `${pull}px`
    if (iconWrapRef.current && !isPending) {
      iconWrapRef.current.style.transform = `rotate(${(pull / PULL_THRESHOLD) * 360}deg)`
    }
  }

  function paintBottom(pull: number) {
    if (bottomRef.current) bottomRef.current.style.height = `${pull}px`
  }

  useEffect(() => {
    if (wasPending.current && !isPending) {
      paintTop(0)
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
        paintTop(0)
        return
      }
      paintTop(Math.min(delta * RESISTANCE, MAX_PULL))
      return
    }

    if (delta >= 0 || !isNearBottom(e.target)) {
      mode.current = "none"
      paintBottom(0)
      return
    }
    paintBottom(Math.min(-delta * RESISTANCE, MAX_PULL * 0.55))
  }

  function handleTouchEnd() {
    if (mode.current === "top") {
      const shouldRefresh = pullRef.current >= PULL_THRESHOLD
      mode.current = "none"
      startY.current = null
      if (shouldRefresh) {
        paintTop(PULL_THRESHOLD)
        startTransition(() => {
          router.refresh()
        })
      } else {
        paintTop(0)
      }
      return
    }
    mode.current = "none"
    startY.current = null
    paintBottom(0)
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
          <RefreshCw
            className={cn("h-5 w-5 text-sage-dark", isPending && "motion-safe:animate-spin")}
            strokeWidth={2}
          />
        </span>
      </div>
      {children}
      <div ref={bottomRef} className="overflow-hidden will-change-[height]" style={{ height: 0 }} aria-hidden />
    </div>
  )
}
