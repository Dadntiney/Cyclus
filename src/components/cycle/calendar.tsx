"use client"

import { useId, useMemo, useRef, useState, useTransition } from "react"
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns"
import { nl } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Droplet } from "lucide-react"
import { cn } from "@/lib/utils"
import { todayISO as amsterdamTodayISO, todayDate } from "@/lib/dates/amsterdam"
import { toggleMenstruationDay, setCycleLogFlow } from "@/lib/actions/cycle"
import { FLOW_OPTIONS } from "@/lib/constants"
import { runAction } from "@/lib/client/run-action"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { IconButton } from "@/components/ui/icon-button"
import { SectionHeader } from "@/components/ui/section-header"
import { ICON } from "@/lib/ui/icon"

type FlowValue = (typeof FLOW_OPTIONS)[number]["value"]

interface CalendarProps {
  menstruationDates: Set<string>
  /** Only meaningful when `trackFlowEnabled` — flow value per marked date. */
  flowByDate?: Map<string, string | null>
  /** Opt-in per profile.track_flow_intensity — see ProfileForm. */
  trackFlowEnabled?: boolean
  /** Estimated next period start (ISO) — drawn as soft, dashed days. */
  predictedStart?: string | null
  predictedLength?: number
  /** ± days of the estimate's window, shown in the legend ("Verwacht (± 6 dagen)"). */
  predictedWindowDays?: number | null
}

const WEEKDAY_LABELS = ["ma", "di", "wo", "do", "vr", "za", "zo"]

const FLOW_CHOICES = FLOW_OPTIONS.map((o) => ({ value: o.value, label: o.label }))

const FLOW_DOTS: Record<string, number> = { licht: 1, gemiddeld: 2, hevig: 3 }

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * The Cyclus calendar: its section heading, the month grid and the day
 * sheet. A tap only opens the day; nothing is saved until she confirms.
 *
 * Cell language (besluit 20): a period day is filled rozenhout with a dark
 * day number; a predicted day is a dashed outline without fill; today is a
 * dot under the number plus semibold ink — never a ring, because a ring
 * means focus or "this day is open in the sheet".
 */
export function Calendar({
  menstruationDates: initialDates,
  flowByDate: initialFlowByDate,
  trackFlowEnabled = false,
  predictedStart = null,
  predictedLength = 5,
  predictedWindowDays = null,
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

  // Local, optimistic copies of the server data. When the page refreshes
  // (a save here, or "Noteer menstruatie" in the phase status above), the
  // new server props win again.
  const [dates, setDates] = useState(initialDates)
  const [flowByDate, setFlowByDate] = useState<Map<string, string | null>>(
    () => initialFlowByDate ?? new Map(),
  )
  const [syncedDates, setSyncedDates] = useState(initialDates)
  const [syncedFlow, setSyncedFlow] = useState(initialFlowByDate)
  if (syncedDates !== initialDates) {
    setSyncedDates(initialDates)
    setDates(initialDates)
  }
  if (syncedFlow !== initialFlowByDate) {
    setSyncedFlow(initialFlowByDate)
    setFlowByDate(initialFlowByDate ?? new Map())
  }

  const [isPending, startTransition] = useTransition()
  const [pendingDate, setPendingDate] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [flowChoice, setFlowChoice] = useState<FlowValue | null>(null)
  const [error, setError] = useState<string | null>(null)

  const monthLabelId = useId()
  const flowLabelId = useId()
  const monthLabelRef = useRef<HTMLParagraphElement>(null)

  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  const leadingBlanks = (getDay(startOfMonth(month)) + 6) % 7
  const todayISO = amsterdamTodayISO()
  const monthKey = format(month, "yyyy-MM")
  const isCurrentMonth = todayISO.startsWith(monthKey)
  const inMonth = (iso: string) => iso.startsWith(monthKey)

  // Legend: only what this month actually shows.
  const legendMenstruation = Array.from(dates).some(inMonth)
  const legendToday = isCurrentMonth
  const legendPredicted = Array.from(predictedDates).some(
    (iso) => inMonth(iso) && iso > todayISO && !dates.has(iso),
  )

  function handleDayClick(day: Date) {
    const iso = format(day, "yyyy-MM-dd")
    if (iso > todayISO) return
    // Ignore taps while a day is still saving.
    if (pendingDate) return
    setError(null)
    // A bare tap never changes data: it opens the day so she confirms what
    // she means (usertest/audit: a tap while scrolling marked a period).
    const current = flowByDate.get(iso) ?? null
    setFlowChoice(FLOW_CHOICES.some((o) => o.value === current) ? (current as FlowValue) : null)
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

  function handleSetFlow(iso: string, flow: FlowValue) {
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

  const selectedMarked = selectedDate ? dates.has(selectedDate) : false

  const sheetFooter = selectedDate ? (
    <div className="flex flex-col gap-2">
      {trackFlowEnabled && (
        <Button
          className="w-full"
          disabled={!flowChoice || isPending}
          onClick={() => flowChoice && handleSetFlow(selectedDate, flowChoice)}
        >
          Opslaan
        </Button>
      )}
      {selectedMarked ? (
        <Button variant="secondary" onClick={() => handleToggle(selectedDate)} className="w-full">
          Geen menstruatie op deze dag
        </Button>
      ) : (
        !trackFlowEnabled && (
          <Button onClick={() => handleToggle(selectedDate)} className="w-full">
            <Droplet {...ICON.sm} aria-hidden />
            Markeer als menstruatiedag
          </Button>
        )
      )}
    </div>
  ) : null

  return (
    <section aria-labelledby="kalender">
      <SectionHeader
        id="kalender"
        title="Kalender"
        description={
          trackFlowEnabled
            ? "Tik op een dag om menstruatie en bloedverlies bij te werken."
            : "Tik op een dag om je menstruatie bij te werken."
        }
        action={
          isCurrentMonth ? undefined : (
            <Button
              variant="tonal"
              size="sm"
              onClick={() => {
                setMonth(startOfMonth(todayDate()))
                // The button disappears in the current month: keep focus
                // on the calendar instead of dropping it to the page.
                monthLabelRef.current?.focus()
              }}
            >
              Vandaag
            </Button>
          )
        }
      />
      <Card>
        <div className="flex items-center justify-between gap-2 mb-3">
          <IconButton
            label="Vorige maand"
            icon={ChevronLeft}
            onClick={() => setMonth((m) => subMonths(m, 1))}
          />
          <p
            ref={monthLabelRef}
            id={monthLabelId}
            tabIndex={-1}
            data-focus-target=""
            aria-live="polite"
            className="type-card-title text-ink capitalize"
          >
            {format(month, "MMMM yyyy", { locale: nl })}
          </p>
          <IconButton
            label="Volgende maand"
            icon={ChevronRight}
            onClick={() => setMonth((m) => addMonths(m, 1))}
          />
        </div>

        <div aria-hidden className="grid grid-cols-7 text-center mb-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-xs text-ink-soft font-medium py-1">
              {label}
            </div>
          ))}
        </div>

        {/* Keyed per month: a calm crossfade on month change (none under reduced motion). */}
        <div
          key={monthKey}
          role="group"
          aria-labelledby={monthLabelId}
          className="grid grid-cols-7 gap-y-1.5 motion-safe:animate-fade-in"
        >
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map((day) => {
            const iso = format(day, "yyyy-MM-dd")
            const isMenstruation = dates.has(iso)
            const flow = flowByDate.get(iso)
            const future = iso > todayISO
            const isToday = iso === todayISO
            const isPredicted = future && predictedDates.has(iso) && !isMenstruation
            const isSelected = selectedDate === iso
            const flowDots = trackFlowEnabled && isMenstruation && flow ? (FLOW_DOTS[flow] ?? 0) : 0
            const flowLabel =
              trackFlowEnabled && isMenstruation && flow
                ? FLOW_OPTIONS.find((o) => o.value === flow)?.label.toLowerCase()
                : undefined
            return (
              <button
                key={iso}
                type="button"
                // While saving, the day stays focusable (aria-disabled, taps
                // ignored in handleDayClick): the closing sheet hands focus
                // back to this very button, which a `disabled` one refuses.
                disabled={future}
                aria-disabled={pendingDate === iso || undefined}
                onClick={() => handleDayClick(day)}
                aria-label={`${format(day, "EEEE d MMMM yyyy", { locale: nl })}${
                  isMenstruation ? ", menstruatie" : ""
                }${flowLabel ? `, bloedverlies ${flowLabel}` : ""}${isToday ? ", vandaag" : ""}${
                  isPredicted ? ", menstruatie verwacht (schatting)" : future ? ", toekomst" : ""
                }`}
                aria-haspopup="dialog"
                className={cn(
                  "relative mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-full text-sm tabular-nums touch-manipulation",
                  "transition-[background-color,opacity] duration-fast ease-standard",
                  isMenstruation
                    ? "bg-phase-menstruatie text-phase-menstruatie-on font-medium"
                    : isPredicted
                      ? "border-2 border-dashed border-phase-menstruatie-strong text-ink cursor-default"
                      : future
                        ? "text-ink-soft opacity-40 cursor-not-allowed"
                        : "text-ink hover:bg-cream-soft",
                  isToday && "font-semibold",
                  isSelected && "ring-2 ring-sage-dark ring-offset-2 ring-offset-surface",
                  isPending && pendingDate === iso && "opacity-60",
                )}
              >
                {flowDots > 0 && (
                  <span aria-hidden className="absolute top-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {Array.from({ length: flowDots }).map((_, i) => (
                      <span key={i} className="h-1 w-1 rounded-full bg-phase-menstruatie-on" />
                    ))}
                  </span>
                )}
                {format(day, "d")}
                {isToday && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full",
                      isMenstruation ? "bg-phase-menstruatie-on" : "bg-ink",
                    )}
                  />
                )}
              </button>
            )
          })}
        </div>

        {(legendMenstruation || legendToday || legendPredicted) && (
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-soft">
            {legendMenstruation && (
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="h-3 w-3 rounded-full bg-phase-menstruatie" />
                Menstruatie
              </li>
            )}
            {legendToday && (
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="flex h-3 w-3 items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink" />
                </span>
                Vandaag
              </li>
            )}
            {legendPredicted && (
              <li className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-phase-menstruatie-strong"
                />
                {predictedWindowDays ? `Verwacht (± ${predictedWindowDays} dagen)` : "Verwacht (schatting)"}
              </li>
            )}
          </ul>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger mt-3">
            {error}
          </p>
        )}
      </Card>

      <BottomSheet
        open={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? capitalize(format(parseISO(selectedDate), "EEEE d MMMM", { locale: nl })) : undefined}
        footer={sheetFooter}
      >
        {selectedDate && (
          <div className="flex flex-col gap-4 pb-2">
            <p className="text-sm text-ink-soft">
              {selectedMarked
                ? "Deze dag staat genoteerd als menstruatiedag."
                : "Was je deze dag ongesteld?"}
            </p>

            {trackFlowEnabled && (
              <div>
                <p id={flowLabelId} className="text-sm font-medium text-ink mb-2">
                  Bloedverlies
                </p>
                <ChipRadioGroup
                  aria-labelledby={flowLabelId}
                  columns={4}
                  options={FLOW_CHOICES}
                  value={flowChoice}
                  onChange={setFlowChoice}
                />
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </section>
  )
}
