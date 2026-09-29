"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { href: "/profiel", label: "Overzicht", exact: true },
  { href: "/profiel/account", label: "Account" },
  { href: "/profiel/modules", label: "Modules" },
  { href: "/profiel/cyclus", label: "Cyclus" },
  { href: "/profiel/meldingen", label: "Meldingen" },
] as const

export function ProfileSectionNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Profielsecties" className="-mx-1">
      <ul className="flex gap-2 overflow-x-auto px-1 pb-1 safe-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((section) => {
          const active = "exact" in section && section.exact
            ? pathname === section.href
            : pathname === section.href || pathname.startsWith(`${section.href}/`)
          return (
            <li key={section.href} className="shrink-0">
              <Link
                href={section.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center min-h-11 px-3.5 rounded-full border text-sm font-medium touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
                  active
                    ? "border-sage bg-sage-soft text-sage-dark"
                    : "border-line bg-surface text-ink-soft",
                )}
              >
                {section.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
