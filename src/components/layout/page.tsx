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
  fill = false,
  className,
  children,
}: {
  width?: PageWidth
  as?: "div" | "article"
  /**
   * A step in an immersive flow (wizard): at least as tall as the screen
   * under the app bar, as a flex column, so the StickyActionBar (last child,
   * `mt-auto`) rests at the bottom on a short step instead of right under
   * the content — the main button stays in the same place on every step.
   */
  fill?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-5 pt-4 pb-8 lg:px-8 lg:pt-10",
        WIDTH[width],
        fill && "flex min-h-[calc(100dvh-var(--mobile-header-h))] flex-col pb-0",
        className,
      )}
    >
      {children}
    </Tag>
  )
}

/**
 * The rest of a <Page> as a flex column that reaches the bottom of the
 * screen, for a client view that needs `fill` on one state only (the
 * finished screen of a training). Its StickyActionBar (`mt-auto`) then rests
 * at the bottom. Cancels Page's bottom padding; the height leaves out Page's
 * top padding (pt-4, lg:pt-10).
 */
export function PageFill({ children }: { children: ReactNode }) {
  return (
    <div className="-mb-8 flex min-h-[calc(100dvh-var(--mobile-header-h)-1rem)] flex-col lg:min-h-[calc(100dvh-2.5rem)]">
      {children}
    </div>
  )
}

/** The section stack under a PageHeader: 32px between sections (`gap-8`). */
export function PageSections({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col gap-8", className)}>{children}</div>
}
