"use client"

import { useId } from "react"
import type { InputHTMLAttributes, ReactNode } from "react"
import { Check } from "lucide-react"
import { CHECK_STROKE } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> {
  /** The label; the whole row is tappable. */
  children: ReactNode
  /** Optional second line under the label. */
  description?: ReactNode
  /** Convenience: called with the new checked state (the native onChange also works). */
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

/**
 * A 24px custom checkbox with the label as one tappable row (min 44px).
 * Built on a real (visually hidden) checkbox input, so it works in forms
 * (`name`, `defaultChecked`, `required`) as well as controlled
 * (`checked` + `onCheckedChange`).
 */
export function Checkbox({
  children,
  description,
  onCheckedChange,
  onChange,
  className,
  id,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...inputProps
}: CheckboxProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const descriptionId = description ? `${inputId}-desc` : undefined
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(" ") || undefined

  return (
    <label
      htmlFor={inputId}
      className={cn(
        // relative: the sr-only input (absolute) stays inside its row, also in a closed Collapse.
        "relative flex min-h-11 items-start gap-3 py-2.5 touch-manipulation select-none",
        disabled ? "opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        disabled={disabled}
        aria-describedby={describedBy}
        onChange={(e) => {
          onChange?.(e)
          onCheckedChange?.(e.target.checked)
        }}
        className="peer sr-only"
        {...inputProps}
      />
      <span
        aria-hidden
        className={cn(
          "mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xs border-[1.5px] border-line-strong bg-surface text-white",
          "transition-colors duration-fast ease-standard",
          "peer-checked:bg-sage-fill peer-checked:border-sage-fill",
          "[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
          // The input is visually hidden, so the box shows its focus ring.
          "peer-focus-visible:outline-2 peer-focus-visible:outline-solid peer-focus-visible:outline-focus peer-focus-visible:outline-offset-2",
          "peer-aria-invalid:border-danger",
        )}
      >
        <Check className="h-4 w-4" strokeWidth={CHECK_STROKE} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
        <span className="text-base text-ink">{children}</span>
        {description && (
          <span id={descriptionId} className="text-sm text-ink-soft">
            {description}
          </span>
        )}
      </span>
    </label>
  )
}
