import { useSyncExternalStore } from "react"
import type { TabHref } from "./features"
import { activeTabFor, backTargetFor, type BackTarget, type NavState } from "./nav-stack"
import { getNavSnapshot, getServerNavSnapshot, subscribeNav } from "./nav-store"

/**
 * The navigation store as React state. On the server (and during
 * hydration) it is `null`, so everything falls back to the canonical owner
 * of the route; right after hydration the real history takes over (one
 * frame of correction after a reload is accepted — besluit 8).
 */
export function useNavState(): NavState | null {
  return useSyncExternalStore(subscribeNav, getNavSnapshot, getServerNavSnapshot)
}

/** The tab to highlight for this pathname: tab of origin, else the owner. */
export function useActiveTab(pathname: string): TabHref {
  return activeTabFor(useNavState(), pathname)
}

/** "‹ Vorige" for this pathname: the real previous screen, else `fallback`. */
export function useBackTarget(
  pathname: string,
  fallback: { href: string; label: string } | null,
): BackTarget | null {
  return backTargetFor(useNavState(), pathname, fallback)
}
