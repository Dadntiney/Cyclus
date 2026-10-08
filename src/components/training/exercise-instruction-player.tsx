"use client"

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { CyclusFigure } from "@/components/training/cyclus-figure"
import { figureFrame, peakPose } from "@/components/training/figure-geometry"
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion"
import { Button } from "@/components/ui/button"
import type { ExerciseInstruction } from "@/lib/training/exercise-instructions"
import { easeInOut, lerpPose, type FigurePose } from "@/lib/training/figure-pose"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

interface ExerciseInstructionPlayerProps {
  instruction: ExerciseInstruction
  className?: string
  /** Compact mode for list previews (inside a card). */
  compact?: boolean
}

function pickDutchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang.toLowerCase() === "nl-nl") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("nl")) ??
    null
  )
}

function activeCue(instruction: ExerciseInstruction, elapsedSec: number) {
  let current = instruction.cues[0]?.text ?? ""
  for (const cue of instruction.cues) {
    if (elapsedSec >= cue.at) current = cue.text
  }
  return current
}

function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

/**
 * First-party instruction “video”: one Cyclus female figure, looping the
 * movement on a fixed, fitted frame (always on the floor, never clipped),
 * with optional Dutch spoken guidance. Same visual language for every
 * exercise — no external YouTube hosts or changing instructors.
 *
 * With reduced motion there is no loop: the start and end pose stand
 * still side by side, with the cues as a short list.
 */
export function ExerciseInstructionPlayer({
  instruction,
  className,
  compact = false,
}: ExerciseInstructionPlayerProps) {
  const reduceMotion = usePrefersReducedMotion()
  const [pose, setPose] = useState<FigurePose>(instruction.poses[0])
  const [cue, setCue] = useState(instruction.cues[0]?.text ?? "")
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const speechSupported = canSpeak()
  const frame = useMemo(() => figureFrame(instruction.poses), [instruction.poses])
  const endPose = useMemo(() => peakPose(instruction.poses), [instruction.poses])

  const tick = useEffectEvent((now: number, start: number) => {
    const frames = instruction.poses
    if (!frames.length) return

    const cycle = Math.max(instruction.loopMs, 1)
    const tRaw = Math.min(Math.max(((now - start) % cycle) / cycle, 0), 0.999999)
    const from = frames[0]
    if (!from) return

    if (frames.length === 1) {
      setPose(from)
      setCue(activeCue(instruction, (tRaw * cycle) / 1000))
      return
    }

    const last = frames.length - 1
    const scaled = tRaw * last
    const idx = Math.max(0, Math.min(last - 1, Math.floor(scaled)))
    const local = easeInOut(Math.min(1, Math.max(0, scaled - idx)))
    const a = frames[idx] ?? from
    const b = frames[idx + 1] ?? a
    setPose(lerpPose(a, b, local))
    setCue(activeCue(instruction, (tRaw * cycle) / 1000))
  })

  function stopSpeech() {
    if (canSpeak()) window.speechSynthesis.cancel()
    utteranceRef.current = null
    setSpeaking(false)
  }

  useEffect(() => {
    if (reduceMotion) return
    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      tick(now, start)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [instruction.id, instruction.loopMs, instruction.poses, reduceMotion])

  // Stop speaking when the exercise changes or she leaves.
  useEffect(() => {
    return () => {
      if (canSpeak()) window.speechSynthesis.cancel()
    }
  }, [instruction.id])

  function toggleSpeech() {
    if (!speechSupported) return
    if (speaking) {
      stopSpeech()
      return
    }

    const utter = new SpeechSynthesisUtterance(instruction.narration)
    utter.lang = "nl-NL"
    utter.rate = 0.95
    const voice = pickDutchVoice()
    if (voice) utter.voice = voice
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    utteranceRef.current = utter
    setSpeaking(true)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  const figureHeight = compact ? "h-36" : "h-52 sm:h-60"

  return (
    <div
      className={cn(
        "overflow-hidden border border-line bg-[linear-gradient(160deg,var(--color-peach-soft)_0%,var(--color-cream)_55%,var(--color-sage-soft)_100%)]",
        compact ? "rounded-inset" : "rounded-card",
        className,
      )}
    >
      {reduceMotion && endPose && endPose !== instruction.poses[0] ? (
        // Decorative like the moving figure: the cue list below carries the instructions.
        <div aria-hidden className="grid grid-cols-2 gap-2 px-3 pt-3">
          {[
            { label: "Start", pose: instruction.poses[0] },
            { label: "Eind", pose: endPose },
          ].map((still) => (
            <figure key={still.label} className="flex flex-col items-center gap-1">
              <div className={cn("w-full", figureHeight)}>
                <CyclusFigure pose={still.pose} frame={frame} className="h-full w-full" />
              </div>
              <figcaption className="text-xs font-medium text-ink-soft">{still.label}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className={cn("px-3 pt-3", figureHeight)}>
          <CyclusFigure pose={reduceMotion ? instruction.poses[0] : pose} frame={frame} className="h-full w-full" />
        </div>
      )}

      <div className="flex flex-col gap-3 bg-surface/80 px-4 py-3">
        {reduceMotion ? (
          <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm font-medium text-ink">
            {instruction.cues.map((c) => (
              <li key={c.at}>{c.text}</li>
            ))}
          </ol>
        ) : (
          <p className="min-h-5 text-sm font-medium text-ink" aria-live="off">
            {cue}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-soft">
            {speechSupported ? "Liever luisteren? Laat de uitleg voorlezen." : "Volg de uitleg stap voor stap."}
          </p>
          {speechSupported && (
            <Button
              variant={speaking ? "primary" : "tonal"}
              size="sm"
              className="shrink-0 px-3"
              onClick={toggleSpeech}
              aria-pressed={speaking}
            >
              {speaking ? <VolumeX {...ICON.sm} aria-hidden /> : <Volume2 {...ICON.sm} aria-hidden />}
              {speaking ? "Stop" : "Beluister"}
            </Button>
          )}
        </div>
        {speaking && <p className="border-t border-line pt-2 text-sm text-ink-soft">{instruction.narration}</p>}
      </div>
    </div>
  )
}
