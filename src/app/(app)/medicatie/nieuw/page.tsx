import type { Metadata } from "next"
import { MedicationWizard } from "@/components/medication/medication-wizard"
import type { MedicationInput } from "@/lib/validations/medication"

type Category = MedicationInput["category"]

const VALID_CATEGORIES: Category[] = ["ht", "anticonceptie", "andere_hormonaal", "andere_medicatie"]

export const metadata: Metadata = { title: "Medicatie toevoegen" }

/** The wizard renders its own Page + PageHeader: each step is one question. */
export default async function NewMedicationPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const initialCategory = VALID_CATEGORIES.includes(category as Category) ? (category as Category) : null

  return <MedicationWizard mode="create" initial={initialCategory ? { category: initialCategory } : undefined} />
}
