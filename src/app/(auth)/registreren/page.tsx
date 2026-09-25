import Link from "next/link"
import { RegisterForm } from "./register-form"

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-xl text-ink mb-1">Maak je account aan</h1>
      <p className="text-sm text-ink-soft mb-6">
        Jouw lichaam. Jouw ritme. Jouw dag.
      </p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-ink-soft">
        Al een account?{" "}
        <Link href="/login" className="text-sage-dark font-medium hover:underline">
          Inloggen
        </Link>
      </p>
    </div>
  )
}
