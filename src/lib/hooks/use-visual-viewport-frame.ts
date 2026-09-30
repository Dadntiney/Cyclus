"use client"

import { useSyncExternalStore } from "react"

export type VisualViewportFrame = {
  offsetTop: number
  height: number
  /** Pixels the visual viewport is shorter than the tallest recent height. */
  covered: number
  keyboardOpen: boolean
}

const KEYBOARD_THRESHOLD_PX = 140

let baseline = 0
let frame: VisualViewportFrame = {
  offsetTop: 0,
  height: 0,
  covered: 0,
  keyboardOpen: false,
}
const listeners = new Set<() => void>()
let attached = false

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

function readFrame(): VisualViewportFrame {
  return frame
}

function serverFrame(): VisualViewportFrame {
  return { offsetTop: 0, height: 0, covered: 0, keyboardOpen: false }
}

function publish() {
  const vv = window.visualViewport
  const offsetTop = vv?.offsetTop ?? 0
  const height = vv?.height ?? window.innerHeight
  if (!baseline || height > baseline) baseline = height
  const covered = Math.max(0, baseline - height)
  // Require both a real shrink AND a focused text field. Rubber-band
  // overscroll can briefly shorten the visual viewport — without focus
  // that must not hide the tab bar. Focus alone is also not enough: iOS
  // can dismiss the keyboard while leaving the input focused.
  const editing = isTextEntryElement(document.activeElement)
  const next: VisualViewportFrame = {
    offsetTop,
    height,
    covered,
    keyboardOpen: editing && covered > KEYBOARD_THRESHOLD_PX,
  }
  frame = next
  listeners.forEach((l) => l())
}

function onOrientation() {
  baseline = window.visualViewport?.height ?? window.innerHeight
  publish()
}

function ensureAttached() {
  if (attached || typeof window === "undefined") return
  attached = true
  baseline = window.visualViewport?.height ?? window.innerHeight
  publish()
  window.visualViewport?.addEventListener("resize", publish)
  window.visualViewport?.addEventListener("scroll", publish)
  window.addEventListener("resize", publish)
  window.addEventListener("orientationchange", onOrientation)
  window.addEventListener("focusin", publish)
  window.addEventListener("focusout", publish)
}

function subscribe(listener: () => void) {
  ensureAttached()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Shared visual-viewport frame for mobile keyboard chrome (Buddy).
 *
 * Compares `vv.height` to a rising baseline to detect the soft keyboard,
 * gated on a focused text field so pull-to-overscroll cannot yank chrome.
 */
export function useVisualViewportFrame(): VisualViewportFrame {
  return useSyncExternalStore(subscribe, readFrame, serverFrame)
}
