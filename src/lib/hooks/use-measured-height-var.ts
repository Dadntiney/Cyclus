"use client"

import { useLayoutEffect, type RefObject } from "react"

/**
 * Publishes an element's real rendered height as a CSS custom property on
 * the document root. Pass `collapsed` to force `0px` while chrome is slid
 * off-screen (soft keyboard) without fighting the observer.
 */
export function useMeasuredHeightVar(
  ref: RefObject<HTMLElement | null>,
  varName: string,
  collapsed = false,
) {
  useLayoutEffect(() => {
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
