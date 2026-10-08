import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAuthedUser } from "@/lib/supabase/server"
import { getMedication } from "@/lib/data/medications"
import { MedicationWizard } from "@/components/medication/medication-wizard"
import { getCyclicalPhaseInfo, type MedicationSchedule } from "@/lib/medication/schedule"
import { Card } from "@/components/ui/card"
import type { MedicationInput } from "@/lib/validations/medication"
import { formatLongDate } from "@/lib/dates/format"

export const metadata: Metadata = { title: "Medicatie bewerken" }

/** The wizard renders its own Page + PageHeader: each step is one question. */
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

  const schedule: MedicationSchedule = {
    scheduleType: medication.schedule_type as MedicationSchedule["scheduleType"],
    scheduleDays: medication.schedule_days,
    scheduleDaysOn: medication.schedule_days_on,
    scheduleDaysOff: medication.schedule_days_off,
    startDate: medication.start_date,
    endDate: medication.end_date,
  }
  const phaseInfo = getCyclicalPhaseInfo(schedule, new Date())
  const formatPhaseDate = (iso: string) => formatLongDate(iso)

  const unitDivisibleByWeek =
    medication.schedule_type === "cyclisch" &&
    medication.schedule_days_on != null &&
    medication.schedule_days_on % 7 === 0 &&
    medication.schedule_days_off != null &&
    medication.schedule_days_off % 7 === 0
  const cyclUnit: "dagen" | "weken" = unitDivisibleByWeek ? "weken" : "dagen"
  const cyclDivisor = cyclUnit === "weken" ? 7 : 1

  const context = phaseInfo ? (
    <Card tone="subtle" padding="sm">
      <p className="text-sm text-ink">
        Huidige fase: <span className="font-medium">{phaseInfo.phase === "wel" ? "wel" : "niet"}</span> · tot{" "}
        {formatPhaseDate(phaseInfo.phaseEndDate)}
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        Volgende fase: {phaseInfo.nextPhase === "wel" ? "wel" : "niet"}, vanaf{" "}
        {formatPhaseDate(phaseInfo.nextPhaseStartDate)}
        {phaseInfo.phase === "wel" && medication.remind_on_stop
          ? ` · pauze-herinnering op ${formatPhaseDate(phaseInfo.phaseEndDate)}`
          : ""}
      </p>
    </Card>
  ) : undefined

  return (
    <MedicationWizard
      mode="edit"
      medicationId={medication.id}
      context={context}
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
        remindOnStart: medication.remind_on_start,
        remindDaily: medication.remind_daily,
        remindOnStop: medication.remind_on_stop,
        notes: medication.notes ?? "",
      }}
    />
  )
}
