import { cn } from "@/lib/utils"

type BuddyMarkSize = "sm" | "md" | "lg" | "xl"

const SIZE: Record<BuddyMarkSize, { box: string; icon: string }> = {
  sm: { box: "h-5 w-5", icon: "h-3.5 w-3.5" },
  md: { box: "h-7 w-7", icon: "h-4.5 w-4.5" },
  lg: { box: "h-11 w-11", icon: "h-6 w-6" },
  xl: { box: "h-16 w-16", icon: "h-9 w-9" },
}

/** Full circles as subpaths for evenodd eye cutouts. */
function eyeCutout(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`
}

/**
 * Buddy’s visual signature — a soft droplet companion.
 *
 * Adult, calm, a little alive: rounded teardrop with quiet eyes and a soft
 * smile cut out of the fill. No arms, no cartoon grin. Used only where Buddy
 * speaks or is named as a presence — never as the menstruation status
 * droplet, never as generic decoration.
 */
export function BuddyGlyph({
  className,
  strokeWidth = 1.75,
  face = true,
}: {
  className?: string
  /** Kept for Lucide-like call sites in nav; nudges silhouette weight. */
  strokeWidth?: number
  /** Face cutouts — keep on for Buddy presence. */
  face?: boolean
}) {
  const weight = Math.min(1.08, Math.max(0.92, strokeWidth / 1.75))

  const droplet =
    "M12 3.35C12 3.35 5.1 10.8 5.1 15.05a6.9 6.9 0 0 0 13.8 0C18.9 10.8 12 3.35 12 3.35Z"

  // Soft smile lens under the eyes (evenodd hole — reads on any badge color).
  const smile = "M10.1 16.15Q12 17.9 13.9 16.15Q12 17.2 10.1 16.15Z"

  const body = face
    ? [droplet, eyeCutout(9.85, 14.05, 1.12), eyeCutout(14.15, 14.05, 1.12), smile].join("")
    : droplet

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
      style={{ transform: weight !== 1 ? `scale(${weight})` : undefined }}
    >
      <path
        d="M12 2.55C12 2.55 4.35 10.35 4.35 15.1a7.65 7.65 0 0 0 15.3 0C19.65 10.35 12 2.55 12 2.55Z"
        stroke="currentColor"
        strokeWidth={1.15}
        opacity="0.26"
      />
      <path fill="currentColor" fillRule="evenodd" d={body} />
    </svg>
  )
}

/** Soft sage badge with Buddy glyph — primary attribution mark. */
export function BuddyMark({
  size = "md",
  className,
  glyphClassName,
  label = "Buddy",
  decorative = false,
}: {
  size?: BuddyMarkSize
  className?: string
  glyphClassName?: string
  label?: string
  /** When true, hide from assistive tech (e.g. next to a labeled message). */
  decorative?: boolean
}) {
  const s = SIZE[size]
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-sage-soft text-sage-dark shrink-0",
        s.box,
        className,
      )}
    >
      <BuddyGlyph className={cn(s.icon, glyphClassName)} strokeWidth={1.75} />
    </span>
  )
}
