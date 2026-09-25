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
        "rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
        selected
          ? "bg-sage text-white border-sage"
          : "bg-white text-ink border-line hover:border-sage/60",
        className,
      )}
      aria-pressed={selected}
      {...props}
    />
  )
}
