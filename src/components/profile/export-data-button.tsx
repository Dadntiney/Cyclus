"use client"

import { useState, useTransition } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportUserData } from "@/lib/actions/export-data"
import { runAction } from "@/lib/client/run-action"
import { ICON } from "@/lib/ui/icon"

export function ExportDataButton() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleExport() {
    setError(null)
    startTransition(async () => {
      const result = await runAction(() => exportUserData())
      if (result.error || !result.data || !result.filename) {
        setError(result.error ?? "Export is niet gelukt.")
        return
      }
      const blob = new Blob([result.data], { type: "application/json;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleExport}
        disabled={isPending}
        aria-describedby="export-data-hint"
        className="self-start"
      >
        <Download {...ICON.md} aria-hidden />
        {isPending ? "Bezig met exporteren…" : "Download mijn gegevens"}
      </Button>
      <p id="export-data-hint" className="text-sm text-ink-soft">
        Een JSON-bestand met je profiel, check-ins, cycluslogs, slaap, medicatie, dagboek en
        klachtenlast-scores. Handig voor jezelf of als je wilt overstappen.
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
