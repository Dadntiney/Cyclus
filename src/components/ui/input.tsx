import { forwardRef } from "react"
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

/**
 * Text fields: rounded-inset, a line-strong edge (≥3:1), 48px tall.
 * Focus: sage-dark edge + the global outline right on the edge (offset 0).
 * Invalid: pass `aria-invalid` (+ `aria-describedby` → the FieldError id);
 * the edge and outline turn danger. Never a phase colour for errors.
 * 16px text (globals.css) keeps iOS Safari from zooming on focus.
 */
const fieldClasses =
  "w-full rounded-inset border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-soft/70 " +
  "transition-[border-color] duration-fast ease-standard " +
  "focus:border-sage-dark focus-visible:outline-offset-0 " +
  "aria-invalid:border-danger aria-invalid:focus-visible:outline-danger " +
  "disabled:bg-cream-soft disabled:text-ink-soft disabled:cursor-not-allowed"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClasses, "min-h-12", className)} {...props} />
  ),
)
Input.displayName = "Input"

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldClasses, "min-h-12 resize-none", className)} {...props} />
))
Textarea.displayName = "Textarea"

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-ink mb-1.5", className)}
      {...props}
    />
  )
}

/**
 * Validation message under a field. role="alert" so it is read out as
 * soon as it appears; give it an `id` and point the field's
 * `aria-describedby` at it.
 */
export function FieldError({
  children,
  id,
  className,
}: {
  children?: ReactNode
  id?: string
  className?: string
}) {
  if (!children) return null
  return (
    <p id={id} role="alert" className={cn("mt-1.5 text-sm text-danger", className)}>
      {children}
    </p>
  )
}
