"use client"

import { useEffect, type ReactNode } from "react"
import { useKeyboardInsetVar } from "@/lib/hooks/use-keyboard-inset-var"

/**
 * Locks Buddy into the viewport strip between MobileHeader and BottomNav.
 * Only the message list scrolls — title and composer stay put. Without this,
 * main's bottom-nav padding + a full-viewport chat height made the whole
 * page (title + input) scroll together, which feels broken in a chat.
 *
 * `--bottom-nav-h` collapses to 0 while a text field is focused (see
 * BottomNav). `--keyboard-inset` lifts the shell above the soft keyboard on
 * iOS, where the layout viewport often does not shrink — so the composer
 * stays visible without scrolling the Cyclus header away.
 */
export function BuddyShell({ children }: { children: ReactNode }) {
  useKeyboardInsetVar()

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
    window.visualViewport?.addEventListener("resize", pinScroll)
    window.visualViewport?.addEventListener("scroll", pinScroll)
    window.addEventListener("focusout", pinScroll)

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      window.removeEventListener("scroll", pinScroll)
      window.visualViewport?.removeEventListener("resize", pinScroll)
      window.visualViewport?.removeEventListener("scroll", pinScroll)
      window.removeEventListener("focusout", pinScroll)
    }
  }, [])

  return (
    <div
      className="fixed inset-x-0 z-10 flex flex-col bg-cream max-w-3xl mx-auto md:static md:inset-auto md:z-auto md:h-[calc(100dvh-2.5rem)]"
      style={{
        top: "var(--mobile-header-h, 77px)",
        // Prefer the larger of tab-bar clearance and keyboard coverage.
        bottom: "max(var(--bottom-nav-h, 82px), var(--keyboard-inset, 0px))",
      }}
    >
      {children}
    </div>
  )
}
