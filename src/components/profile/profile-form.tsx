"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card, CardTitle } from "@/components/ui/card"
import { Input, Label, Textarea } from "@/components/ui/input"
import { Chip } from "@/components/ui/chip"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { OptionList } from "@/components/ui/option-list"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapse, Disclosure } from "@/components/ui/disclosure"
import { textActionClass } from "@/components/ui/button"
import { TagListInput } from "@/components/ui/tag-list-input"
import { todayISO } from "@/lib/dates/amsterdam"
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
import { WORLD_CUISINE_OPTIONS } from "@/lib/nutrition/cuisine"
import { FEATURES } from "@/lib/navigation/features"
import { CuisinePreferencePicker } from "@/components/profile/cuisine-preference-picker"
import { ChipGroup, SettingHeading, SwitchRow } from "@/components/profile/setting-rows"
import { updateProfile, type UpdateProfileInput } from "@/lib/actions/profile"
import { AutosaveStatusPill, type AutosaveStatus } from "@/components/profile/autosave-status"
import { ICON } from "@/lib/ui/icon"
import type { Tables } from "@/types/database"

type Profile = Tables<"profiles">
type CycleProfile = Tables<"cycle_profiles">

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function toggleDay(days: number[], day: number) {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b)
}

/** Modules whose "Voorkeuren" open from a #hash (/profiel/gebruik#voeding). */
const PANEL_IDS = ["beweging", "voeding", "mentale-rust", "medicatie"] as const
type PanelId = (typeof PANEL_IDS)[number]

const CUISINES: readonly string[] = WORLD_CUISINE_OPTIONS

const FREQUENCY_OPTIONS = TRAINING_FREQUENCY_OPTIONS.map((n) => ({ value: n as number, label: `${n}x` }))

/** What an unset buddy_message_frequency behaves like (lib/buddy/styles.ts). */
const DEFAULT_BUDDY_FREQUENCY = "elke_dag"
const BUDDY_FREQUENCY_DISPLAY = BUDDY_FREQUENCY_OPTIONS.map((o) => ({
  value: o.value as string,
  label: o.value === DEFAULT_BUDDY_FREQUENCY ? `${o.label} (standaard)` : o.label,
}))

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
  foodAllergies: string[]
  trainingFrequency: number | null
  movementEnabled: boolean
  nutritionEnabled: boolean
  mentalWellbeingEnabled: boolean
  mentalWellbeingCategories: string[]
  morningReminderEnabled: boolean
  morningReminderTime: string
  morningReminderDays: number[]
  morningReminderContentTypes: MorningReminderContentType[]
  sleepTrackingEnabled: boolean
  trackFlowIntensity: boolean
  motivation: string
  personalNote: string
  hasCycle: boolean
  lastPeriodStart: string
  averageCycleLength: string
  averagePeriodLength: string
  regularity: string
  lifeStage: string
  perimenopauseInfo: string
  hormonalMedicationStatus: string
  showMedicationOnDashboard: boolean
  buddyStyles: string[]
  buddyMessageFrequency: string
}

export type ProfileFormGroup = "account" | "modules" | "cyclus" | "meldingen" | "buddy"

const MAX_RETRIES = 2
const RETRY_DELAYS_MS = [600, 1500]
const DEBOUNCE_MS = 800
const SAVED_FLASH_MS = 2000

export function ProfileForm({
  profile,
  cycleProfile,
  hasMedications,
  group = "all",
}: {
  profile: Profile
  cycleProfile: CycleProfile | null
  hasMedications: boolean
  /** Which settings cluster to show — used by /profiel sub-routes. */
  group?: ProfileFormGroup | "all"
}) {
  const is = (g: ProfileFormGroup) => group === "all" || group === g
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
    foodAllergies: profile.food_allergies ?? [],
    trainingFrequency: profile.training_frequency,
    movementEnabled: profile.movement_enabled,
    nutritionEnabled: profile.nutrition_enabled,
    mentalWellbeingEnabled: profile.mental_wellbeing_enabled === true,
    mentalWellbeingCategories: profile.mental_wellbeing_categories ?? [],
    morningReminderEnabled: profile.morning_reminder_enabled === true,
    morningReminderTime: profile.morning_reminder_time.slice(0, 5),
    morningReminderDays: profile.morning_reminder_days ?? [1, 2, 3, 4, 5, 6, 7],
    morningReminderContentTypes: (() => {
      const raw = profile.morning_reminder_content_types ?? []
      const valid = raw.filter((v): v is MorningReminderContentType =>
        MORNING_REMINDER_CONTENT_TYPE_OPTIONS.some((o) => o.value === v),
      )
      return valid.length ? valid : (["reminder"] as MorningReminderContentType[])
    })(),
    sleepTrackingEnabled: profile.sleep_tracking_enabled === true,
    trackFlowIntensity: profile.track_flow_intensity,
    motivation: profile.motivation ?? "",
    personalNote: profile.personal_note ?? "",
    hasCycle: cycleProfile?.has_cycle ?? true,
    lastPeriodStart: cycleProfile?.last_period_start ?? "",
    averageCycleLength: cycleProfile?.average_cycle_length ? String(cycleProfile.average_cycle_length) : "",
    averagePeriodLength: cycleProfile?.average_period_length
      ? String(cycleProfile.average_period_length)
      : "",
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
  const [openPanels, setOpenPanels] = useState<Partial<Record<PanelId, boolean>>>({})

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
  // Tracks whether the in-flight save came from a chip/toggle (immediate)
  // or a text field (debounced). Both show "Opgeslagen" — toggles need that
  // confirmation too, even though the UI already flipped optimistically.
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
      foodAllergies:
        s.nutritionEnabled && s.nutritionPreferences.includes("Allergieën") ? s.foodAllergies : [],
      mentalWellbeingEnabled: s.mentalWellbeingEnabled,
      mentalWellbeingCategories: s.mentalWellbeingEnabled ? s.mentalWellbeingCategories : [],
      morningReminderEnabled: s.morningReminderEnabled,
      morningReminderTime: s.morningReminderTime,
      morningReminderDays: s.morningReminderDays.length ? s.morningReminderDays : [1, 2, 3, 4, 5, 6, 7],
      morningReminderContentTypes: s.morningReminderContentTypes.length
        ? s.morningReminderContentTypes
        : ["reminder"],
      sleepTrackingEnabled: s.sleepTrackingEnabled,
      trainingFrequency: s.movementEnabled ? s.trainingFrequency : null,
      trackFlowIntensity: s.trackFlowIntensity,
      wellnessPreference: profile.wellness_preference,
      motivation: s.motivation.trim() || null,
      personalNote: s.personalNote.trim() || null,
      hasCycle: s.hasCycle,
      lastPeriodStart: s.hasCycle ? s.lastPeriodStart || null : null,
      averageCycleLength: s.hasCycle && s.averageCycleLength ? Number(s.averageCycleLength) : null,
      averagePeriodLength: s.hasCycle && s.averagePeriodLength ? Number(s.averagePeriodLength) : null,
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
    if (mountedRef.current) setStatus("saving")

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
    // Compute from the ref, not inside a setState updater: React only runs
    // an updater eagerly when nothing else is pending, so from the second
    // quick tap on an immediate save would read the previous snapshot.
    const prev = stateRef.current
    const next = updater(prev)
    if (JSON.stringify(next) === JSON.stringify(prev)) return
    stateRef.current = next
    setState(next)
    scheduleSave(mode === "immediate")
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

  function togglePanel(id: PanelId, open: boolean) {
    setOpenPanels((p) => ({ ...p, [id]: open }))
  }

  // /profiel/gebruik#voeding (from Voeding, Boodschappen, Beweging, Slaap …)
  // lands on that module with its preferences open.
  useEffect(() => {
    function openFromHash() {
      let id = window.location.hash.replace(/^#/, "")
      try {
        id = decodeURIComponent(id)
      } catch {
        // keep the raw value
      }
      if ((PANEL_IDS as readonly string[]).includes(id)) {
        setOpenPanels((p) => (p[id as PanelId] ? p : { ...p, [id]: true }))
      }
    }
    openFromHash()
    window.addEventListener("hashchange", openFromHash)
    return () => window.removeEventListener("hashchange", openFromHash)
  }, [])

  const movementCount = state.trainingPreferences.length + (state.trainingFrequency ? 1 : 0)
  const cuisineCount = state.nutritionPreferences.filter((p) => CUISINES.includes(p)).length
  const nutritionCount =
    state.nutritionPreferences.filter((p) => p !== "Geen voorkeur").length +
    (state.nutritionStyle !== "normaal" ? 1 : 0)
  const mentalCount = state.mentalWellbeingCategories.length

  return (
    <div className="flex flex-col gap-3">
      {is("account") && (
        <>
          <Card className="flex flex-col gap-4">
            <CardTitle as="h2">Naam & leeftijd</CardTitle>
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
                inputMode="numeric"
                value={state.age}
                onChange={(e) => applyUpdate((s) => ({ ...s, age: e.target.value }), "debounced")}
                onBlur={onBlurFlush}
              />
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <div>
              <CardTitle as="h2">Lichaam</CardTitle>
              <p className="mt-1 text-sm text-ink-soft">Optioneel. Helpt om je advies preciezer te maken.</p>
            </div>
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
          </Card>

          <Card className="flex flex-col gap-4">
            <CardTitle as="h2" id="doelen-title">
              Doelen
            </CardTitle>
            <div role="group" aria-labelledby="doelen-title" className="flex flex-wrap gap-2">
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

          <Card id="aandachtspunten" className="flex scroll-mt-4 flex-col gap-4">
            <div>
              <CardTitle as="h2">Aandachtspunten</CardTitle>
              <p className="mt-1 text-sm text-ink-soft">
                Optioneel. Geen diagnoses, alleen om je advies passender te maken.
              </p>
            </div>
            <ChipGroup label="Aandoeningen of aandachtspunten">
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
            </ChipGroup>
            <ChipGroup label="Beperkingen bij bewegen">
              {MOVEMENT_LIMITATION_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  selected={state.movementLimitations.includes(opt)}
                  onClick={() =>
                    applyUpdate(
                      (s) => ({ ...s, movementLimitations: toggle(s.movementLimitations, opt) }),
                      "immediate",
                    )
                  }
                >
                  {opt}
                </Chip>
              ))}
            </ChipGroup>
          </Card>

          <Card className="flex flex-col gap-4">
            <div>
              <CardTitle as="h2">Voor jezelf</CardTitle>
              <p className="mt-1 text-sm text-ink-soft">Optioneel. Alleen jij ziet dit terug.</p>
            </div>
            <div>
              <Label htmlFor="motivation">Motivatie</Label>
              <p id="motivation-hint" className="mb-2 text-sm text-ink-soft">
                Waarom doe jij dit voor jezelf?
              </p>
              <Textarea
                id="motivation"
                rows={2}
                aria-describedby="motivation-hint"
                placeholder="Bijvoorbeeld: ik wil me weer sterk voelen in mijn eigen lijf."
                value={state.motivation}
                onChange={(e) => applyUpdate((s) => ({ ...s, motivation: e.target.value }), "debounced")}
                onBlur={onBlurFlush}
              />
            </div>
            <div>
              <Label htmlFor="personalNote">Notitie voor mezelf</Label>
              <Textarea
                id="personalNote"
                rows={3}
                placeholder="Een gedachte, een reminder, een klein succesje."
                value={state.personalNote}
                onChange={(e) => applyUpdate((s) => ({ ...s, personalNote: e.target.value }), "debounced")}
                onBlur={onBlurFlush}
              />
            </div>
          </Card>
        </>
      )}

      {is("modules") && (
        <Card padding="none" className="divide-y divide-line">
          <section id="beweging" aria-label="Beweging" className="scroll-mt-4 px-4">
            <SwitchRow
              icon={FEATURES.beweging.icon}
              title="Beweging"
              description={
                state.movementEnabled
                  ? "Trainingen en beweegtips op jouw tempo"
                  : "Staat uit. Je ziet nergens trainingsadvies."
              }
              checked={state.movementEnabled}
              onChange={(movementEnabled) => applyUpdate((s) => ({ ...s, movementEnabled }), "immediate")}
            />
            <Collapse open={state.movementEnabled}>
              <Disclosure
                label={preferencesLabel(movementCount)}
                open={!!openPanels.beweging}
                onOpenChange={(open) => togglePanel("beweging", open)}
                className="pb-3"
                contentClassName="flex flex-col gap-4 pb-1"
              >
                <ChipGroup
                  label="Welke vormen van bewegen passen bij je?"
                  hint="Daarop stemmen we Vandaag, Beweging en Deze week af."
                >
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
                </ChipGroup>
                <div>
                  <p id="frequency-label" className="mb-2 text-sm font-medium text-ink">
                    Hoe vaak per week?
                  </p>
                  <ChipRadioGroup
                    aria-labelledby="frequency-label"
                    options={FREQUENCY_OPTIONS}
                    value={state.trainingFrequency}
                    onChange={(n) => applyUpdate((s) => ({ ...s, trainingFrequency: n }), "immediate")}
                  />
                </div>
                <ModuleLink href={FEATURES.beweging.href}>Naar {FEATURES.beweging.label}</ModuleLink>
              </Disclosure>
            </Collapse>
          </section>

          <section id="voeding" aria-label="Voeding" className="scroll-mt-4 px-4">
            <SwitchRow
              icon={FEATURES.voeding.icon}
              title="Voeding"
              description={
                state.nutritionEnabled
                  ? "Recepten en maaltijdtips"
                  : "Staat uit. Je ziet nergens voedingsadvies."
              }
              checked={state.nutritionEnabled}
              onChange={(nutritionEnabled) => applyUpdate((s) => ({ ...s, nutritionEnabled }), "immediate")}
            />
            <Collapse open={state.nutritionEnabled}>
              <Disclosure
                label={preferencesLabel(nutritionCount)}
                open={!!openPanels.voeding}
                onOpenChange={(open) => togglePanel("voeding", open)}
                className="pb-3"
                contentClassName="flex flex-col gap-4 pb-1"
              >
                <p className="text-sm text-ink-soft">
                  Je keuzes bepalen welke recepten we je voorstellen op Vandaag en in Deze week. Bij
                  Voeding zie je altijd alle recepten.
                </p>
                <div>
                  <p id="nutrition-style-label" className="mb-1 text-sm font-medium text-ink">
                    Welke manier van eten past bij je?
                  </p>
                  <OptionList
                    aria-labelledby="nutrition-style-label"
                    framed={false}
                    options={NUTRITION_STYLE_OPTIONS}
                    value={state.nutritionStyle}
                    onChange={(nutritionStyle) => applyUpdate((s) => ({ ...s, nutritionStyle }), "immediate")}
                  />
                </div>
                <ChipGroup label="Voedingsvoorkeuren">
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
                </ChipGroup>
                {state.nutritionPreferences.includes("Allergieën") && (
                  <div>
                    <Label htmlFor="food-allergies">Waarvoor ben je allergisch?</Label>
                    <p id="food-allergies-hint" className="mb-2 text-sm text-ink-soft">
                      Recepten met deze ingrediënten stellen we niet voor op Vandaag en in Deze week.
                      Bij Voeding zie je alle recepten: kijk daar zelf even naar de ingrediënten.
                    </p>
                    <TagListInput
                      inputId="food-allergies"
                      aria-describedby="food-allergies-hint"
                      value={state.foodAllergies}
                      onChange={(foodAllergies) => applyUpdate((s) => ({ ...s, foodAllergies }), "immediate")}
                      placeholder="Bijv. noten, gluten, lactose"
                    />
                  </div>
                )}
                {state.nutritionPreferences.includes("Dingen die ik niet lust") && (
                  <div>
                    <Label htmlFor="disliked-foods">Wat lust je niet?</Label>
                    <p id="disliked-foods-hint" className="mb-2 text-sm text-ink-soft">
                      Gerechten met deze ingrediënten laten we liggen bij het voorstellen van recepten.
                    </p>
                    <TagListInput
                      inputId="disliked-foods"
                      aria-describedby="disliked-foods-hint"
                      value={state.dislikedFoods}
                      onChange={(dislikedFoods) => applyUpdate((s) => ({ ...s, dislikedFoods }), "immediate")}
                      placeholder="Bijv. paddenstoelen, spruitjes"
                    />
                  </div>
                )}
                <Disclosure
                  label={cuisineCount > 0 ? `Wereldkeukens · ${cuisineCount} gekozen` : "Wereldkeukens"}
                  contentClassName="flex flex-col gap-2"
                >
                  <p className="text-sm text-ink-soft">
                    Standaard houden we internationale keukens buiten je voorstellen. Zet aan wat je
                    wilt zien in tips en Deze week.
                  </p>
                  <CuisinePreferencePicker
                    selected={state.nutritionPreferences}
                    onToggle={(cuisine) =>
                      applyUpdate(
                        (s) => ({ ...s, nutritionPreferences: toggle(s.nutritionPreferences, cuisine) }),
                        "immediate",
                      )
                    }
                  />
                </Disclosure>
                <ModuleLink href={FEATURES.voeding.href}>Naar {FEATURES.voeding.label}</ModuleLink>
              </Disclosure>
            </Collapse>
          </section>

          <section id="mentale-rust" aria-label="Mentale rust" className="scroll-mt-4 px-4">
            <SwitchRow
              icon={FEATURES.mentaleRust.icon}
              title="Mentale rust"
              description={
                state.mentalWellbeingEnabled
                  ? "Meditaties, mindfulness en affirmaties"
                  : "Staat uit. Je ziet nergens meditaties of affirmaties."
              }
              checked={state.mentalWellbeingEnabled}
              onChange={(mentalWellbeingEnabled) =>
                applyUpdate((s) => ({ ...s, mentalWellbeingEnabled }), "immediate")
              }
            />
            <Collapse open={state.mentalWellbeingEnabled}>
              <Disclosure
                label={preferencesLabel(mentalCount)}
                open={!!openPanels["mentale-rust"]}
                onOpenChange={(open) => togglePanel("mentale-rust", open)}
                className="pb-3"
                contentClassName="flex flex-col gap-4 pb-1"
              >
                <ChipGroup
                  label="Waar heb je behoefte aan?"
                  hint="Je vindt alles terug bij Mentale rust."
                >
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
                      <opt.icon {...ICON.sm} aria-hidden />
                      {opt.label}
                    </Chip>
                  ))}
                </ChipGroup>
                <ModuleLink href={FEATURES.mentaleRust.href}>Naar {FEATURES.mentaleRust.label}</ModuleLink>
              </Disclosure>
            </Collapse>
          </section>

          <section id="slaap" aria-label="Slaap" className="scroll-mt-4 px-4">
            <SwitchRow
              icon={FEATURES.slaap.icon}
              title="Slaap"
              description={
                state.sleepTrackingEnabled
                  ? "Bedtijd en opstaan noteren op Vandaag, inzichten bij Slaap"
                  : "Staat uit. Je ziet nergens slaapvragen of slaapkaarten."
              }
              checked={state.sleepTrackingEnabled}
              onChange={(sleepTrackingEnabled) => applyUpdate((s) => ({ ...s, sleepTrackingEnabled }), "immediate")}
            />
            <Collapse open={state.sleepTrackingEnabled}>
              <div className="pb-3">
                <ModuleLink href={FEATURES.slaap.href}>Naar {FEATURES.slaap.label}</ModuleLink>
              </div>
            </Collapse>
          </section>

          <section id="medicatie" aria-labelledby="medicatie-title" className="scroll-mt-4 px-4">
            <SettingHeading
              id="medicatie-title"
              icon={FEATURES.medicatie.icon}
              title="Medicatie & hormonen"
              description="Optioneel. Wat je gebruikt en of je het op Vandaag ziet."
            />
            <Disclosure
              label="Voorkeuren"
              open={!!openPanels.medicatie}
              onOpenChange={(open) => togglePanel("medicatie", open)}
              className="pb-3"
              contentClassName="flex flex-col gap-4 pb-1"
            >
              <div>
                <p id="medication-status-label" className="mb-1 text-sm font-medium text-ink">
                  Gebruik je medicatie die invloed kan hebben op je cyclus of hormonen?
                </p>
                <OptionList
                  aria-labelledby="medication-status-label"
                  framed={false}
                  options={HORMONAL_MEDICATION_STATUS_OPTIONS}
                  value={state.hormonalMedicationStatus || null}
                  onChange={(hormonalMedicationStatus) =>
                    applyUpdate((s) => ({ ...s, hormonalMedicationStatus }), "immediate")
                  }
                />
              </div>
              {hasMedications && (
                <SwitchRow
                  title="Tonen op Vandaag"
                  description="Een kort overzicht van je medicatie van vandaag op Vandaag."
                  checked={state.showMedicationOnDashboard}
                  onChange={(showMedicationOnDashboard) =>
                    applyUpdate((s) => ({ ...s, showMedicationOnDashboard }), "immediate")
                  }
                />
              )}
              <ModuleLink href={FEATURES.medicatie.href}>
                {hasMedications ? `Naar ${FEATURES.medicatie.label}` : "Medicatie toevoegen"}
              </ModuleLink>
            </Disclosure>
          </section>
        </Card>
      )}

      {is("meldingen") && (
        <Card id="goedemorgen" padding="none" className="scroll-mt-4 px-4">
          <SwitchRow
            title="Goedemorgen"
            description={
              state.morningReminderEnabled
                ? "Een kort bericht in de ochtend, op dagen die jij kiest"
                : "Staat uit. Je krijgt geen ochtendmelding."
            }
            checked={state.morningReminderEnabled}
            onChange={(morningReminderEnabled) =>
              applyUpdate((s) => ({ ...s, morningReminderEnabled }), "immediate")
            }
          />
          <Collapse open={state.morningReminderEnabled}>
            <div className="flex flex-col gap-4 pt-1 pb-4">
              <div>
                <Label htmlFor="morning-time">Op welk tijdstip?</Label>
                <Input
                  id="morning-time"
                  type="time"
                  value={state.morningReminderTime}
                  onChange={(e) =>
                    applyUpdate((s) => ({ ...s, morningReminderTime: e.target.value }), "debounced")
                  }
                  onBlur={onBlurFlush}
                  className="w-40"
                />
              </div>
              <ChipGroup label="Op welke dagen?">
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
              </ChipGroup>
              <div role="group" aria-labelledby="morning-content-label" aria-describedby="morning-content-hint">
                <p id="morning-content-label" className="text-sm font-medium text-ink">
                  Wat wil je ontvangen?
                </p>
                <p id="morning-content-hint" className="text-sm text-ink-soft">
                  Eén of meer, samen in je ochtendmelding.
                </p>
                <div className="mt-1 flex flex-col">
                  {MORNING_REMINDER_CONTENT_TYPE_OPTIONS.map((opt) => (
                    <Checkbox
                      key={opt.value}
                      checked={state.morningReminderContentTypes.includes(opt.value)}
                      description={opt.description}
                      onCheckedChange={() =>
                        applyUpdate((s) => {
                          const has = s.morningReminderContentTypes.includes(opt.value)
                          if (has) {
                            // Keep at least one: the morning message needs content.
                            if (s.morningReminderContentTypes.length <= 1) return s
                            return {
                              ...s,
                              morningReminderContentTypes: s.morningReminderContentTypes.filter(
                                (v) => v !== opt.value,
                              ),
                            }
                          }
                          return {
                            ...s,
                            morningReminderContentTypes: [...s.morningReminderContentTypes, opt.value],
                          }
                        }, "immediate")
                      }
                    >
                      {opt.label}
                    </Checkbox>
                  ))}
                </div>
              </div>
            </div>
          </Collapse>
        </Card>
      )}

      {is("buddy") && (
        <>
          <Card id="buddy" className="flex scroll-mt-4 flex-col gap-4">
            <div>
              <CardTitle as="h2" id="buddy-tone-title">
                Toon
              </CardTitle>
              <p id="buddy-tone-hint" className="mt-1 text-sm text-ink-soft">
                Kies er één of meer. Niets gekozen = de standaard, warme toon.
              </p>
            </div>
            <div
              role="group"
              aria-labelledby="buddy-tone-title"
              aria-describedby="buddy-tone-hint"
              className="flex flex-wrap gap-2"
            >
              {BUDDY_STYLE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={state.buddyStyles.includes(opt.value)}
                  onClick={() =>
                    applyUpdate((s) => ({ ...s, buddyStyles: toggle(s.buddyStyles, opt.value) }), "immediate")
                  }
                >
                  <opt.icon {...ICON.sm} aria-hidden />
                  {opt.label}
                </Chip>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col gap-2">
            <div>
              <CardTitle as="h2" id="buddy-frequency-title">
                Hoe vaak?
              </CardTitle>
              <p id="buddy-frequency-hint" className="mt-1 text-sm text-ink-soft">
                Hoe vaak je de dagelijkse Buddy-kaart en &ldquo;even onthouden&rdquo;-momenten ziet.
              </p>
            </div>
            <OptionList
              aria-labelledby="buddy-frequency-title"
              aria-describedby="buddy-frequency-hint"
              framed={false}
              options={BUDDY_FREQUENCY_DISPLAY}
              // Nothing stored yet = the default; shown as chosen, not written.
              value={state.buddyMessageFrequency || DEFAULT_BUDDY_FREQUENCY}
              onChange={(buddyMessageFrequency) =>
                applyUpdate((s) => ({ ...s, buddyMessageFrequency }), "immediate")
              }
            />
          </Card>
        </>
      )}

      {is("cyclus") && (
        <>
          <Card id="cyclus" className="flex scroll-mt-4 flex-col gap-4">
            <CardTitle as="h2">Je cyclus</CardTitle>
            {/* Switch and its fields in one wrapper: a closed Collapse would
                still take a gap in the card's flex column. */}
            <div>
              <SwitchRow
                title="Ik heb momenteel een menstruatiecyclus"
                description="Zet uit als je op dit moment niet menstrueert, bijvoorbeeld na de menopauze."
                checked={state.hasCycle}
                onChange={(hasCycle) => applyUpdate((s) => ({ ...s, hasCycle }), "immediate")}
                className="py-0"
              />
              <Collapse open={state.hasCycle}>
                <div className="flex flex-col gap-4 pt-4">
                  <div>
                    <Label htmlFor="lastPeriodStart">Wanneer begon je laatste menstruatie?</Label>
                    <Input
                      id="lastPeriodStart"
                      type="date"
                      aria-describedby="lastPeriodStart-hint"
                      value={state.lastPeriodStart}
                      max={todayISO()}
                      onChange={(e) => applyUpdate((s) => ({ ...s, lastPeriodStart: e.target.value }), "debounced")}
                      onBlur={onBlurFlush}
                    />
                    <p id="lastPeriodStart-hint" className="mt-1.5 text-sm text-ink-soft">
                      Je cyclusdag past zich ook vanzelf aan zodra je een nieuwe menstruatie noteert in de
                      kalender bij Cyclus.
                    </p>
                    <Link href={FEATURES.cyclus.href} className={textActionClass()}>
                      Naar de kalender
                      <ChevronRight {...ICON.sm} aria-hidden />
                    </Link>
                  </div>
                  <div>
                    <Label htmlFor="periodLength">Hoeveel dagen duurt je menstruatie gemiddeld?</Label>
                    <Input
                      id="periodLength"
                      type="number"
                      inputMode="numeric"
                      min={2}
                      max={14}
                      placeholder="Bijv. 5"
                      aria-describedby="periodLength-hint"
                      value={state.averagePeriodLength}
                      onChange={(e) =>
                        applyUpdate((s) => ({ ...s, averagePeriodLength: e.target.value }), "debounced")
                      }
                      onBlur={onBlurFlush}
                    />
                    <p id="periodLength-hint" className="mt-1.5 text-sm text-ink-soft">
                      Alleen de bloedingsdagen, niet je hele cyclus. Meestal ergens tussen 3 en 7.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="cycleLength">Hoe lang duurt je cyclus gemiddeld?</Label>
                    <Input
                      id="cycleLength"
                      type="number"
                      inputMode="numeric"
                      min={15}
                      max={60}
                      placeholder="Aantal dagen"
                      aria-describedby="cycleLength-hint"
                      value={state.averageCycleLength}
                      onChange={(e) => applyUpdate((s) => ({ ...s, averageCycleLength: e.target.value }), "debounced")}
                      onBlur={onBlurFlush}
                    />
                    <p id="cycleLength-hint" className="mt-1.5 text-sm text-ink-soft">
                      In dagen, van de eerste dag van je menstruatie tot de dag vóór de volgende.
                    </p>
                  </div>
                  <div>
                    <p id="regularity-label" className="mb-1 text-sm font-medium text-ink">
                      Is je cyclus regelmatig?
                    </p>
                    <OptionList
                      aria-labelledby="regularity-label"
                      framed={false}
                      options={REGULARITY_OPTIONS}
                      value={state.regularity || null}
                      onChange={(regularity) => applyUpdate((s) => ({ ...s, regularity }), "immediate")}
                    />
                  </div>
                  <SwitchRow
                    title="Bloedverlies bijhouden"
                    description="Optioneel. Noteer bij menstruatiedagen in je kalender ook hoeveel bloedverlies je hebt (geen, licht, gemiddeld of hevig)."
                    checked={state.trackFlowIntensity}
                    onChange={(trackFlowIntensity) => applyUpdate((s) => ({ ...s, trackFlowIntensity }), "immediate")}
                    className="py-0"
                  />
                </div>
              </Collapse>
            </div>
          </Card>

          <Card id="levensfase" className="flex scroll-mt-4 flex-col gap-4">
            <div>
              <CardTitle as="h2" id="life-stage-title">
                Waar sta je nu?
              </CardTitle>
              <p id="life-stage-hint" className="mt-1 text-sm text-ink-soft">
                Dan past de uitleg beter bij jou. Geen diagnose: kies wat het best bij je past.
              </p>
            </div>
            <OptionList
              aria-labelledby="life-stage-title"
              aria-describedby="life-stage-hint"
              framed={false}
              options={LIFE_STAGE_OPTIONS}
              value={state.lifeStage || null}
              onChange={(lifeStage) =>
                applyUpdate(
                  (s) => ({
                    ...s,
                    lifeStage,
                    hasCycle: lifeStage === "menopauze" ? false : s.hasCycle,
                  }),
                  "immediate",
                )
              }
            />
            <div>
              <Label htmlFor="perimenopauseInfo">Ervaar je veranderingen rondom de overgang? (optioneel)</Label>
              <Textarea
                id="perimenopauseInfo"
                rows={3}
                placeholder="Vertel hier kort over wat je merkt, bijvoorbeeld onregelmatige cycli of opvliegers."
                value={state.perimenopauseInfo}
                onChange={(e) => applyUpdate((s) => ({ ...s, perimenopauseInfo: e.target.value }), "debounced")}
                onBlur={onBlurFlush}
              />
              <Link href={FEATURES.overgang.href} className={textActionClass("mt-1")}>
                {FEATURES.overgang.label}
                <ChevronRight {...ICON.sm} aria-hidden />
              </Link>
            </div>
          </Card>
        </>
      )}

      <AutosaveStatusPill status={status} errorMessage={errorMessage} onRetry={handleRetryNow} />
    </div>
  )
}

/** "Voorkeuren · 3 gekozen", or just "Voorkeuren" when nothing is chosen yet. */
function preferencesLabel(count: number) {
  return count > 0 ? `Voorkeuren · ${count} gekozen` : "Voorkeuren"
}

/** The way from a module's preferences to the module itself, at the end. */
function ModuleLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={textActionClass("self-start")}>
      {children}
      <ChevronRight {...ICON.sm} aria-hidden />
    </Link>
  )
}
