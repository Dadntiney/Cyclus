import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use when the card is the visual surface for a Link/button — adds tap + hover feedback. */
  interactive?: boolean
  /** Full-bleed content (e.g. an image) rendered above the padded body, inside the same rounded corners. */
  media?: ReactNode
}

const baseClasses = "rounded-3xl bg-white border border-line/70 shadow-[0_2px_16px_rgba(44,42,38,0.05)]"
const interactiveClasses =
  "transition-[border-color,transform,box-shadow] duration-150 motion-safe:active:scale-[0.985] hover:border-sage/50 active:border-sage/50"

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
