"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { todayISO } from "@/lib/dates/amsterdam"
import {
  PERI_SCORE_ITEMS,
  computePeriScore,
  type PeriAnswers,
} from "@/lib/cycle/peri-score"

export async function savePeriAssessment(input: {
  answers: PeriAnswers
  notes?: string
  assessedOn?: string
}) {
  const answers: PeriAnswers = {}
  for (const item of PERI_SCORE_ITEMS) {
    const value = input.answers[item.id]
    if (value === 0 || value === 1 || value === 2 || value === 3) {
      answers[item.id] = value
    } else {
      return { error: `Vul alle vragen in (ontbreekt: ${item.label}).` }
    }
  }

  const score = computePeriScore(answers)
  const assessedOn = input.assessedOn ?? todayISO()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase.from("peri_assessments").upsert(
    {
      user_id: user.id,
      assessed_on: assessedOn,
      answers,
      score,
      notes: input.notes?.trim() || null,
    },
    { onConflict: "user_id,assessed_on" },
  )

  if (error) {
    return { error: "Opslaan is niet gelukt. Probeer het opnieuw." }
  }

  revalidatePath("/cyclus")
  revalidatePath("/cyclus/overgang")
  revalidatePath("/cyclus/klachtenlast")
  revalidatePath("/cyclus/samenvatting")
  return { success: true, score }
}
