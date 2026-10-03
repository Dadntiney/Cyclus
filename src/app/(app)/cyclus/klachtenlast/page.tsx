import type { Metadata } from "next"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { PeriScoreForm } from "@/components/cycle/peri-score-form"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { FEATURES } from "@/lib/navigation/features"

export const metadata: Metadata = { title: FEATURES.klachtenlast.label }

export default async function KlachtenlastPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const { data: history } = await supabase
    .from("peri_assessments")
    .select("assessed_on, score")
    .eq("user_id", user.id)
    .order("assessed_on", { ascending: false })
    .limit(12)

  const rows = history ?? []
  const previousScore = rows[0]?.score ?? null

  return (
    <Page>
      <PageHeader
        title={FEATURES.klachtenlast.label}
        subtitle="Maandelijkse check om te zien of klachten toe- of afnemen."
      />
      <PeriScoreForm previousScore={previousScore} history={rows} />
    </Page>
  )
}
