import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageWidth = "content" | "wide"

const WIDTH: Record<PageWidth, string> = {
  /** One column: reading, settings, lists. */
  content: "max-w-2xl",
  /** Libraries and two-column xl layouts (Voeding grid, recipe, Vandaag/Cyclus). */
  wide: "max-w-6xl",
}

/**
 * The page container (ontwerpvisie §5.4): gutter 20px (lg 32px), 16px under
 * the app bar (lg 40px), 32px to the tab bar. Mirrors SkeletonPage, so a
 * loading.tsx and its page line up exactly.
 *
 * ```tsx
 * <Page>
 *   <PageHeader title="Slaap" subtitle="…" />
 *   <PageSections>…</PageSections>
 * </Page>
 * ```
 */
export function Page({
  width = "content",
  as: Tag = "div",
  className,
  children,
}: {
  width?: PageWidth
  as?: "div" | "article"
  className?: string
  children: ReactNode
}) {
  return (
    <Tag className={cn("mx-auto w-full px-5 pt-4 pb-8 lg:px-8 lg:pt-10", WIDTH[width], className)}>
      {children}
    </Tag>
  )
}

/** The section stack under a PageHeader: 32px between sections (`gap-8`). */
export function PageSections({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col gap-8", className)}>{children}</div>
}
