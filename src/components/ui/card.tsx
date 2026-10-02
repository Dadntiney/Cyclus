import type { HTMLAttributes, ReactNode } from "react"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { cn } from "@/lib/utils"

type CardElement = "div" | "section" | "article" | "li"
type CardPadding = "md" | "sm" | "none"
type CardTone = "surface" | "subtle" | "phase"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Rendered element. Default div; `li` inside a list, `section`/`article` for landmarks. */
  as?: CardElement
  /** md 20px (default) · sm 16px for grid tiles ≤200px wide · none for edge-to-edge rows. */
  padding?: CardPadding
  /**
   * surface (default): hairline card for things you act on ·
   * subtle: cream-soft inset, e.g. a personal note ·
   * phase: the ONE tinted block per screen (the phase status) — pass `phase`.
   */
  tone?: CardTone
  phase?: CyclePhase
  /** Use when the card is the visual surface for a Link/button — adds tap + hover feedback. */
  interactive?: boolean
  /** Full-bleed content (e.g. an image) rendered above the padded body, inside the same rounded corners. */
  media?: ReactNode
}

/**
 * Ritme surface (docs/DESIGN_SYSTEM.md, "Elevatie"):
 * - A card is for something you act on (a recipe, a workout, a settings
 *   group). Explanations, tips and quotes sit flat on the page — no card.
 * - At most one `tone="phase"` per screen: the phase status is the anchor.
 * - `padding="sm"` only for compact grid tiles; everything else uses md.
 * Old call sites that pass padding/background through `className` keep
 * working: className is merged last.
 */
const phaseClasses: Record<CyclePhase, string> = {
  menstruatie: "bg-phase-menstruatie-soft",
  folliculair: "bg-phase-folliculair-soft",
  ovulatie: "bg-phase-ovulatie-soft",
  luteaal: "bg-phase-luteaal-soft",
}

const paddingClasses: Record<CardPadding, string> = {
  md: "p-5",
  sm: "p-4",
  none: "p-0",
}

function toneClass(tone: CardTone, phase?: CyclePhase) {
  if (tone === "subtle") return "bg-cream-soft border border-transparent"
  if (tone === "phase") return cn(phase ? phaseClasses[phase] : "bg-cream-soft", "border border-transparent")
  return "bg-surface border border-line"
}

const interactiveClasses =
  "transition-[background-color,border-color,transform] duration-fast ease-standard motion-safe:active:scale-[0.985] hover:border-ink/20 active:bg-cream-soft/60"

export function Card({
  as = "div",
  padding = "md",
  tone = "surface",
  phase,
  className,
  interactive,
  media,
  children,
  ...props
}: CardProps) {
  // Typed as "div" so the public props stay HTMLAttributes<HTMLDivElement>
  // (old call sites); the real tag is still `as`.
  const Element = as as "div"
  const base = cn("rounded-card", toneClass(tone, phase))

  if (media) {
    return (
      <Element
        className={cn(base, "overflow-hidden", interactive && interactiveClasses, className)}
        {...props}
      >
        {media}
        <div className={paddingClasses[padding]}>{children}</div>
      </Element>
    )
  }

  return (
    <Element
      className={cn(base, paddingClasses[padding], interactive && interactiveClasses, className)}
      {...props}
    >
      {children}
    </Element>
  )
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** h3 by default (a card under a section h2); h2 when the card is the section. */
  as?: "h2" | "h3" | "h4"
}

/** The one title inside a card: Fraunces 20/1.3 (`type-card-title`). No colour of its own. */
export function CardTitle({ as: Heading = "h3", className, ...props }: CardTitleProps) {
  return <Heading className={cn("type-card-title", className)} {...props} />
}
