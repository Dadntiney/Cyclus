"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS } from "./nav-items"
import { logout } from "@/lib/actions/auth"

const navLinkFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-inset"

export function Sidebar({ name }: { name: string | null }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 xl:w-72 md:shrink-0 border-r border-line bg-white/60 px-4 py-6">
      <Link
        href="/vandaag"
        className="font-display text-xl text-sage-dark px-2 mb-8 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
      >
        Cyclus
      </Link>

      <nav className="flex-1">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    navLinkFocus,
                    active
                      ? "bg-sage-soft text-sage-dark"
                      : "text-ink-soft hover:bg-cream-soft hover:text-ink",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2.25 : 1.75} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-line pt-4 mt-4 flex flex-col gap-1">
        <Link
          href="/profiel"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            navLinkFocus,
            pathname === "/profiel"
              ? "bg-sage-soft text-sage-dark"
              : "text-ink-soft hover:bg-cream-soft hover:text-ink",
          )}
        >
          <User className="h-4.5 w-4.5" strokeWidth={1.75} />
          <span className="truncate">{name ?? "Profiel"}</span>
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-cream-soft hover:text-ink transition-colors",
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
