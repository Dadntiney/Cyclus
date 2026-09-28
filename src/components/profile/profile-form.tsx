"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input, Label, Textarea } from "@/components/ui/input"
import { Chip } from "@/components/ui/chip"
import { TagListInput } from "@/components/ui/tag-list-input"
import {
  GOAL_OPTIONS,
  TRAINING_OPTIONS,
  NUTRITION_OPTIONS,
  NUTRITION_STYLE_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  MOVEMENT_LIMITATION_OPTIONS,
  TRAINING_FREQUENCY_OPTIONS,
  REGULARITY_OPTIONS,
  LIFE_STAGE_OPTIONS,
  HORMONAL_MEDICATION_STATUS_OPTIONS,
  BUDDY_STYLE_OPTIONS,
  BUDDY_FREQUENCY_OPTIONS,
  MENTAL_WELLBEING_CATEGORY_OPTIONS,
  REMINDER_DAY_OPTIONS,
  MORNING_REMINDER_CONTENT_TYPE_OPTIONS,
  type MorningReminderContentType,
} from "@/lib/constants"
import { updateProfile, type UpdateProfileInput } from "@/lib/actions/profile"
import { AutosaveStatusPill, type AutosaveStatus } from "@/components/profile/autosave-status"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

type Profile = Tables<"profiles">
type CycleProfile = Tables<"cycle_profiles">

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function toggleDay(days: number[], day: number) {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b)
}

interface FormState {
  name: string
  age: string
  heightCm: string
  weightKg: string
  goalWeightKg: string
  goals: string[]
  healthConditions: string[]
  movementLimitations: string[]
  trainingPreferences: string[]
  nutritionStyle: string
  nutritionPreferences: string[]
  dislikedFoods: string[]
  trainingFrequency: number | null
  movementEnabled: boolean
  nutritionEnabled: boolean
  mentalWellbeingEnabled: boolean
  mentalWellbeingCategories: string[]
  morningReminderEnabled: boolean
  morningReminderTime: string
  morningReminderDays: number[]
  morningReminderContentType: MorningReminderContentType
  sleepTrackingEnabled: boolean
  trackFlowIntensity: boolean
  motivation: string
  personalNote: string
  hasCycle: boolean
  lastPeriodStart: string
  averageCycleLength: string
  regularity: string
  lifeStage: string
  perimenopauseInfo: string
  hormonalMedicationStatus: string
  showMedicationOnDashboard: boolean
  buddyStyles: string[]
  buddyMessageFrequency: string
}

const MAX_RETRIES = 2
const RETRY_DELAYS_MS = [600, 1500]
const DEBOUNCE_MS = 800
const SAVED_FLASH_MS = 2000

export function ProfileForm({
  profile,
  cycleProfile,
  hasMedications,
}: {
  profile: Profile
  cycleProfile: CycleProfile | null
  hasMedications: boolean
}) {
  const [state, setState] = useState<FormState>(() => ({
    name: profile.name ?? "",
    age: profile.age ? String(profile.age) : "",
    heightCm: profile.height_cm ? String(profile.height_cm) : "",
    weightKg: profile.weight_kg ? String(profile.weight_kg) : "",
    goalWeightKg: profile.goal_weight_kg ? String(profile.goal_weight_kg) : "",
    goals: profile.goals ?? [],
    healthConditions: profile.health_conditions ?? [],
    movementLimitations: profile.movement_limitations ?? [],
    trainingPreferences: profile.training_preferences ?? [],
    nutritionStyle: profile.nutrition_style ?? "normaal",
    nutritionPreferences: profile.nutrition_preferences ?? [],
    dislikedFoods: profile.disliked_foods ?? [],
    trainingFrequency: profile.training_frequency,
    movementEnabled: profile.movement_enabled,
    nutritionEnabled: profile.nutrition_enabled,
    mentalWellbeingEnabled: profile.mental_wellbeing_enabled === true,
    mentalWellbeingCategories: profile.mental_wellbeing_categories ?? [],
    morningReminderEnabled: profile.morning_reminder_enabled === true,
    morningReminderTime: profile.morning_reminder_time.slice(0, 5),
    morningReminderDays: profile.morning_reminder_days ?? [1, 2, 3, 4, 5, 6, 7],
    morningReminderContentType: (profile.morning_reminder_content_type as MorningReminderContentType) ?? "reminder",
    sleepTrackingEnabled: profile.sleep_tracking_enabled === true,
    trackFlowIntensity: profile.track_flow_intensity,
    motivation: profile.motivation ?? "",
    personalNote: profile.personal_note ?? "",
    hasCycle: cycleProfile?.has_cycle ?? true,
    lastPeriodStart: cycleProfile?.last_period_start ?? "",
    averageCycleLength: cycleProfile?.average_cycle_length ? String(cycleProfile.average_cycle_length) : "",
    regularity: cycleProfile?.regularity ?? "",
    lifeStage: cycleProfile?.life_stage ?? "",
    perimenopauseInfo: cycleProfile?.perimenopause_information ?? "",
    hormonalMedicationStatus: profile.hormonal_medication_status ?? "",
    showMedicationOnDashboard: profile.show_medication_on_dashboard,
    buddyStyles: profile.buddy_styles ?? [],
    buddyMessageFrequency: profile.buddy_message_frequency ?? "",
  }))

  const [status, setStatus] = useState<AutosaveStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Autosave engine: everything below reads/writes refs (not `state`) so it
  // never closes over a stale snapshot, and stays correct across renders
  // without needing to be redeclared as a memoized callback.
  const stateRef = useRef(state)
  const mountedRef = useRef(true)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)
  const dirtyRef = useRef(false)
  const retryCountRef = useRef(0)
  // Which kind of change triggered the save currently in flight (or about
  // to run) — chips/toggles already show their new state instantly, so a
  // save that came from one of those skips the "Opgeslagen" confirmation.
  // Text fields (debounced) keep it, since there's a real delay between
  // typing and the save actually firing. Errors always show either way.
  const lastModeRef = useRef<"immediate" | "debounced">("immediate")

  function buildPayload(s: FormState): UpdateProfileInput {
    return {
      name: s.name.trim(),
      age: s.age ? Number(s.age) : null,
      heightCm: s.heightCm ? Number(s.heightCm) : null,
      weightKg: s.weightKg ? Number(s.weightKg) : null,
      goalWeightKg: s.goalWeightKg ? Number(s.goalWeightKg) : null,
      goals: s.goals,
      healthConditions: s.healthConditions,
      movementLimitations: s.movementLimitations,
      movementEnabled: s.movementEnabled,
      trainingPreferences: s.movementEnabled ? s.trainingPreferences : [],
      nutritionEnabled: s.nutritionEnabled,
      nutritionStyle: s.nutritionStyle,
      nutritionPreferences: s.nutritionEnabled ? s.nutritionPreferences : [],
      dislikedFoods:
        s.nutritionEnabled && s.nutritionPreferences.includes("Dingen die ik niet lust") ? s.dislikedFoods : [],
      mentalWellbeingEnabled: s.mentalWellbeingEnabled,
      mentalWellbeingCategories: s.mentalWellbeingEnabled ? s.mentalWellbeingCategories : [],
      morningReminderEnabled: s.morningReminderEnabled,
      morningReminderTime: s.morningReminderTime,
      morningReminderDays: s.morningReminderDays.length ? s.morningReminderDays : [1, 2, 3, 4, 5, 6, 7],
      morningReminderContentType: s.morningReminderContentType,
      sleepTrackingEnabled: s.sleepTrackingEnabled,
      trainingFrequency: s.movementEnabled ? s.trainingFrequency : null,
      trackFlowIntensity: s.trackFlowIntensity,
      wellnessPreference: profile.wellness_preference,
      motivation: s.motivation.trim() || null,
      personalNote: s.personalNote.trim() || null,
      hasCycle: s.hasCycle,
      lastPeriodStart: s.hasCycle ? s.lastPeriodStart || null : null,
      averageCycleLength: s.hasCycle && s.averageCycleLength ? Number(s.averageCycleLength) : null,
      regularity: s.hasCycle ? s.regularity || null : null,
      lifeStage: s.lifeStage || null,
      perimenopauseInfo: s.perimenopauseInfo.trim() || null,
      hormonalMedicationStatus: s.hormonalMedicationStatus || null,
      showMedicationOnDashboard: s.showMedicationOnDashboard,
      buddyStyles: s.buddyStyles,
      buddyMessageFrequency: s.buddyMessageFrequency || null,
    }
  }

  async function performSave() {
    if (savingRef.current) {
      // A save is already in flight — don't overlap requests. Mark dirty so
      // the in-flight save's completion immediately triggers one more save
      // with the latest snapshot, instead of firing a second request now.
      dirtyRef.current = true
      return
    }
    savingRef.current = true
    dirtyRef.current = false
    if (mountedRef.current && lastModeRef.current === "debounced") setStatus("saving")

    const payload = buildPayload(stateRef.current)
    let result: Awaited<ReturnType<typeof updateProfile>> | undefined
    try {
      result = await updateProfile(payload)
    } catch {
      result = { error: "Opslaan is niet gelukt. Controleer je verbinding." }
    }
    savingRef.current = false

    if (result?.error) {
      if (retryCountRef.current < MAX_RETRIES) {
        const delay = RETRY_DELAYS_MS[retryCountRef.current] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1]
        retryCountRef.current += 1
        retryTimerRef.current = setTimeout(() => {
          void performSave()
        }, delay)
        return
      }
      retryCountRef.current = 0
      if (mountedRef.current) {
        setErrorMessage(result.error)
        setStatus("error")
      }
      return
    }

    retryCountRef.current = 0
    if (mountedRef.current) {
      setErrorMessage(null)
      if (lastModeRef.current === "debounced") {
        setStatus("saved")
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => {
          if (mountedRef.current) setStatus((current) => (current === "saved" ? "idle" : current))
        }, SAVED_FLASH_MS)
      } else {
        setStatus("idle")
      }
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
    lastModeRef.current = immediate ? "immediate" : "debounced"
    if (immediate) {
      void performSave()
    } else {
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null
        void performSave()
      }, DEBOUNCE_MS)
    }
  }

  /** Every field change goes through here: update state, keep the ref in
   * sync in the same tick (so an immediate save never reads a stale
   * snapshot), then schedule a save — skipped entirely if nothing actually
   * changed (e.g. re-tapping an already-selected chip). */
  function applyUpdate(updater: (prev: FormState) => FormState, mode: "immediate" | "debounced") {
    let changed = true
    setState((prev) => {
      const next = updater(prev)
      changed = JSON.stringify(next) !== JSON.stringify(prev)
      stateRef.current = next
      return next
    })
    if (changed) scheduleSave(mode === "immediate")
  }

  function flushDebounce() {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
      void performSave()
    }
  }

  function handleRetryNow() {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    retryCountRef.current = 0
    void performSave()
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // Best-effort flush: a debounced text edit right before navigating
      // away (without a blur — e.g. a swipe-back gesture) still gets sent.
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
        void performSave()
      }
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onBlurFlush = flushDebounce

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <Card>
        <h2 className="font-display text-lg text-ink mb-3">Mijn gegevens</h2>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Naam</Label>
            <Input
              id="name"
              value={state.name}
              onChange={(e) => applyUpdate((s) => ({ ...s, name: e.target.value }), "debounced")}
              onBlur={onBlurFlush}
            />
          </div>
          <div>
            <Label htmlFor="age">Leeftijd</Label>
            <Input
              id="age"
              type="number"
              value={state.age}
              onChange={(e) => applyUpdate((s) => ({ ...s, age: e.target.value }), "debounced")}
              onBlur={onBlurFlush}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-1">Mijn motivatie</h2>
        <p className="text-xs text-ink-soft mb-3">
          Optioneel. Waarom doe jij dit voor jezelf? Dit lees jij later terug, voor niemand
          anders zichtbaar.
        </p>
        <Textarea
          rows={2}
          placeholder="Bijvoorbeeld: ik wil me weer sterk voelen in mijn eigen lijf."
          value={state.motivation}
          onChange={(e) => applyUpdate((s) => ({ ...s, motivation: e.target.value }), "debounced")}
          onBlur={onBlurFlush}
        />
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-1">Mijn lichaam</h2>
        <p className="text-xs text-ink-soft mb-3">Optioneel — helpt om je advies preciezer te maken.</p>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="heightCm">Lengte (cm)</Label>
            <Input
              id="heightCm"
              type="number"
              inputMode="numeric"
              value={state.heightCm}
              onChange={(e) => applyUpdate((s) => ({ ...s, heightCm: e.target.value }), "debounced")}
              onBlur={onBlurFlush}
            />
          </div>
          <div>
            <Label htmlFor="weightKg">Gewicht (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              inputMode="decimal"
              value={state.weightKg}
              onChange={(e) => applyUpdate((s) => ({ ...s, weightKg: e.target.value }), "debounced")}
              onBlur={onBlurFlush}
            />
          </div>
          <div>
            <Label htmlFor="goalWeightKg">Doelgewicht (kg, optioneel)</Label>
            <Input
              id="goalWeightKg"
              type="number"
              inputMode="decimal"
              value={state.goalWeightKg}
              onChange={(e) => applyUpdate((s) => ({ ...s, goalWeightKg: e.target.value }), "debounced")}
              onBlur={onBlurFlush}
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-3">Mijn doelen</h2>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              selected={state.goals.includes(opt)}
              onClick={() => applyUpdate((s) => ({ ...s, goals: toggle(s.goals, opt) }), "immediate")}
            >
              {opt}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-3">Mijn aandachtspunten</h2>
        <p className="text-xs text-ink-soft mb-3">
          Optioneel. Geen diagnoses — puur om je advies passender te maken.
        </p>
        <p className="text-sm font-medium text-ink mb-2">Aandoeningen of aandachtspunten</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {HEALTH_CONDITION_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              selected={state.healthConditions.includes(opt)}
              onClick={() =>
                applyUpdate((s) => ({ ...s, healthConditions: toggle(s.healthConditions, opt) }), "immediate")
              }
            >
              {opt}
            </Chip>
          ))}
        </div>
        <p className="text-sm font-medium text-ink mb-2">Beperkingen bij bewegen</p>
        <div className="flex flex-wrap gap-2">
          {MOVEMENT_LIMITATION_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              selected={state.movementLimitations.includes(opt)}
              onClick={() =>
                applyUpdate((s) => ({ ...s, movementLimitations: toggle(s.movementLimitations, opt) }), "immediate")
              }
            >
              {opt}
            </Chip>
          ))}
        </div>
      </Card>

      <Card id="beweging">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink">Mijn beweging</h2>
          <div className="flex gap-1.5">
            <Chip
              selected={state.movementEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, movementEnabled: true }), "immediate")}
            >
              Aan
            </Chip>
            <Chip
              selected={!state.movementEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, movementEnabled: false }), "immediate")}
            >
              Uit
            </Chip>
          </div>
        </div>
        {state.movementEnabled ? (
          <>
            <p className="text-xs text-ink-soft mb-3">
              Kies welke vormen van bewegen relevant voor je zijn — daarop stemmen we Vandaag,
              Beweging en Deze week af.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {TRAINING_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  selected={state.trainingPreferences.includes(opt)}
                  onClick={() =>
                    applyUpdate(
                      (s) => ({ ...s, trainingPreferences: toggle(s.trainingPreferences, opt) }),
                      "immediate",
                    )
                  }
                >
                  {opt}
                </Chip>
              ))}
            </div>
            <p className="text-sm font-medium text-ink mb-2">Frequentie per week</p>
            <div className="flex flex-wrap gap-2">
              {TRAINING_FREQUENCY_OPTIONS.map((n) => (
                <Chip
                  key={n}
                  selected={state.trainingFrequency === n}
                  onClick={() => applyUpdate((s) => ({ ...s, trainingFrequency: n }), "immediate")}
                >
                  {n}x
                </Chip>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-ink-soft mt-2">
            Beweging staat uit — je ziet nergens trainingsadvies. Zet dit weer aan wanneer je wilt.
          </p>
        )}
      </Card>

      <Card id="voeding">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink">Mijn voeding</h2>
          <div className="flex gap-1.5">
            <Chip
              selected={state.nutritionEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, nutritionEnabled: true }), "immediate")}
            >
              Aan
            </Chip>
            <Chip
              selected={!state.nutritionEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, nutritionEnabled: false }), "immediate")}
            >
              Uit
            </Chip>
          </div>
        </div>
        {state.nutritionEnabled ? (
          <>
            <p className="text-xs text-ink-soft mb-3">
              Kies een stijl en eventuele voorkeuren — daarop stemmen we Vandaag, Voeding en
              Deze week af.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {NUTRITION_STYLE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={state.nutritionStyle === opt.value}
                  onClick={() => applyUpdate((s) => ({ ...s, nutritionStyle: opt.value }), "immediate")}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
            <p className="text-sm font-medium text-ink mb-2">Voedingsvoorkeuren</p>
            <div className="flex flex-wrap gap-2">
              {NUTRITION_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  selected={state.nutritionPreferences.includes(opt)}
                  onClick={() =>
                    applyUpdate(
                      (s) => ({ ...s, nutritionPreferences: toggle(s.nutritionPreferences, opt) }),
                      "immediate",
                    )
                  }
                >
                  {opt}
                </Chip>
              ))}
            </div>
            {state.nutritionPreferences.includes("Dingen die ik niet lust") && (
              <div className="mt-3">
                <p className="text-xs text-ink-soft mb-2">
                  Welke gerechten of ingrediënten lust je niet? We laten deze links liggen bij het
                  kiezen van recepten.
                </p>
                <TagListInput
                  value={state.dislikedFoods}
                  onChange={(dislikedFoods) => applyUpdate((s) => ({ ...s, dislikedFoods }), "immediate")}
                  placeholder="Bijv. paddenstoelen, spruitjes"
                />
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-ink-soft mt-2">
            Voeding staat uit — je ziet nergens voedingsadvies. Zet dit weer aan wanneer je wilt.
          </p>
        )}
      </Card>

      <Card id="mentale-rust">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink">Mijn mentale rust</h2>
          <div className="flex gap-1.5">
            <Chip
              selected={state.mentalWellbeingEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, mentalWellbeingEnabled: true }), "immediate")}
            >
              Aan
            </Chip>
            <Chip
              selected={!state.mentalWellbeingEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, mentalWellbeingEnabled: false }), "immediate")}
            >
              Uit
            </Chip>
          </div>
        </div>
        {state.mentalWellbeingEnabled ? (
          <>
            <p className="text-xs text-ink-soft mb-3">
              Korte meditaties, mindfulness-oefeningen en affirmaties. Kies waar je behoefte aan
              hebt — je vindt alles terug bij Mijn mentale rust.
            </p>
            <div className="flex flex-wrap gap-2">
              {MENTAL_WELLBEING_CATEGORY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={state.mentalWellbeingCategories.includes(opt.value)}
                  onClick={() =>
                    applyUpdate(
                      (s) => ({
                        ...s,
                        mentalWellbeingCategories: toggle(s.mentalWellbeingCategories, opt.value),
                      }),
                      "immediate",
                    )
                  }
                >
                  <opt.icon className="h-4 w-4 mr-1 inline" strokeWidth={1.75} aria-hidden />
                  {opt.label}
                </Chip>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-ink-soft mt-2">
            Mentale rust staat uit — je ziet nergens meditaties, mindfulness of affirmaties. Zet
            dit weer aan wanneer je wilt.
          </p>
        )}
      </Card>

      <Card id="goedemorgen">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink">Goedemorgen</h2>
          <div className="flex gap-1.5">
            <Chip
              selected={state.morningReminderEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, morningReminderEnabled: true }), "immediate")}
            >
              Aan
            </Chip>
            <Chip
              selected={!state.morningReminderEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, morningReminderEnabled: false }), "immediate")}
            >
              Uit
            </Chip>
          </div>
        </div>
        {state.morningReminderEnabled ? (
          <>
            <p className="text-xs text-ink-soft mb-3">
              Een ochtendmelding op een tijdstip en dagen die jij kiest. Let op: op ons hostingplan
              kan de push soms iets later of eerder aankomen dan het exacte tijdstip — terwijl je
              de app open hebt, klopt het tijdstip wel altijd precies.
            </p>
            <Label htmlFor="morning-time">Tijdstip</Label>
            <Input
              id="morning-time"
              type="time"
              value={state.morningReminderTime}
              onChange={(e) => applyUpdate((s) => ({ ...s, morningReminderTime: e.target.value }), "debounced")}
              onBlur={onBlurFlush}
              className="max-w-[160px] mb-4"
            />
            <p className="text-sm font-medium text-ink mb-2">Dagen</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {REMINDER_DAY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={state.morningReminderDays.includes(opt.value)}
                  onClick={() =>
                    applyUpdate(
                      (s) => ({ ...s, morningReminderDays: toggleDay(s.morningReminderDays, opt.value) }),
                      "immediate",
                    )
                  }
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
            <p className="text-sm font-medium text-ink mb-2">Inhoud</p>
            <div className="flex flex-col gap-2">
              {MORNING_REMINDER_CONTENT_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    applyUpdate((s) => ({ ...s, morningReminderContentType: opt.value }), "immediate")
                  }
                  className={cn(
                    "text-left rounded-2xl border px-3.5 py-2.5 touch-manipulation transition-colors",
                    state.morningReminderContentType === opt.value
                      ? "border-sage bg-sage-soft"
                      : "border-line hover:border-sage/50",
                  )}
                >
                  <p className="text-sm font-medium text-ink">{opt.label}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{opt.description}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-ink-soft mt-2">
            Goedemorgen staat uit — geen ochtendmelding. Zet dit weer aan wanneer je wilt.
          </p>
        )}
      </Card>

      <Card id="slaap">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink">Slaap bijhouden</h2>
          <div className="flex gap-1.5">
            <Chip
              selected={state.sleepTrackingEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, sleepTrackingEnabled: true }), "immediate")}
            >
              Aan
            </Chip>
            <Chip
              selected={!state.sleepTrackingEnabled}
              onClick={() => applyUpdate((s) => ({ ...s, sleepTrackingEnabled: false }), "immediate")}
            >
              Uit
            </Chip>
          </div>
        </div>
        {state.sleepTrackingEnabled ? (
          <p className="text-xs text-ink-soft mt-2">
            Je ziet nu op Vandaag een snelle manier om je bedtijd en opsta-tijd in te vullen, en bij
            Slaap je eigen slaapduur en eenvoudige inzichten.
          </p>
        ) : (
          <p className="text-xs text-ink-soft mt-2">
            Slaap bijhouden staat uit — je ziet nergens slaapvragen of slaapkaarten. Zet dit weer
            aan wanneer je wilt.
          </p>
        )}
      </Card>

      <Card id="medicatie">
        <h2 className="font-display text-lg text-ink mb-1">Medicatie & hormonen</h2>
        <p className="text-xs text-ink-soft mb-3">
          Optioneel. Gebruik je hormonale medicatie of medicatie die invloed kan hebben op je
          cyclus of hormonen?
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {HORMONAL_MEDICATION_STATUS_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={state.hormonalMedicationStatus === opt.value}
              onClick={() => applyUpdate((s) => ({ ...s, hormonalMedicationStatus: opt.value }), "immediate")}
              className="w-full justify-start"
            >
              {opt.label}
            </Chip>
          ))}
        </div>

        <p className="text-xs text-ink-soft bg-cream-soft rounded-2xl p-3 mb-4">
          Voer hier alleen het schema in dat je van je arts, apotheker of bijsluiter hebt
          gekregen. De app geeft geen persoonlijk medisch advies en bepaalt niet welke dosering
          of behandeling voor jou geschikt is.
        </p>
        <Link href="/medicatie" className="inline-block text-sm font-medium text-sage-dark mb-4">
          {hasMedications ? "Mijn medicatie beheren →" : "Medicatie toevoegen →"}
        </Link>

        {hasMedications && (
          <div className="flex items-center justify-between">
            <div className="pr-3">
              <p className="text-sm font-medium text-ink">Tonen op Vandaag</p>
              <p className="text-xs text-ink-soft mt-1">
                Laat een kort overzicht van je medicatie van vandaag zien op je Vandaag-pagina.
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Chip
                selected={state.showMedicationOnDashboard}
                onClick={() => applyUpdate((s) => ({ ...s, showMedicationOnDashboard: true }), "immediate")}
              >
                Aan
              </Chip>
              <Chip
                selected={!state.showMedicationOnDashboard}
                onClick={() => applyUpdate((s) => ({ ...s, showMedicationOnDashboard: false }), "immediate")}
              >
                Uit
              </Chip>
            </div>
          </div>
        )}
      </Card>

      <Card id="buddy">
        <h2 className="font-display text-lg text-ink mb-1">Mijn Buddy</h2>
        <p className="text-xs text-ink-soft mb-3">
          Optioneel. Kies één of meerdere stijlen die bij je passen — je berichten, tips en
          weetjes krijgen dan die toon. Kies niets voor de standaard, warme toon.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <Chip
            selected={state.buddyStyles.length === 0}
            onClick={() => applyUpdate((s) => ({ ...s, buddyStyles: [] }), "immediate")}
          >
            Geen voorkeur
          </Chip>
          {BUDDY_STYLE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={state.buddyStyles.includes(opt.value)}
              onClick={() =>
                applyUpdate((s) => ({ ...s, buddyStyles: toggle(s.buddyStyles, opt.value) }), "immediate")
              }
            >
              <opt.icon className="h-4 w-4 mr-1 inline" strokeWidth={1.75} aria-hidden />
              {opt.label}
            </Chip>
          ))}
        </div>

        <p className="text-sm font-medium text-ink mb-2">Hoe vaak wil je berichten van je Buddy?</p>
        <div className="flex flex-wrap gap-2">
          {BUDDY_FREQUENCY_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={state.buddyMessageFrequency === opt.value}
              onClick={() => applyUpdate((s) => ({ ...s, buddyMessageFrequency: opt.value }), "immediate")}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg text-ink mb-1">Mijn notitie</h2>
        <p className="text-xs text-ink-soft mb-3">
          Een plekje voor jezelf. Alleen jij ziet dit terug.
        </p>
        <Textarea
          rows={3}
          placeholder="Schrijf hier iets voor jezelf op — een gedachte, een reminder, een klein succesje."
          value={state.personalNote}
          onChange={(e) => applyUpdate((s) => ({ ...s, personalNote: e.target.value }), "debounced")}
          onBlur={onBlurFlush}
        />
      </Card>

      <Card id="cyclus">
        <h2 className="font-display text-lg text-ink mb-3">Mijn cyclus</h2>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-ink mb-2">Heb je momenteel een menstruatiecyclus?</p>
            <div className="flex gap-2">
              <Chip
                selected={state.hasCycle === true}
                onClick={() => applyUpdate((s) => ({ ...s, hasCycle: true }), "immediate")}
              >
                Ja
              </Chip>
              <Chip
                selected={state.hasCycle === false}
                onClick={() => applyUpdate((s) => ({ ...s, hasCycle: false }), "immediate")}
              >
                Nee
              </Chip>
            </div>
          </div>

          {state.hasCycle && (
            <>
              <div>
                <Label htmlFor="lastPeriodStart">Wanneer begon je laatste menstruatie?</Label>
                <Input
                  id="lastPeriodStart"
                  type="date"
                  value={state.lastPeriodStart}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => applyUpdate((s) => ({ ...s, lastPeriodStart: e.target.value }), "debounced")}
                  onBlur={onBlurFlush}
                />
                <p className="text-xs text-ink-soft mt-1.5">
                  Je cyclusdag past zich ook vanzelf aan zodra je een nieuwe menstruatie
                  aanvinkt in de kalender bij Mijn cyclus.
                </p>
              </div>
              <div>
                <Label htmlFor="cycleLength">Gemiddelde cyclusduur (dagen)</Label>
                <Input
                  id="cycleLength"
                  type="number"
                  inputMode="numeric"
                  min={15}
                  max={60}
                  value={state.averageCycleLength}
                  onChange={(e) => applyUpdate((s) => ({ ...s, averageCycleLength: e.target.value }), "debounced")}
                  onBlur={onBlurFlush}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-ink mb-2">Regelmaat</p>
                <div className="flex flex-wrap gap-2">
                  {REGULARITY_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      selected={state.regularity === opt.value}
                      onClick={() => applyUpdate((s) => ({ ...s, regularity: opt.value }), "immediate")}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">Bloedverlies bijhouden</p>
                  <div className="flex gap-1.5">
                    <Chip
                      selected={state.trackFlowIntensity}
                      onClick={() => applyUpdate((s) => ({ ...s, trackFlowIntensity: true }), "immediate")}
                    >
                      Aan
                    </Chip>
                    <Chip
                      selected={!state.trackFlowIntensity}
                      onClick={() => applyUpdate((s) => ({ ...s, trackFlowIntensity: false }), "immediate")}
                    >
                      Uit
                    </Chip>
                  </div>
                </div>
                <p className="text-xs text-ink-soft mt-1.5">
                  Optioneel. Zet dit aan om bij menstruatiedagen in je kalender ook de intensiteit
                  (geen/licht/gemiddeld/hevig) te kunnen registreren.
                </p>
              </div>
            </>
          )}

          <div>
            <p className="text-sm font-medium text-ink mb-2">Levensfase</p>
            <p className="text-xs text-ink-soft mb-2">
              Past de app-uitleg aan. Dit is géén diagnose — kies wat het best bij jou past.
            </p>
            <div className="flex flex-col gap-2">
              {LIFE_STAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    applyUpdate(
                      (s) => ({
                        ...s,
                        lifeStage: opt.value,
                        hasCycle: opt.value === "menopauze" ? false : s.hasCycle,
                      }),
                      "immediate",
                    )
                  }
                  className={`text-left rounded-2xl border px-3 py-2.5 touch-manipulation transition-colors ${
                    state.lifeStage === opt.value
                      ? "border-sage bg-sage-soft/40"
                      : "border-line/70 bg-transparent"
                  }`}
                >
                  <span className="block text-sm font-medium text-ink">{opt.label}</span>
                  <span className="block text-xs text-ink-soft mt-0.5">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="perimenopauseInfo">
              Ervaar je veranderingen rondom de overgang? (optioneel)
            </Label>
            <Textarea
              id="perimenopauseInfo"
              rows={3}
              placeholder="Vertel hier kort over wat je merkt, bijvoorbeeld onregelmatige cycli of opvliegers."
              value={state.perimenopauseInfo}
              onChange={(e) => applyUpdate((s) => ({ ...s, perimenopauseInfo: e.target.value }), "debounced")}
              onBlur={onBlurFlush}
            />
            <Link
              href="/cyclus/overgang"
              className="inline-block text-xs font-medium text-sage-dark mt-2"
            >
              Meer lezen over de overgang
            </Link>
          </div>
        </div>
      </Card>
      </div>

      <AutosaveStatusPill status={status} errorMessage={errorMessage} onRetry={handleRetryNow} />
    </div>
  )
}
