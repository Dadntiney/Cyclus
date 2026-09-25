import Link from "next/link"
import { ForgotPasswordForm } from "./forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-xl text-ink mb-1">Wachtwoord vergeten</h1>
      <p className="text-sm text-ink-soft mb-6">
        Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-ink-soft">
        <Link href="/login" className="text-sage-dark font-medium hover:underline">
          Terug naar inloggen
        </Link>
      </p>
    </div>
  )
}
