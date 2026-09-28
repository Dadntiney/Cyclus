import { MedicationWizard } from "@/components/medication/medication-wizard"
import { BackButton } from "@/components/ui/back-button"
import type { MedicationInput } from "@/lib/validations/medication"

type Category = MedicationInput["category"]

const VALID_CATEGORIES: Category[] = ["ht", "anticonceptie", "andere_hormonaal", "andere_medicatie"]

export default async function NewMedicationPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const initialCategory = VALID_CATEGORIES.includes(category as Category) ? (category as Category) : null

  return (
    <div className="w-full">
      <div className="max-w-md mx-auto px-5 pt-6">
        <BackButton href="/medicatie" label="Mijn medicatie" className="mb-0" />
      </div>
      <MedicationWizard mode="create" initial={initialCategory ? { category: initialCategory } : undefined} />
    </div>
  )
}
