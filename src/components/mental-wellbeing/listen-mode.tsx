"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play, Square, Volume2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

/** Pause between spoken segments — long enough to actually breathe before
 * the next line starts, short enough that it doesn't feel like it stalled. */
const INTER_SEGMENT_PAUSE_MS = 1400
const SPEECH_RATE = 0.85

interface Segment {
  label: string
  text: string
}

function buildSegments(exercise: MindfulExercise): Segment[] {
  const total = exercise.steps.length
  return [
    { label: "Introductie", text: exercise.intro },
    ...exercise.steps.map((text, i) => ({ label: `Stap ${i + 1} van ${total}`, text })),
    { label: "Afronding", text: exercise.closing },
  ]
}

/**
 * The "Luisteren" experience: audio-only, meant to be started and then left
 * alone with your eyes closed. Plays a single narrated audio file when the
 * exercise has one (`exercise.audioUrl` — not used by any exercise yet, but
 * every future one only needs that field set to get this for free), and
 * otherwise falls back to the browser's built-in text-to-speech reading the
 * same intro/steps/closing this exercise already has. Either way the
 * play/pause/stop chrome below is identical, so which engine is behind it
 * is invisible to her.
 */
export function ListenMode({
  exercise,
  onBack,
  onFinish,
}: {
  exercise: MindfulExercise
  onBack: () => void
  onFinish: (elapsedSeconds: number) => void
}) {
  const hasAudioFile = Boolean(exercise.audioUrl)
  // Only ever evaluated after a user tap (ListenMode never renders during
  // SSR/hydration), so reading `window` in the initializer is safe here.
  const [speechSupported] = useState(
    () => hasAudioFile || (typeof window !== "undefined" && "speechSynthesis" in window),
  )
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [segmentIndex, setSegmentIndex] = useState(0)
  const [progress, setProgress] = useState(0) // 0-1, only meaningful for the real-audio path

  const segments = useRef(buildSegments(exercise)).current
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

  useEffect(() => {
    if (!playing) return
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [playing])

  // Stop speaking immediately if she navigates away mid-exercise.
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
    onFinish(elapsed)
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
    const dutchVoice = voicesRef.current.find((v) => v.lang.toLowerCase().startsWith("nl"))
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
    onBack()
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
    onBack()
  }

  if (!hasAudioFile && !speechSupported) {
    return (
      <Card className="text-center py-8">
        <p className="text-sm text-ink-soft mb-5 max-w-sm mx-auto">
          Luisteren wordt op dit apparaat niet ondersteund. Kies hierboven voor Bekijken.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-sage-dark touch-manipulation"
        >
          Terug
        </button>
      </Card>
    )
  }

  const currentLabel = hasAudioFile ? exercise.title : segments[segmentIndex]?.label
  const currentText = hasAudioFile ? null : segments[segmentIndex]?.text

  const handlePlayPause = hasAudioFile ? handlePlayPauseAudio : handlePlayPauseSpeech
  const handleStop = hasAudioFile ? handleStopAudio : handleStopSpeech

  return (
    <Card className="text-center py-10">
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

      <p className="text-xs font-medium text-sage-dark mb-1">{currentLabel}</p>
      <p className="text-xs text-ink-soft mb-6">{formatElapsed(elapsed)}</p>

      <div className="relative mx-auto mb-6 h-24 w-24">
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-sage-soft",
            playing && "motion-safe:animate-pulse",
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Volume2 className={cn("h-8 w-8 text-sage-dark", !playing && "opacity-40")} strokeWidth={1.5} />
        </div>
      </div>

      {hasAudioFile && (
        <div className="mx-auto mb-6 h-1.5 w-full max-w-[220px] rounded-full bg-cream-soft overflow-hidden">
          <div
            className="h-full rounded-full bg-sage-dark transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}

      {currentText && (
        <p className="text-sm text-ink-soft leading-relaxed px-4 mb-2 max-w-sm mx-auto" aria-live="polite">
          {currentText}
        </p>
      )}

      <p className="text-xs text-ink-soft mb-8 mt-2">
        {started ? "Leg gerust je telefoon neer en sluit je ogen." : "Zet je telefoon op stil en maak het jezelf gemakkelijk."}
      </p>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stoppen"
          className="h-12 w-12 rounded-full flex items-center justify-center text-ink-soft border border-line touch-manipulation motion-safe:active:scale-[0.94] transition-transform"
        >
          <Square className="h-4.5 w-4.5" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={handlePlayPause}
          aria-label={playing ? "Pauzeren" : "Afspelen"}
          className="h-16 w-16 rounded-full flex items-center justify-center bg-sage-dark text-white touch-manipulation motion-safe:active:scale-[0.94] transition-transform"
        >
          {playing ? (
            <Pause className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Play className="h-6 w-6 ml-0.5" strokeWidth={2} />
          )}
        </button>
        <div className="h-12 w-12" aria-hidden />
      </div>
    </Card>
  )
}
