"use client"

import { useState } from "react"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SleepEntrySheet } from "@/components/sleep/sleep-entry-sheet"
import { ICON } from "@/lib/ui/icon"
import type { Tables } from "@/types/database"

type SleepEntry = Tables<"sleep_entries">

/**
 * The one primary action on Slaap: opens the existing entry sheet for last
 * night (stored under today's date, like the card on Vandaag). Reads
 * "Nacht aanpassen" once that night is filled in.
 */
export function SleepNightButton({ date, entry }: { date: string; entry: SleepEntry | null }) {
  const [open, setOpen] = useState(false)
  const Icon = entry ? Pencil : Plus

  return (
    <>
      <Button onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Icon {...ICON.sm} aria-hidden />
        {entry ? "Nacht aanpassen" : "Nacht toevoegen"}
      </Button>
      <SleepEntrySheet open={open} onClose={() => setOpen(false)} date={date} initial={entry} />
    </>
  )
}
