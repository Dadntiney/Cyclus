"use client"

import { useEffect, useState } from "react"

function isTextEntryElement(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  if (el instanceof HTMLTextAreaElement) return !el.disabled && !el.readOnly
  if (el instanceof HTMLInputElement) {
    if (el.disabled || el.readOnly) return false
    const type = (el.type || "text").toLowerCase()
    return ![
      "button",
      "checkbox",
      "radio",
      "submit",
      "reset",
      "file",
      "image",
      "range",
      "color",
      "hidden",
    ].includes(type)
  }
  return false
}

/**
 * True on mobile while a text field is focused (soft keyboard expected).
 *
 * Prefer focus over visualViewport math: with `interactive-widget:
 * resizes-content`, `innerHeight` already shrinks with the keyboard so a
 * "covered height" check goes to ~0 and would leave the tab bar stacked
 * under the Buddy composer — exactly the cramped chrome we want to avoid.
 */
export function useVirtualKeyboardOpen() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let blurTimer: number | undefined

    const update = () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches
      setOpen(mobile && isTextEntryElement(document.activeElement))
    }

    const onFocusIn = () => {
      window.clearTimeout(blurTimer)
      update()
    }

    const onFocusOut = () => {
      // Let focus settle on the next field before showing the nav again.
      blurTimer = window.setTimeout(update, 50)
    }

    update()
    window.addEventListener("focusin", onFocusIn)
    window.addEventListener("focusout", onFocusOut)
    return () => {
      window.clearTimeout(blurTimer)
      window.removeEventListener("focusin", onFocusIn)
      window.removeEventListener("focusout", onFocusOut)
    }
  }, [])

  return open
}
