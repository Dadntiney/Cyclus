import { isTabRoot, normalizePath, ownerTab, titleForPath, type TabHref } from "./features"

/**
 * Pure model of the in-app history (no DOM): which screens she passed,
 * which tab each one belongs to, and what they were called. The browser
 * binding in nav-store.ts feeds it real pushState / replaceState / popstate
 * events; tests feed it directly.
 *
 * - push: a new screen. A tab root starts its own tab; any other screen
 *   inherits the tab of the screen it was opened from ("tab van herkomst").
 * - replace: the current screen is swapped and keeps its tab.
 * - pop: back (or forward) through the browser history.
 */

/** One history entry. `key` = path + search (a hash is never a new screen). */
export interface NavEntry {
  key: string
  path: string
  tab: TabHref
}

export type NavAction = "init" | "push" | "replace" | "pop" | "forward" | "reset"

export interface NavState {
  stack: NavEntry[]
  /** Entries we went back past, so browser-forward lands correctly. */
  forward: NavEntry[]
  /** Names a page registered for itself (PageHeader / AppBarConfig), by path. */
  titles: Record<string, string>
  /** Text of the page's h1 as observed by the app bar, by path (weaker). */
  observed: Record<string, string>
  /** The last thing that happened, for PageTransition (animate / scroll). */
  last: { action: NavAction; key: string }
}

export const MAX_STACK = 40
const MAX_TITLES = 80
/** Longer back labels become "Terug" in the app bar (§4.6). */
export const MAX_BACK_LABEL = 18
export const GENERIC_BACK_LABEL = "Terug"

/** "/voeding/12?x=1#a" → { key: "/voeding/12?x=1", path: "/voeding/12" } */
export function toKey(url: string): { key: string; path: string } {
  const noHash = url.split("#")[0] ?? ""
  const q = noHash.indexOf("?")
  const path = normalizePath(q === -1 ? noHash : noHash.slice(0, q))
  const search = q === -1 ? "" : noHash.slice(q)
  return { key: search && search !== "?" ? `${path}${search}` : path, path }
}

function entryFor(url: string, tab: TabHref): NavEntry {
  const { key, path } = toKey(url)
  return { key, path, tab }
}

function top(state: NavState): NavEntry | undefined {
  return state.stack[state.stack.length - 1]
}

/** Is this a usable persisted state (sessionStorage can hold anything)? */
export function isNavState(value: unknown): value is NavState {
  if (!value || typeof value !== "object") return false
  const v = value as Partial<NavState>
  return (
    Array.isArray(v.stack) &&
    v.stack.every((e) => e && typeof e.key === "string" && typeof e.path === "string" && typeof e.tab === "string") &&
    Array.isArray(v.forward ?? []) &&
    typeof (v.titles ?? {}) === "object"
  )
}

/**
 * Start for the page that just loaded. A reload of the same screen keeps
 * the persisted stack (the browser kept its history too); anything else is
 * a fresh start: one entry, owned by its canonical tab.
 */
export function initState(url: string, persisted?: unknown): NavState {
  const { key } = toKey(url)
  if (isNavState(persisted) && persisted.stack.length > 0 && persisted.stack[persisted.stack.length - 1].key === key) {
    return {
      stack: persisted.stack.slice(-MAX_STACK),
      forward: (persisted.forward ?? []).slice(-MAX_STACK),
      titles: { ...(persisted.titles ?? {}) },
      observed: { ...(persisted.observed ?? {}) },
      last: { action: "init", key },
    }
  }
  const titles = isNavState(persisted) ? { ...(persisted.titles ?? {}) } : {}
  const observed = isNavState(persisted) ? { ...(persisted.observed ?? {}) } : {}
  const { path } = toKey(url)
  return {
    stack: [entryFor(url, ownerTab(path))],
    forward: [],
    titles,
    observed,
    last: { action: "init", key },
  }
}

/** Tab for a screen opened from `from` with a push. */
function inheritedTab(path: string, from: NavEntry | undefined): TabHref {
  if (isTabRoot(path)) return path
  return from?.tab ?? ownerTab(path)
}

export function applyPush(state: NavState, url: string): NavState {
  const { key, path } = toKey(url)
  const stack = [...state.stack, { key, path, tab: inheritedTab(path, top(state)) }]
  return {
    ...state,
    stack: stack.length > MAX_STACK ? stack.slice(stack.length - MAX_STACK) : stack,
    forward: [],
    last: { action: "push", key },
  }
}

export function applyReplace(state: NavState, url: string): NavState {
  const { key, path } = toKey(url)
  const current = top(state)
  if (current && current.key === key) return state
  // A lone entry came from a deep link: it has no origin to inherit from.
  const tab: TabHref = isTabRoot(path)
    ? path
    : state.stack.length <= 1
      ? ownerTab(path)
      : (current?.tab ?? ownerTab(path))
  return {
    ...state,
    stack: [...state.stack.slice(0, -1), { key, path, tab }],
    last: { action: "replace", key },
  }
}

/**
 * popstate: the browser moved to `url`. Work out where in our stack that
 * is: one back (the usual), one forward, several back, or unknown.
 */
export function applyPop(state: NavState, url: string): NavState {
  const { key } = toKey(url)
  const { stack, forward } = state
  const n = stack.length

  // One step back.
  if (n >= 2 && stack[n - 2].key === key) {
    return {
      ...state,
      stack: stack.slice(0, -1),
      forward: [...forward, stack[n - 1]],
      last: { action: "pop", key },
    }
  }
  // One step forward.
  const next = forward[forward.length - 1]
  if (next && next.key === key) {
    return {
      ...state,
      stack: [...stack, next],
      forward: forward.slice(0, -1),
      last: { action: "forward", key },
    }
  }
  // Same screen (a native #anchor entry): nothing changes.
  if (n >= 1 && stack[n - 1].key === key) return state
  // Several steps back (history.go(-n)).
  for (let i = n - 3; i >= 0; i--) {
    if (stack[i].key === key) {
      const dropped = stack.slice(i + 1).reverse()
      return {
        ...state,
        stack: stack.slice(0, i + 1),
        forward: [...forward, ...dropped],
        last: { action: "pop", key },
      }
    }
  }
  // Somewhere we never saw (history from before this page load): treat it
  // like a deep link — canonical tab, no in-app history to go back to.
  return {
    ...state,
    stack: [entryFor(url, ownerTab(toKey(url).path))],
    forward: [],
    last: { action: "reset", key },
  }
}

function prune(map: Record<string, string>, keep: Set<string>): Record<string, string> {
  const keys = Object.keys(map)
  if (keys.length <= MAX_TITLES) return map
  const next: Record<string, string> = {}
  // Keep titles of screens still on the stack, then the most recent others.
  for (const k of keys) if (keep.has(k)) next[k] = map[k]
  for (const k of keys.slice(-Math.floor(MAX_TITLES / 2))) next[k] = map[k]
  return next
}

/**
 * Remember what a screen is called. `page` = the page said so itself
 * (PageHeader, AppBarConfig); `observed` = the app bar read its h1.
 */
export function applyTitle(
  state: NavState,
  url: string,
  title: string,
  source: "page" | "observed" = "page",
): NavState {
  const { path } = toKey(url)
  const clean = title.replace(/\s+/g, " ").trim()
  if (!clean) return state
  const field = source === "page" ? "titles" : "observed"
  if (state[field][path] === clean) return state
  const keep = new Set(state.stack.map((e) => e.path))
  return { ...state, [field]: prune({ ...state[field], [path]: clean }, keep) }
}

/** Best known name for a screen: its own registration, the fixed name, then its h1. */
export function titleOf(state: NavState | null, path: string): string | null {
  const p = normalizePath(path)
  return state?.titles[p] ?? titleForPath(p) ?? state?.observed[p] ?? null
}

/**
 * The tab to light up for `pathname`, computed synchronously (besluit 8).
 * Before the history write for a new screen has happened (its first
 * render), it is the tab the push will give it.
 */
export function activeTabFor(state: NavState | null, pathname: string): TabHref {
  const path = normalizePath(pathname)
  if (!state) return ownerTab(path)
  const current = top(state)
  if (current && current.path === path) return current.tab
  return inheritedTab(path, current)
}

/** Is there an in-app screen that router.back() would land on? */
export function hasHistory(state: NavState | null): boolean {
  return !!state && state.stack.length >= 2
}

export type BackTarget =
  | { mode: "history"; href: string; label: string }
  | { mode: "link"; href: string; label: string }

/**
 * What "‹ Vorige" should say and do on `pathname`.
 * - history: the real previous screen; label = its name, or "Terug" when
 *   unknown (never the logical parent's name — besluit 7).
 * - link: no history (deep link): go to the logical parent `fallback`.
 */
export function backTargetFor(
  state: NavState | null,
  pathname: string,
  fallback: { href: string; label: string } | null,
): BackTarget | null {
  const path = normalizePath(pathname)
  if (state) {
    const n = state.stack.length
    const current = state.stack[n - 1]
    // On its first render a pushed screen is not on the stack yet: the
    // screen below it will be the current top.
    const previous = current && current.path === path ? state.stack[n - 2] : current
    if (previous) {
      return {
        mode: "history",
        href: previous.key,
        label: titleOf(state, previous.path) ?? GENERIC_BACK_LABEL,
      }
    }
  }
  return fallback ? { mode: "link", href: fallback.href, label: fallback.label } : null
}

/** App-bar version of a back label: long names become "Terug" (§4.6). */
export function compactBackLabel(label: string): string {
  return label.length > MAX_BACK_LABEL ? GENERIC_BACK_LABEL : label
}
