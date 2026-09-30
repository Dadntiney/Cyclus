import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use when the card is the visual surface for a Link/button — adds tap + hover feedback. */
  interactive?: boolean
  /** Full-bleed content (e.g. an image) rendered above the padded body, inside the same rounded corners. */
  media?: ReactNode
}

/** Soft sage panel — same calm surface language as Vandaag (no white bordered cards). */
const baseClasses = "rounded-3xl bg-sage-soft/50 border border-transparent"
const interactiveClasses =
  "transition-[background-color,transform] duration-150 motion-safe:active:scale-[0.985] hover:bg-sage-soft/70 active:bg-sage-soft/80"

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
