"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bell, Pencil, Plus, Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Switch } from "@/components/ui/switch"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { REMINDER_TYPE_OPTIONS, REMINDER_DAY_OPTIONS } from "@/lib/constants"
import { createReminder, updateReminder, deleteReminder, toggleReminder } from "@/lib/actions/reminders"
import { normalizeReminderTime, type ReminderInput } from "@/lib/validations/reminder"
import type { Tables } from "@/types/database"

type Reminder = Tables<"reminders">

const ALL_DAYS = REMINDER_DAY_OPTIONS.map((d) => d.value)

function daysLabel(days: number[]): string {
  if (days.length === 7) return "Elke dag"
  const sorted = [...days].sort((a, b) => a - b)
  return sorted.map((d) => REMINDER_DAY_OPTIONS.find((o) => o.value === d)?.label ?? "").join(", ")
}

function formatTime(time: string): string {
  return normalizeReminderTime(time)
}

type ReminderType = ReminderInput["type"]

function emptyDraft(): ReminderInput {
  return { type: "dagelijkse_checkin", label: "", enabled: true, days: ALL_DAYS, time: "09:00" }
}

function sortByTime(list: Reminder[]): Reminder[] {
  return [...list].sort((a, b) => formatTime(a.time).localeCompare(formatTime(b.time)))
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
  const formRef = useRef<HTMLDivElement>(null)
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
  // Add-mode: pick several "Waarvoor?" types → one reminder each on save.
  const [selectedTypes, setSelectedTypes] = useState<ReminderType[]>(["dagelijkse_checkin"])
  const [error, setError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  // Ids removed locally while a stale router.refresh() may still include them.
  const deletedIdsRef = useRef<Set<string>>(new Set())

  // Adopt server props without clobbering optimistic creates, and without
  // resurrecting rows we just deleted before the cache catches up.
  useEffect(() => {
    for (const id of [...deletedIdsRef.current]) {
      if (!initialReminders.some((r) => r.id === id)) deletedIdsRef.current.delete(id)
    }
    setReminders((local) => {
      const serverVisible = initialReminders.filter((r) => !deletedIdsRef.current.has(r.id))
      const serverIds = new Set(serverVisible.map((r) => r.id))
      const pendingLocal = local.filter(
        (r) => !serverIds.has(r.id) && !deletedIdsRef.current.has(r.id),
      )
      if (pendingLocal.length === 0 && deletedIdsRef.current.size === 0) {
        return initialReminders
      }
      return sortByTime([...serverVisible, ...pendingLocal])
    })
  }, [initialReminders])

  const showForm = adding || editingId !== null

  // Form sits above the bottom nav — scroll so Opslaan is reachable on mobile.
  useEffect(() => {
    if (!showForm) return
    const id = window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }, 50)
    return () => window.clearTimeout(id)
  }, [showForm])

  function startAdd() {
    setDraft(emptyDraft())
    setSelectedTypes(["dagelijkse_checkin"])
    setError(null)
    setAdding(true)
    setEditingId(null)
  }

  function startEdit(reminder: Reminder) {
    const type = reminder.type as ReminderType
    setDraft({
      type,
      label: reminder.label ?? "",
      enabled: reminder.enabled,
      days: reminder.days,
      time: formatTime(reminder.time),
    })
    setSelectedTypes([type])
    setError(null)
    setConfirmDeleteId(null)
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

  function toggleType(type: ReminderType) {
    if (editingId) {
      setDraft((d) => ({ ...d, type }))
      setSelectedTypes([type])
      return
    }
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        // Keep at least one type selected.
        if (prev.length === 1) return prev
        return prev.filter((t) => t !== type)
      }
      return [...prev, type]
    })
  }

  function handleSave() {
    setError(null)
    if (!editingId && selectedTypes.length === 0) {
      setError("Kies minstens één onderwerp.")
      return
    }
    if (draft.days.length === 0) {
      setError("Kies minstens één dag.")
      return
    }
    const base: Omit<ReminderInput, "type"> & { type?: ReminderType } = {
      time: normalizeReminderTime(draft.time),
      label: draft.label?.trim() || "",
      enabled: draft.enabled,
      days: draft.days,
    }
    if (base.enabled) maybeRequestNotificationPermission()
    startTransition(async () => {
      if (editingId) {
        const payload: ReminderInput = { ...base, type: draft.type }
        const result = await updateReminder(editingId, payload)
        if (result.error) {
          setError(result.error)
          return
        }
        if (result.reminder) {
          setReminders((prev) => sortByTime(prev.map((r) => (r.id === editingId ? result.reminder! : r))))
        } else {
          setReminders((prev) =>
            sortByTime(
              prev.map((r) =>
                r.id === editingId
                  ? {
                      ...r,
                      type: payload.type,
                      label: payload.label?.trim() || null,
                      enabled: payload.enabled,
                      days: payload.days,
                      time: payload.time,
                    }
                  : r,
              ),
            ),
          )
        }
      } else {
        const created: Reminder[] = []
        for (const type of selectedTypes) {
          const result = await createReminder({ ...base, type })
          if (result.error) {
            if (created.length) {
              setReminders((prev) => {
                const merged = [...prev]
                for (const row of created) {
                  if (!merged.some((r) => r.id === row.id)) merged.push(row)
                }
                return sortByTime(merged)
              })
            }
            setError(result.error)
            return
          }
          if (result.reminder) created.push(result.reminder as Reminder)
        }
        if (created.length) {
          setReminders((prev) => {
            const merged = [...prev]
            for (const row of created) {
              if (!merged.some((r) => r.id === row.id)) merged.push(row)
            }
            return sortByTime(merged)
          })
        }
      }
      cancelForm()
      // Refresh shell data (toast host); local list already updated above.
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    setError(null)
    setConfirmDeleteId(null)
    const removed = reminders.find((r) => r.id === id)
    const removedIndex = reminders.findIndex((r) => r.id === id)
    deletedIdsRef.current.add(id)
    setReminders((prev) => prev.filter((r) => r.id !== id))
    startTransition(async () => {
      const result = await deleteReminder(id)
      if (result?.error) {
        deletedIdsRef.current.delete(id)
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

  return (
    <Card id="herinneringen" className="scroll-mt-24">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-ink inline-flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
          Herinneringen
        </p>
        {!showForm && (
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-sage-dark touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 rounded"
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

      {reminders.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {reminders.map((reminder) => {
            const typeOption = REMINDER_TYPE_OPTIONS.find((t) => t.value === reminder.type)
            const isEditingThis = editingId === reminder.id
            if (isEditingThis) {
              return (
                <div key={reminder.id} className="rounded-2xl border border-sage/40 bg-sage-soft/30 p-1">
                  {renderForm()}
                </div>
              )
            }
            if (showForm) return null
            return (
              <div
                key={reminder.id}
                className="flex flex-col gap-2 rounded-[1.25rem] bg-surface border border-line px-3.5 py-3"
              >
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = typeOption?.icon ?? Bell
                    return <Icon className="h-5 w-5 shrink-0 text-sage-dark" strokeWidth={1.75} aria-hidden />
                  })()}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">
                      {reminder.label?.trim() || typeOption?.label || "Herinnering"}
                    </p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {formatTime(reminder.time)} · {daysLabel(reminder.days)}
                    </p>
                  </div>
                  <Switch
                    checked={reminder.enabled}
                    onChange={() => handleToggle(reminder)}
                    disabled={isPending}
                    aria-label={reminder.enabled ? "Herinnering uitzetten" : "Herinnering aanzetten"}
                  />
                  <button
                    type="button"
                    onClick={() => startEdit(reminder)}
                    disabled={isPending}
                    className="shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
                    aria-label="Herinnering wijzigen"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(reminder.id)}
                    disabled={isPending}
                    className="shrink-0 h-11 w-11 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
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

      {adding && renderForm()}
    </Card>
  )

  function renderForm() {
    return (
      <div
        ref={formRef}
        className="flex flex-col gap-4 rounded-[1.25rem] bg-surface border border-line p-4 scroll-mb-[calc(var(--bottom-nav-h,5.5rem)+1rem)]"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink">
            {editingId ? "Herinnering wijzigen" : "Nieuwe herinnering"}
          </p>
          <button
            type="button"
            onClick={cancelForm}
            className="h-11 w-11 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
            aria-label="Sluiten"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <p className="text-sm font-medium text-ink mb-1">Waarvoor?</p>
          {!editingId && (
            <p className="text-xs text-ink-soft mb-2">
              Je mag er meerdere tegelijk kiezen — dan maak je in één keer meerdere herinneringen
              (zelfde dagen en tijdstip).
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {availableTypeOptions.map((opt) => (
              <Chip
                key={opt.value}
                selected={selectedTypes.includes(opt.value)}
                onClick={() => toggleType(opt.value)}
              >
                <opt.icon className="h-4 w-4 mr-1 inline" strokeWidth={1.75} aria-hidden />
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="reminder-label">
            {selectedTypes.length === 1 && selectedTypes[0] === "anders"
              ? "Waar wil je aan herinnerd worden?"
              : "Eigen omschrijving (optioneel)"}
          </Label>
          <Input
            id="reminder-label"
            value={draft.label ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            placeholder={
              selectedTypes.length === 1 && selectedTypes[0] === "anders"
                ? "Bijvoorbeeld: yoga-oefeningen doen"
                : "Laat leeg voor de standaardtekst"
            }
          />
        </div>

        <div>
          <p className="text-sm font-medium text-ink mb-1">Op welke dagen?</p>
          <p className="text-xs text-ink-soft mb-2">Meerdere dagen mogelijk.</p>
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
            onChange={(e) => setDraft((d) => ({ ...d, time: normalizeReminderTime(e.target.value) }))}
            className="max-w-[160px]"
          />
        </div>

        <FieldError>{error}</FieldError>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending
              ? "Bezig..."
              : editingId
                ? "Wijzigingen opslaan"
                : selectedTypes.length > 1
                  ? `${selectedTypes.length} herinneringen opslaan`
                  : "Opslaan"}
          </Button>
          <Button variant="secondary" onClick={cancelForm} disabled={isPending}>
            Annuleren
          </Button>
        </div>
      </div>
    )
  }
}
