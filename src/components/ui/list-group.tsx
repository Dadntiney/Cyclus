import Link from "next/link"
import { isValidElement, useId } from "react"
import type { ComponentType, ReactElement, ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import type { LucideProps } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

interface ListGroupProps {
  /** Small group label above the group ("Van mij", "Hulpmiddelen"). */
  label?: ReactNode
  /** Heading level of the label (default h2: a group is a page section). */
  labelAs?: "h2" | "h3" | "p"
  id?: string
  className?: string
  /** ListRow elements. */
  children: ReactNode
}

/**
 * A settings/navigation group: label + one rounded surface with hairline
 * dividers. Rows are `<ListRow>`s (each renders an `<li>`).
 */
export function ListGroup({ label, labelAs: Label = "h2", id, className, children }: ListGroupProps) {
  const autoId = useId()
  const labelId = label ? `${id ?? autoId}-label` : undefined
  return (
    <section id={id} aria-labelledby={labelId} className={cn("flex flex-col", className)}>
      {label && (
        <Label id={labelId} className="type-group-label text-ink-soft px-1 mb-2">
          {label}
        </Label>
      )}
      <ul
        role="list"
        className="rounded-card bg-surface border border-line divide-y divide-line overflow-hidden"
      >
        {children}
      </ul>
    </section>
  )
}

type IconLike = ComponentType<LucideProps> | ReactElement

interface ListRowProps {
  title: ReactNode
  /** One line of explanation under the title (clamped at 2). */
  description?: ReactNode
  /** Lucide icon component (36px sage tile) or a ready element. */
  icon?: IconLike
  /** Navigates (next/link). */
  href?: string
  /** Acts (button). Ignored when `href` is set. */
  onClick?: () => void
  /** Current value on the right ("Automatisch"). */
  value?: ReactNode
  /** A Badge on the right ("staat uit"). */
  badge?: ReactNode
  /**
   * A Switch at the end; the whole row toggles it. The switch is labelled
   * by the row title and described by the description.
   */
  toggle?: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }
  /** Right side: chevron (default for href/onClick), none, or custom content. */
  trailing?: "chevron" | "none" | ReactNode
  /** Dim the title, e.g. for a module that is switched off. */
  muted?: boolean
  id?: string
  className?: string
}

function renderTile(icon: IconLike) {
  const node = isValidElement(icon)
    ? icon
    : (() => {
        const Icon = icon as ComponentType<LucideProps>
        return <Icon {...ICON.sm} aria-hidden />
      })()
  return (
    <span
      aria-hidden
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
    >
      {node}
    </span>
  )
}

const rowClasses =
  "flex w-full min-h-14 items-center gap-3.5 px-4 py-3 text-left touch-manipulation " +
  "transition-colors duration-fast ease-standard -outline-offset-2"
const pressableClasses = "hover:bg-cream-soft/60 active:bg-cream-soft"

/**
 * One row in a ListGroup: icon tile · title (17/500) + description · one
 * of chevron / value / Switch / Badge on the right. 56px minimum height;
 * the focus outline sits inside the row (offset −2px) so the group's
 * rounded corners never clip it.
 */
export function ListRow({
  title,
  description,
  icon,
  href,
  onClick,
  value,
  badge,
  toggle,
  trailing,
  muted,
  id,
  className,
}: ListRowProps) {
  const autoId = useId()
  const baseId = id ?? autoId
  const titleId = `${baseId}-title`
  const descriptionId = description ? `${baseId}-desc` : undefined
  const isPressable = Boolean(href || onClick)
  const trailingMode = trailing ?? (isPressable ? "chevron" : "none")

  const body = (
    <>
      {icon && renderTile(icon)}
      {/* No min-w-0: the title keeps at least its longest word, so on a
          narrow phone the value gives way (truncates) instead of running
          into the title ("Weergave" · "Automatisch" at 320px). The
          description may break anywhere, so it never widens the row. */}
      <span className="flex flex-1 flex-col gap-0.5">
        <span id={titleId} className={cn("text-base font-medium", muted ? "text-ink-soft" : "text-ink")}>
          {title}
        </span>
        {description && (
          <span id={descriptionId} className="text-sm text-ink-soft line-clamp-2 wrap-anywhere">
            {description}
          </span>
        )}
      </span>
      {value !== undefined && value !== null && (
        <span className="min-w-0 truncate text-sm text-ink-soft text-right">{value}</span>
      )}
      {badge && <span className="shrink-0">{badge}</span>}
      {toggle && (
        <Switch
          id={`${baseId}-switch`}
          checked={toggle.checked}
          onChange={toggle.onChange}
          disabled={toggle.disabled}
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        />
      )}
      {trailingMode === "chevron" ? (
        <ChevronRight {...ICON.sm} className={cn(ICON.sm.className, "text-ink-soft")} aria-hidden />
      ) : trailingMode === "none" ? null : (
        trailingMode
      )}
    </>
  )

  if (toggle) {
    // Tapping anywhere on the row activates the switch (a <label> for a
    // button forwards the click); the switch itself stays the only control.
    return (
      <li className={className}>
        <label htmlFor={`${baseId}-switch`} className={cn(rowClasses, !toggle.disabled && "cursor-pointer")}>
          {body}
        </label>
      </li>
    )
  }

  if (href) {
    return (
      <li className={className}>
        <Link href={href} className={cn(rowClasses, pressableClasses)}>
          {body}
        </Link>
      </li>
    )
  }

  if (onClick) {
    return (
      <li className={className}>
        <button type="button" onClick={onClick} className={cn(rowClasses, pressableClasses)}>
          {body}
        </button>
      </li>
    )
  }

  return (
    <li className={className}>
      <div className={rowClasses}>{body}</div>
    </li>
  )
}
