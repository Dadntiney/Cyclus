"use client"

import { useActionState } from "react"
import { register, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { authButtonClassName, authControlClassName } from "@/app/(auth)/layout"

const initialState: ActionState = {}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={authControlClassName}
        />
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
          className={authControlClassName}
        />
        <p className="mt-1.5 text-xs text-ink-soft">Minimaal 8 tekens.</p>
      </div>
      <FieldError>{state.error}</FieldError>
      <SubmitButton className={authButtonClassName} pendingText="Bezig met registreren...">
        Account aanmaken
      </SubmitButton>
    </form>
  )
}
