"use client"

import { useState, useTransition } from "react"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { NotebookPen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea, Label } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { ActionToast, useActionToast } from "@/components/ui/action-toast"
import { createDiaryEntry, deleteDiaryEntry } from "@/lib/actions/diary"

type Entry = {
  id: string
  date: string
  body: string
  created_at: string
}

export function DiaryClient({ entries }: { entries: Entry[] }) {
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const toast = useActionToast(2000)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h2 className="font-display text-lg text-ink">Nieuw</h2>
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
              const result = await createDiaryEntry({ body })
              if (result?.error) setError(result.error)
              else {
                setBody("")
                toast.show("Opgeslagen")
              }
            })
          }}
        >
          Opslaan
        </Button>
        {error && <p className="text-sm text-danger mt-2">{error}</p>}
      </Card>

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Eerdere notities</h2>
        {entries.length === 0 ? (
          <EmptyState
            icon={<NotebookPen className="h-6 w-6" strokeWidth={1.5} />}
            title="Nog geen notities"
            description="Schrijf hierboven iets op — het blijft privé en alleen voor jou."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs text-ink-soft">
                    {format(parseISO(entry.date), "d MMMM yyyy", { locale: nl })}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-ink-soft underline min-h-11 px-1 touch-manipulation"
                    onClick={() =>
                      startTransition(async () => {
                        await deleteDiaryEntry(entry.id)
                      })
                    }
                  >
                    Verwijder
                  </button>
                </div>
                <p className="text-sm text-ink mt-2 whitespace-pre-wrap">{entry.body}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
