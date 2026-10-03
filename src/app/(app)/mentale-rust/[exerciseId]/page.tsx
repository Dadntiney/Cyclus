import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getMindfulExercise } from "@/lib/data/mindful-exercises"
import { FEATURES } from "@/lib/navigation/features"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { GuidedExercise } from "@/components/mental-wellbeing/guided-exercise"
import { mindfulExerciseMeta } from "@/components/mental-wellbeing/mindful-exercise-card"

export async function generateMetadata({ params }: { params: Promise<{ exerciseId: string }> }): Promise<Metadata> {
  const { exerciseId } = await params
  return { title: getMindfulExercise(exerciseId)?.title ?? FEATURES.mentaleRust.label }
}

export default async function MindfulExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>
}) {
  const { exerciseId } = await params
  const exercise = getMindfulExercise(exerciseId)
  if (!exercise) notFound()

  return (
    // GuidedExercise's StickyActionBar is a direct child of Page, so it
    // sticks for the whole screen.
    <Page>
      <PageHeader eyebrow={mindfulExerciseMeta(exercise)} title={exercise.title} subtitle={exercise.intro} />
      <GuidedExercise exercise={exercise} />
    </Page>
  )
}
