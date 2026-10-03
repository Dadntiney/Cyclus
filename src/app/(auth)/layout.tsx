import { Lockup } from "@/components/brand/lockup"
import { Page } from "@/components/layout/page"

/**
 * Inloggen, registreren en wachtwoord: one calm column under the lockup.
 * On a phone it starts at the top (AUTH-4), so with the keyboard open the
 * submit button and any error stay in view; from sm up it sits centred.
 * The outer element is the page's <main> landmark (AUTH-5).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col safe-top safe-x safe-bottom sm:justify-center">
      <Page className="max-w-md pt-6 pb-10 sm:py-14 lg:py-14">
        <Lockup className="mb-8" />
        {children}
      </Page>
    </main>
  )
}
