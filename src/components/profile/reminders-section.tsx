"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Bell, Plus, Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { Switch } from "@/components/ui/switch"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Button, textActionClass } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeader } from "@/components/ui/section-header"
import { ICON } from "@/lib/ui/icon"
import { focusElementById } from "@/lib/ui/focus"
import { REMINDER_TYPE_OPTIONS, REMINDER_DAY_OPTIONS } from "@/lib/constants"
import { createReminder, updateReminder, deleteReminder, toggleReminder } from "@/lib/actions/reminders"
import type { ReminderInput } from "@/lib/validations/reminder"
import { normalizeReminderTime } from "@/lib/reminders/options"
import type { Tables } from "@/types/database"
import { runAction } from "@/lib/client/run-action"

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
  // The button she used is gone now: focus moves to the form's title.
  useEffect(() => {
    if (!showForm) return
    const id = window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      document.getElementById("reminder-form-title")?.focus({ preventScroll: true })
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

  // Closing the form (Opslaan, Annuleren, ✕) removes the control she used:
  // focus returns to the "Herinneringen" heading, not to the page.
  function cancelForm() {
    setAdding(false)
    setEditingId(null)
    setError(null)
    requestAnimationFrame(() => focusElementById("herinneringen"))
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
        const result = await runAction(() => updateReminder(editingId, payload))
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
          const result = await runAction(() => createReminder({ ...base, type }))
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
      const result = await runAction(() => deleteReminder(id))
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

  // Removing lives inside "wijzigen" (tap a reminder), like an alarm on a phone.
  function handleDeleteFromForm(id: string) {
    cancelForm()
    handleDelete(id)
    // The form (and the button she pressed) is gone: land on the section
    // heading instead of the page.
    requestAnimationFrame(() => focusElementById("herinneringen"))
  }

  function handleToggle(reminder: Reminder) {
    setError(null)
    const nextEnabled = !reminder.enabled
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, enabled: nextEnabled } : r)))
    if (nextEnabled) maybeRequestNotificationPermission()
    startTransition(async () => {
      const result = await runAction(() => toggleReminder(reminder.id, nextEnabled))
      if (result?.error) {
        setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, enabled: !nextEnabled } : r)))
        setError(result.error)
      }
    })
  }

  return (
    <section aria-labelledby="herinneringen" className="flex flex-col">
      <SectionHeader
        id="herinneringen"
        title="Herinneringen"
        description="Je ziet een herinnering als de app op dat moment open is, en met jouw toestemming ook als melding."
      />

      {!showForm && error && (
        <p role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      )}

      {reminders.length > 0 && !adding && (
        <Card padding="none" className="mb-3 divide-y divide-line overflow-hidden">
          {reminders.map((reminder) => {
            const typeOption = REMINDER_TYPE_OPTIONS.find((t) => t.value === reminder.type)
            const isEditingThis = editingId === reminder.id
            if (isEditingThis) {
              return (
                <div key={reminder.id} className="p-4">
                  {renderForm()}
                </div>
              )
            }
            if (showForm) return null
            const Icon = typeOption?.icon ?? Bell
            const title = reminder.label?.trim() || typeOption?.label || "Herinnering"
            const switchId = `reminder-switch-${reminder.id}`
            return (
              <div key={reminder.id} className="flex min-h-14 items-center gap-1 pr-4">
                {/* Tap the reminder to change (or remove) it; the switch turns it on or off. */}
                <button
                  type="button"
                  onClick={() => startEdit(reminder)}
                  disabled={isPending}
                  aria-label={`${title} wijzigen`}
                  // The name is short; time and days are read right after it.
                  aria-describedby={`${switchId}-meta`}
                  className="flex min-w-0 flex-1 items-center gap-3.5 py-3 pl-4 text-left touch-manipulation transition-colors duration-fast ease-standard -outline-offset-2 hover:bg-cream-soft/60 active:bg-cream-soft"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
                  >
                    <Icon {...ICON.sm} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span id={`${switchId}-title`} className="truncate text-base font-medium text-ink">
                      {title}
                    </span>
                    <span id={`${switchId}-meta`} className="text-sm text-ink-soft">
                      {formatTime(reminder.time)} · {daysLabel(reminder.days)}
                    </span>
                  </span>
                </button>
                <Switch
                  id={switchId}
                  checked={reminder.enabled}
                  onChange={() => handleToggle(reminder)}
                  disabled={isPending}
                  aria-labelledby={`${switchId}-title`}
                  // Two reminders of the same kind differ only in time and days.
                  aria-describedby={`${switchId}-meta`}
                  className="ml-2"
                />
              </div>
            )
          })}
        </Card>
      )}

      {!reminders.length && !showForm && (
        <EmptyState
          icon={Bell}
          titleAs="h3"
          title="Nog geen herinneringen"
          description="Voeg er een toe wanneer jij dat wilt."
          action={
            <Button variant="secondary" onClick={startAdd}>
              <Plus {...ICON.md} aria-hidden />
              Herinnering toevoegen
            </Button>
          }
          className="py-6"
        />
      )}

      {adding && <Card className="mb-3">{renderForm()}</Card>}

      {reminders.length > 0 && !showForm && (
        <Button variant="secondary" className="w-full" onClick={startAdd}>
          <Plus {...ICON.md} aria-hidden />
          Herinnering toevoegen
        </Button>
      )}
    </section>
  )

  function renderForm() {
    const editing = editingId ? reminders.find((r) => r.id === editingId) : undefined
    return (
      <div
        ref={formRef}
        className="flex flex-col gap-4 scroll-mb-[calc(var(--bottom-nav-h,5.5rem)+1rem)]"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 id="reminder-form-title" tabIndex={-1} data-focus-target="" className="type-card-title text-ink">
            {editingId ? "Herinnering wijzigen" : "Nieuwe herinnering"}
          </h3>
          <IconButton label="Sluiten" icon={X} onClick={cancelForm} className="-mr-2" />
        </div>

        <div>
          <p id="reminder-types-label" className="mb-1 text-sm font-medium text-ink">
            Waarvoor?
          </p>
          {!editingId && (
            <p id="reminder-types-hint" className="mb-2 text-sm text-ink-soft">
              Kies er gerust meer. Dan maak je in één keer meerdere herinneringen (zelfde dagen en
              tijdstip).
            </p>
          )}
          <div
            role="group"
            aria-labelledby="reminder-types-label"
            aria-describedby={editingId ? undefined : "reminder-types-hint"}
            className="flex flex-wrap gap-2"
          >
            {availableTypeOptions.map((opt) => (
              <Chip
                key={opt.value}
                selected={selectedTypes.includes(opt.value)}
                onClick={() => toggleType(opt.value)}
              >
                <opt.icon {...ICON.sm} aria-hidden />
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
          <p id="reminder-days-label" className="mb-2 text-sm font-medium text-ink">
            Op welke dagen?
          </p>
          <div role="group" aria-labelledby="reminder-days-label" className="flex flex-wrap gap-2">
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
            className="w-40"
          />
        </div>

        <FieldError>{error}</FieldError>

        <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-start">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending
              ? "Bezig…"
              : editingId
                ? "Wijzigingen opslaan"
                : selectedTypes.length > 1
                  ? `${selectedTypes.length} herinneringen opslaan`
                  : "Opslaan"}
          </Button>
          <Button variant="ghost" onClick={cancelForm} disabled={isPending}>
            Annuleren
          </Button>
        </div>

        {editing && (
          <div className="border-t border-line pt-3">
            {confirmDeleteId === editing.id ? (
              <div role="group" aria-labelledby="reminder-delete-question" className="flex flex-col gap-2">
                <p id="reminder-delete-question" className="text-sm text-ink">
                  Deze herinnering verwijderen?
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="danger" size="sm" onClick={() => handleDeleteFromForm(editing.id)} disabled={isPending}>
                    Verwijderen
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} disabled={isPending}>
                    Bewaren
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeleteId(editing.id)}
                disabled={isPending}
                className={textActionClass("text-danger")}
              >
                <Trash2 {...ICON.sm} aria-hidden />
                Herinnering verwijderen
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
}
