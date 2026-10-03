"use client"

import { useId } from "react"
import type { ComponentType, ReactNode } from "react"
import type { LucideProps } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

type IconComponent = ComponentType<LucideProps>

/** The 36px sage icon tile, as in a ListRow. */
function IconTile({ icon: Icon }: { icon: IconComponent }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
    >
      <Icon {...ICON.sm} />
    </span>
  )
}

/**
 * A settings row inside a Card: title (17/500) + one line of explanation
 * on the left, a Switch on the right. The whole row is tappable and the
 * switch is named by the title (one Switch per boolean, PRF-2) — the same
 * anatomy as a ListRow with `toggle`, for places that are not a ListGroup.
 */
export function SwitchRow({
  title,
  description,
  checked,
  onChange,
  disabled,
  icon,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  icon?: IconComponent
  className?: string
}) {
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = description ? `${id}-desc` : undefined

  return (
    <label
      htmlFor={`${id}-switch`}
      className={cn(
        "flex min-h-14 items-center gap-3.5 py-3 touch-manipulation",
        !disabled && "cursor-pointer",
        className,
      )}
    >
      {icon && <IconTile icon={icon} />}
      <span className="flex flex-1 flex-col gap-0.5">
        <span id={titleId} className="text-base font-medium text-ink">
          {title}
        </span>
        {description && (
          <span id={descriptionId} className="text-sm text-ink-soft">
            {description}
          </span>
        )}
      </span>
      <Switch
        id={`${id}-switch`}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      />
    </label>
  )
}

/** A row heading without a control (e.g. Medicatie & hormonen, which has no on/off). */
export function SettingHeading({
  title,
  description,
  icon,
  id,
}: {
  title: ReactNode
  description?: ReactNode
  icon?: IconComponent
  id?: string
}) {
  return (
    <div className="flex min-h-14 items-center gap-3.5 py-3">
      {icon && <IconTile icon={icon} />}
      <div className="flex flex-1 flex-col gap-0.5">
        <p id={id} className="text-base font-medium text-ink">
          {title}
        </p>
        {description && <p className="text-sm text-ink-soft">{description}</p>}
      </div>
    </div>
  )
}

/**
 * A labelled set of toggle chips (multi-select): the label names the
 * group for screen readers too.
 */
export function ChipGroup({
  label,
  hint,
  children,
  className,
}: {
  label: ReactNode
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <div className={className}>
      <p id={`${id}-label`} className="mb-2 text-sm font-medium text-ink">
        {label}
      </p>
      {hint && (
        <p id={`${id}-hint`} className="-mt-1 mb-2 text-sm text-ink-soft">
          {hint}
        </p>
      )}
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="flex flex-wrap gap-2"
      >
        {children}
      </div>
    </div>
  )
}
