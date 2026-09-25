"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input, Label, Textarea } from "@/components/ui/input"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import {
  GOAL_OPTIONS,
  TRAINING_OPTIONS,
  NUTRITION_OPTIONS,
  NUTRITION_STYLE_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  MOVEMENT_LIMITATION_OPTIONS,
  TRAINING_FREQUENCY_OPTIONS,
  REGULARITY_OPTIONS,
} from "@/lib/constants"
import { updateProfile } from "@/lib/actions/profile"
import type { Tables } from "@/types/database"

type Profile = Tables<"profiles">
type CycleProfile = Tables<"cycle_profiles">

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function ProfileForm({
  profile,
  cycleProfile,
}: {
  profile: Profile
  cycleProfile: CycleProfile | null
}) {
  const [name, setName] = useState(profile.name ?? "")
  const [age, setAge] = useState(profile.age ? String(profile.age) : "")
  const [heightCm, setHeightCm] = useState(profile.height_cm ? String(profile.height_cm) : "")
  const [weightKg, setWeightKg] = useState(profile.weight_kg ? String(profile.weight_kg) : "")
  const [goalWeightKg, setGoalWeightKg] = useState(
    profile.goal_weight_kg ? String(profile.goal_weight_kg) : "",
  )
  const [goals, setGoals] = useState<string[]>(profile.goals ?? [])
  const [healthConditions, setHealthConditions] = useState<string[]>(
    profile.health_conditions ?? [],
  )
  const [movementLimitations, setMovementLimitations] = useState<string[]>(
    profile.movement_limitations ?? [],
  )
  const [trainingPreferences, setTrainingPreferences] = useState<string[]>(
    profile.training_preferences ?? [],
  )
  const [nutritionStyle, setNutritionStyle] = useState(profile.nutrition_style ?? "normaal")
  const [nutritionPreferences, setNutritionPreferences] = useState<string[]>(
    profile.nutrition_preferences ?? [],
  )
  const [trainingFrequency, setTrainingFrequency] = useState<number | null>(
    profile.training_frequency,
  )
  const [movementEnabled, setMovementEnabled] = useState(profile.movement_enabled)
  const [nutritionEnabled, setNutritionEnabled] = useState(profile.nutrition_enabled)
  const [trackFlowIntensity, setTrackFlowIntensity] = useState(profile.track_flow_intensity)
  const [motivation, setMotivation] = useState(profile.motivation ?? "")
  const [personalNote, setPersonalNote] = useState(profile.personal_note ?? "")
  const [averageCycleLength, setAverageCycleLength] = useState(
    cycleProfile?.average_cycle_length ? String(cycleProfile.average_cycle_length) : "",
  )
  const [regularity, setRegularity] = useState(cycleProfile?.regularity ?? "")
  const [perimenopauseInfo, setPerimenopauseInfo] = useState(cycleProfile?.perimenopause_information ?? "")
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfile({
        name: name.trim(),
        age: age ? Number(age) : null,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        goalWeightKg: goalWeightKg ? Number(goalWeightKg) : null,
        goals,
        healthConditions,
        movementLimitations,
        movementEnabled,
        trainingPreferences: movementEnabled ? trainingPreferences : [],
        nutritionEnabled,
        nutritionStyle,
        nutritionPreferences: nutritionEnabled ? nutritionPreferences : [],
        trainingFrequency: movementEnabled ? trainingFrequency : null,
        trackFlowIntensity,
        wellnessPreference: profile.wellness_preference,
        motivation: motivation.trim() || null,
        personalNote: personalNote.trim() || null,
        averageCycleLength: averageCycleLength ? Number(averageCycleLength) : null,
        regularity: regularity || null,
        perimenopauseInfo: perimenopauseInfo.trim() || null,
      })
      setStatus(result.error ? "error" : "saved")
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <Card>
        <p className="text-sm font-medium text-ink mb-3">Mijn gegevens</p>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="name">Naam</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="age">Leeftijd</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-ink mb-1">Mijn motivatie</p>
        <p className="text-xs text-ink-soft mb-3">
          Optioneel. Waarom doe jij dit voor jezelf? Dit lees jij later terug, voor niemand
          anders zichtbaar.
        </p>
        <Textarea
          rows={2}
          placeholder="Bijvoorbeeld: ik wil me weer sterk voelen in mijn eigen lijf."
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
        />
      </Card>

      <Card>
        <p className="text-sm font-medium text-ink mb-1">Mijn lichaam</p>
        <p className="text-xs text-ink-soft mb-3">Optioneel — helpt om je advies preciezer te maken.</p>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="heightCm">Lengte (cm)</Label>
            <Input
              id="heightCm"
              type="number"
              inputMode="numeric"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="weightKg">Gewicht (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              inputMode="decimal"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="goalWeightKg">Doelgewicht (kg, optioneel)</Label>
            <Input
              id="goalWeightKg"
              type="number"
              inputMode="decimal"
              value={goalWeightKg}
              onChange={(e) => setGoalWeightKg(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-ink mb-3">Mijn doelen</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <Chip key={opt} selected={goals.includes(opt)} onClick={() => setGoals((g) => toggle(g, opt))}>
              {opt}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-ink mb-3">Mijn aandachtspunten</p>
        <p className="text-xs text-ink-soft mb-3">
          Optioneel. Geen diagnoses — puur om je advies passender te maken.
        </p>
        <p className="text-sm font-medium text-ink mb-2">Aandoeningen of aandachtspunten</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {HEALTH_CONDITION_OPTIONS.map((opt) => (
            <Chip
              key={opt}
              selected={healthConditions.includes(opt)}
              onClick={() => setHealthConditions((v) => toggle(v, opt))}
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
              selected={movementLimitations.includes(opt)}
              onClick={() => setMovementLimitations((v) => toggle(v, opt))}
            >
              {opt}
            </Chip>
          ))}
        </div>
      </Card>

      <Card id="beweging">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-ink">Mijn beweging</p>
          <div className="flex gap-1.5">
            <Chip selected={movementEnabled} onClick={() => setMovementEnabled(true)}>
              Aan
            </Chip>
            <Chip selected={!movementEnabled} onClick={() => setMovementEnabled(false)}>
              Uit
            </Chip>
          </div>
        </div>
        {movementEnabled ? (
          <>
            <p className="text-xs text-ink-soft mb-3">
              Kies welke vormen van bewegen relevant voor je zijn — daarop stemmen we Vandaag,
              Beweging en Deze week af.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {TRAINING_OPTIONS.map((opt) => (
                <Chip
                  key={opt}
                  selected={trainingPreferences.includes(opt)}
                  onClick={() => setTrainingPreferences((v) => toggle(v, opt))}
                >
                  {opt}
                </Chip>
              ))}
            </div>
            <p className="text-sm font-medium text-ink mb-2">Frequentie per week</p>
            <div className="flex flex-wrap gap-2">
              {TRAINING_FREQUENCY_OPTIONS.map((n) => (
                <Chip key={n} selected={trainingFrequency === n} onClick={() => setTrainingFrequency(n)}>
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
          <p className="text-sm font-medium text-ink">Mijn voeding</p>
          <div className="flex gap-1.5">
            <Chip selected={nutritionEnabled} onClick={() => setNutritionEnabled(true)}>
              Aan
            </Chip>
            <Chip selected={!nutritionEnabled} onClick={() => setNutritionEnabled(false)}>
              Uit
            </Chip>
          </div>
        </div>
        {nutritionEnabled ? (
          <>
            <p className="text-xs text-ink-soft mb-3">
              Kies een stijl en eventuele voorkeuren — daarop stemmen we Vandaag, Voeding en
              Deze week af.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {NUTRITION_STYLE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={nutritionStyle === opt.value}
                  onClick={() => setNutritionStyle(opt.value)}
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
                  selected={nutritionPreferences.includes(opt)}
                  onClick={() => setNutritionPreferences((v) => toggle(v, opt))}
                >
                  {opt}
                </Chip>
              ))}
            </div>
          </>
        ) : (
          <p className="text-xs text-ink-soft mt-2">
            Voeding staat uit — je ziet nergens voedingsadvies. Zet dit weer aan wanneer je wilt.
          </p>
        )}
      </Card>

      <Card>
        <p className="text-sm font-medium text-ink mb-1">Mijn notitie</p>
        <p className="text-xs text-ink-soft mb-3">
          Een plekje voor jezelf. Alleen jij ziet dit terug.
        </p>
        <Textarea
          rows={3}
          placeholder="Schrijf hier iets voor jezelf op — een gedachte, een reminder, een klein succesje."
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
        />
      </Card>

      {cycleProfile?.has_cycle && (
        <Card id="cyclus">
          <p className="text-sm font-medium text-ink mb-3">Mijn cyclus</p>
          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="cycleLength">Gemiddelde cyclusduur (dagen)</Label>
              <Input
                id="cycleLength"
                type="number"
                value={averageCycleLength}
                onChange={(e) => setAverageCycleLength(e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-ink mb-2">Regelmaat</p>
              <div className="flex flex-wrap gap-2">
                {REGULARITY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    selected={regularity === opt.value}
                    onClick={() => setRegularity(opt.value)}
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
                  <Chip selected={trackFlowIntensity} onClick={() => setTrackFlowIntensity(true)}>
                    Aan
                  </Chip>
                  <Chip selected={!trackFlowIntensity} onClick={() => setTrackFlowIntensity(false)}>
                    Uit
                  </Chip>
                </div>
              </div>
              <p className="text-xs text-ink-soft mt-1.5">
                Optioneel. Zet dit aan om bij menstruatiedagen in je kalender ook de intensiteit
                (geen/licht/gemiddeld/hevig) te kunnen registreren.
              </p>
            </div>
            <div>
              <Label htmlFor="perimenopauseInfo">
                Ervaar je veranderingen rondom de overgang? (optioneel)
              </Label>
              <Textarea
                id="perimenopauseInfo"
                rows={3}
                placeholder="Vertel hier kort over wat je merkt, bijvoorbeeld onregelmatige cycli of opvliegers."
                value={perimenopauseInfo}
                onChange={(e) => setPerimenopauseInfo(e.target.value)}
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
      )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Bezig met opslaan..." : "Opslaan"}
        </Button>
        {status === "saved" && <span className="text-sm text-sage-dark font-medium">Opgeslagen ✓</span>}
        {status === "error" && <span className="text-sm text-danger">Er ging iets mis.</span>}
      </div>
    </div>
  )
}
