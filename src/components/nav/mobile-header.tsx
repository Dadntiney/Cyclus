"use client"

import { useRef } from "react"
import Link from "next/link"
import { useMeasuredHeightVar } from "@/lib/hooks/use-measured-height-var"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"

/**
 * Always `fixed top-0`. Do not sync to visualViewport — rubber-band
 * overscroll was dragging the brand header down the screen. Buddy keyboard
 * layout is owned by BuddyShell; the header stays a stable layout-top anchor.
 *
 * Fully opaque cream + solid logo — no /alpha, blur, or soft sage that
 * reads as a fade when page content scrolls underneath on iOS PWA.
 */
export function MobileHeader() {
  const ref = useRef<HTMLElement>(null)
  useMeasuredHeightVar(ref, "--mobile-header-h")

  return (
    <header
      ref={ref}
      className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center border-b border-line pb-4"
      style={{
        // Explicit opaque fill (not utility opacity) + own compositing layer
        // so scrolled cards cannot blend through on iOS.
        backgroundColor: "var(--color-cream)",
        opacity: 1,
        isolation: "isolate",
        transform: "translateZ(0)",
        viewTransitionName: "app-mobile-header",
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
        paddingRight: "max(1.5rem, env(safe-area-inset-right))",
      }}
    >
      <Link
        href="/vandaag"
        className="font-display text-lg font-medium text-ink rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        style={{ color: "var(--color-ink)", opacity: 1 }}
      >
        {APP_DISPLAY_NAME}
      </Link>
    </header>
  )
}
