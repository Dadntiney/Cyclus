import { cn } from "@/lib/utils"

/**
 * One icon scale for the whole app (lucide-react). Stroke weight follows
 * size so neighbouring icons share the same hairline Ritme look:
 *
 * - `sm` 16px @1.75 — inline/meta, chevrons, list-row icon tiles
 * - `md` 20px @1.75 — actions, app bar, tabs, IconButton
 * - `lg` 24px @1.5  — feature tiles, empty-state icon
 * - `xl` 32px @1.5  — rare hero icons
 *
 * Usage: `<Heart {...ICON.sm} aria-hidden />`, or with extra classes
 * `<Heart {...iconProps("sm", "text-peach")} aria-hidden />`.
 * Checkmarks are the one exception and use CHECK_STROKE (2.5).
 */
export const ICON = {
  sm: { className: "h-4 w-4 shrink-0", strokeWidth: 1.75 },
  md: { className: "h-5 w-5 shrink-0", strokeWidth: 1.75 },
  lg: { className: "h-6 w-6 shrink-0", strokeWidth: 1.5 },
  xl: { className: "h-8 w-8 shrink-0", strokeWidth: 1.5 },
} as const

export type IconSize = keyof typeof ICON

/** Checkmarks (selected chip, checkbox, option list) read best a bit bolder. */
export const CHECK_STROKE = 2.5

/** Small checkmark (14px @2.5) for selected chips, options and confirmations. */
export const CHECK_ICON = { className: "h-3.5 w-3.5 shrink-0", strokeWidth: CHECK_STROKE } as const

/** ICON props with extra classes merged in (colour, rotation, transitions …). */
export function iconProps(size: IconSize, className?: string) {
  return { className: cn(ICON[size].className, className), strokeWidth: ICON[size].strokeWidth }
}
