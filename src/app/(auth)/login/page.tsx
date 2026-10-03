import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { textActionClass } from "@/components/ui/button"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Inloggen" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <>
      <PageHeader title="Inloggen" subtitle="Welkom terug. Fijn dat je er weer bent." back={false} />
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
