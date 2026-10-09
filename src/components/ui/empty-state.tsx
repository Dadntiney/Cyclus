import { isValidElement } from "react"
import type { ComponentType, ReactNode } from "react"
import type { LucideProps } from "lucide-react"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  /**
   * Preferred: a lucide icon component (`icon={Heart}`) — drawn at 24px
   * in a 56px sage-soft circle. A ready element still works (legacy) and
   * is rendered as-is, without the circle.
   */
  icon?: ComponentType<LucideProps> | ReactNode
  title: string
  description?: ReactNode
  /** Always give one: the way forward ("Bekijk recepten", "Nacht toevoegen"). */
  action?: ReactNode
  /** Heading level of the title (default h2; h3 when inside a section). */
  titleAs?: "h2" | "h3" | "p"
  className?: string
}

function isComponent(icon: EmptyStateProps["icon"]): icon is ComponentType<LucideProps> {
  if (icon === null || icon === undefined || isValidElement(icon)) return false
  return typeof icon === "function" || (typeof icon === "object" && "$$typeof" in icon)
}

/**
 * The one empty-state pattern: flat on the page (never inside a Card),
 * icon in a sage-soft circle, title, short description and an action.
 */
export function EmptyState({ icon, title, description, action, titleAs: Title = "h2", className }: EmptyStateProps) {
  let iconNode: ReactNode = null
  if (isComponent(icon)) {
    const Icon = icon
    iconNode = (
      <span
        aria-hidden
        className="mb-1 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft text-sage-dark"
      >
        <Icon {...ICON.lg} />
      </span>
    )
  } else if (icon) {
    iconNode = <div className="text-sage-dark mb-1">{icon as ReactNode}</div>
  }

  return (
    <div className={cn("flex flex-col items-center text-center gap-2 py-10 px-4", className)}>
      {iconNode}
      <Title className="type-card-title text-ink">{title}</Title>
      {description && <p className="text-sm text-ink-soft max-w-xs">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
