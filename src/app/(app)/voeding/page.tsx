import Link from "next/link"
import { Heart, Salad } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getRecipeLibrary } from "@/lib/data/nutrition"
import { RecipeLibrary } from "@/components/nutrition/recipe-library"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"

export default async function VoedingPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const [recipes, profile] = await Promise.all([getRecipeLibrary(), getProfile(user.id)])

  if (profile && !profile.nutrition_enabled) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <BackButton href="/ontdek" label="Ontdek" />
        <h1 className="font-display text-3xl lg:text-4xl text-ink mb-1">Voeding</h1>
        <p className="text-sm text-ink-soft mb-6">Recepten die passen bij jouw voorkeuren.</p>
        <Card>
          <EmptyState
            icon={<Salad className="h-8 w-8" strokeWidth={1.5} />}
            title="Voeding staat nu uit"
            description="Je ziet hierdoor nergens voedingsadvies. Wil je dit toch weer gebruiken?"
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

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <BackButton href="/ontdek" label="Ontdek" />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl lg:text-4xl text-ink">Voeding</h1>
            <p className="text-sm text-ink-soft mt-1">
              Recepten die passen bij jouw voorkeuren. Het advies voor vandaag staat op Vandaag.
            </p>
          </div>
          <Link
            href="/voeding/favorieten"
            className="inline-flex items-center gap-1.5 min-h-11 text-sm font-medium text-sage-dark touch-manipulation"
          >
            <Heart className="h-4 w-4" />
            Favorieten
          </Link>
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl text-ink mb-3">Alle recepten</h2>
        <RecipeLibrary recipes={recipes} />
      </div>
    </div>
  )
}
