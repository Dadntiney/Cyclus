import Link from "next/link"
import { Salad } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { loadWeekPlanContext } from "@/lib/data/week-plan-context"
import { buildGroceryList } from "@/lib/nutrition/grocery-list"
import type { WeekPlanRecipe } from "@/lib/recommendations/week-plan"
import { GroceryList } from "@/components/week/grocery-list"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"

export default async function BoodschappenPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const ctx = await loadWeekPlanContext(user.id)
  if (!ctx) return null

  if (!ctx.profile.nutrition_enabled) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <BackButton href="/deze-week" label="Deze week" />
        <Card className="text-center py-8">
          <Salad className="h-8 w-8 mx-auto mb-3 text-sage-dark" strokeWidth={1.5} />
          <p className="font-display text-lg text-ink mb-2">Voeding staat nu uit</p>
          <p className="text-sm text-ink-soft mb-5 max-w-sm mx-auto">
            Er is geen boodschappenlijst omdat voeding niet aanstaat in je profiel.
          </p>
          <Link href="/profiel#voeding" className={buttonVariants()}>
            Zet aan in mijn profiel
          </Link>
        </Card>
      </div>
    )
  }

  const weekIngredients = ctx.days.flatMap((d) => d.meals.map((m) => m.recipe?.ingredients).filter(Boolean))
  const baseCategories = buildGroceryList(weekIngredients)

  const recipesById: Record<string, WeekPlanRecipe> = Object.fromEntries(
    ctx.recipes.map((r) => [r.id, r]),
  )

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <BackButton href="/deze-week" label="Deze week" />
      <div className="mb-5">
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Boodschappen</h1>
        <p className="text-sm text-ink-soft mt-1">
          Op basis van je weekplanning. Vink af wat je al in huis hebt of hebt gehaald.
        </p>
      </div>

      <GroceryList
        userId={user.id}
        weekStartISO={ctx.weekStartISO}
        baseCategories={baseCategories}
        days={ctx.days}
        recipesById={recipesById}
      />
    </div>
  )
}
