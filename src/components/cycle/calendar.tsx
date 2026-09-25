"use client"

import { useMemo, useState, useTransition } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from "date-fns"
import { nl } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleMenstruationDay } from "@/lib/actions/cycle"

interface CalendarProps {
  menstruationDates: Set<string>
}

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"]

export function Calendar({ menstruationDates: initialDates }: CalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [dates, setDates] = useState(initialDates)
  const [isPending, startTransition] = useTransition()
  const [pendingDate, setPendingDate] = useState<string | null>(null)

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  const leadingBlanks = (getDay(startOfMonth(month)) + 6) % 7

  function handleDayClick(day: Date) {
    const iso = format(day, "yyyy-MM-dd")
    if (iso > format(new Date(), "yyyy-MM-dd")) return
    setPendingDate(iso)
    setDates((prev) => {
      const next = new Set(prev)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
    startTransition(async () => {
      await toggleMenstruationDay(iso)
      setPendingDate(null)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="h-8 w-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft"
          aria-label="Vorige maand"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="font-display text-base text-ink capitalize">
          {format(month, "MMMM yyyy", { locale: nl })}
        </p>
        <button
          type="button"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="h-8 w-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft"
          aria-label="Volgende maand"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-xs text-ink-soft font-medium py-1">
            {label}
          </div>
        ))}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const iso = format(day, "yyyy-MM-dd")
          const isMenstruation = dates.has(iso)
          const future = iso > format(new Date(), "yyyy-MM-dd")
          return (
            <button
              key={iso}
              type="button"
              disabled={future}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative h-10 rounded-full text-sm mx-auto w-10 flex items-center justify-center transition-colors",
                isSameMonth(day, month) ? "text-ink" : "text-ink-soft/40",
                isMenstruation && "bg-peach text-white font-medium",
                !isMenstruation && isToday(day) && "border border-sage text-sage-dark font-medium",
                !isMenstruation && !isToday(day) && "hover:bg-cream-soft",
                future && "opacity-30 cursor-not-allowed",
                isPending && pendingDate === iso && "opacity-60",
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-ink-soft">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-peach inline-block" />
          Menstruatie
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-sage inline-block" />
          Vandaag
        </div>
      </div>
      <p className="text-xs text-ink-soft mt-3">Tik op een dag om menstruatie te markeren.</p>
    </div>
  )
}
