import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { textActionClass } from "@/components/ui/button"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: ReactNode
  /** h2 (default) for a page section · h3 for a sub-section inside one. */
  as?: "h2" | "h3"
  /** id on the heading, for anchors (#jouw-verhaal) and aria-labelledby. */
  id?: string
  description?: ReactNode
  /** One text action on the right, e.g. <SectionAction href="/deze-week">Hele week</SectionAction>. */
  action?: ReactNode
  className?: string
}

/**
 * Section title + optional one-line description + one action on the right.
 * Spacing is built in (content starts 12px below: mb-3), so the section
 * stack only needs `gap-8` between sections.
 */
export function SectionHeader({ title, as: Heading = "h2", id, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-3 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <Heading
          id={id}
          className={cn(Heading === "h2" ? "type-section-title" : "type-card-title", "scroll-mt-4")}
        >
          {title}
        </Heading>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action && (
        // Centre a 44px action on the title's first line (30px for h2, 26px for h3).
        <div className={cn("shrink-0", Heading === "h2" ? "-my-1.75" : "-my-2.25")}>{action}</div>
      )}
    </div>
  )
}

interface SectionActionProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  /** Show the trailing chevron (default true): "Hele week ›". */
  chevron?: boolean
}

/** The text action for a SectionHeader: 15/600 sage-dark with a 16px chevron. */
export function SectionAction({ children, href, onClick, className, chevron = true }: SectionActionProps) {
  const content = (
    <>
      {children}
      {chevron && <ChevronRight {...ICON.sm} aria-hidden />}
    </>
  )
  if (href) {
    return (
      <Link href={href} className={textActionClass(className)}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className={textActionClass(className)}>
      {content}
    </button>
  )
}
