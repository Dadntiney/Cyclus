import { ResetPasswordForm } from "./reset-password-form"

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-xl text-ink mb-1">Nieuw wachtwoord</h1>
      <p className="text-sm text-ink-soft mb-6">Kies een nieuw wachtwoord voor je account.</p>
      <ResetPasswordForm />
    </div>
  )
}
