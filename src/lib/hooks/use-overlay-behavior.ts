"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import type { RefObject } from "react"
import { getOverlayStack } from "@/lib/ui/overlay-stack"
import { prefersReducedMotion, trapTab } from "@/lib/ui/focus"

function subscribeNoop() {
  return () => {}
}
function getClientSnapshot() {
  return true
}
function getServerSnapshot() {
  return false
}

/** Matches --duration-exit (globals.css): how long a closing overlay stays. */
export const OVERLAY_EXIT_MS = 180

export type OverlayPhase = "closed" | "open" | "exit"

export interface UseOverlayOptions {
  /**
   * Element to focus on open. Default: the title (`titleRef`), else the
   * panel. Never point this at a text field: on phones that pops the
   * keyboard over the sheet (besluit 19).
   */
  initialFocus?: RefObject<HTMLElement | null>
}

/**
 * Everything a modal overlay (BottomSheet, Dialog) needs, in one hook:
 *
 * - portals only after mount (no `document` during SSR);
 * - registers with the app-wide overlay stack: ref-counted scroll lock,
 *   `inert` on `#app-root` (or the other body children without it), and
 *   Escape/Tab handled only by the top-most overlay;
 * - moves focus into the panel on open (title or panel, never a text
 *   field), traps Tab, and returns focus to the opener on close;
 * - keeps rendering for OVERLAY_EXIT_MS after close (phase "exit") so the
 *   exit animation can play; immediately unmounts under reduced motion.
 *
 * Attach `rootRef` to the portal's outermost element, `panelRef` to the
 * role="dialog" element (tabIndex -1) and `titleRef` + `titleId` to its h2.
 */
export function useOverlay(open: boolean, onClose: () => void, options: UseOverlayOptions = {}) {
  const portalReady = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot)
  const titleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const onCloseRef = useRef(onClose)
  const { initialFocus } = options

  // Derived state ("store info from previous renders"): the render in which
  // `open` flips to false already shows the exit phase.
  const [prevOpen, setPrevOpen] = useState(open)
  const [exiting, setExiting] = useState(false)
  // Bumped on every open, so content can be keyed to start fresh even when
  // the overlay reopens while its previous exit is still playing.
  const [openCount, setOpenCount] = useState(open ? 1 : 0)
  if (prevOpen !== open) {
    setPrevOpen(open)
    setExiting(!open)
    if (open) setOpenCount((n) => n + 1)
  }

  useLayoutEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!exiting) return
    const timer = window.setTimeout(() => setExiting(false), prefersReducedMotion() ? 0 : OVERLAY_EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [exiting])

  useLayoutEffect(() => {
    if (!open || !portalReady) return
    const root = rootRef.current
    const panel = panelRef.current
    if (!root || !panel) return

    const active = document.activeElement
    const opener = active instanceof HTMLElement && active !== document.body ? active : null

    const release = getOverlayStack().push({
      root,
      onEscape: () => onCloseRef.current(),
      onTab: (event) => trapTab(event, panel),
    })

    const target = initialFocus?.current ?? titleRef.current ?? panel
    target.focus({ preventScroll: true })

    return () => {
      // Releasing first lifts `inert` synchronously, so the opener (which
      // lives in the now-interactive app) can take focus back.
      release()
      if (opener && opener.isConnected && !opener.closest("[inert]")) {
        opener.focus({ preventScroll: true })
      }
    }
  }, [open, portalReady, initialFocus])

  const phase: OverlayPhase = open ? "open" : exiting ? "exit" : "closed"

  return {
    /** Render the portal at all (open or still animating out). */
    mounted: portalReady && phase !== "closed",
    phase,
    rootRef,
    panelRef,
    titleRef,
    titleId,
    /** Key for the overlay content: changes on every open. */
    contentKey: openCount,
  }
}
