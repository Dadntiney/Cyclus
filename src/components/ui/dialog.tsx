"use client"

import { createPortal } from "react-dom"
import type { ReactNode } from "react"
import { useOverlayBehavior } from "@/lib/hooks/use-overlay-behavior"

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * A centered, blocking dialog — reserved for the handful of actions that
 * genuinely warrant stopping the user (irreversible/destructive), unlike
 * the lightweight inline confirm-cards used elsewhere in the app for
 * low-stakes deletes (a reminder, a medication entry).
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const mounted = useOverlayBehavior(open, onClose)
  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-[var(--shadow-card)] p-5 motion-safe:animate-pop-in"
      >
        <p className="font-display text-lg text-ink mb-3">{title}</p>
        {children}
      </div>
    </div>,
    document.body,
  )
}
