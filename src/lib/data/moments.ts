import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type SavedMomentKind =
  | "affirmation"
  | "quote"
  | "tip"
  | "fun_fact"
  | "day_close"
  | "roadmap"

export type SavedMoment = {
  id: string
  kind: SavedMomentKind
  text: string
  source: string | null
  sourceKey: string | null
  createdAt: string
}

const KIND_LABEL: Record<SavedMomentKind, string> = {
  affirmation: "Affirmatie",
  quote: "Quote",
  tip: "Tip",
  fun_fact: "Weetje",
  day_close: "Avondmoment",
  roadmap: "Voor vandaag",
}

export function savedMomentKindLabel(kind: SavedMomentKind): string {
  return KIND_LABEL[kind] ?? "Bewaard"
}

export const getSavedMoments = cache(async (userId: string): Promise<SavedMoment[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("saved_moments")
    .select("id, kind, text, source, source_key, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => ({
    id: row.id,
    kind: row.kind as SavedMomentKind,
    text: row.text,
    source: row.source,
    sourceKey: row.source_key,
    createdAt: row.created_at,
  }))
})

/** Texts currently hearted — for initialFavorited on surfaces. */
export const getSavedMomentTexts = cache(async (userId: string): Promise<Set<string>> => {
  const moments = await getSavedMoments(userId)
  return new Set(moments.map((m) => m.text))
})
