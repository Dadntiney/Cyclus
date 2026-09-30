"use client"

import { useEffect } from "react"

const KEYBOARD_INSET_VAR = "--keyboard-inset"

/**
 * Publishes how many CSS pixels of the layout viewport are covered by the
 * soft keyboard (and Safari’s accessory bar) as `--keyboard-inset`.
 *
 * With `interactive-widget: resizes-content`, layout already shrinks and the
 * value stays ~0 — fixed `bottom: 0` is then correct. On iOS Safari, where
 * the keyboard often overlays instead, this lifts fixed chrome (Buddy
 * composer) into the visible visual viewport without scrolling the page.
 */
export function useKeyboardInsetVar() {
  useEffect(() => {
    const root = document.documentElement
    const vv = window.visualViewport

    const publish = () => {
      if (!vv) {
        root.style.setProperty(KEYBOARD_INSET_VAR, "0px")
        return
      }
      const covered = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      root.style.setProperty(KEYBOARD_INSET_VAR, `${Math.round(covered)}px`)
    }

    publish()
    vv?.addEventListener("resize", publish)
    vv?.addEventListener("scroll", publish)
    window.addEventListener("resize", publish)
    window.addEventListener("focusin", publish)
    window.addEventListener("focusout", publish)
    return () => {
      vv?.removeEventListener("resize", publish)
      vv?.removeEventListener("scroll", publish)
      window.removeEventListener("resize", publish)
      window.removeEventListener("focusin", publish)
      window.removeEventListener("focusout", publish)
      root.style.setProperty(KEYBOARD_INSET_VAR, "0px")
    }
  }, [])
}
