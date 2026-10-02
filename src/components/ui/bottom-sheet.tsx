"use client"

import { createPortal } from "react-dom"
import { X } from "lucide-react"
import type { ReactNode, RefObject } from "react"
import { IconButton } from "@/components/ui/icon-button"
import { FrozenContent } from "@/components/ui/overlay-frame"
import { useOverlay } from "@/lib/hooks/use-overlay-behavior"
import { cn } from "@/lib/utils"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  /** Rendered as the sheet's h2 and its accessible name. */
  title?: string
  children: ReactNode
  /** Full-width actions pinned under the scrolling content (e.g. a primary Button). */
  footer?: ReactNode
  /** Accessible name when there is no visible title. */
  "aria-label"?: string
  /** Focus this on open instead of the title (never a text field). */
  initialFocus?: RefObject<HTMLElement | null>
  className?: string
}

/**
 * A native-style bottom sheet for choices/actions that don't warrant a full
 * page — e.g. picking a replacement exercise. Portalled to document.body so
 * `fixed` positioning is never accidentally scoped by an animated ancestor.
 *
 * Behaviour (docs/DESIGN_SYSTEM.md, "Overlays"): focus moves to the title,
 * Tab stays inside, Escape and the scrim close it, focus returns to the
 * trigger, the app behind is inert, and it slides out again on close.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  "aria-label": ariaLabel,
  initialFocus,
  className,
}: BottomSheetProps) {
  const { mounted, phase, rootRef, panelRef, titleRef, titleId, contentKey } = useOverlay(open, onClose, {
    initialFocus,
  })
  if (!mounted) return null
  const exiting = phase === "exit"

  return createPortal(
    <div
      ref={rootRef}
      data-overlay="sheet"
      // The sheet scrolls on its own; never start a page pull-to-refresh.
      data-no-pull-refresh=""
      inert={exiting}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn("absolute inset-0 bg-scrim", exiting ? "animate-fade-out" : "animate-fade-in")}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        data-focus-target=""
        className={cn(
          "relative flex max-h-[85vh] w-full flex-col bg-surface-elevated shadow-elevated rounded-t-sheet sm:max-w-sm sm:rounded-sheet",
          exiting ? "animate-sheet-out sm:animate-dialog-out" : "animate-sheet-in sm:animate-dialog-in",
          className,
        )}
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <FrozenContent key={contentKey} frozen={exiting}>
          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line sm:hidden" aria-hidden="true" />
          <div className="flex shrink-0 items-center justify-between gap-3 pl-5 pr-3 pt-2 pb-1">
            {title && (
              <h2 id={titleId} ref={titleRef} tabIndex={-1} data-focus-target="" className="type-card-title text-ink">
                {title}
              </h2>
            )}
            <IconButton label="Sluiten" icon={X} onClick={onClose} className="ml-auto" />
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-2">{children}</div>
          {footer && <div className="shrink-0 px-5 pt-3">{footer}</div>}
        </FrozenContent>
      </div>
    </div>,
    document.body,
  )
}
