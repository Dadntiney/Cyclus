"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react"
import { RatingScale } from "@/components/ui/rating-scale"
import { Chip } from "@/components/ui/chip"
import { Input, Textarea, Label } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  SYMPTOM_OPTIONS,
  MENTAL_SYMPTOM_OPTIONS,
  NEED_OPTIONS,
  symptomLabel,
} from "@/lib/constants"
import { saveCheckin, setTodayNeed } from "@/lib/actions/checkin"
import { parseSymptomDetails } from "@/lib/symptom-details"
import type { CheckinInput, SymptomDetail } from "@/lib/validations/checkin"
import type { Tables } from "@/types/database"
import { cn } from "@/lib/utils"

type Checkin = Tables<"daily_checkins">

type FormState = {
  energy: number | null
  mood: number | null
  sleep: number | null
  stress: number | null
  symptoms: string[]
  symptomDetails: Record<string, SymptomDetail>
  notes: string
  need: CheckinInput["need"]
}

const DEBOUNCE_MS = 700
const SAVED_FLASH_MS = 2000

function checkinHasContent(checkin: Checkin | null): boolean {
  if (!checkin) return false
  return Boolean(
    checkin.energy ||
      checkin.mood ||
      checkin.sleep ||
      checkin.stress ||
      (checkin.symptoms?.length ?? 0) > 0 ||
      (checkin.notes?.trim()?.length ?? 0) > 0 ||
      checkin.need,
  )
}

function stateFromCheckin(initial: Checkin | null): FormState {
  return {
    energy: initial?.energy ?? null,
    mood: initial?.mood ?? null,
    sleep: initial?.sleep ?? null,
    stress: initial?.stress ?? null,
    symptoms: initial?.symptoms ?? [],
    symptomDetails: parseSymptomDetails(initial?.symptom_details),
    notes: initial?.notes ?? "",
    need: (initial?.need as CheckinInput["need"]) ?? null,
  }
}

/**
 * Light daily check-in for Vandaag.
 *
 * Cold open: energy + need only. Details stay behind “Meer toevoegen”.
 * Autosave like Profiel — no Opslaan button.
 */
export function CheckinForm({
  initial,
  mentalWellbeingEnabled = false,
  sleepTrackingEnabled = false,
  customSymptoms = [],
}: {
  initial: Checkin | null
  mentalWellbeingEnabled?: boolean
  sleepTrackingEnabled?: boolean
  customSymptoms?: string[]
}) {
  const router = useRouter()
  const [, startNeedTransition] = useTransition()

  const [extraCustoms, setExtraCustoms] = useState<string[]>([])
  const allCustoms = useMemo(
    () => Array.from(new Set([...customSymptoms, ...extraCustoms])),
    [customSymptoms, extraCustoms],
  )

  const symptomOptions = useMemo(() => {
    const builtIn = mentalWellbeingEnabled
      ? [...SYMPTOM_OPTIONS, ...MENTAL_SYMPTOM_OPTIONS]
      : [...SYMPTOM_OPTIONS]
    const base = builtIn.filter((s) => s !== "Anders" && s !== "Geen klachten")
    const customs = allCustoms.filter((s) => !base.includes(s as (typeof base)[number]))
    return [...base, ...customs, "Anders", "Geen klachten"]
  }, [mentalWellbeingEnabled, allCustoms])

  const [state, setState] = useState<FormState>(() => stateFromCheckin(initial))
  const stateRef = useRef(state)
  stateRef.current = state

  // Filled → compact summary. Empty → light editor (energy + need), details closed.
  const [editing, setEditing] = useState(!checkinHasContent(initial))
  const [showDetails, setShowDetails] = useState(false)
  const [customDraft, setCustomDraft] = useState("")

  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)
  const dirtyRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const hasAnyInput = Boolean(
    state.energy ||
      state.mood ||
      state.sleep ||
      state.stress ||
      state.symptoms.length ||
      state.notes.trim() ||
      state.need,
  )

  const summaryChips = useMemo(() => {
    const chips: string[] = []
    if (state.energy != null) chips.push(`Energie ${state.energy}/5`)
    if (state.need) {
      const label = NEED_OPTIONS.find((o) => o.value === state.need)?.label
      if (label) chips.push(label)
    }
    if (state.mood != null) chips.push(`Stemming ${state.mood}/5`)
    if (!sleepTrackingEnabled && state.sleep != null) chips.push(`Slaap ${state.sleep}/5`)
    if (state.stress != null) chips.push(`Stress ${state.stress}/5`)
    for (const s of state.symptoms) {
      if (s === "Anders") continue
      chips.push(symptomLabel(s))
    }
    if (state.notes.trim()) chips.push("Notitie")
    return chips
  }, [state, sleepTrackingEnabled])

  async function performSave() {
    if (savingRef.current) {
      dirtyRef.current = true
      return
    }
    savingRef.current = true
    dirtyRef.current = false
    if (mountedRef.current) setStatus("saving")

    const snapshot = stateRef.current
    const newCustomSymptoms = snapshot.symptoms.filter(
      (s) =>
        !SYMPTOM_OPTIONS.includes(s as (typeof SYMPTOM_OPTIONS)[number]) &&
        !MENTAL_SYMPTOM_OPTIONS.includes(s as (typeof MENTAL_SYMPTOM_OPTIONS)[number]) &&
        s !== "Anders" &&
        s !== "Geen klachten",
    )

    let result: Awaited<ReturnType<typeof saveCheckin>> | undefined
    try {
      result = await saveCheckin({
        energy: snapshot.energy,
        mood: snapshot.mood,
        // Sleep scale is hidden when SleepCard is on; keep any prior value.
        sleep: snapshot.sleep,
        stress: snapshot.stress,
        symptoms: snapshot.symptoms,
        symptomDetails: snapshot.symptomDetails,
        notes: snapshot.notes,
        need: snapshot.need,
        newCustomSymptoms,
      })
    } catch {
      result = { error: "Opslaan is niet gelukt. Controleer je verbinding." }
    }

    savingRef.current = false

    if (result?.error) {
      if (mountedRef.current) {
        setErrorMsg(result.error)
        setStatus("error")
      }
      return
    }

    if (mountedRef.current) {
      setErrorMsg(null)
      setStatus("saved")
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setStatus((current) => (current === "saved" ? "idle" : current))
      }, SAVED_FLASH_MS)
    }

    if (dirtyRef.current) {
      dirtyRef.current = false
      void performSave()
    }
  }

  function scheduleSave(immediate: boolean) {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (immediate) {
      void performSave()
    } else {
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null
        void performSave()
      }, DEBOUNCE_MS)
    }
  }

  function applyUpdate(updater: (prev: FormState) => FormState, mode: "immediate" | "debounced" = "immediate") {
    let changed = true
    setState((prev) => {
      const next = updater(prev)
      changed = JSON.stringify(next) !== JSON.stringify(prev)
      stateRef.current = next
      return next
    })
    if (changed) scheduleSave(mode === "immediate")
  }

  function selectNeed(value: string) {
    const next = state.need === value ? null : (value as CheckinInput["need"])
    setState((prev) => {
      const updated = { ...prev, need: next }
      stateRef.current = updated
      return updated
    })
    // Lightweight need write + refresh so today’s plan can reshape.
    startNeedTransition(async () => {
      const result = await setTodayNeed(next)
      if (result?.error) {
        setErrorMsg(result.error)
        setStatus("error")
        return
      }
      router.refresh()
    })
  }

  function toggleSymptom(value: string) {
    applyUpdate((prev) => {
      if (value === "Geen klachten") {
        return {
          ...prev,
          symptoms: prev.symptoms.includes("Geen klachten") ? [] : ["Geen klachten"],
          symptomDetails: {},
        }
      }
      const withoutNone = prev.symptoms.filter((s) => s !== "Geen klachten")
      if (withoutNone.includes(value)) {
        const nextDetails = { ...prev.symptomDetails }
        delete nextDetails[value]
        return {
          ...prev,
          symptoms: withoutNone.filter((s) => s !== value),
          symptomDetails: nextDetails,
        }
      }
      return { ...prev, symptoms: [...withoutNone, value] }
    })
  }

  function addCustomSymptom() {
    const value = customDraft.trim().replace(/\s+/g, " ")
    if (!value || value.length > 40) return
    if (value === "Anders" || value === "Geen klachten") return
    setExtraCustoms((prev) => (prev.includes(value) ? prev : [...prev, value]))
    applyUpdate((prev) => {
      const withoutNone = prev.symptoms.filter((s) => s !== "Geen klachten")
      return {
        ...prev,
        symptoms: withoutNone.includes(value) ? withoutNone : [...withoutNone, value],
      }
    })
    setCustomDraft("")
  }

  function finishEditing() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
      void performSave()
    }
    setEditing(false)
    setShowDetails(false)
  }

  function StatusHint({ className }: { className?: string }) {
    if (status === "idle") return null
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium shrink-0 animate-pop-in",
          status === "error" ? "text-danger" : "text-sage-dark",
          className,
        )}
      >
        {status === "saving" && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} />
            Opslaan…
          </>
        )}
        {status === "saved" && (
          <>
            <Check className="h-3 w-3" strokeWidth={3} />
            Opgeslagen
          </>
        )}
        {status === "error" && (errorMsg ?? "Niet opgeslagen")}
      </span>
    )
  }

  // ── Compact summary ────────────────────────────────────────────────────
  if (hasAnyInput && !editing) {
    const visible = summaryChips.slice(0, 4)
    const overflow = summaryChips.length - visible.length

    return (
      <section aria-labelledby="checkin-heading">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h2 id="checkin-heading" className="font-display text-base text-ink leading-tight">
                Hoe voel je je?
              </h2>
              <StatusHint />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visible.map((chip) => (
                <span key={chip} className="text-xs text-ink bg-cream-soft rounded-full px-2.5 py-1">
                  {chip}
                </span>
              ))}
              {overflow > 0 && (
                <span className="text-xs text-ink-soft px-1 py-1">+{overflow}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowDetails(true)
              setEditing(true)
            }}
            className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-sage-dark min-h-11 px-1 touch-manipulation rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
            aria-expanded={false}
          >
            Wijzigen
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </section>
    )
  }

  // ── Light editor — no card chrome; belongs to the page, not a widget. ─
  return (
    <section aria-labelledby="checkin-heading">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 id="checkin-heading" className="font-display text-lg text-ink">
            Hoe voel je je?
          </h2>
          <StatusHint />
        </div>
        {hasAnyInput && (
          <button
            type="button"
            onClick={finishEditing}
            className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-ink-soft min-h-11 px-1 touch-manipulation"
            aria-expanded={true}
          >
            Klaar
            <ChevronUp className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
      <p className="text-ink-soft text-sm mb-3">Wordt vanzelf bewaard.</p>

      <div className="flex flex-col gap-4">
        <RatingScale
          label="Energie"
          value={state.energy}
          onChange={(value) => applyUpdate((prev) => ({ ...prev, energy: value }))}
          lowLabel="Laag"
          highLabel="Hoog"
        />

        <div>
          <p className="text-sm font-medium text-ink mb-2">Waar heb je behoefte aan?</p>
          <div className="flex flex-wrap gap-2">
            {NEED_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                selected={state.need === opt.value}
                onClick={() => selectNeed(opt.value)}
              >
                <opt.icon className="h-4 w-4 mr-1 inline" strokeWidth={1.75} aria-hidden />
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        {showDetails ? (
          <>
            <RatingScale
              label="Stemming"
              value={state.mood}
              onChange={(value) => applyUpdate((prev) => ({ ...prev, mood: value }))}
              lowLabel="Somber"
              highLabel="Blij"
            />
            {!sleepTrackingEnabled && (
              <RatingScale
                label="Slaap"
                value={state.sleep}
                onChange={(value) => applyUpdate((prev) => ({ ...prev, sleep: value }))}
                lowLabel="Slecht"
                highLabel="Goed"
              />
            )}
            <RatingScale
              label="Stress"
              value={state.stress}
              onChange={(value) => applyUpdate((prev) => ({ ...prev, stress: value }))}
              lowLabel="Rustig"
              highLabel="Gespannen"
            />

            <div>
              <p className="text-sm font-medium text-ink mb-2">Klachten</p>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map((symptom) => (
                  <Chip
                    key={symptom}
                    selected={state.symptoms.includes(symptom)}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptomLabel(symptom)}
                  </Chip>
                ))}
              </div>

              {state.symptoms.includes("Anders") && (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    placeholder="Eigen klacht toevoegen"
                    maxLength={40}
                    aria-label="Eigen klacht"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addCustomSymptom}
                    disabled={!customDraft.trim()}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Toevoegen
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notities (optioneel)</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Wil je verder nog iets kwijt over vandaag?"
                value={state.notes}
                onChange={(e) =>
                  applyUpdate((prev) => ({ ...prev, notes: e.target.value }), "debounced")
                }
              />
            </div>

            {hasAnyInput && (
              <button
                type="button"
                onClick={finishEditing}
                className="w-full inline-flex items-center justify-center gap-1.5 min-h-11 rounded-xl bg-surface text-sm font-medium text-sage-dark touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
              >
                Klaar
                <ChevronUp className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 min-h-11 py-1 touch-manipulation"
          >
            Meer toevoegen
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </button>
        )}

        {status === "error" && (
          <p className="text-sm text-danger">
            {errorMsg}{" "}
            <button type="button" onClick={() => void performSave()} className="underline font-medium">
              Opnieuw
            </button>
          </p>
        )}
      </div>
    </section>
  )
}
