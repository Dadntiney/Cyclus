"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronDown, Loader2, Plus } from "lucide-react"
import { RatingScale } from "@/components/ui/rating-scale"
import { Chip } from "@/components/ui/chip"
import { Card } from "@/components/ui/card"
import { Collapse, Disclosure } from "@/components/ui/disclosure"
import { Input, Textarea, Label } from "@/components/ui/input"
import { Button, textActionClass } from "@/components/ui/button"
import { StickyActionBar } from "@/components/ui/sticky-action-bar"
import {
  SYMPTOM_OPTIONS,
  MENTAL_SYMPTOM_OPTIONS,
  NEED_OPTIONS,
  symptomLabel,
} from "@/lib/constants"
import { saveCheckin } from "@/lib/actions/checkin"
import { parseSymptomDetails } from "@/lib/symptom-details"
import type { CheckinInput, SymptomDetail } from "@/lib/validations/checkin"
import type { Tables } from "@/types/database"
import { triggerHaptic } from "@/lib/platform"
import { prefersReducedMotion } from "@/lib/ui/focus"
import { CHECK_ICON, ICON, iconProps } from "@/lib/ui/icon"
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
  needs: NonNullable<CheckinInput["needs"]>
}

type SaveStatus = "idle" | "saving" | "saved" | "error"

const DEBOUNCE_MS = 700
const SAVED_FLASH_MS = 2000
/** Only announce "Bewaard" once she paused (besluit 24: never every "Opslaan…"). */
const ANNOUNCE_SAVED_MS = 1000
/** How long the inline "Dank je" stays after Klaar (ontwerpvisie §6.2). */
const THANKS_MS = 2400
const THANKS_TEXT = "Dank je, je dag is hierop afgestemd."

/**
 * Save state in a fixed-width slot next to the title, so it never inserts
 * a line (no layout shift). Visual only: the card's own status region
 * announces "Bewaard" and errors use role=alert.
 */
function SaveStatusSlot({ status }: { status: SaveStatus }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex min-w-20 shrink-0 items-center justify-end gap-1 text-xs font-medium",
        status === "error" ? "text-danger" : "text-sage-dark",
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 {...iconProps("sm", "motion-safe:animate-spin")} />
          Opslaan…
        </>
      )}
      {status === "saved" && (
        <>
          Bewaard
          <Check {...CHECK_ICON} />
        </>
      )}
      {status === "error" && "Niet opgeslagen"}
    </span>
  )
}

function checkinHasContent(checkin: Checkin | null): boolean {
  if (!checkin) return false
  return Boolean(
    checkin.energy ||
      checkin.mood ||
      checkin.sleep ||
      checkin.stress ||
      (checkin.symptoms?.length ?? 0) > 0 ||
      (checkin.notes?.trim()?.length ?? 0) > 0 ||
      (checkin.needs?.length ?? 0) > 0,
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
    needs: (initial?.needs as FormState["needs"]) ?? [],
  }
}

const QUICK_SYMPTOMS = [
  "Vermoeidheid",
  "Hoofdpijn",
  "Opvliegers",
  "Slecht slapen",
  "Krampen",
  "Stemmingswisselingen",
]

const SYMPTOM_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Overgang",
    items: [
      "Opvliegers",
      "Nachtelijk zweten",
      "Vaginale droogte",
      "Libido lager",
      "Gewrichtspijn",
      "Urinewegklachten",
    ],
  },
  {
    label: "Lichaam",
    items: [
      "Vermoeidheid",
      "Slecht slapen",
      "Hoofdpijn",
      "Nekpijn",
      "Rugpijn",
      "Buikpijn",
      "Krampen",
      "Gevoelige borsten",
      "Misselijkheid",
      "Bloating",
      "Cravings",
      "Eetlust anders",
    ],
  },
  {
    label: "Hoofd en gevoel",
    items: [
      "Stemmingswisselingen",
      "Emotioneel",
      "Onrustig gevoel",
      "Brain fog",
      "Gespannen",
      "Angstig",
      "Prikkelbaar",
      "Somber",
      "Eenzaam",
      "Piekerig",
    ],
  },
]

/**
 * Light daily check-in for Vandaag, on one fixed place (`#checkin`).
 *
 * - Empty: energy, mood and stress; sleep, klachten, behoefte and notes
 *   stay behind "Meer toevoegen" (besluit 29). Behoefte comes after
 *   klachten — first how you feel, then what you need.
 * - Filled: the title row with "Aanpassen" and one summary line.
 * - Editing: autosave like Profiel (no Opslaan); the save state sits in a
 *   fixed slot next to the title; one "Klaar" stays in reach at the bottom.
 *   Klaar folds the card up in place with a short "Dank je".
 */
export function CheckinForm({
  initial,
  mentalWellbeingEnabled = false,
  sleepTrackingEnabled = false,
  customSymptoms = [],
  onEditingChange,
}: {
  initial: Checkin | null
  mentalWellbeingEnabled?: boolean
  sleepTrackingEnabled?: boolean
  customSymptoms?: string[]
  /** Lets Vandaag keep the card’s visual slot while she edits (no remount). */
  onEditingChange?: (editing: boolean) => void
}) {
  const router = useRouter()

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
  const [showAllSymptoms, setShowAllSymptoms] = useState(false)

  // 30 chips at once was too much for a daily check-in: show a short set
  // (common ones + whatever she already picked), the rest grouped behind
  // "Alle klachten".
  const quickSymptoms = useMemo(() => {
    const picked = state.symptoms.filter((s) => symptomOptions.includes(s))
    const quick = [...picked, ...QUICK_SYMPTOMS.filter((s) => symptomOptions.includes(s))]
    return [...Array.from(new Set(quick)), "Anders", "Geen klachten"].filter(
      (s, i, all) => all.indexOf(s) === i,
    )
  }, [state.symptoms, symptomOptions])

  const groupedSymptoms = useMemo(() => {
    const rest = symptomOptions.filter((s) => s !== "Anders" && s !== "Geen klachten")
    const groups = SYMPTOM_GROUPS.map((g) => ({
      label: g.label,
      items: rest.filter((s) => g.items.includes(s)),
    }))
    const grouped = new Set(groups.flatMap((g) => g.items))
    const own = rest.filter((s) => !grouped.has(s))
    return [
      ...groups,
      { label: "Eigen en overig", items: [...own, "Anders", "Geen klachten"] },
    ].filter((g) => g.items.length > 0)
  }, [symptomOptions])
  const stateRef = useRef(state)

  // Filled → compact summary. Empty → light editor (energy), details closed.
  const [editing, setEditing] = useState(!checkinHasContent(initial))
  const editingRef = useRef(editing)
  const [showDetails, setShowDetails] = useState(false)
  const [customDraft, setCustomDraft] = useState("")

  const [status, setStatus] = useState<SaveStatus>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  /** Text for the card's polite status region ("Bewaard", "Dank je…"). */
  const [announcement, setAnnouncement] = useState("")
  const [showThanks, setShowThanks] = useState(false)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thanksTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Did the last finished save fail? Klaar then keeps the editor open. */
  const lastSaveFailedRef = useRef(false)
  const savingRef = useRef(false)
  const dirtyRef = useRef(false)
  const mountedRef = useRef(true)
  const onEditingChangeRef = useRef(onEditingChange)
  /** Resolves when the current save chain (including dirty retries) finishes. */
  const saveChainRef = useRef<Promise<void>>(Promise.resolve())
  const performSaveRef = useRef<() => Promise<void>>(async () => {})
  const headingRef = useRef<HTMLHeadingElement>(null)
  const adjustRef = useRef<HTMLButtonElement>(null)
  /** The control she used disappears when the card switches mode: move focus along. */
  const pendingFocusRef = useRef<"heading" | "adjust" | null>(null)

  useEffect(() => {
    const target = pendingFocusRef.current
    if (!target) return
    pendingFocusRef.current = null
    const el = target === "adjust" ? adjustRef.current : headingRef.current
    el?.focus({ preventScroll: true })
  })

  useEffect(() => {
    editingRef.current = editing
  }, [editing])

  useEffect(() => {
    onEditingChangeRef.current = onEditingChange
  }, [onEditingChange])

  useEffect(() => {
    mountedRef.current = true
    onEditingChangeRef.current?.(editingRef.current)

    function flushPending() {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
        void performSaveRef.current()
        return
      }
      if (dirtyRef.current && !savingRef.current) {
        void performSaveRef.current()
      }
    }

    function onHide() {
      if (document.visibilityState === "hidden") flushPending()
    }

    // Mobile: tab switch / app background often unloads before debounce fires.
    window.addEventListener("pagehide", flushPending)
    document.addEventListener("visibilitychange", onHide)

    return () => {
      mountedRef.current = false
      window.removeEventListener("pagehide", flushPending)
      document.removeEventListener("visibilitychange", onHide)
      // Best-effort flush — same as Profiel. Clearing without save was dropping
      // the last taps when she left Vandaag within the debounce window.
      // Read performSaveRef at cleanup time (not mount) so we call the latest save.
      const save = performSaveRef.current
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
        void save()
      } else if (dirtyRef.current && !savingRef.current) {
        void save()
      }
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
      if (thanksTimerRef.current) clearTimeout(thanksTimerRef.current)
    }
  }, [])

  function setEditingAndNotify(next: boolean) {
    editingRef.current = next
    setEditing(next)
    onEditingChangeRef.current?.(next)
  }

  const hasAnyInput = Boolean(
    state.energy ||
      state.mood ||
      state.sleep ||
      state.stress ||
      state.symptoms.length ||
      state.notes.trim() ||
      state.needs.length,
  )

  const summaryMode = hasAnyInput && !editing

  // One line over the full width: "Energie 4 · Stemming 3 · Stress 2 ·
  // Vermoeidheid, Opvliegers · +2".
  const summaryLine = useMemo(() => {
    const parts: string[] = []
    if (state.energy != null) parts.push(`Energie ${state.energy}`)
    if (state.mood != null) parts.push(`Stemming ${state.mood}`)
    if (!sleepTrackingEnabled && state.sleep != null) parts.push(`Slaap ${state.sleep}`)
    if (state.stress != null) parts.push(`Stress ${state.stress}`)
    const extras: string[] = []
    for (const s of state.symptoms) {
      if (s === "Anders") continue
      extras.push(symptomLabel(s))
    }
    for (const need of state.needs) {
      const label = NEED_OPTIONS.find((o) => o.value === need)?.label
      if (label) extras.push(label)
    }
    if (state.notes.trim()) extras.push("Notitie")
    if (extras.length > 0) parts.push(extras.slice(0, 2).join(", "))
    if (extras.length > 2) parts.push(`+${extras.length - 2}`)
    return parts.join(" · ")
  }, [state, sleepTrackingEnabled])

  async function performSave() {
    if (savingRef.current) {
      dirtyRef.current = true
      return saveChainRef.current
    }

    const run = (async () => {
      savingRef.current = true
      dirtyRef.current = false
      if (mountedRef.current) {
        setStatus("saving")
        // Don't read out every "Opslaan…" (besluit 24); clear the region so
        // the next "Bewaard" is announced again.
        if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
        setAnnouncement("")
      }

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
          needs: snapshot.needs,
          newCustomSymptoms,
        })
      } catch {
        result = { error: "Opslaan is niet gelukt. Controleer je verbinding." }
      }

      savingRef.current = false

      if (result?.error) {
        lastSaveFailedRef.current = true
        if (mountedRef.current) {
          setErrorMsg(result.error)
          setStatus("error")
        }
        return
      }

      lastSaveFailedRef.current = false
      if (mountedRef.current) {
        setErrorMsg(null)
        setStatus("saved")
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => {
          if (mountedRef.current) setStatus((current) => (current === "saved" ? "idle" : current))
        }, SAVED_FLASH_MS)
        if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
        announceTimerRef.current = setTimeout(() => {
          announceTimerRef.current = null
          if (mountedRef.current) setAnnouncement("Bewaard")
        }, ANNOUNCE_SAVED_MS)
      }

      if (dirtyRef.current) {
        dirtyRef.current = false
        await performSave()
        return
      }

      // Don’t refresh while she’s still editing — a refresh used to remount
      // this form when Vandaag moved it between slots, which collapsed the card.
      // Roadmap/plan catch up on Klaar (or when already collapsed).
      if (!editingRef.current) {
        router.refresh()
      }
    })()

    saveChainRef.current = run.then(
      () => undefined,
      () => undefined,
    )
    return saveChainRef.current
  }

  // Keep the unmount/pagehide flush pointed at the latest save closure.
  useEffect(() => {
    performSaveRef.current = performSave
  })

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

  /** Flush debounce + wait for any in-flight save chain before leaving edit mode. */
  async function flushSave() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (savingRef.current) {
      dirtyRef.current = true
      await saveChainRef.current
      return
    }
    await performSave()
  }

  function applyUpdate(updater: (prev: FormState) => FormState, mode: "immediate" | "debounced" = "immediate") {
    // Derive next from the ref (already render-synced) so scheduleSave never
    // depends on whether React ran the setState updater in this tick.
    const prev = stateRef.current
    const next = updater(prev)
    if (JSON.stringify(next) === JSON.stringify(prev)) return
    stateRef.current = next
    setState(next)
    scheduleSave(mode === "immediate")
  }

  function toggleNeed(value: string) {
    // Same save queue as other fields — avoids racing two saveCheckin calls.
    applyUpdate((prev) => {
      const current = prev.needs
      const next = (
        current.includes(value as FormState["needs"][number])
          ? current.filter((n) => n !== value)
          : [...current, value]
      ) as FormState["needs"]
      return { ...prev, needs: next }
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

  function startEditing() {
    pendingFocusRef.current = "heading"
    if (thanksTimerRef.current) clearTimeout(thanksTimerRef.current)
    setShowThanks(false)
    setShowDetails(true)
    setEditingAndNotify(true)
  }

  /** The card folded up above the visible area: bring its top back in view. */
  function revealCard() {
    const card = document.getElementById("checkin")
    if (!card) return
    const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    if (card.getBoundingClientRect().top >= offset) return
    card.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" })
  }

  function finishEditing() {
    void (async () => {
      await flushSave()
      if (!mountedRef.current) return
      // Keep the editor (and the error with "Opnieuw") open when the last
      // save failed, so nothing she entered looks saved when it isn't.
      if (lastSaveFailedRef.current) return
      if (announceTimerRef.current) clearTimeout(announceTimerRef.current)
      // Klaar is about to disappear: if it (or nothing) has focus, hand
      // focus to "Aanpassen" — but never pull it away from where she went.
      const active = document.activeElement
      if (!active || active === document.body || active.closest("[data-sticky-action-bar]")) {
        pendingFocusRef.current = "adjust"
      }
      setEditingAndNotify(false)
      setShowDetails(false)
      setShowThanks(true)
      setAnnouncement(THANKS_TEXT)
      void triggerHaptic("light")
      if (thanksTimerRef.current) clearTimeout(thanksTimerRef.current)
      thanksTimerRef.current = setTimeout(() => {
        thanksTimerRef.current = null
        if (mountedRef.current) setShowThanks(false)
      }, THANKS_MS)
      revealCard()
      // Now safe to reshape roadmap / plan around the saved check-in.
      router.refresh()
    })()
  }

  const symptomChip = (symptom: string) => (
    <Chip key={symptom} selected={state.symptoms.includes(symptom)} onClick={() => toggleSymptom(symptom)}>
      {symptomLabel(symptom)}
    </Chip>
  )

  return (
    <Card as="section" id="checkin" aria-labelledby="checkin-heading" className="scroll-mt-4">
      <div className="-my-2 flex min-h-11 items-center justify-between gap-3">
        <h2
          ref={headingRef}
          id="checkin-heading"
          tabIndex={-1}
          data-focus-target=""
          className="type-card-title text-ink"
        >
          Hoe voel je je?
        </h2>
        {summaryMode ? (
          <button
            type="button"
            ref={adjustRef}
            onClick={startEditing}
            aria-expanded={false}
            aria-controls="checkin-editor"
            className={textActionClass("-mr-1 shrink-0 px-1")}
          >
            Aanpassen
            <ChevronDown {...ICON.sm} aria-hidden />
          </button>
        ) : (
          <SaveStatusSlot status={status} />
        )}
      </div>

      <Collapse open={summaryMode}>
        <p className="pt-3 text-sm text-ink-soft">{summaryLine}</p>
      </Collapse>
      <Collapse open={summaryMode && showThanks}>
        <p aria-hidden className="flex items-center gap-1.5 pt-2 text-sm font-medium text-sage-dark">
          <Check {...CHECK_ICON} />
          {THANKS_TEXT}
        </p>
      </Collapse>

      <Collapse open={!summaryMode} id="checkin-editor">
        <div className="flex flex-col gap-4 pt-4">
          <RatingScale
            label="Energie"
            value={state.energy}
            onChange={(value) => applyUpdate((prev) => ({ ...prev, energy: value }))}
            lowLabel="Laag"
            highLabel="Hoog"
          />
          <RatingScale
            label="Stemming"
            value={state.mood}
            onChange={(value) => applyUpdate((prev) => ({ ...prev, mood: value }))}
            lowLabel="Somber"
            highLabel="Blij"
          />
          <RatingScale
            label="Stress"
            value={state.stress}
            onChange={(value) => applyUpdate((prev) => ({ ...prev, stress: value }))}
            lowLabel="Rustig"
            highLabel="Gespannen"
          />

          <Disclosure
            label="Meer toevoegen"
            openLabel="Minder tonen"
            open={showDetails}
            onOpenChange={setShowDetails}
            className="-mt-2"
            contentClassName="flex flex-col gap-4"
          >
            {!sleepTrackingEnabled && (
              <RatingScale
                label="Slaap"
                value={state.sleep}
                onChange={(value) => applyUpdate((prev) => ({ ...prev, sleep: value }))}
                lowLabel="Slecht"
                highLabel="Goed"
              />
            )}

            <div role="group" aria-labelledby="checkin-klachten">
              <div className="-my-2 flex min-h-11 items-center justify-between gap-3">
                <p id="checkin-klachten" className="text-sm font-medium text-ink">
                  Klachten
                </p>
                <button
                  type="button"
                  onClick={() => setShowAllSymptoms((v) => !v)}
                  aria-expanded={showAllSymptoms}
                  aria-controls="checkin-klachten-alle"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-inset text-sm font-medium text-sage-dark touch-manipulation select-none"
                >
                  {showAllSymptoms ? "Minder tonen" : `Alle klachten (${symptomOptions.length - 2})`}
                  <ChevronDown
                    {...iconProps(
                      "sm",
                      cn(
                        "transition-transform duration-base ease-standard motion-reduce:transition-none",
                        showAllSymptoms && "rotate-180",
                      ),
                    )}
                    aria-hidden
                  />
                </button>
              </div>
              <Collapse open={!showAllSymptoms}>
                <div className="flex flex-wrap gap-2 pt-4">{quickSymptoms.map(symptomChip)}</div>
              </Collapse>
              <Collapse open={showAllSymptoms} id="checkin-klachten-alle">
                <div className="flex flex-col gap-4 pt-4">
                  {groupedSymptoms.map((group) => (
                    <div key={group.label} className="flex flex-col gap-2">
                      <p className="type-group-label text-ink-soft">{group.label}</p>
                      <div className="flex flex-wrap gap-2">{group.items.map(symptomChip)}</div>
                    </div>
                  ))}
                </div>
              </Collapse>

              {state.symptoms.includes("Anders") && (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCustomSymptom()
                      }
                    }}
                    placeholder="Eigen klacht toevoegen"
                    maxLength={40}
                    aria-label="Eigen klacht"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addCustomSymptom}
                    disabled={!customDraft.trim()}
                    className="shrink-0"
                  >
                    <Plus {...ICON.sm} aria-hidden />
                    Toevoegen
                  </Button>
                </div>
              )}
            </div>

            <div role="group" aria-labelledby="checkin-behoefte" aria-describedby="checkin-behoefte-hint">
              <p id="checkin-behoefte" className="text-sm font-medium text-ink">
                Waar heb je behoefte aan?
              </p>
              <p id="checkin-behoefte-hint" className="mb-2 text-xs text-ink-soft">
                Je mag er meer dan één kiezen.
              </p>
              <div className="flex flex-wrap gap-2">
                {NEED_OPTIONS.map((opt) => {
                  const selected = state.needs.includes(opt.value)
                  return (
                    <Chip key={opt.value} selected={selected} onClick={() => toggleNeed(opt.value)}>
                      {!selected && <opt.icon {...ICON.sm} aria-hidden />}
                      {opt.label}
                    </Chip>
                  )
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="checkin-notes">Notities (optioneel)</Label>
              <Textarea
                id="checkin-notes"
                rows={2}
                placeholder="Wil je verder nog iets kwijt over vandaag?"
                value={state.notes}
                onChange={(e) => applyUpdate((prev) => ({ ...prev, notes: e.target.value }), "debounced")}
              />
            </div>
          </Disclosure>

          {editing && hasAnyInput && (
            <StickyActionBar bleed={false} className="-mx-5 bg-surface px-5">
              <Button variant="secondary" className="w-full" onClick={finishEditing}>
                Klaar
              </Button>
            </StickyActionBar>
          )}
        </div>
      </Collapse>

      {status === "error" && (
        <div role="alert" className="mt-3 flex flex-wrap items-center gap-x-3 text-sm text-danger">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => void performSave()} className={textActionClass("text-danger")}>
            Opnieuw
          </button>
        </div>
      )}

      {/* "Bewaard" (after a pause) and the thank-you after Klaar. */}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </Card>
  )
}
