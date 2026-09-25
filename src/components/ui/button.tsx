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
  secondary: "bg-white text-ink border border-line hover:bg-cream-soft",
  ghost: "bg-transparent text-ink hover:bg-cream-soft",
  danger: "bg-danger text-white hover:opacity-90",
}

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2 rounded-xl",
  md: "text-[15px] px-5 py-3 rounded-2xl",
  lg: "text-base px-6 py-3.5 rounded-2xl",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"
