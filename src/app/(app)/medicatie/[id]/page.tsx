import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getMedication } from "@/lib/data/medications"
import { MedicationWizard } from "@/components/medication/medication-wizard"
import type { MedicationInput } from "@/lib/validations/medication"

export default async function EditMedicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getAuthedUser()
  if (!user) return null

  const medication = await getMedication(user.id, id)
  if (!medication) notFound()

  const unitDivisibleByWeek =
    medication.schedule_type === "cyclisch" &&
    medication.schedule_days_on != null &&
    medication.schedule_days_on % 7 === 0 &&
    medication.schedule_days_off != null &&
    medication.schedule_days_off % 7 === 0
  const cyclUnit: "dagen" | "weken" = unitDivisibleByWeek ? "weken" : "dagen"
  const cyclDivisor = cyclUnit === "weken" ? 7 : 1

  return (
    <div className="w-full">
      <div className="max-w-md mx-auto px-5 pt-6">
        <Link
          href="/medicatie"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft touch-manipulation"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          Mijn medicatie
        </Link>
      </div>
      <MedicationWizard
        mode="edit"
        medicationId={medication.id}
        initial={{
          category: medication.category as MedicationInput["category"],
          name: medication.name,
          hormoneType: medication.hormone_type ?? "",
          form: medication.form ?? "",
          dosage: medication.dosage ?? "",
          scheduleType: medication.schedule_type as MedicationInput["scheduleType"],
          scheduleDays: medication.schedule_days ?? [],
          scheduleDaysOnValue: medication.schedule_days_on ? String(medication.schedule_days_on / cyclDivisor) : "",
          scheduleDaysOffValue: medication.schedule_days_off ? String(medication.schedule_days_off / cyclDivisor) : "",
          cyclUnit,
          startDate: medication.start_date ?? "",
          endDate: medication.end_date ?? "",
          timeOfDay: medication.time_of_day?.slice(0, 5) ?? "",
          reminderEnabled: medication.reminder_enabled,
          notes: medication.notes ?? "",
        }}
      />
    </div>
  )
}
