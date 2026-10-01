"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useLinkStatus } from "next/link"
import { cn } from "@/lib/utils"
import { useMeasuredHeightVar } from "@/lib/hooks/use-measured-height-var"
import { useVisualViewportFrame } from "@/lib/hooks/use-visual-viewport-frame"
import { NAV_ITEMS } from "./nav-items"

function NavPendingHint() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-sage/70",
        "opacity-0 transition-opacity duration-150",
        pending && "opacity-100 motion-safe:animate-pulse",
      )}
    />
  )
}

/**
 * Always `fixed bottom-0` — never synced to visualViewport top/height.
 * Optimistic active tab on press so the bar reacts like a native tab bar
 * before the RSC route commits.
 */
export function BottomNav({ avatarUrl }: { avatarUrl: string | null }) {
  const pathname = usePathname()
  const ref = useRef<HTMLElement>(null)
  const { keyboardOpen } = useVisualViewportFrame()
  useMeasuredHeightVar(ref, "--bottom-nav-h", keyboardOpen)
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null)

  useEffect(() => {
    setOptimisticHref(null)
  }, [pathname])

  const displayPath = optimisticHref ?? pathname

  return (
    <nav
      ref={ref}
      aria-label="Hoofdnavigatie"
      aria-hidden={keyboardOpen || undefined}
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-line safe-bottom safe-x",
        "transition-transform duration-200 ease-out motion-reduce:transition-none",
        keyboardOpen && "translate-y-full pointer-events-none",
      )}
    >
      <ul className="flex items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = displayPath === href || displayPath.startsWith(`${href}/`)
          const isProfile = href === "/profiel"
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                aria-current={active ? "page" : undefined}
                onClick={() => setOptimisticHref(href)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2.5 min-h-[52px] text-xs font-medium touch-manipulation transition-[color,transform,background-color] duration-150 motion-safe:active:scale-[0.94]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-inset",
                  active ? "text-sage-dark" : "text-ink-soft",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center h-7 w-9 rounded-full transition-colors duration-150",
                    active && "bg-sage-soft",
                  )}
                >
                  {isProfile && avatarUrl ? (
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full overflow-hidden shrink-0",
                        active && "ring-2 ring-white",
                      )}
                    >
                      <Image src={avatarUrl} alt="" width={20} height={20} className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                  )}
                </span>
                {label}
                <NavPendingHint />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
