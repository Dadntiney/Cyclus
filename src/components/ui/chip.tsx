import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

export function Chip({ selected, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full border px-4 py-2.5 min-h-11 text-sm font-medium transition-[background-color,border-color,transform] duration-150 touch-manipulation select-none",
        "motion-safe:active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        selected
          ? "bg-sage-dark text-white border-sage-dark"
          : "bg-white text-ink border-line hover:border-sage/60 active:border-sage/60",
        className,
      )}
      aria-pressed={selected}
      {...props}
    />
  )
}
