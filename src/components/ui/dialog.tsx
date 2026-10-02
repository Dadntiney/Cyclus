"use client"

import { createPortal } from "react-dom"
import type { ReactNode, RefObject } from "react"
import { FrozenContent } from "@/components/ui/overlay-frame"
import { useOverlay } from "@/lib/hooks/use-overlay-behavior"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  /** The dialog's h2 and accessible name. */
  title: string
  children: ReactNode
  /** Actions under the content, full width (e.g. Annuleren + Verwijderen). */
  footer?: ReactNode
  /** Focus this on open instead of the title (never a text field). */
  initialFocus?: RefObject<HTMLElement | null>
  className?: string
}

/**
 * A centered, blocking dialog — reserved for the handful of actions that
 * genuinely warrant stopping the user (irreversible/destructive), unlike
 * the lightweight inline confirm-cards used elsewhere in the app for
 * low-stakes deletes (a reminder, a medication entry).
 *
 * Same overlay behaviour as BottomSheet: focus in, Tab trapped, Escape and
 * scrim close, focus back to the trigger, app inert, soft fade/scale out.
 */
export function Dialog({ open, onClose, title, children, footer, initialFocus, className }: DialogProps) {
  const { mounted, phase, rootRef, panelRef, titleRef, titleId, contentKey } = useOverlay(open, onClose, {
    initialFocus,
  })
  if (!mounted) return null
  const exiting = phase === "exit"

  return createPortal(
    <div
      ref={rootRef}
      data-overlay="dialog"
      data-no-pull-refresh=""
      inert={exiting}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
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
        aria-labelledby={titleId}
        tabIndex={-1}
        data-focus-target=""
        className={cn(
          "relative w-full max-w-sm max-h-[85vh] overflow-y-auto overscroll-contain rounded-sheet bg-surface-elevated p-6 shadow-elevated",
          exiting ? "animate-dialog-out" : "animate-dialog-in",
          className,
        )}
      >
        <FrozenContent key={contentKey} frozen={exiting}>
          <h2 id={titleId} ref={titleRef} tabIndex={-1} data-focus-target="" className="type-card-title text-ink mb-3">
            {title}
          </h2>
          {children}
          {footer && <div className="mt-5 flex flex-col gap-2">{footer}</div>}
        </FrozenContent>
      </div>
    </div>,
    document.body,
  )
}
