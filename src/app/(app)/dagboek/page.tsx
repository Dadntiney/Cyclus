import type { Metadata } from "next"
import { getAuthedUser } from "@/lib/supabase/server"
import { listDiaryEntries } from "@/lib/data/diary"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { DiaryClient } from "@/components/diary/diary-client"

export const metadata: Metadata = { title: FEATURES.dagboek.label }

export default async function DagboekPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const entries = await listDiaryEntries(user.id)

  return (
    <Page>
      <PageHeader title={FEATURES.dagboek.label} subtitle="Schrijf van je af. Alleen jij ziet dit." />
      <PageSections>
        <DiaryClient entries={entries} />
      </PageSections>
    </Page>
  )
}
