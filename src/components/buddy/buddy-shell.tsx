"use client"

import { useEffect, type ReactNode } from "react"

/**
 * Locks Buddy into the viewport strip between MobileHeader and BottomNav.
 * Only the message list scrolls — title and composer stay put. Without this,
 * main's bottom-nav padding + a full-viewport chat height made the whole
 * page (title + input) scroll together, which feels broken in a chat.
 */
export function BuddyShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  return (
    <div
      className="fixed inset-x-0 z-10 flex flex-col bg-cream max-w-3xl mx-auto md:static md:inset-auto md:z-auto md:h-[calc(100dvh-2.5rem)]"
      style={{
        top: "var(--mobile-header-h, 77px)",
        bottom: "var(--bottom-nav-h, 82px)",
      }}
    >
      {children}
    </div>
  )
}
