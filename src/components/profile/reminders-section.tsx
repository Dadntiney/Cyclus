"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bell, Plus, Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Switch } from "@/components/ui/switch"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { REMINDER_TYPE_OPTIONS, REMINDER_DAY_OPTIONS } from "@/lib/constants"
import { createReminder, updateReminder, deleteReminder, toggleReminder } from "@/lib/actions/reminders"
import type { ReminderInput } from "@/lib/validations/reminder"
import type { Tables } from "@/types/database"

type Reminder = Tables<"reminders">

const ALL_DAYS = REMINDER_DAY_OPTIONS.map((d) => d.value)

function daysLabel(days: number[]): string {
  if (days.length === 7) return "Elke dag"
  const sorted = [...days].sort((a, b) => a - b)
  return sorted.map((d) => REMINDER_DAY_OPTIONS.find((o) => o.value === d)?.label ?? "").join(", ")
}

function formatTime(time: string): string {
  return time.slice(0, 5)
}

function emptyDraft(): ReminderInput {
  return { type: "dagelijkse_checkin", label: "", enabled: true, days: ALL_DAYS, time: "09:00" }
}

/**
 * Asks for browser notification permission once, at the moment she actually
 * turns a reminder on — never on page load. If she says no (or the browser
 * doesn't support it), the in-app toast in ReminderToastHost still works.
 */
function maybeRequestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission === "default") {
    Notification.requestPermission().catch(() => {})
  }
}

export function RemindersSection({
  initialReminders,
  movementEnabled = true,
  nutritionEnabled = true,
  mentalWellbeingEnabled = false,
}: {
  initialReminders: Reminder[]
  movementEnabled?: boolean
  nutritionEnabled?: boolean
  mentalWellbeingEnabled?: boolean
}) {
  const router = useRouter()
  const [reminders, setReminders] = useState(initialReminders)
  const availableTypeOptions = REMINDER_TYPE_OPTIONS.filter((opt) => {
    const requires = "requires" in opt ? opt.requires : undefined
    if (requires === "movement_enabled") return movementEnabled
    if (requires === "nutrition_enabled") return nutritionEnabled
    if (requires === "mental_wellbeing_enabled") return mentalWellbeingEnabled
    return true
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<ReminderInput>(emptyDraft())
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function startAdd() {
    setDraft(emptyDraft())
    setError(null)
    setAdding(true)
    setEditingId(null)
  }

  function startEdit(reminder: Reminder) {
    setDraft({
      type: reminder.type as ReminderInput["type"],
      label: reminder.label ?? "",
      enabled: reminder.enabled,
      days: reminder.days,
      time: formatTime(reminder.time),
    })
    setError(null)
    setEditingId(reminder.id)
    setAdding(false)
  }

  function cancelForm() {
    setAdding(false)
    setEditingId(null)
    setError(null)
  }

  function toggleDay(day: number) {
    setDraft((d) => ({
      ...d,
      days: d.days.includes(day) ? d.days.filter((v) => v !== day) : [...d.days, day].sort((a, b) => a - b),
    }))
  }

  function handleSave() {
    setError(null)
    if (draft.enabled) maybeRequestNotificationPermission()
    startTransition(async () => {
      const result = editingId ? await updateReminder(editingId, draft) : await createReminder(draft)
      if (result.error) {
        setError(result.error)
        return
      }
      cancelForm()
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    setError(null)
    setConfirmDeleteId(null)
    const removed = reminders.find((r) => r.id === id)
    const removedIndex = reminders.findIndex((r) => r.id === id)
    setReminders((prev) => prev.filter((r) => r.id !== id))
    startTransition(async () => {
      const result = await deleteReminder(id)
      if (result?.error) {
        // Roll back: put the reminder back where it was.
        if (removed) {
          setReminders((prev) => {
            const next = [...prev]
            next.splice(removedIndex, 0, removed)
            return next
          })
        }
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleToggle(reminder: Reminder) {
    setError(null)
    const nextEnabled = !reminder.enabled
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, enabled: nextEnabled } : r)))
    if (nextEnabled) maybeRequestNotificationPermission()
    startTransition(async () => {
      const result = await toggleReminder(reminder.id, nextEnabled)
      if (result?.error) {
        setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, enabled: !nextEnabled } : r)))
        setError(result.error)
      }
    })
  }

  const showForm = adding || editingId !== null

  return (
    <Card>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-ink inline-flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
          Herinneringen
        </p>
        {!showForm && (
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-1 text-xs font-medium text-sage-dark touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 rounded"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Toevoegen
          </button>
        )}
      </div>
      <p className="text-xs text-ink-soft mb-3">
        Helemaal optioneel. We laten een herinnering zien zodra je de app open hebt op dat moment
        — en, met jouw toestemming, ook als melding van je browser.
      </p>

      {!showForm && error && <p className="text-xs text-danger mb-2">{error}</p>}

      {reminders.length > 0 && !showForm && (
        <div className="flex flex-col gap-2 mb-3">
          {reminders.map((reminder) => {
            const typeOption = REMINDER_TYPE_OPTIONS.find((t) => t.value === reminder.type)
            return (
              <div
                key={reminder.id}
                className="flex flex-col gap-2 rounded-2xl border border-line px-3.5 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg shrink-0" aria-hidden>
                    {typeOption?.emoji ?? "🔔"}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(reminder)}
                    className="min-w-0 flex-1 text-left touch-manipulation"
                  >
                    <p className="text-sm font-medium text-ink truncate">
                      {reminder.label?.trim() || typeOption?.label || "Herinnering"}
                    </p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {formatTime(reminder.time)} · {daysLabel(reminder.days)}
                    </p>
                  </button>
                  <Switch
                    checked={reminder.enabled}
                    onChange={() => handleToggle(reminder)}
                    disabled={isPending}
                    aria-label={reminder.enabled ? "Herinnering uitzetten" : "Herinnering aanzetten"}
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(reminder.id)}
                    disabled={isPending}
                    className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
                    aria-label="Herinnering verwijderen"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>

                {confirmDeleteId === reminder.id && (
                  <div className="flex items-center gap-2 rounded-xl bg-cream-soft p-2.5">
                    <p className="text-xs text-ink-soft flex-1">Deze herinnering verwijderen?</p>
                    <button
                      type="button"
                      onClick={() => handleDelete(reminder.id)}
                      className="text-xs font-medium text-danger touch-manipulation"
                    >
                      Verwijderen
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs font-medium text-ink-soft touch-manipulation"
                    >
                      Annuleren
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!reminders.length && !showForm && (
        <EmptyState
          icon={<Bell className="h-6 w-6" strokeWidth={1.5} />}
          title="Nog geen herinneringen ingesteld"
          description="Voeg er gerust een toe wanneer jij dat wilt — helemaal optioneel."
        />
      )}

      {showForm && (
        <div className="flex flex-col gap-4 rounded-2xl border border-line p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              {editingId ? "Herinnering bewerken" : "Nieuwe herinnering"}
            </p>
            <button
              type="button"
              onClick={cancelForm}
              className="h-7 w-7 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-2">Waarvoor?</p>
            <div className="flex flex-wrap gap-2">
              {availableTypeOptions.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={draft.type === opt.value}
                  onClick={() => setDraft((d) => ({ ...d, type: opt.value }))}
                >
                  <span className="mr-1" aria-hidden>
                    {opt.emoji}
                  </span>
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="reminder-label">
              {draft.type === "anders" ? "Waar wil je aan herinnerd worden?" : "Eigen omschrijving (optioneel)"}
            </Label>
            <Input
              id="reminder-label"
              value={draft.label ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              placeholder={
                draft.type === "anders" ? "Bijvoorbeeld: yoga-oefeningen doen" : "Laat leeg voor de standaardtekst"
              }
            />
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-2">Op welke dagen?</p>
            <div className="flex flex-wrap gap-2">
              {REMINDER_DAY_OPTIONS.map((opt) => (
                <Chip key={opt.value} selected={draft.days.includes(opt.value)} onClick={() => toggleDay(opt.value)}>
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="reminder-time">Op welk tijdstip?</Label>
            <Input
              id="reminder-time"
              type="time"
              value={draft.time}
              onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              className="max-w-[160px]"
            />
          </div>

          <FieldError>{error}</FieldError>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "Bezig..." : "Opslaan"}
            </Button>
            <Button variant="secondary" onClick={cancelForm} disabled={isPending}>
              Annuleren
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
