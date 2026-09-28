"use client"

import { useState, useTransition } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportUserData } from "@/lib/actions/export-data"

export function ExportDataButton() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleExport() {
    setError(null)
    startTransition(async () => {
      const result = await exportUserData()
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
    <div className="flex flex-col gap-2 mb-4">
      <Button type="button" variant="secondary" onClick={handleExport} disabled={isPending}>
        <Download className="h-4 w-4" strokeWidth={1.75} />
        {isPending ? "Bezig met exporteren…" : "Download mijn gegevens (JSON)"}
      </Button>
      <p className="text-xs text-ink-soft leading-relaxed">
        Je krijgt een bestand met je profiel, check-ins, cycluslogs, slaap, medicatie, dagboek en
        klachtenlast-scores. Handig voor jezelf of als je wilt overstappen.
      </p>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
}
