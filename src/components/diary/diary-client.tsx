"use client"

import { useState, useTransition } from "react"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea, Label } from "@/components/ui/input"
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

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="font-display text-lg text-ink mb-1">Nieuw</h2>
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
              else setBody("")
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
          <Card>
            <p className="text-sm text-ink-soft">Nog geen dagboekentries.</p>
          </Card>
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
                    className="text-xs text-ink-soft underline"
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
