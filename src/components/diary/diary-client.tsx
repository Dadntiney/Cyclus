"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, NotebookPen, Trash2 } from "lucide-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Card } from "@/components/ui/card"
import { Button, textActionClass } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Textarea, Label } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeader } from "@/components/ui/section-header"
import { toast } from "@/components/ui/toast"
import { createDiaryEntry, deleteDiaryEntry, updateDiaryEntry } from "@/lib/actions/diary"
import { runAction } from "@/lib/client/run-action"
import { formatLongDate } from "@/lib/dates/format"
import { ICON } from "@/lib/ui/icon"

type Entry = {
  id: string
  date: string
  body: string
  created_at: string
}

/**
 * The writing surface is the card itself: no field-in-a-card, no label
 * above it. Opslaan only appears once there is something to save.
 */
export function DiaryClient({ entries }: { entries: Entry[] }) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const hasText = body.trim().length > 0

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await runAction(() => createDiaryEntry({ body }))
      if (result?.error) setError(result.error)
      else {
        setBody("")
        toast.show({ title: "Opgeslagen" })
        router.refresh()
      }
    })
  }

  return (
    <>
      <section aria-label="Nieuwe notitie" className="flex flex-col gap-2">
        <Card padding="none">
          <Textarea
            ref={fieldRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            aria-label="Nieuwe notitie"
            aria-describedby={error ? "diary-error" : undefined}
            placeholder="Wat speelt er vandaag? Wat wil je onthouden?"
            className="rounded-card border-0 bg-transparent p-5"
          />
          {(hasText || isPending) && (
            <div className="flex justify-end px-4 pb-4 motion-safe:animate-fade-in">
              <Button type="button" size="sm" disabled={isPending || !hasText} onClick={save}>
                {isPending ? "Bezig…" : "Opslaan"}
              </Button>
            </div>
          )}
        </Card>
        {error && (
          <p id="diary-error" role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </section>

      <section aria-labelledby="eerdere-notities">
        <SectionHeader id="eerdere-notities" title="Eerdere notities" />
        {entries.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            titleAs="h3"
            title="Nog geen notities"
            description="Wat je hierboven opschrijft, komt hier te staan. Het blijft privé en alleen voor jou."
            className="py-6"
            action={
              <button type="button" onClick={() => fieldRef.current?.focus()} className={textActionClass()}>
                Schrijf je eerste notitie
              </button>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

/**
 * One saved note: read it, edit it in place, or remove it via ⋯ — which
 * asks once more, because a removed note can't be brought back.
 */
function DiaryEntryCard({ entry }: { entry: Entry }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [sheet, setSheet] = useState<"menu" | "confirm" | null>(null)
  const [draft, setDraft] = useState(entry.body)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const dateLabel = formatLongDate(entry.date, { year: true })
  const editId = `diary-edit-${entry.id}`
  const keepRef = useRef<HTMLButtonElement>(null)
  const editFieldRef = useRef<HTMLTextAreaElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)

  // Bewerken swaps the text for a field (focus goes into it); Opslaan or
  // Annuleren swaps it back, and focus returns to Bewerken instead of
  // falling to the top of the page.
  useEffect(() => {
    if (editing) editFieldRef.current?.focus()
    else if (wasEditing.current) editButtonRef.current?.focus()
    wasEditing.current = editing
  }, [editing])

  // The menu row she tapped is gone once the sheet asks to confirm: move
  // focus to the safe choice, never to Verwijderen.
  useEffect(() => {
    if (sheet === "confirm") keepRef.current?.focus()
  }, [sheet])

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await runAction(() => updateDiaryEntry(entry.id, draft))
      if (result?.error) {
        setError(result.error)
        return
      }
      setEditing(false)
      router.refresh()
    })
  }

  function remove() {
    setError(null)
    startTransition(async () => {
      const result = await runAction(() => deleteDiaryEntry(entry.id))
      setSheet(null)
      if (result?.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <Card as="li">
      <div className="-mt-2 -mr-2 flex items-center justify-between gap-3">
        <time id={`${editId}-date`} dateTime={entry.date} className="type-caption text-ink-soft">
          {dateLabel}
        </time>
        {!editing && (
          <div className="flex items-center">
            <button
              ref={editButtonRef}
              type="button"
              className={textActionClass("px-2")}
              // Every note has a Bewerken: the date tells them apart.
              aria-describedby={`${editId}-date`}
              onClick={() => {
                setError(null)
                setEditing(true)
              }}
            >
              Bewerken
            </button>
            <IconButton
              label={`Meer voor notitie van ${dateLabel}`}
              icon={MoreHorizontal}
              onClick={() => setSheet("menu")}
            />
          </div>
        )}
      </div>

      {editing ? (
        <>
          <Label htmlFor={editId} className="sr-only">
            Notitie bewerken
          </Label>
          <Textarea
            ref={editFieldRef}
            id={editId}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            className="mt-1"
          />
          <div className="mt-3 flex items-center gap-3">
            <Button type="button" size="sm" disabled={isPending || !draft.trim()} onClick={save}>
              {isPending ? "Bezig…" : "Opslaan"}
            </Button>
            <button
              type="button"
              className={textActionClass("text-ink-soft")}
              onClick={() => {
                setDraft(entry.body)
                setEditing(false)
              }}
            >
              Annuleren
            </button>
          </div>
        </>
      ) : (
        <p className="mt-1 type-body whitespace-pre-wrap text-ink">{entry.body}</p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}

      <BottomSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet === "confirm" ? "Notitie verwijderen?" : `Notitie van ${dateLabel}`}
        footer={
          sheet === "confirm" ? (
            <div className="flex flex-col gap-2">
              <Button type="button" variant="danger" disabled={isPending} onClick={remove}>
                {isPending ? "Bezig…" : "Verwijderen"}
              </Button>
              <Button
                ref={keepRef}
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => setSheet(null)}
              >
                Bewaren
              </Button>
            </div>
          ) : undefined
        }
      >
        {sheet === "confirm" ? (
          <p className="type-body text-ink-soft">Dit kun je niet ongedaan maken.</p>
        ) : (
          <button
            type="button"
            onClick={() => setSheet("confirm")}
            className="flex min-h-14 w-full items-center gap-3.5 rounded-inset px-1 text-left text-base font-medium text-danger touch-manipulation transition-colors duration-fast ease-standard hover:bg-cream-soft active:bg-cream-soft"
          >
            <Trash2 {...ICON.md} aria-hidden />
            Notitie verwijderen
          </button>
        )}
      </BottomSheet>
    </Card>
  )
}
