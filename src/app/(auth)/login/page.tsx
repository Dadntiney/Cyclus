import Link from "next/link"
import { LoginForm } from "./login-form"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <div>
      <h1 className="font-display text-lg text-ink mb-1">Welkom terug</h1>
      <p className="text-sm text-ink-soft mb-5">Log in om verder te gaan.</p>
      <LoginForm next={next} />
      <div className="mt-7 flex flex-col items-center gap-2.5 text-sm">
        <Link href="/wachtwoord-vergeten" className="text-sage-dark hover:underline">
          Wachtwoord vergeten?
        </Link>
        <p className="text-ink-soft text-center">
          Nog geen account?{" "}
          <Link href="/registreren" className="text-sage-dark font-medium hover:underline">
            Registreren
          </Link>
        </p>
      </div>
    </div>
  )
}
