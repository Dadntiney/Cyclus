"use client"

import { useState } from "react"
import { Play, X } from "lucide-react"
import type { ExerciseVideo } from "@/lib/data/exercise-videos"
import { cn } from "@/lib/utils"

interface ExerciseVideoPlayerProps {
  video: ExerciseVideo
  exerciseName: string
}

/**
 * Click-to-play instructional video: a real thumbnail with a play button
 * overlay (no iframe — and so no sound and no network request — until the
 * user taps it), then an inline 16:9 embed with a fullscreen option. Uses
 * youtube-nocookie.com and never sets autoplay, so nothing plays
 * unexpectedly or with unexpected sound.
 */
export function ExerciseVideoPlayer({ video, exerciseName }: ExerciseVideoPlayerProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden bg-ink">
      <div className="relative aspect-video w-full">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`}
            title={`Voorbeeld: ${exerciseName}`}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 h-full w-full group touch-manipulation"
            aria-label={`Bekijk voorbeeld: ${exerciseName}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external YouTube thumbnail, not a local/optimizable asset */}
            <img
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-ink/25 group-hover:bg-ink/35 transition-colors" />
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                "motion-safe:group-active:scale-95 transition-transform",
              )}
            >
              <span className="h-14 w-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                <Play className="h-6 w-6 text-ink ml-0.5" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>
      {playing && (
        <div className="flex items-center justify-between px-3 py-2 bg-ink">
          <p className="text-[11px] text-white/60 truncate">{video.title}</p>
          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white/70 hover:text-white touch-manipulation"
            aria-label="Video sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
