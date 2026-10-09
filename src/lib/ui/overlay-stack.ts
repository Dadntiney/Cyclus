/**
 * Module-level overlay stack (besluit 19).
 *
 * Every open BottomSheet / Dialog pushes one entry. The stack length is the
 * reference count for the shared side effects, so two overlays never fight:
 * - 0 → 1: lock page scroll, make the app behind inert, listen for keys.
 * - n → n+1: the previous top overlay becomes inert as well.
 * - top removed: the new top becomes interactive again.
 * - 1 → 0: everything is released synchronously (no stale `inert`).
 *
 * Only the top overlay receives Escape and Tab. The DOM work sits behind a
 * small environment interface so the bookkeeping is unit-testable without
 * a browser (see overlay-stack.test.ts).
 */

export interface OverlayEntry {
  /** Outermost element of the overlay (its portal root). */
  root: HTMLElement | null
  /** Escape pressed while this overlay is on top. */
  onEscape: () => void
  /** Tab / Shift+Tab pressed while this overlay is on top (focus trap). */
  onTab: (event: KeyboardEvent) => void
}

export interface OverlayKeyEvent {
  key: string
  defaultPrevented: boolean
  /** True while an IME is composing (Escape then cancels the composition). */
  isComposing?: boolean
  preventDefault: () => void
}

export interface OverlayStackEnv {
  /** Lock page scroll. Returns the restore function. */
  lockScroll: () => () => void
  /**
   * Make everything behind the overlays inert. `isOverlayRoot` tells which
   * elements belong to an overlay and must stay interactive. Returns undo.
   */
  inertBackground: (isOverlayRoot: (el: Element) => boolean) => () => void
  /** Start listening for keydown on the document. Returns the remover. */
  listenKeys: (handler: (event: KeyboardEvent) => void) => () => void
  /** Toggle inert on one overlay root (for stacked overlays). */
  setInert: (el: HTMLElement, inert: boolean) => void
}

export interface OverlayStack {
  /** Register an open overlay. Returns its release function (idempotent). */
  push: (entry: OverlayEntry) => () => void
  /** Remove an overlay wherever it sits in the stack. */
  remove: (entry: OverlayEntry) => void
  size: () => number
  top: () => OverlayEntry | null
  isTop: (entry: OverlayEntry) => boolean
  /** Exposed for tests: route a key event like the document listener does. */
  handleKey: (event: OverlayKeyEvent) => void
}

export function createOverlayStack(env: OverlayStackEnv): OverlayStack {
  const stack: OverlayEntry[] = []
  let releases: (() => void)[] = []

  function top() {
    return stack.length ? stack[stack.length - 1] : null
  }

  function handleKey(event: OverlayKeyEvent) {
    const current = top()
    if (!current) return
    if (event.key === "Escape") {
      // A control inside the overlay (e.g. a native select) already used it,
      // or the keyboard is composing a character.
      if (event.defaultPrevented || event.isComposing) return
      event.preventDefault()
      current.onEscape()
    } else if (event.key === "Tab") {
      current.onTab(event as KeyboardEvent)
    }
  }

  function remove(entry: OverlayEntry) {
    const index = stack.indexOf(entry)
    if (index === -1) return
    const wasTop = index === stack.length - 1
    stack.splice(index, 1)

    if (stack.length === 0) {
      const toRun = releases
      releases = []
      for (let i = toRun.length - 1; i >= 0; i--) toRun[i]()
      return
    }

    if (wasTop) {
      const next = top()
      if (next?.root) env.setInert(next.root, false)
    }
  }

  function push(entry: OverlayEntry) {
    if (stack.includes(entry)) return () => remove(entry)
    const previous = top()
    stack.push(entry)

    if (stack.length === 1) {
      releases = [
        env.lockScroll(),
        env.inertBackground((el) => stack.some((s) => s.root === el)),
        env.listenKeys((event) => handleKey(event)),
      ]
    } else if (previous?.root) {
      env.setInert(previous.root, true)
    }

    return () => remove(entry)
  }

  return {
    push,
    remove,
    size: () => stack.length,
    top,
    isTop: (entry) => top() === entry,
    handleKey,
  }
}

/** The real browser environment. `#app-root` is set by the app shell. */
export function createDomOverlayEnv(doc: Document = document): OverlayStackEnv {
  return {
    lockScroll() {
      const body = doc.body
      const previous = body.style.overflow
      body.style.overflow = "hidden"
      return () => {
        body.style.overflow = previous
      }
    },

    inertBackground(isOverlayRoot) {
      const appRoot = doc.getElementById("app-root")
      if (appRoot) {
        const wasInert = appRoot.inert
        appRoot.inert = true
        return () => {
          appRoot.inert = wasInert
        }
      }
      // No #app-root (yet): make every other top-level body child inert,
      // remembering exactly which ones we touched.
      const touched: HTMLElement[] = []
      for (const child of Array.from(doc.body.children)) {
        if (!(child instanceof HTMLElement)) continue
        if (child.tagName === "SCRIPT" || child.tagName === "STYLE" || child.tagName === "TEMPLATE") continue
        if (isOverlayRoot(child) || child.inert) continue
        child.inert = true
        touched.push(child)
      }
      return () => {
        for (const el of touched) el.inert = false
      }
    },

    listenKeys(handler) {
      doc.addEventListener("keydown", handler)
      return () => doc.removeEventListener("keydown", handler)
    },

    setInert(el, inert) {
      el.inert = inert
    },
  }
}

let shared: OverlayStack | null = null

/** The one app-wide stack (created on first use, client only). */
export function getOverlayStack(): OverlayStack {
  if (!shared) shared = createOverlayStack(createDomOverlayEnv())
  return shared
}
