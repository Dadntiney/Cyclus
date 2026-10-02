"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import { usePathname } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { useMeasuredHeightVar } from "@/lib/hooks/use-measured-height-var"
import { useImmersiveState } from "@/lib/hooks/use-immersive"
import { isTabRoot, parentOf, titleForPath } from "@/lib/navigation/features"
import { useBackTarget } from "@/lib/navigation/hooks"
import { compactBackLabel } from "@/lib/navigation/nav-stack"
import { registerTitle } from "@/lib/navigation/nav-store"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"
import { useAppBarOptions } from "./app-bar-context"
import { BackLink } from "./back-link"

/** The hairline appears once the page has scrolled this far. */
const SCROLLED_PX = 4

function useScrolledPast(px: number): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > px)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [px])
  return scrolled
}

/**
 * The page's large title: the element a page registered (PageHeader,
 * useAppBarTitle), else the first `main h1` (besluit 9). Re-read when the
 * page streams in (loading skeleton → content) or its h1 text changes.
 */
function usePageHeading(pathname: string, titleRef: RefObject<HTMLElement | null> | undefined) {
  const [heading, setHeading] = useState<{ el: HTMLElement | null; text: string | null; loading: boolean }>({
    el: null,
    text: null,
    loading: false,
  })

  useEffect(() => {
    const main = document.querySelector("main")
    let frame = 0
    const read = () => {
      frame = 0
      const el = titleRef?.current ?? main?.querySelector<HTMLElement>("h1") ?? null
      const text = el?.textContent?.replace(/\s+/g, " ").trim() || null
      const loading = !el && !!main?.querySelector('[aria-busy="true"]')
      setHeading((prev) =>
        prev.el === el && prev.text === text && prev.loading === loading ? prev : { el, text, loading },
      )
    }
    read()
    if (!main) return
    const observer = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(read)
    })
    observer.observe(main, { childList: true, subtree: true, characterData: true })
    return () => {
      observer.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pathname, titleRef])

  // Its h1 names this screen in the next screen's back label (when the page
  // did not register a name itself).
  useEffect(() => {
    if (heading.text) registerTitle(pathname, heading.text, "observed")
  }, [pathname, heading.text])

  return heading
}

/** True once `el` has scrolled up under the app bar (bar height `barRef`). */
function useScrolledUnder(el: HTMLElement | null, barRef: RefObject<HTMLElement | null>): boolean {
  const [state, setState] = useState<{ el: HTMLElement | null; under: boolean }>({ el: null, under: false })

  useEffect(() => {
    if (!el) return
    const barHeight = Math.round(barRef.current?.offsetHeight ?? 0)
    const observer = new IntersectionObserver(
      ([entry]) => {
        const under = !entry.isIntersecting && entry.boundingClientRect.top < barHeight
        setState((prev) => (prev.el === el && prev.under === under ? prev : { el, under }))
      },
      { rootMargin: `-${barHeight}px 0px 0px 0px`, threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [el, barRef])

  return state.el === el ? state.under : false
}

/**
 * The mobile app bar (ontwerpvisie §4.6, besluit 9). Kept under its old
 * export name; BuddyShell depends on what it guarantees:
 * - always `fixed top-0`, never synced to visualViewport (rubber-band
 *   overscroll must not drag it down);
 * - fully opaque cream on its own compositing layer (no see-through on iOS);
 * - a fixed `h-12` row under the safe area, published as `--mobile-header-h`.
 *
 * Left: "‹ Vorige" on pushed screens — the real previous screen's name, or
 * the logical parent without history; nothing on tab roots. Centre: the
 * compact title, fading in once the large title scrolls under the bar.
 * Right: at most one action. No logo: the brand lives in the app icon and
 * the desktop sidebar.
 */
export function MobileHeader() {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const options = useAppBarOptions()
  const { appBarHidden } = useImmersiveState()
  useMeasuredHeightVar(ref, "--mobile-header-h")

  const tabRoot = isTabRoot(pathname)
  const fallback = tabRoot || options.back === false ? null : (options.back ?? parentOf(pathname))
  const backTarget = useBackTarget(pathname, fallback)
  const showBack = !tabRoot && options.back !== false && backTarget !== null

  const scrolled = useScrolledPast(SCROLLED_PX)
  const heading = usePageHeading(pathname, options.titleRef)
  const scrolledUnder = useScrolledUnder(heading.el, ref)
  const title = options.title ?? titleForPath(pathname) ?? heading.text
  const titleVisible =
    !!title && (options.alwaysShowTitle || scrolledUnder || (!heading.el && !heading.loading))

  return (
    <header
      ref={ref}
      data-app-bar=""
      className="md:hidden fixed top-0 inset-x-0 z-40"
      style={{
        // Explicit opaque fill (not utility opacity) + own compositing layer
        // so scrolled cards cannot blend through on iOS.
        backgroundColor: "var(--color-cream)",
        opacity: 1,
        isolation: "isolate",
        transform: "translateZ(0)",
        paddingTop: "env(safe-area-inset-top)",
        paddingLeft: "max(0.5rem, env(safe-area-inset-left))",
        paddingRight: "max(0.5rem, env(safe-area-inset-right))",
      }}
    >
      {/* Hairline just under the bar (not part of its 48px), fading in
          once the page scrolls under it. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-full h-px bg-line transition-opacity duration-fast ease-standard motion-reduce:transition-none",
          (scrolled || options.divider) && !appBarHidden ? "opacity-100" : "opacity-0",
        )}
      />
      {!appBarHidden && (
        <div className="grid h-12 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1">
          <div className="flex min-w-0 items-center justify-self-start">
            {options.leading ??
              (showBack && backTarget ? (
                <BackLink
                  target={backTarget}
                  label={compactBackLabel(backTarget.label)}
                  className="inline-flex min-h-11 max-w-full items-center gap-0.5 rounded-inset pr-2 text-sm font-medium text-sage-dark transition-opacity duration-fast active:opacity-60"
                >
                  <ChevronLeft {...ICON.md} aria-hidden />
                  <span className="truncate">{compactBackLabel(backTarget.label)}</span>
                </BackLink>
              ) : null)}
          </div>

          <p
            aria-hidden={titleVisible ? undefined : true}
            className={cn(
              "max-w-[50vw] truncate text-center text-base font-semibold text-ink",
              "transition-[opacity,translate] duration-fast ease-enter motion-reduce:transition-none",
              titleVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0 motion-reduce:translate-y-0",
            )}
          >
            {title}
          </p>

          <div className="flex min-w-0 items-center justify-self-end">{options.action}</div>
        </div>
      )}
    </header>
  )
}
