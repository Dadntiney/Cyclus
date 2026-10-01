"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { hasNavigatedInApp } from "@/lib/client/navigation-depth"
import { cn } from "@/lib/utils"

/**
 * The back link used at the top of every sub-page. Label reads as the
 * logical parent page's name (matching how this app — and iOS — already
 * shows the previous screen's title next to the chevron, which reads
 * better than a generic "Terug"), but the actual navigation prefers real
 * browser history: several of these sub-pages are reachable from more than
 * one place (a workout from Vandaag, Deze week, Beweging, or Profiel's
 * favorites, say), so a hardcoded href would silently be wrong for every
 * path except the one it was written for. `href` is only the fallback for
 * when there's no in-app history to go back to (a fresh page load or a
 * direct link) — a real `<Link>` under the hood so it still works with
 * JS disabled or a middle-click/open-in-new-tab.
 */
export function BackButton({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) {
  const router = useRouter()

  return (
    <Link
      href={href}
      transitionTypes={["nav-back"]}
      onClick={(e) => {
        if (hasNavigatedInApp()) {
          e.preventDefault()
          router.back()
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft -ml-2 mb-2 px-2 py-2.5 min-h-11 rounded-lg touch-manipulation transition-colors active:bg-cream-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
        className,
      )}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {label}
    </Link>
  )
}
