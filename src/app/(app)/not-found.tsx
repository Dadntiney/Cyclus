import type { Metadata } from "next"
import Link from "next/link"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { buttonVariants } from "@/components/ui/button"
import { FEATURES, NOT_FOUND_TITLE } from "@/lib/navigation/features"

export const metadata: Metadata = { title: NOT_FOUND_TITLE }

/**
 * A missing recipe, article, exercise, workout or medication inside the
 * app: the app shell stays (app bar with "‹ Vorige", tab bar), so this is
 * a normal <Page> — no second <main>, no full-screen height. The root
 * not-found.tsx stays for unknown URLs outside the app.
 */
export default function AppNotFound() {
  return (
    <Page>
      <PageHeader
        title={NOT_FOUND_TITLE}
        subtitle="We kunnen deze pagina niet vinden. Misschien is de link verlopen, of is dit onderdeel er niet meer."
        actions={
          <Link href={FEATURES.vandaag.href} className={buttonVariants({ variant: "tonal", size: "sm" })}>
            Naar {FEATURES.vandaag.label}
          </Link>
        }
      />
    </Page>
  )
}
