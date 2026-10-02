"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { NotebookPen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea, Label } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { ActionToast, useActionToast } from "@/components/ui/action-toast"
import { createDiaryEntry, deleteDiaryEntry, updateDiaryEntry } from "@/lib/actions/diary"
import { runAction } from "@/lib/client/run-action"

type Entry = {
  id: string
  date: string
  body: string
  created_at: string
}

export function DiaryClient({ entries }: { entries: Entry[] }) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const toast = useActionToast(2000)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h2 className="font-display text-xl text-ink">Nieuw</h2>
          <ActionToast message={toast.message} />
        </div>
        <p className="text-sm text-ink-soft mb-3">Schrijf van je af. Alleen jij ziet dit.</p>
        <Label htmlFor="diary-body">Vandaag</Label>
        <Textarea
          id="diary-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="mt-1"
          placeholder="Wat speelt er? Wat wil je onthouden?"
        />
        <Button
          type="button"
          className="mt-3"
          disabled={isPending || !body.trim()}
          onClick={() => {
            setError(null)
            startTransition(async () => {
              const result = await runAction(() => createDiaryEntry({ body }))
              if (result?.error) setError(result.error)
              else {
                setBody("")
                toast.show("Opgeslagen")
                router.refresh()
              }
            })
          }}
        >
          Opslaan
        </Button>
        {error && <p className="text-sm text-danger mt-2">{error}</p>}
      </Card>

      <div>
        <h2 className="font-display text-xl text-ink mb-3">Eerdere notities</h2>
        {entries.length === 0 ? (
          <EmptyState
            icon={<NotebookPen className="h-6 w-6" strokeWidth={1.5} />}
            title="Nog geen notities"
            description="Schrijf hierboven iets op — het blijft privé en alleen voor jou."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * One saved note: read, edit in place, or delete — deleting asks once more,
 * because a removed note can't be brought back.
 */
function DiaryEntryCard({ entry }: { entry: Entry }) {
  const router = useRouter()
  const [mode, setMode] = useState<"read" | "edit" | "confirm-delete">("read")
  const [draft, setDraft] = useState(entry.body)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await runAction(() => updateDiaryEntry(entry.id, draft))
      if (result?.error) {
        setError(result.error)
        return
      }
      setMode("read")
      router.refresh()
    })
  }

  function remove() {
    setError(null)
    startTransition(async () => {
      const result = await runAction(() => deleteDiaryEntry(entry.id))
      if (result?.error) {
        setError(result.error)
        setMode("read")
        return
      }
      router.refresh()
    })
  }

  const linkClass = "text-sm text-sage-dark font-medium min-h-11 px-1 touch-manipulation disabled:opacity-50"

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">{format(parseISO(entry.date), "d MMMM yyyy", { locale: nl })}</p>
        {mode === "read" && (
          <div className="flex items-center gap-2">
            <button type="button" className={linkClass} onClick={() => setMode("edit")}>
              Bewerk
            </button>
            <button
              type="button"
              className="text-sm text-ink-soft min-h-11 px-1 touch-manipulation"
              onClick={() => setMode("confirm-delete")}
            >
              Verwijder
            </button>
          </div>
        )}
      </div>

      {mode === "edit" ? (
        <>
          <Label htmlFor={`diary-edit-${entry.id}`} className="sr-only">
            Notitie bewerken
          </Label>
          <Textarea
            id={`diary-edit-${entry.id}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            className="mt-2"
          />
          <div className="flex items-center gap-3 mt-3">
            <Button type="button" size="sm" disabled={isPending || !draft.trim()} onClick={save}>
              {isPending ? "Bezig…" : "Opslaan"}
            </Button>
            <button
              type="button"
              className="text-sm text-ink-soft min-h-11 px-1 touch-manipulation"
              onClick={() => {
                setDraft(entry.body)
                setMode("read")
              }}
            >
              Annuleren
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{entry.body}</p>
      )}

      {mode === "confirm-delete" && (
        <div className="mt-3 rounded-2xl bg-cream-soft px-4 py-3">
          <p className="text-sm text-ink">Deze notitie verwijderen? Dit kun je niet ongedaan maken.</p>
          <div className="flex items-center gap-3 mt-2">
            <Button type="button" size="sm" variant="danger" disabled={isPending} onClick={remove}>
              {isPending ? "Bezig…" : "Verwijderen"}
            </Button>
            <button
              type="button"
              className="text-sm text-ink-soft min-h-11 px-1 touch-manipulation"
              onClick={() => setMode("read")}
            >
              Bewaren
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-danger mt-2">{error}</p>}
    </Card>
  )
}
