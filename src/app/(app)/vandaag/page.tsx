import { createClient } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { TodayCards } from "@/components/today/today-cards"
import { CheckinForm } from "@/components/today/checkin-form"

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Goedemorgen"
  if (hour < 18) return "Goedemiddag"
  return "Goedenavond"
}

export default async function VandaagPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { profile, cycleEstimate, recommendation, checkin } = await getVandaagData(user.id)

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">
          {greeting()}
          {profile?.name ? `, ${profile.name}` : ""} 🌿
        </h1>
        {cycleEstimate ? (
          <p className="text-sm text-ink-soft mt-1">
            Cyclusdag {cycleEstimate.cycleDay} · {cycleEstimate.phaseLabel} · schatting
          </p>
        ) : (
          <p className="text-sm text-ink-soft mt-1">Fijn dat je er bent.</p>
        )}
      </div>

      {recommendation && <TodayCards recommendation={recommendation} />}

      <CheckinForm initial={checkin ?? null} />
    </div>
  )
}
