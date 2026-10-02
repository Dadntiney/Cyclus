import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { AvatarUpload } from "@/components/profile/avatar-upload"

/** Compact identity header — photo + name, no marketing copy. */
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
  return (
    <div className="flex items-center gap-4">
      <AvatarUpload userId={userId} name={name} initialAvatarUrl={avatarUrl} />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-3xl lg:text-4xl text-ink truncate">
          {name?.trim() || "Jouw profiel"}
        </h1>
        {memberSince ? (
          <p className="text-sm text-ink-soft mt-0.5">
            Bij GoFiev sinds {format(new Date(memberSince), "MMMM yyyy", { locale: nl })}
          </p>
        ) : (
          <p className="text-sm text-ink-soft mt-0.5">Tik op je foto om die te wijzigen.</p>
        )}
      </div>
    </div>
  )
}
