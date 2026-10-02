import type { ButtonHTMLAttributes } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
}

export function Chip({ selected, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 min-h-11 text-sm font-medium transition-[background-color,border-color,transform] duration-150 touch-manipulation select-none",
        "motion-safe:active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        selected
          ? "bg-sage-soft text-sage-darker border-sage-dark"
          : "bg-surface text-ink border-line hover:border-ink/30 active:border-ink/30",
        className,
      )}
      aria-pressed={selected}
      {...props}
    >
      {/* Selection is shown by shape too, not only by colour. */}
      {selected && <Check className="h-3.5 w-3.5 -ml-0.5 shrink-0" strokeWidth={2.5} aria-hidden />}
      {children}
    </button>
  )
}
