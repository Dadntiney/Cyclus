import Link from "next/link"
import { Salad } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { loadWeekPlanContext } from "@/lib/data/week-plan-context"
import { buildGroceryList } from "@/lib/nutrition/grocery-list"
import type { WeekPlanRecipe } from "@/lib/recommendations/week-plan"
import { GroceryList, type GroceryMode } from "@/components/week/grocery-list"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"

export default async function BoodschappenPage({
  searchParams,
}: {
  searchParams: Promise<{ modus?: string; dag?: string }>
}) {
  const user = await getAuthedUser()
  if (!user) return null

  const ctx = await loadWeekPlanContext(user.id)
  if (!ctx) return null

  const sp = await searchParams
  const initialMode: GroceryMode = sp.modus === "dag" ? "day" : "week"
  const initialDate =
    sp.dag && ctx.days.some((d) => d.date === sp.dag) ? sp.dag : null

  if (!ctx.profile.nutrition_enabled) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <BackButton href="/deze-week" label="Deze week" />
        <Card>
          <EmptyState
            icon={<Salad className="h-8 w-8" strokeWidth={1.5} />}
            title="Voeding staat nu uit"
            description="Er is geen boodschappenlijst omdat voeding niet aanstaat in je profiel."
            action={
              <Link href="/profiel/gebruik#voeding" className={buttonVariants({ variant: "secondary" })}>
                Zet aan in mijn profiel
              </Link>
            }
          />
        </Card>
      </div>
    )
  }

  const weekIngredients = ctx.days.flatMap((d) => d.meals.map((m) => m.recipe?.ingredients).filter(Boolean))
  const baseWeekCategories = buildGroceryList(weekIngredients)

  const recipesById: Record<string, WeekPlanRecipe> = Object.fromEntries(
    ctx.recipes.map((r) => [r.id, r]),
  )

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <BackButton href="/deze-week" label="Deze week" />
      <div className="mb-5">
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Boodschappen</h1>
        <p className="text-sm text-ink-soft mt-1">
          Op basis van je weekplanning — per week of per dag.
        </p>
      </div>

      <GroceryList
        userId={user.id}
        weekStartISO={ctx.weekStartISO}
        baseWeekCategories={baseWeekCategories}
        days={ctx.days}
        recipesById={recipesById}
        initialMode={initialMode}
        initialDate={initialDate}
      />
    </div>
  )
}
