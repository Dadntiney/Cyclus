"use client"

import { useEffect, type RefObject } from "react"

/**
 * Publishes an element's real rendered height (including its own padding,
 * border and safe-area insets — whatever it actually takes up on screen)
 * as a CSS custom property on the document root. Layout elsewhere can then
 * read `var(--name)` instead of a hand-calculated pixel constant that has
 * to be kept in sync by hand every time the measured element's own
 * padding, content or safe-area changes — the exact kind of drift that
 * made the Buddy chat's fixed-height calc fall a few pixels short of the
 * bottom nav's actual height.
 *
 * Pass `collapsed` to force `0px` (e.g. while the virtual keyboard is open
 * and the measured chrome is slid off-screen) without fighting the observer.
 */
export function useMeasuredHeightVar(
  ref: RefObject<HTMLElement | null>,
  varName: string,
  collapsed = false,
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const publish = () => {
      document.documentElement.style.setProperty(
        varName,
        collapsed ? "0px" : `${el.offsetHeight}px`,
      )
    }
    publish()

    if (collapsed) return

    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, varName, collapsed])
}
