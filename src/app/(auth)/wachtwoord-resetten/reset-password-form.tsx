"use client"

import { useActionState } from "react"
import { resetPassword, type ActionState } from "@/lib/actions/auth"
import { Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { PasswordInput } from "@/app/(auth)/password-input"

const initialState: ActionState = {}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPassword, initialState)
  // Hidden while a new attempt runs, so the same message is announced again.
  const error = pending ? undefined : state.error

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="password">Nieuw wachtwoord</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
          aria-describedby={error ? "nieuw-wachtwoord-fout" : undefined}
        />
      </div>
      <FieldError id="nieuw-wachtwoord-fout" className="mt-0">
        {error}
      </FieldError>
      <SubmitButton className="mt-2 w-full" pendingText="Bezig...">
        Wachtwoord opslaan
      </SubmitButton>
    </form>
  )
}
