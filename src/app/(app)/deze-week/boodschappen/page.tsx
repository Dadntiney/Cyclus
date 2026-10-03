import type { Metadata } from "next"
import Link from "next/link"
import { Salad } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { loadWeekPlanContext } from "@/lib/data/week-plan-context"
import { buildGroceryList } from "@/lib/nutrition/grocery-list"
import type { WeekPlanRecipe } from "@/lib/recommendations/week-plan"
import { GroceryList, type GroceryMode } from "@/components/week/grocery-list"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { FEATURES } from "@/lib/navigation/features"

export const metadata: Metadata = { title: FEATURES.boodschappen.label }

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
      <Page>
        <PageHeader title={FEATURES.boodschappen.label} />
        <EmptyState
          icon={Salad}
          title="Voeding staat nu uit"
          description="Er is geen boodschappenlijst omdat voeding niet aanstaat in je profiel."
          action={
            <Link href={`${FEATURES.gebruik.href}#voeding`} className={buttonVariants({ variant: "tonal" })}>
              Zet aan in {FEATURES.gebruik.label}
            </Link>
          }
        />
      </Page>
    )
  }

  const weekIngredients = ctx.days.flatMap((d) => d.meals.map((m) => m.recipe?.ingredients).filter(Boolean))
  const baseWeekCategories = buildGroceryList(weekIngredients)

  const recipesById: Record<string, WeekPlanRecipe> = Object.fromEntries(
    ctx.recipes.map((r) => [r.id, r]),
  )

  return (
    <Page>
      <PageHeader
        title={FEATURES.boodschappen.label}
        subtitle="Op basis van je weekplanning en jouw porties, per week of per dag."
      />

      <GroceryList
        userId={user.id}
        weekStartISO={ctx.weekStartISO}
        baseWeekCategories={baseWeekCategories}
        days={ctx.days}
        recipesById={recipesById}
        initialMode={initialMode}
        initialDate={initialDate}
      />
    </Page>
  )
}
