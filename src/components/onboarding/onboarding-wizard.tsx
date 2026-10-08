"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Footprints, Salad, Brain, Moon } from "lucide-react"
import { BuddyMark } from "@/components/buddy/buddy-mark"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Chip } from "@/components/ui/chip"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { Input, Label, Textarea, FieldError } from "@/components/ui/input"
import { OptionList } from "@/components/ui/option-list"
import { TagListInput } from "@/components/ui/tag-list-input"
import { todayISO } from "@/lib/dates/amsterdam"
import { ICON, iconProps } from "@/lib/ui/icon"
import {
  GOAL_OPTIONS,
  TRAINING_OPTIONS,
  NUTRITION_OPTIONS,
  NUTRITION_STYLE_OPTIONS,
  TRAINING_FREQUENCY_OPTIONS,
  STYLE_OPTIONS,
  REGULARITY_OPTIONS,
  BUDDY_STYLE_OPTIONS,
  BUDDY_FREQUENCY_OPTIONS,
  MENTAL_WELLBEING_CATEGORY_OPTIONS,
  LIFE_STAGE_OPTIONS,
} from "@/lib/constants"
import { completeOnboarding } from "@/lib/actions/onboarding"
import { acceptHealthDataConsent } from "@/lib/actions/consent"

interface FormData {
  name: string
  age: string
  heightCm: string
  weightKg: string
  goalWeightKg: string
  hasCycle: boolean | null
  lastPeriodStart: string
  averageCycleLength: string
  averagePeriodLength: string
  regularity: string
  perimenopauseInfo: string
  lifeStage: string
  goals: string[]
  healthConditions: string[]
  movementLimitations: string[]
  movementEnabled: boolean | null
  trainingPreferences: string[]
  trainingFrequency: number | null
  nutritionEnabled: boolean | null
  nutritionStyle: string
  nutritionPreferences: string[]
  dislikedFoods: string[]
  foodAllergies: string[]
  // Tri-state, unlike movement/nutrition: "misschien_later" is a genuine
  // third answer (not a decision-avoidance null), so it's tracked separately
  // from "unanswered" — see the completeOnboarding mapping in handleFinish.
  mentalWellbeingChoice: "ja" | "misschien_later" | "nee" | null
  mentalWellbeingCategories: string[]
  sleepEnabled: boolean | null
  hormonalMedicationStatus: string
  wellnessPreference: string
  buddyStyles: string[]
  buddyMessageFrequency: string
}

// The step sequence is dynamic: only modules she switches on get their
// follow-up questions. Kept deliberately short — related questions share a
// screen, and details like height/weight, health notes and medication live in
// Profiel instead (Vandaag invites her to fill them in later), so she reaches
// her first Vandaag quickly.
type StepId =
  | "welcome"
  | "about"
  | "cycle"
  | "goals"
  | "modules"
  | "movement-details"
  | "nutrition-details"
  | "wellbeing-preferences"
  | "wellness"
  | "buddy-style"
  | "buddy"

function buildStepSequence(data: FormData): StepId[] {
  const steps: StepId[] = ["welcome", "about", "cycle", "goals", "modules"]
  if (data.movementEnabled) steps.push("movement-details")
  if (data.nutritionEnabled) steps.push("nutrition-details")
  if (data.mentalWellbeingChoice === "ja") steps.push("wellbeing-preferences")
  steps.push("wellness", "buddy-style", "buddy")
  return steps
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

const SLEEP_GOAL = "Beter slapen"
/** "1x" … "7x", as in Profiel → Wat ik gebruik. */
const FREQUENCY_OPTIONS = TRAINING_FREQUENCY_OPTIONS.map((n) => ({ value: n as number, label: `${n}x` }))
const NO_NUTRITION_PREFERENCE = "Geen voorkeur"

/** "Geen voorkeur" and a real preference can't both be on. */
function toggleNutritionPreference(list: string[], value: string) {
  const next = toggle(list, value)
  if (!next.includes(value)) return next
  return value === NO_NUTRITION_PREFERENCE
    ? [NO_NUTRITION_PREFERENCE]
    : next.filter((v) => v !== NO_NUTRITION_PREFERENCE)
}

export function OnboardingWizard({
  initialName,
  consentGiven = false,
}: {
  initialName: string
  /** She already agreed to health-data processing when registering. */
  consentGiven?: boolean
}) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [healthConsent, setHealthConsent] = useState(consentGiven)
  const [data, setData] = useState<FormData>({
    name: initialName,
    age: "",
    heightCm: "",
    weightKg: "",
    goalWeightKg: "",
    hasCycle: null,
    lastPeriodStart: "",
    averageCycleLength: "",
    averagePeriodLength: "",
    regularity: "",
    lifeStage: "",
    perimenopauseInfo: "",
    goals: [],
    healthConditions: [],
    movementLimitations: [],
    movementEnabled: null,
    trainingPreferences: [],
    trainingFrequency: null,
    nutritionEnabled: null,
    nutritionStyle: "normaal",
    nutritionPreferences: [],
    dislikedFoods: [],
    foodAllergies: [],
    mentalWellbeingChoice: null,
    mentalWellbeingCategories: [],
    sleepEnabled: null,
    hormonalMedicationStatus: "",
    wellnessPreference: "",
    buddyStyles: [],
    buddyMessageFrequency: "",
  })

  const stepSequence = useMemo(() => buildStepSequence(data), [data])
  const stepId = stepSequence[step]
  const totalSteps = stepSequence.length

  // Each step starts at its top, also after scrolling down a long step.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  function validateStep(): string | null {
    switch (stepId) {
      case "welcome":
        return healthConsent
          ? null
          : "Bevestig even de verwerking van je gezondheidsgegevens om verder te gaan."
      case "about": {
        if (data.name.trim().length === 0) return "Vul je naam in."
        const age = Number(data.age)
        if (age >= 10 && age < 16) return "GoFiev is bedoeld voor vrouwen vanaf 16 jaar."
        return age >= 16 && age <= 100 ? null : "Vul een geldige leeftijd in."
      }
      case "cycle":
        if (data.hasCycle === null) return "Laat ons weten of je een cyclus hebt."
        if (data.hasCycle) {
          if (!data.lastPeriodStart) return "Vul de startdatum van je laatste menstruatie in."
          const periodLen = Number(data.averagePeriodLength)
          if (!periodLen || periodLen < 2 || periodLen > 14) {
            return "Vul in hoeveel dagen je menstruatie gemiddeld duurt (2-14)."
          }
          const len = Number(data.averageCycleLength)
          if (!len || len < 15 || len > 60) return "Vul een gemiddelde cyclusduur in (15-60 dagen)."
          if (!data.regularity) return "Laat ons weten of je cyclus regelmatig is."
        }
        return null
      case "goals":
        return data.goals.length > 0 ? null : "Kies minstens één doel."
      case "movement-details":
        return data.trainingFrequency ? null : "Kies hoe vaak je wilt bewegen."
      case "wellness":
        return data.wellnessPreference ? null : "Kies een stijl die bij je past."
      default:
        return null
    }
  }

  function goNext() {
    const validationError = validateStep()
    if (validationError) {
      setError(validationError)
      if (stepId === "movement-details") {
        document
          .getElementById("onboarding-frequency")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }
    setError(null)
    if (stepId === "welcome" && healthConsent && !consentGiven) {
      startTransition(async () => {
        await acceptHealthDataConsent()
        setStep((s) => Math.min(s + 1, totalSteps - 1))
      })
      return
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  function goBack() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleFinish() {
    startTransition(async () => {
      try {
        const result = await completeOnboarding({
          name: data.name.trim(),
          age: Number(data.age),
          heightCm: data.heightCm ? Number(data.heightCm) : undefined,
          weightKg: data.weightKg ? Number(data.weightKg) : undefined,
          goalWeightKg: data.goalWeightKg ? Number(data.goalWeightKg) : undefined,
          hasCycle: data.hasCycle ?? false,
          lastPeriodStart: data.lastPeriodStart || undefined,
          averageCycleLength: data.averageCycleLength
            ? Number(data.averageCycleLength)
            : undefined,
          averagePeriodLength: data.averagePeriodLength
            ? Number(data.averagePeriodLength)
            : undefined,
          regularity: (data.regularity || undefined) as
            | "regelmatig"
            | "onregelmatig"
            | "onbekend"
            | undefined,
          perimenopauseInfo: data.perimenopauseInfo || undefined,
          lifeStage: (data.lifeStage || undefined) as
            | "regelmatig"
            | "veranderend"
            | "perimenopauze"
            | "menopauze"
            | "onbekend"
            | undefined,
          goals: data.goals,
          movementEnabled: data.movementEnabled ?? false,
          trainingPreferences: data.trainingPreferences,
          trainingFrequency: data.trainingFrequency ?? undefined,
          nutritionEnabled: data.nutritionEnabled ?? false,
          nutritionStyle: data.nutritionStyle as "normaal" | "koolhydraatarm",
          nutritionPreferences: data.nutritionPreferences,
          dislikedFoods: data.nutritionPreferences.includes("Dingen die ik niet lust") ? data.dislikedFoods : [],
          foodAllergies: data.nutritionPreferences.includes("Allergieën") ? data.foodAllergies : [],
          // "misschien_later" and "unanswered" both map to null (never asked
          // her again automatically, distinct from an explicit "nee") — see
          // the migration comment in mental_wellbeing.sql.
          mentalWellbeingEnabled:
            data.mentalWellbeingChoice === "ja" ? true : data.mentalWellbeingChoice === "nee" ? false : null,
          mentalWellbeingCategories:
            data.mentalWellbeingChoice === "ja" ? data.mentalWellbeingCategories : [],
          sleepTrackingEnabled: data.sleepEnabled === true,
          healthConditions: data.healthConditions,
          movementLimitations: data.movementLimitations,
          wellnessPreference: data.wellnessPreference as
            | "natuurlijk"
            | "gebalanceerd"
            | "fitness",
          hormonalMedicationStatus: (data.hormonalMedicationStatus || undefined) as
            | "nee"
            | "ht"
            | "ac"
            | "andere_hormonaal"
            | "andere_medicatie"
            | "onbekend_liever_niet"
            | undefined,
          buddyStyles: data.buddyStyles as (
            | "liefdevol"
            | "humor"
            | "spiritueel"
            | "motiverend"
            | "informatief"
            | "rustig"
            | "direct"
            | "luchtig"
          )[],
          buddyMessageFrequency: (data.buddyMessageFrequency || undefined) as
            | "elke_dag"
            | "paar_keer_per_week"
            | "alleen_relevant"
            | "uit"
            | undefined,
        })
        if (result?.error) setError(result.error)
      } catch {
        setError("Opslaan is niet gelukt. Controleer je verbinding en probeer het opnieuw.")
      }
    })
  }

  return (
    <div className="min-h-dvh flex flex-col max-w-md mx-auto px-5 py-8">
      {step > 0 && (
        <div className="mb-8">
          <p className="text-xs font-medium text-ink-soft mb-2" aria-live="polite">
            Stap {step} van {totalSteps - 1}
          </p>
          <div className="w-full h-1.5 rounded-full bg-cream-soft overflow-hidden">
            <div
              className="h-full bg-sage-fill rounded-full transition-[width] duration-slow ease-standard"
              style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        {stepId === "welcome" && (
          <WelcomeStep
            healthConsent={healthConsent}
            onHealthConsentChange={setHealthConsent}
            consentGiven={consentGiven}
          />
        )}
        {stepId === "about" && (
          <AboutStep
            name={data.name}
            age={data.age}
            onNameChange={(name) => setData((d) => ({ ...d, name }))}
            onAgeChange={(age) => setData((d) => ({ ...d, age }))}
          />
        )}
        {stepId === "cycle" && <CycleStep data={data} setData={setData} />}
        {stepId === "goals" && (
          <MultiSelectStep
            title="Wat zijn jouw doelen?"
            subtitle="Kies wat op dit moment bij je past. Je kunt er meerdere kiezen."
            options={GOAL_OPTIONS}
            selected={data.goals}
            onToggle={(v) =>
              setData((d) => {
                const goals = toggle(d.goals, v)
                // "Beter slapen" as a goal switches sleep on, unless she
                // already answered the sleep question herself.
                const sleepEnabled =
                  v === SLEEP_GOAL && d.sleepEnabled === null && goals.includes(SLEEP_GOAL)
                    ? true
                    : d.sleepEnabled
                return { ...d, goals, sleepEnabled }
              })
            }
          />
        )}
        {stepId === "modules" && <ModulesStep data={data} setData={setData} />}
        {stepId === "movement-details" && (
          <div className="flex flex-col gap-10">
            <MultiSelectStep
              title="Welke beweging spreekt je aan?"
              subtitle="Kies wat je leuk vindt of wilt proberen. We laten je daarna alleen nog hierop afgestemde suggesties zien."
              options={TRAINING_OPTIONS}
              selected={data.trainingPreferences}
              onToggle={(v) =>
                setData((d) => ({ ...d, trainingPreferences: toggle(d.trainingPreferences, v) }))
              }
            />
            <FrequencyStep
              value={data.trainingFrequency}
              onChange={(trainingFrequency) => setData((d) => ({ ...d, trainingFrequency }))}
            />
          </div>
        )}
        {stepId === "nutrition-details" && (
          <div className="flex flex-col gap-10">
            <NutritionStyleStep
              value={data.nutritionStyle}
              onChange={(nutritionStyle) => setData((d) => ({ ...d, nutritionStyle }))}
            />
            <div>
              <MultiSelectStep
                title="Heb je voedingsvoorkeuren?"
                subtitle="Zo stellen we passende recepten voor."
                options={NUTRITION_OPTIONS}
                selected={data.nutritionPreferences}
                onToggle={(v) =>
                  setData((d) => ({ ...d, nutritionPreferences: toggleNutritionPreference(d.nutritionPreferences, v) }))
                }
              />
              {data.nutritionPreferences.includes("Allergieën") && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-ink mb-2">Waarvoor ben je allergisch?</p>
                  <p className="text-xs text-ink-soft mb-2">
                    We laten recepten met deze ingrediënten weg.
                  </p>
                  <TagListInput
                    value={data.foodAllergies}
                    onChange={(foodAllergies) => setData((d) => ({ ...d, foodAllergies }))}
                    placeholder="Bijv. noten, gluten, lactose"
                  />
                </div>
              )}
              {data.nutritionPreferences.includes("Dingen die ik niet lust") && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-ink mb-2">Welke gerechten of ingrediënten lust je niet?</p>
                  <TagListInput
                    value={data.dislikedFoods}
                    onChange={(dislikedFoods) => setData((d) => ({ ...d, dislikedFoods }))}
                    placeholder="Bijv. paddenstoelen, spruitjes"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {stepId === "wellbeing-preferences" && (
          <MentalWellbeingPreferencesStep
            selected={data.mentalWellbeingCategories}
            onToggle={(v) =>
              setData((d) => ({ ...d, mentalWellbeingCategories: toggle(d.mentalWellbeingCategories, v) }))
            }
          />
        )}
        {stepId === "wellness" && (
          <StyleStep
            value={data.wellnessPreference}
            onChange={(wellnessPreference) => setData((d) => ({ ...d, wellnessPreference }))}
          />
        )}
        {stepId === "buddy-style" && (
          <BuddyStyleStep
            styles={data.buddyStyles}
            onToggleStyle={(v) => setData((d) => ({ ...d, buddyStyles: toggle(d.buddyStyles, v) }))}
            onClear={() => setData((d) => ({ ...d, buddyStyles: [] }))}
            frequency={data.buddyMessageFrequency}
            onChangeFrequency={(buddyMessageFrequency) => setData((d) => ({ ...d, buddyMessageFrequency }))}
          />
        )}
        {stepId === "buddy" && <BuddyIntroStep name={data.name} styles={data.buddyStyles} />}
      </div>

      <FieldError>{error}</FieldError>

      <div className="flex items-center gap-3 mt-8">
        {step > 0 && (
          <Button variant="secondary" onClick={goBack} disabled={isPending}>
            Terug
          </Button>
        )}
        {step < totalSteps - 1 ? (
          <Button onClick={goNext} className="flex-1">
            {step === 0 ? "Laten we beginnen" : "Volgende"}
          </Button>
        ) : (
          <Button onClick={handleFinish} disabled={isPending} className="flex-1">
            {isPending ? "Bezig..." : "Aan de slag"}
          </Button>
        )}
      </div>
    </div>
  )
}

function WelcomeStep({
  healthConsent,
  onHealthConsentChange,
  consentGiven,
}: {
  healthConsent: boolean
  onHealthConsentChange: (v: boolean) => void
  consentGiven: boolean
}) {
  return (
    <div className="text-center">
      <p className="type-eyebrow text-sage-dark mb-3">Welkom bij GoFiev</p>
      <h1 className="type-page-title text-ink mb-4">
        Jouw lichaam.
        <br />
        Jouw ritme.
        <br />
        Jouw dag.
      </h1>
      <p className="text-ink-soft text-base leading-relaxed mb-6">
        Een paar korte vragen — ongeveer 2 minuten. Alles kun je later nog aanpassen in je
        profiel. Jij houdt de regie; niets hoeft perfect.
      </p>
      {!consentGiven && (
        <Card padding="sm" className="py-1 text-left">
          <Checkbox checked={healthConsent} onCheckedChange={onHealthConsentChange} className="text-sm text-ink">
            Ik bevestig dat mijn gezondheids- en cyclusgegevens mogen worden verwerkt om GoFiev
            persoonlijker te maken.{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-sage-dark font-medium underline-offset-2 hover:underline"
            >
              Privacyverklaring
            </a>
          </Checkbox>
        </Card>
      )}
    </div>
  )
}

function AboutStep({
  name,
  age,
  onNameChange,
  onAgeChange,
}: {
  name: string
  age: string
  onNameChange: (v: string) => void
  onAgeChange: (v: string) => void
}) {
  return (
    <div>
      <h2 className="type-page-title text-ink mb-3">Even kennismaken</h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">
        Je naam gebruiken we om je welkom te heten, je leeftijd helpt om passendere uitleg en
        suggesties te geven.
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Naam</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Bijvoorbeeld Sanne"
            autoComplete="given-name"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="age">Leeftijd</Label>
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            min={16}
            max={100}
            value={age}
            onChange={(e) => onAgeChange(e.target.value)}
            placeholder="Bijvoorbeeld 42"
          />
        </div>
      </div>
    </div>
  )
}

function CycleStep({
  data,
  setData,
}: {
  data: FormData
  setData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  return (
    <div>
      <h2 className="type-page-title text-ink mb-3">Jouw cyclus</h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">
        Elke cyclus is anders. We gaan nooit uit van een standaard van 28 dagen.
      </p>

      <div className="mb-5">
        <p className="text-sm font-medium text-ink mb-2">
          Heb je momenteel een menstruatiecyclus?
        </p>
        <div className="flex gap-2">
          <Chip selected={data.hasCycle === true} onClick={() => setData((d) => ({ ...d, hasCycle: true }))}>
            Ja
          </Chip>
          <Chip selected={data.hasCycle === false} onClick={() => setData((d) => ({ ...d, hasCycle: false }))}>
            Nee
          </Chip>
        </div>
      </div>

      {data.hasCycle && (
        <div className="flex flex-col gap-4 mb-5">
          <div>
            <Label htmlFor="lastPeriodStart">Wanneer begon je laatste menstruatie?</Label>
            <Input
              id="lastPeriodStart"
              type="date"
              value={data.lastPeriodStart}
              max={todayISO()}
              onChange={(e) => setData((d) => ({ ...d, lastPeriodStart: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="averagePeriodLength">Hoeveel dagen duurt je menstruatie gemiddeld?</Label>
            <Input
              id="averagePeriodLength"
              type="number"
              inputMode="numeric"
              min={2}
              max={14}
              placeholder="Bijv. 5"
              value={data.averagePeriodLength}
              onChange={(e) => setData((d) => ({ ...d, averagePeriodLength: e.target.value }))}
            />
            <p className="text-xs text-ink-soft mt-1.5">Alleen de bloedingsdagen, niet je hele cyclus.</p>
          </div>
          <div>
            <Label htmlFor="averageCycleLength">Hoe lang duurt je cyclus gemiddeld?</Label>
            <Input
              id="averageCycleLength"
              type="number"
              inputMode="numeric"
              min={15}
              max={60}
              placeholder="Aantal dagen"
              value={data.averageCycleLength}
              onChange={(e) => setData((d) => ({ ...d, averageCycleLength: e.target.value }))}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-2">Is je cyclus regelmatig?</p>
            <div className="flex flex-wrap gap-2">
              {REGULARITY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={data.regularity === opt.value}
                  onClick={() =>
                    setData((d) => ({
                      ...d,
                      regularity: opt.value,
                      // 40+ with an irregular cycle: suggest "veranderend"
                      // (visible below, she can change or clear it).
                      lifeStage:
                        !d.lifeStage && opt.value === "onregelmatig" && Number(d.age) >= 40
                          ? "veranderend"
                          : d.lifeStage,
                    }))
                  }
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <p className="text-sm font-medium text-ink mb-1">Waar sta je nu? (optioneel)</p>
        <p className="text-xs text-ink-soft mb-2">
          Dan past de uitleg beter bij jou. Geen diagnose, je kunt het later aanpassen.
        </p>
        <div className="flex flex-wrap gap-2">
          {LIFE_STAGE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={data.lifeStage === opt.value}
              onClick={() =>
                setData((d) => ({ ...d, lifeStage: d.lifeStage === opt.value ? "" : opt.value }))
              }
            >
              {opt.label}
            </Chip>
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
          value={data.perimenopauseInfo}
          onChange={(e) => setData((d) => ({ ...d, perimenopauseInfo: e.target.value }))}
        />
      </div>
    </div>
  )
}

function MultiSelectStep({
  title,
  subtitle,
  options,
  selected,
  onToggle,
}: {
  title: string
  subtitle: string
  options: readonly string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <h2 className="type-page-title text-ink mb-3">{title}</h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">{subtitle}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Chip key={opt} selected={selected.includes(opt)} onClick={() => onToggle(opt)}>
            {opt}
          </Chip>
        ))}
      </div>
    </div>
  )
}

function ModulesStep({
  data,
  setData,
}: {
  data: FormData
  setData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  return (
    <div>
      <h2 className="type-page-title text-ink mb-3">Waar wil je ondersteuning bij?</h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">
        Kies wat je nu fijn lijkt. Sla je iets over, dan staat het uit — je zet het later
        altijd aan in je profiel.
      </p>
      <div className="flex flex-col gap-3">
        <ModuleRow
          icon={Footprints}
          title="Beweging"
          description="Suggesties die passen bij je cyclusfase en energie."
          options={[
            { label: "Ja, graag", selected: data.movementEnabled === true, onSelect: () => setData((d) => ({ ...d, movementEnabled: true })) },
            {
              label: "Nee",
              selected: data.movementEnabled === false,
              onSelect: () => setData((d) => ({ ...d, movementEnabled: false, trainingPreferences: [] })),
            },
          ]}
        />
        <ModuleRow
          icon={Salad}
          title="Voeding"
          description="Praktische ideeën en recepten, zonder verplichtingen."
          options={[
            { label: "Ja, graag", selected: data.nutritionEnabled === true, onSelect: () => setData((d) => ({ ...d, nutritionEnabled: true })) },
            {
              label: "Nee",
              selected: data.nutritionEnabled === false,
              onSelect: () =>
                setData((d) => ({ ...d, nutritionEnabled: false, nutritionPreferences: [], dislikedFoods: [], foodAllergies: [] })),
            },
          ]}
        />
        <ModuleRow
          icon={Brain}
          title="Mentale rust"
          description="Korte meditaties, mindfulness en affirmaties."
          options={[
            { label: "Ja, graag", selected: data.mentalWellbeingChoice === "ja", onSelect: () => setData((d) => ({ ...d, mentalWellbeingChoice: "ja" })) },
            {
              label: "Misschien later",
              selected: data.mentalWellbeingChoice === "misschien_later",
              onSelect: () => setData((d) => ({ ...d, mentalWellbeingChoice: "misschien_later", mentalWellbeingCategories: [] })),
            },
            {
              label: "Nee",
              selected: data.mentalWellbeingChoice === "nee",
              onSelect: () => setData((d) => ({ ...d, mentalWellbeingChoice: "nee", mentalWellbeingCategories: [] })),
            },
          ]}
        />
        <ModuleRow
          icon={Moon}
          title="Slaap"
          description="Je slaap bijhouden en zien wat helpt om beter uit te rusten."
          options={[
            { label: "Ja, graag", selected: data.sleepEnabled === true, onSelect: () => setData((d) => ({ ...d, sleepEnabled: true })) },
            { label: "Nee", selected: data.sleepEnabled === false, onSelect: () => setData((d) => ({ ...d, sleepEnabled: false })) },
          ]}
        />
      </div>
    </div>
  )
}

function ModuleRow({
  icon: Icon,
  title,
  description,
  options,
}: {
  icon: LucideIcon
  title: string
  description: string
  options: { label: string; selected: boolean; onSelect: () => void }[]
}) {
  return (
    <Card padding="sm" role="group" aria-label={title}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
        >
          <Icon {...ICON.sm} />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-ink">{title}</p>
          <p className="text-sm text-ink-soft">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {options.map((opt) => (
          <Chip key={opt.label} selected={opt.selected} aria-pressed={opt.selected} onClick={opt.onSelect}>
            {opt.label}
          </Chip>
        ))}
      </div>
    </Card>
  )
}

function MentalWellbeingPreferencesStep({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div>
      <h2 className="type-page-title text-ink mb-3">Bij welke gevoelens wil je ondersteuning?</h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">
        Optioneel, en je kunt er meerdere kiezen. Zo laten we je sneller passende meditaties,
        mindfulness-oefeningen en affirmaties zien.
      </p>
      <div className="flex flex-wrap gap-2">
        {MENTAL_WELLBEING_CATEGORY_OPTIONS.map((opt) => (
          <Chip key={opt.value} selected={selected.includes(opt.value)} onClick={() => onToggle(opt.value)}>
            <opt.icon {...iconProps("sm", "mr-1 inline")} aria-hidden />
            {opt.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}

function NutritionStyleStep({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <h2 id="onboarding-nutrition-style" className="type-page-title text-ink mb-3">
        Voedingsvoorkeur
      </h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">
        Kies een stijl die bij je past. We laten je nooit een extreem of streng dieet zien.
      </p>
      <OptionList
        aria-labelledby="onboarding-nutrition-style"
        value={value}
        onChange={onChange}
        options={NUTRITION_STYLE_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
          description:
            opt.value === "koolhydraatarm"
              ? "We laten vooral recepten zien die van nature lager in koolhydraten zijn."
              : "We laten een gebalanceerde mix van recepten zien.",
        }))}
      />
    </div>
  )
}

function FrequencyStep({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div>
      <h2 id="onboarding-frequency" className="type-page-title text-ink mb-3 scroll-mt-4">
        Hoe vaak wil je bewegen?
      </h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">
        Per week, van 1 tot 7 dagen. We stellen hier een passend weekprogramma op.
      </p>
      {/* The same choice as in Profiel → Wat ik gebruik. */}
      <ChipRadioGroup
        aria-labelledby="onboarding-frequency"
        options={FREQUENCY_OPTIONS}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

function StyleStep({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <h2 id="onboarding-style" className="type-page-title text-ink mb-3">
        Welke stijl past bij jou?
      </h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">Dit kleurt de toon van je aanbevelingen.</p>
      <OptionList
        aria-labelledby="onboarding-style"
        value={value || null}
        onChange={onChange}
        options={STYLE_OPTIONS.map((opt) => ({
          value: opt.value,
          label: (
            <span className="inline-flex items-center gap-2">
              <opt.icon {...iconProps("md", "text-sage-dark")} aria-hidden />
              {opt.label}
            </span>
          ),
        }))}
      />
    </div>
  )
}

function BuddyStyleStep({
  styles,
  onToggleStyle,
  onClear,
  frequency,
  onChangeFrequency,
}: {
  styles: string[]
  onToggleStyle: (v: string) => void
  onClear: () => void
  frequency: string
  onChangeFrequency: (v: string) => void
}) {
  return (
    <div>
      <h2 className="type-page-title text-ink mb-3">Hoe praat je Buddy met je?</h2>
      <p className="text-ink-soft text-base leading-relaxed mb-7">
        Optioneel. Kies één of meerdere stijlen die bij je passen — je berichten, tips en
        weetjes krijgen dan die toon. Later altijd aan te passen via Profiel.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <Chip selected={styles.length === 0} onClick={onClear}>
          Geen voorkeur
        </Chip>
        {BUDDY_STYLE_OPTIONS.map((opt) => (
          <Chip key={opt.value} selected={styles.includes(opt.value)} onClick={() => onToggleStyle(opt.value)}>
            <opt.icon {...iconProps("sm", "mr-1 inline")} aria-hidden />
            {opt.label}
          </Chip>
        ))}
      </div>

      <p className="text-sm font-medium text-ink mb-2 mt-6">Hoe vaak wil je berichten van je Buddy?</p>
      <div className="flex flex-wrap gap-2">
        {BUDDY_FREQUENCY_OPTIONS.map((opt) => (
          <Chip key={opt.value} selected={frequency === opt.value} onClick={() => onChangeFrequency(opt.value)}>
            {opt.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}

// Attributive forms for "in een … toon" — the plain labels ("Liefdevol",
// "Humor") don't inflect correctly in that sentence.
const BUDDY_TONE_ADJECTIVE: Record<string, string> = {
  liefdevol: "liefdevolle",
  humor: "humoristische",
  spiritueel: "spirituele",
  motiverend: "motiverende",
  informatief: "informatieve",
  rustig: "rustige",
  direct: "directe",
  luchtig: "luchtige",
}

function joinDutch(words: string[]) {
  if (words.length <= 1) return words.join("")
  return `${words.slice(0, -1).join(", ")} en ${words[words.length - 1]}`
}

function BuddyIntroStep({ name, styles }: { name: string; styles: string[] }) {
  const adjectives = styles.map((s) => BUDDY_TONE_ADJECTIVE[s]).filter(Boolean)
  const styleLabel = adjectives.length > 0 ? joinDutch(adjectives) : null
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex justify-center">
        <BuddyMark size="xl" />
      </div>
      <h2 className="type-page-title text-ink mb-3">Maak kennis met je Buddy</h2>
      <p className="text-ink-soft text-sm">
        {name ? `${name}, je` : "Je"} Buddy is er om mee te praten over hoe je je voelt, je
        cyclus en je dag. Geen diagnoses, wel een luisterend oor en praktische tips. Bij
        ernstige klachten verwijst je Buddy je altijd door naar een zorgprofessional.
        {styleLabel ? ` Ze praat voortaan met je in een ${styleLabel} toon.` : ""}
      </p>
    </div>
  )
}
