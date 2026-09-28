import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { PeriScoreForm } from "@/components/cycle/peri-score-form"

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
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-5">
      <div>
        <Link
          href="/cyclus/overgang"
          className="inline-flex items-center gap-1 text-sm font-medium text-sage-dark touch-manipulation mb-3"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          Terug naar overgang
        </Link>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Klachtenlast</h1>
        <p className="text-sm text-ink-soft mt-1">
          Maandelijkse check om te zien of klachten toe- of afnemen.
        </p>
      </div>

      <PeriScoreForm previousScore={previousScore} history={rows} />
    </div>
  )
}
