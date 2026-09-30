import { cn } from "@/lib/utils"

type BuddyMarkSize = "sm" | "md" | "lg" | "xl"

const SIZE: Record<BuddyMarkSize, { box: string; icon: string }> = {
  sm: { box: "h-5 w-5", icon: "h-3.5 w-3.5" },
  md: { box: "h-7 w-7", icon: "h-4.5 w-4.5" },
  lg: { box: "h-11 w-11", icon: "h-6 w-6" },
  xl: { box: "h-16 w-16", icon: "h-9 w-9" },
}

/** Full circles as subpaths for evenodd eye-white cutouts. */
function eyeCutout(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`
}

/**
 * Buddy’s visual signature — a plump soft dewdrop companion in brand peach.
 *
 * Open looking eyes with pupils (no mouth — smiles read muddy at icon size).
 * No arms. Used only where Buddy speaks or is named — never as the
 * menstruation status droplet.
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
    "M12 3.1C14.8 5.6 18.7 10.4 18.7 15.15a6.7 6.7 0 1 1-13.4 0C5.3 10.4 9.2 5.6 12 3.1Z"

  const halo =
    "M12 2.35C15.15 5.1 19.45 10.1 19.45 15.15a7.45 7.45 0 1 1-14.9 0C4.55 10.1 8.85 5.1 12 2.35Z"

  // Big open eyes — “kijken”, blij zonder mond
  const eyeR = 1.55
  const eyeY = 14.35
  const eyeL = 9.5
  const eyeRgt = 14.5

  const body = face
    ? [droplet, eyeCutout(eyeL, eyeY, eyeR), eyeCutout(eyeRgt, eyeY, eyeR)].join("")
    : droplet

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
      style={{ transform: weight !== 1 ? `scale(${weight})` : undefined }}
    >
      <path d={halo} stroke="currentColor" strokeWidth={1.1} opacity="0.28" />
      <path fill="currentColor" fillRule="evenodd" d={body} />
      {face && (
        <>
          {/* Round pupils, slightly toward center — looking at you */}
          <circle cx={eyeL + 0.2} cy={eyeY} r="0.78" fill="currentColor" />
          <circle cx={eyeRgt - 0.2} cy={eyeY} r="0.78" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

/** Soft peach badge with Buddy glyph — primary attribution mark, app-wide. */
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
        "inline-flex items-center justify-center rounded-full bg-peach-soft text-peach shrink-0",
        s.box,
        className,
      )}
    >
      <BuddyGlyph className={cn(s.icon, glyphClassName)} strokeWidth={1.75} />
    </span>
  )
}
