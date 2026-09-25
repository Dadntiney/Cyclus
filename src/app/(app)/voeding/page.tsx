import Link from "next/link"
import { Heart } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getRecipeLibrary } from "@/lib/data/nutrition"
import { pickTodaysRecipe } from "@/lib/recommendations/engine"
import { RecipeLibrary } from "@/components/nutrition/recipe-library"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function VoedingPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const today = new Date().toISOString().slice(0, 10)

  const [recipes, { data: profile }, { data: checkin }] = await Promise.all([
    getRecipeLibrary(),
    supabase.from("profiles").select("nutrition_preferences, nutrition_style").eq("id", user.id).single(),
    supabase.from("daily_checkins").select("need").eq("user_id", user.id).eq("date", today).maybeSingle(),
  ])

  const todaysPick = pickTodaysRecipe({
    profile: {
      nutrition_preferences: profile?.nutrition_preferences ?? [],
      nutrition_style: profile?.nutrition_style ?? "gebalanceerd",
    },
    latestCheckin: checkin ?? null,
    recipes,
    seed: `${user.id}-${today}`,
  })

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink">Voeding</h1>
          <p className="text-sm text-ink-soft mt-1">Recepten die passen bij jouw voorkeuren.</p>
        </div>
        <Link
          href="/voeding/favorieten"
          className="flex items-center gap-1.5 text-sm font-medium text-sage-dark"
        >
          <Heart className="h-4 w-4" />
          Favorieten
        </Link>
      </div>

      {todaysPick.recipe && (
        <Card className="bg-sage-soft border-transparent">
          <p className="text-sm font-medium text-sage-dark mb-1">Voor jou vandaag</p>
          <p className="font-display text-xl text-ink">{todaysPick.recipe.title}</p>
          <p className="text-sm text-ink-soft mt-2">{todaysPick.reason}</p>
          <Link href={`/voeding/${todaysPick.recipe.id}`} className={cn(buttonVariants(), "mt-3")}>
            Bekijk recept
          </Link>
        </Card>
      )}

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Alle recepten</h2>
        <RecipeLibrary recipes={recipes} />
      </div>
    </div>
  )
}
