"use client"

import { useEffect, useId, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bell, CalendarDays, Pencil, Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { Dialog } from "@/components/ui/dialog"
import { IconButton } from "@/components/ui/icon-button"
import { Input, Label, Textarea, FieldError } from "@/components/ui/input"
import { SectionHeader } from "@/components/ui/section-header"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
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
import { formatShortDate } from "@/lib/dates/format"
import { iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

function formatDateLabel(iso: string | null) {
  if (!iso) return null
  // Stored as yyyy-MM-dd; anything else is shown as it was saved.
  return /^\d{4}-\d{2}-\d{2}/.test(iso) ? formatShortDate(iso, { year: true }) : iso
}

function normalizeTime(time: string | null): string {
  if (!time) return "09:00"
  return time.slice(0, 5)
}

function normalizeLeadDays(value: number | null | undefined): DoctorReminderLeadDays {
  const match = DOCTOR_REMINDER_LEAD_OPTIONS.find((o) => o.value === value)
  return match?.value ?? 0
}

const LEAD_CHOICES = DOCTOR_REMINDER_LEAD_OPTIONS.map((o) => ({ value: o.value, label: o.label }))

/**
 * Afspraken & notities on Voor je arts: an optional list with one add
 * action in the section header. Editing opens the form in place;
 * deleting always asks first in a Dialog (besluit 30), then calls the same
 * action as before.
 */
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
  const [pendingDelete, setPendingDelete] = useState<DoctorAppointment | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const formTitleRef = useRef<HTMLHeadingElement>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusToAdd = useRef(false)
  const focusAfterDelete = useRef(false)

  const uid = useId()
  const formTitleId = `${uid}-form-title`
  const reminderLabelId = `${uid}-reminder`
  const reminderHelpId = `${uid}-reminder-help`
  const leadLabelId = `${uid}-lead`
  const errorId = `${uid}-error`

  // Opening the form moves focus to its title; closing it returns focus to
  // "Afspraak toevoegen", so keyboard and screen-reader users never land
  // on nothing.
  useEffect(() => {
    if (open) {
      formTitleRef.current?.focus()
    } else if (returnFocusToAdd.current) {
      returnFocusToAdd.current = false
      addButtonRef.current?.focus()
    }
  }, [open])

  // After a delete the trash button that opened the Dialog is gone (and
  // disabled while saving), so focus would fall to the page: put it on
  // the add button, or on the open form's title.
  useEffect(() => {
    if (pendingDelete || !focusAfterDelete.current) return
    focusAfterDelete.current = false
    ;(addButtonRef.current ?? formTitleRef.current)?.focus()
  }, [pendingDelete])

  function resetForm() {
    setEditingId(null)
    setAppointmentDate("")
    setNotes("")
    setReminderEnabled(false)
    setReminderTime("09:00")
    setReminderLeadDays(0)
    setError(null)
  }

  function closeForm() {
    returnFocusToAdd.current = true
    setOpen(false)
    resetForm()
  }

  function openCreate() {
    resetForm()
    setDeleteError(null)
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
    setDeleteError(null)
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
      closeForm()
      router.refresh()
    })
  }

  function confirmDelete() {
    const row = pendingDelete
    if (!row) return
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteDoctorAppointment(row.id)
      if (result.error) {
        setPendingDelete(null)
        setDeleteError(result.error)
        return
      }
      if (editingId === row.id) closeForm()
      else focusAfterDelete.current = true
      setPendingDelete(null)
      toast.show({ title: "Afspraak verwijderd" })
      router.refresh()
    })
  }

  const today = todayISO()
  const upcoming = appointments.filter((a) => a.appointment_date && a.appointment_date >= today)
  const pastOrNotes = appointments.filter((a) => !a.appointment_date || a.appointment_date < today)
  const ordered = [...upcoming, ...pastOrNotes]
  const appointmentName = (row: DoctorAppointment) => {
    const dateLabel = formatDateLabel(row.appointment_date)
    return dateLabel ? `van ${dateLabel}` : "zonder datum"
  }
  const pendingDeleteName = pendingDelete ? appointmentName(pendingDelete) : ""

  return (
    <section aria-labelledby={`${uid}-title`} className="print:hidden">
      <SectionHeader
        id={`${uid}-title`}
        title="Afspraken & notities"
        description="Optioneel. Noteer een afspraakdatum en wat je met je arts afsprak (bijv. hormoontherapie aangepast), eventueel met een herinnering."
        action={
          open ? undefined : (
            <IconButton ref={addButtonRef} label="Afspraak toevoegen" icon={Plus} tone="soft" onClick={openCreate} />
          )
        }
      />

      {open && (
        <Card className="flex flex-col gap-4 mb-3">
          <h3
            ref={formTitleRef}
            id={formTitleId}
            tabIndex={-1}
            data-focus-target=""
            className="type-card-title text-ink"
          >
            {editingId ? "Afspraak aanpassen" : "Afspraak toevoegen"}
          </h3>
          <div>
            <Label htmlFor={`${uid}-date`}>Afspraakdatum (optioneel)</Label>
            <Input
              id={`${uid}-date`}
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${uid}-notes`}>Notitie (optioneel)</Label>
            <Textarea
              id={`${uid}-notes`}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bijv. hormoontherapie aangepast: progesteron 2 weken wel / 2 weken niet"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p id={reminderLabelId} className="text-sm font-medium text-ink">
                Herinnering
              </p>
              <p id={reminderHelpId} className="text-xs text-ink-soft mt-0.5">
                {appointmentDate
                  ? "Kies hoe ver van tevoren en op welk tijdstip."
                  : "Vul eerst een afspraakdatum in."}
              </p>
            </div>
            <Switch
              checked={Boolean(appointmentDate) && reminderEnabled}
              disabled={!appointmentDate}
              onChange={(on) => setReminderEnabled(on)}
              aria-labelledby={reminderLabelId}
              aria-describedby={reminderHelpId}
            />
          </div>
          {appointmentDate && reminderEnabled && (
            <>
              <div>
                <p id={leadLabelId} className="text-sm font-medium text-ink mb-2">
                  Hoe ver van tevoren?
                </p>
                <ChipRadioGroup
                  aria-labelledby={leadLabelId}
                  options={LEAD_CHOICES}
                  value={reminderLeadDays}
                  onChange={setReminderLeadDays}
                />
              </div>
              <div>
                <Label htmlFor={`${uid}-time`}>Tijdstip herinnering</Label>
                <Input
                  id={`${uid}-time`}
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="max-w-40"
                />
              </div>
            </>
          )}
          <FieldError id={errorId}>{error}</FieldError>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Bezig…" : editingId ? "Opslaan" : "Toevoegen"}
            </Button>
            <Button type="button" variant="ghost" onClick={closeForm} disabled={isPending}>
              Annuleren
            </Button>
          </div>
        </Card>
      )}

      {ordered.length === 0 ? (
        !open && <p className="text-sm text-ink-soft">Nog geen afspraken of notities.</p>
      ) : (
        <ul role="list" className="rounded-card bg-surface border border-line divide-y divide-line">
          {ordered.map((row) => {
            const dateLabel = formatDateLabel(row.appointment_date)
            const isPast = Boolean(row.appointment_date && row.appointment_date < today)
            const name = appointmentName(row)
            return (
              <li key={row.id} className="flex items-start gap-3 py-3 pl-4 pr-2">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
                >
                  <CalendarDays {...iconProps("sm")} />
                </span>
                <div className={cn("min-w-0 flex-1 pt-1.5", isPast && "opacity-80")}>
                  <p className="text-base font-medium text-ink">
                    {dateLabel ?? "Zonder datum"}
                    {row.appointment_date && row.appointment_date === today && (
                      <span className="text-sage-dark font-normal"> · vandaag</span>
                    )}
                  </p>
                  {row.notes && (
                    <p className="text-sm text-ink-soft mt-0.5 whitespace-pre-wrap wrap-anywhere">{row.notes}</p>
                  )}
                  {row.reminder_enabled && row.appointment_date && row.appointment_date >= today && (
                    <p className="text-xs text-ink-soft mt-1.5 inline-flex items-center gap-1">
                      <Bell {...iconProps("sm", "h-3 w-3")} aria-hidden />
                      {doctorReminderLeadLabel(row.reminder_lead_days ?? 0)} · {normalizeTime(row.reminder_time)}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0">
                  <IconButton
                    label={`Afspraak ${name} aanpassen`}
                    icon={Pencil}
                    size="sm"
                    onClick={() => openEdit(row)}
                    disabled={isPending}
                  />
                  <IconButton
                    label={`Afspraak ${name} verwijderen`}
                    icon={Trash2}
                    size="sm"
                    onClick={() => {
                      setDeleteError(null)
                      setPendingDelete(row)
                    }}
                    disabled={isPending}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <FieldError>{deleteError}</FieldError>

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Afspraak verwijderen?"
        footer={
          <div className="flex flex-col gap-2">
            <Button variant="danger" className="w-full" onClick={confirmDelete} disabled={isPending}>
              Verwijderen
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setPendingDelete(null)} disabled={isPending}>
              Annuleren
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Je afspraak {pendingDeleteName} wordt verwijderd, met de notitie erbij. Dit kun je niet ongedaan
          maken.
        </p>
      </Dialog>
    </section>
  )
}
