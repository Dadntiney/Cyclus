import Link from "next/link"
import { Card } from "@/components/ui/card"
import type { Tables } from "@/types/database"

export function RecipeCard({ recipe }: { recipe: Tables<"recipes"> }) {
  return (
    <Link href={`/voeding/${recipe.id}`}>
      <Card className="hover:border-sage/50 transition-colors">
        <p className="font-display text-lg text-ink">{recipe.title}</p>
        {recipe.description && (
          <p className="text-sm text-ink-soft mt-1 line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {recipe.category.slice(0, 3).map((c) => (
            <span
              key={c}
              className="text-[11px] font-medium text-sage-dark bg-sage-soft rounded-full px-2.5 py-1"
            >
              {c}
            </span>
          ))}
        </div>
      </Card>
    </Link>
  )
}
