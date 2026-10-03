import type { ReactNode } from "react"
import { Lockup } from "@/components/brand/lockup"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"
import { LegalContents, type LegalSectionRef } from "./legal-contents"

/**
 * Where "‹ Vorige" goes without in-app history (a link from outside, a new
 * tab). The page stays static (besluit 35), so it cannot know whether she
 * is logged in: "/" shows the welcome page, or sends a logged-in visitor on
 * to Vandaag (or onboarding). With history, the back control follows it
 * (router.back(), labelled with the real previous screen).
 */
const HOME = { href: "/", label: APP_DISPLAY_NAME }

/** Inline link inside legal body text: underlined, so not by colour alone. */
export const legalLinkClass = "font-medium text-sage-dark underline underline-offset-2"

/**
 * Privacyverklaring and Gebruiksvoorwaarden share one calm reading layout
 * (AUTH-1, AUTH-2, AUTH-6): a back control on top that follows the real
 * history, the small lockup, the h1, "Op deze pagina" with the literal h2
 * titles, then the text at 17px in one colour. Lives outside the app shell.
 */
export function LegalPage({
  title,
  subtitle,
  sections,
  children,
}: {
  title: string
  subtitle?: ReactNode
  sections: readonly LegalSectionRef[]
  children: ReactNode
}) {
  return (
    <main className="flex-1 safe-top safe-x safe-bottom">
      <Page>
        <PageHeader title={title} subtitle={subtitle} back={HOME} media={<Lockup size="sm" />} />
        <PageSections>
          <LegalContents sections={sections} />
          {children}
        </PageSections>
      </Page>
    </main>
  )
}

/**
 * One section of legal text. The h2 is the jump target of "Op deze pagina"
 * (focusable without a ring, `scroll-mt-4` for the anchor offset).
 */
export function LegalSection({ id, title, children }: LegalSectionRef & { children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 text-base text-ink">
      <h2 id={id} tabIndex={-1} data-focus-target="" className="type-section-title scroll-mt-4 text-ink">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** A bulleted list in legal text: same size and colour as the paragraphs. */
export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-ink-soft">{children}</ul>
}
