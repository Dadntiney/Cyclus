"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useLinkStatus } from "next/link"
import { cn } from "@/lib/utils"
import { ICON } from "@/lib/ui/icon"
import { useImmersiveActive } from "@/lib/hooks/use-immersive"
import { useActiveTab } from "@/lib/navigation/hooks"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"
import { DropletMark } from "@/components/brand/droplet-mark"
import { NAV_ITEMS } from "./nav-items"

function NavPendingHint() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "ml-auto h-1.5 w-1.5 rounded-full bg-sage shrink-0",
        "opacity-0 transition-opacity duration-fast ease-standard",
        pending && "opacity-70 motion-safe:animate-pulse",
      )}
    />
  )
}

/**
 * Desktop navigation (md+). Stays in view while the page scrolls (sticky,
 * full viewport height — NAV-7). The active item follows the tab she is in,
 * like the tab bar. Uitloggen lives in Profiel → Account, not here
 * (one place per thing). Hidden in immersive mode.
 */
export function Sidebar({ avatarUrl }: { avatarUrl: string | null }) {
  const pathname = usePathname()
  const immersive = useImmersiveActive()
  const activeTab = useActiveTab(pathname)
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null)
  const [pathForOptimistic, setPathForOptimistic] = useState(pathname)
  if (pathname !== pathForOptimistic) {
    setPathForOptimistic(pathname)
    if (optimisticHref != null) setOptimisticHref(null)
  }

  const displayTab = optimisticHref ?? activeTab

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col md:w-64 xl:w-72 md:shrink-0 border-r border-line bg-surface px-5 py-8",
        "md:sticky md:top-0 md:self-start md:h-dvh md:overflow-y-auto",
        immersive && "md:hidden",
      )}
    >
      <Link
        href="/vandaag"
        prefetch
        className="inline-flex items-center gap-2.5 font-display text-2xl text-ink px-2 mb-10 rounded-inset"
      >
        <DropletMark className="h-5.5 w-4.5" />
        {APP_DISPLAY_NAME}
      </Link>

      <nav className="flex-1" aria-label="Hoofdnavigatie">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const { href, label, icon: Icon } = item
            const active = displayTab === href
            const isProfile = href === "/profiel"
            return (
              <li key={href}>
                <Link
                  href={href}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOptimisticHref(href)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-full px-4 py-3 text-base font-medium",
                    "transition-[color,background-color,transform] duration-fast ease-standard motion-safe:active:scale-[0.97]",
                    active
                      ? "bg-sage-soft text-sage-darker font-semibold"
                      : "text-ink-soft hover:bg-cream-soft hover:text-ink",
                  )}
                >
                  {isProfile && avatarUrl ? (
                    <span className="h-5 w-5 rounded-full overflow-hidden shrink-0">
                      <Image src={avatarUrl} alt="" width={20} height={20} className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <Icon {...ICON.md} aria-hidden />
                  )}
                  {label}
                  <NavPendingHint />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
