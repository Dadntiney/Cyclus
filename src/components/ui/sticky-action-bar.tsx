"use client"

import { useRef, type ReactNode } from "react"
import { useMeasuredHeightVar } from "@/lib/hooks/use-measured-height-var"
import { cn } from "@/lib/utils"

/**
 * The primary action in the thumb zone (ontwerpvisie §5.7): sticks to the
 * bottom of the screen, right above the tab bar — or above the safe area in
 * immersive mode, when the tab bar steps aside. Opaque cream with a hairline
 * on top; buttons span the full width.
 *
 * Put it last, as a direct child of <Page> (or another container as tall
 * as the page): sticky only travels within its parent, so inside a short
 * wrapper it scrolls away with that wrapper. In a `<Page fill>` (wizard
 * steps) it rests at the bottom of the screen even when the step is short
 * (`mt-auto`). On phones it bleeds to the page gutter on both sides; on
 * md+ it keeps the content width. Its height is published as
 * `--sticky-action-h`, so toasts appear above it.
 *
 * ```tsx
 * <StickyActionBar>
 *   <Button className="w-full" onClick={next}>Klaar, volgende</Button>
 *   <div className="flex justify-center gap-4">
 *     <button className={textActionClass()} onClick={skip}>Overslaan</button>
 *   </div>
 * </StickyActionBar>
 * ```
 */
export function StickyActionBar({
  children,
  bleed = true,
  className,
}: {
  children: ReactNode
  /** Run edge to edge across the page gutter (default). Off inside a Card. */
  bleed?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useMeasuredHeightVar(ref, "--sticky-action-h", false, { clearOnUnmount: true })

  return (
    <div
      ref={ref}
      data-sticky-action-bar=""
      className={cn(
        "sticky-action-bar sticky z-20 mt-auto flex flex-col gap-2 border-t border-line bg-cream pt-3",
        bleed && "sticky-action-bar-bleed",
        className,
      )}
    >
      {children}
    </div>
  )
}
