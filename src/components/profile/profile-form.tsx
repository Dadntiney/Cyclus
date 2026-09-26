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
  HORMONAL_MEDICATION_STATUS_OPTIONS,
  BUDDY_STYLE_OPTIONS,
  BUDDY_FREQUENCY_OPTIONS,
  MENTAL_WELLBEING_CATEGORY_OPTIONS,
  REMINDER_DAY_OPTIONS,
  MORNING_REMINDER_CONTENT_TYPE_OPTIONS,
  type MorningReminderContentType,
} from "@/lib/constants"
import { updateProfile } from "@/lib/actions/profile"
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

export function ProfileForm({
  profile,
  cycleProfile,
  hasMedications,
}: {
  profile: Profile
  cycleProfile: CycleProfile | null
  hasMedications: boolean
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
  const [mentalWellbeingEnabled, setMentalWellbeingEnabled] = useState(profile.mental_wellbeing_enabled === true)
  const [mentalWellbeingCategories, setMentalWellbeingCategories] = useState<string[]>(
    profile.mental_wellbeing_categories ?? [],
  )
  const [morningReminderEnabled, setMorningReminderEnabled] = useState(profile.morning_reminder_enabled === true)
  const [morningReminderTime, setMorningReminderTime] = useState(profile.morning_reminder_time.slice(0, 5))
  const [morningReminderDays, setMorningReminderDays] = useState<number[]>(
    profile.morning_reminder_days ?? [1, 2, 3, 4, 5, 6, 7],
  )
  const [morningReminderContentType, setMorningReminderContentType] = useState<MorningReminderContentType>(
    (profile.morning_reminder_content_type as MorningReminderContentType) ?? "reminder",
  )
  const [sleepTrackingEnabled, setSleepTrackingEnabled] = useState(profile.sleep_tracking_enabled === true)
  const [trackFlowIntensity, setTrackFlowIntensity] = useState(profile.track_flow_intensity)
  const [motivation, setMotivation] = useState(profile.motivation ?? "")
  const [personalNote, setPersonalNote] = useState(profile.personal_note ?? "")
  const [hasCycle, setHasCycle] = useState(cycleProfile?.has_cycle ?? true)
  const [lastPeriodStart, setLastPeriodStart] = useState(cycleProfile?.last_period_start ?? "")
  const [averageCycleLength, setAverageCycleLength] = useState(
    cycleProfile?.average_cycle_length ? String(cycleProfile.average_cycle_length) : "",
  )
  const [regularity, setRegularity] = useState(cycleProfile?.regularity ?? "")
  const [perimenopauseInfo, setPerimenopauseInfo] = useState(cycleProfile?.perimenopause_information ?? "")
  const [hormonalMedicationStatus, setHormonalMedicationStatus] = useState(
    profile.hormonal_medication_status ?? "",
  )
  const [showMedicationOnDashboard, setShowMedicationOnDashboard] = useState(
    profile.show_medication_on_dashboard,
  )
  const [buddyStyles, setBuddyStyles] = useState<string[]>(profile.buddy_styles ?? [])
  const [buddyMessageFrequency, setBuddyMessageFrequency] = useState(
    profile.buddy_message_frequency ?? "",
  )
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (hasCycle && averageCycleLength) {
      const len = Number(averageCycleLength)
      if (!len || len < 15 || len > 60) {
        setStatus("error")
        setErrorMessage("Vul een gemiddelde cyclusduur tussen 15 en 60 dagen in.")
        return
      }
    }

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
        mentalWellbeingEnabled,
        mentalWellbeingCategories: mentalWellbeingEnabled ? mentalWellbeingCategories : [],
        morningReminderEnabled,
        morningReminderTime,
        morningReminderDays: morningReminderDays.length ? morningReminderDays : [1, 2, 3, 4, 5, 6, 7],
        morningReminderContentType,
        sleepTrackingEnabled,
        trainingFrequency: movementEnabled ? trainingFrequency : null,
        trackFlowIntensity,
        wellnessPreference: profile.wellness_preference,
        motivation: motivation.trim() || null,
        personalNote: personalNote.trim() || null,
        hasCycle,
        lastPeriodStart: hasCycle ? lastPeriodStart || null : null,
        averageCycleLength: hasCycle && averageCycleLength ? Number(averageCycleLength) : null,
        regularity: hasCycle ? regularity || null : null,
        perimenopauseInfo: perimenopauseInfo.trim() || null,
        hormonalMedicationStatus: hormonalMedicationStatus || null,
        showMedicationOnDashboard,
        buddyStyles,
        buddyMessageFrequency: buddyMessageFrequency || null,
      })
      setStatus(result.error ? "error" : "saved")
      setErrorMessage(result.error ?? null)
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <Card>
        <h2 className="font-display text-lg text-ink mb-3">Mijn gegevens</h2>
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
        <h2 className="font-display text-lg text-ink mb-1">Mijn motivatie</h2>
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
        <h2 className="font-display text-lg text-ink mb-1">Mijn lichaam</h2>
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
        <h2 className="font-display text-lg text-ink mb-3">Mijn doelen</h2>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <Chip key={opt} selected={goals.includes(opt)} onClick={() => setGoals((g) => toggle(g, opt))}>
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
          <h2 className="font-display text-lg text-ink">Mijn beweging</h2>
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
          <h2 className="font-display text-lg text-ink">Mijn voeding</h2>
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

      <Card id="mentale-rust">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink">Mijn mentale rust</h2>
          <div className="flex gap-1.5">
            <Chip selected={mentalWellbeingEnabled} onClick={() => setMentalWellbeingEnabled(true)}>
              Aan
            </Chip>
            <Chip selected={!mentalWellbeingEnabled} onClick={() => setMentalWellbeingEnabled(false)}>
              Uit
            </Chip>
          </div>
        </div>
        {mentalWellbeingEnabled ? (
          <>
            <p className="text-xs text-ink-soft mb-3">
              Korte meditaties, mindfulness-oefeningen en affirmaties. Kies waar je behoefte aan
              hebt — je vindt alles terug bij Mijn mentale rust.
            </p>
            <div className="flex flex-wrap gap-2">
              {MENTAL_WELLBEING_CATEGORY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={mentalWellbeingCategories.includes(opt.value)}
                  onClick={() => setMentalWellbeingCategories((v) => toggle(v, opt.value))}
                >
                  <span className="mr-1" aria-hidden>
                    {opt.emoji}
                  </span>
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
            <Chip selected={morningReminderEnabled} onClick={() => setMorningReminderEnabled(true)}>
              Aan
            </Chip>
            <Chip selected={!morningReminderEnabled} onClick={() => setMorningReminderEnabled(false)}>
              Uit
            </Chip>
          </div>
        </div>
        {morningReminderEnabled ? (
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
              value={morningReminderTime}
              onChange={(e) => setMorningReminderTime(e.target.value)}
              className="max-w-[160px] mb-4"
            />
            <p className="text-sm font-medium text-ink mb-2">Dagen</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {REMINDER_DAY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  selected={morningReminderDays.includes(opt.value)}
                  onClick={() => setMorningReminderDays((d) => toggleDay(d, opt.value))}
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
                  onClick={() => setMorningReminderContentType(opt.value)}
                  className={cn(
                    "text-left rounded-2xl border px-3.5 py-2.5 touch-manipulation transition-colors",
                    morningReminderContentType === opt.value
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
            <Chip selected={sleepTrackingEnabled} onClick={() => setSleepTrackingEnabled(true)}>
              Aan
            </Chip>
            <Chip selected={!sleepTrackingEnabled} onClick={() => setSleepTrackingEnabled(false)}>
              Uit
            </Chip>
          </div>
        </div>
        {sleepTrackingEnabled ? (
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
              selected={hormonalMedicationStatus === opt.value}
              onClick={() => setHormonalMedicationStatus(opt.value)}
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
              <Chip selected={showMedicationOnDashboard} onClick={() => setShowMedicationOnDashboard(true)}>
                Aan
              </Chip>
              <Chip selected={!showMedicationOnDashboard} onClick={() => setShowMedicationOnDashboard(false)}>
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
          <Chip selected={buddyStyles.length === 0} onClick={() => setBuddyStyles([])}>
            Geen voorkeur
          </Chip>
          {BUDDY_STYLE_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={buddyStyles.includes(opt.value)}
              onClick={() => setBuddyStyles((v) => toggle(v, opt.value))}
            >
              <span className="mr-1" aria-hidden>
                {opt.emoji}
              </span>
              {opt.label}
            </Chip>
          ))}
        </div>

        <p className="text-sm font-medium text-ink mb-2">Hoe vaak wil je berichten van je Buddy?</p>
        <div className="flex flex-wrap gap-2">
          {BUDDY_FREQUENCY_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={buddyMessageFrequency === opt.value}
              onClick={() => setBuddyMessageFrequency(opt.value)}
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
          value={personalNote}
          onChange={(e) => setPersonalNote(e.target.value)}
        />
      </Card>

      <Card id="cyclus">
        <h2 className="font-display text-lg text-ink mb-3">Mijn cyclus</h2>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-ink mb-2">Heb je momenteel een menstruatiecyclus?</p>
            <div className="flex gap-2">
              <Chip selected={hasCycle === true} onClick={() => setHasCycle(true)}>
                Ja
              </Chip>
              <Chip selected={hasCycle === false} onClick={() => setHasCycle(false)}>
                Nee
              </Chip>
            </div>
          </div>

          {hasCycle && (
            <>
              <div>
                <Label htmlFor="lastPeriodStart">Wanneer begon je laatste menstruatie?</Label>
                <Input
                  id="lastPeriodStart"
                  type="date"
                  value={lastPeriodStart}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
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
            </>
          )}

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
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Bezig met opslaan..." : "Opslaan"}
        </Button>
        {status === "saved" && <span className="text-sm text-sage-dark font-medium">Opgeslagen ✓</span>}
        {status === "error" && (
          <span className="text-sm text-danger">{errorMessage ?? "Er ging iets mis. Probeer het opnieuw."}</span>
        )}
      </div>
    </div>
  )
}
