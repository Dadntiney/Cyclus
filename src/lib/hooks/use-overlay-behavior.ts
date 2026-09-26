"use client"

import { useEffect, useSyncExternalStore } from "react"

function subscribeNoop() {
  return () => {}
}
function getClientSnapshot() {
  return true
}
function getServerSnapshot() {
  return false
}

/**
 * Shared plumbing for any full-screen overlay (BottomSheet, Dialog):
 * - only portals after mount (document.body doesn't exist during SSR;
 *   useSyncExternalStore is the React-blessed way to read "are we on the
 *   client yet" without the setState-in-effect anti-pattern)
 * - locks body scroll while open, restores it exactly on close
 * - closes on Escape
 */
export function useOverlayBehavior(open: boolean, onClose: () => void) {
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  return mounted
}
