"use client"

import { useActionState } from "react"
import { login, type ActionState } from "@/lib/actions/auth"
import { Input, Label, FieldError } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { authButtonClassName, authControlClassName } from "@/app/(auth)/layout"

const initialState: ActionState = {}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(login, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <input type="hidden" name="next" value={next ?? ""} />
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
          autoComplete="current-password"
          required
          className={authControlClassName}
        />
      </div>
      <FieldError>{state.error}</FieldError>
      <SubmitButton className={authButtonClassName} pendingText="Bezig met inloggen...">
        Inloggen
      </SubmitButton>
    </form>
  )
}
