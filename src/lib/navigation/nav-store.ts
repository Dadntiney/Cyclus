import { normalizePath, type TabHref } from "./features"
import {
  activeTabFor,
  applyPop,
  applyPush,
  applyReplace,
  applyTitle,
  backTargetFor,
  hasHistory as stateHasHistory,
  initState,
  type BackTarget,
  type NavAction,
  type NavState,
} from "./nav-stack"

/**
 * Browser binding of the navigation model (nav-stack.ts): one store per
 * tab, persisted in sessionStorage so a reload keeps "where she came from".
 *
 * Push vs replace is not guessed: history.pushState / replaceState are
 * wrapped once (besluit 7), so every Next.js navigation, router.replace,
 * redirect and manual history.replaceState is classified exactly; popstate
 * covers back and forward. The wrap installs at module load (before Next
 * patches history in its own effect), so Next's patch sits on top of ours
 * and both keep working.
 */

const STORAGE_KEY = "gofiev:nav"

type Listener = () => void

let state: NavState | null = null
const listeners = new Set<Listener>()
let notifyQueued = false
let installed = false

function currentUrl(): string {
  return `${window.location.pathname}${window.location.search}`
}

function readPersisted(): unknown {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function persist(next: NavState) {
  try {
    const { stack, forward, titles, observed } = next
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ stack, forward, titles, observed }))
  } catch {
    // Private mode / storage full: the in-memory stack still works.
  }
}

function notify() {
  // History writes happen inside React's insertion effects; React must not
  // receive store updates there, so subscribers hear about it a tick later.
  if (notifyQueued) return
  notifyQueued = true
  queueMicrotask(() => {
    notifyQueued = false
    listeners.forEach((l) => l())
  })
}

/**
 * Did this page load return to history the browser still has (a reload,
 * or back/forward into the app)? Only then is the stored stack still true.
 * A fresh load of the same URL (a link from outside, a typed URL, a PWA
 * launch) has no in-app screen behind it. Unknown → keep the stack.
 */
function loadReturnsToHistory(): boolean {
  try {
    const [entry] = (window.performance?.getEntriesByType?.("navigation") ?? []) as PerformanceNavigationTiming[]
    if (!entry?.type) return true
    return entry.type === "reload" || entry.type === "back_forward"
  } catch {
    return true
  }
}

function getState(): NavState {
  if (!state) {
    state = initState(currentUrl(), readPersisted(), { restoreStack: loadReturnsToHistory() })
  }
  return state
}

function setState(next: NavState) {
  if (next === state) return
  state = next
  persist(next)
  notify()
}

/** Wrap pushState/replaceState and listen to popstate — once per page load. */
export function ensureHistoryTracking() {
  if (installed || typeof window === "undefined") return
  installed = true
  getState()

  const history = window.history
  const push = history.pushState
  const replace = history.replaceState

  history.pushState = function pushState(this: History, ...args: Parameters<History["pushState"]>) {
    getState()
    const result = push.apply(this, args)
    setState(applyPush(getState(), currentUrl()))
    return result
  }
  history.replaceState = function replaceState(this: History, ...args: Parameters<History["replaceState"]>) {
    getState()
    const result = replace.apply(this, args)
    setState(applyReplace(getState(), currentUrl()))
    return result
  }
  window.addEventListener("popstate", () => {
    setState(applyPop(getState(), currentUrl()))
  })
}

if (typeof window !== "undefined") ensureHistoryTracking()

/* ——— Reading ——— */

export function subscribeNav(listener: Listener): () => void {
  ensureHistoryTracking()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Client snapshot for useSyncExternalStore (stable until something changes). */
export function getNavSnapshot(): NavState {
  ensureHistoryTracking()
  return getState()
}

/** Server snapshot: no history known; callers fall back to ownerTab(). */
export function getServerNavSnapshot(): NavState | null {
  return null
}

/** Is there an in-app screen that router.back() would land on? */
export function hasHistory(): boolean {
  if (typeof window === "undefined") return false
  ensureHistoryTracking()
  return stateHasHistory(getState())
}

export function getActiveTab(pathname: string): TabHref {
  return activeTabFor(typeof window === "undefined" ? null : getState(), pathname)
}

export function getBackTarget(
  pathname: string,
  fallback: { href: string; label: string } | null,
): BackTarget | null {
  return backTargetFor(typeof window === "undefined" ? null : getState(), pathname, fallback)
}

/** The last navigation (push / replace / pop …) and the URL it went to. */
export function getLastNavigation(): { action: NavAction; key: string } {
  if (typeof window === "undefined") return { action: "init", key: "" }
  return getState().last
}

/* ——— Writing ——— */

/**
 * Remember a screen's name for the next screen's back label. `page` for a
 * name the page sets itself; `observed` for its h1 as the app bar saw it.
 */
export function registerTitle(path: string, title: string, source: "page" | "observed" = "page") {
  if (typeof window === "undefined") return
  setState(applyTitle(getState(), normalizePath(path), title, source))
}

type BackRouter = { back(): void; replace(href: string): void }

/**
 * Go back to where she came from; without in-app history (deep link,
 * notification) replace the current screen with `fallbackHref`. Never
 * pushes a parent, so no back-loop (NAV-1).
 */
export function goBackOr(router: BackRouter, fallbackHref: string) {
  if (hasHistory()) router.back()
  else router.replace(fallbackHref)
}

/** Swap the current screen for `href` (no new history entry). */
export function replaceTo(router: { replace(href: string): void }, href: string) {
  router.replace(href)
}
