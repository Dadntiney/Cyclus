import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { AvatarUpload } from "@/components/profile/avatar-upload"

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
    <div className="rounded-3xl bg-surface border border-line/70 shadow-[var(--shadow-card)] p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 lg:gap-7 text-center sm:text-left">
      <AvatarUpload userId={userId} name={name} initialAvatarUrl={avatarUrl} />
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl lg:text-3xl text-ink">
          {name?.trim() ? name : "Mijn profiel"}
        </h1>
        <p className="text-sm text-ink-soft mt-1.5 max-w-md leading-relaxed">
          Pas hier aan wat Cyclus voor jou meeneemt — je kunt alles later weer wijzigen.
        </p>
        {memberSince && (
          <p className="text-xs text-ink-soft mt-3">
            Bij Cyclus sinds {format(new Date(memberSince), "MMMM yyyy", { locale: nl })}
          </p>
        )}
      </div>
    </div>
  )
}
