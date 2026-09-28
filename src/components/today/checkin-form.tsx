"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Check, ChevronDown, ChevronUp, Pin, Plus } from "lucide-react"
import { RatingScale } from "@/components/ui/rating-scale"
import { Chip } from "@/components/ui/chip"
import { Input, Textarea, Label } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  SYMPTOM_OPTIONS,
  MENTAL_SYMPTOM_OPTIONS,
  SYMPTOMS_WITH_SEVERITY,
  SYMPTOMS_WITH_COUNT,
  SEVERITY_OPTIONS,
  symptomLabel,
} from "@/lib/constants"
import { saveCheckin, updatePreferredSymptoms } from "@/lib/actions/checkin"
import { parseSymptomDetails } from "@/lib/symptom-details"
import type { CheckinInput, SymptomDetail } from "@/lib/validations/checkin"
import type { Tables } from "@/types/database"

type Checkin = Tables<"daily_checkins">

function checkinHasContent(checkin: Checkin | null): boolean {
  if (!checkin) return false
  return Boolean(
    checkin.energy ||
      checkin.mood ||
      checkin.sleep ||
      checkin.stress ||
      (checkin.symptoms?.length ?? 0) > 0 ||
      (checkin.notes?.trim()?.length ?? 0) > 0 ||
      Object.keys(parseSymptomDetails(checkin.symptom_details)).length > 0,
  )
}

export function CheckinForm({
  initial,
  mentalWellbeingEnabled = false,
  sleepTrackingEnabled = false,
  customSymptoms = [],
  preferredSymptoms = [],
}: {
  initial: Checkin | null
  mentalWellbeingEnabled?: boolean
  sleepTrackingEnabled?: boolean
  customSymptoms?: string[]
  preferredSymptoms?: string[]
}) {
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
    const preferred = preferredSymptoms.filter(
      (s) => base.includes(s as (typeof base)[number]) || allCustoms.includes(s),
    )
    const rest = [
      ...base.filter((s) => !preferred.includes(s)),
      ...allCustoms.filter((s) => !preferred.includes(s)),
    ]
    return [...preferred, ...rest, "Anders", "Geen klachten"]
  }, [mentalWellbeingEnabled, allCustoms, preferredSymptoms])

  const [energy, setEnergy] = useState<number | null>(initial?.energy ?? null)
  const [mood, setMood] = useState<number | null>(initial?.mood ?? null)
  const [sleep, setSleep] = useState<number | null>(initial?.sleep ?? null)
  const [stress, setStress] = useState<number | null>(initial?.stress ?? null)
  const [symptoms, setSymptoms] = useState<string[]>(initial?.symptoms ?? [])
  const [symptomDetails, setSymptomDetails] = useState<Record<string, SymptomDetail>>(() =>
    parseSymptomDetails(initial?.symptom_details),
  )
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [customDraft, setCustomDraft] = useState("")
  const [pinned, setPinned] = useState<string[]>(preferredSymptoms)

  // Compact summary when she already checked in; editor otherwise.
  const [editing, setEditing] = useState(!checkinHasContent(initial))
  // Within the editor: show mood/symptoms/notes (true when opening via Aanpassen).
  const [showDetails, setShowDetails] = useState(checkinHasContent(initial))

  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const hasAnyInput = Boolean(
    energy ||
      mood ||
      sleep ||
      stress ||
      symptoms.length ||
      notes.trim() ||
      Object.keys(symptomDetails).length,
  )

  const summaryChips = useMemo(() => {
    const chips: string[] = []
    if (energy != null) chips.push(`Energie ${energy}/5`)
    if (mood != null) chips.push(`Stemming ${mood}/5`)
    if (sleep != null) chips.push(`Slaap ${sleep}/5`)
    if (stress != null) chips.push(`Stress ${stress}/5`)
    for (const s of symptoms) {
      if (s === "Anders") continue
      chips.push(symptomLabel(s))
    }
    if (notes.trim()) chips.push("Notitie")
    return chips
  }, [energy, mood, sleep, stress, symptoms, notes])

  function openEditor({ withDetails }: { withDetails: boolean }) {
    setShowDetails(withDetails)
    setEditing(true)
  }

  function toggleSymptom(value: string) {
    setSymptoms((prev) => {
      if (value === "Geen klachten") {
        setSymptomDetails({})
        return prev.includes("Geen klachten") ? [] : ["Geen klachten"]
      }
      const withoutNone = prev.filter((s) => s !== "Geen klachten")
      if (withoutNone.includes(value)) {
        setSymptomDetails((details) => {
          const next = { ...details }
          delete next[value]
          return next
        })
        return withoutNone.filter((s) => s !== value)
      }
      return [...withoutNone, value]
    })
  }

  function setDetail(symptom: string, patch: Partial<SymptomDetail>) {
    setSymptomDetails((prev) => {
      const current = { ...(prev[symptom] ?? {}), ...patch }
      if (!current.severity) delete current.severity
      if (!current.count) delete current.count
      if (!current.severity && !current.count) {
        const next = { ...prev }
        delete next[symptom]
        return next
      }
      return { ...prev, [symptom]: current }
    })
  }

  function addCustomSymptom() {
    const value = customDraft.trim().replace(/\s+/g, " ")
    if (!value || value.length > 40) return
    if (value === "Anders" || value === "Geen klachten") return
    setExtraCustoms((prev) => (prev.includes(value) ? prev : [...prev, value]))
    setSymptoms((prev) => {
      const withoutNone = prev.filter((s) => s !== "Geen klachten")
      return withoutNone.includes(value) ? withoutNone : [...withoutNone, value]
    })
    setCustomDraft("")
  }

  function togglePin(symptom: string) {
    if (symptom === "Anders" || symptom === "Geen klachten") return
    const next = pinned.includes(symptom)
      ? pinned.filter((s) => s !== symptom)
      : [...pinned, symptom].slice(0, 12)
    setPinned(next)
    startTransition(async () => {
      await updatePreferredSymptoms(next)
    })
  }

  function handleSave() {
    setStatus("idle")
    setErrorMsg(null)
    startTransition(async () => {
      const newCustomSymptoms = symptoms.filter(
        (s) =>
          !SYMPTOM_OPTIONS.includes(s as (typeof SYMPTOM_OPTIONS)[number]) &&
          !MENTAL_SYMPTOM_OPTIONS.includes(s as (typeof MENTAL_SYMPTOM_OPTIONS)[number]) &&
          s !== "Anders" &&
          s !== "Geen klachten",
      )
      const result = await saveCheckin({
        energy,
        mood,
        sleep,
        stress,
        symptoms,
        symptomDetails,
        notes,
        need: (initial?.need ?? null) as CheckinInput["need"],
        newCustomSymptoms,
      })
      if (result?.error) {
        setStatus("error")
        setErrorMsg(result.error)
      } else {
        setStatus("saved")
        setEditing(false)
        setShowDetails(false)
      }
    })
  }

  useEffect(() => {
    if (status !== "saved") return
    const timer = setTimeout(() => setStatus("idle"), 2500)
    return () => clearTimeout(timer)
  }, [status])

  const detailSymptoms = symptoms.filter(
    (s) =>
      s !== "Geen klachten" &&
      s !== "Anders" &&
      (SYMPTOMS_WITH_SEVERITY.has(s) || SYMPTOMS_WITH_COUNT.has(s) || allCustoms.includes(s)),
  )

  // ── Compact summary after check-in ─────────────────────────────────────
  if (hasAnyInput && !editing) {
    const visible = summaryChips.slice(0, 5)
    const overflow = summaryChips.length - visible.length

    return (
      <div className="rounded-2xl border border-line/70 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-display text-base text-ink leading-tight">Hoe voel je je vandaag?</h3>
              {status === "saved" && (
                <span className="animate-pop-in inline-flex items-center gap-1 text-xs font-medium text-sage-dark shrink-0">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  Opgeslagen
                </span>
              )}
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
            onClick={() => openEditor({ withDetails: true })}
            className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-sage-dark min-h-11 px-1 touch-manipulation rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
            aria-expanded={false}
          >
            Aanpassen
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    )
  }

  // ── Editor ─────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-line/70 p-4">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="font-display text-lg text-ink">Hoe voel je je vandaag?</h3>
        {hasAnyInput && (
          <button
            type="button"
            onClick={() => {
              setEditing(false)
              setShowDetails(false)
            }}
            className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-ink-soft min-h-11 px-1 touch-manipulation"
            aria-expanded={true}
          >
            Inklappen
            <ChevronUp className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
      <p className="text-ink-soft text-sm mb-3">Helemaal optioneel — vul in wat je wilt bijhouden.</p>

      <div className="flex flex-col gap-3.5">
        <RatingScale label="Energie" value={energy} onChange={setEnergy} lowLabel="Laag" highLabel="Hoog" />

        {showDetails ? (
          <>
            <RatingScale label="Stemming" value={mood} onChange={setMood} lowLabel="Somber" highLabel="Blij" />
            <div>
              <RatingScale label="Slaap" value={sleep} onChange={setSleep} lowLabel="Slecht" highLabel="Goed" />
              {sleepTrackingEnabled && (
                <p className="text-xs text-ink-soft mt-1.5 px-1">
                  Je algemene gevoel — voor je exacte slaapduur en hoe je wakker werd, gebruik je de
                  Slaap-kaart verderop op deze pagina.
                </p>
              )}
            </div>
            <RatingScale label="Stress" value={stress} onChange={setStress} lowLabel="Rustig" highLabel="Gespannen" />

            <div>
              <p className="text-sm font-medium text-ink mb-2">Klachten</p>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map((symptom) => (
                  <div key={symptom} className="relative">
                    <Chip selected={symptoms.includes(symptom)} onClick={() => toggleSymptom(symptom)}>
                      {symptomLabel(symptom)}
                      {pinned.includes(symptom) && symptom !== "Anders" && symptom !== "Geen klachten" ? (
                        <Pin className="inline h-3 w-3 ml-1 opacity-70" strokeWidth={2} />
                      ) : null}
                    </Chip>
                  </div>
                ))}
              </div>

              {symptoms.includes("Anders") && (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    placeholder="Eigen klacht toevoegen"
                    maxLength={40}
                    aria-label="Eigen klacht"
                  />
                  <Button type="button" variant="secondary" onClick={addCustomSymptom} disabled={!customDraft.trim()}>
                    <Plus className="h-4 w-4" strokeWidth={2} />
                    Toevoegen
                  </Button>
                </div>
              )}

              {detailSymptoms.length > 0 && (
                <div className="mt-3 flex flex-col gap-3 rounded-xl bg-cream-soft/80 px-3 py-3">
                  <p className="text-xs text-ink-soft">Optioneel: intensiteit of aantal voor vandaag</p>
                  {detailSymptoms.map((symptom) => (
                    <div key={symptom} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-ink">{symptomLabel(symptom)}</p>
                        <button
                          type="button"
                          onClick={() => togglePin(symptom)}
                          className="text-xs text-sage-dark inline-flex items-center gap-1 touch-manipulation"
                        >
                          <Pin className="h-3 w-3" strokeWidth={2} />
                          {pinned.includes(symptom) ? "Vastgezet" : "Vastzetten"}
                        </button>
                      </div>
                      {(SYMPTOMS_WITH_SEVERITY.has(symptom) || allCustoms.includes(symptom)) && (
                        <div className="flex flex-wrap gap-1.5">
                          {SEVERITY_OPTIONS.map((opt) => (
                            <Chip
                              key={opt.value}
                              selected={symptomDetails[symptom]?.severity === opt.value}
                              onClick={() =>
                                setDetail(symptom, {
                                  severity:
                                    symptomDetails[symptom]?.severity === opt.value ? undefined : opt.value,
                                })
                              }
                            >
                              {opt.label}
                            </Chip>
                          ))}
                        </div>
                      )}
                      {SYMPTOMS_WITH_COUNT.has(symptom) && (
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`count-${symptom}`} className="text-xs text-ink-soft shrink-0">
                            Aantal vandaag
                          </Label>
                          <Input
                            id={`count-${symptom}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={30}
                            className="w-20"
                            value={symptomDetails[symptom]?.count ?? ""}
                            onChange={(e) => {
                              const n = Number(e.target.value)
                              setDetail(symptom, {
                                count: Number.isFinite(n) && n >= 1 ? Math.min(30, Math.round(n)) : undefined,
                              })
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Notities (optioneel)</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Wil je verder nog iets kwijt over vandaag?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowDetails(true)}
            className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 min-h-11 py-1 touch-manipulation"
          >
            Meer over vandaag toevoegen
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </button>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Bezig met opslaan..." : "Check-in opslaan"}
          </Button>
          {status === "error" && <span className="text-sm text-danger">{errorMsg}</span>}
        </div>
      </div>
    </div>
  )
}
