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
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleMenstruationDay, setCycleLogFlow } from "@/lib/actions/cycle"
import { FLOW_OPTIONS } from "@/lib/constants"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  menstruationDates: Set<string>
  /** Only meaningful when `trackFlowEnabled` — flow value per marked date. */
  flowByDate?: Map<string, string | null>
  /** Opt-in per profile.track_flow_intensity — see ProfileForm. */
  trackFlowEnabled?: boolean
}

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"]

export function Calendar({
  menstruationDates: initialDates,
  flowByDate: initialFlowByDate,
  trackFlowEnabled = false,
}: CalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [dates, setDates] = useState(initialDates)
  const [flowByDate, setFlowByDate] = useState<Map<string, string | null>>(
    initialFlowByDate ?? new Map(),
  )
  const [isPending, startTransition] = useTransition()
  const [pendingDate, setPendingDate] = useState<string | null>(null)
  const [flowPickerDate, setFlowPickerDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  const leadingBlanks = (getDay(startOfMonth(month)) + 6) % 7
  const todayISO = format(new Date(), "yyyy-MM-dd")

  function handleDayClick(day: Date) {
    const iso = format(day, "yyyy-MM-dd")
    if (iso > todayISO) return
    setError(null)

    // With flow-tracking on, tapping a day opens the intensity picker
    // instead of instantly unmarking it — marking + choosing an intensity
    // are two small steps instead of one, but nothing gets lost silently.
    if (trackFlowEnabled) {
      if (!dates.has(iso)) {
        setDates((prev) => new Set(prev).add(iso))
        startTransition(async () => {
          const result = await setCycleLogFlow(iso, null)
          if (result?.error) {
            setDates((prev) => {
              const next = new Set(prev)
              next.delete(iso)
              return next
            })
            setError(result.error)
          }
        })
      }
      setFlowPickerDate(iso)
      return
    }

    setPendingDate(iso)
    setDates((prev) => {
      const next = new Set(prev)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
    startTransition(async () => {
      const result = await toggleMenstruationDay(iso)
      setPendingDate(null)
      if (result?.error) {
        // Roll back: flip the day back to how it was before the tap.
        setDates((prev) => {
          const next = new Set(prev)
          if (next.has(iso)) next.delete(iso)
          else next.add(iso)
          return next
        })
        setError(result.error)
      }
    })
  }

  function handleSetFlow(iso: string, flow: (typeof FLOW_OPTIONS)[number]["value"]) {
    setError(null)
    const previous = flowByDate.get(iso) ?? null
    setFlowByDate((prev) => new Map(prev).set(iso, flow))
    startTransition(async () => {
      const result = await setCycleLogFlow(iso, flow)
      if (result?.error) {
        setFlowByDate((prev) => new Map(prev).set(iso, previous))
        setError(result.error)
      }
    })
  }

  function handleRemoveDay(iso: string) {
    setError(null)
    const previousFlow = flowByDate.get(iso) ?? null
    setDates((prev) => {
      const next = new Set(prev)
      next.delete(iso)
      return next
    })
    setFlowByDate((prev) => {
      const next = new Map(prev)
      next.delete(iso)
      return next
    })
    setFlowPickerDate(null)
    startTransition(async () => {
      const result = await toggleMenstruationDay(iso)
      if (result?.error) {
        // Roll back: this day was still a menstruation day.
        setDates((prev) => new Set(prev).add(iso))
        setFlowByDate((prev) => new Map(prev).set(iso, previousFlow))
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          className="h-11 w-11 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
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
          className="h-11 w-11 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
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
          const flow = flowByDate.get(iso)
          const future = iso > todayISO
          return (
            <button
              key={iso}
              type="button"
              disabled={future}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative h-11 rounded-full text-sm mx-auto w-11 flex items-center justify-center transition-colors touch-manipulation",
                isSameMonth(day, month) ? "text-ink" : "text-ink-soft/40",
                isMenstruation && "bg-peach text-ink font-medium",
                !isMenstruation && isToday(day) && "border border-sage text-sage-dark font-medium",
                !isMenstruation && !isToday(day) && "hover:bg-cream-soft",
                future && "opacity-30 cursor-not-allowed",
                isPending && pendingDate === iso && "opacity-60",
              )}
            >
              {format(day, "d")}
              {isMenstruation && trackFlowEnabled && flow && flow !== "geen" && (
                <span className="absolute bottom-1 flex items-center gap-0.5" aria-hidden>
                  {Array.from({ length: flow === "licht" ? 1 : flow === "gemiddeld" ? 2 : 3 }).map((_, i) => (
                    <span key={i} className="h-1 w-1 rounded-full bg-danger" />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-ink-soft flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-peach inline-block" />
          Menstruatie
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-sage inline-block" />
          Vandaag
        </div>
      </div>
      <p className="text-xs text-ink-soft mt-3">
        {trackFlowEnabled
          ? "Tik op een dag om menstruatie en bloedverlies bij te houden."
          : "Tik op een dag om menstruatie te markeren."}
      </p>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}

      {trackFlowEnabled && flowPickerDate && (
        <div className="mt-4 rounded-2xl bg-cream-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-ink">
                {format(new Date(flowPickerDate), "d MMMM", { locale: nl })}
              </p>
              <p className="text-xs text-ink-soft mt-0.5">Menstruatiedag</p>
            </div>
            <button
              type="button"
              onClick={() => setFlowPickerDate(null)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-ink-soft hover:bg-white touch-manipulation"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleRemoveDay(flowPickerDate)}
            className="w-full mb-4 text-danger border-danger/30 hover:bg-danger/5"
          >
            Geen menstruatiedag — dag verwijderen
          </Button>

          <p className="text-xs font-medium text-ink mb-2">Bloedverlies deze dag</p>
          <div className="flex flex-wrap gap-2">
            {FLOW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSetFlow(flowPickerDate, opt.value)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-medium touch-manipulation transition-colors",
                  flowByDate.get(flowPickerDate) === opt.value
                    ? "bg-sage-dark text-white border-sage-dark"
                    : "bg-white text-ink border-line hover:border-sage/60",
                )}
              >
                <span className="mr-1" aria-hidden>
                  {opt.emoji}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
