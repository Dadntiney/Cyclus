"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Loader2, Leaf } from "lucide-react"
import { updateAvatar } from "@/lib/actions/profile"
import { ICON, iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

const MAX_SIZE_BYTES = 5 * 1024 * 1024

/** Null when there's no name to derive initials from — render falls back to a Leaf icon. */
function initials(name: string | null): string | null {
  if (!name) return null
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase() || null
}

export function AvatarUpload({
  userId,
  name,
  initialAvatarUrl,
  onError,
}: {
  userId: string
  name: string | null
  initialAvatarUrl: string | null
  /** Called with a message to show (or null to clear) — the hero shows it full width. */
  onError?: (message: string | null) => void
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  function setError(message: string | null) {
    onError?.(message)
  }

  function handlePick() {
    inputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setError(null)

    if (!file.type.startsWith("image/")) {
      setError("Kies een afbeelding (JPG, PNG of WEBP).")
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Deze foto is groter dan 5 MB. Kies een kleinere foto.")
      return
    }

    setIsUploading(true)
    try {
      // Loaded on demand: the Supabase browser SDK (~70 KB gzip) is only
      // needed for this upload, not on every page.
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const path = `${userId}/avatar.${extension}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" })

      if (uploadError) {
        setError("Uploaden is niet gelukt. Probeer het opnieuw.")
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path)
      const bustedUrl = `${publicUrl}?v=${Date.now()}`

      startTransition(async () => {
        const result = await updateAvatar(bustedUrl)
        if (result?.error) {
          setError(result.error)
          return
        }
        setAvatarUrl(bustedUrl)
        router.refresh()
      })
    } finally {
      setIsUploading(false)
    }
  }

  const busy = isUploading || isPending

  return (
    <div className="relative shrink-0">
      {/* 64px photo; the ring is the page surface colour, so it reads as a
          quiet edge in both Dag and Nacht (never a white ring in the dark). */}
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-sage-soft">
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
        ) : (
          <span className="type-section-title text-sage-dark" aria-hidden>
            {initials(name) ?? <Leaf {...ICON.md} />}
          </span>
        )}
      </div>
      {/* 32px camera disc with a 44px target around it. */}
      <button
        type="button"
        onClick={handlePick}
        disabled={busy}
        aria-label="Profielfoto wijzigen"
        className="group absolute -bottom-2.5 -right-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full touch-manipulation disabled:opacity-60"
      >
        <span
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream bg-sage-fill text-white",
            "transition-[background-color,transform] duration-fast ease-standard group-hover:bg-sage-fill-darker motion-safe:group-active:scale-[0.97]",
          )}
        >
          {busy ? (
            <Loader2 {...iconProps("sm", "motion-safe:animate-spin")} aria-hidden />
          ) : (
            <Camera {...ICON.sm} aria-hidden />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  )
}
