import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type ButtonVariant = "primary" | "secondary" | "tonal" | "ghost" | "danger"
export type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

/**
 * One primary per region (docs/DESIGN_SYSTEM.md):
 * - primary   — gevulde CTA (sage-fill, wit label)
 * - secondary — rustige omlijnde knop op een oppervlak
 * - tonal     — zachte, gevulde tweede actie (sage-soft) naast of onder een primary
 * - ghost     — alleen tekst + vlak bij aanraken
 * - danger    — destructief (account verwijderen), nooit voor menstruatie/fases
 */
const variantClasses: Record<ButtonVariant, string> = {
  // Disabled primary turns into a calm outlined pill instead of a washed-out
  // green one, which read as "broken" in the usertest.
  primary:
    "bg-sage-fill text-white hover:bg-sage-fill-darker active:bg-sage-fill-darker " +
    "disabled:bg-cream-soft disabled:text-ink-soft disabled:shadow-[inset_0_0_0_1px_var(--color-line)] disabled:opacity-100",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-cream-soft active:bg-cream-soft",
  tonal: "bg-sage-soft text-sage-darker hover:bg-sage-soft/80 active:bg-sage-soft/80",
  ghost: "bg-transparent text-ink hover:bg-cream-soft active:bg-cream-soft",
  danger: "bg-danger-fill text-white hover:bg-danger-fill-darker active:bg-danger-fill-darker",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm px-4 py-2.5 rounded-full min-h-11",
  // text-base (17px in the Ritme scale) — the default every primary CTA in
  // the app uses unless it opts into sm/lg. Pill shape, 48px tall.
  md: "text-base px-6 py-3 rounded-full min-h-12",
  lg: "text-base px-7 py-3.5 rounded-full min-h-13",
}

// Focus: the global :focus-visible outline (globals.css) — no ring here.
const baseClasses =
  "inline-flex items-center justify-center gap-2 font-semibold touch-manipulation select-none " +
  "transition-[background-color,border-color,box-shadow,transform] duration-fast ease-standard " +
  "motion-safe:active:scale-[0.97] " +
  "disabled:opacity-50 disabled:pointer-events-none"

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className)
}

/**
 * Calm text action for navigation / tertiary CTAs (not a filled button):
 * 15/600 sage-dark, 44px tall hit area. Use for "Hele week", "Aanpassen",
 * "Alles tonen". With a trailing chevron, prefer <SectionAction>.
 */
export function textActionClass(className?: string) {
  return cn(
    "inline-flex items-center gap-1 text-sm font-semibold text-sage-dark min-h-11 touch-manipulation rounded-inset underline-offset-4 hover:underline",
    className,
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"
