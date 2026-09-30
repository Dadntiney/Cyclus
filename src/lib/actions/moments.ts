"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { SavedMomentKind } from "@/lib/data/moments"

const KINDS = new Set<SavedMomentKind>([
  "affirmation",
  "quote",
  "tip",
  "fun_fact",
  "day_close",
  "roadmap",
])

export async function toggleSavedMoment(input: {
  kind: SavedMomentKind
  text: string
  source?: string | null
  sourceKey?: string | null
}) {
  const text = input.text.trim()
  if (!text) return { error: "Geen tekst om te bewaren." }
  if (!KINDS.has(input.kind)) return { error: "Onbekend type." }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data: existing } = await supabase
    .from("saved_moments")
    .select("id")
    .eq("user_id", user.id)
    .eq("text", text)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from("saved_moments").delete().eq("id", existing.id)
    if (error) return { error: "Verwijderen is niet gelukt." }
    revalidatePath("/favorieten")
    revalidatePath("/vandaag")
    revalidatePath("/mentale-rust")
    revalidatePath("/cyclus/vandaag")
    revalidatePath("/cyclus/overgang")
    return { success: true, favorited: false }
  }

  const { error } = await supabase.from("saved_moments").insert({
    user_id: user.id,
    kind: input.kind,
    text,
    source: input.source ?? null,
    source_key: input.sourceKey ?? null,
  })
  if (error) return { error: "Opslaan is niet gelukt." }

  revalidatePath("/favorieten")
  revalidatePath("/vandaag")
  revalidatePath("/mentale-rust")
  revalidatePath("/cyclus/vandaag")
  revalidatePath("/cyclus/overgang")
  return { success: true, favorited: true }
}
