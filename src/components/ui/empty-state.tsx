import type { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-10 px-4">
      {icon && <div className="text-sage-dark mb-1">{icon}</div>}
      <p className="font-display text-lg text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft max-w-xs">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
