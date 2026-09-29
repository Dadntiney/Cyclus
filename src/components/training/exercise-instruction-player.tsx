"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { CyclusFigure } from "@/components/training/cyclus-figure"
import type { ExerciseInstruction } from "@/lib/training/exercise-instructions"
import { easeInOut, lerpPose, type FigurePose } from "@/lib/training/figure-pose"
import { cn } from "@/lib/utils"

interface ExerciseInstructionPlayerProps {
  instruction: ExerciseInstruction
  className?: string
  /** Compact mode for list previews. */
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
 * movement, with optional Dutch spoken guidance. Same visual language for
 * every exercise — no external YouTube hosts or changing instructors.
 */
export function ExerciseInstructionPlayer({
  instruction,
  className,
  compact = false,
}: ExerciseInstructionPlayerProps) {
  const [pose, setPose] = useState<FigurePose>(instruction.poses[0])
  const [cue, setCue] = useState(instruction.cues[0]?.text ?? "")
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const speechSupported = canSpeak()

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
    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      tick(now, start)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      if (canSpeak()) window.speechSynthesis.cancel()
    }
  }, [instruction.id, instruction.loopMs, instruction.poses])

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

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line/60 bg-[linear-gradient(160deg,var(--color-peach-soft)_0%,var(--color-cream)_55%,var(--color-sage-soft)_100%)]",
        className,
      )}
    >
      <div className={cn("relative flex items-center justify-center", compact ? "h-40" : "h-56 sm:h-64")}>
        <CyclusFigure pose={pose} className={cn("w-auto", compact ? "h-36" : "h-52 sm:h-60")} />
      </div>

      <div className="bg-surface/80 backdrop-blur-sm px-3.5 py-3 flex flex-col gap-2.5">
        <p className="text-sm font-medium text-ink leading-snug min-h-[1.25rem]">{cue}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-ink-soft">
            Nederlandse uitleg · dezelfde gids bij elke oefening
          </p>
          {speechSupported ? (
            <button
              type="button"
              onClick={toggleSpeech}
              className={cn(
                "inline-flex items-center gap-1.5 min-h-11 px-3 rounded-xl text-xs font-medium touch-manipulation transition-colors",
                speaking
                  ? "bg-sage-fill text-white"
                  : "bg-sage-soft text-sage-dark hover:bg-sage-soft/80",
              )}
              aria-pressed={speaking}
            >
              {speaking ? (
                <VolumeX className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <Volume2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              {speaking ? "Stop" : "Beluister"}
            </button>
          ) : (
            <p className="text-[11px] text-ink-soft shrink-0">Lees de tekst hierboven</p>
          )}
        </div>
        {speaking && (
          <p className="text-xs text-ink-soft leading-relaxed border-t border-line/50 pt-2">
            {instruction.narration}
          </p>
        )}
      </div>
    </div>
  )
}
