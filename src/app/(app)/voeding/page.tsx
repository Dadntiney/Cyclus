import type { Metadata } from "next"
import Link from "next/link"
import { Salad } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getRecipeLibrary } from "@/lib/data/nutrition"
import { FEATURES } from "@/lib/navigation/features"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { RecipeLibrary } from "@/components/nutrition/recipe-library"
import { RECIPE_FAVORITES_HREF } from "@/components/nutrition/recipe-format"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants, textActionClass } from "@/components/ui/button"

export const metadata: Metadata = { title: FEATURES.voeding.label }

/**
 * Voeding: the recipe library (ontwerpvisie §7.4). One header with the one
 * action (Favorieten, a text action: the heart only means "bewaren",
 * besluit 12) and an honest subtitle: the library shows every recipe, her
 * plan for today lives on Vandaag (NUT-4, NUT-9).
 */
export default async function VoedingPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const [recipes, profile] = await Promise.all([getRecipeLibrary(), getProfile(user.id)])

  if (profile && !profile.nutrition_enabled) {
    return (
      <Page>
        <PageHeader title={FEATURES.voeding.label} subtitle="Recepten om uit te kiezen." />
        <EmptyState
          icon={Salad}
          title="Voeding staat nu uit"
          description="Je ziet hierdoor nergens voedingsadvies. Wil je het toch weer gebruiken?"
          action={
            <Link
              href={`${FEATURES.gebruik.href}#voeding`}
              className={buttonVariants({ variant: "tonal", size: "sm" })}
            >
              Aanzetten in {FEATURES.gebruik.label}
            </Link>
          }
        />
      </Page>
    )
  }

  return (
    <Page width="wide">
      <PageHeader
        title={FEATURES.voeding.label}
        subtitle={
          <>
            Recepten om uit te kiezen. Je plan voor vandaag staat op{" "}
            <Link
              href={FEATURES.vandaag.href}
              className="font-medium text-sage-dark underline underline-offset-4 touch-manipulation"
            >
              {FEATURES.vandaag.label}
            </Link>
            .
          </>
        }
        action={
          <Link href={RECIPE_FAVORITES_HREF} className={textActionClass()}>
            {FEATURES.favorieten.label}
          </Link>
        }
      />
      <RecipeLibrary recipes={recipes} />
    </Page>
  )
}
