"use client"

import { useActionState } from "react"
import { resetPassword, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"

const initialState: ActionState = {}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPassword, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="password">Nieuw wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <FieldError>{state.error}</FieldError>
      <SubmitButton className="w-full mt-2" pendingText="Bezig...">
        Wachtwoord opslaan
      </SubmitButton>
    </form>
  )
}
