"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Input, Label } from "@/components/ui/input"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import {
  GOAL_OPTIONS,
  TRAINING_OPTIONS,
  NUTRITION_OPTIONS,
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
  const [goals, setGoals] = useState<string[]>(profile.goals ?? [])
  const [trainingPreferences, setTrainingPreferences] = useState<string[]>(
    profile.training_preferences ?? [],
  )
  const [nutritionPreferences, setNutritionPreferences] = useState<string[]>(
    profile.nutrition_preferences ?? [],
  )
  const [trainingFrequency, setTrainingFrequency] = useState<number | null>(
    profile.training_frequency,
  )
  const [averageCycleLength, setAverageCycleLength] = useState(
    cycleProfile?.average_cycle_length ? String(cycleProfile.average_cycle_length) : "",
  )
  const [regularity, setRegularity] = useState(cycleProfile?.regularity ?? "")
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfile({
        name: name.trim(),
        age: age ? Number(age) : null,
        goals,
        trainingPreferences,
        nutritionPreferences,
        trainingFrequency,
        wellnessPreference: profile.wellness_preference,
        averageCycleLength: averageCycleLength ? Number(averageCycleLength) : null,
        regularity: regularity || null,
      })
      setStatus(result.error ? "error" : "saved")
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
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
        <p className="text-sm font-medium text-ink mb-3">Doelen</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <Chip key={opt} selected={goals.includes(opt)} onClick={() => setGoals((g) => toggle(g, opt))}>
              {opt}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-ink mb-3">Beweging</p>
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
      </Card>

      <Card>
        <p className="text-sm font-medium text-ink mb-3">Voeding</p>
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
      </Card>

      {cycleProfile?.has_cycle && (
        <Card>
          <p className="text-sm font-medium text-ink mb-3">Cyclusinstellingen</p>
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
          </div>
        </Card>
      )}

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
