"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { Bell, CalendarDays, Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Chip } from "@/components/ui/chip"
import { Input, Label, Textarea, FieldError } from "@/components/ui/input"
import {
  createDoctorAppointment,
  updateDoctorAppointment,
  deleteDoctorAppointment,
} from "@/lib/actions/doctor-appointments"
import type { DoctorAppointment } from "@/lib/data/doctor-appointments"
import {
  DOCTOR_REMINDER_LEAD_OPTIONS,
  doctorReminderLeadLabel,
  type DoctorReminderLeadDays,
} from "@/lib/reminders/options"
import { todayISO } from "@/lib/dates/amsterdam"
import { cn } from "@/lib/utils"

function formatDateLabel(iso: string | null) {
  if (!iso) return null
  try {
    return format(parseISO(iso), "d MMMM yyyy", { locale: nl })
  } catch {
    return iso
  }
}

function normalizeTime(time: string | null): string {
  if (!time) return "09:00"
  return time.slice(0, 5)
}

function normalizeLeadDays(value: number | null | undefined): DoctorReminderLeadDays {
  const match = DOCTOR_REMINDER_LEAD_OPTIONS.find((o) => o.value === value)
  return match?.value ?? 0
}

export function DoctorAppointmentsSection({
  appointments,
}: {
  appointments: DoctorAppointment[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [appointmentDate, setAppointmentDate] = useState("")
  const [notes, setNotes] = useState("")
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("09:00")
  const [reminderLeadDays, setReminderLeadDays] = useState<DoctorReminderLeadDays>(0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function resetForm() {
    setEditingId(null)
    setAppointmentDate("")
    setNotes("")
    setReminderEnabled(false)
    setReminderTime("09:00")
    setReminderLeadDays(0)
    setError(null)
  }

  function openCreate() {
    resetForm()
    setOpen(true)
  }

  function openEdit(row: DoctorAppointment) {
    setEditingId(row.id)
    setAppointmentDate(row.appointment_date ?? "")
    setNotes(row.notes ?? "")
    setReminderEnabled(row.reminder_enabled)
    setReminderTime(normalizeTime(row.reminder_time))
    setReminderLeadDays(normalizeLeadDays(row.reminder_lead_days))
    setError(null)
    setOpen(true)
  }

  function handleSave() {
    setError(null)
    const input = {
      appointmentDate,
      notes,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      reminderLeadDays: reminderEnabled ? reminderLeadDays : 0,
    }
    startTransition(async () => {
      const result = editingId
        ? await updateDoctorAppointment(editingId, input)
        : await createDoctorAppointment(input)
      if (result.error) {
        setError(result.error)
        return
      }
      setOpen(false)
      resetForm()
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteDoctorAppointment(id)
      if (result.error) {
        setError(result.error)
        return
      }
      if (editingId === id) {
        setOpen(false)
        resetForm()
      }
      router.refresh()
    })
  }

  const today = todayISO()
  const upcoming = appointments.filter((a) => a.appointment_date && a.appointment_date >= today)
  const pastOrNotes = appointments.filter((a) => !a.appointment_date || a.appointment_date < today)
  const ordered = [...upcoming, ...pastOrNotes]

  return (
    <Card className="print:hidden">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h2 className="font-display text-xl text-ink">Afspraken &amp; notities</h2>
          <p className="text-sm text-ink-soft mt-1 leading-relaxed">
            Optioneel. Noteer een afspraakdatum, wat je met je arts hebt afgesproken (bijv. HT
            aangepast), en zet desgewenst een herinnering aan.
          </p>
        </div>
        {!open && (
          <Button type="button" size="sm" variant="secondary" onClick={openCreate} className="shrink-0">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Toevoegen
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-4 rounded-[1.25rem] bg-surface border border-line p-4 flex flex-col gap-3">
          <div>
            <Label htmlFor="appt-date">Afspraakdatum (optioneel)</Label>
            <Input
              id="appt-date"
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="appt-notes">Notitie (optioneel)</Label>
            <Textarea
              id="appt-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bijv. HT aangepast: progesteron 2 weken wel / 2 weken niet"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">Herinnering</p>
              <p className="text-xs text-ink-soft mt-0.5">
                {appointmentDate
                  ? "Kies hoe ver van tevoren en op welk tijdstip."
                  : "Vul eerst een afspraakdatum in."}
              </p>
            </div>
            <Switch
              checked={Boolean(appointmentDate) && reminderEnabled}
              disabled={!appointmentDate}
              onChange={(on) => setReminderEnabled(on)}
              aria-label="Herinnering aan- of uitzetten"
            />
          </div>
          {appointmentDate && reminderEnabled && (
            <>
              <div>
                <p className="text-sm font-medium text-ink-soft mb-1.5">Hoe ver van tevoren?</p>
                <div className="flex flex-wrap gap-1.5">
                  {DOCTOR_REMINDER_LEAD_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      selected={reminderLeadDays === opt.value}
                      onClick={() => setReminderLeadDays(opt.value)}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="appt-time">Tijdstip herinnering</Label>
                <Input
                  id="appt-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="max-w-[160px]"
                />
              </div>
            </>
          )}
          {error && <FieldError>{error}</FieldError>}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? "Bezig…" : editingId ? "Opslaan" : "Toevoegen"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
              disabled={isPending}
            >
              Annuleren
            </Button>
          </div>
        </div>
      )}

      {ordered.length === 0 && !open ? (
        <p className="text-sm text-ink-soft mt-4">Nog geen afspraken of notities.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {ordered.map((row) => {
            const dateLabel = formatDateLabel(row.appointment_date)
            const isPast = Boolean(row.appointment_date && row.appointment_date < today)
            return (
              <div
                key={row.id}
                className={cn(
                  "rounded-2xl bg-cream-soft/80 px-3.5 py-3 flex items-start gap-3",
                  isPast && "opacity-80",
                )}
              >
                <span className="h-9 w-9 rounded-xl bg-sage-soft flex items-center justify-center shrink-0 mt-0.5">
                  <CalendarDays className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
                </span>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="min-w-0 flex-1 text-left touch-manipulation"
                >
                  <p className="text-sm font-medium text-ink">
                    {dateLabel ?? "Zonder datum"}
                    {row.appointment_date && row.appointment_date === today && (
                      <span className="text-sage-dark font-normal"> · vandaag</span>
                    )}
                  </p>
                  {row.notes && (
                    <p className="text-sm text-ink-soft mt-0.5 whitespace-pre-wrap leading-relaxed">
                      {row.notes}
                    </p>
                  )}
                  {row.reminder_enabled && row.appointment_date && row.appointment_date >= today && (
                    <p className="text-xs text-ink-soft mt-1.5 inline-flex items-center gap-1">
                      <Bell className="h-3 w-3" strokeWidth={1.75} />
                      {doctorReminderLeadLabel(row.reminder_lead_days ?? 0)} ·{" "}
                      {normalizeTime(row.reminder_time)}
                    </p>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={isPending}
                  className="shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-ink-soft hover:text-ink hover:bg-surface/70 touch-manipulation"
                  aria-label="Verwijderen"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
