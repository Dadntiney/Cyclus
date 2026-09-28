import { createClient } from "@/lib/supabase/server"

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

const GOAL_TIP_CATEGORIES: Record<string, string[]> = {
  "Meer energie": ["energie", "bloedsuiker", "eiwitten", "slaap"],
  "Beter slapen": ["slaap", "stress", "hormonen"],
  "Sterker worden": ["spiermassa", "eiwitten", "beweging"],
  "Fitter worden": ["beweging", "cardiovasculair", "energie"],
  "Meer rust": ["stress", "slaap", "herstel"],
  "Beter voor mezelf zorgen": ["stress", "herstel", "hydratatie"],
  "Mijn patronen begrijpen": ["hormonen", "stress", "slaap"],
  "Gewicht behouden": ["vezels", "eiwitten", "koolhydraten"],
  Afvallen: ["vezels", "bloedsuiker", "eiwitten"],
}

const SYMPTOM_TIP_CATEGORIES: Record<string, string[]> = {
  Opvliegers: ["hormonen", "slaap"],
  "Nachtelijk zweten": ["slaap", "hormonen"],
  Vermoeidheid: ["energie", "slaap", "ijzer"],
  "Brain fog": ["slaap", "stress", "hydratatie"],
  Stemmingswisselingen: ["stress", "hormonen"],
  Cravings: ["bloedsuiker", "vezels"],
}

/**
 * Personalized daily tip: prefers categories matching goals / recent symptoms,
 * falls back to the global day rotation. Stable per user+day.
 */
export async function getDailyTip(
  today: string,
  options?: {
    userId?: string
    goals?: string[] | null
    recentSymptoms?: string[] | null
  },
) {
  const supabase = await createClient()
  const { data: tips } = await supabase.from("daily_tips").select("*").order("created_at")
  if (!tips || !tips.length) return null

  const preferred = new Set<string>()
  for (const goal of options?.goals ?? []) {
    for (const cat of GOAL_TIP_CATEGORIES[goal] ?? []) preferred.add(cat)
  }
  for (const symptom of options?.recentSymptoms ?? []) {
    for (const cat of SYMPTOM_TIP_CATEGORIES[symptom] ?? []) preferred.add(cat)
  }

  const pool = preferred.size > 0 ? tips.filter((t) => preferred.has(t.category)) : tips
  const candidates = pool.length ? pool : tips
  const seed = `${options?.userId ?? "anon"}-${today}`
  return candidates[seededIndex(seed, candidates.length)]
}
