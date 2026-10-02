"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useLinkStatus } from "next/link"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "./nav-items"
import { logout } from "@/lib/actions/auth"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"
import { DropletMark } from "@/components/brand/droplet-mark"

const navLinkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-inset"

function NavPendingHint() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "ml-auto h-1.5 w-1.5 rounded-full bg-sage shrink-0",
        "opacity-0 transition-opacity duration-150",
        pending && "opacity-70 motion-safe:animate-pulse",
      )}
    />
  )
}

export function Sidebar({ avatarUrl }: { avatarUrl: string | null }) {
  const pathname = usePathname()
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null)
  const [pathForOptimistic, setPathForOptimistic] = useState(pathname)
  if (pathname !== pathForOptimistic) {
    setPathForOptimistic(pathname)
    if (optimisticHref != null) setOptimisticHref(null)
  }

  const displayPath = optimisticHref ?? pathname

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-64 xl:w-72 md:shrink-0 border-r border-line bg-surface px-5 py-8"
    >
      <Link
        href="/vandaag"
        prefetch
        className="inline-flex items-center gap-2.5 font-display text-2xl text-ink px-2 mb-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
      >
        <DropletMark className="h-[22px] w-[18px]" />
        {APP_DISPLAY_NAME}
      </Link>

      <nav className="flex-1" aria-label="Hoofdnavigatie">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = displayPath === href || displayPath.startsWith(`${href}/`)
            const isProfile = href === "/profiel"
            return (
              <li key={href}>
                <Link
                  href={href}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOptimisticHref(href)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-full px-4 py-3 text-base font-medium transition-colors duration-150",
                    navLinkFocus,
                    active
                      ? "bg-sage-soft text-sage-darker font-semibold"
                      : "text-ink-soft hover:bg-cream-soft hover:text-ink",
                  )}
                >
                  {isProfile && avatarUrl ? (
                    <span className="h-4.5 w-4.5 rounded-full overflow-hidden shrink-0">
                      <Image src={avatarUrl} alt="" width={18} height={18} className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2.25 : 1.75} />
                  )}
                  {label}
                  <NavPendingHint />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-line pt-4 mt-4 flex flex-col gap-1">
        <form action={logout}>
          <button
            type="submit"
            className={cn(
              "w-full flex items-center gap-3 rounded-full px-4 py-3 text-base font-medium text-ink-soft hover:bg-cream-soft hover:text-ink transition-colors",
              navLinkFocus,
            )}
          >
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.75} />
            Uitloggen
          </button>
        </form>
      </div>
    </aside>
  )
}
