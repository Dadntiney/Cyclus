"use client"

import { useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { APP_BAR_PRIORITY, useAppBarRegistration } from "@/components/nav/app-bar-context"
import { BackButton } from "@/components/ui/back-button"
import { isTabRoot, parentOf } from "@/lib/navigation/features"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  /** The h1 (one per page). A string also becomes the app-bar title and back label. */
  title: ReactNode
  /**
   * Short name for the app bar and the next screen's back label, when the
   * h1 is long or not a string ("Goedemiddag, Testa" → "Vandaag").
   */
  compactTitle?: string
  /** Small line above the title (`type-eyebrow`, sage-dark; pass a span to tint it). */
  eyebrow?: ReactNode
  /** One line under the title (15px ink-soft). `description` is an alias. */
  subtitle?: ReactNode
  /** Alias of `subtitle`. */
  description?: ReactNode
  /**
   * Fallback for "‹ Vorige" without history (deep link). Default: the
   * logical parent from features.ts. `false` = no back on this screen.
   * Shown in-flow on md+ only; on mobile it lives in the app bar.
   */
  back?: { href: string; label: string } | false
  /**
   * The one header action ("Favorieten", ⚙): in the app bar on mobile,
   * to the right of the h1 on md+. Give it a 44px target (IconButton or
   * textActionClass).
   */
  action?: ReactNode
  /**
   * An action that stays next to the h1 on every size (the recipe's
   * save-heart, besluit 12). Not moved to the app bar.
   */
  inlineAction?: ReactNode
  /** Page-level buttons under the subtitle ("Nacht toevoegen"). */
  actions?: ReactNode
  /** Media above the title (recipe hero, 4:3 `rounded-card`). */
  media?: ReactNode
  /** id on the h1, for aria-labelledby. */
  titleId?: string
  className?: string
}

/**
 * The one page header (ontwerpvisie §5.7, §5.4): md+ back (mb-2) → media
 * (mb-5) → eyebrow (mb-1) → h1 `type-page-title` with the action on md+ →
 * subtitle (mt-1) → 24px to the content (mb-6).
 *
 * It also tells the app bar what this screen is: title, back fallback and
 * action, and which element to watch for the compact title. The h1 has
 * tabIndex −1 so PageTransition can move focus to it after a push.
 *
 * Every page using it also exports `metadata = { title: "…" }` (or
 * `generateMetadata`) so the document title reads "<titel> · GoFiev".
 */
export function PageHeader({
  title,
  compactTitle,
  eyebrow,
  subtitle,
  description,
  back,
  action,
  inlineAction,
  actions,
  media,
  titleId,
  className,
}: PageHeaderProps) {
  const pathname = usePathname()
  const ref = useRef<HTMLHeadingElement>(null)
  const tabRoot = isTabRoot(pathname)
  const backFallback = back === false || tabRoot ? null : (back ?? parentOf(pathname))
  const name = compactTitle ?? (typeof title === "string" ? title : undefined)
  const lead = subtitle ?? description

  useAppBarRegistration(APP_BAR_PRIORITY.pageHeader, {
    title: name,
    titleRef: ref,
    back: back === false ? false : (backFallback ?? undefined),
    action,
  })

  return (
    <header className={cn("mb-6", className)}>
      {backFallback && <BackButton href={backFallback.href} label={backFallback.label} />}
      {media && <div className="mb-5">{media}</div>}
      {eyebrow && <p className="type-eyebrow mb-1 text-sage-dark">{eyebrow}</p>}
      <div className="flex items-start justify-between gap-3">
        <h1 ref={ref} id={titleId} tabIndex={-1} data-focus-target="" className="type-page-title min-w-0 text-ink">
          {title}
        </h1>
        {(inlineAction || action) && (
          // Centre a 44px control on the title's first line (36px; lg 40px).
          <div className="-my-1 flex shrink-0 items-center gap-1 lg:-my-0.5">
            {inlineAction}
            {action && <div className="hidden md:flex">{action}</div>}
          </div>
        )}
      </div>
      {lead && <p className="mt-1 text-sm text-ink-soft">{lead}</p>}
      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
