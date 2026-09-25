import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { greeting } from "@/lib/greeting"

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
    <div className="rounded-3xl bg-white border border-line/70 shadow-[0_2px_16px_rgba(44,42,38,0.05)] p-6 lg:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 lg:gap-7 text-center sm:text-left">
      <AvatarUpload userId={userId} name={name} initialAvatarUrl={avatarUrl} />
      <div className="flex-1 min-w-0">
        <p className="text-sage-dark text-sm font-medium mb-1">
          {greeting()}
          {name ? `, ${name}` : ""}
        </p>
        <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1.5">Mijn profiel</h1>
        <p className="text-sm text-ink-soft max-w-md">
          Dit is jouw plek. Jij bepaalt wat je hier deelt en je kunt alles altijd weer aanpassen.
        </p>
        {memberSince && (
          <p className="text-xs text-ink-soft/80 mt-3">
            Bij Cyclus sinds {format(new Date(memberSince), "MMMM yyyy", { locale: nl })}
          </p>
        )}
      </div>
    </div>
  )
}
