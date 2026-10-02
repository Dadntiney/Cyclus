import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-fill text-white hover:bg-primary-fill-hover active:bg-primary-fill-hover",
  secondary:
    "bg-surface text-ink border border-ink/15 hover:border-ink/30 hover:bg-bg-subtle active:bg-bg-subtle",
  ghost: "bg-transparent text-ink hover:bg-bg-subtle active:bg-bg-subtle",
  danger: "bg-danger-fill text-white hover:bg-danger-fill-darker active:bg-danger-fill-darker",
}

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-4 py-2.5 rounded-full min-h-11",
  // text-base (17px in the Ritme scale) — the default every primary CTA in
  // the app uses unless it opts into sm/lg. Pill shape, 48px tall.
  md: "text-base px-6 py-3 rounded-full min-h-12",
  lg: "text-base px-7 py-3.5 rounded-full min-h-13",
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-semibold transition-[background-color,box-shadow,transform] duration-150 touch-manipulation select-none " +
  "motion-safe:active:scale-[0.97] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg " +
  "disabled:opacity-50 disabled:pointer-events-none"

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className)
}

/** Calm text action for navigation / tertiary CTAs (not a filled button). */
export function textActionClass(className?: string) {
  return cn(
    "inline-flex items-center gap-1 text-sm font-semibold text-sage-dark min-h-11 touch-manipulation rounded-lg underline-offset-4 hover:underline",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
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
