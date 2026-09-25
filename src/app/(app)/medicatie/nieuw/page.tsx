import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { MedicationWizard } from "@/components/medication/medication-wizard"
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
        <Link
          href="/medicatie"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft touch-manipulation"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          Mijn medicatie
        </Link>
      </div>
      <MedicationWizard mode="create" initial={initialCategory ? { category: initialCategory } : undefined} />
    </div>
  )
}
