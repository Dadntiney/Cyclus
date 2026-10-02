import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use when the card is the visual surface for a Link/button — adds tap + hover feedback. */
  interactive?: boolean
  /** Full-bleed content (e.g. an image) rendered above the padded body, inside the same rounded corners. */
  media?: ReactNode
}

/**
 * Ritme surface: a quiet raised sheet with a hairline — reserved for things
 * you act on (a recipe, a workout, a settings group). Explanations about the
 * body use a phase tint instead (pass the tone's bg class), and plain text
 * sits straight on the page without a card.
 */
const baseClasses = "rounded-[1.25rem] bg-surface border border-line"
const interactiveClasses =
  "transition-[background-color,border-color,transform] duration-150 motion-safe:active:scale-[0.985] hover:border-ink/20 active:bg-cream-soft/60"

export function Card({ className, interactive, media, children, ...props }: CardProps) {
  if (media) {
    return (
      <div
        className={cn(baseClasses, "overflow-hidden", interactive && interactiveClasses, className)}
        {...props}
      >
        {media}
        <div className="p-5">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, "p-5", interactive && interactiveClasses, className)}
      {...props}
    >
      {children}
    </div>
  )
}
