"use client"

import { useLayoutEffect, useRef } from "react"
import Link from "next/link"
import { useMeasuredHeightVar } from "@/lib/hooks/use-measured-height-var"
import { useVisualViewportFrame } from "@/lib/hooks/use-visual-viewport-frame"

/**
 * Fixed header. Only tracks visualViewport.offsetTop while the soft keyboard
 * is open (Buddy) — otherwise stays at top:0 so rubber-band overscroll on
 * Vandaag cannot drag "Cyclus" around.
 */
export function MobileHeader() {
  const ref = useRef<HTMLElement>(null)
  const { offsetTop, keyboardOpen } = useVisualViewportFrame()
  useMeasuredHeightVar(ref, "--mobile-header-h")

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.top = keyboardOpen ? `${offsetTop}px` : "0px"
  }, [offsetTop, keyboardOpen])

  return (
    <header
      ref={ref}
      className="md:hidden fixed top-0 inset-x-0 z-20 flex items-center bg-cream/90 backdrop-blur border-b border-line/60 pb-4"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingLeft: "max(1.5rem, env(safe-area-inset-left))",
        paddingRight: "max(1.5rem, env(safe-area-inset-right))",
      }}
    >
      <Link
        href="/vandaag"
        className="font-display text-lg text-sage-dark rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Cyclus
      </Link>
    </header>
  )
}
