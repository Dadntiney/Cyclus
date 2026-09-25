import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use when the card is the visual surface for a Link/button — adds tap + hover feedback. */
  interactive?: boolean
}

export function Card({ className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white border border-line/70 shadow-[0_2px_16px_rgba(44,42,38,0.05)] p-5",
        interactive &&
          "transition-[border-color,transform,box-shadow] duration-150 motion-safe:active:scale-[0.985] hover:border-sage/50 active:border-sage/50",
        className,
      )}
      {...props}
    />
  )
}
