"use client"

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react"
import { usePathname } from "next/navigation"
import { registerTitle } from "@/lib/navigation/nav-store"

/**
 * What a screen tells the mobile app bar (ontwerpvisie §4.6). Every field
 * is optional; the bar fills the gaps itself (back from history or the
 * logical parent, title from the page's h1 or the fixed name).
 */
export interface AppBarOptions {
  /** Compact title in the centre. Default: the fixed name of the route, else the page's h1. */
  title?: string
  /**
   * Where "‹ Vorige" goes when there is no in-app history (deep link).
   * Default: the logical parent from features.ts. `false` = no back here.
   */
  back?: { href: string; label: string } | false
  /** Replaces the back control on the left (e.g. "✕ Stoppen", the Buddy mark). */
  leading?: ReactNode
  /** The one action on the right, with a 44px target (IconButton or a text action). */
  action?: ReactNode
  /** Show the compact title right away — for screens without a visible h1. */
  alwaysShowTitle?: boolean
  /** Always draw the hairline under the bar (not only once the page scrolled). */
  divider?: boolean
  /** The large title; the compact title fades in once this scrolls under the bar. */
  titleRef?: RefObject<HTMLElement | null>
}

/** Who registered: later layers win per field. */
export const APP_BAR_PRIORITY = { backButton: 0, pageHeader: 1, config: 2 } as const

type Registration = { priority: number; seq: number; options: AppBarOptions }

export function createAppBarStore() {
  const registrations = new Map<string, Registration>()
  const listeners = new Set<() => void>()
  let seq = 0
  let merged: AppBarOptions = {}

  function recompute() {
    const ordered = [...registrations.values()].sort((a, b) => a.priority - b.priority || a.seq - b.seq)
    const next: AppBarOptions = {}
    for (const { options } of ordered) {
      for (const [key, value] of Object.entries(options) as [keyof AppBarOptions, unknown][]) {
        if (value !== undefined) (next as Record<string, unknown>)[key] = value
      }
    }
    merged = next
    listeners.forEach((l) => l())
  }

  return {
    set(id: string, priority: number, options: AppBarOptions) {
      const existing = registrations.get(id)
      registrations.set(id, { priority, seq: existing?.seq ?? ++seq, options })
      recompute()
    },
    remove(id: string) {
      if (registrations.delete(id)) recompute()
    },
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    get: (): AppBarOptions => merged,
  }
}

export type AppBarStore = ReturnType<typeof createAppBarStore>

const AppBarContext = createContext<AppBarStore | null>(null)

/** Wraps the app bar and <main> in the (app) layout. */
export function AppBarProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createAppBarStore)
  return <AppBarContext.Provider value={store}>{children}</AppBarContext.Provider>
}

/** True inside the app shell (there is a mobile app bar to register with). */
export function useHasAppBar(): boolean {
  return useContext(AppBarContext) !== null
}

const EMPTY: AppBarOptions = {}

/** The merged options of everything on screen (for the app bar itself). */
export function useAppBarOptions(): AppBarOptions {
  const store = useContext(AppBarContext)
  return useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    store?.get ?? getEmpty,
    getEmpty,
  )
}

function noopSubscribe() {
  return () => {}
}
function getEmpty() {
  return EMPTY
}

/**
 * Register options with the app bar for as long as the caller is mounted.
 * Registered in a layout effect, so the bar is right before the first paint.
 */
export function useAppBarRegistration(priority: number, options: AppBarOptions) {
  const store = useContext(AppBarContext)
  const id = useId()
  const pathname = usePathname()
  const { title, back, leading, action, alwaysShowTitle, divider, titleRef } = options
  const backHref = back ? back.href : undefined
  const backLabel = back ? back.label : undefined
  const noBack = back === false

  useLayoutEffect(() => {
    if (!store) return
    store.set(id, priority, {
      title,
      back: noBack ? false : backHref !== undefined && backLabel !== undefined ? { href: backHref, label: backLabel } : undefined,
      leading,
      action,
      alwaysShowTitle,
      divider,
      titleRef,
    })
  }, [store, id, priority, title, noBack, backHref, backLabel, leading, action, alwaysShowTitle, divider, titleRef])

  useLayoutEffect(() => {
    if (!store) return
    return () => store.remove(id)
  }, [store, id])

  // A page that names itself also names the back label of the next screen.
  useEffect(() => {
    if (title && priority >= APP_BAR_PRIORITY.pageHeader) registerTitle(pathname, title)
  }, [pathname, title, priority])
}

/**
 * Configure the app bar from a screen without a PageHeader (Buddy, a
 * training session, a wizard step). Renders nothing.
 *
 * ```tsx
 * <AppBarConfig title="Buddy" alwaysShowTitle action={<IconButton label="Over Buddy" icon={Info} onClick={open} />} />
 * <AppBarConfig leading={<Button variant="ghost" size="sm" onClick={askStop}>Stoppen</Button>} title="1 van 3" alwaysShowTitle />
 * ```
 */
export function AppBarConfig(props: AppBarOptions) {
  useAppBarRegistration(APP_BAR_PRIORITY.config, props)
  return null
}

/**
 * For a page with its own large title (Profiel hero): the compact title
 * fades into the app bar once `ref` scrolls under it, and `compactTitle`
 * becomes the back label of the next screen.
 */
export function useAppBarTitle(ref: RefObject<HTMLElement | null>, compactTitle?: string) {
  useAppBarRegistration(APP_BAR_PRIORITY.pageHeader, { titleRef: ref, title: compactTitle })
}
