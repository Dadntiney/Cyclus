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
  const next: VisualViewportFrame = {
    offsetTop,
    height,
    covered,
    keyboardOpen: covered > KEYBOARD_THRESHOLD_PX,
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
}

function subscribe(listener: () => void) {
  ensureAttached()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Shared visual-viewport frame for mobile keyboard chrome.
 *
 * iOS Safari often overlays the keyboard without a trustworthy
 * `innerHeight - vv.height` delta (especially with
 * `interactive-widget: resizes-content`). Comparing against the tallest
 * recent `vv.height` detects the keyboard. Consumers size fixed chrome
 * with `offsetTop` + `height` so the Buddy composer stays in view.
 */
export function useVisualViewportFrame(): VisualViewportFrame {
  return useSyncExternalStore(subscribe, readFrame, serverFrame)
}
