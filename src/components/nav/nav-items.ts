import { TAB_FEATURES, ownerTab } from "@/lib/navigation/features"

/**
 * The five primary tabs, derived from the one feature table
 * (src/lib/navigation/features.ts) so names and icons never drift.
 *
 * Which tab is *active* is not decided here any more: a screen opened from
 * another tab keeps that tab lit ("tab van herkomst"), see
 * src/lib/navigation/nav-store.ts. `isNavActive` only answers the canonical
 * question "who owns this route" (deep link, reload, server render).
 */
export const NAV_ITEMS = TAB_FEATURES.map(({ href, label, icon }) => ({ href, label, icon }))

export type NavItem = (typeof NAV_ITEMS)[number]

export function isNavActive(path: string, item: NavItem): boolean {
  return ownerTab(path) === item.href
}
