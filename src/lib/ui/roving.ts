/**
 * Pure key logic for a roving-tabindex radio group (WAI-ARIA radio pattern):
 * one Tab stop per group, arrow keys move the selection, Home/End jump to
 * the ends, and the movement wraps around. Disabled options are skipped.
 */

export type RovingOrientation = "horizontal" | "vertical" | "both"

export interface RovingOptions {
  orientation?: RovingOrientation
  /** Wrap from last to first and back (default true, like native radios). */
  loop?: boolean
  isDisabled?: (index: number) => boolean
}

const NEXT: Record<RovingOrientation, string[]> = {
  horizontal: ["ArrowRight"],
  vertical: ["ArrowDown"],
  both: ["ArrowRight", "ArrowDown"],
}
const PREV: Record<RovingOrientation, string[]> = {
  horizontal: ["ArrowLeft"],
  vertical: ["ArrowUp"],
  both: ["ArrowLeft", "ArrowUp"],
}

/** First enabled index scanning from `start` in `step` direction, or null. */
function scan(start: number, step: 1 | -1, count: number, loop: boolean, isDisabled: (i: number) => boolean) {
  let index = start
  for (let tries = 0; tries < count; tries++) {
    if (index < 0 || index >= count) {
      if (!loop) return null
      index = (index + count) % count
    }
    if (!isDisabled(index)) return index
    index += step
  }
  return null
}

/**
 * Index the key should move to, or null when the key is not handled
 * (let the browser do its default, e.g. Tab or Space).
 */
export function getRovingTarget(
  key: string,
  current: number,
  count: number,
  { orientation = "both", loop = true, isDisabled = () => false }: RovingOptions = {},
): number | null {
  if (count <= 0) return null
  if (key === "Home") return scan(0, 1, count, false, isDisabled)
  if (key === "End") return scan(count - 1, -1, count, false, isDisabled)
  if (NEXT[orientation].includes(key)) {
    const target = scan(current + 1, 1, count, loop, isDisabled)
    return target === current ? null : target
  }
  if (PREV[orientation].includes(key)) {
    const target = scan(current - 1, -1, count, loop, isDisabled)
    return target === current ? null : target
  }
  return null
}

/**
 * The one index that gets tabIndex=0: the selected option, otherwise the
 * first enabled one (so Tab always lands somewhere sensible).
 */
export function getRovingTabStop(
  selectedIndex: number,
  count: number,
  isDisabled: (index: number) => boolean = () => false,
): number {
  if (selectedIndex >= 0 && selectedIndex < count && !isDisabled(selectedIndex)) return selectedIndex
  return scan(0, 1, count, false, isDisabled) ?? -1
}
