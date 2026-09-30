import { cn } from "@/lib/utils"

type BuddyMarkSize = "sm" | "md" | "lg" | "xl"

const SIZE: Record<BuddyMarkSize, { box: string; icon: string }> = {
  sm: { box: "h-5 w-5", icon: "h-3.5 w-3.5" },
  md: { box: "h-7 w-7", icon: "h-4.5 w-4.5" },
  lg: { box: "h-11 w-11", icon: "h-6 w-6" },
  xl: { box: "h-16 w-16", icon: "h-9 w-9" },
}

function eyeCutout(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`
}

/**
 * Buddy — soft peach dewdrop companion.
 *
 * Classic water-drop silhouette with a gently leaning tip and a plump
 * round belly (lovable character shape). Looking eyes only — big cartoon
 * mouths don’t survive at nav/icon sizes. Original mark, not a stock asset.
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

  // Tip leans slightly left; belly is a full round base — classic “drop character”.
  const droplet =
    "M10.7 2.35C7.2 5.8 4.7 10.4 5.05 14.85a7.15 7.15 0 0 0 14.15 0.1C18.6 9.6 14.9 4.6 10.7 2.35Z"

  const halo =
    "M10.55 1.7C6.7 5.4 3.95 10.15 4.3 14.95a7.95 7.95 0 0 0 15.7 0.15C19.4 9.1 15.3 3.85 10.55 1.7Z"

  const eyeR = 1.55
  const eyeY = 14.15
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
      <path d={halo} stroke="currentColor" strokeWidth={1.05} opacity="0.24" />
      <path fill="currentColor" fillRule="evenodd" d={body} />
      {face && (
        <>
          <circle cx={eyeL + 0.22} cy={eyeY} r="0.78" fill="currentColor" />
          <circle cx={eyeRgt - 0.22} cy={eyeY} r="0.78" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

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
