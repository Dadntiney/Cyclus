"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { deleteAccount } from "@/lib/actions/profile"

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-danger font-medium underline underline-offset-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
      >
        Mijn account verwijderen
      </button>

      <Dialog open={confirming} onClose={() => setConfirming(false)} title="Account verwijderen?">
        <p className="text-sm text-ink-soft mb-4">
          Weet je het zeker? Je profiel, check-ins, favorieten en gesprekken worden definitief
          verwijderd. Dit kan niet ongedaan gemaakt worden.
        </p>
        {error && <p className="text-sm text-danger mb-3">{error}</p>}
        <div className="flex gap-2.5">
          <Button
            variant="danger"
            size="sm"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteAccount()
                if (result?.error) setError(result.error)
              })
            }
          >
            {isPending ? "Bezig..." : "Ja, definitief verwijderen"}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} disabled={isPending}>
            Annuleren
          </Button>
        </div>
      </Dialog>
    </>
  )
}
