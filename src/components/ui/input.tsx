import { forwardRef } from "react"
import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/70 outline-none transition-shadow focus:ring-2 focus:ring-sage/40 focus:border-sage",
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = "Input"

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/70 outline-none transition-shadow focus:ring-2 focus:ring-sage/40 focus:border-sage resize-none",
      className,
    )}
    {...props}
  />
))
Textarea.displayName = "Textarea"

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-ink-soft mb-1.5", className)}
      {...props}
    />
  )
}

export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null
  return <p className="mt-1.5 text-sm text-danger">{children}</p>
}
