"use client"

import { useMemo, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Input, Label, Textarea, FieldError } from "@/components/ui/input"
import {
  GOAL_OPTIONS,
  TRAINING_OPTIONS,
  NUTRITION_OPTIONS,
  NUTRITION_STYLE_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  MOVEMENT_LIMITATION_OPTIONS,
  TRAINING_FREQUENCY_OPTIONS,
  STYLE_OPTIONS,
  REGULARITY_OPTIONS,
  HORMONAL_MEDICATION_STATUS_OPTIONS,
  BUDDY_STYLE_OPTIONS,
  BUDDY_FREQUENCY_OPTIONS,
} from "@/lib/constants"
import { completeOnboarding } from "@/lib/actions/onboarding"
import { cn } from "@/lib/utils"

interface FormData {
  name: string
  age: string
  heightCm: string
  weightKg: string
  goalWeightKg: string
  hasCycle: boolean | null
  lastPeriodStart: string
  averageCycleLength: string
  regularity: string
  perimenopauseInfo: string
  goals: string[]
  healthConditions: string[]
  movementLimitations: string[]
  movementEnabled: boolean | null
  trainingPreferences: string[]
  trainingFrequency: number | null
  nutritionEnabled: boolean | null
  nutritionStyle: string
  nutritionPreferences: string[]
  hormonalMedicationStatus: string
  wellnessPreference: string
  buddyStyles: string[]
  buddyMessageFrequency: string
}

// The step sequence is dynamic: whether movement/nutrition were switched on
// decides whether their follow-up questions appear at all, so nobody who
// says "not relevant for me" gets asked to configure it anyway.
type StepId =
  | "welcome"
  | "name"
  | "age"
  | "body"
  | "cycle"
  | "goals"
  | "health"
  | "movement-toggle"
  | "movement-preferences"
  | "movement-frequency"
  | "nutrition-toggle"
  | "nutrition-style"
  | "nutrition-preferences"
  | "medication-status"
  | "wellness"
  | "buddy-style"
  | "buddy"

function buildStepSequence(data: FormData): StepId[] {
  const steps: StepId[] = ["welcome", "name", "age", "body", "cycle", "goals", "health", "movement-toggle"]
  if (data.movementEnabled) steps.push("movement-preferences", "movement-frequency")
  steps.push("nutrition-toggle")
  if (data.nutritionEnabled) steps.push("nutrition-style", "nutrition-preferences")
  steps.push("medication-status", "wellness", "buddy-style", "buddy")
  return steps
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState<FormData>({
    name: initialName,
    age: "",
    heightCm: "",
    weightKg: "",
    goalWeightKg: "",
    hasCycle: null,
    lastPeriodStart: "",
    averageCycleLength: "",
    regularity: "",
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
    hormonalMedicationStatus: "",
    wellnessPreference: "",
    buddyStyles: [],
    buddyMessageFrequency: "",
  })

  const stepSequence = useMemo(() => buildStepSequence(data), [data])
  const stepId = stepSequence[step]
  const totalSteps = stepSequence.length

  function validateStep(): string | null {
    switch (stepId) {
      case "name":
        return data.name.trim().length > 0 ? null : "Vul je naam in."
      case "age": {
        const age = Number(data.age)
        return age >= 10 && age <= 100 ? null : "Vul een geldige leeftijd in."
      }
      case "cycle":
        if (data.hasCycle === null) return "Laat ons weten of je een cyclus hebt."
        if (data.hasCycle) {
          if (!data.lastPeriodStart) return "Vul de startdatum van je laatste menstruatie in."
          const len = Number(data.averageCycleLength)
          if (!len || len < 15 || len > 60) return "Vul een gemiddelde cyclusduur in (15-60 dagen)."
          if (!data.regularity) return "Laat ons weten of je cyclus regelmatig is."
        }
        return null
      case "goals":
        return data.goals.length > 0 ? null : "Kies minstens één doel."
      case "movement-toggle":
        return data.movementEnabled === null ? "Laat ons weten of beweging relevant voor je is." : null
      case "movement-frequency":
        return data.trainingFrequency ? null : "Kies hoe vaak je wilt bewegen."
      case "nutrition-toggle":
        return data.nutritionEnabled === null ? "Laat ons weten of voeding relevant voor je is." : null
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
      return
    }
    setError(null)
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  function goBack() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  function handleFinish() {
    startTransition(async () => {
      try {
        await completeOnboarding({
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
          regularity: (data.regularity || undefined) as
            | "regelmatig"
            | "onregelmatig"
            | "onbekend"
            | undefined,
          perimenopauseInfo: data.perimenopauseInfo || undefined,
          goals: data.goals,
          movementEnabled: data.movementEnabled ?? false,
          trainingPreferences: data.trainingPreferences,
          trainingFrequency: data.trainingFrequency ?? undefined,
          nutritionEnabled: data.nutritionEnabled ?? false,
          nutritionStyle: data.nutritionStyle as "normaal" | "koolhydraatarm",
          nutritionPreferences: data.nutritionPreferences,
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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Er ging iets mis. Probeer het opnieuw.")
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-6 py-8">
      {step > 0 && (
        <div className="w-full h-1.5 rounded-full bg-cream-soft mb-8 overflow-hidden">
          <div
            className="h-full bg-sage-dark rounded-full transition-all duration-300"
            style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        {stepId === "welcome" && <WelcomeStep />}
        {stepId === "name" && (
          <NameStep value={data.name} onChange={(name) => setData((d) => ({ ...d, name }))} />
        )}
        {stepId === "age" && <AgeStep value={data.age} onChange={(age) => setData((d) => ({ ...d, age }))} />}
        {stepId === "body" && <BodyStep data={data} setData={setData} />}
        {stepId === "cycle" && <CycleStep data={data} setData={setData} />}
        {stepId === "goals" && (
          <MultiSelectStep
            title="Wat zijn jouw doelen?"
            subtitle="Kies wat op dit moment bij je past. Je kunt er meerdere kiezen."
            options={GOAL_OPTIONS}
            selected={data.goals}
            onToggle={(v) => setData((d) => ({ ...d, goals: toggle(d.goals, v) }))}
          />
        )}
        {stepId === "health" && <HealthStep data={data} setData={setData} />}
        {stepId === "movement-toggle" && (
          <OptionalModuleToggleStep
            emoji="🏃"
            title="Wil je beweging gebruiken?"
            subtitle="Sommige vrouwen willen liever geen trainingsadvies zien. Helemaal jouw keuze — dit kun je later altijd aanpassen in je profiel."
            value={data.movementEnabled}
            onChange={(movementEnabled) =>
              setData((d) => ({ ...d, movementEnabled, trainingPreferences: movementEnabled ? d.trainingPreferences : [] }))
            }
            yesLabel="Ja, graag"
            noLabel="Nee, niet nodig"
          />
        )}
        {stepId === "movement-preferences" && (
          <MultiSelectStep
            title="Welke beweging spreekt je aan?"
            subtitle="Kies wat je leuk vindt of wilt proberen. We laten je daarna alleen nog hierop afgestemde suggesties zien."
            options={TRAINING_OPTIONS}
            selected={data.trainingPreferences}
            onToggle={(v) =>
              setData((d) => ({ ...d, trainingPreferences: toggle(d.trainingPreferences, v) }))
            }
          />
        )}
        {stepId === "movement-frequency" && (
          <FrequencyStep
            value={data.trainingFrequency}
            onChange={(trainingFrequency) => setData((d) => ({ ...d, trainingFrequency }))}
          />
        )}
        {stepId === "nutrition-toggle" && (
          <OptionalModuleToggleStep
            emoji="🥗"
            title="Wil je voeding gebruiken?"
            subtitle="Als voeding nu niet relevant voor je is, sla je dit gerust over. Ook dit pas je later altijd aan in je profiel."
            value={data.nutritionEnabled}
            onChange={(nutritionEnabled) =>
              setData((d) => ({ ...d, nutritionEnabled, nutritionPreferences: nutritionEnabled ? d.nutritionPreferences : [] }))
            }
            yesLabel="Ja, graag"
            noLabel="Nee, niet nodig"
          />
        )}
        {stepId === "nutrition-style" && (
          <NutritionStyleStep
            value={data.nutritionStyle}
            onChange={(nutritionStyle) => setData((d) => ({ ...d, nutritionStyle }))}
          />
        )}
        {stepId === "nutrition-preferences" && (
          <MultiSelectStep
            title="Heb je voedingsvoorkeuren?"
            subtitle="Zo stellen we passende recepten voor."
            options={NUTRITION_OPTIONS}
            selected={data.nutritionPreferences}
            onToggle={(v) =>
              setData((d) => ({ ...d, nutritionPreferences: toggle(d.nutritionPreferences, v) }))
            }
          />
        )}
        {stepId === "medication-status" && (
          <MedicationStatusStep
            value={data.hormonalMedicationStatus}
            onChange={(hormonalMedicationStatus) => setData((d) => ({ ...d, hormonalMedicationStatus }))}
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

function WelcomeStep() {
  return (
    <div className="text-center">
      <p className="text-sage-dark font-medium mb-3">Welkom bij Cyclus</p>
      <h1 className="font-display text-3xl leading-snug text-ink mb-4">
        Jouw lichaam.
        <br />
        Jouw ritme.
        <br />
        Jouw dag.
      </h1>
      <p className="text-ink-soft text-sm">
        We stellen je een paar korte vragen zodat Cyclus zich aanpast aan jou.
      </p>
    </div>
  )
}

function NameStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Hoe mogen we je noemen?</h2>
      <p className="text-ink-soft text-sm mb-6">Je naam gebruiken we om je welkom te heten.</p>
      <Label htmlFor="name">Naam</Label>
      <Input
        id="name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Bijvoorbeeld Sanne"
        autoFocus
      />
    </div>
  )
}

function AgeStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Wat is je leeftijd?</h2>
      <p className="text-ink-soft text-sm mb-6">
        Dit helpt ons om passendere aanbevelingen te doen.
      </p>
      <Label htmlFor="age">Leeftijd</Label>
      <Input
        id="age"
        type="number"
        inputMode="numeric"
        min={10}
        max={100}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Bijvoorbeeld 32"
        autoFocus
      />
    </div>
  )
}

function BodyStep({
  data,
  setData,
}: {
  data: FormData
  setData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Jouw lichaamsgegevens</h2>
      <p className="text-ink-soft text-sm mb-6">
        Optioneel, maar helpt ons om je advies preciezer te maken. Je kunt dit altijd
        overslaan of later aanpassen.
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="heightCm">Lengte (cm)</Label>
          <Input
            id="heightCm"
            type="number"
            inputMode="numeric"
            min={120}
            max={220}
            value={data.heightCm}
            onChange={(e) => setData((d) => ({ ...d, heightCm: e.target.value }))}
            placeholder="Bijvoorbeeld 168"
          />
        </div>
        <div>
          <Label htmlFor="weightKg">Gewicht (kg)</Label>
          <Input
            id="weightKg"
            type="number"
            inputMode="decimal"
            min={30}
            max={250}
            value={data.weightKg}
            onChange={(e) => setData((d) => ({ ...d, weightKg: e.target.value }))}
            placeholder="Bijvoorbeeld 68"
          />
        </div>
        <div>
          <Label htmlFor="goalWeightKg">Doelgewicht (kg, optioneel)</Label>
          <Input
            id="goalWeightKg"
            type="number"
            inputMode="decimal"
            min={30}
            max={250}
            value={data.goalWeightKg}
            onChange={(e) => setData((d) => ({ ...d, goalWeightKg: e.target.value }))}
            placeholder="Alleen als je dit wilt bijhouden"
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
      <h2 className="font-display text-2xl text-ink mb-2">Jouw cyclus</h2>
      <p className="text-ink-soft text-sm mb-6">
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
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setData((d) => ({ ...d, lastPeriodStart: e.target.value }))}
            />
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
                  onClick={() => setData((d) => ({ ...d, regularity: opt.value }))}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

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
      <h2 className="font-display text-2xl text-ink mb-2">{title}</h2>
      <p className="text-ink-soft text-sm mb-6">{subtitle}</p>
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

function HealthStep({
  data,
  setData,
}: {
  data: FormData
  setData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  const hasAnySelection = data.healthConditions.length > 0 || data.movementLimitations.length > 0
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Aandachtspunten</h2>
      <p className="text-ink-soft text-sm mb-6">
        Optioneel. Dit helpt ons om trainingen en voeding beter op jou af te stemmen. Cyclus
        stelt geen diagnoses — dit is puur om je advies passender te maken.
      </p>

      <p className="text-sm font-medium text-ink mb-2">Aandoeningen of aandachtspunten</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {HEALTH_CONDITION_OPTIONS.map((opt) => (
          <Chip
            key={opt}
            selected={data.healthConditions.includes(opt)}
            onClick={() => setData((d) => ({ ...d, healthConditions: toggle(d.healthConditions, opt) }))}
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
            selected={data.movementLimitations.includes(opt)}
            onClick={() =>
              setData((d) => ({ ...d, movementLimitations: toggle(d.movementLimitations, opt) }))
            }
          >
            {opt}
          </Chip>
        ))}
      </div>

      {hasAnySelection && (
        <p className="text-sm text-ink-soft mt-5 bg-cream-soft rounded-2xl p-3">
          Bij twijfel over wat wel of niet passend is voor jouw situatie is overleg met een
          arts, fysiotherapeut of diëtist altijd verstandig.
        </p>
      )}
    </div>
  )
}

function OptionalModuleToggleStep({
  emoji,
  title,
  subtitle,
  value,
  onChange,
  yesLabel,
  noLabel,
}: {
  emoji: string
  title: string
  subtitle: string
  value: boolean | null
  onChange: (v: boolean) => void
  yesLabel: string
  noLabel: string
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-sage-soft flex items-center justify-center text-2xl">
        {emoji}
      </div>
      <h2 className="font-display text-2xl text-ink mb-2">{title}</h2>
      <p className="text-ink-soft text-sm mb-6">{subtitle}</p>
      <div className="flex gap-2 justify-center">
        <Chip selected={value === true} onClick={() => onChange(true)}>
          {yesLabel}
        </Chip>
        <Chip selected={value === false} onClick={() => onChange(false)}>
          {noLabel}
        </Chip>
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
      <h2 className="font-display text-2xl text-ink mb-2">Voedingsvoorkeur</h2>
      <p className="text-ink-soft text-sm mb-6">
        Kies een stijl die bij je past. We laten je nooit een extreem of streng dieet zien.
      </p>
      <div className="flex flex-col gap-3">
        {NUTRITION_STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col gap-1 rounded-2xl border px-4 py-3.5 text-left transition-colors",
              value === opt.value
                ? "bg-sage-soft border-sage"
                : "bg-white border-line hover:border-sage/60",
            )}
          >
            <span className="font-medium text-ink">{opt.label}</span>
            <span className="text-xs text-ink-soft">
              {opt.value === "koolhydraatarm"
                ? "We laten vooral recepten zien die van nature lager in koolhydraten zijn."
                : "We laten een gebalanceerde mix van recepten zien."}
            </span>
          </button>
        ))}
      </div>
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
      <h2 className="font-display text-2xl text-ink mb-2">Hoe vaak wil je bewegen?</h2>
      <p className="text-ink-soft text-sm mb-6">
        Per week, van 1 tot 7 dagen. We stellen hier een passend weekprogramma op.
      </p>
      <div className="flex flex-wrap gap-2">
        {TRAINING_FREQUENCY_OPTIONS.map((n) => (
          <Chip key={n} selected={value === n} onClick={() => onChange(n)}>
            {n}x per week
          </Chip>
        ))}
      </div>
    </div>
  )
}

function MedicationStatusStep({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Hormonale medicatie</h2>
      <p className="text-ink-soft text-sm mb-6">
        Gebruik je hormonale medicatie of medicatie die invloed kan hebben op je cyclus of
        hormonen? Dit is puur informatief — als je hier iets anders dan &ldquo;Nee&rdquo; kiest,
        kun je daarna zelf je eigen schema bijhouden. Je past dit later altijd aan in je profiel.
      </p>
      <div className="flex flex-col gap-2">
        {HORMONAL_MEDICATION_STATUS_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
            className="w-full justify-start"
          >
            {opt.label}
          </Chip>
        ))}
      </div>
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
      <h2 className="font-display text-2xl text-ink mb-2">Welke stijl past bij jou?</h2>
      <p className="text-ink-soft text-sm mb-6">Dit kleurt de toon van je aanbevelingen.</p>
      <div className="flex flex-col gap-3">
        {STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
              value === opt.value
                ? "bg-sage-soft border-sage"
                : "bg-white border-line hover:border-sage/60",
            )}
          >
            <span className="text-xl">{opt.emoji}</span>
            <span className="font-medium text-ink">{opt.label}</span>
          </button>
        ))}
      </div>
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
      <h2 className="font-display text-2xl text-ink mb-2">Hoe praat je Buddy met je?</h2>
      <p className="text-ink-soft text-sm mb-6">
        Optioneel. Kies één of meerdere stijlen die bij je passen — je berichten, tips en
        weetjes krijgen dan die toon. Later altijd aan te passen via Profiel.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <Chip selected={styles.length === 0} onClick={onClear}>
          Geen voorkeur
        </Chip>
        {BUDDY_STYLE_OPTIONS.map((opt) => (
          <Chip key={opt.value} selected={styles.includes(opt.value)} onClick={() => onToggleStyle(opt.value)}>
            <span className="mr-1" aria-hidden>
              {opt.emoji}
            </span>
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

function BuddyIntroStep({ name, styles }: { name: string; styles: string[] }) {
  const styleLabel = BUDDY_STYLE_OPTIONS.find((opt) => opt.value === styles[0])?.label
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sage-soft flex items-center justify-center text-2xl">
        🌿
      </div>
      <h2 className="font-display text-2xl text-ink mb-2">Maak kennis met je Buddy</h2>
      <p className="text-ink-soft text-sm">
        {name ? `${name}, je` : "Je"} Buddy is er om mee te praten over hoe je je voelt, je
        cyclus en je dag. Geen diagnoses, wel een luisterend oor en praktische tips. Bij
        ernstige klachten verwijst je Buddy je altijd door naar een zorgprofessional.
        {styleLabel ? ` Ze praat voortaan met je in een ${styleLabel.toLowerCase()} toon.` : ""}
      </p>
    </div>
  )
}
