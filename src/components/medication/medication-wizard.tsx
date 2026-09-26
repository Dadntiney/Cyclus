"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Switch } from "@/components/ui/switch"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Input, Label, Textarea, FieldError } from "@/components/ui/input"
import {
  MEDICATION_CATEGORY_OPTIONS,
  HT_NAME_SUGGESTIONS,
  CONTRACEPTION_METHOD_OPTIONS,
  MEDICATION_FORM_OPTIONS,
  MEDICATION_SCHEDULE_TYPE_OPTIONS,
  REMINDER_DAY_OPTIONS,
} from "@/lib/constants"
import { createMedication, updateMedication } from "@/lib/actions/medications"
import { describeSchedule } from "@/lib/medication/schedule"
import type { MedicationInput } from "@/lib/validations/medication"
import { cn } from "@/lib/utils"

type Category = MedicationInput["category"]
type ScheduleType = MedicationInput["scheduleType"]

interface WizardData {
  category: Category | null
  name: string
  hormoneType: string
  form: string
  dosage: string
  scheduleType: ScheduleType | null
  scheduleDays: number[]
  scheduleDaysOnValue: string
  scheduleDaysOffValue: string
  cyclUnit: "dagen" | "weken"
  startDate: string
  endDate: string
  timeOfDay: string
  reminderEnabled: boolean
  remindOnStart: boolean
  remindDaily: boolean
  remindOnStop: boolean
  notes: string
}

function emptyData(initialCategory: Category | null): WizardData {
  return {
    category: initialCategory,
    name: "",
    hormoneType: "",
    form: "",
    dosage: "",
    scheduleType: null,
    scheduleDays: [],
    scheduleDaysOnValue: "",
    scheduleDaysOffValue: "",
    cyclUnit: "dagen",
    startDate: "",
    endDate: "",
    timeOfDay: "",
    reminderEnabled: false,
    remindOnStart: true,
    remindDaily: true,
    remindOnStop: true,
    notes: "",
  }
}

type StepId = "category" | "name" | "form" | "schedule" | "reminder" | "notes" | "review"

function buildSteps(data: WizardData): StepId[] {
  const steps: StepId[] = []
  if (!data.category) steps.push("category")
  steps.push("name", "form", "schedule", "reminder", "notes", "review")
  return steps
}

export function MedicationWizard({
  mode,
  medicationId,
  initial,
}: {
  mode: "create" | "edit"
  medicationId?: string
  initial?: Partial<WizardData>
}) {
  const router = useRouter()
  const [data, setData] = useState<WizardData>({ ...emptyData(initial?.category ?? null), ...initial })
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // In edit mode the category was already chosen when the item was created,
  // so we never show that step again.
  const lockedCategory = mode === "edit"
  const stepSequence = useMemo(
    () => (lockedCategory ? buildSteps(data).filter((s) => s !== "category") : buildSteps(data)),
    [data, lockedCategory],
  )
  const stepId = stepSequence[step]
  const totalSteps = stepSequence.length

  function validateStep(): string | null {
    switch (stepId) {
      case "category":
        return data.category ? null : "Kies een categorie."
      case "name":
        return data.name.trim() ? null : "Vul een naam in."
      case "schedule": {
        if (!data.scheduleType) return "Kies een schema."
        if (data.scheduleType === "wekelijkse_dagen" && data.scheduleDays.length === 0) {
          return "Kies minstens één dag van de week."
        }
        if (data.scheduleType === "cyclisch") {
          if (!data.scheduleDaysOnValue) return "Vul in hoeveel dagen je het wel gebruikt."
          if (!data.scheduleDaysOffValue) return "Vul in hoeveel dagen je het niet gebruikt."
          if (!data.startDate) return "Vul in wanneer de eerste periode begint."
        }
        if (data.scheduleType === "om_de_dag" && !data.startDate) {
          return "Vul in vanaf welke datum dit schema geldt."
        }
        return null
      }
      case "reminder":
        if (data.reminderEnabled && !data.timeOfDay) return "Kies een tijdstip voor je herinnering."
        return null
      default:
        return null
    }
  }

  function goNext() {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setStep((s) => Math.min(s + 1, totalSteps - 1))
  }

  function goBack() {
    setError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  function toInput(): MedicationInput {
    const unitMultiplier = data.cyclUnit === "weken" ? 7 : 1
    return {
      category: data.category ?? "andere_medicatie",
      name: data.name.trim(),
      hormoneType: data.hormoneType.trim() || undefined,
      form: data.form.trim() || undefined,
      dosage: data.dosage.trim() || undefined,
      scheduleType: data.scheduleType ?? "eigen_schema",
      scheduleDays: data.scheduleType === "wekelijkse_dagen" ? data.scheduleDays : undefined,
      scheduleDaysOn:
        data.scheduleType === "cyclisch" && data.scheduleDaysOnValue
          ? Number(data.scheduleDaysOnValue) * unitMultiplier
          : undefined,
      scheduleDaysOff:
        data.scheduleType === "cyclisch" && data.scheduleDaysOffValue
          ? Number(data.scheduleDaysOffValue) * unitMultiplier
          : undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      timeOfDay: data.timeOfDay || undefined,
      reminderEnabled: data.reminderEnabled,
      remindOnStart: data.remindOnStart,
      remindDaily: data.remindDaily,
      remindOnStop: data.remindOnStop,
      notes: data.notes.trim() || undefined,
    }
  }

  function handleSave() {
    setError(null)
    const input = toInput()
    startTransition(async () => {
      const result =
        mode === "edit" && medicationId
          ? await updateMedication(medicationId, input)
          : await createMedication(input)
      if (result.error) {
        setError(result.error)
        return
      }
      router.push("/medicatie")
      router.refresh()
    })
  }

  return (
    <div className="w-full max-w-md mx-auto px-5 py-6">
      {totalSteps > 1 && (
        <div className="w-full h-1.5 rounded-full bg-cream-soft mb-7 overflow-hidden">
          <div
            className="h-full bg-sage-dark rounded-full transition-all duration-300"
            style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
          />
        </div>
      )}

      {stepId === "category" && (
        <CategoryStep
          value={data.category}
          onChange={(category) => setData((d) => ({ ...d, category }))}
        />
      )}
      {stepId === "name" && <NameStep data={data} setData={setData} />}
      {stepId === "form" && <FormStep data={data} setData={setData} />}
      {stepId === "schedule" && <ScheduleStep data={data} setData={setData} />}
      {stepId === "reminder" && <ReminderStep data={data} setData={setData} />}
      {stepId === "notes" && (
        <div>
          <h2 className="font-display text-2xl text-ink mb-2">Nog iets voor jezelf?</h2>
          <p className="text-ink-soft text-sm mb-6">
            Optioneel. Bijvoorbeeld een opmerking van je arts of iets wat je wilt onthouden.
          </p>
          <Textarea
            rows={3}
            placeholder="Optionele opmerking"
            value={data.notes}
            onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
          />
        </div>
      )}
      {stepId === "review" && <ReviewStep data={data} />}

      <FieldError>{error}</FieldError>

      <div className="flex items-center gap-3 mt-8">
        {step > 0 && (
          <Button variant="secondary" onClick={goBack} disabled={isPending}>
            Terug
          </Button>
        )}
        {step < totalSteps - 1 ? (
          <Button onClick={goNext} className="flex-1">
            Volgende
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={isPending} className="flex-1">
            {isPending ? "Bezig..." : "Opslaan"}
          </Button>
        )}
      </div>
    </div>
  )
}

function CategoryStep({
  value,
  onChange,
}: {
  value: Category | null
  onChange: (v: Category) => void
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Wat wil je toevoegen?</h2>
      <p className="text-ink-soft text-sm mb-6">
        Kies wat het beste past. Je kunt hierna altijd meer items toevoegen.
      </p>
      <div className="flex flex-col gap-2">
        {MEDICATION_CATEGORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left touch-manipulation transition-[background-color,border-color,transform] duration-150 motion-safe:active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
              value === opt.value ? "bg-sage-soft border-sage" : "bg-white border-line hover:border-sage/60",
            )}
          >
            <span className="text-xl" aria-hidden>
              {opt.emoji}
            </span>
            <span className="font-medium text-ink">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function NameStep({
  data,
  setData,
}: {
  data: WizardData
  setData: React.Dispatch<React.SetStateAction<WizardData>>
}) {
  const suggestions: readonly string[] =
    data.category === "ht" ? HT_NAME_SUGGESTIONS : data.category === "anticonceptie" ? CONTRACEPTION_METHOD_OPTIONS : []

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Wat gebruik je?</h2>
      <p className="text-ink-soft text-sm mb-6">
        Voer hier alleen in wat je van je arts, apotheker of bijsluiter hebt gekregen. De app
        geeft geen persoonlijk medisch advies en bepaalt niet welke dosering of behandeling voor
        jou geschikt is.
      </p>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((s) => (
            <Chip key={s} selected={data.name === s} onClick={() => setData((d) => ({ ...d, name: s }))}>
              {s}
            </Chip>
          ))}
        </div>
      )}

      <Label htmlFor="med-name">Naam</Label>
      <Input
        id="med-name"
        value={data.name}
        onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
        placeholder="Bijvoorbeeld Oestrogeenspray, of de merknaam van je pil"
        autoFocus
      />

      {data.category === "andere_hormonaal" && (
        <div className="mt-4">
          <Label htmlFor="med-hormone-type">Hormoon of werkzame stof (optioneel)</Label>
          <Input
            id="med-hormone-type"
            value={data.hormoneType}
            onChange={(e) => setData((d) => ({ ...d, hormoneType: e.target.value }))}
            placeholder="Bijvoorbeeld schildklierhormoon"
          />
        </div>
      )}
    </div>
  )
}

function FormStep({
  data,
  setData,
}: {
  data: WizardData
  setData: React.Dispatch<React.SetStateAction<WizardData>>
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Hoe gebruik je het?</h2>
      <p className="text-ink-soft text-sm mb-6">Optioneel, maar handig voor je eigen overzicht.</p>

      <p className="text-sm font-medium text-ink mb-2">Vorm</p>
      <div className="flex flex-wrap gap-2 mb-5">
        {MEDICATION_FORM_OPTIONS.map((opt) => (
          <Chip key={opt} selected={data.form === opt} onClick={() => setData((d) => ({ ...d, form: opt }))}>
            {opt}
          </Chip>
        ))}
      </div>

      <Label htmlFor="med-dosage">Dosering (optioneel)</Label>
      <Input
        id="med-dosage"
        value={data.dosage}
        onChange={(e) => setData((d) => ({ ...d, dosage: e.target.value }))}
        placeholder="Bijvoorbeeld 2 sprays, of 1 tablet"
      />
    </div>
  )
}

function ScheduleStep({
  data,
  setData,
}: {
  data: WizardData
  setData: React.Dispatch<React.SetStateAction<WizardData>>
}) {
  function toggleDay(day: number) {
    setData((d) => ({
      ...d,
      scheduleDays: d.scheduleDays.includes(day)
        ? d.scheduleDays.filter((v) => v !== day)
        : [...d.scheduleDays, day].sort((a, b) => a - b),
    }))
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Wat is jouw voorgeschreven schema?</h2>
      <p className="text-ink-soft text-sm mb-6">
        Precies zoals jij het gebruikt — de app bepaalt hier niets voor je, het onthoudt alleen
        wat jij invult.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {MEDICATION_SCHEDULE_TYPE_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            selected={data.scheduleType === opt.value}
            onClick={() => setData((d) => ({ ...d, scheduleType: opt.value }))}
          >
            {opt.label}
          </Chip>
        ))}
      </div>

      {data.scheduleType === "wekelijkse_dagen" && (
        <div className="mb-5">
          <p className="text-sm font-medium text-ink mb-2">Op welke dagen?</p>
          <div className="flex flex-wrap gap-2">
            {REMINDER_DAY_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={data.scheduleDays.includes(opt.value)} onClick={() => toggleDay(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {data.scheduleType === "cyclisch" && (
        <div className="mb-5">
          <div className="mb-3">
            <SegmentedControl
              aria-label="Eenheid"
              value={data.cyclUnit}
              onChange={(cyclUnit) => setData((d) => ({ ...d, cyclUnit }))}
              options={[
                { value: "dagen", label: "Dagen" },
                { value: "weken", label: "Weken" },
              ]}
            />
          </div>
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <Label htmlFor="days-on">Hoeveel {data.cyclUnit} wel</Label>
              <Input
                id="days-on"
                type="number"
                inputMode="numeric"
                min={1}
                value={data.scheduleDaysOnValue}
                onChange={(e) => setData((d) => ({ ...d, scheduleDaysOnValue: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="days-off">Hoeveel {data.cyclUnit} niet</Label>
              <Input
                id="days-off"
                type="number"
                inputMode="numeric"
                min={0}
                value={data.scheduleDaysOffValue}
                onChange={(e) => setData((d) => ({ ...d, scheduleDaysOffValue: e.target.value }))}
              />
            </div>
          </div>
          <Label htmlFor="cycl-start">Wanneer begint jouw eerste &lsquo;wel&rsquo;-periode?</Label>
          <Input
            id="cycl-start"
            type="date"
            value={data.startDate}
            onChange={(e) => setData((d) => ({ ...d, startDate: e.target.value }))}
          />
        </div>
      )}

      {data.scheduleType === "om_de_dag" && (
        <div className="mb-5">
          <Label htmlFor="omdedag-start">Vanaf welke datum geldt dit?</Label>
          <Input
            id="omdedag-start"
            type="date"
            value={data.startDate}
            onChange={(e) => setData((d) => ({ ...d, startDate: e.target.value }))}
          />
        </div>
      )}

      {data.scheduleType === "eigen_schema" && (
        <p className="text-sm text-ink-soft bg-cream-soft rounded-2xl p-3 mb-5">
          Omschrijf je eigen schema bij &ldquo;opmerkingen&rdquo; in de volgende stap — we tonen
          dit dan als vaste informatie, zonder dat de app zelf een wel/niet-dag berekent.
        </p>
      )}

      {data.scheduleType && data.scheduleType !== "cyclisch" && data.scheduleType !== "om_de_dag" && (
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="start-date">Vanaf (optioneel)</Label>
            <Input
              id="start-date"
              type="date"
              value={data.startDate}
              onChange={(e) => setData((d) => ({ ...d, startDate: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="end-date">Tot en met (optioneel)</Label>
            <Input
              id="end-date"
              type="date"
              value={data.endDate}
              onChange={(e) => setData((d) => ({ ...d, endDate: e.target.value }))}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ReminderStep({
  data,
  setData,
}: {
  data: WizardData
  setData: React.Dispatch<React.SetStateAction<WizardData>>
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Wil je hier een herinnering voor?</h2>
      <p className="text-ink-soft text-sm mb-6">
        We laten dan een rustige melding zien, bijvoorbeeld &ldquo;Herinnering: je hebt vandaag{" "}
        {data.name.trim() || "dit"} ingepland.&rdquo;
      </p>
      <div className="flex gap-2 mb-5">
        <Chip selected={data.reminderEnabled} onClick={() => setData((d) => ({ ...d, reminderEnabled: true }))}>
          Ja
        </Chip>
        <Chip selected={!data.reminderEnabled} onClick={() => setData((d) => ({ ...d, reminderEnabled: false }))}>
          Nee
        </Chip>
      </div>
      {data.reminderEnabled && (
        <div>
          <Label htmlFor="med-time">Op welk tijdstip?</Label>
          <Input
            id="med-time"
            type="time"
            value={data.timeOfDay}
            onChange={(e) => setData((d) => ({ ...d, timeOfDay: e.target.value }))}
            className="max-w-[160px]"
          />
          {data.scheduleType === "cyclisch" && (
            <div className="mt-4 rounded-2xl border border-line p-4">
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                Omdat dit een wel/niet-schema is, herhaalt dit zich vanzelf:
                elke keer opnieuw start, gaat door, en stopt weer — zonder dat je dit ooit
                opnieuw hoeft in te stellen. Je kunt hieronder apart aan- of uitzetten welke
                momenten je wilt ontvangen.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">Startmelding</p>
                    <p className="text-xs text-ink-soft mt-0.5">Op de eerste dag dat je schema weer begint.</p>
                  </div>
                  <Switch
                    checked={data.remindOnStart}
                    onChange={(remindOnStart) => setData((d) => ({ ...d, remindOnStart }))}
                    aria-label="Startmelding aan- of uitzetten"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">Dagelijkse herinnering</p>
                    <p className="text-xs text-ink-soft mt-0.5">Alleen tijdens de periode dat je het gebruikt.</p>
                  </div>
                  <Switch
                    checked={data.remindDaily}
                    onChange={(remindDaily) => setData((d) => ({ ...d, remindDaily }))}
                    aria-label="Dagelijkse herinnering aan- of uitzetten"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">Stopmelding</p>
                    <p className="text-xs text-ink-soft mt-0.5">Op de laatste dag vóór je pauze begint.</p>
                  </div>
                  <Switch
                    checked={data.remindOnStop}
                    onChange={(remindOnStop) => setData((d) => ({ ...d, remindOnStop }))}
                    aria-label="Stopmelding aan- of uitzetten"
                  />
                </div>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed mt-4 pt-4 border-t border-line">
                Cyclus volgt uitsluitend het schema dat jij zelf hebt ingesteld. De app bepaalt
                niet wanneer je moet starten of stoppen, en geeft geen persoonlijk medisch
                advies.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReviewStep({ data }: { data: WizardData }) {
  const category = MEDICATION_CATEGORY_OPTIONS.find((c) => c.value === data.category)
  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-2">Klopt dit?</h2>
      <p className="text-ink-soft text-sm mb-6">
        Je kunt dit altijd later aanpassen of verwijderen bij &ldquo;Mijn medicatie&rdquo;.
      </p>
      <div className="rounded-2xl border border-line p-4 flex flex-col gap-2">
        <p className="text-sm font-medium text-ink">
          {category?.emoji} {data.name || "—"}
        </p>
        {(data.form || data.dosage) && (
          <p className="text-sm text-ink-soft">{[data.form, data.dosage].filter(Boolean).join(" · ")}</p>
        )}
        {data.scheduleType && (
          <p className="text-sm text-ink-soft">
            {describeSchedule({
              scheduleType: data.scheduleType,
              scheduleDays: data.scheduleType === "wekelijkse_dagen" ? data.scheduleDays : null,
              scheduleDaysOn:
                data.scheduleType === "cyclisch" && data.scheduleDaysOnValue
                  ? Number(data.scheduleDaysOnValue) * (data.cyclUnit === "weken" ? 7 : 1)
                  : null,
              scheduleDaysOff:
                data.scheduleType === "cyclisch" && data.scheduleDaysOffValue
                  ? Number(data.scheduleDaysOffValue) * (data.cyclUnit === "weken" ? 7 : 1)
                  : null,
              startDate: data.startDate || null,
              endDate: data.endDate || null,
            })}
          </p>
        )}
        <p className="text-sm text-ink-soft">
          {data.reminderEnabled ? `Herinnering om ${data.timeOfDay}` : "Geen herinnering"}
        </p>
        {data.reminderEnabled && data.scheduleType === "cyclisch" && (
          <p className="text-sm text-ink-soft">
            {[
              data.remindOnStart && "startmelding",
              data.remindDaily && "dagelijkse herinnering",
              data.remindOnStop && "stopmelding",
            ]
              .filter(Boolean)
              .join(", ") || "geen van de drie momenten aan"}
          </p>
        )}
        {data.notes && <p className="text-sm text-ink-soft whitespace-pre-wrap">{data.notes}</p>}
      </div>
    </div>
  )
}
