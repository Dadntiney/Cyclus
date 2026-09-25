"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Camera, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { updateAvatar } from "@/lib/actions/profile"
import { cn } from "@/lib/utils"

const MAX_SIZE_BYTES = 5 * 1024 * 1024

function initials(name: string | null): string {
  if (!name) return "🌿"
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return (first + last).toUpperCase() || "🌿"
}

export function AvatarUpload({
  userId,
  name,
  initialAvatarUrl,
}: {
  userId: string
  name: string | null
  initialAvatarUrl: string | null
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="h-24 w-24 lg:h-28 lg:w-28 rounded-full overflow-hidden bg-sage-soft border-4 border-white shadow-[0_2px_16px_rgba(44,42,38,0.1)] flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={112}
              height={112}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <span className="font-display text-2xl text-sage-dark">{initials(name)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handlePick}
          disabled={busy}
          aria-label="Profielfoto wijzigen"
          className={cn(
            "absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-sage text-white flex items-center justify-center border-2 border-cream",
            "transition-[background-color,transform] duration-150 touch-manipulation motion-safe:active:scale-[0.94]",
            "hover:bg-sage-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
            "disabled:opacity-60",
          )}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
          ) : (
            <Camera className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="mt-2 text-xs text-danger text-center max-w-[200px]">{error}</p>}
    </div>
  )
}
