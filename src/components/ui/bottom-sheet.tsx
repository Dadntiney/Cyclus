"use client"

import { createPortal } from "react-dom"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { useOverlayBehavior } from "@/lib/hooks/use-overlay-behavior"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/**
 * A native-style bottom sheet for choices/actions that don't warrant a full
 * page — e.g. picking a replacement exercise. Portalled to document.body so
 * `fixed` positioning is never accidentally scoped by an animated ancestor
 * (PageTransition applies a transform during its own enter animation, which
 * would otherwise trap a fixed-position child to that element).
 */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const mounted = useOverlayBehavior(open, onClose)
  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_-8px_30px_rgba(44,42,38,0.12)] motion-safe:animate-[sheet-in_0.25s_cubic-bezier(0.32,0.72,0,1)] max-h-[85vh] flex flex-col"
        style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line shrink-0 sm:hidden" aria-hidden="true" />
        <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0">
          {title && <p className="font-display text-lg text-ink">{title}</p>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="ml-auto h-9 w-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-5 pb-2 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
