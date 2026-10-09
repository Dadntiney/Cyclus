"use client"

import { useLayoutEffect, useSyncExternalStore } from "react"

/**
 * Immersive mode (ontwerpvisie §4.6): an active training, listening to a
 * guided exercise or the medication wizard. The tab bar steps aside so the
 * screen's own primary action (StickyActionBar) sits in the thumb zone.
 *
 * The app bar stays by default — a training session puts "✕ Stoppen" and its
 * progress there via <AppBarConfig>. Pass `{ appBar: "hide" }` for a screen
 * that needs the whole height (listening mode); the status-bar strip stays
 * so nothing slides under the clock.
 *
 * Requests are ref-counted, so two components asking at once (and React's
 * strict-mode double effects) never leave the app stuck in immersive mode.
 * Also mirrored on <html data-immersive="true" data-immersive-app-bar="hide">
 * for CSS (StickyActionBar's safe-area padding).
 */

export type ImmersiveAppBar = "keep" | "hide"

export interface ImmersiveState {
  immersive: boolean
  appBarHidden: boolean
}

const OFF: ImmersiveState = { immersive: false, appBarHidden: false }

/** Ref-counted registry, separate from the DOM so it can be unit-tested. */
export function createImmersiveStore(apply: (state: ImmersiveState) => void = () => {}) {
  const requests = new Map<number, ImmersiveAppBar>()
  const listeners = new Set<() => void>()
  let seq = 0
  let snapshot: ImmersiveState = OFF

  function recompute() {
    const immersive = requests.size > 0
    const appBarHidden = [...requests.values()].includes("hide")
    if (immersive === snapshot.immersive && appBarHidden === snapshot.appBarHidden) return
    snapshot = immersive ? { immersive, appBarHidden } : OFF
    apply(snapshot)
    listeners.forEach((l) => l())
  }

  return {
    /** Ask for immersive mode; call the returned function to let go. */
    request(appBar: ImmersiveAppBar = "keep"): () => void {
      const id = ++seq
      requests.set(id, appBar)
      recompute()
      return () => {
        if (requests.delete(id)) recompute()
      }
    },
    getSnapshot: (): ImmersiveState => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

function applyToDocument(state: ImmersiveState) {
  if (typeof document === "undefined") return
  const html = document.documentElement
  if (state.immersive) html.dataset.immersive = "true"
  else delete html.dataset.immersive
  if (state.appBarHidden) html.dataset.immersiveAppBar = "hide"
  else delete html.dataset.immersiveAppBar
}

const store = createImmersiveStore(applyToDocument)

/**
 * Put the app in immersive mode while this component is mounted and
 * `active` is true. Example: `useImmersive(sessionStarted)`.
 */
export function useImmersive(active = true, options?: { appBar?: ImmersiveAppBar }) {
  const appBar = options?.appBar ?? "keep"
  // Layout effect: the tab bar is gone before the first paint of the screen.
  useLayoutEffect(() => {
    if (!active) return
    return store.request(appBar)
  }, [active, appBar])
}

/** Current immersive state (for the tab bar, app bar and sidebar). */
export function useImmersiveState(): ImmersiveState {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => OFF)
}

/** Shorthand: is any screen immersive right now? */
export function useImmersiveActive(): boolean {
  return useImmersiveState().immersive
}
