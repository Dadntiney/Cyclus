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
  primary: "bg-sage text-white hover:bg-sage-dark active:bg-sage-dark",
  secondary: "bg-white text-ink border border-line hover:bg-cream-soft active:bg-cream-soft",
  ghost: "bg-transparent text-ink hover:bg-cream-soft active:bg-cream-soft",
  danger: "bg-danger text-white hover:opacity-90 active:opacity-90",
}

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2.5 rounded-xl min-h-10",
  md: "text-[15px] px-5 py-3 rounded-2xl min-h-11",
  lg: "text-base px-6 py-3.5 rounded-2xl min-h-12",
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-medium transition-[background-color,box-shadow,transform] duration-150 touch-manipulation select-none " +
  "motion-safe:active:scale-[0.97] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream " +
  "disabled:opacity-50 disabled:pointer-events-none"

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className)
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
