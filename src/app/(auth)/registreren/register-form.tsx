"use client"

import { useActionState } from "react"
import { register, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"

const initialState: ActionState = {}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Wachtwoord</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="mt-1.5 text-xs text-ink-soft">Minimaal 8 tekens.</p>
      </div>
      <FieldError>{state.error}</FieldError>
      <SubmitButton className="w-full mt-2" pendingText="Bezig met registreren...">
        Account aanmaken
      </SubmitButton>
    </form>
  )
}
