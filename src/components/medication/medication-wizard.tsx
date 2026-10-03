"use client"

import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Chip } from "@/components/ui/chip"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { OptionList } from "@/components/ui/option-list"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { StickyActionBar } from "@/components/ui/sticky-action-bar"
import { Input, Label, Textarea, FieldError } from "@/components/ui/input"
import { SwitchRow } from "@/components/profile/setting-rows"
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
import { runAction } from "@/lib/client/run-action"
import { leaveFlow } from "@/lib/client/navigation-depth"
import { useImmersive } from "@/lib/hooks/use-immersive"
import { FEATURES } from "@/lib/navigation/features"
import { iconProps } from "@/lib/ui/icon"

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
    // Absolute kuur-einde: opt-in via endDate. Cyclisch pauze: default on
    // when she picks wel/niet (see schedule chip / ScheduleStep).
    remindOnStop: false,
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

/** Each step is one question: it is the page's h1. */
const STEP_COPY: Record<StepId, { title: string; subtitle?: string }> = {
  category: {
    title: "Wat wil je toevoegen?",
    subtitle: "Kies wat het beste past. Je kunt hierna altijd meer toevoegen.",
  },
  name: {
    title: "Wat gebruik je?",
    subtitle: "Vul in wat je van je arts, apotheker of bijsluiter hebt gekregen.",
  },
  form: { title: "Hoe gebruik je het?", subtitle: "Optioneel, maar handig voor je eigen overzicht." },
  schedule: {
    title: "Wat is je voorgeschreven schema?",
    subtitle: "Precies zoals jij het gebruikt. De app bepaalt hier niets, ze onthoudt alleen wat jij invult.",
  },
  reminder: { title: "Wil je hier een herinnering voor?" },
  notes: {
    title: "Nog iets voor jezelf?",
    subtitle: "Optioneel. Bijvoorbeeld een opmerking van je arts of iets wat je wilt onthouden.",
  },
  review: {
    title: "Klopt dit?",
    subtitle: `Je kunt dit altijd later aanpassen of verwijderen bij ${FEATURES.medicatie.label}.`,
  },
}

/**
 * Adding or changing a medication, one question per screen (immersive: the
 * tab bar steps aside, Terug/Volgende sit in the thumb zone). The steps are
 * fixed when the wizard opens, so choosing a category no longer skips ahead
 * and Terug can always return to it (WB-10).
 */
export function MedicationWizard({
  mode,
  medicationId,
  initial,
  context,
}: {
  mode: "create" | "edit"
  medicationId?: string
  initial?: Partial<WizardData>
  /** Shown under the question on every step (e.g. the current wel/niet phase). */
  context?: ReactNode
}) {
  const router = useRouter()
  const [data, setData] = useState<WizardData>({ ...emptyData(initial?.category ?? null), ...initial })
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const titleId = useId()
  useImmersive()

  // In edit mode the category was already chosen when the item was created,
  // so we never show that step again.
  const lockedCategory = mode === "edit"
  const [stepSequence] = useState<StepId[]>(() => {
    const steps = buildSteps({ ...emptyData(initial?.category ?? null), ...initial })
    return lockedCategory ? steps.filter((s) => s !== "category") : steps
  })
  const stepId = stepSequence[step]
  const totalSteps = stepSequence.length
  const isLast = step === totalSteps - 1

  // A new step is a new question: start at the top and let a screen reader
  // hear it. Not on the first render — the page transition handles that.
  const shownStep = useRef(step)
  useEffect(() => {
    if (shownStep.current === step) return
    shownStep.current = step
    window.scrollTo({ top: 0 })
    document.getElementById(titleId)?.focus({ preventScroll: true })
  }, [step, titleId])

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
      // Cyclisch: stop at end of each wel-periode (optional toggle).
      // Other types: only with an absolute end date.
      remindOnStop:
        data.scheduleType === "cyclisch"
          ? data.remindOnStop
          : Boolean(data.endDate) && data.remindOnStop,
      notes: data.notes.trim() || undefined,
    }
  }

  function handleSave() {
    setError(null)
    const input = toInput()
    startTransition(async () => {
      const result =
        mode === "edit" && medicationId
          ? await runAction(() => updateMedication(medicationId, input))
          : await runAction(() => createMedication(input))
      if (result.error) {
        setError(result.error)
        return
      }
      leaveFlow(router, "/medicatie")
    })
  }

  const copy = STEP_COPY[stepId]
  const subtitle =
    stepId === "reminder"
      ? `We laten dan een rustige melding zien, bijvoorbeeld “Herinnering: je hebt vandaag ${
          data.name.trim() || "dit"
        } ingepland.”`
      : copy.subtitle

  return (
    <Page>
      <PageHeader
        title={copy.title}
        compactTitle={mode === "edit" ? "Medicatie bewerken" : "Medicatie toevoegen"}
        eyebrow={totalSteps > 1 ? `Stap ${step + 1} van ${totalSteps}` : undefined}
        subtitle={subtitle}
        titleId={titleId}
        media={
          totalSteps > 1 ? (
            <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-cream-soft">
              <div
                className="h-full rounded-full bg-sage-fill transition-[width] duration-slow ease-standard motion-reduce:transition-none"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              />
            </div>
          ) : undefined
        }
      />

      {context && <div className="mb-6">{context}</div>}

      <div className="pb-6">
        {stepId === "category" && (
          <OptionList
            aria-labelledby={titleId}
            value={data.category}
            onChange={(category) => setData((d) => ({ ...d, category }))}
            options={MEDICATION_CATEGORY_OPTIONS.map((opt) => ({
              value: opt.value,
              label: (
                <span className="inline-flex items-center gap-2.5">
                  <opt.icon {...iconProps("md", "text-sage-dark")} aria-hidden />
                  {opt.label}
                </span>
              ),
            }))}
          />
        )}
        {stepId === "name" && <NameStep data={data} setData={setData} />}
        {stepId === "form" && <FormStep data={data} setData={setData} />}
        {stepId === "schedule" && <ScheduleStep data={data} setData={setData} />}
        {stepId === "reminder" && <ReminderStep data={data} setData={setData} />}
        {stepId === "notes" && (
          <Textarea
            rows={3}
            aria-labelledby={titleId}
            placeholder="Optionele opmerking"
            value={data.notes}
            onChange={(e) => setData((d) => ({ ...d, notes: e.target.value }))}
          />
        )}
        {stepId === "review" && <ReviewStep data={data} />}
      </div>

      <StickyActionBar>
        <FieldError>{error}</FieldError>
        <div className="flex items-center gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={goBack} disabled={isPending}>
              Terug
            </Button>
          )}
          {isLast ? (
            <Button onClick={handleSave} disabled={isPending} className="flex-1">
              {isPending ? "Bezig…" : "Opslaan"}
            </Button>
          ) : (
            <Button onClick={goNext} className="flex-1">
              Volgende
            </Button>
          )}
        </div>
      </StickyActionBar>
    </Page>
  )
}

type StepProps = {
  data: WizardData
  setData: React.Dispatch<React.SetStateAction<WizardData>>
}

function NameStep({ data, setData }: StepProps) {
  const suggestions: readonly string[] =
    data.category === "ht" ? HT_NAME_SUGGESTIONS : data.category === "anticonceptie" ? CONTRACEPTION_METHOD_OPTIONS : []

  return (
    <div className="flex flex-col gap-4">
      {suggestions.length > 0 && (
        <div role="group" aria-label="Snel kiezen" className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Chip key={s} selected={data.name === s} onClick={() => setData((d) => ({ ...d, name: s }))}>
              {s}
            </Chip>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="med-name">Naam</Label>
        <Input
          id="med-name"
          value={data.name}
          onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
          placeholder="Bijvoorbeeld Oestrogeenspray, of de merknaam van je pil"
        />
      </div>

      {data.category === "andere_hormonaal" && (
        <div>
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

function FormStep({ data, setData }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p id="med-form-label" className="mb-2 text-sm font-medium text-ink">
          Vorm
        </p>
        <ChipRadioGroup
          aria-labelledby="med-form-label"
          value={data.form}
          onChange={(form) => setData((d) => ({ ...d, form }))}
          options={MEDICATION_FORM_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
        />
      </div>

      <div>
        <Label htmlFor="med-dosage">Dosering (optioneel)</Label>
        <Input
          id="med-dosage"
          value={data.dosage}
          onChange={(e) => setData((d) => ({ ...d, dosage: e.target.value }))}
          placeholder="Bijvoorbeeld 2 sprays, of 1 tablet"
        />
      </div>
    </div>
  )
}

function ScheduleStep({ data, setData }: StepProps) {
  function toggleDay(day: number) {
    setData((d) => ({
      ...d,
      scheduleDays: d.scheduleDays.includes(day)
        ? d.scheduleDays.filter((v) => v !== day)
        : [...d.scheduleDays, day].sort((a, b) => a - b),
    }))
  }

  return (
    <div className="flex flex-col gap-5">
      <OptionList
        aria-label="Schema"
        value={data.scheduleType}
        onChange={(scheduleType) =>
          setData((d) => ({
            ...d,
            scheduleType,
            // Wel/niet almost always wants a pause nudge at the end of
            // each wel-periode — she can turn it off. Other types keep
            // stop tied to an absolute end date only.
            remindOnStop: scheduleType === "cyclisch" ? true : d.endDate ? d.remindOnStop : false,
          }))
        }
        options={MEDICATION_SCHEDULE_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
      />

      {data.scheduleType === "wekelijkse_dagen" && (
        <div>
          <p id="med-days-label" className="mb-2 text-sm font-medium text-ink">
            Op welke dagen?
          </p>
          <div role="group" aria-labelledby="med-days-label" className="flex flex-wrap gap-2">
            {REMINDER_DAY_OPTIONS.map((opt) => (
              <Chip key={opt.value} selected={data.scheduleDays.includes(opt.value)} onClick={() => toggleDay(opt.value)}>
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {data.scheduleType === "cyclisch" && (
        <div className="flex flex-col gap-4">
          <SegmentedControl
            aria-label="Eenheid"
            value={data.cyclUnit}
            onChange={(cyclUnit) => setData((d) => ({ ...d, cyclUnit }))}
            options={[
              { value: "dagen", label: "Dagen" },
              { value: "weken", label: "Weken" },
            ]}
          />
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
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
            <div className="min-w-0 flex-1">
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
          <div>
            <Label htmlFor="cycl-start">Wanneer begint jouw eerste &lsquo;wel&rsquo;-periode?</Label>
            <Input
              id="cycl-start"
              type="date"
              value={data.startDate}
              onChange={(e) => setData((d) => ({ ...d, startDate: e.target.value }))}
            />
          </div>

          <Card padding="none" className="px-4">
            <SwitchRow
              title="Pauze-herinnering"
              description="Op de laatste innamedag van elke wel-periode een seintje dat je pauze begint. Daarna loopt je schema gewoon door; je medicatie stopt niet."
              checked={data.remindOnStop}
              onChange={(remindOnStop) =>
                setData((d) => ({
                  ...d,
                  remindOnStop,
                  // Pausemelding heeft een herinnering nodig; zet die mee aan.
                  reminderEnabled: remindOnStop ? true : d.reminderEnabled,
                }))
              }
            />
          </Card>

          <div>
            <Label htmlFor="cycl-end">Kuureinde (optioneel)</Label>
            <Input
              id="cycl-end"
              type="date"
              value={data.endDate}
              aria-describedby="cycl-end-hint"
              onChange={(e) => setData((d) => ({ ...d, endDate: e.target.value }))}
            />
            <p id="cycl-end-hint" className="mt-1.5 text-sm text-ink-soft">
              Alleen als deze medicatie ergens <span className="font-medium">helemaal</span> stopt. Niet
              invullen voor de terugkerende pauze: die zit al in je wel/niet-schema hierboven.
            </p>
          </div>
        </div>
      )}

      {data.scheduleType === "om_de_dag" && (
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <Label htmlFor="omdedag-start">Vanaf welke datum geldt dit?</Label>
            <Input
              id="omdedag-start"
              type="date"
              value={data.startDate}
              onChange={(e) => setData((d) => ({ ...d, startDate: e.target.value }))}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="omdedag-end">Tot en met (optioneel)</Label>
            <Input
              id="omdedag-end"
              type="date"
              value={data.endDate}
              onChange={(e) => {
                const endDate = e.target.value
                setData((d) => ({
                  ...d,
                  endDate,
                  remindOnStop: endDate ? true : false,
                }))
              }}
            />
          </div>
        </div>
      )}

      {data.scheduleType === "eigen_schema" && (
        <p className="type-body text-ink-soft">
          Omschrijf je eigen schema bij &ldquo;Nog iets voor jezelf?&rdquo; verderop. We tonen het dan als
          vaste informatie, zonder dat de app zelf een wel/niet-dag berekent.
        </p>
      )}

      {data.scheduleType && data.scheduleType !== "cyclisch" && data.scheduleType !== "om_de_dag" && (
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <Label htmlFor="start-date">Vanaf (optioneel)</Label>
            <Input
              id="start-date"
              type="date"
              value={data.startDate}
              onChange={(e) => setData((d) => ({ ...d, startDate: e.target.value }))}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="end-date">Tot en met (optioneel)</Label>
            <Input
              id="end-date"
              type="date"
              value={data.endDate}
              onChange={(e) => {
                const endDate = e.target.value
                setData((d) => ({
                  ...d,
                  endDate,
                  remindOnStop: endDate ? true : false,
                }))
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ReminderStep({ data, setData }: StepProps) {
  const hasEndDate = Boolean(data.endDate)
  const isCyclisch = data.scheduleType === "cyclisch"
  const canRemindStop = isCyclisch || hasEndDate
  const offValue = Number(data.scheduleDaysOffValue)
  const hasPausePhase = isCyclisch && Number.isFinite(offValue) && offValue > 0

  return (
    <div className="flex flex-col gap-4">
      <Card padding="none" className="px-4">
        <SwitchRow
          title="Herinnering"
          description="Dit stel je hier in, bij deze medicatie. Niet apart in je profiel."
          checked={data.reminderEnabled}
          onChange={(reminderEnabled) => setData((d) => ({ ...d, reminderEnabled }))}
        />
      </Card>

      {data.reminderEnabled && (
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="med-time">Op welk tijdstip?</Label>
            <Input
              id="med-time"
              type="time"
              value={data.timeOfDay}
              onChange={(e) => setData((d) => ({ ...d, timeOfDay: e.target.value }))}
              className="w-40"
            />
          </div>

          {(isCyclisch || hasEndDate) && (
            <>
              {isCyclisch && (
                <p className="type-body text-ink-soft">
                  Bij een wel/niet-schema herhalen start- en dagelijkse herinneringen zich vanzelf. De
                  pauze-herinnering komt op de laatste innamedag van elke wel-periode; daarna begint je
                  &lsquo;niet&rsquo;-fase en loopt het schema door.
                </p>
              )}
              <Card padding="none" className="divide-y divide-line px-4">
                {isCyclisch && (
                  <>
                    <SwitchRow
                      title="Startmelding"
                      description="Op de eerste dag dat je wel-periode weer begint."
                      checked={data.remindOnStart}
                      onChange={(remindOnStart) => setData((d) => ({ ...d, remindOnStart }))}
                    />
                    <SwitchRow
                      title="Dagelijkse herinnering"
                      description="Alleen tijdens de periode dat je het gebruikt."
                      checked={data.remindDaily}
                      onChange={(remindDaily) => setData((d) => ({ ...d, remindDaily }))}
                    />
                  </>
                )}
                <SwitchRow
                  title={
                    isCyclisch && hasPausePhase
                      ? "Pauze-herinnering"
                      : isCyclisch
                        ? "Einde wel-periode"
                        : "Stopmelding"
                  }
                  description={
                    isCyclisch && hasPausePhase
                      ? "Laatste innamedag van elke wel-periode; je schema blijft doorlopen."
                      : isCyclisch
                        ? "Alleen zinvol als je ook een ‘niet’-periode hebt ingesteld."
                        : hasEndDate
                          ? "Op het kuureinde dat je bij je schema hebt ingevuld."
                          : "Vul eerst een optioneel kuureinde in bij je schema."
                  }
                  checked={canRemindStop && data.remindOnStop}
                  onChange={(remindOnStop) => {
                    if (!canRemindStop) return
                    setData((d) => ({ ...d, remindOnStop }))
                  }}
                  disabled={!canRemindStop || (isCyclisch && !hasPausePhase)}
                />
              </Card>
              {hasEndDate && isCyclisch && (
                <p className="text-sm text-ink-soft">
                  Je hebt ook een kuureinde gezet: op die dag krijg je (met deze melding aan) een apart
                  seintje dat de hele kuur stopt.
                </p>
              )}
              {isCyclisch && (
                <p className="text-sm text-ink-soft">
                  GoFiev volgt uitsluitend het schema dat jij zelf hebt ingesteld. De app bepaalt niet
                  wanneer je moet starten of stoppen, en geeft geen persoonlijk medisch advies.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function ReviewStep({ data }: { data: WizardData }) {
  const category = MEDICATION_CATEGORY_OPTIONS.find((c) => c.value === data.category)
  const isCyclisch = data.scheduleType === "cyclisch"
  const showStop =
    data.remindOnStop && (isCyclisch || Boolean(data.endDate))
  const stopLabel = isCyclisch ? "pauze-herinnering" : "stopmelding"
  return (
    <Card className="flex flex-col gap-2">
      <p className="inline-flex items-center gap-2 text-base font-medium text-ink">
        {category && <category.icon {...iconProps("sm", "text-sage-dark")} aria-hidden />}
        {data.name || "—"}
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
      {data.reminderEnabled && (isCyclisch || data.endDate) && (
        <p className="text-sm text-ink-soft">
          {[
            isCyclisch && data.remindOnStart && "startmelding",
            isCyclisch && data.remindDaily && "dagelijkse herinnering",
            showStop && stopLabel,
          ]
            .filter(Boolean)
            .join(", ") || "geen extra momenten aan"}
        </p>
      )}
      {data.notes && <p className="whitespace-pre-wrap text-sm text-ink-soft">{data.notes}</p>}
    </Card>
  )
}
