import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { AuthLockup } from "../auth-lockup"
import { textActionClass } from "@/components/ui/button"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Inloggen" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { next, error } = await searchParams

  return (
    <>
      <PageHeader
        title="Inloggen"
        subtitle="Welkom terug. Fijn dat je er weer bent."
        back={false}
        media={<AuthLockup />}
      />
      {/* auth/callback sends her here when an e-mail link could not be used
          (expired or opened twice). Not her mistake, so a calm note. */}
      {error === "auth-callback" && (
        <p role="status" className="mb-6 text-sm text-ink">
          Die link uit je e-mail werkt niet meer. Log hieronder in, of vraag via
          &ldquo;Wachtwoord vergeten?&rdquo; een nieuwe link aan.
        </p>
      )}
      <LoginForm next={next} />
      <div className="mt-6 flex flex-col items-start gap-1 text-sm text-ink-soft">
        <Link href="/wachtwoord-vergeten" className={textActionClass()}>
          Wachtwoord vergeten?
        </Link>
        <p className="flex flex-wrap items-center gap-x-1">
          Nog geen account?
          <Link href="/registreren" className={textActionClass()}>
            Account aanmaken
          </Link>
        </p>
      </div>
    </>
  )
}
