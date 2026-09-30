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
 * Buddy’s visual signature — a soft, lovable dewdrop in brand peach.
 *
 * Shape: rounded tip, wide calm belly (less “sharp tear”, more companion).
 * Face: open looking eyes with pupils. No arms, no mouth.
 */
export function BuddyGlyph({
  className,
  strokeWidth = 1.75,
  face = true,
}: {
  className?: string
  strokeWidth?: number
  face?: boolean
}) {
  const weight = Math.min(1.08, Math.max(0.92, strokeWidth / 1.75))

  // Soft dewdrop: blunt rounded tip + plump sides + round belly.
  const droplet =
    "M12 3.6C14.35 3.6 16.9 6.55 18.35 10.15C19.45 12.85 19.7 14.85 19.7 15.85a7.7 7.7 0 1 1-15.4 0C4.3 14.85 4.55 12.85 5.65 10.15C7.1 6.55 9.65 3.6 12 3.6Z"

  const halo =
    "M12 2.85C14.75 2.85 17.55 5.95 19.15 9.85C20.35 12.75 20.55 14.85 20.55 15.85a8.55 8.55 0 1 1-17.1 0C3.45 14.85 3.65 12.75 4.85 9.85C6.45 5.95 9.25 2.85 12 2.85Z"

  // Eyes sit in the soft belly
  const eyeR = 1.5
  const eyeY = 14.55
  const eyeL = 9.45
  const eyeRgt = 14.55

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
      <path d={halo} stroke="currentColor" strokeWidth={1.05} opacity="0.24" />
      <path fill="currentColor" fillRule="evenodd" d={body} />
      {face && (
        <>
          <circle cx={eyeL + 0.2} cy={eyeY} r="0.75" fill="currentColor" />
          <circle cx={eyeRgt - 0.2} cy={eyeY} r="0.75" fill="currentColor" />
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
