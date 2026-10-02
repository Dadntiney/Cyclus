import type { ButtonHTMLAttributes } from "react"
import { Check, X } from "lucide-react"
import { CHECK_ICON, CHECK_STROKE } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  /**
   * Grid cell: fills its column, centred `text-sm`, no wrapping. The check
   * moves to a corner badge so selecting never changes the layout.
   */
  fill?: boolean
  /**
   * An active filter you can remove ("Vegetarisch ×"): shown selected with
   * a trailing ×; tapping it should remove the filter. Its accessible name
   * ends in "verwijderen". Not combined with `selected`.
   */
  removable?: boolean
}

/**
 * Filters and multi-select (docs/DESIGN_SYSTEM.md, "Selectie"). For one
 * choice out of a few use SegmentedControl, ChipRadioGroup or OptionList.
 *
 * - unselected: transparent with a line-strong edge (works on surface,
 *   cream and sheets; never place outlined chips on cream-soft)
 * - selected: sage-soft + sage-dark edge + check (shape, not only colour)
 * - pass role="radio" (ChipRadioGroup does) to get aria-checked instead
 *   of aria-pressed.
 */
export function Chip({ selected, fill, removable, role, className, children, ...props }: ChipProps) {
  const active = Boolean(selected || removable)

  // A radio chip reports aria-checked; a toggle chip aria-pressed.
  const stateProps =
    role === "radio"
      ? { role: "radio" as const, "aria-checked": Boolean(selected) }
      : { role, "aria-pressed": removable || selected === undefined ? undefined : selected }

  return (
    <button
      type="button"
      {...stateProps}
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 rounded-full border min-h-11 text-sm font-medium touch-manipulation select-none",
        "transition-[background-color,border-color,color,transform] duration-fast ease-standard motion-safe:active:scale-[0.97]",
        "disabled:opacity-50 disabled:pointer-events-none",
        fill ? "w-full px-2 py-2.5 whitespace-nowrap" : "px-4 py-2.5",
        active
          ? "bg-sage-soft text-sage-darker border-sage-dark"
          : "bg-transparent text-ink border-line-strong hover:bg-cream-soft/60 active:bg-cream-soft/60",
        className,
      )}
      {...props}
    >
      {/* Selection is shown by shape too, not only by colour. */}
      {selected && !removable && !fill && <Check {...CHECK_ICON} className={cn(CHECK_ICON.className, "-ml-0.5")} aria-hidden />}
      {selected && !removable && fill && (
        <span
          aria-hidden
          className="absolute -right-1 -top-1 inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sage-fill text-white"
        >
          <Check className="h-3 w-3" strokeWidth={CHECK_STROKE} />
        </span>
      )}
      {children}
      {removable && (
        <>
          <span className="sr-only"> verwijderen</span>
          <X {...CHECK_ICON} className={cn(CHECK_ICON.className, "-mr-1")} aria-hidden />
        </>
      )}
    </button>
  )
}
