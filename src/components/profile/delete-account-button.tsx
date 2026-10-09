"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button, textActionClass } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { deleteAccount } from "@/lib/actions/profile"
import { clearLocalUserData } from "@/lib/client/account-sync"
import { runAction } from "@/lib/client/run-action"
import { ICON } from "@/lib/ui/icon"

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={textActionClass("self-start text-danger")}
      >
        <Trash2 {...ICON.sm} aria-hidden />
        Mijn account verwijderen
      </button>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Account verwijderen?"
        footer={
          <>
            <Button
              variant="danger"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  // Device copies go too; if deleting fails, they come back
                  // from the account on the next page load.
                  clearLocalUserData()
                  const result = await runAction(() => deleteAccount())
                  if (result?.error) setError(result.error)
                })
              }
            >
              {isPending ? "Bezig…" : "Ja, definitief verwijderen"}
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)} disabled={isPending}>
              Annuleren
            </Button>
          </>
        }
      >
        <p className="type-body text-ink-soft">
          Weet je het zeker? Je profiel, check-ins, favorieten en gesprekken worden definitief
          verwijderd. Dit kan niet ongedaan gemaakt worden.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}
      </Dialog>
    </>
  )
}
