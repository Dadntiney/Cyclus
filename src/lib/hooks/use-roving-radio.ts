"use client"

import { useId } from "react"
import type { KeyboardEvent } from "react"
import { getRovingTabStop, getRovingTarget, type RovingOrientation } from "@/lib/ui/roving"

interface UseRovingRadioOptions {
  count: number
  /** Index of the checked option, or -1 when nothing is chosen yet. */
  selectedIndex: number
  onSelect: (index: number) => void
  orientation?: RovingOrientation
  loop?: boolean
  isDisabled?: (index: number) => boolean
}

/**
 * Roving tabindex for a radio group (besluit 18): the group is one Tab
 * stop, arrow keys move AND select (like native radios), Home/End jump.
 * Space/Enter keep their native button click, so `onClick` still selects.
 *
 * Spread `getItemProps(i)` on each `role="radio"` element inside a
 * `role="radiogroup"` container.
 */
export function useRovingRadio({
  count,
  selectedIndex,
  onSelect,
  orientation = "both",
  loop = true,
  isDisabled = () => false,
}: UseRovingRadioOptions) {
  const groupId = useId()
  const tabStop = getRovingTabStop(selectedIndex, count, isDisabled)

  function getItemProps(index: number) {
    return {
      tabIndex: index === tabStop ? 0 : -1,
      "data-roving-group": groupId,
      "data-roving-index": index,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        const target = getRovingTarget(event.key, index, count, { orientation, loop, isDisabled })
        if (target === null) return
        event.preventDefault()
        onSelect(target)
        const scope: ParentNode =
          event.currentTarget.closest('[role="radiogroup"]') ?? event.currentTarget.ownerDocument
        const items = scope.querySelectorAll<HTMLElement>("[data-roving-group][data-roving-index]")
        for (const el of Array.from(items)) {
          if (el.dataset.rovingGroup === groupId && el.dataset.rovingIndex === String(target)) {
            el.focus()
            break
          }
        }
      },
    }
  }

  return { getItemProps, tabStop }
}
