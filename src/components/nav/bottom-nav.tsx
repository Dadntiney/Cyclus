"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useLinkStatus } from "next/link"
import { cn } from "@/lib/utils"
import { ICON } from "@/lib/ui/icon"
import { useImmersiveActive } from "@/lib/hooks/use-immersive"
import { useMeasuredHeightVar } from "@/lib/hooks/use-measured-height-var"
import { useVisualViewportFrame } from "@/lib/hooks/use-visual-viewport-frame"
import { useActiveTab } from "@/lib/navigation/hooks"
import { NAV_ITEMS } from "./nav-items"

function NavPendingHint() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-5 bottom-1 h-0.5 rounded-full bg-sage/70",
        "opacity-0 transition-opacity duration-fast ease-standard",
        pending && "opacity-100 motion-safe:animate-pulse",
      )}
    />
  )
}

/**
 * The tab bar. Always `fixed bottom-0` — never synced to visualViewport top/height.
 *
 * Active tab = the tab she is in (tab of origin, from the navigation
 * store), not the canonical owner of the route: a recipe opened from
 * Vandaag keeps Vandaag lit. On the server and during hydration it is the
 * owner of the route. A press lights the tab immediately (optimistic), like
 * a native tab bar, before the route commits.
 *
 * Steps aside (slides down, `--bottom-nav-h` = 0) while the soft keyboard
 * is open and in immersive mode (training, listening, medication wizard).
 */
export function BottomNav({ avatarUrl }: { avatarUrl: string | null }) {
  const pathname = usePathname()
  const ref = useRef<HTMLElement>(null)
  const { keyboardOpen } = useVisualViewportFrame()
  const immersive = useImmersiveActive()
  const hidden = keyboardOpen || immersive
  useMeasuredHeightVar(ref, "--bottom-nav-h", hidden)
  const activeTab = useActiveTab(pathname)
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null)
  const [pathForOptimistic, setPathForOptimistic] = useState(pathname)
  if (pathname !== pathForOptimistic) {
    setPathForOptimistic(pathname)
    if (optimisticHref != null) setOptimisticHref(null)
  }

  const displayTab = optimisticHref ?? activeTab

  return (
    <nav
      ref={ref}
      aria-label="Hoofdnavigatie"
      aria-hidden={hidden || undefined}
      inert={hidden}
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-line safe-bottom safe-x",
        "transition-transform duration-base ease-enter motion-reduce:transition-none",
        hidden && "translate-y-full pointer-events-none",
      )}
    >
      <ul className="flex items-stretch justify-between px-2">
        {NAV_ITEMS.map((item) => {
          const { href, label, icon: Icon } = item
          const active = displayTab === href
          const isProfile = href === "/profiel"
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                aria-current={active ? "page" : undefined}
                onClick={() => setOptimisticHref(href)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 pt-3 pb-2.5 min-h-14 rounded-inset text-xs font-medium touch-manipulation -outline-offset-2",
                  "transition-[color,transform] duration-fast ease-standard motion-safe:active:scale-[0.97]",
                  active ? "text-sage-dark font-semibold" : "text-ink-soft",
                )}
              >
                {/* Ritme: a short eucalyptus stroke above the active tab — no pill. */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 left-1/2 -translate-x-1/2 h-0.75 w-6 rounded-b-full bg-sage-dark transition-opacity duration-fast",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="flex items-center justify-center h-7 w-9">
                  {isProfile && avatarUrl ? (
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full overflow-hidden shrink-0",
                        active && "ring-2 ring-sage-dark ring-offset-1 ring-offset-surface",
                      )}
                    >
                      <Image src={avatarUrl} alt="" width={20} height={20} className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <Icon {...ICON.md} aria-hidden />
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
