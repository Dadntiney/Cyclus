import { getAuthedUser } from "@/lib/supabase/server"
import { listDiaryEntries } from "@/lib/data/diary"
import { DiaryClient } from "@/components/diary/diary-client"

export default async function DagboekPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const entries = await listDiaryEntries(user.id)

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Dagboek</h1>
        <p className="text-sm text-ink-soft mt-1">Een veilige plek om van je af te schrijven.</p>
      </div>
      <DiaryClient entries={entries} />
    </div>
  )
}
