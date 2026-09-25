"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Input, Label, Textarea, FieldError } from "@/components/ui/input"
import {
  GOAL_OPTIONS,
  TRAINING_OPTIONS,
  NUTRITION_OPTIONS,
  TRAINING_FREQUENCY_OPTIONS,
  STYLE_OPTIONS,
  REGULARITY_OPTIONS,
} from "@/lib/constants"
import { completeOnboarding } from "@/lib/actions/onboarding"
import { cn } from "@/lib/utils"

interface FormData {
  name: string
  age: string
  hasCycle: boolean | null
  lastPeriodStart: string
  averageCycleLength: string
  regularity: string
  perimenopauseInfo: string
  goals: string[]
  trainingPreferences: string[]
  nutritionPreferences: string[]
  trainingFrequency: number | null
  wellnessPreference: string
}

const TOTAL_STEPS = 10

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
    hasCycle: null,
    lastPeriodStart: "",
    averageCycleLength: "",
    regularity: "",
    perimenopauseInfo: "",
    goals: [],
    trainingPreferences: [],
    nutritionPreferences: [],
    trainingFrequency: null,
    wellnessPreference: "",
  })

  function validateStep(): string | null {
    switch (step) {
      case 1:
        return data.name.trim().length > 0 ? null : "Vul je naam in."
      case 2: {
        const age = Number(data.age)
        return age >= 10 && age <= 100 ? null : "Vul een geldige leeftijd in."
      }
      case 3:
        if (data.hasCycle === null) return "Laat ons weten of je een cyclus hebt."
        if (data.hasCycle) {
          if (!data.lastPeriodStart) return "Vul de startdatum van je laatste menstruatie in."
          const len = Number(data.averageCycleLength)
          if (!len || len < 15 || len > 60) return "Vul een gemiddelde cyclusduur in (15-60 dagen)."
          if (!data.regularity) return "Laat ons weten of je cyclus regelmatig is."
        }
        return null
      case 4:
        return data.goals.length > 0 ? null : "Kies minstens één doel."
      case 7:
        return data.trainingFrequency ? null : "Kies hoe vaak je wilt bewegen."
      case 8:
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
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
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
          trainingPreferences: data.trainingPreferences,
          nutritionPreferences: data.nutritionPreferences,
          trainingFrequency: data.trainingFrequency!,
          wellnessPreference: data.wellnessPreference as
            | "natuurlijk"
            | "gebalanceerd"
            | "fitness",
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
            className="h-full bg-sage rounded-full transition-all duration-300"
            style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center">
        {step === 0 && <WelcomeStep />}
        {step === 1 && <NameStep value={data.name} onChange={(name) => setData((d) => ({ ...d, name }))} />}
        {step === 2 && <AgeStep value={data.age} onChange={(age) => setData((d) => ({ ...d, age }))} />}
        {step === 3 && <CycleStep data={data} setData={setData} />}
        {step === 4 && (
          <MultiSelectStep
            title="Wat zijn jouw doelen?"
            subtitle="Kies wat op dit moment bij je past. Je kunt er meerdere kiezen."
            options={GOAL_OPTIONS}
            selected={data.goals}
            onToggle={(v) => setData((d) => ({ ...d, goals: toggle(d.goals, v) }))}
          />
        )}
        {step === 5 && (
          <MultiSelectStep
            title="Welke beweging spreekt je aan?"
            subtitle="Kies wat je leuk vindt of wilt proberen."
            options={TRAINING_OPTIONS}
            selected={data.trainingPreferences}
            onToggle={(v) =>
              setData((d) => ({ ...d, trainingPreferences: toggle(d.trainingPreferences, v) }))
            }
          />
        )}
        {step === 6 && (
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
        {step === 7 && (
          <FrequencyStep
            value={data.trainingFrequency}
            onChange={(trainingFrequency) => setData((d) => ({ ...d, trainingFrequency }))}
          />
        )}
        {step === 8 && (
          <StyleStep
            value={data.wellnessPreference}
            onChange={(wellnessPreference) => setData((d) => ({ ...d, wellnessPreference }))}
          />
        )}
        {step === 9 && <BuddyIntroStep name={data.name} />}
      </div>

      <FieldError>{error}</FieldError>

      <div className="flex items-center gap-3 mt-8">
        {step > 0 && (
          <Button variant="secondary" onClick={goBack} disabled={isPending}>
            Terug
          </Button>
        )}
        {step < TOTAL_STEPS - 1 ? (
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
      <p className="text-ink-soft text-sm mb-6">Per week. We passen je planning hierop aan.</p>
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

function BuddyIntroStep({ name }: { name: string }) {
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
      </p>
    </div>
  )
}
