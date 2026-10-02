"use client"

import { useMemo, useState, useTransition } from "react"
import {
  addDays,
  addMonths,
  parseISO,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns"
import { nl } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Droplet, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { todayISO as amsterdamTodayISO, todayDate } from "@/lib/dates/amsterdam"
import { toggleMenstruationDay, setCycleLogFlow } from "@/lib/actions/cycle"
import { FLOW_OPTIONS } from "@/lib/constants"
import { runAction } from "@/lib/client/run-action"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"

interface CalendarProps {
  menstruationDates: Set<string>
  /** Only meaningful when `trackFlowEnabled` — flow value per marked date. */
  flowByDate?: Map<string, string | null>
  /** Opt-in per profile.track_flow_intensity — see ProfileForm. */
  trackFlowEnabled?: boolean
  /** Estimated next period start (ISO) — drawn as soft, dashed days. */
  predictedStart?: string | null
  predictedLength?: number
}

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"]

export function Calendar({
  menstruationDates: initialDates,
  flowByDate: initialFlowByDate,
  trackFlowEnabled = false,
  predictedStart = null,
  predictedLength = 5,
}: CalendarProps) {
  const predictedDates = useMemo(() => {
    if (!predictedStart) return new Set<string>()
    const start = parseISO(predictedStart)
    return new Set(
      Array.from({ length: Math.max(1, Math.min(10, predictedLength)) }, (_, i) =>
        format(addDays(start, i), "yyyy-MM-dd"),
      ),
    )
  }, [predictedStart, predictedLength])
  const [month, setMonth] = useState(() => startOfMonth(todayDate()))
  const [dates, setDates] = useState(initialDates)
  const [flowByDate, setFlowByDate] = useState<Map<string, string | null>>(
    initialFlowByDate ?? new Map(),
  )
  const [isPending, startTransition] = useTransition()
  const [pendingDate, setPendingDate] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  const leadingBlanks = (getDay(startOfMonth(month)) + 6) % 7
  const todayISO = amsterdamTodayISO()

  function handleDayClick(day: Date) {
    const iso = format(day, "yyyy-MM-dd")
    if (iso > todayISO) return
    // Ignore taps while a day is still saving.
    if (pendingDate) return
    setError(null)
    // A bare tap never changes data: it opens the day so she confirms what
    // she means (usertest/audit: a tap while scrolling marked a period).
    setSelectedDate(iso)
  }

  function flipLocal(iso: string, on: boolean) {
    setDates((prev) => {
      const next = new Set(prev)
      if (on) next.add(iso)
      else next.delete(iso)
      return next
    })
  }

  function handleToggle(iso: string) {
    const wasMarked = dates.has(iso)
    const previousFlow = flowByDate.get(iso) ?? null
    setSelectedDate(null)
    setPendingDate(iso)
    flipLocal(iso, !wasMarked)
    if (wasMarked) {
      setFlowByDate((prev) => {
        const next = new Map(prev)
        next.delete(iso)
        return next
      })
    }
    startTransition(async () => {
      const result = await runAction(() => toggleMenstruationDay(iso))
      setPendingDate(null)
      if (result?.error) {
        flipLocal(iso, wasMarked)
        if (wasMarked) setFlowByDate((prev) => new Map(prev).set(iso, previousFlow))
        setError(result.error)
      }
    })
  }

  function handleSetFlow(iso: string, flow: (typeof FLOW_OPTIONS)[number]["value"]) {
    setError(null)
    const wasMarked = dates.has(iso)
    const previousFlow = flowByDate.get(iso) ?? null

    setSelectedDate(null)
    setPendingDate(iso)
    flipLocal(iso, true)
    setFlowByDate((prev) => new Map(prev).set(iso, flow))
    startTransition(async () => {
      const result = await runAction(() => setCycleLogFlow(iso, flow))
      setPendingDate(null)
      if (result?.error) {
        setFlowByDate((prev) => new Map(prev).set(iso, previousFlow))
        if (!wasMarked) flipLocal(iso, false)
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
        <p className="font-display text-lg text-ink capitalize">
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
          const isAmsterdamToday = iso === todayISO
          const isPredicted = future && predictedDates.has(iso)
          return (
            <button
              key={iso}
              type="button"
              disabled={future || pendingDate === iso}
              onClick={() => handleDayClick(day)}
              aria-label={`${format(day, "d MMMM yyyy", { locale: nl })}${
                isMenstruation ? ", menstruatie" : ""
              }${isAmsterdamToday ? ", vandaag" : ""}${isPredicted ? ", menstruatie verwacht (schatting)" : future ? ", toekomst" : ""}`}
              aria-haspopup="dialog"
              className={cn(
                "relative h-11 rounded-full text-sm mx-auto w-11 flex items-center justify-center transition-colors touch-manipulation",
                isSameMonth(day, month) ? "text-ink" : "text-ink-soft/40",
                isMenstruation && "bg-phase-menstruatie text-phase-menstruatie-text font-medium",
                !isMenstruation && isAmsterdamToday && "border-2 border-sage-dark text-sage-dark font-semibold",
                !isMenstruation && !isAmsterdamToday && "hover:bg-cream-soft",
                isPredicted &&
                  "border-2 border-dashed border-phase-menstruatie bg-phase-menstruatie-soft text-phase-menstruatie-text cursor-default",
                future && !isPredicted && "opacity-30 cursor-not-allowed",
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
          <span className="h-3 w-3 rounded-full bg-phase-menstruatie inline-block" />
          Menstruatie
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-sage inline-block" />
          Vandaag
        </div>
        {predictedDates.size > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full border border-dashed border-phase-menstruatie bg-phase-menstruatie-soft inline-block" />
            Verwacht (schatting)
          </div>
        )}
      </div>
      <p className="text-xs text-ink-soft mt-3">
        {trackFlowEnabled
          ? "Tik op een dag om menstruatie en bloedverlies bij te houden."
          : "Tik op een dag om menstruatie te noteren of te wijzigen."}
      </p>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}

      <BottomSheet
        open={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(parseISO(selectedDate), "EEEE d MMMM", { locale: nl }) : undefined}
      >
        {selectedDate && (
          <div className="flex flex-col gap-4 pt-1 pb-2">
            <p className="text-sm text-ink-soft">
              {dates.has(selectedDate)
                ? "Deze dag staat genoteerd als menstruatiedag."
                : "Was je deze dag ongesteld?"}
            </p>

            {trackFlowEnabled && (
              <div>
                <p className="text-sm font-medium text-ink mb-2">Bloedverlies</p>
                <div className="flex flex-wrap gap-2">
                  {FLOW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSetFlow(selectedDate, opt.value)}
                      aria-pressed={flowByDate.get(selectedDate) === opt.value}
                      className={cn(
                        "rounded-full border px-3.5 py-2.5 min-h-11 text-sm font-medium touch-manipulation transition-colors",
                        flowByDate.get(selectedDate) === opt.value
                          ? "bg-sage-fill text-white border-sage-dark"
                          : "bg-surface text-ink border-line hover:border-ink/30",
                      )}
                    >
                      <span className="mr-1 inline-flex items-center" aria-hidden>
                        {opt.intensity === 0 ? (
                          <Circle className="h-3 w-3" strokeWidth={1.75} />
                        ) : (
                          Array.from({ length: opt.intensity }).map((_, i) => (
                            <Droplet key={i} className="h-3 w-3" strokeWidth={1.75} fill="currentColor" />
                          ))
                        )}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {dates.has(selectedDate) ? (
              <Button variant="secondary" onClick={() => handleToggle(selectedDate)} className="w-full">
                Geen menstruatie op deze dag
              </Button>
            ) : (
              !trackFlowEnabled && (
                <Button onClick={() => handleToggle(selectedDate)} className="w-full">
                  <Droplet className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  Markeer als menstruatiedag
                </Button>
              )
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
