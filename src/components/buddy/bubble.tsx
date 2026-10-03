import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { BuddyMark } from "@/components/buddy/buddy-mark"

export type Speaker = "user" | "buddy"

/**
 * One chat bubble (BUD-8). At most 36 characters wide so a long reply stays
 * readable on a wide screen; 82% on a phone keeps the other side free.
 * The tail (a small corner on the speaker's side) only marks the last
 * bubble of a run, next to the avatar.
 */
export function bubbleClass({ from, tail, className }: { from: Speaker; tail: boolean; className?: string }) {
  return cn(
    "min-w-0 max-w-[min(82%,36ch)] rounded-card px-4 py-3 text-base leading-normal whitespace-pre-wrap wrap-anywhere",
    from === "user" ? "bg-sage-fill text-white" : "border border-line bg-surface text-ink",
    tail && (from === "user" ? "rounded-br-xs" : "rounded-bl-xs"),
    className,
  )
}

/** Read before each bubble, so a screen reader knows who is speaking. */
export function SpeakerLabel({ from }: { from: Speaker }) {
  return <span className="sr-only">{from === "user" ? "Jij: " : "Buddy: "}</span>
}

/**
 * A row for something Buddy says: the avatar only on the last bubble of a
 * run; earlier bubbles keep an equal-width spacer so they line up.
 */
export function BuddyRow({ avatar, className, children }: { avatar: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex items-end gap-2", className)}>
      {avatar ? <BuddyMark size="md" decorative /> : <span aria-hidden className="w-7 shrink-0" />}
      {children}
    </div>
  )
}
