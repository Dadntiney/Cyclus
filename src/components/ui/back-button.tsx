"use client"

import { usePathname } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { APP_BAR_PRIORITY, useAppBarRegistration, useHasAppBar } from "@/components/nav/app-bar-context"
import { BackLink } from "@/components/nav/back-link"
import { useBackTarget } from "@/lib/navigation/hooks"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

/**
 * "‹ Vorige" for a sub-page. The label tells the truth: it names the screen
 * she actually came from (router.back()), and `href`/`label` are only the
 * fallback for when there is no in-app history (a deep link or a fresh
 * load) — then the current screen is *replaced* by that parent.
 *
 * Inside the app shell the control lives in the mobile app bar: this
 * component registers its fallback there and renders in the page flow only
 * from md up. Outside the shell (no app bar) it renders on every size.
 * New pages use <PageHeader back={…}>, which does this for them.
 */
export function BackButton({
  href,
  label,
  className,
}: {
  /** Fallback destination without history (the logical parent). */
  href: string
  /** Name of that fallback destination. */
  label: string
  className?: string
}) {
  const pathname = usePathname()
  const hasAppBar = useHasAppBar()
  useAppBarRegistration(APP_BAR_PRIORITY.backButton, { back: { href, label } })
  const target = useBackTarget(pathname, { href, label }) ?? { mode: "link" as const, href, label }

  return (
    <BackLink
      target={target}
      className={cn(
        "items-center gap-1 text-sm font-medium text-sage-dark -ml-2 mb-2 px-2 py-2.5 min-h-11 rounded-inset transition-colors duration-fast active:bg-cream-soft",
        hasAppBar ? "hidden md:inline-flex" : "inline-flex",
        className,
      )}
    >
      <ChevronLeft {...ICON.sm} aria-hidden />
      {target.label}
    </BackLink>
  )
}
