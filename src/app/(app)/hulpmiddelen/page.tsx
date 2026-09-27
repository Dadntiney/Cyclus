import Link from "next/link"
import { getAuthedUser } from "@/lib/supabase/server"
import { getMedicationsForUser } from "@/lib/data/medications"
import { createClient } from "@/lib/supabase/server"
import { MedicationBox } from "@/components/medications/medication-box"
import { ReminderSettingsForm } from "@/components/reminders/reminder-settings-form"
import { Card } from "@/components/ui/card"

export default async function HulpmiddelenPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const supabase = await createClient()
  const [{ data: profile }, medications] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getMedicationsForUser(user.id),
  ])

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Hulpmiddelen</h1>
        <p className="text-sm text-ink-soft mt-1">
          Herinneringen en je medicijndoosje — praktisch, zonder medisch advies.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <MedicationBox medications={medications} />
        <div className="flex flex-col gap-4 mt-6 lg:mt-0">
          <ReminderSettingsForm
            initial={{
              checkinReminderEnabled: profile?.checkin_reminder_enabled ?? false,
              checkinReminderTime: String(profile?.checkin_reminder_time ?? "09:00").slice(0, 5),
              workoutReminderEnabled: profile?.workout_reminder_enabled ?? false,
              browserNotificationsEnabled: profile?.browser_notifications_enabled ?? false,
            }}
          />
          <Card>
            <p className="text-sm text-ink-soft">
              Tip: bekijk ook je{" "}
              <Link href="/cyclus/samenvatting" className="text-sage-dark font-medium underline">
                arts-samenvatting
              </Link>
              ,{" "}
              <Link href="/dagboek" className="text-sage-dark font-medium underline">
                dagboek
              </Link>{" "}
              en{" "}
              <Link href="/kennis" className="text-sage-dark font-medium underline">
                kennis
              </Link>
              .
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
