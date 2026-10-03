"use client"

import { useRef, useState } from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { useAppBarTitle } from "@/components/nav/app-bar-context"
import { AvatarUpload } from "@/components/profile/avatar-upload"

/**
 * The Profiel header (the one documented exception to PageHeader): a 64px
 * photo next to her name as the h1. Once the name scrolls under the app
 * bar, "Profiel" fades in there and is the back label of the next screen.
 */
export function ProfileHero({
  userId,
  name,
  avatarUrl,
  memberSince,
}: {
  userId: string
  name: string | null
  avatarUrl: string | null
  memberSince: string | null
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  useAppBarTitle(titleRef, "Profiel")

  return (
    <header className="mb-6">
      <div className="flex items-center gap-4">
        <AvatarUpload userId={userId} name={name} initialAvatarUrl={avatarUrl} onError={setUploadError} />
        <div className="min-w-0 flex-1">
          <h1
            ref={titleRef}
            tabIndex={-1}
            data-focus-target=""
            className="type-page-title truncate text-ink"
          >
            {name?.trim() || "Jouw profiel"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {memberSince
              ? `Bij GoFiev sinds ${format(new Date(memberSince), "MMMM yyyy", { locale: nl })}`
              : "Tik op je foto om die te wijzigen."}
          </p>
        </div>
      </div>
      {uploadError && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {uploadError}
        </p>
      )}
    </header>
  )
}
