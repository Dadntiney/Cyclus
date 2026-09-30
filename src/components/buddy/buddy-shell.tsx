"use client"

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react"
import { useVisualViewportFrame } from "@/lib/hooks/use-visual-viewport-frame"

function readCssPx(varName: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Locks Buddy into the visible strip between MobileHeader and BottomNav /
 * soft keyboard. Only the message list scrolls.
 *
 * Sized from `visualViewport` (top + height). Document scroll is clamped so
 * Safari cannot yank the page under the fixed header.
 */
export function BuddyShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const lastNavH = useRef(82)
  const frame = useVisualViewportFrame()

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"

    const pinScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0)
      }
    }
    pinScroll()
    window.addEventListener("scroll", pinScroll, { passive: true })

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      window.removeEventListener("scroll", pinScroll)
    }
  }, [])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const headerH = readCssPx("--mobile-header-h", 77)
    const measuredNav = readCssPx("--bottom-nav-h", lastNavH.current)
    // When the tab bar collapses for the keyboard it publishes 0 — keep the
    // last real height so closing the keyboard does not leave the shell
    // covering the nav for a stuck frame (BuddyShell effects run before
    // BottomNav restores the CSS var).
    if (measuredNav > 0) lastNavH.current = measuredNav
    const navH = frame.keyboardOpen ? 0 : lastNavH.current
    // Header stays fixed at layout top:0. Pin the shell under it and end at
    // the bottom of the visual viewport so the composer clears the keyboard
    // without moving the Cyclus header during overscroll.
    const top = headerH
    const vvBottom = frame.offsetTop + frame.height
    const height = Math.max(0, vvBottom - headerH - navH)

    el.style.top = `${top}px`
    el.style.height = `${height}px`
    el.style.bottom = "auto"
  }, [frame.offsetTop, frame.height, frame.keyboardOpen])

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 z-10 flex flex-col bg-cream max-w-3xl mx-auto md:static md:inset-auto md:z-auto md:top-auto md:bottom-auto md:h-[calc(100dvh-2.5rem)]"
      style={{
        top: "var(--mobile-header-h, 77px)",
        bottom: "var(--bottom-nav-h, 82px)",
      }}
    >
      {children}
    </div>
  )
}
