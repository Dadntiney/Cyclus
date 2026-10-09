/**
 * Small focus helpers for overlays (focus trap) — DOM only, client only.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "summary",
  '[contenteditable="true"]',
  "[tabindex]",
].join(",")

/** Elements inside `container` that Tab can reach, in DOM order. */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      // Roving radios and programmatic targets (tabIndex -1) are skipped.
      el.tabIndex >= 0 &&
      !el.closest("[inert]") &&
      // display:none / detached elements have no boxes.
      el.getClientRects().length > 0,
  )
}

/**
 * Keep Tab and Shift+Tab inside `container`. Call from a keydown handler
 * for the Tab key only. Focus that sits on a non-tabbable element inside
 * the container (its title or the panel itself) wraps correctly too.
 */
export function trapTab(event: KeyboardEvent, container: HTMLElement) {
  const tabbable = getTabbableElements(container)
  const active = container.ownerDocument.activeElement as HTMLElement | null

  if (tabbable.length === 0) {
    event.preventDefault()
    container.focus({ preventScroll: true })
    return
  }

  const first = tabbable[0]
  const last = tabbable[tabbable.length - 1]
  const inside = active !== null && container.contains(active)
  const onTabbable = active !== null && tabbable.includes(active)

  if (event.shiftKey) {
    if (!inside || active === first || !onTabbable) {
      event.preventDefault()
      last.focus({ preventScroll: true })
    }
  } else if (!inside || active === last) {
    event.preventDefault()
    first.focus({ preventScroll: true })
  }
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/**
 * Hand focus to a heading or other element after the control she used
 * disappears (a removed row, a dismissed banner), instead of letting it
 * fall back to the document. Non-focusable targets get `tabindex="-1"`
 * and the quiet focus style of `[data-focus-target]`. Returns whether an
 * element was found.
 */
export function focusElementById(id: string): boolean {
  const el = typeof document === "undefined" ? null : document.getElementById(id)
  if (!el) return false
  if (el.tabIndex < 0 && !el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1")
    el.setAttribute("data-focus-target", "")
  }
  // Scrolls only when the target is out of view.
  el.focus()
  return true
}
