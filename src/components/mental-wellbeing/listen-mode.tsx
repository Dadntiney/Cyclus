"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Pause, Play, Square, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { IconButton } from "@/components/ui/icon-button"
import { StickyActionBar } from "@/components/ui/sticky-action-bar"
import { BreathingRing, StepProgress } from "@/components/mental-wellbeing/guided-parts"
import { useImmersive } from "@/lib/hooks/use-immersive"
import { ICON, iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

/** Pause between spoken segments — long enough to actually breathe before
 * the next line starts, short enough that it doesn't feel like it stalled. */
const INTER_SEGMENT_PAUSE_MS = 1400
const SPEECH_RATE = 0.92

/**
 * Known Dutch female system/browser voices, most natural-sounding first —
 * there's no standard "gender" field on SpeechSynthesisVoice, so this is a
 * name-based best guess across the platforms real visitors use. "Fenna" is
 * Windows 11's newer natural/neural Dutch voice (clearly the least robotic
 * option where available); the rest are the longstanding female voices on
 * Windows, macOS/iOS, and Chrome/Android respectively.
 */
const PREFERRED_FEMALE_VOICE_NAMES = [
  "fenna",
  "colette",
  "lotte",
  "ellen",
  "claire",
  "google nederlands",
  "femke",
  "saskia",
]

function pickDutchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const dutchVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("nl"))
  if (!dutchVoices.length) return null
  for (const name of PREFERRED_FEMALE_VOICE_NAMES) {
    const match = dutchVoices.find((v) => v.name.toLowerCase().includes(name))
    if (match) return match
  }
  return dutchVoices[0]
}

type Segment = { kind: "intro"; text: string } | { kind: "step"; step: number; text: string } | { kind: "closing"; text: string }

function buildSegments(exercise: MindfulExercise): Segment[] {
  return [
    { kind: "intro", text: exercise.intro },
    ...exercise.steps.map((text, step) => ({ kind: "step" as const, step, text })),
    { kind: "closing", text: exercise.closing },
  ]
}

const noSubscribe = () => () => {}

/**
 * The "Luisteren" experience: audio-only, meant to be started and then left
 * alone with your eyes closed. Plays a single narrated audio file when the
 * exercise has one (`exercise.audioUrl` — not used by any exercise yet, but
 * every future one only needs that field set to get this for free), and
 * otherwise falls back to the browser's built-in text-to-speech reading the
 * same intro/steps/closing this exercise already has. Either way the
 * play/pause/stop controls are identical, so which engine is behind it is
 * invisible to her.
 *
 * Immersive: the tab bar steps aside and play/pause sits in the thumb zone.
 * The intro is already on the page (header), so it is only spoken here.
 * "Stoppen" ends the playback and starts over; `onStop` lets the parent
 * remount this component fresh.
 */
export function ListenMode({
  exercise,
  onStop,
  onFinish,
  onRead,
}: {
  exercise: MindfulExercise
  onStop: () => void
  onFinish: () => void
  /** Switch to Lezen (when this device cannot read aloud). */
  onRead: () => void
}) {
  const hasAudioFile = Boolean(exercise.audioUrl)
  // Server: assume support, so no "not supported" flash before hydration.
  const speechSupported = useSyncExternalStore(
    noSubscribe,
    () => hasAudioFile || "speechSynthesis" in window,
    () => true,
  )
  // The tab bar steps aside while she listens; the app bar (back) stays.
  useImmersive(speechSupported)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [segmentIndex, setSegmentIndex] = useState(0)
  const [progress, setProgress] = useState(0) // 0-1, only meaningful for the real-audio path

  const [segments] = useState(() => buildSegments(exercise))
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])
  const finishedRef = useRef(false)

  useEffect(() => {
    if (hasAudioFile || !speechSupported) return
    function loadVoices() {
      voicesRef.current = window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices)
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
  }, [hasAudioFile, speechSupported])

  // Stop speaking immediately if she navigates away or switches to Lezen.
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
      if (!hasAudioFile && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [hasAudioFile])

  function finish() {
    if (finishedRef.current) return
    finishedRef.current = true
    onFinish()
  }

  function speakFrom(index: number) {
    if (index >= segments.length) {
      finish()
      return
    }
    setSegmentIndex(index)
    const utterance = new SpeechSynthesisUtterance(segments[index].text)
    utterance.lang = "nl-NL"
    utterance.rate = SPEECH_RATE
    const dutchVoice = pickDutchVoice(voicesRef.current)
    if (dutchVoice) utterance.voice = dutchVoice
    utterance.onend = () => {
      pauseTimerRef.current = setTimeout(() => speakFrom(index + 1), INTER_SEGMENT_PAUSE_MS)
    }
    window.speechSynthesis.speak(utterance)
  }

  function handlePlayPauseSpeech() {
    if (!started) {
      setStarted(true)
      setPlaying(true)
      speakFrom(0)
      return
    }
    if (playing) {
      window.speechSynthesis.pause()
      setPlaying(false)
    } else {
      window.speechSynthesis.resume()
      setPlaying(true)
    }
  }

  function handleStopSpeech() {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    window.speechSynthesis.cancel()
    onStop()
  }

  function handlePlayPauseAudio() {
    const audio = audioRef.current
    if (!audio) return
    if (!started) setStarted(true)
    if (playing) {
      audio.pause()
    } else {
      void audio.play()
    }
  }

  function handleStopAudio() {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    onStop()
  }

  if (!hasAudioFile && !speechSupported) {
    return (
      <Card className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-ink-soft">
          Voorlezen werkt niet op dit apparaat. Je kunt de oefening wel stap voor stap meelezen.
        </p>
        <Button variant="tonal" size="sm" onClick={onRead}>
          Lees mee
        </Button>
      </Card>
    )
  }

  const segment = segments[segmentIndex]
  const stepCount = exercise.steps.length
  const handlePlayPause = hasAudioFile ? handlePlayPauseAudio : handlePlayPauseSpeech
  const handleStop = hasAudioFile ? handleStopAudio : handleStopSpeech

  return (
    <>
      <Card className="flex flex-col items-center gap-5 py-8 text-center">
        {hasAudioFile && exercise.audioUrl && (
          <audio
            ref={audioRef}
            src={exercise.audioUrl}
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onTimeUpdate={(e) => {
              const audio = e.currentTarget
              if (audio.duration) setProgress(audio.currentTime / audio.duration)
            }}
            onEnded={finish}
          />
        )}

        {!hasAudioFile && started && segment?.kind === "step" ? (
          <StepProgress current={segment.step} total={stepCount} />
        ) : (
          <p className="type-eyebrow text-sage-dark">
            {!started
              ? "Klaar om te luisteren"
              : hasAudioFile
                ? playing
                  ? "Aan het luisteren"
                  : "Gepauzeerd"
                : segment?.kind === "closing"
                  ? "Afronding"
                  : "Rustig beginnen"}
          </p>
        )}

        <BreathingRing breathing={playing}>
          <Volume2 {...iconProps("xl", cn("text-sage-dark", !playing && "opacity-40"))} aria-hidden />
        </BreathingRing>

        {hasAudioFile && (
          <div className="h-1.5 w-full max-w-56 overflow-hidden rounded-full bg-cream-soft" aria-hidden>
            <div
              className="h-full rounded-full bg-sage-fill transition-[width] duration-base ease-standard"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}

        {/* The intro is in the header already; steps and the closing are shown as they are spoken. */}
        <div aria-live="polite" className="min-h-12 max-w-sm">
          {!hasAudioFile && started && segment && segment.kind !== "intro" && (
            <p key={segmentIndex} className="type-body-lg text-ink animate-fade-in">
              {segment.text}
            </p>
          )}
        </div>

        <p className="text-sm text-ink-soft">
          {started
            ? "Leg gerust je telefoon neer en sluit je ogen."
            : "Zet je telefoon op stil en maak het jezelf gemakkelijk."}
        </p>
      </Card>

      <StickyActionBar className="mt-6">
        <div className="flex items-center justify-center gap-6">
          <IconButton label="Stoppen" icon={Square} tone="soft" onClick={handleStop} disabled={!started} />
          <button
            type="button"
            onClick={handlePlayPause}
            aria-label={playing ? "Pauzeren" : started ? "Verder luisteren" : "Afspelen"}
            className={cn(
              "inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-fill text-white touch-manipulation",
              "transition-[background-color,transform] duration-fast ease-standard hover:bg-sage-fill-darker motion-safe:active:scale-[0.97]",
            )}
          >
            {playing ? <Pause {...ICON.lg} aria-hidden /> : <Play {...iconProps("lg", "ml-0.5")} aria-hidden />}
          </button>
          {/* Balances the stop button, so play/pause sits in the middle. */}
          <span aria-hidden className="h-11 w-11" />
        </div>
      </StickyActionBar>
    </>
  )
}
